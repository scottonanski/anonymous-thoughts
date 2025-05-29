// api/src/services/thoughtService.ts

import { v4 as uuidv4 } from 'uuid';
import { kv } from '@vercel/kv'; // Import the Vercel KV client
import type {
  Thought,
  Reply,
  CreateThoughtInput,
  CreateReplyInput,
  VoteType,
} from '../types.js';

// --- Constants ---
const MAX_TEXT_LENGTH = 300;
const DELETION_THRESHOLD_DOWNVOTES = 10;
const THOUGHTS_LIST_KEY = 'thoughts_list'; // A key to store an array of thought IDs
const THOUGHT_KEY_PREFIX = 'thought:'; // Prefix for storing individual thought objects

console.log('!!! thoughtsService.ts (Vercel KV version) module INITIALIZED.');

// --- Helper Functions for KV Store ---

// Reads all thought objects by fetching their IDs first, then each object
const getAllThoughtObjects = async (): Promise<Thought[]> => {
  const thoughtIds = await kv.smembers(THOUGHTS_LIST_KEY);
  if (!thoughtIds || thoughtIds.length === 0) {
    return [];
  }
  const thoughts: Thought[] = [];
  for (const id of thoughtIds) {
    const thought = await kv.get<Thought>(`${THOUGHT_KEY_PREFIX}${id}`);
    if (thought) {
      thoughts.push(thought);
    } else {
      // Thought ID was in list but object not found (data integrity issue?)
      // Optionally, clean up this ID from THOUGHTS_LIST_KEY
      console.warn(`Thought object for ID ${id} not found in KV, but was in list.`);
      await kv.srem(THOUGHTS_LIST_KEY, id);
    }
  }
  return thoughts;
};

// --- Sorting Helper Functions ---
const sortThoughts = (thoughtsToSort: Thought[]): Thought[] => {
  return [...thoughtsToSort].sort((a, b) => {
    const netVotesA = (a.upvotes || 0) - (a.downvotes || 0);
    const netVotesB = (b.upvotes || 0) - (b.downvotes || 0);
    if (netVotesB !== netVotesA) {
      return netVotesB - netVotesA;
    }
    return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
  });
};

const sortReplies = (repliesToSort: Reply[]): Reply[] => {
  return [...repliesToSort].sort((a, b) => {
    const netVotesA = (a.upvotes || 0) - (a.downvotes || 0);
    const netVotesB = (b.upvotes || 0) - (b.downvotes || 0);
    if (netVotesB !== netVotesA) {
      return netVotesB - netVotesA;
    }
    return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
  });
};

// --- Service Functions (Modified for Vercel KV) ---

export const getAllThoughts = async (): Promise<Thought[]> => {
  const thoughts = await getAllThoughtObjects();
  console.log(`--- getAllThoughts: Read ${thoughts.length} thoughts from KV.`);
  const thoughtsWithSortedReplies = thoughts.map(thought => ({
    ...thought,
    replies: sortReplies(thought.replies || []),
  }));
  return sortThoughts(thoughtsWithSortedReplies);
};

export const createThought = async (input: CreateThoughtInput): Promise<Thought> => {
  const { text } = input;
  if (!text || text.trim().length === 0) {
    throw new Error('Thought text cannot be empty.');
  }
  if (text.length > MAX_TEXT_LENGTH) {
    throw new Error(`Thought text cannot exceed ${MAX_TEXT_LENGTH} characters.`);
  }
  
  const newThought: Thought = {
    id: uuidv4(),
    text: text.trim(),
    upvotes: 0,
    downvotes: 0,
    createdAt: new Date().toISOString(),
    replies: [],
  };
  
  // Store the thought object
  await kv.set(`${THOUGHT_KEY_PREFIX}${newThought.id}`, newThought);
  // Add its ID to the list of all thought IDs
  await kv.sadd(THOUGHTS_LIST_KEY, newThought.id);

  console.log(`--- createThought: Created thought ${newThought.id} and saved to KV.`);
  return newThought;
};

export const getThoughtById = async (thoughtId: string): Promise<Thought | undefined> => {
  const thought = await kv.get<Thought>(`${THOUGHT_KEY_PREFIX}${thoughtId}`);
  if (!thought) {
    console.log(`--- getThoughtById: Thought ${thoughtId} NOT FOUND in KV.`);
    return undefined;
  }
  console.log(`--- getThoughtById: Thought ${thoughtId} FOUND in KV.`);
  return {
    ...thought,
    replies: sortReplies(thought.replies || []),
  };
};

export const addReply = async (
  thoughtId: string,
  input: CreateReplyInput
): Promise<Reply | undefined> => {
  const { text } = input;
  if (!text || text.trim().length === 0) {
    throw new Error('Reply text cannot be empty.');
  }
  if (text.length > MAX_TEXT_LENGTH) {
    throw new Error(`Reply text cannot exceed ${MAX_TEXT_LENGTH} characters.`);
  }

  const thought = await kv.get<Thought>(`${THOUGHT_KEY_PREFIX}${thoughtId}`);
  if (!thought) {
    console.log(`--- addReply: Parent thought ${thoughtId} NOT FOUND in KV.`);
    return undefined;
  }

  const newReply: Reply = {
    id: uuidv4(),
    text: text.trim(),
    upvotes: 0,
    downvotes: 0,
    createdAt: new Date().toISOString(),
  };

  thought.replies = [...(thought.replies || []), newReply]; // Add to replies array
  
  await kv.set(`${THOUGHT_KEY_PREFIX}${thoughtId}`, thought); // Save the updated thought object
  console.log(`--- addReply: Reply ${newReply.id} added to thought ${thoughtId}. Updated thought in KV.`);
  return newReply;
};

export const voteOnThought = async (
  thoughtId: string,
  voteType: VoteType
): Promise<Thought | undefined> => {
  const thought = await kv.get<Thought>(`${THOUGHT_KEY_PREFIX}${thoughtId}`);
  if (!thought) {
    console.log(`--- voteOnThought: Thought ${thoughtId} NOT FOUND in KV.`);
    return undefined;
  }

  if (voteType === 'up') {
    thought.upvotes = (thought.upvotes || 0) + 1;
  } else if (voteType === 'down') {
    thought.downvotes = (thought.downvotes || 0) + 1;
  }
  console.log(`--- voteOnThought: Thought ${thoughtId} votes updated: U${thought.upvotes}/D${thought.downvotes}`);

  if (thought.downvotes >= DELETION_THRESHOLD_DOWNVOTES) {
    await kv.del(`${THOUGHT_KEY_PREFIX}${thoughtId}`); // Delete the thought object
    await kv.srem(THOUGHTS_LIST_KEY, thoughtId);    // Remove its ID from the list
    console.log(`--- voteOnThought: Thought ${thoughtId} DELETED from KV due to downvotes.`);
    return undefined; 
  } else {
    await kv.set(`${THOUGHT_KEY_PREFIX}${thoughtId}`, thought); // Save updated thought
    console.log(`--- voteOnThought: Updated thought ${thoughtId} in KV.`);
    return thought;
  }
};

export const voteOnReply = async (
  thoughtId: string,
  replyId: string,
  voteType: VoteType
): Promise<Reply | undefined> => {
  const thought = await kv.get<Thought>(`${THOUGHT_KEY_PREFIX}${thoughtId}`);
  if (!thought || !thought.replies) {
    console.log(`--- voteOnReply: Parent thought ${thoughtId} or its replies NOT FOUND in KV.`);
    return undefined;
  }
  
  const replyIndex = thought.replies.findIndex((r: Reply) => r.id === replyId);
  if (replyIndex === -1) {
    console.log(`--- voteOnReply: Reply ${replyId} on thought ${thoughtId} NOT FOUND in KV thought object.`);
    return undefined;
  }

  const replyToUpdate = { ...thought.replies[replyIndex] }; // Create a copy

  if (voteType === 'up') {
    replyToUpdate.upvotes = (replyToUpdate.upvotes || 0) + 1;
  } else if (voteType === 'down') {
    replyToUpdate.downvotes = (replyToUpdate.downvotes || 0) + 1;
  }
  console.log(`--- voteOnReply: Reply ${replyId} votes updated: U${replyToUpdate.upvotes}/D${replyToUpdate.downvotes}`);
  
  thought.replies[replyIndex] = replyToUpdate; // Update the reply in the thought's replies array

  if (replyToUpdate.downvotes >= DELETION_THRESHOLD_DOWNVOTES) {
    thought.replies.splice(replyIndex, 1); // Remove reply from array
    await kv.set(`${THOUGHT_KEY_PREFIX}${thoughtId}`, thought); // Save updated thought
    console.log(`--- voteOnReply: Reply ${replyId} on thought ${thoughtId} DELETED. Updated thought in KV.`);
    return undefined;
  } else {
    await kv.set(`${THOUGHT_KEY_PREFIX}${thoughtId}`, thought); // Save updated thought
    console.log(`--- voteOnReply: Updated reply ${replyId} on thought ${thoughtId}. Updated thought in KV.`);
    return replyToUpdate;
  }
};

// Utility for testing (CAUTION: DELETES ALL THOUGHT DATA FROM KV)
export const _clearAllThoughts_TEST_ONLY = async (): Promise<void> => {
  console.log('--- _clearAllThoughts_TEST_ONLY called. Deleting all thoughts from KV.');
  const thoughtIds = await kv.smembers(THOUGHTS_LIST_KEY);
  if (thoughtIds && thoughtIds.length > 0) {
    const keysToDelete: string[] = thoughtIds.map(id => `${THOUGHT_KEY_PREFIX}${id}`);
    keysToDelete.push(THOUGHTS_LIST_KEY); // Also delete the list key itself
    await kv.del(...keysToDelete);
    console.log(`--- Deleted ${keysToDelete.length} keys from KV.`);
  } else {
    console.log('--- No thought IDs found in list, nothing to delete from object store. Ensuring list key is gone.');
    await kv.del(THOUGHTS_LIST_KEY);
  }
  // For good measure, you might also want to ensure the list key itself is deleted if it exists even if empty
  // await kv.del(THOUGHTS_LIST_KEY);
};
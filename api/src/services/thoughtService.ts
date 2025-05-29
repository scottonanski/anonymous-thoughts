// api/src/services/thoughtService.ts

import { v4 as uuidv4 } from 'uuid';
import type {
  Thought,
  Reply,
  CreateThoughtInput,
  CreateReplyInput,
  VoteType,
} from '../types.js'; // Ensure .js extension is here if you had it previously

// --- Constants ---
const MAX_TEXT_LENGTH = 300;
const DELETION_THRESHOLD_DOWNVOTES = 10;

// --- In-Memory Data Store ---
let thoughts: Thought[] = [];
console.log('!!! thoughtsService.ts module INITIALIZED. Thoughts array initial length:', thoughts.length); // Log module initialization

// --- Helper Functions ---
const sortThoughts = (thoughtsToSort: Thought[]): Thought[] => {
  return [...thoughtsToSort].sort((a, b) => {
    const netVotesA = a.upvotes - a.downvotes;
    const netVotesB = b.upvotes - b.downvotes;
    if (netVotesB !== netVotesA) {
      return netVotesB - netVotesA;
    }
    return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
  });
};

const sortReplies = (repliesToSort: Reply[]): Reply[] => {
  return [...repliesToSort].sort((a, b) => {
    const netVotesA = a.upvotes - a.downvotes;
    const netVotesB = b.upvotes - b.downvotes;
    if (netVotesB !== netVotesA) {
      return netVotesB - netVotesA;
    }
    return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
  });
};

// --- Service Functions ---

export const getAllThoughts = async (): Promise<Thought[]> => {
  console.log('--- getAllThoughts called. Current thoughts count:', thoughts.length, JSON.stringify(thoughts.map(t => t.id)));
  const thoughtsWithSortedReplies = thoughts.map(thought => ({
    ...thought,
    replies: sortReplies(thought.replies),
  }));
  return Promise.resolve(sortThoughts(thoughtsWithSortedReplies));
};

export const createThought = async (input: CreateThoughtInput): Promise<Thought> => {
  console.log('--- createThought called. Thoughts BEFORE push:', thoughts.length, JSON.stringify(thoughts.map(t => t.id)));
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
  thoughts.push(newThought);
  console.log('--- createThought finished. Thoughts AFTER push:', thoughts.length, JSON.stringify(thoughts.map(t => t.id)));
  return Promise.resolve(newThought);
};

export const getThoughtById = async (thoughtId: string): Promise<Thought | undefined> => {
  console.log(`--- getThoughtById called for ${thoughtId}. Current thoughts count:`, thoughts.length, JSON.stringify(thoughts.map(t => t.id)));
  const thought = thoughts.find((t) => t.id === thoughtId);
  if (!thought) {
    console.log(`--- getThoughtById: Thought ${thoughtId} NOT FOUND.`);
    return Promise.resolve(undefined);
  }
  console.log(`--- getThoughtById: Thought ${thoughtId} FOUND.`);
  return Promise.resolve({
    ...thought,
    replies: sortReplies(thought.replies),
  });
};

export const addReply = async (
  thoughtId: string,
  input: CreateReplyInput
): Promise<Reply | undefined> => {
  console.log(`--- addReply called for thought ${thoughtId}. Current thoughts count:`, thoughts.length);
  const { text } = input;
  if (!text || text.trim().length === 0) {
    throw new Error('Reply text cannot be empty.');
  }
  if (text.length > MAX_TEXT_LENGTH) {
    throw new Error(`Reply text cannot exceed ${MAX_TEXT_LENGTH} characters.`);
  }

  const thought = thoughts.find((t) => t.id === thoughtId);
  if (!thought) {
    console.log(`--- addReply: Parent thought ${thoughtId} NOT FOUND.`);
    return Promise.resolve(undefined); // Thought not found
  }

  const newReply: Reply = {
    id: uuidv4(),
    text: text.trim(),
    upvotes: 0,
    downvotes: 0,
    createdAt: new Date().toISOString(),
  };
  thought.replies.push(newReply);
  console.log(`--- addReply: Reply ${newReply.id} added to thought ${thoughtId}. Thought now has ${thought.replies.length} replies.`);
  return Promise.resolve(newReply);
};

export const voteOnThought = async (
  thoughtId: string,
  voteType: VoteType
): Promise<Thought | undefined> => {
  console.log(`--- voteOnThought called for ${thoughtId}, type: ${voteType}. Current thoughts count:`, thoughts.length);
  const thoughtIndex = thoughts.findIndex((t) => t.id === thoughtId);
  if (thoughtIndex === -1) {
    console.log(`--- voteOnThought: Thought ${thoughtId} NOT FOUND.`);
    return Promise.resolve(undefined); // Thought not found
  }

  const thoughtToUpdate = thoughts[thoughtIndex];
  if (voteType === 'up') {
    thoughtToUpdate.upvotes += 1;
  } else if (voteType === 'down') {
    thoughtToUpdate.downvotes += 1;
  }
  console.log(`--- voteOnThought: Thought ${thoughtId} votes updated: U${thoughtToUpdate.upvotes}/D${thoughtToUpdate.downvotes}`);

  if (thoughtToUpdate.downvotes >= DELETION_THRESHOLD_DOWNVOTES) {
    thoughts.splice(thoughtIndex, 1); // Remove thought
    console.log(`--- voteOnThought: Thought ${thoughtId} DELETED due to downvotes. Thoughts remaining:`, thoughts.length);
    return Promise.resolve(undefined); // Thought was deleted
  }
  return Promise.resolve(thoughtToUpdate);
};

export const voteOnReply = async (
  thoughtId: string,
  replyId: string,
  voteType: VoteType
): Promise<Reply | undefined> => {
  console.log(`--- voteOnReply called for thought ${thoughtId}, reply ${replyId}, type: ${voteType}.`);
  const thought = thoughts.find((t) => t.id === thoughtId);
  if (!thought) {
    console.log(`--- voteOnReply: Parent thought ${thoughtId} NOT FOUND.`);
    return Promise.resolve(undefined); // Thought not found
  }

  const replyIndex = thought.replies.findIndex((r: Reply) => r.id === replyId);
  if (replyIndex === -1) {
    console.log(`--- voteOnReply: Reply ${replyId} on thought ${thoughtId} NOT FOUND.`);
    return Promise.resolve(undefined); // Reply not found
  }

  const replyToUpdate = thought.replies[replyIndex];
  if (voteType === 'up') {
    replyToUpdate.upvotes += 1;
  } else if (voteType === 'down') {
    replyToUpdate.downvotes += 1;
  }
  console.log(`--- voteOnReply: Reply ${replyId} votes updated: U${replyToUpdate.upvotes}/D${replyToUpdate.downvotes}`);

  if (replyToUpdate.downvotes >= DELETION_THRESHOLD_DOWNVOTES) {
    thought.replies.splice(replyIndex, 1); // Remove reply
    console.log(`--- voteOnReply: Reply ${replyId} on thought ${thoughtId} DELETED due to downvotes.`);
    return Promise.resolve(undefined); // Reply was deleted
  }
  return Promise.resolve(replyToUpdate);
};

// --- Utility for testing (optional) ---
export const _clearAllThoughts_TEST_ONLY = (): void => {
  console.log('--- _clearAllThoughts_TEST_ONLY called. Clearing thoughts.');
  thoughts = [];
};
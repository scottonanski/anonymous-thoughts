// api/src/services/thoughtsService.ts

import { v4 as uuidv4 } from 'uuid';

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

// --- In-Memory Data Store ---
let thoughts: Thought[] = [];

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
  const thoughtsWithSortedReplies = thoughts.map(thought => ({
    ...thought,
    replies: sortReplies(thought.replies),
  }));
  return Promise.resolve(sortThoughts(thoughtsWithSortedReplies));
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
  thoughts.push(newThought);
  return Promise.resolve(newThought);
};

export const getThoughtById = async (thoughtId: string): Promise<Thought | undefined> => {
  const thought = thoughts.find((t) => t.id === thoughtId);
  if (!thought) {
    return Promise.resolve(undefined);
  }
  return Promise.resolve({
    ...thought,
    replies: sortReplies(thought.replies),
  });
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

  const thought = thoughts.find((t) => t.id === thoughtId);
  if (!thought) {
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
  // When a reply is added, the parent thought is mutated.
  // We could re-sort thoughts here if the number of replies affects thought sorting,
  // but our current thought sorting is based on votes and timestamp.
  return Promise.resolve(newReply);
};

export const voteOnThought = async (
  thoughtId: string,
  voteType: VoteType
): Promise<Thought | undefined> => {
  const thoughtIndex = thoughts.findIndex((t) => t.id === thoughtId);
  if (thoughtIndex === -1) {
    return Promise.resolve(undefined); // Thought not found
  }

  const thoughtToUpdate = thoughts[thoughtIndex];
  if (voteType === 'up') {
    thoughtToUpdate.upvotes += 1;
  } else if (voteType === 'down') {
    thoughtToUpdate.downvotes += 1;
  }

  if (thoughtToUpdate.downvotes >= DELETION_THRESHOLD_DOWNVOTES) {
    thoughts.splice(thoughtIndex, 1); // Remove thought
    return Promise.resolve(undefined); // Thought was deleted
  }
  // thoughts[thoughtIndex] = thoughtToUpdate; // Object is mutated directly
  return Promise.resolve(thoughtToUpdate);
};

export const voteOnReply = async (
  thoughtId: string,
  replyId: string,
  voteType: VoteType
): Promise<Reply | undefined> => {
  const thought = thoughts.find((t) => t.id === thoughtId);
  if (!thought) {
    return Promise.resolve(undefined); // Thought not found
  }

  const replyIndex = thought.replies.findIndex((r : Reply) => r.id === replyId);
  if (replyIndex === -1) {
    return Promise.resolve(undefined); // Reply not found
  }

  const replyToUpdate = thought.replies[replyIndex];
  if (voteType === 'up') {
    replyToUpdate.upvotes += 1;
  } else if (voteType === 'down') {
    replyToUpdate.downvotes += 1;
  }

  if (replyToUpdate.downvotes >= DELETION_THRESHOLD_DOWNVOTES) {
    thought.replies.splice(replyIndex, 1); // Remove reply
    return Promise.resolve(undefined); // Reply was deleted
  }
  return Promise.resolve(replyToUpdate);
};

// --- Utility for testing (optional) ---
export const _clearAllThoughts_TEST_ONLY = (): void => {
  thoughts = [];
};
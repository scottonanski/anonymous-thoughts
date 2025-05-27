// api/src/services/thoughtsService.ts

import { v4 as uuidv4 } from 'uuid';
import type { Thought, Reply, CreateThoughtInput, VoteType } from '../types'; // Ensure this path is correct

// --- Constants ---
const MAX_TEXT_LENGTH = 300; // Matches frontend MAX_CHARS
const DELETION_THRESHOLD_DOWNVOTES = 10;

// --- In-Memory Data Store ---
let thoughts: Thought[] = [];

// --- Helper Functions ---

/**
 * Sort thoughts by net votes descending, then by createdAt descending.
 */
const sortThoughts = (thoughtsToSort: Thought[]): Thought[] => {
  return [...thoughtsToSort].sort((a, b) => {
    const netVotesA = a.upvotes - a.downvotes;
    const netVotesB = b.upvotes - b.downvotes;
    if (netVotesB !== netVotesA) {
      return netVotesB - netVotesA; // Sort by net votes descending
    }
    // If net votes are equal, sort by creation time descending (newest first)
    return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
  });
};

/**
 * Sort replies by net votes descending, then by createdAt descending.
 */
const sortReplies = (repliesToSort: Reply[]): Reply[] => {
  return [...repliesToSort].sort((a, b) => {
    const netVotesA = a.upvotes - a.downvotes;
    const netVotesB = b.upvotes - b.downvotes;
    if (netVotesB !== netVotesA) {
      return netVotesB - netVotesA; // Sort by net votes descending
    }
    return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
  });
};

// --- Service Functions ---

/**
 * Retrieves all thoughts, sorted by net votes and then by creation date.
 */
export const getAllThoughts = async (): Promise<Thought[]> => {
  return Promise.resolve(sortThoughts(thoughts));
};

/**
 * Creates a new thought.
 * @param input - The data for the new thought, containing the text.
 * @returns The newly created thought.
 * @throws Error if the text is invalid (empty, too long).
 */
export const createThought = async (input: CreateThoughtInput): Promise<Thought> => {
  const { text } = input;

  // Validate text
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

/**
 * Finds a single thought by ID.
 * Returns undefined if not found.
 * Replies within the thought are sorted.
 */
export const getThoughtById = async (thoughtId: string): Promise<Thought | undefined> => {
  const thought = thoughts.find((t) => t.id === thoughtId);

  if (!thought) {
    return Promise.resolve(undefined);
  }

  const thoughtWithSortedReplies: Thought = {
    ...thought,
    replies: sortReplies(thought.replies),
  };

  return Promise.resolve(thoughtWithSortedReplies);
};

// --- (Placeholder for other functions: addReply, voteOnThought, voteOnReply) ---

// --- Utility for testing (optional) ---

/**
 * Clears all thoughts from the in-memory store.
 * (Primarily for testing purposes)
 */
export const _clearAllThoughts_TEST_ONLY = (): void => {
  thoughts = [];
};

// api/src/types.ts

export interface Reply {
  id: string;
  text: string;
  upvotes: number;
  downvotes: number;
  createdAt: string; // ISO date string for timestamp
}

export interface Thought {
  id: string;
  text: string;
  upvotes: number;
  downvotes: number;
  createdAt: string; // ISO date string for timestamp
  replies: Reply[];
}

// Input type for creating a new Thought
export interface CreateThoughtInput {
  text: string;
}

// Input type for creating a new Reply
export interface CreateReplyInput {
  text: string;
}

// Type for defining vote actions
export type VoteType = 'up' | 'down';

// Input type for voting (could be used in request bodies)
export interface VoteInput {
  voteType: VoteType;
}

// Standard structure for successful API responses
export interface SuccessResponse<T> {
  status: 'success';
  data: T;
  results?: number; // Optional, typically for lists
}

// Standard structure for failure/error API responses
export interface ErrorResponse {
  status: 'fail' | 'error';
  message: string;
  // Optionally, include more error details in development
  error?: {
    name?: string;
    stack?: string;
    [key: string]: unknown; // For other potential error properties
  };
}
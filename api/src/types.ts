// api/src/types.ts

export interface Reply {
    id: string;
    text: string;               // Changed from content to text
    upvotes: number;
    downvotes: number;
    createdAt: string;          // ISO date string timestamp
  }
  
  export interface Thought {
    id: string;
    text: string;               // Changed from content to text
    upvotes: number;
    downvotes: number;
    createdAt: string;          // ISO date string timestamp
    replies: Reply[];
  }
  
  // Input types for creating new entities
  export interface CreateThoughtInput {
    text: string;               // Changed from content to text
  }
  
  export interface CreateReplyInput {
    text: string;               // Changed from content to text
  }
  
  // Vote type stays the same
  export type VoteType = 'up' | 'down';
  
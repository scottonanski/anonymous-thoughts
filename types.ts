
export interface Reply {
  id: string;
  text: string;
  timestamp: number;
  upvotes: number;
  downvotes: number;
}

export interface Thought {
  id: string;
  text: string;
  timestamp: number;
  replies: Reply[];
  upvotes: number;
  downvotes: number;
}

export type VoteType = 'upvote' | 'downvote';
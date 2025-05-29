// src/components/ReplyItem.tsx

import React from 'react';
import type { Reply, VoteType } from '../types'; // Assuming types.ts is in ../
import { ArrowUp, ArrowDown } from 'lucide-react';

interface ReplyItemProps {
  reply: Reply;
  onVote: (replyId: string, voteType: VoteType) => void; // Or Promise<void>
  isSubmitting?: boolean; // <<< ADDED: To disable buttons during API calls
}

const ReplyItem: React.FC<ReplyItemProps> = ({ 
  reply, 
  onVote,
  isSubmitting, // <<< Destructure the new prop
}) => {
  // Ensure timestamp is a number before using toLocaleString, or handle if it might be undefined/null
  const formattedTimestamp = reply.timestamp ? new Date(reply.timestamp).toLocaleString() : 'Unknown date';

  const handleVote = (voteType: VoteType) => {
    if (isSubmitting) return; // Prevent action if already submitting
    onVote(reply.id, voteType);
  };

  return (
    <div className="bg-base-300 rounded-lg p-4 mb-2 transition-colors duration-200 hover:bg-base-200">
      <div className="flex-1">
        <div className="text-sm text-base-content whitespace-pre-wrap break-words">
          {reply.text}
        </div>
        <div className="mt-1 text-xs text-base-content/60">
          {formattedTimestamp}
        </div>
      </div>
      
      <div className="flex items-center space-x-3 mt-2">
        <button
          onClick={(e) => {
            e.stopPropagation(); // Good for preventing clicks on parent elements if any
            handleVote('upvote');
          }}
          disabled={isSubmitting} // <<< Apply disabled state
          className="flex items-center text-xs text-success hover:text-success-focus transition-colors duration-150 p-1 rounded-full hover:bg-success/10 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
          aria-label="Upvote reply"
        >
          <ArrowUp className="w-3 h-3" />
          <span className="ml-1">{reply.upvotes || 0}</span>
        </button>
        <button
          onClick={(e) => {
            e.stopPropagation();
            handleVote('downvote');
          }}
          disabled={isSubmitting} // <<< Apply disabled state
          className="flex items-center text-xs text-error hover:text-error-focus transition-colors duration-150 p-1 rounded-full hover:bg-error/10 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
          aria-label="Downvote reply"
        >
          <ArrowDown className="w-3 h-3" />
          <span className="ml-1">{reply.downvotes || 0}</span>
        </button>
      </div>
    </div>
  );
};

export default ReplyItem;
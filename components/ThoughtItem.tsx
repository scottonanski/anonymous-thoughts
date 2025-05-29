// src/components/ThoughtItem.tsx

import React, { useState } from 'react';
import { MessageSquareReply, ArrowUp, ArrowDown } from 'lucide-react';
import type { Thought, Reply as ReplyType, VoteType } from '../types'; // Assuming types.ts is in ../
import ReplyInput from './ReplyInput'; // Assuming ReplyInput is in the same directory
import ReplyItem from './ReplyItem';   // Assuming ReplyItem is in the same directory

interface ThoughtItemProps {
  thought: Thought;
  onAddReplyToThought: (thoughtId: string, text: string) => void; // Or Promise<void>
  onVoteOnReply: (thoughtId: string, replyId: string, voteType: VoteType) => void; // Or Promise<void>
  onVoteOnThought: (thoughtId: string, voteType: VoteType) => void; // Or Promise<void>
  isSubmitting?: boolean; // <<< ADDED: To disable buttons during API calls
}

const ThoughtItem: React.FC<ThoughtItemProps> = ({
  thought,
  onAddReplyToThought,
  onVoteOnReply,
  onVoteOnThought,
  isSubmitting, // <<< Destructure the new prop
}) => {
  const [showReplyInput, setShowReplyInput] = useState(false);
  // Ensure timestamp is a number before using toLocaleString, or handle if it might be undefined/null
  const formattedTimestamp = thought.timestamp ? new Date(thought.timestamp).toLocaleString() : 'Unknown date';

  const handleAddReply = (text: string) => {
    if (isSubmitting) return; // Prevent action if already submitting
    onAddReplyToThought(thought.id, text);
    // setShowReplyInput(false); // Optionally keep input open or close based on preference/UX
  };

  // Ensure replies array exists and is an array before sorting
  const sortedReplies = [...(thought.replies || [])].sort((a, b) => {
    const netVotesA = (a.upvotes || 0) - (a.downvotes || 0);
    const netVotesB = (b.upvotes || 0) - (b.downvotes || 0);
    if (netVotesB !== netVotesA) {
      return netVotesB - netVotesA;
    }
    return (b.timestamp || 0) - (a.timestamp || 0);
  });

  return (
    <div className="bg-base-100 rounded-xl shadow-lg p-6 mb-6 transition-all duration-300 ease-in-out hover:shadow-xl">
      <p className="text-base-content text-lg mb-3 whitespace-pre-wrap break-words">{thought.text}</p>
      
      <div className="flex flex-wrap justify-between items-center text-sm text-base-content/70 mb-4 gap-y-2">
        <span className="whitespace-nowrap">Posted: {formattedTimestamp}</span>
        
        <div className="flex items-center space-x-3">
          <button
            onClick={() => onVoteOnThought(thought.id, 'upvote')}
            disabled={isSubmitting} // <<< Apply disabled state
            className="flex items-center text-success hover:text-success-focus transition-colors duration-150 p-1 rounded-full hover:bg-success/10 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
            aria-label="Upvote thought"
          >
            <ArrowUp className="w-4 h-4" />
            <span className="ml-1 text-xs">{thought.upvotes || 0}</span>
          </button>
          <button
            onClick={() => onVoteOnThought(thought.id, 'downvote')}
            disabled={isSubmitting} // <<< Apply disabled state
            className="flex items-center text-error hover:text-error-focus transition-colors duration-150 p-1 rounded-full hover:bg-error/10 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
            aria-label="Downvote thought"
          >
            <ArrowDown className="w-4 h-4" />
            <span className="ml-1 text-xs">{thought.downvotes || 0}</span>
          </button>

          <button 
            onClick={() => setShowReplyInput(!showReplyInput)}
            disabled={isSubmitting} // <<< Apply disabled state
            className="flex items-center text-primary hover:text-primary-focus hover:bg-primary/10 p-2 rounded-lg transition-colors duration-150 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
            aria-label="Toggle reply input"
          >
            <MessageSquareReply className="w-5 h-5 mr-1" />
            Reply ({(thought.replies || []).length})
          </button>
        </div>
      </div>

      {showReplyInput && (
        <div className="my-4 p-4 bg-base-200/30 rounded-lg border border-base-300">
          <ReplyInput 
            onAddReply={handleAddReply} 
            parentThoughtId={thought.id} 
            disabled={isSubmitting} // <<< Pass disabled state down
          />
        </div>
      )}

      {(thought.replies || []).length > 0 && (
        <div className="mt-4 pt-4 border-t border-base-300"> {/* Changed border-slate-200 to border-base-300 */}
          <h4 className="text-md font-semibold text-base-content/80 mb-2">Replies ({(thought.replies || []).length}):</h4>
          <div className="max-h-96 overflow-y-auto pr-2 space-y-3 scrollbar-thin scrollbar-thumb-base-300 scrollbar-track-base-100 hover:scrollbar-thumb-base-400 transition-colors duration-200">
            {sortedReplies.map((reply: ReplyType) => (
              <ReplyItem
                key={reply.id}
                reply={reply}
                onVote={(replyId, voteType) => onVoteOnReply(thought.id, replyId, voteType)}
                isSubmitting={isSubmitting} // <<< Pass isSubmitting state down
              />
            ))}
          </div>
        </div>
      )}
      
      {(thought.replies || []).length === 0 && showReplyInput && (
        <p className="text-sm text-base-content/70 mt-3">Be the first to reply!</p>
      )}
    </div>
  );
};

export default ThoughtItem;
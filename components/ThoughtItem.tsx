// components/ThoughtItem.tsx

import React, { useState } from 'react';
import { MessageSquareReply, ArrowUp, ArrowDown } from 'lucide-react';
import type { Thought, Reply as ReplyType, VoteType } from '../types';
import ReplyInput from './ReplyInput';
import ReplyItem from './ReplyItem';
interface ThoughtItemProps {
  thought: Thought;
  onAddReplyToThought: (thoughtId: string, text: string) => void;
  onVoteOnReply: (thoughtId: string, replyId: string, voteType: VoteType) => void;
  onVoteOnThought: (thoughtId: string, voteType: VoteType) => void;
}

const ThoughtItem: React.FC<ThoughtItemProps> = ({ thought, onAddReplyToThought, onVoteOnReply, onVoteOnThought }) => {
  const [showReplyInput, setShowReplyInput] = useState(false);
  const formattedTimestamp = new Date(thought.timestamp).toLocaleString();

  const handleAddReply = (text: string) => {
    onAddReplyToThought(thought.id, text);
    setShowReplyInput(false);
  };

  const sortedReplies = [...thought.replies].sort((a, b) => {
    const netVotesA = a.upvotes - a.downvotes;
    const netVotesB = b.upvotes - b.downvotes;
    if (netVotesB !== netVotesA) {
      return netVotesB - netVotesA;
    }
    return b.timestamp - a.timestamp;
  });

  return (
    <div className="bg-base-100 rounded-xl shadow-lg p-6 mb-6 transition-all duration-300 ease-in-out hover:shadow-xl">
      <p className="text-base-content text-lg mb-3 whitespace-pre-wrap break-words">{thought.text}</p>
      
      <div className="flex flex-wrap justify-between items-center text-sm text-base-content/70 mb-4 gap-y-2">
        <span className="whitespace-nowrap">Posted: {formattedTimestamp}</span>
        
        <div className="flex items-center space-x-3">
          <button
            onClick={() => onVoteOnThought(thought.id, 'upvote')}
            className="flex items-center text-success hover:text-success-focus transition-colors duration-150 p-1 rounded-full hover:bg-success/10 cursor-pointer"
            aria-label="Upvote thought"
          >
            <ArrowUp className="w-4 h-4" />
            <span className="ml-1 text-xs">{thought.upvotes}</span>
          </button>
          <button
            onClick={() => onVoteOnThought(thought.id, 'downvote')}
            className="flex items-center text-error hover:text-error-focus transition-colors duration-150 p-1 rounded-full hover:bg-error/10 cursor-pointer"
            aria-label="Downvote thought"
          >
            <ArrowDown className="w-4 h-4" />
            <span className="ml-1 text-xs">{thought.downvotes}</span>
          </button>

          <button 
            onClick={() => setShowReplyInput(!showReplyInput)}
            className="flex items-center text-primary hover:text-primary-focus hover:bg-primary/10 p-2 rounded-lg transition-colors duration-150 cursor-pointer"
            aria-label="Toggle reply input"
          >
            <MessageSquareReply className="w-5 h-5 mr-1" />
            Reply ({thought.replies.length})
          </button>
        </div>
      </div>

      {showReplyInput && (
        <div className="my-4 p-4 bg-base-200/30 rounded-lg border border-base-300">
          <ReplyInput onAddReply={handleAddReply} parentThoughtId={thought.id} />
        </div>
      )}

      {thought.replies.length > 0 && (
        <div className="mt-4 pt-4 border-t border-slate-200">
          <h4 className="text-md font-semibold text-base-content/80 mb-2">Replies ({thought.replies.length}):</h4>
          <div className="max-h-96 overflow-y-auto pr-2 space-y-3 scrollbar-thin scrollbar-thumb-base-300 scrollbar-track-base-100 hover:scrollbar-thumb-base-400 transition-colors duration-200">
            {sortedReplies.map((reply: ReplyType) => (
              <ReplyItem
                key={reply.id}
                reply={reply}
                onVote={(replyId, voteType) => onVoteOnReply(thought.id, replyId, voteType)}
              />
            ))}
          </div>
        </div>
      )}
      
      {thought.replies.length === 0 && showReplyInput && (
        <p className="text-sm text-base-content/70 mt-3">Be the first to reply!</p>
      )}
    </div>
  );
};

export default ThoughtItem;


import React, { useState } from 'react';
import CharacterCounter from './CharacterCounter';
import { MAX_CHARS } from '../constants';

interface ReplyInputProps {
  onAddReply: (text: string) => void;
  parentThoughtId: string; // just for context, not directly used in this component's core logic now
}

const ReplyInput: React.FC<ReplyInputProps> = ({ onAddReply }) => {
  const [text, setText] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (text.trim() && text.length <= MAX_CHARS) {
      onAddReply(text.trim());
      setText('');
    }
  };

  return (
    <form onSubmit={handleSubmit} className="mt-4">
      <textarea
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder="Write a reply... (Max 300 characters)"
        className="w-full p-2 border border-base-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary transition-shadow duration-150 resize-none text-sm bg-base-200/30"
        rows={2}
      />
      <div className="flex justify-between items-center mt-2">
        <CharacterCounter currentLength={text.length} />
        <button
          type="submit"
          disabled={!text.trim() || text.length > MAX_CHARS}
          className="px-4 py-1.5 bg-primary text-primary-content text-sm font-medium rounded-lg hover:bg-primary-focus focus:outline-none focus:ring-1 focus:ring-primary focus:ring-opacity-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-150"
        >
          Reply
        </button>
      </div>
    </form>
  );
};

export default ReplyInput;

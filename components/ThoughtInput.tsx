// components/ThoughtInput.tsx
import React, { useState } from 'react';
import CharacterCounter from './CharacterCounter';
import { MAX_CHARS } from '../constants';

interface ThoughtInputProps {
  onAddThought: (text: string) => void;
}

const ThoughtInput: React.FC<ThoughtInputProps> = ({ onAddThought }) => {
  const [text, setText] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (text.trim() && text.length <= MAX_CHARS) {
      onAddThought(text.trim());
      setText('');
    }
  };

  return (
    <form onSubmit={handleSubmit} className="mb-8 p-6 bg-base-100 rounded-xl shadow-lg">
      <h2 className="text-2xl font-semibold text-base-content mb-4">Share a thought...</h2>
      <textarea
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder="What's on your mind? (Keep it under 300 characters)"
        className="w-full p-3 border border-base-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary transition-shadow duration-150 resize-none bg-base-200/30"
        rows={4}
      />
      <div className="flex justify-between items-center mt-3">
        <CharacterCounter currentLength={text.length} />
        <button
          type="submit"
          disabled={!text.trim() || text.length > MAX_CHARS}
          className="px-6 py-2 bg-primary text-primary-content font-medium rounded-lg hover:bg-primary-focus focus:outline-none focus:ring-2 focus:ring-primary focus:ring-opacity-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-150"
        >
          Post
        </button>
      </div>
    </form>
  );
};

export default ThoughtInput;

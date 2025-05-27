// components/Sidebar.tsx

import React from 'react';
import type { KeyboardEvent } from 'react';
import {Brain} from 'lucide-react';
import type { Thought } from '../types';
import { Virtuoso } from 'react-virtuoso';

interface SidebarItemProps {
  thought: Thought;
  isSelected: boolean;
  onSelect: (id: string) => void;
}

const SidebarItem: React.FC<SidebarItemProps> = ({ 
  thought, 
  isSelected, 
  onSelect 
}) => {
  const netVotes = (thought.upvotes || 0) - (thought.downvotes || 0);
  const previewText = thought.text.length > 60 ? thought.text.substring(0, 60) + "..." : thought.text;

  return (
    <div
      onClick={() => onSelect(thought.id)}
      className={`p-2 mb-2 mr-3 rounded-lg cursor-pointer transition-all duration-150 ease-in-out transform 
                  ${isSelected 
                    ? 'bg-primary/50 border-l-4 border-primary shadow-md text-primary border-l-4 border-success/50' 
                    : 'bg-base-100 hover:bg-base-200 text-base-content/80 border border-base-300 hover:shadow-sm '
                  }`}
      role="button"
      tabIndex={0}
      onKeyDown={(e: KeyboardEvent<HTMLDivElement>) => { 
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          onSelect(thought.id);
        }
      }}
      aria-pressed={isSelected}
      aria-label={`Select thought: ${thought.text.substring(0,100)}`}
    >
      <p className={`text-sm font-medium truncate ${isSelected ? 'text-primary-content' : 'text-base-content'}`} title={thought.text}>
        {previewText}
      </p>
      <div className="text-xs mt-1.5 flex justify-between items-center">
        <span className={`font-semibold ${netVotes > 0 ? 'text-success' : netVotes < 0 ? 'text-error' : 'text-base-content/60'}`}>
          Votes: {netVotes}
        </span>
        <span className={`text-primary-content ${isSelected ? 'text-primary' : ''}`}>
            {new Date(thought.timestamp).toLocaleDateString()}
        </span>
      </div>
    </div>
  );
};


interface SidebarProps {
  thoughts: Thought[];
  selectedThoughtId: string | null;
  onSelectThought: (id: string) => void;
  className?: string;
}

const Sidebar: React.FC<SidebarProps> = ({ 
  thoughts, 
  selectedThoughtId, 
  onSelectThought, 
  className = '' 
}) => {
  return (
    <aside className={`${className} p-4 text bg-base-200/30 border-r border-base-300/50 h-full flex-shrink-0 flex flex-col`}>
      <h2 className="text-xl font-semibold text-base-content mb-3 sticky top-0 bg-base-200/30 backdrop-blur-sm pt-3 pb-2 -mt-4 z-10 flex items-center">
        <Brain className="w-6 h-6 mr-2 text-primary" />
        Previous Thoughts
      </h2>
      {/* Diagnostic: Simple map instead of Virtuoso */}
      <div className="flex-1 min-h-0">
        <Virtuoso
          style={{ height: '100%' }}
          data={thoughts}
          itemContent={(_index, thought) => (
            <SidebarItem
              thought={thought}
              isSelected={thought.id === selectedThoughtId}
              onSelect={onSelectThought}
            />
          )}
        />
      </div>
    </aside>
  );
};

export default Sidebar;
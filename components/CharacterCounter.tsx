
import React from 'react';
import { MAX_CHARS } from '../constants';

interface CharacterCounterProps {
  currentLength: number;
}

const CharacterCounter: React.FC<CharacterCounterProps> = ({ currentLength }) => {
  const isOverLimit = currentLength > MAX_CHARS;
  return (
    <div className={`text-sm ${isOverLimit ? 'text-error' : 'text-base-content/70'}`}>
      {currentLength}/{MAX_CHARS}
    </div>
  );
};

export default CharacterCounter;

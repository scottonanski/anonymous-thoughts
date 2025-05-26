import React, { useState, useEffect, useCallback, useMemo } from 'react';
import type { Thought, Reply, VoteType } from './types';
import ThoughtInput from './components/ThoughtInput';
import ThoughtItem from './components/ThoughtItem';
import Sidebar from './components/Sidebar';
import { MessageSquareMore, Brain, PanelLeftOpen, PanelRightOpen } from 'lucide-react';
import ThemeSwitcher from './components/ThemeSwitcher';

const App: React.FC = () => {
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [thoughts, setThoughts] = useState<Thought[]>(() => {
    const savedThoughts = localStorage.getItem('us-thoughts');
    if (savedThoughts) {
      const parsedThoughts = JSON.parse(savedThoughts) as Thought[];
      return parsedThoughts.map(t => ({
        ...t,
        upvotes: t.upvotes || 0,
        downvotes: t.downvotes || 0,
        replies: t.replies || [],
      }));
    }
    return [];
  });

  const [selectedThoughtId, setSelectedThoughtId] = useState<string | null>(null);

  useEffect(() => {
    localStorage.setItem('us-thoughts', JSON.stringify(thoughts));
  }, [thoughts]);

  const sortedThoughts = useMemo(() => {
    return [...thoughts].sort((a, b) => {
      const netVotesA = (a.upvotes || 0) - (a.downvotes || 0);
      const netVotesB = (b.upvotes || 0) - (b.downvotes || 0);
      if (netVotesB !== netVotesA) {
        return netVotesB - netVotesA;
      }
      return b.timestamp - a.timestamp;
    });
  }, [thoughts]);

  useEffect(() => {
    if (sortedThoughts.length > 0) {
      const currentSelectedThoughtExists = selectedThoughtId && sortedThoughts.find(t => t.id === selectedThoughtId);
      if (!currentSelectedThoughtExists) {
        setSelectedThoughtId(sortedThoughts[0].id);
      }
    } else {
      setSelectedThoughtId(null);
    }
  }, [sortedThoughts, selectedThoughtId]);


  const handleAddThought = useCallback((text: string) => {
    const newThought: Thought = {
      id: crypto.randomUUID(),
      text,
      timestamp: Date.now(),
      replies: [],
      upvotes: 0,
      downvotes: 0,
    };
    setThoughts(prevThoughts => [newThought, ...prevThoughts]);
    setSelectedThoughtId(newThought.id);
  }, []);

  const handleAddReplyToThought = useCallback((thoughtId: string, text: string) => {
    const newReply: Reply = {
      id: crypto.randomUUID(),
      text,
      timestamp: Date.now(),
      upvotes: 0,
      downvotes: 0
    };

    setThoughts(prevThoughts =>
      prevThoughts.map(thought =>
        thought.id === thoughtId
          ? { 
              ...thought, 
              replies: [...thought.replies, newReply] 
            }
          : thought
      )
    );
  }, []);

  const handleVoteOnReply = useCallback((thoughtId: string, replyId: string, voteType: VoteType) => {
    setThoughts(prevThoughts =>
      prevThoughts.map(thought => {
        if (thought.id !== thoughtId) return thought;
        
        const isDownvote = voteType === 'downvote';
        
        // Process each reply to find and update the target reply
        const updatedReplies = thought.replies.map(reply => {
          if (reply.id === replyId) {
            // If this is the target reply and it's a downvote that reaches 10, mark it for deletion
            if (isDownvote && reply.downvotes + 1 >= 10) {
              return null; // This will be filtered out
            }
            // Otherwise, update the vote count
            return {
              ...reply,
              upvotes: !isDownvote ? reply.upvotes + 1 : reply.upvotes,
              downvotes: isDownvote ? reply.downvotes + 1 : reply.downvotes,
            };
          }
          return reply;
        }).filter((reply): reply is Reply => reply !== null);
        
        return {
          ...thought,
          replies: updatedReplies
        };
      })
    );
  }, []);

  const handleVoteOnThought = useCallback((thoughtId: string, voteType: VoteType) => {
    setThoughts(prevThoughts => {
      // If downvoting, check if this will reach 10 downvotes
      if (voteType === 'downvote') {
        const thought = prevThoughts.find(t => t.id === thoughtId);
        if (thought && thought.downvotes + 1 >= 10) {
          // Remove the entire thought if it reaches 10 downvotes
          return prevThoughts.filter(t => t.id !== thoughtId);
        }
      }
      
      // Otherwise, update the vote count
      return prevThoughts.map(thought => {
        if (thought.id === thoughtId) {
          return {
            ...thought,
            upvotes: voteType === 'upvote' ? thought.upvotes + 1 : thought.upvotes,
            downvotes: voteType === 'downvote' ? thought.downvotes + 1 : thought.downvotes,
          };
        }
        return thought;
      });
    });
  }, []);

  const handleSelectThought = useCallback((id: string) => {
    setSelectedThoughtId(id);
  }, []);

  const selectedThought = useMemo(() => {
    return selectedThoughtId ? sortedThoughts.find(t => t.id === selectedThoughtId) : null;
  }, [selectedThoughtId, sortedThoughts]);


  const toggleSidebar = () => {
    setIsSidebarCollapsed(!isSidebarCollapsed);
  };

  const sidebarWidth = isSidebarCollapsed ? 'w-0' : 'w-72 md:w-80 lg:w-96';
  const sidebarContentClass = isSidebarCollapsed ? 'opacity-0 w-0 overflow-hidden' : 'opacity-100';
  const mainContentClass = isSidebarCollapsed ? 'md:ml-8' : '';

  return (
    <div className="h-screen flex flex-col bg-base-300">
      <ThemeSwitcher />
      <div className="flex flex-1 min-h-0">
        {/* Left Column - Sidebar */}
        <div className={`${sidebarWidth} transition-all duration-300 ease-in-out border-r border-base-300 bg-base-100 flex flex-col relative`}>
          {/* Collapse/Expand Button */}
          <div className="tooltip tooltip-right absolute -right-6 top-4 z-10" data-tip={isSidebarCollapsed ? 'Previous Thoughts' : 'Close'}>
            <button
              onClick={toggleSidebar}
              className="w-6 h-12 bg-base-100 border border-base-300 rounded-r-lg flex items-center justify-center hover:bg-base-200 transition-colors cursor-pointer"
              aria-label={isSidebarCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
            >
              {isSidebarCollapsed ? (
                <PanelLeftOpen className="h-4 w-4" />
              ) : (
                <PanelRightOpen className="h-4 w-4" />
              )}
            </button>
          </div>

          <div className={`flex-1 overflow-y-auto transition-opacity duration-300 ${sidebarContentClass}`}>
            {!isSidebarCollapsed && (
              <>
                {sortedThoughts.length > 0 ? (
                  <Sidebar
                    thoughts={sortedThoughts}
                    selectedThoughtId={selectedThoughtId}
                    onSelectThought={handleSelectThought}
                    className="h-full"
                  />
                ) : (
                  <div className="h-full flex items-center justify-center p-6 text-center">
                    <div>
                      <MessageSquareMore className="mx-auto h-12 w-12 text-base-content/30" />
                      <p className="mt-2 text-base-content/70">Your thoughts will appear here</p>
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
        </div>

        {/* Right Column - Main Content */}
        <div className={`flex-1 flex flex-col min-h-0 ${mainContentClass} transition-all duration-300`}>
          <div className="flex-1 overflow-y-auto">
            <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 w-full py-8">
              <header className="text-center mb-8">
                <h1 className="text-5xl font-bold text-primary pt-20">
                  <Brain className="inline-block mr-2 h-12 w-12" />
                  Anonymous Thoughts
                </h1>
                <p className="text-base-content/80 my-4 py-4 text-lg">Share your thoughts... Anonymously.</p>
              </header>
              <ThoughtInput onAddThought={handleAddThought} />

              {sortedThoughts.length === 0 && (
                <div className="text-center py-10 px-6 bg-base-100 rounded-xl shadow-lg mt-8 w-full">
                  <svg className="mx-auto h-12 w-12 text-base-content/40" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                    <path vectorEffect="non-scaling-stroke" strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
                  </svg>
                  <h3 className="mt-2 text-lg font-medium text-base-content">No thoughts yet</h3>
                  <p className="mt-1 text-sm text-base-content/70">Be the first one to share something!</p>
                </div>
              )}

              {sortedThoughts.length > 0 && !selectedThought && (
                <div className="text-center py-10 px-6 bg-base-100 rounded-xl shadow-lg mt-8">
                  <MessageSquareMore className="mx-auto h-12 w-12 text-base-content/40" />
                  <h3 className="mt-2 text-lg font-medium text-base-content">Select a thought</h3>
                  <p className="mt-1 text-sm text-base-content/70">Choose a thought from the sidebar to read and reply, or share a new one!</p>
                </div>
              )}

              {selectedThought && (
                <div className="mt-8">
                  <ThoughtItem
                    key={selectedThought.id}
                    thought={selectedThought}
                    onAddReplyToThought={handleAddReplyToThought}
                    onVoteOnReply={handleVoteOnReply}
                    onVoteOnThought={handleVoteOnThought}
                  />
                </div>
              )}
            </div>
          </div>

       
        </div>


      </div>
      
      <footer className="text-center py-6 border-t border-base-300/80 bg-base-100/50">
        <p className="text-sm text-base-content/70 mb-2">
          &copy; {new Date().getFullYear()} <span>Anonymous Thoughts.</span>
        </p>
        <p className="text-sm text-base-content/70 mb-2">
          <span className='m-1 block'>All rights reserved.</span>
        </p>
      </footer>
    </div>
  );
};

export default App;

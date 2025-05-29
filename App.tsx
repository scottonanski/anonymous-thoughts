import React, { useState, useEffect, useCallback, useMemo } from 'react';
import axios from 'axios'; // <<< ADDED
import type { Thought, Reply, VoteType } from './types';
import ThoughtInput from './components/ThoughtInput';
import ThoughtItem from './components/ThoughtItem';
import Sidebar from './components/Sidebar';
import { MessageSquareMore, Brain, PanelLeftOpen, PanelRightOpen } from 'lucide-react';
import ThemeSwitcher from './components/ThemeSwitcher';

// Define what a thought/reply looks like coming from the API (backend structure)
// This helps with mapping if backend names/types differ slightly from frontend
interface ApiReply extends Omit<Reply, 'timestamp'> {
  createdAt: string; // Backend uses createdAt string
}
interface ApiThought extends Omit<Thought, 'timestamp' | 'replies'> {
  createdAt: string; // Backend uses createdAt string
  replies: ApiReply[];
}

const App: React.FC = () => {
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [thoughts, setThoughts] = useState<Thought[]>([]); // <<< CHANGED: Initialize as empty
  const [selectedThoughtId, setSelectedThoughtId] = useState<string | null>(null);

  // --- NEW STATE for API calls ---
  const [isLoading, setIsLoading] = useState<boolean>(true); // Start true for initial load
  const [error, setError] = useState<string | null>(null);
  // -------------------------------

  const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '/api';

  // --- CHANGED: Fetch thoughts from API instead of localStorage ---
  useEffect(() => {
    const fetchThoughts = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const response = await axios.get<{ status: string; data: { thoughts: ApiThought[] } }>(
          `${API_BASE_URL}/thoughts`
        );
        
        // Map backend data (ApiThought/ApiReply with createdAt: string) 
        // to frontend data (Thought/Reply with timestamp: number)
        const thoughtsForFrontend: Thought[] = response.data.data.thoughts.map((apiThought: ApiThought) => ({
          ...apiThought,
          timestamp: new Date(apiThought.createdAt).getTime(),
          replies: (apiThought.replies || []).map((apiReply: ApiReply) => ({
            ...apiReply,
            timestamp: new Date(apiReply.createdAt).getTime(),
          })),
          // Ensure upvotes/downvotes default to 0 if not present (good practice)
          upvotes: apiThought.upvotes || 0,
          downvotes: apiThought.downvotes || 0,
        }));
        setThoughts(thoughtsForFrontend);
      } catch (err) {
        console.error("Failed to fetch thoughts:", err);
        let errorMessage = 'Failed to load thoughts. The void is feeling a bit too empty.';
        if (axios.isAxiosError(err) && err.response?.data?.message) {
          errorMessage = err.response.data.message;
        } else if (err instanceof Error) {
          errorMessage = err.message;
        }
        setError(errorMessage);
      } finally {
        setIsLoading(false);
      }
    };

    fetchThoughts();
  }, [API_BASE_URL]); // API_BASE_URL dependency is good practice
  // -------------------------------------------------------------

  // --- REMOVED: useEffect for localStorage.setItem ---

  const sortedThoughts = useMemo(() => {
    return [...thoughts].sort((a, b) => {
      const netVotesA = (a.upvotes || 0) - (a.downvotes || 0);
      const netVotesB = (b.upvotes || 0) - (b.downvotes || 0);
      if (netVotesB !== netVotesA) {
        return netVotesB - netVotesA;
      }
      return (b.timestamp || 0) - (a.timestamp || 0);
    });
  }, [thoughts]);

  useEffect(() => {
    if (!isLoading && !error && sortedThoughts.length > 0) {
      const currentSelectedThoughtExists = selectedThoughtId && sortedThoughts.find(t => t.id === selectedThoughtId);
      if (!currentSelectedThoughtExists) {
        setSelectedThoughtId(sortedThoughts[0].id);
      }
    } else if (!isLoading && !error && sortedThoughts.length === 0) {
      setSelectedThoughtId(null);
    }
  }, [sortedThoughts, selectedThoughtId, isLoading, error]);


  // --- THE FOLLOWING HANDLERS ARE STILL USING CLIENT-SIDE LOGIC ---
  // --- WE WILL UPDATE THESE LATER, ONE BY ONE ---
  const handleAddThought = useCallback((text: string) => {
    console.log("handleAddThought called - (WILL BE UPDATED TO USE API)");
    const newThought: Thought = {
      id: crypto.randomUUID(), // Temporary ID
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
    console.log("handleAddReplyToThought called - (WILL BE UPDATED TO USE API)");
    const newReply: Reply = {
      id: crypto.randomUUID(), // Temporary ID
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
              replies: [...(thought.replies || []), newReply] 
            }
          : thought
      )
    );
  }, []);

  const handleVoteOnReply = useCallback((thoughtId: string, replyId: string, voteType: VoteType) => {
    console.log("handleVoteOnReply called - (WILL BE UPDATED TO USE API)");
    setThoughts(prevThoughts =>
      prevThoughts.map(thought => {
        if (thought.id !== thoughtId) return thought;
        const isDownvote = voteType === 'downvote';
        const updatedReplies = (thought.replies || []).map(reply => {
          if (reply.id === replyId) {
            const currentDownvotes = reply.downvotes || 0;
            if (isDownvote && currentDownvotes + 1 >= 10) { // Assuming 10 is threshold
              return null; 
            }
            return {
              ...reply,
              upvotes: !isDownvote ? (reply.upvotes || 0) + 1 : (reply.upvotes || 0),
              downvotes: isDownvote ? currentDownvotes + 1 : currentDownvotes,
            };
          }
          return reply;
        }).filter((reply): reply is Reply => reply !== null);
        return { ...thought, replies: updatedReplies };
      })
    );
  }, []);

  const handleVoteOnThought = useCallback((thoughtId: string, voteType: VoteType) => {
    console.log("handleVoteOnThought called - (WILL BE UPDATED TO USE API)");
    setThoughts(prevThoughts => {
      const thoughtIndex = prevThoughts.findIndex(t => t.id === thoughtId);
      if (thoughtIndex === -1) return prevThoughts;
      
      const thought = prevThoughts[thoughtIndex];
      const currentDownvotes = thought.downvotes || 0;

      if (voteType === 'downvote' && currentDownvotes + 1 >= 10) { // Assuming 10 is threshold
        return prevThoughts.filter(t => t.id !== thoughtId);
      }
      
      const updatedThought = {
        ...thought,
        upvotes: voteType === 'upvote' ? (thought.upvotes || 0) + 1 : (thought.upvotes || 0),
        downvotes: voteType === 'downvote' ? currentDownvotes + 1 : currentDownvotes,
      };
      
      const newThoughts = [...prevThoughts];
      newThoughts[thoughtIndex] = updatedThought;
      return newThoughts;
    });
  }, []);
  // --- END OF CLIENT-SIDE HANDLERS TO BE UPDATED ---

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

  // --- JSX for Loading and Error States ---
  if (isLoading) {
    return (
      <div className="h-screen flex items-center justify-center bg-base-300 text-xl text-base-content/70">
        Loading thoughts from the aether...
      </div>
    );
  }

  if (error) {
    return (
      <div className="h-screen flex flex-col items-center justify-center bg-base-300 text-xl text-error p-8 text-center">
        <p className="mb-4">Oops! Something went terribly wrong:</p>
        <p className="text-base bg-error/20 p-4 rounded-md mb-6">{error}</p>
        <button 
          onClick={() => window.location.reload()} 
          className="px-6 py-2 bg-primary text-primary-content rounded-lg hover:bg-primary-focus"
        >
          Try Again
        </button>
      </div>
    );
  }
  // -----------------------------------------

  return (
    <div className="h-screen flex flex-col bg-base-300">
      <ThemeSwitcher />
      <div className="flex flex-1 min-h-0">
        {/* Left Column - Sidebar */}
        <div className={`${sidebarWidth} transition-all duration-300 ease-in-out border-r border-base-300 bg-base-100 flex flex-col relative`}>
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
                {/* Sidebar content is already conditional on isLoading/error via the main return */}
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
                      <p className="mt-2 text-base-content/70">No thoughts shared yet. Create one!</p>
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
              
              {/* Main content area also covered by main isLoading/error check */}
              <ThoughtInput onAddThought={handleAddThought} />

              {sortedThoughts.length === 0 && ( // This condition is fine, as it's nested under !isLoading && !error
                <div className="text-center py-10 px-6 bg-base-100 rounded-xl shadow-lg mt-8 w-full">
                  <svg className="mx-auto h-12 w-12 text-base-content/40" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                    <path vectorEffect="non-scaling-stroke" strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
                  </svg>
                  <h3 className="mt-2 text-lg font-medium text-base-content">No thoughts have been shared.</h3>
                  <p className="mt-1 text-sm text-base-content/70">Be the first one to cast a thought into the void!</p>
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
          © {new Date().getFullYear()} <span>Anonymous Thoughts.</span>
        </p>
        <p className="text-sm text-base-content/70 mb-2">
          <span className='m-1 block'>All rights reserved.</span>
        </p>
      </footer>
    </div>
  );
};

export default App;
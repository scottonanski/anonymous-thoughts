// src/App.tsx

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import axios from 'axios';
import type { Thought, Reply, VoteType } from './types'; // Assuming these types are in src/types.ts or similar
import ThoughtInput from './components/ThoughtInput';
import ThoughtItem from './components/ThoughtItem';
import Sidebar from './components/Sidebar';
import { MessageSquareMore, Brain, PanelLeftOpen, PanelRightOpen } from 'lucide-react';
import ThemeSwitcher from './components/ThemeSwitcher';

interface ApiReply extends Omit<Reply, 'timestamp'> {
  createdAt: string;
}
interface ApiThought extends Omit<Thought, 'timestamp' | 'replies'> {
  createdAt: string;
  replies: ApiReply[];
}

interface ApiError { 
  message: string;
}

const App: React.FC = () => {
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [thoughts, setThoughts] = useState<Thought[]>([]);
  const [selectedThoughtId, setSelectedThoughtId] = useState<string | null>(null);

  const [isLoadingInitial, setIsLoadingInitial] = useState<boolean>(true);
  const [initialLoadError, setInitialLoadError] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '/api';

  // These mappers are stable as their dependency arrays are empty or depend on stable functions
  const mapApiReplyToFrontend = useCallback((apiReply: ApiReply): Reply => ({
    ...apiReply,
    timestamp: new Date(apiReply.createdAt).getTime(),
    upvotes: apiReply.upvotes || 0,
    downvotes: apiReply.downvotes || 0,
  }), []);

  const mapApiThoughtToFrontend = useCallback((apiThought: ApiThought): Thought => ({
    ...apiThought,
    timestamp: new Date(apiThought.createdAt).getTime(),
    replies: (apiThought.replies || []).map(mapApiReplyToFrontend),
    upvotes: apiThought.upvotes || 0,
    downvotes: apiThought.downvotes || 0,
  }), [mapApiReplyToFrontend]);

  // Initial fetch and re-fetch logic
  const fetchThoughts = useCallback(async (options?: { selectNewest?: boolean, keepCurrentSelection?: boolean }) => {
    const { selectNewest = false, keepCurrentSelection = false } = options || {};
    
    if (!keepCurrentSelection) { // Only show full loading if not trying to keep selection (e.g. initial load)
        setIsLoadingInitial(true);
        setInitialLoadError(null);
    } else { // For re-fetches that are more like background updates
        setIsSubmitting(true); // Use submitting state to indicate activity
        setActionError(null);
    }
    
    try {
      const response = await axios.get<{ status: string; data: { thoughts: ApiThought[] } }>(
        `${API_BASE_URL}/thoughts`
      );

      console.log("API Response Data in fetchThoughts:", JSON.stringify(response.data, null, 2)); 

      const newThoughtsList: Thought[] = response.data.data.thoughts.map(mapApiThoughtToFrontend);
      setThoughts(newThoughtsList);

      if (!keepCurrentSelection) {
        if (newThoughtsList.length > 0) {
          if (selectNewest || !selectedThoughtId || !newThoughtsList.find(t => t.id === selectedThoughtId)) {
            // Select newest if specified, or if no selection, or if current selection disappeared
            setSelectedThoughtId(newThoughtsList[0].id); // Assumes API returns sorted by newest or frontend will sort
          }
          // If current selection still exists in new list, it remains selected (no change needed here)
        } else {
          setSelectedThoughtId(null); // No thoughts, no selection
        }
      }
      // If keepCurrentSelection is true, we don't mess with selectedThoughtId here,
      // relying on the list update and existing selection.

    } catch (err) {
      console.error("Failed to fetch thoughts:", err);
      const defaultMsg = 'Failed to load thoughts.';
      let errorMessage = defaultMsg;
      if (axios.isAxiosError<ApiError>(err) && err.response?.data?.message) {
        errorMessage = err.response.data.message;
      } else if (err instanceof Error) {
        errorMessage = err.message || defaultMsg;
      }
      if (!keepCurrentSelection) setInitialLoadError(errorMessage); else setActionError(errorMessage);
    } finally {
      if (!keepCurrentSelection) setIsLoadingInitial(false); else setIsSubmitting(false);
    }
  // Removed selectedThoughtId from dependencies to prevent re-fetch when it changes
  // mapApiThoughtToFrontend is stable
  }, [API_BASE_URL, mapApiThoughtToFrontend ]); 


  // Effect for initial load
  useEffect(() => {
    fetchThoughts({ selectNewest: true }); // On initial load, fetch and select the newest (first in sorted list)
  }, [fetchThoughts]); // This effect runs if `fetchThoughts` function reference changes.

  // Memoized sorted thoughts for display
  const sortedThoughts = useMemo(() => {
    return [...thoughts].sort((a, b) => {
      const netVotesA = (a.upvotes || 0) - (a.downvotes || 0);
      const netVotesB = (b.upvotes || 0) - (b.downvotes || 0);
      if (netVotesB !== netVotesA) return netVotesB - netVotesA;
      return (b.timestamp || 0) - (a.timestamp || 0); // Sort by timestamp descending (newest first)
    });
  }, [thoughts]);

  // This useEffect was potentially problematic. Let's simplify selection logic.
  // The main selection now happens in fetchThoughts or when explicitly selecting from sidebar.
  // We might need a separate effect if a selected thought is DELETED from the `thoughts` array by another action.
  useEffect(() => {
    // If the currently selected thought is no longer in the `sortedThoughts` list (e.g., deleted)
    // and there are other thoughts available, select the first one from the sorted list.
    // If no thoughts are left, set selection to null.
    if (selectedThoughtId && !sortedThoughts.find(t => t.id === selectedThoughtId)) {
      if (sortedThoughts.length > 0) {
        setSelectedThoughtId(sortedThoughts[0].id);
      } else {
        setSelectedThoughtId(null);
      }
    } else if (!selectedThoughtId && sortedThoughts.length > 0 && isLoadingInitial === false) {
      // If no thought is selected, but there are thoughts, and it's not the initial load phase, select the first.
      // This helps if thoughts load and no selection was made.
      setSelectedThoughtId(sortedThoughts[0].id);
    }
  }, [sortedThoughts, selectedThoughtId, isLoadingInitial]);


  const sortReplies = useCallback((replies: Reply[]): Reply[] => {
    return [...replies].sort((a, b) => {
      const netVotesA = (a.upvotes || 0) - (a.downvotes || 0);
      const netVotesB = (b.upvotes || 0) - (b.downvotes || 0);
      if (netVotesB !== netVotesA) return netVotesB - netVotesA;
      return (b.timestamp || 0) - (a.timestamp || 0);
    });
  }, []);

  const handleAddThought = useCallback(async (text: string) => {
    if (!text.trim()) return;
    setIsSubmitting(true); 
    setActionError(null);
    try {
      const response = await axios.post<{ status: string; data: { thought: ApiThought } }>(
        `${API_BASE_URL}/thoughts`, { text }
      );
      const newThoughtFrontend = mapApiThoughtToFrontend(response.data.data.thought);
      
      // Add to local state and select it.
      // No immediate re-fetch needed from server as we have the new thought.
      // The `sortedThoughts` useMemo will pick up the change to `thoughts`.
      setThoughts(prevThoughts => [newThoughtFrontend, ...prevThoughts]); // Add to the beginning
      setSelectedThoughtId(newThoughtFrontend.id); // Select the newly added thought
      
      // Optional: If you want the list to re-sort according to server logic or re-validate,
      // you could call fetchThoughts({ keepCurrentSelection: true }) here or after a short delay.
      // For now, we rely on local update to prevent the "disappearing" issue with vercel dev.

    } catch (err) {
      console.error("Failed to add thought:", err);
      const defaultMsg = 'Failed to post thought.';
      if (axios.isAxiosError<ApiError>(err) && err.response?.data?.message) {
        setActionError(err.response.data.message);
      } else if (err instanceof Error) {
        setActionError(err.message || defaultMsg);
      } else {
        setActionError(defaultMsg);
      }
    } finally {
      setIsSubmitting(false);
    }
  }, [API_BASE_URL, mapApiThoughtToFrontend]); // Dependencies are stable

  const handleAddReplyToThought = useCallback(async (thoughtId: string, text: string) => {
    if (!text.trim()) return;
    setIsSubmitting(true); setActionError(null);
    try {
      const response = await axios.post<{ status: string; data: { reply: ApiReply } }>(
        `${API_BASE_URL}/thoughts/${thoughtId}/replies`, { text }
      );
      const newReplyFrontend = mapApiReplyToFrontend(response.data.data.reply);
      setThoughts(prevThoughts =>
        prevThoughts.map(thought =>
          thought.id === thoughtId
            ? { ...thought, replies: sortReplies([...(thought.replies || []), newReplyFrontend]) }
            : thought
        )
      );
      // No fetchThoughts here, rely on local update
    } catch (err) {
      // ... (error handling as before)
      console.error("Failed to add reply:", err);
      const defaultMsg = 'Failed to add reply.';
      if (axios.isAxiosError<ApiError>(err) && err.response?.data?.message) {
        setActionError(err.response.data.message);
      } else if (err instanceof Error) {
        setActionError(err.message || defaultMsg);
      } else {
        setActionError(defaultMsg);
      }
    } finally {
      setIsSubmitting(false);
    }
  }, [API_BASE_URL, mapApiReplyToFrontend, sortReplies]);

  const handleVoteOnThought = useCallback(async (thoughtId: string, voteType: VoteType) => {
    setIsSubmitting(true); setActionError(null);
    const apiVoteType = voteType === 'upvote' ? 'up' : 'down';
    try {
      const response = await axios.post<{ status: string; data: { thought: ApiThought | null } }>( // API might return null if deleted
        `${API_BASE_URL}/thoughts/${thoughtId}/vote`, { voteType: apiVoteType }
      );
      const updatedThoughtApi = response.data.data.thought; 
      
      if (updatedThoughtApi) {
        const updatedThoughtFrontend = mapApiThoughtToFrontend(updatedThoughtApi);
        setThoughts(prevThoughts =>
          prevThoughts.map(t => (t.id === thoughtId ? updatedThoughtFrontend : t))
        );
      } else {
        // Thought was deleted by the backend due to downvotes
        setThoughts(prevThoughts => prevThoughts.filter(t => t.id !== thoughtId));
        // Selection will be handled by the useEffect that watches sortedThoughts and selectedThoughtId
      }
    } catch (err) {
      console.error("Failed to vote on thought:", err);
      const defaultMsg = 'Failed to vote on thought.';
      if (axios.isAxiosError<ApiError>(err) && err.response) {
        if (err.response.status === 404) { 
          // Thought not found on backend, remove from local state
          setThoughts(prevThoughts => prevThoughts.filter(t => t.id !== thoughtId));
           // Selection will be handled by the useEffect
        } else {
          setActionError(err.response.data?.message || defaultMsg);
        }
      } else if (err instanceof Error) {
        setActionError(err.message || defaultMsg);
      } else {
        setActionError(defaultMsg);
      }
    } finally {
      setIsSubmitting(false);
    }
  }, [API_BASE_URL, mapApiThoughtToFrontend]); // Removed `thoughts` and `selectedThoughtId` from here to rely on state closure and specific updates


  const handleVoteOnReply = useCallback(async (thoughtId: string, replyId: string, voteType: VoteType) => {
    setIsSubmitting(true); setActionError(null);
    const apiVoteType = voteType === 'upvote' ? 'up' : 'down';
    try {
      const response = await axios.post<{ status: string; data: { reply: ApiReply | null } }>( // API might return null if deleted
        `${API_BASE_URL}/thoughts/${thoughtId}/replies/${replyId}/vote`, { voteType: apiVoteType }
      );
      const updatedReplyApi = response.data.data.reply;

      setThoughts(prevThoughts =>
        prevThoughts.map(thought => {
          if (thought.id === thoughtId) {
            let newReplies: Reply[];
            if (updatedReplyApi) {
              const updatedReplyFrontend = mapApiReplyToFrontend(updatedReplyApi);
              newReplies = (thought.replies || []).map(r => r.id === replyId ? updatedReplyFrontend : r);
            } else { 
              newReplies = (thought.replies || []).filter(r => r.id !== replyId);
            }
            return { ...thought, replies: sortReplies(newReplies) };
          }
          return thought;
        })
      );
    } catch (err)
     {
      console.error("Failed to vote on reply:", err);
      const defaultMsg = 'Failed to vote on reply.';
       if (axios.isAxiosError<ApiError>(err) && err.response) {
        if (err.response.status === 404) { 
          setThoughts(prevThoughts =>
            prevThoughts.map(thought => {
              if (thought.id === thoughtId) {
                return { ...thought, replies: sortReplies((thought.replies || []).filter(r => r.id !== replyId)) };
              }
              return thought;
            })
          );
        } else {
          setActionError(err.response.data?.message || defaultMsg);
        }
      } else if (err instanceof Error) {
        setActionError(err.message || defaultMsg);
      } else {
        setActionError(defaultMsg);
      }
    } finally {
      setIsSubmitting(false);
    }
  }, [API_BASE_URL, mapApiReplyToFrontend, sortReplies]);

  const handleSelectThought = useCallback((id: string) => {
    setSelectedThoughtId(id);
    setActionError(null); 
  }, []);

  const selectedThought = useMemo(() => {
    return selectedThoughtId ? sortedThoughts.find(t => t.id === selectedThoughtId) : null;
  }, [selectedThoughtId, sortedThoughts]);

  const toggleSidebar = () => setIsSidebarCollapsed(!isSidebarCollapsed);

  const sidebarWidth = isSidebarCollapsed ? 'w-0' : 'w-72 md:w-80 lg:w-96';
  const sidebarContentClass = isSidebarCollapsed ? 'opacity-0 w-0 overflow-hidden' : 'opacity-100';
  const mainContentClass = isSidebarCollapsed ? 'md:ml-8' : '';


  // --- JSX ---
  if (isLoadingInitial) {
    return <div className="h-screen flex items-center justify-center bg-base-300 text-xl text-base-content/70">Loading thoughts from the aether...</div>;
  }

  const displayError = initialLoadError || actionError;
  if (displayError && !isSubmitting) { 
     return (
      <div className="h-screen flex flex-col items-center justify-center bg-base-300 text-xl text-error p-8 text-center">
        <p className="mb-4">Oops! Something went wrong:</p>
        <p className="text-base bg-error/20 p-4 rounded-md mb-6">{displayError}</p>
        <button 
          onClick={() => { fetchThoughts({ selectNewest: true }); }}
          className="mt-6 px-6 py-2 bg-primary text-primary-content rounded-lg hover:bg-primary-focus"
        >
          Try Again
        </button>
      </div>
    );
  }

  return (
    <div className="h-screen flex flex-col bg-base-300">
      <ThemeSwitcher />
      <div className="flex flex-1 min-h-0">
        {/* Sidebar */}
        <div className={`${sidebarWidth} transition-all duration-300 ease-in-out border-r border-base-300 bg-base-100 flex flex-col relative`}>
          <div className="tooltip tooltip-right absolute -right-6 top-4 z-10" data-tip={isSidebarCollapsed ? 'Previous Thoughts' : 'Close'}>
            <button
              onClick={toggleSidebar}
              className="w-6 h-12 bg-base-100 border border-base-300 rounded-r-lg flex items-center justify-center hover:bg-base-200 transition-colors"
              aria-label={isSidebarCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
            >
              {isSidebarCollapsed ? <PanelLeftOpen className="h-4 w-4" /> : <PanelRightOpen className="h-4 w-4" />}
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
                      <p className="mt-2 text-base-content/70">No thoughts shared yet. Create one!</p>
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
        </div>

        {/* Main Content */}
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
              
              <ThoughtInput onAddThought={handleAddThought} disabled={isSubmitting} />
              
              {actionError && !isSubmitting && 
                (<div className="my-2 text-center text-sm text-error p-2 bg-error/10 rounded-md">{actionError}</div>)
              }

              {sortedThoughts.length === 0 && !selectedThought && !isLoadingInitial && !isSubmitting && ( 
                <div className="text-center py-10 px-6 bg-base-100 rounded-xl shadow-lg mt-8 w-full">
                  <svg className="mx-auto h-12 w-12 text-base-content/40" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                    <path vectorEffect="non-scaling-stroke" strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
                  </svg>
                  <h3 className="mt-2 text-lg font-medium text-base-content">No thoughts have been shared.</h3>
                  <p className="mt-1 text-sm text-base-content/70">Be the first one to cast a thought into the void!</p>
                </div>
              )}

              {sortedThoughts.length > 0 && !selectedThought && !isLoadingInitial && !isSubmitting && (
                <div className="text-center py-10 px-6 bg-base-100 rounded-xl shadow-lg mt-8">
                  <MessageSquareMore className="mx-auto h-12 w-12 text-base-content/40" />
                  <h3 className="mt-2 text-lg font-medium text-base-content">Select a thought</h3>
                  <p className="mt-1 text-sm text-base-content/70">Choose a thought from the sidebar to read and reply.</p>
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
                    isSubmitting={isSubmitting}
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
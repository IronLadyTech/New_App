import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';
import {
  subscribeToPosts,
  subscribeToLeaderboard,
  createPost,
  toggleLike,
  addComment,
} from '../services/firestore';
import { useAuth } from './AuthContext';
import { useChangeProbe } from '../utils/perfHud';

const EngagementContext = createContext(null);

export function EngagementProvider({ children }) {
  const { user, profile } = useAuth();
  const [posts, setPosts] = useState([]);
  const [leaderboard, setLeaderboard] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  // Live only while a community screen is open (Feed, Post, Create post, Leaderboard). Running for
  // everyone all the time, the top-20 listener re-sent learners' profiles to every phone each time
  // one of them was active.
  const [watchers, setWatchers] = useState(0);
  const watch = useCallback(() => {
    setWatchers((n) => n + 1);
    return () => setWatchers((n) => Math.max(0, n - 1));
  }, []);
  const live = watchers > 0;

  useEffect(() => {
    if (!live) return undefined;
    setLoading(true);
    const unsubPosts = subscribeToPosts(
      (data) => {
        setPosts(data);
        setLoading(false);
      },
      (err) => {
        setError(err.message);
        setLoading(false);
      }
    );
    const unsubBoard = subscribeToLeaderboard(
      setLeaderboard,
      (err) => setError(err.message)
    );
    return () => {
      unsubPosts();
      unsubBoard();
    };
  }, [live]);

  const publishPost = useCallback(
    async ({ title, content }) => {
      if (!user?.uid) throw new Error('Sign in to post');
      return createPost({
        authorId: user.uid,
        authorName: profile?.displayName || user.email,
        authorPhoto: profile?.photoURL || null,
        title,
        content,
      });
    },
    [user, profile]
  );

  const likePost = useCallback(
    async (postId) => {
      if (!user?.uid) throw new Error('Sign in to like');
      await toggleLike(postId, user.uid);
    },
    [user]
  );

  const commentOnPost = useCallback(
    async (postId, content) => {
      if (!user?.uid) throw new Error('Sign in to comment');
      await addComment(postId, {
        authorId: user.uid,
        authorName: profile?.displayName || user.email,
        content,
      });
    },
    [user, profile]
  );

  const value = useMemo(
    () => ({
      posts,
      leaderboard,
      loading,
      error,
      publishPost,
      likePost,
      commentOnPost,
      setError,
      watch,
    }),
    [posts, leaderboard, loading, error, publishPost, likePost, commentOnPost, watch]
  );

  useChangeProbe('Engagement', value);
  return (
    <EngagementContext.Provider value={value}>
      {children}
    </EngagementContext.Provider>
  );
}

export function useEngagement() {
  const ctx = useContext(EngagementContext);
  if (!ctx) throw new Error('useEngagement must be used within EngagementProvider');
  const { watch } = ctx;
  useEffect(() => watch(), [watch]);
  return ctx;
}

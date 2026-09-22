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

const EngagementContext = createContext(null);

export function EngagementProvider({ children }) {
  const { user, profile } = useAuth();
  const [posts, setPosts] = useState([]);
  const [leaderboard, setLeaderboard] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
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
  }, []);

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
    }),
    [posts, leaderboard, loading, error, publishPost, likePost, commentOnPost]
  );

  return (
    <EngagementContext.Provider value={value}>
      {children}
    </EngagementContext.Provider>
  );
}

export function useEngagement() {
  const ctx = useContext(EngagementContext);
  if (!ctx) throw new Error('useEngagement must be used within EngagementProvider');
  return ctx;
}

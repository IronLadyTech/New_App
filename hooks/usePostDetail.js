import { useEffect, useState } from 'react';
import { subscribeToComments, subscribeToPost } from '../services/firestore';

export function usePostDetail(postId) {
  const [post, setPost] = useState(null);
  const [comments, setComments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!postId) return undefined;
    setLoading(true);
    const unsubPost = subscribeToPost(
      postId,
      (data) => {
        setPost(data);
        setLoading(false);
      },
      (err) => {
        setError(err.message);
        setLoading(false);
      }
    );
    const unsubComments = subscribeToComments(
      postId,
      setComments,
      (err) => setError(err.message)
    );
    return () => {
      unsubPost();
      unsubComments();
    };
  }, [postId]);

  return { post, comments, loading, error };
}

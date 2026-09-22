import { useEffect, useState } from 'react';
import { subscribeToLessons, subscribeToCourse } from '../services/firestore';

export function useCourseDetail(courseId) {
  const [course, setCourse] = useState(null);
  const [lessons, setLessons] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!courseId) return undefined;
    setLoading(true);
    const unsubCourse = subscribeToCourse(
      courseId,
      (data) => {
        setCourse(data);
        setLoading(false);
      },
      (err) => {
        setError(err.message);
        setLoading(false);
      }
    );
    const unsubLessons = subscribeToLessons(
      courseId,
      setLessons,
      (err) => setError(err.message)
    );
    return () => {
      unsubCourse();
      unsubLessons();
    };
  }, [courseId]);

  return { course, lessons, loading, error };
}

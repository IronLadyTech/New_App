import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';
import {
  subscribeToCourses,
  subscribeToUserProgress,
  subscribeToAnnouncements,
  subscribeToEvents,
  enrollInCourse,
} from '../services/firestore';
import { filterAnnouncementsForUser } from '../utils/announcementUtils';
import {
  resolveVisibleEvents,
  upcomingEvents,
} from '../utils/eventVisibility';
import { learnerBatchId } from '../utils/programAccess';
import { useAuth } from './AuthContext';

const CoursesContext = createContext(null);

export function CoursesProvider({ children }) {
  const { user, profile } = useAuth();
  const [courses, setCourses] = useState([]);
  const [progress, setProgress] = useState([]);
  const [announcements, setAnnouncements] = useState([]);
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    setLoading(true);
    const unsubCourses = subscribeToCourses(
      (data) => {
        setCourses(data);
        setLoading(false);
      },
      (err) => {
        setError(err.message);
        setLoading(false);
      }
    );
    const unsubAnnouncements = subscribeToAnnouncements(
      setAnnouncements,
      (err) => setError(err.message)
    );
    const unsubEvents = subscribeToEvents(setEvents, (err) =>
      setError(err.message)
    );
    return () => {
      unsubCourses();
      unsubAnnouncements();
      unsubEvents();
    };
  }, []);

  useEffect(() => {
    if (!user?.uid) {
      setProgress([]);
      return undefined;
    }
    return subscribeToUserProgress(
      user.uid,
      setProgress,
      (err) => setError(err.message)
    );
  }, [user?.uid]);

  const enrolledCourses = useMemo(() => {
    const enrolledIds = new Set([
      ...(profile?.enrolledCourseIds || []),
      ...progress.map((p) => p.courseId),
    ]);
    return courses.filter((c) => enrolledIds.has(c.id));
  }, [courses, progress, profile?.enrolledCourseIds]);

  const progressByCourse = useMemo(() => {
    const map = {};
    progress.forEach((p) => {
      map[p.courseId] = p;
    });
    return map;
  }, [progress]);

  const visibleAnnouncements = useMemo(
    () => filterAnnouncementsForUser(announcements, user?.uid),
    [announcements, user?.uid]
  );

  const visibleEvents = useMemo(
    () =>
      resolveVisibleEvents(events, {
        batchId: learnerBatchId(profile),
      }),
    [events, profile]
  );

  const upcomingEventList = useMemo(
    () => upcomingEvents(visibleEvents, 5),
    [visibleEvents]
  );

  const enroll = useCallback(
    async (courseId) => {
      if (!user?.uid) throw new Error('Sign in to enroll');
      await enrollInCourse(user.uid, courseId);
    },
    [user?.uid]
  );

  const value = useMemo(
    () => ({
      courses,
      enrolledCourses,
      progress,
      progressByCourse,
      announcements,
      visibleAnnouncements,
      events,
      visibleEvents,
      upcomingEventList,
      loading,
      error,
      enroll,
      setError,
    }),
    [
      courses,
      enrolledCourses,
      progress,
      progressByCourse,
      announcements,
      visibleAnnouncements,
      events,
      visibleEvents,
      upcomingEventList,
      loading,
      error,
      enroll,
    ]
  );

  return (
    <CoursesContext.Provider value={value}>{children}</CoursesContext.Provider>
  );
}

export function useCourses() {
  const ctx = useContext(CoursesContext);
  if (!ctx) throw new Error('useCourses must be used within CoursesProvider');
  return ctx;
}

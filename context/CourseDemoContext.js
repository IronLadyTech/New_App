import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

const KEY = 'il_course_demo_done';
const SUB_KEY = 'il_course_demo_submissions';
const CourseDemoContext = createContext(null);

function taskKey(programId, taskId) {
  return `${programId}:${taskId}`;
}

export function CourseDemoProvider({ children }) {
  const [done, setDone] = useState({});
  const [submissions, setSubmissions] = useState({});

  useEffect(() => {
    AsyncStorage.getItem(KEY)
      .then((raw) => {
        if (raw) setDone(JSON.parse(raw));
      })
      .catch(() => {});
    AsyncStorage.getItem(SUB_KEY)
      .then((raw) => {
        if (raw) setSubmissions(JSON.parse(raw));
      })
      .catch(() => {});
  }, []);

  const markDone = useCallback((programId, taskId) => {
    setDone((prev) => {
      const next = { ...prev, [taskKey(programId, taskId)]: true };
      AsyncStorage.setItem(KEY, JSON.stringify(next)).catch(() => {});
      return next;
    });
  }, []);

  const isDone = useCallback(
    (programId, taskId) => !!done[taskKey(programId, taskId)],
    [done]
  );

  const getSubmission = useCallback(
    (programId, taskId) => submissions[taskKey(programId, taskId)] || null,
    [submissions]
  );

  const saveSubmission = useCallback((programId, taskId, data) => {
    const key = taskKey(programId, taskId);
    setSubmissions((prev) => {
      const next = {
        ...prev,
        [key]: { data, submittedAt: Date.now() },
      };
      AsyncStorage.setItem(SUB_KEY, JSON.stringify(next)).catch(() => {});
      return next;
    });
    markDone(programId, taskId);
  }, [markDone]);

  const value = useMemo(
    () => ({ done, isDone, markDone, getSubmission, saveSubmission }),
    [done, isDone, markDone, getSubmission, saveSubmission]
  );
  return <CourseDemoContext.Provider value={value}>{children}</CourseDemoContext.Provider>;
}

export function useCourseDemo() {
  return (
    useContext(CourseDemoContext) || {
      done: {},
      isDone: () => false,
      markDone: () => {},
      getSubmission: () => null,
      saveSubmission: () => {},
    }
  );
}

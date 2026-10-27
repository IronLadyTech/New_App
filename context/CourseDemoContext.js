import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { todayIsoIST } from '../utils/lepDailyPractice';
import { lepActiveDayKey } from '../utils/lepPracticeStreak';
import { recordPracticeDone } from '../services/activityTracking';
import { useAuth } from './AuthContext';

function storageKeys(uid) {
  const id = uid && uid !== 'preview' ? uid : 'guest';
  return {
    done: `il_course_demo_done:${id}`,
    sub: `il_course_demo_submissions:${id}`,
  };
}

const CourseDemoContext = createContext(null);

function taskKey(programId, taskId) {
  return `${programId}:${taskId}`;
}

export function CourseDemoProvider({ children }) {
  const { user } = useAuth();
  const uid = user?.uid || 'guest';
  const { done: doneKey, sub: subKey } = useMemo(() => storageKeys(uid), [uid]);
  const [done, setDone] = useState({});
  const [submissions, setSubmissions] = useState({});

  useEffect(() => {
    let cancelled = false;
    setDone({});
    setSubmissions({});
    (async () => {
      try {
        const [rawDone, rawSub] = await Promise.all([
          AsyncStorage.getItem(doneKey),
          AsyncStorage.getItem(subKey),
        ]);
        if (cancelled) return;
        if (rawDone) setDone(JSON.parse(rawDone));
        if (rawSub) setSubmissions(JSON.parse(rawSub));
      } catch {
        // ignore
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [doneKey, subKey]);

  const markDone = useCallback((programId, taskId) => {
    setDone((prev) => {
      const next = { ...prev, [taskKey(programId, taskId)]: true };
      AsyncStorage.setItem(doneKey, JSON.stringify(next)).catch(() => {});
      return next;
    });
    // Mirror to the server for the CX dashboard; no-op outside a real learner session.
    recordPracticeDone(programId, taskId);
  }, [doneKey]);

  const isDone = useCallback(
    (programId, taskId) => !!done[taskKey(programId, taskId)],
    [done]
  );

  const isDoneOnDay = useCallback(
    (programId, dayKey) => !!done[taskKey(programId, dayKey)],
    [done]
  );

  const markDoneOnDay = useCallback((programId, dayKey) => {
    markDone(programId, dayKey);
    if (programId === 'lep') {
      markDone(programId, lepActiveDayKey(todayIsoIST()));
    }
  }, [markDone]);

  const clearDone = useCallback((programId, taskId) => {
    const key = taskKey(programId, taskId);
    setDone((prev) => {
      if (!prev[key]) return prev;
      const next = { ...prev };
      delete next[key];
      AsyncStorage.setItem(doneKey, JSON.stringify(next)).catch(() => {});
      return next;
    });
  }, [doneKey]);

  const recordLepActiveDay = useCallback(
    (isoDate) => {
      if (!isoDate) return;
      markDone('lep', lepActiveDayKey(isoDate));
    },
    [markDone]
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
      AsyncStorage.setItem(subKey, JSON.stringify(next)).catch(() => {});
      return next;
    });
    markDone(programId, taskId);
  }, [markDone, subKey]);

  const value = useMemo(
    () => ({
      done,
      isDone,
      isDoneOnDay,
      markDone,
      markDoneOnDay,
      clearDone,
      recordLepActiveDay,
      getSubmission,
      saveSubmission,
    }),
    [done, isDone, isDoneOnDay, markDone, markDoneOnDay, clearDone, recordLepActiveDay, getSubmission, saveSubmission]
  );
  return <CourseDemoContext.Provider value={value}>{children}</CourseDemoContext.Provider>;
}

export function useCourseDemo() {
  return (
    useContext(CourseDemoContext) || {
      done: {},
      isDone: () => false,
      isDoneOnDay: () => false,
      markDone: () => {},
      markDoneOnDay: () => {},
      clearDone: () => {},
      recordLepActiveDay: () => {},
      getSubmission: () => null,
      saveSubmission: () => {},
    }
  );
}

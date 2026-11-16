import React, { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { todayIsoIST } from '../utils/lepDailyPractice';
import { lepActiveDayKey } from '../utils/lepPracticeStreak';
import { recordPracticeDone } from '../services/activityTracking';
import { useAuth } from './AuthContext';
import { useChangeProbe } from '../utils/perfHud';

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

  // Written to the phone only after this account's saved state has loaded (never an empty map over
  // it), a moment after the last change, once — not inside every state update.
  const loadedKeyRef = useRef(null);
  useEffect(() => {
    if (loadedKeyRef.current !== doneKey) return undefined;
    const t = setTimeout(() => AsyncStorage.setItem(doneKey, JSON.stringify(done)).catch(() => {}), 400);
    return () => clearTimeout(t);
  }, [done, doneKey]);
  useEffect(() => {
    if (loadedKeyRef.current !== doneKey) return undefined;
    const t = setTimeout(() => AsyncStorage.setItem(subKey, JSON.stringify(submissions)).catch(() => {}), 400);
    return () => clearTimeout(t);
  }, [submissions, subKey, doneKey]);

  useEffect(() => {
    let cancelled = false;
    loadedKeyRef.current = null;
    setDone({});
    setSubmissions({});
    (async () => {
      try {
        const [rawDone, rawSub] = await Promise.all([
          AsyncStorage.getItem(doneKey),
          AsyncStorage.getItem(subKey),
        ]);
        if (cancelled) return;
        // Merge: anything marked while the saved state was loading is kept.
        if (rawDone) setDone((prev) => ({ ...JSON.parse(rawDone), ...prev }));
        if (rawSub) setSubmissions((prev) => ({ ...JSON.parse(rawSub), ...prev }));
      } catch {
        // ignore
      } finally {
        if (!cancelled) loadedKeyRef.current = doneKey;
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [doneKey, subKey]);

  const markDone = useCallback((programId, taskId) => {
    const key = taskKey(programId, taskId);
    // Already done (e.g. "active today", marked on every practice): same object, so nothing
    // that reads it re-renders.
    setDone((prev) => (prev[key] ? prev : { ...prev, [key]: true }));
    // Mirror to the server for the CX dashboard; no-op outside a real learner session.
    recordPracticeDone(programId, taskId);
  }, []);

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
      return next;
    });
  }, []);

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

  const saveSubmission = useCallback((programId, taskId, data, opts) => {
    const key = taskKey(programId, taskId);
    setSubmissions((prev) => {
      return { ...prev, [key]: { data, submittedAt: Date.now() } };
    });
    if (!opts?.skipMarkDone) markDone(programId, taskId);
  }, [markDone]);

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
  useChangeProbe('CourseDemo', value);
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

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useAuth } from '../context/AuthContext';
import { usePrograms } from '../context/ProgramsContext';
import { useCourses } from '../context/CoursesContext';
import { useCourseDemo } from '../context/CourseDemoContext';
import { buildILGuideContext } from '../utils/ilGuideContext';
import {
  journeyProgressForProgram,
  nextJourneyTask,
  primaryProgramForGuide,
  upcomingUnlocks,
} from '../utils/ilGuideJourney';
import { useLearnerCmsBatch } from './useLearnerCmsBatch';
import { phaseFlowFromBatch } from '../utils/phaseUnlock';
import { todayIsoIST } from '../utils/lepDailyPractice';
import { makeTaskDoneChecker } from '../utils/taskDone';
import { fetchILGuideWhisper } from '../services/ilGuide';
import { IL_GUIDE_SURFACES } from '../constants/ilGuide';
import { updateUserProfile } from '../services/firestore';
import { markILGuideOnboarded } from '../services/ilGuide';

const DISMISS_KEY = (uid, surface, id) => `ilguide:dismiss:${uid}:${surface}:${id}`;

export function useILGuideWhisper(surface, extraContext = null) {
  const { user, profile, isStaff, patchProfile } = useAuth();
  const {
    enrolledPrograms,
    progressByProgram,
    tasksByProgram,
    subsByProgram,
    getTaskSubmission,
  } = usePrograms();
  const { visibleAnnouncements, upcomingEventList } = useCourses();

  const [whisper, setWhisper] = useState(null);
  const [loading, setLoading] = useState(true);
  const [hidden, setHidden] = useState(false);
  const whisperRef = useRef(null);
  whisperRef.current = whisper;
  const demo = useCourseDemo();

  const isGuest = profile?.role === 'guest';
  const guideProgramId = useMemo(
    () => primaryProgramForGuide(profile),
    [profile]
  );
  const taskIsDone = useMemo(
    () => makeTaskDoneChecker({ isDone: demo.isDone, getTaskSubmission }),
    [demo.isDone, getTaskSubmission, demo.done, subsByProgram]
  );
  // Her batch dates: the same unlock rule My Program uses, so the guide never sends her
  // to a locked task and can say when the next ones open.
  const { batch: guideBatch } = useLearnerCmsBatch(guideProgramId);
  const today = todayIsoIST();
  const phaseFlow = useMemo(
    () => phaseFlowFromBatch(guideProgramId, guideBatch, today),
    [guideProgramId, guideBatch, today]
  );
  const journeyProgress = useMemo(
    () => journeyProgressForProgram(guideProgramId, profile, taskIsDone, phaseFlow),
    [guideProgramId, profile, taskIsDone, phaseFlow]
  );
  const journeyNext = useMemo(
    () => nextJourneyTask(guideProgramId, profile, taskIsDone, phaseFlow),
    [guideProgramId, profile, taskIsDone, phaseFlow]
  );
  const unlocksKey = JSON.stringify(upcomingUnlocks(guideProgramId, profile, phaseFlow));
  const unlocks = useMemo(() => JSON.parse(unlocksKey), [unlocksKey]);
  const firstLogin =
    surface === IL_GUIDE_SURFACES.ONBOARD ||
    (surface === IL_GUIDE_SURFACES.HOME && !profile?.ilGuideOnboarded);

  // Stable key — ignore noisy fields (streak ticks) so the card does not re-fetch and swap.
  const extraKey = useMemo(() => {
    if (!extraContext || typeof extraContext !== 'object') return '';
    try {
      const ctx = extraContext;
      const slim = {
        programId: ctx.programId,
        regStatus: ctx.regStatus,
        cmsBatchId: ctx.cmsBatchId,
        day1Date: ctx.day1Date,
        journeyNextTask: ctx.journeyNextTask,
        openPractice: ctx.openPractice,
        lepDues: Array.isArray(ctx.lepDues)
          ? ctx.lepDues.map((d) => ({
              taskId: d?.taskId,
              done: d?.done,
              urgent: d?.urgent,
              title: d?.title,
            }))
          : null,
      };
      return JSON.stringify(slim);
    } catch {
      return '';
    }
  }, [extraContext]);
  const extraStable = useMemo(() => {
    try {
      return extraContext && typeof extraContext === 'object' ? JSON.parse(extraKey) : null;
    } catch {
      return null;
    }
  }, [extraKey]);

  const load = useCallback(async () => {
    if (!user?.uid || isGuest || isStaff) {
      setLoading(false);
      setWhisper(null);
      return;
    }

    if (
      surface === IL_GUIDE_SURFACES.ONBOARD &&
      profile?.ilGuideOnboarded
    ) {
      setLoading(false);
      setWhisper(null);
      setHidden(true);
      return;
    }

    // Keep the current message on screen — only show loading on the first fetch.
    if (!whisperRef.current) setLoading(true);
    try {
      const context = buildILGuideContext({
        user,
        profile,
        enrolledPrograms,
        progressByProgram,
        tasksByProgram,
        subsByProgram,
        announcements: visibleAnnouncements,
        upcomingEventList,
        surface:
          surface === IL_GUIDE_SURFACES.ONBOARD
            ? IL_GUIDE_SURFACES.ONBOARD
            : surface,
        firstLogin: Boolean(firstLogin && surface === IL_GUIDE_SURFACES.ONBOARD),
        journeyProgress,
        journeyNextTask: journeyNext,
        primaryProgramId: guideProgramId,
        upcomingUnlocks: unlocks,
        ...(extraStable && typeof extraStable === 'object' ? extraStable : {}),
      });

      const result = await fetchILGuideWhisper(context);
      if (!result) {
        // Turned off in the admin CMS for this surface.
        if (!whisperRef.current) setWhisper(null);
        return;
      }
      const dismissed =
        (await AsyncStorage.getItem(
          DISMISS_KEY(user.uid, surface, result.id)
        )) === '1';

      if (dismissed) {
        setWhisper(null);
        setHidden(true);
      } else {
        const prev = whisperRef.current;
        if (
          prev?.id === result.id &&
          prev?.message === result.message
        ) {
          setHidden(false);
        } else {
          setWhisper(result);
          setHidden(false);
        }
      }
    } catch {
      if (!whisperRef.current) setWhisper(null);
    } finally {
      setLoading(false);
    }
  }, [
    user,
    profile,
    enrolledPrograms,
    progressByProgram,
    tasksByProgram,
    subsByProgram,
    visibleAnnouncements,
    upcomingEventList,
    surface,
    firstLogin,
    isGuest,
    isStaff,
    journeyProgress,
    journeyNext,
    guideProgramId,
    unlocks,
    extraStable,
  ]);

  useEffect(() => {
    load();
  }, [load]);

  const dismiss = useCallback(async () => {
    if (!user?.uid || !whisper?.id) {
      setHidden(true);
      return;
    }
    await AsyncStorage.setItem(
      DISMISS_KEY(user.uid, surface, whisper.id),
      '1'
    );
    setHidden(true);
    setWhisper(null);
  }, [user?.uid, whisper?.id, surface]);

  const completeOnboard = useCallback(async () => {
    patchProfile({ ilGuideOnboarded: true });
    if (!user?.uid) return;
    try {
      await markILGuideOnboarded(user.uid);
    } catch {
      // Local cache is optional. The in-memory flag already opens the app.
    }
    try {
      await updateUserProfile(user.uid, { ilGuideOnboarded: true });
    } catch {
      // Firestore can reject the write. The session still continues.
    }
    try {
      await dismiss();
    } catch {
      // Dismiss only hides the whisper. The profile flag already closed the gate.
    }
  }, [user?.uid, dismiss, patchProfile]);

  return {
    whisper,
    loading,
    hidden,
    dismiss,
    completeOnboard,
    isOnboard: firstLogin && surface === IL_GUIDE_SURFACES.ONBOARD,
    reload: load,
  };
}

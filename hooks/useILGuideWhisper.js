import { useCallback, useEffect, useRef, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useAuth } from '../context/AuthContext';
import { usePrograms } from '../context/ProgramsContext';
import { useCourses } from '../context/CoursesContext';
import { buildILGuideContext } from '../utils/ilGuideContext';
import { fetchILGuideWhisper } from '../services/ilGuide';
import { IL_GUIDE_SURFACES } from '../constants/ilGuide';
import { updateUserProfile } from '../services/firestore';
import { markILGuideOnboarded } from '../services/ilGuide';

const DISMISS_KEY = (uid, surface, id) => `ilguide:dismiss:${uid}:${surface}:${id}`;

export function useILGuideWhisper(surface) {
  const { user, profile, isStaff, patchProfile } = useAuth();
  const { enrolledPrograms, progressByProgram, tasksByProgram, subsByProgram } =
    usePrograms();
  const { visibleAnnouncements, upcomingEventList } = useCourses();

  const [whisper, setWhisper] = useState(null);
  const [loading, setLoading] = useState(true);
  const [hidden, setHidden] = useState(false);
  const loadedRef = useRef(false);

  const isGuest = profile?.role === 'guest';
  const firstLogin =
    surface === IL_GUIDE_SURFACES.ONBOARD ||
    (surface === IL_GUIDE_SURFACES.HOME && !profile?.ilGuideOnboarded);

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

    setLoading(true);
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
      });

      const result = await fetchILGuideWhisper(context);
      const dismissed =
        (await AsyncStorage.getItem(
          DISMISS_KEY(user.uid, surface, result.id)
        )) === '1';

      if (dismissed) {
        setWhisper(null);
        setHidden(true);
      } else {
        setWhisper(result);
        setHidden(false);
      }
    } catch {
      setWhisper(null);
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
  ]);

  useEffect(() => {
    if (loadedRef.current) return;
    loadedRef.current = true;
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

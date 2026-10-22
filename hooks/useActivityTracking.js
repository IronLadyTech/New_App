import { useEffect, useMemo } from 'react';
import { AppState } from 'react-native';
import { useAuth } from '../context/AuthContext';
import { recordAppOpen, setActivityContext } from '../services/activityTracking';

/** Turns tracking on for a real signed-in learner and records an app open on each foreground. */
export function useActivityTracking() {
  const { user, accountProfile, journey, isPreview, demo } = useAuth();
  // Demo journeys and previews show a fake profile — never count them.
  const uid = user?.uid && user.uid !== 'preview' && !journey && !isPreview && !demo ? user.uid : null;
  const access = accountProfile?.programAccess;
  const batchKey = JSON.stringify(
    Object.fromEntries(
      Object.entries(access || {})
        .map(([pid, a]) => [pid, a?.batchId || null])
        .filter(([, id]) => id)
    )
  );
  const batchIds = useMemo(() => JSON.parse(batchKey), [batchKey]);

  useEffect(() => {
    setActivityContext({ uid, batchIds });
    if (uid) recordAppOpen();
  }, [uid, batchIds]);

  useEffect(() => {
    const sub = AppState.addEventListener('change', (state) => {
      if (state === 'active') recordAppOpen();
    });
    return () => sub.remove();
  }, []);

  useEffect(() => () => setActivityContext({ uid: null }), []);
}

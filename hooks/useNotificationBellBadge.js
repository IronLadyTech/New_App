import { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { subscribeToParticipantNotifications } from '../services/participantNotifications';

/**
 * One listener for the whole app. Every header used to open its own (one per tab, Profile, and any
 * screen with a header), each reading her whole inbox and re-rendering on every change to it.
 * Now the first header starts it, the last one to go stops it, and a header re-renders only when
 * the badge itself turns on or off.
 */
const store = { uid: null, unsub: null, hasUnread: false, users: new Set() };

function emit(next) {
  if (next === store.hasUnread) return;
  store.hasUnread = next;
  store.users.forEach((fn) => fn(next));
}

function start(uid) {
  if (store.uid === uid && store.unsub) return;
  store.unsub?.();
  store.uid = uid;
  store.hasUnread = false;
  store.unsub = subscribeToParticipantNotifications(
    uid,
    (docs) => emit(docs.some((d) => d.read !== true)),
    () => emit(false),
    50
  );
}

function stop() {
  store.unsub?.();
  store.unsub = null;
  store.uid = null;
  store.hasUnread = false;
}

/** True when the signed-in learner has unread Firestore inbox rows. */
export function useNotificationBellBadge() {
  const { user, isGuest } = useAuth();
  const uid = !isGuest && user?.uid && user.uid !== 'preview' ? user.uid : null;
  const [hasUnread, setHasUnread] = useState(() => (uid && store.uid === uid ? store.hasUnread : false));

  useEffect(() => {
    if (!uid) {
      setHasUnread(false);
      return undefined;
    }
    start(uid);
    setHasUnread(store.hasUnread);
    store.users.add(setHasUnread);
    return () => {
      store.users.delete(setHasUnread);
      if (!store.users.size) stop();
    };
  }, [uid]);

  return Boolean(uid) && hasUnread;
}

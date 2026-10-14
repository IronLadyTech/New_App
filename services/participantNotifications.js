import {
  collection,
  doc,
  onSnapshot,
  orderBy,
  query,
  serverTimestamp,
  updateDoc,
  writeBatch,
} from 'firebase/firestore';
import { db } from './firebase';
import { USER_NOTIFICATIONS } from '../constants/notifications';

function col(uid) {
  return collection(db, 'users', uid, USER_NOTIFICATIONS);
}

export function subscribeToParticipantNotifications(uid, onData, onError) {
  if (!uid) {
    onData([]);
    return () => {};
  }
  const q = query(col(uid), orderBy('createdAt', 'desc'));
  return onSnapshot(
    q,
    (snap) => onData(snap.docs.map((d) => ({ id: d.id, ...d.data() }))),
    onError
  );
}

export async function markNotificationRead(uid, notificationId) {
  if (!uid || !notificationId) return;
  await updateDoc(doc(db, 'users', uid, USER_NOTIFICATIONS, notificationId), {
    read: true,
    readAt: serverTimestamp(),
  });
}

export async function markAllNotificationsRead(uid, ids) {
  if (!uid || !ids?.length) return;
  const batch = writeBatch(db);
  ids.forEach((id) => {
    batch.update(doc(db, 'users', uid, USER_NOTIFICATIONS, id), {
      read: true,
      readAt: serverTimestamp(),
    });
  });
  await batch.commit();
}

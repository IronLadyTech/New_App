import { useAuth } from '../context/AuthContext';
import { useParticipantNotifications } from './useParticipantNotifications';

/** True when the signed-in learner has unread Firestore inbox rows. */
export function useNotificationBellBadge() {
  const { user, isGuest } = useAuth();
  const uid = !isGuest && user?.uid && user.uid !== 'preview' ? user.uid : null;
  const { unread } = useParticipantNotifications(uid);
  return !!uid && unread > 0;
}

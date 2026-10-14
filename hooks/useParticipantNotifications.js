import { useEffect, useMemo, useState } from 'react';
import {
  markAllNotificationsRead,
  markNotificationRead,
  subscribeToParticipantNotifications,
} from '../services/participantNotifications';
import { NOTIFICATION_KIND } from '../constants/notifications';

function formatAgo(ts) {
  if (!ts) return '';
  const ms = typeof ts?.toMillis === 'function' ? ts.toMillis() : ts;
  if (!ms) return '';
  const diff = Date.now() - ms;
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'Now';
  if (mins < 60) return `${mins}m`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 48) return `${hrs}h`;
  const days = Math.floor(hrs / 24);
  return `${days}d`;
}

function mapRow(doc) {
  return {
    id: doc.id,
    kind: doc.kind || NOTIFICATION_KIND.ATTENTION,
    icon: doc.icon || 'notifications',
    title: doc.title || 'Notification',
    meta: doc.meta || doc.body || '',
    action: doc.action || '',
    ago: formatAgo(doc.createdAt),
    read: doc.read === true,
    go: doc.go || null,
    eventCode: doc.eventCode || null,
  };
}

export function useParticipantNotifications(uid) {
  const [rows, setRows] = useState([]);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(!!uid);

  useEffect(() => {
    if (!uid) {
      setRows([]);
      setLoading(false);
      return undefined;
    }
    setLoading(true);
    return subscribeToParticipantNotifications(
      uid,
      (docs) => {
        setRows(docs.map(mapRow));
        setLoading(false);
      },
      (e) => {
        setError(e.message);
        setLoading(false);
      }
    );
  }, [uid]);

  const items = useMemo(() => rows, [rows]);
  const unread = useMemo(() => items.filter((n) => !n.read).length, [items]);

  const markRead = async (id) => {
    await markNotificationRead(uid, id);
  };

  const markAllRead = async () => {
    const unreadIds = items.filter((n) => !n.read).map((n) => n.id);
    await markAllNotificationsRead(uid, unreadIds);
  };

  return { items, unread, loading, error, markRead, markAllRead };
}

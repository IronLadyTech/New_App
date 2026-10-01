/** Announcement visibility — mirrors web LMS announcementService. */

export function getExpiresAtMillis(announcement) {
  const ts = announcement?.expiresAt;
  if (!ts) return null;
  if (typeof ts.toMillis === 'function') return ts.toMillis();
  if (typeof ts === 'number') return ts;
  const d = new Date(ts);
  return Number.isNaN(d.getTime()) ? null : d.getTime();
}

export function isAnnouncementActive(announcement, now = Date.now()) {
  const expires = getExpiresAtMillis(announcement);
  if (expires == null) return true;
  return expires > now;
}

export function isAnnouncementVisibleToUser(announcement, userId) {
  if (!userId || !isAnnouncementActive(announcement)) return false;
  const audience = announcement.audience || 'all';
  const tagged = Array.isArray(announcement.taggedUserIds)
    ? announcement.taggedUserIds
    : [];
  if (audience === 'tagged') return tagged.includes(userId);
  return true;
}

export function filterAnnouncementsForUser(announcements, userId) {
  return (announcements || []).filter((a) =>
    isAnnouncementVisibleToUser(a, userId)
  );
}

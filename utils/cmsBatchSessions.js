import { splitBatchSessions } from './eventVisibility';

function sessionAsCalendarEvent(session, batch) {
  if (!session?.date || !session?.title) return null;
  const detail = [session.weekLabel, session.code].filter(Boolean).join(' · ');
  return {
    id: `cms-${batch?.id || 'batch'}-${session.code}`,
    date: session.date,
    time: session.startTime || '',
    endTime: session.endTime || '',
    title: session.title,
    description: detail,
    linkUrl: session.joinLink || '',
    meetingUrl: session.joinLink || '',
    batchId: batch?.id || '',
    batchName: batch?.name || '',
  };
}

/** Core + optional sessions from `cms_batches` → same cards as LMS calendar events. */
export function splitCmsBatchSessions(batch, { now = new Date(), coreOnly = false } = {}) {
  if (!batch?.sessions?.length) {
    return { upcoming: [], done: [] };
  }
  const sessions = batch.sessions.filter((s) => !coreOnly || s.kind === 'core');
  const events = sessions.map((s) => sessionAsCalendarEvent(s, batch)).filter(Boolean);
  return splitBatchSessions(events, { batchId: batch.id, batchName: batch.name, now });
}

/** Nearest upcoming core session (for IL Guide). */
export function nextCmsBatchSession(batch, now = new Date()) {
  const { upcoming } = splitCmsBatchSessions(batch, { now, coreOnly: true });
  return upcoming[0] || null;
}

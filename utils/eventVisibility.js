/** Which calendar events a learner sees — mirrors web LMS. */

export function isGlobalEvent(event) {
  if (!event) return false;
  if (event.audience === 'batch' && event.batchId) return false;
  return !event.batchId || event.audience === 'all' || !event.audience;
}

export function isBatchEvent(event, batchId) {
  return Boolean(batchId && event?.batchId === batchId);
}

export function filterEventsForLearner(events, { batchId } = {}) {
  return (events || []).filter(
    (ev) => isGlobalEvent(ev) || isBatchEvent(ev, batchId)
  );
}

export function resolveVisibleEvents(events, { batchId } = {}) {
  return filterEventsForLearner(events, { batchId: batchId || '' });
}

export function formatEventWhen(event) {
  if (!event?.date) return '';
  const parts = [event.date];
  if (event.time) parts.push(event.time);
  return parts.join(' · ');
}

const MONTHS = ['JAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUN', 'JUL', 'AUG', 'SEP', 'OCT', 'NOV', 'DEC'];
const MONTHS_SHORT = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
const WEEKDAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

function istDateKey(now = new Date()) {
  return new Intl.DateTimeFormat('en-CA', {
    timeZone: 'Asia/Kolkata',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).format(now);
}

function calendarParts(iso) {
  const match = /^(\d{4})-(\d{2})-(\d{2})/.exec(String(iso || ''));
  if (!match) return null;
  const year = Number(match[1]);
  const month = Number(match[2]);
  const day = Number(match[3]);
  const date = new Date(year, month - 1, day);
  if (date.getFullYear() !== year || date.getMonth() !== month - 1 || date.getDate() !== day) return null;
  return { year, month, day, date };
}

function timeRange(event) {
  const start = String(event?.time || '').trim();
  const end = String(event?.endTime || '').trim();
  if (!start && !end) return null;
  const range = start && end ? `${start} – ${end}` : start || end;
  if (/ist|am|pm|gmt|utc/i.test(range)) return range;
  return `${range} IST`;
}

function sessionWhen(event) {
  const detail = String(event?.description || '').trim();
  return [timeRange(event), detail].filter(Boolean).join(' · ') || null;
}

function sessionCard(event) {
  const parts = calendarParts(event.date);
  return {
    id: event.id,
    mon: parts ? MONTHS[parts.month - 1] : null,
    day: parts ? String(parts.day) : null,
    title: String(event.title).trim(),
    meta: sessionWhen(event),
    linkUrl: event.linkUrl || event.meetingUrl || null,
    doneMeta: [
      parts ? `${WEEKDAYS[parts.date.getDay()]} ${parts.day} ${MONTHS_SHORT[parts.month - 1]}` : null,
      sessionWhen(event),
    ]
      .filter(Boolean)
      .join(' · '),
  };
}

/**
 * LEP Sessions tab: only this learner's batch calendar rows.
 * Events with no date or title are skipped. Global events are not mixed in.
 */
export function splitBatchSessions(events, { batchId, batchName, now = new Date() } = {}) {
  const id = batchId && batchId !== 'default' ? String(batchId) : '';
  const name = batchName && batchName !== 'default' ? String(batchName).trim() : '';
  const today = istDateKey(now);
  const mine = (events || []).filter((event) => {
    if (!event?.title || !calendarParts(event.date)) return false;
    if (id && event.batchId === id) return true;
    if (name && event.batchName && String(event.batchName).trim() === name) return true;
    return false;
  });

  const upcoming = [];
  const done = [];
  mine.forEach((event) => {
    const card = sessionCard(event);
    if (String(event.date).slice(0, 10) >= today) upcoming.push(card);
    else done.push(card);
  });

  upcoming.sort((a, b) => {
    const eventA = mine.find((event) => event.id === a.id);
    const eventB = mine.find((event) => event.id === b.id);
    return `${eventA.date} ${eventA.time || ''}`.localeCompare(`${eventB.date} ${eventB.time || ''}`);
  });
  done.sort((a, b) => {
    const eventA = mine.find((event) => event.id === a.id);
    const eventB = mine.find((event) => event.id === b.id);
    return `${eventB.date} ${eventB.time || ''}`.localeCompare(`${eventA.date} ${eventA.time || ''}`);
  });

  return { upcoming, done };
}

export function upcomingEvents(events, limit = 5) {
  const today = new Date().toISOString().slice(0, 10);
  return [...(events || [])]
    .filter((e) => e.date && e.date >= today)
    .sort((a, b) => {
      const da = `${a.date} ${a.time || ''}`;
      const db = `${b.date} ${b.time || ''}`;
      return da.localeCompare(db);
    })
    .slice(0, limit);
}

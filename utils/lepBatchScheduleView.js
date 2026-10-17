import { buildLepDueWeek } from './lepBatchDueWeek';
import { nextCmsBatchSession, resolveCmsBatchSessions } from './cmsBatchSessions';

const DOW = ['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'];

function istDateKey(now = new Date()) {
  return new Intl.DateTimeFormat('en-CA', {
    timeZone: 'Asia/Kolkata',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).format(now);
}

function parseLocal(iso) {
  const [y, m, d] = String(iso).split('-').map(Number);
  return new Date(y, m - 1, d);
}

function addDaysIso(iso, days) {
  const d = parseLocal(iso);
  d.setDate(d.getDate() + days);
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

function formatTime12(hhmm) {
  const [h, m] = String(hhmm || '00:00').split(':').map((x) => parseInt(x, 10));
  const am = h < 12;
  const hour = h % 12 || 12;
  return `${hour}:${String(m).padStart(2, '0')} ${am ? 'AM' : 'PM'}`;
}

/** Sessions for schedule UI — template times + batch Day 1; CMS Zoom when set. */
function liveSessions(batch, day1Iso = '') {
  return resolveCmsBatchSessions(batch, { day1Iso });
}

function sessionLiveWindow(session, now = new Date()) {
  const start = Date.parse(session?.startAt);
  const end = Date.parse(session?.endAt);
  const t = now.getTime();
  if (!Number.isFinite(start) || !Number.isFinite(end)) return { live: false, minsToStart: null };
  const live = t >= start - 15 * 60 * 1000 && t <= end;
  const minsToStart = Math.round((start - t) / 60000);
  return { live, minsToStart };
}

function liveTag(session, now) {
  const { live, minsToStart } = sessionLiveWindow(session, now);
  if (live) return 'LIVE · ONLINE';
  if (minsToStart != null && minsToStart > 0 && minsToStart <= 180) {
    const h = Math.floor(minsToStart / 60);
    const m = minsToStart % 60;
    if (h > 0) return `LIVE · ONLINE · IN ${h}H ${m}M`;
    return `LIVE · ONLINE · IN ${m}M`;
  }
  return session?.kind === 'optional' ? 'OPTIONAL · ONLINE' : 'LIVE · ONLINE';
}

function sessionHours(startTime, endTime) {
  const parse = (t) => {
    const [h, m] = String(t || '0:0').split(':').map((x) => parseInt(x, 10) || 0);
    return h + m / 60;
  };
  const hrs = parse(endTime) - parse(startTime);
  return hrs > 0 ? hrs : 1;
}

function sessionDurationLabel(startTime, endTime) {
  const hrs = sessionHours(startTime, endTime);
  if (hrs < 1) return `${Math.round(hrs * 60)} min`;
  if (Number.isInteger(hrs)) return `${hrs} hr${hrs === 1 ? '' : 's'}`;
  return `${hrs.toFixed(1)} hrs`;
}

function sessionToScheduleItem(session, batch, now) {
  const { live } = sessionLiveWindow(session, now);
  const range = [formatTime12(session.startTime), formatTime12(session.endTime)].join(' – ');
  const batchName = batch?.name ? `${batch.name}` : 'LEP';
  const durHrs = sessionHours(session.startTime, session.endTime);
  const dur = sessionDurationLabel(session.startTime, session.endTime);
  return {
    id: session.code,
    time: formatTime12(session.startTime),
    tag: liveTag(session, now),
    title: session.title,
    meta: dur ? `${batchName} · ${dur}` : `${batchName} · ${range} IST`,
    day: null,
    dateIso: session.date || '',
    startTime: session.startTime || '',
    endTime: session.endTime || '',
    durationHours: Math.max(1, Math.round(durHrs)),
    live,
    joinLink: session.joinLink || '',
    code: session.code,
  };
}

function dayHeading(iso, now = new Date()) {
  const today = istDateKey(now);
  const d = parseLocal(iso);
  const label = `${DOW[d.getDay()]} ${d.getDate()}`;
  return iso === today ? `TODAY · ${label}` : label;
}

/**
 * Week agenda sections for Schedule screen (design: TODAY · WED 23, then THU 24…).
 * Only days that have at least one item are returned.
 */
export function buildScheduleWeekAgenda(batch, weekDays, now = new Date(), day1Iso = '') {
  return (weekDays || [])
    .map((day) => {
      const items = buildScheduleDay(batch, day.iso, now, day1Iso);
      if (!items.length) return null;
      return { iso: day.iso, heading: dayHeading(day.iso, now), items };
    })
    .filter(Boolean);
}

/**
 * Full batch agenda: every day that has a session/deadline, sorted ascending.
 * Pass fromIso to start from a selected day (inclusive).
 */
export function buildScheduleFullAgenda(batch, now = new Date(), day1Iso = '', fromIso = '') {
  const sessions = liveSessions(batch, day1Iso);
  const dates = new Set(sessions.map((s) => s.date).filter(Boolean));
  // Include due-week deadline dates that fall on orientation / NSDC / Day 1.
  const day1 = String(batch?.day1Date || day1Iso || '').slice(0, 10);
  if (day1) {
    const orient = batch?.orientationDate || addDaysIso(day1, -2);
    const nsdc = orient ? addDaysIso(orient, 1) : null;
    [orient, nsdc, day1].filter(Boolean).forEach((iso) => dates.add(iso));
  }
  const start = fromIso || istDateKey(now);
  return [...dates]
    .filter((iso) => iso >= start)
    .sort()
    .map((iso) => {
      const items = buildScheduleDay(batch, iso, now, day1Iso);
      if (!items.length) return null;
      return { iso, heading: dayHeading(iso, now), items };
    })
    .filter(Boolean);
}

/** Monday of the IST week that contains iso (or today). */
export function weekMondayIso(isoOrNow) {
  const iso = typeof isoOrNow === 'string' ? isoOrNow : istDateKey(isoOrNow);
  const d = parseLocal(iso);
  const dow = d.getDay();
  const mondayOffset = dow === 0 ? -6 : 1 - dow;
  return addDaysIso(iso, mondayOffset);
}

/** Week strip for a given week Monday (Mon→Sun). weekOffset shifts by whole weeks. */
export function buildScheduleWeekStrip(now = new Date(), selectedIso = null, weekOffset = 0) {
  const today = istDateKey(now);
  const sel = selectedIso || today;
  const anchor = weekMondayIso(sel);
  const start = addDaysIso(anchor, weekOffset * 7);
  // If selected day is outside this strip, still highlight nothing; strip is independent.
  const days = [];
  for (let i = 0; i < 7; i += 1) {
    const iso = addDaysIso(start, i);
    const d = parseLocal(iso);
    days.push({
      iso,
      d: String(d.getDate()),
      w: DOW[d.getDay()],
      on: iso === sel,
      isToday: iso === today,
      hasSession: false,
      weekStart: start,
    });
  }
  return days;
}

export { addDaysIso as scheduleAddDaysIso };

export function markDaysWithSessions(strip, batch, day1Iso = '') {
  const sessions = liveSessions(batch, day1Iso);
  if (!sessions.length) return strip;
  const dates = new Set(sessions.map((s) => s.date).filter(Boolean));
  return strip.map((day) => ({ ...day, hasSession: dates.has(day.iso) }));
}

export function scheduleItemsForDate(batch, dateIso, now = new Date(), day1Iso = '') {
  if (!dateIso) return [];
  const sessions = liveSessions(batch, day1Iso)
    .filter((s) => s.date === dateIso)
    .sort((a, b) => String(a.startTime).localeCompare(String(b.startTime)));
  return sessions.map((s) => sessionToScheduleItem(s, batch, now));
}

/** Due-week tasks as deadline rows on orientation / NSDC / Day 1. */
export function deadlineItemsForDate(batch, dateIso, now = new Date(), day1Iso = '') {
  const day1 = String(batch?.day1Date || day1Iso || '').slice(0, 10);
  if (!day1 || !dateIso) return [];
  const batchForDues = { ...(batch || {}), day1Date: day1 };
  const { items } = buildLepDueWeek(batchForDues, now);
  const orient = batchForDues.orientationDate || addDaysIso(day1, -2);
  const nsdc = orient ? addDaysIso(orient, 1) : null;
  const map = {
    'lep-prep-codesef-sheet': orient,
    'lep-prep-nsdc': nsdc,
    'lep-orientation-access': day1,
  };
  return items
    .filter((item) => map[item.taskId] === dateIso)
    .map((item) => ({
      id: `due-${item.taskId}`,
      time: item.taskId === 'lep-orientation-access' ? 'All day' : '11:59 AM',
      tag: 'DEADLINE',
      title: item.title,
      meta: `${item.kind} · ${item.due}`,
      day: null,
      dateIso,
      live: false,
      joinLink: '',
      taskId: item.taskId,
    }));
}

export function buildScheduleDay(batch, dateIso, now = new Date(), day1Iso = '') {
  const sessions = scheduleItemsForDate(batch, dateIso, now, day1Iso);
  const deadlines = deadlineItemsForDate(batch, dateIso, now, day1Iso);
  return [...sessions, ...deadlines].sort((a, b) => {
    if (a.tag === 'DEADLINE' && b.tag !== 'DEADLINE') return 1;
    if (b.tag === 'DEADLINE' && a.tag !== 'DEADLINE') return -1;
    return String(a.time).localeCompare(String(b.time));
  });
}

export function scheduleRecommendation(batch, now = new Date(), day1Iso = '') {
  const next = nextCmsBatchSession(batch || (day1Iso ? { day1Date: day1Iso } : null), now, { day1Iso });
  if (!next) return null;
  return {
    title: next.title,
    when: next.meta || next.doneMeta,
    joinLink: next.linkUrl || '',
  };
}

export { istDateKey as scheduleTodayIso };

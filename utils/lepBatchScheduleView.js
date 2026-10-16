import { buildLepDueWeek } from './lepBatchDueWeek';
import { nextCmsBatchSession } from './cmsBatchSessions';

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
    if (h > 0) return `LIVE · ONLINE · IN ${h} H ${m} M`;
    return `LIVE · ONLINE · IN ${m} M`;
  }
  return session?.kind === 'optional' ? 'OPTIONAL · ONLINE' : 'LIVE · ONLINE';
}

function sessionToScheduleItem(session, batch, now) {
  const { live } = sessionLiveWindow(session, now);
  const range = [formatTime12(session.startTime), formatTime12(session.endTime)].join(' – ');
  const batchName = batch?.name ? `${batch.name}` : 'LEP';
  return {
    id: session.code,
    time: formatTime12(session.startTime),
    tag: liveTag(session, now),
    title: session.title,
    meta: `${batchName} · ${range} IST`,
    day: null,
    live,
    joinLink: session.joinLink || '',
    code: session.code,
  };
}

/** Rolling week strip (7 days) centered on today in IST. */
export function buildScheduleWeekStrip(now = new Date(), selectedIso = null) {
  const today = istDateKey(now);
  const sel = selectedIso || today;
  const start = addDaysIso(today, -3);
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
    });
  }
  return days;
}

export function markDaysWithSessions(strip, batch) {
  if (!batch?.sessions?.length) return strip;
  const dates = new Set(batch.sessions.map((s) => s.date).filter(Boolean));
  return strip.map((day) => ({ ...day, hasSession: dates.has(day.iso) }));
}

export function scheduleItemsForDate(batch, dateIso, now = new Date()) {
  if (!batch?.sessions?.length || !dateIso) return [];
  const sessions = batch.sessions
    .filter((s) => s.date === dateIso)
    .sort((a, b) => String(a.startTime).localeCompare(String(b.startTime)));
  return sessions.map((s) => sessionToScheduleItem(s, batch, now));
}

/** Due-week tasks as deadline rows on orientation / NSDC / Day 1. */
export function deadlineItemsForDate(batch, dateIso, now = new Date()) {
  if (!batch?.day1Date || !dateIso) return [];
  const { items } = buildLepDueWeek(batch, now);
  const orient = batch.orientationDate;
  const nsdc = orient ? addDaysIso(orient, 1) : null;
  const day1 = batch.day1Date;
  const map = {
    'lep-prep-codesef-sheet': orient,
    'lep-prep-nsdc': nsdc,
    'lep-orientation-access': day1,
  };
  return items
    .filter((item) => map[item.taskId] === dateIso)
    .map((item) => ({
      id: `due-${item.taskId}`,
      time: item.taskId === 'lep-orientation-access' ? 'All day' : '11:59 PM',
      tag: 'DEADLINE',
      title: item.title,
      meta: `${item.kind} · ${item.due}`,
      day: null,
      live: false,
      joinLink: '',
      taskId: item.taskId,
    }));
}

export function buildScheduleDay(batch, dateIso, now = new Date()) {
  const sessions = scheduleItemsForDate(batch, dateIso, now);
  const deadlines = deadlineItemsForDate(batch, dateIso, now);
  return [...sessions, ...deadlines].sort((a, b) => {
    if (a.tag === 'DEADLINE' && b.tag !== 'DEADLINE') return 1;
    if (b.tag === 'DEADLINE' && a.tag !== 'DEADLINE') return -1;
    return String(a.time).localeCompare(String(b.time));
  });
}

export function scheduleRecommendation(batch, now = new Date()) {
  const next = nextCmsBatchSession(batch, now);
  if (!next) return null;
  return {
    title: next.title,
    when: next.meta || next.doneMeta,
    joinLink: next.linkUrl || '',
  };
}

export { istDateKey as scheduleTodayIso };

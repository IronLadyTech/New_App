import { addCalendarDays } from './lepBatchSchedule';
import { nextCmsBatchSession, nextRawCmsSession } from './cmsBatchSessions';
import { day1CalendarUrl, formatLepDay, lepSessionCalendarUrl } from './registeredHomeData';

const DOW = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const MON = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

function parseLocal(iso) {
  const [y, m, d] = String(iso || '').split('-').map(Number);
  if (!y || !m || !d) return null;
  return new Date(y, m - 1, d);
}

function fmtShort(iso) {
  const d = parseLocal(iso);
  if (!d) return '';
  return `${DOW[d.getDay()]} ${d.getDate()} ${MON[d.getMonth()]}`;
}

/** CMS stores 24h `19:00`; home shows `7:00 PM`. */
function clockLabel(timeStr) {
  const raw = String(timeStr || '').trim();
  if (!raw) return '';
  if (/am|pm/i.test(raw)) return raw.replace(/\s+/g, ' ');
  const m = /^(\d{1,2}):(\d{2})$/.exec(raw);
  if (!m) return raw;
  let h = Number(m[1]);
  const min = m[2];
  const ap = h >= 12 ? 'PM' : 'AM';
  h = h % 12;
  if (h === 0) h = 12;
  return `${h}:${min} ${ap}`;
}

function hoursLine(startTime, endTime, fallbackMeta) {
  const start = clockLabel(startTime);
  const end = clockLabel(endTime);
  if (start && end) return `${start} – ${end} IST`;
  if (start) return `${start} IST`;
  return fallbackMeta || '';
}

function durationHours(startTime, endTime) {
  const parse = (t) => {
    const label = clockLabel(t);
    const m = /^(\d{1,2}):(\d{2})\s*(AM|PM)$/i.exec(label);
    if (!m) return null;
    let h = Number(m[1]) % 12;
    if (m[3].toUpperCase() === 'PM') h += 12;
    return h + Number(m[2]) / 60;
  };
  const a = parse(startTime);
  const b = parse(endTime);
  if (a == null || b == null || b <= a) return 1;
  return Math.max(1, Math.round(b - a));
}

/**
 * Enrolled home “Next live session” card.
 *
 * Day-of-week + clock come from the fixed LEP journey template
 * (Orientation Thu 7 PM, Day 1 Sat 9 AM–7 PM, …).
 * CMS / Zoho only supply which Day 1 Saturday this batch is, and Zoom links
 * (or a rare time/title override) when ops change something.
 *
 * @param {object|null} cmsBatch
 * @param {{ day1Iso?: string }} [opts] — Day 1 from Zoho LEP_Reg_Date when CMS row is missing
 */
export function buildUpcomingSessionCard(cmsBatch, opts = {}) {
  const day1 = String(cmsBatch?.day1Date || opts.day1Iso || '').slice(0, 10);
  const day2 = day1 ? addCalendarDays(day1, 1) : '';
  const anchor = cmsBatch || (day1 ? { day1Date: day1, sessions: [] } : null);
  const raw = nextRawCmsSession(anchor, new Date(), { day1Iso: day1 });
  const card = nextCmsBatchSession(anchor, new Date(), { day1Iso: day1 });

  if (raw || card?.title) {
    const dateIso = raw?.date ? String(raw.date).slice(0, 10) : '';
    const title = raw?.title || card?.title || 'Upcoming session';
    const startTime = raw?.startTime || '';
    const endTime = raw?.endTime || '';
    const joinLink = String(raw?.joinLink || card?.linkUrl || '').trim();
    const hours = hoursLine(startTime, endTime, card?.meta);
    const calendarUrl = dateIso
      ? lepSessionCalendarUrl({
          iso: dateIso,
          clockLabelText: clockLabel(startTime) || '9:00 AM',
          title: `LEP · ${title}`,
          durationHours: durationHours(startTime, endTime),
        })
      : day1
        ? day1CalendarUrl(day1, '9:00 AM')
        : '';
    return {
      kicker: 'Next live session',
      title,
      when: dateIso ? fmtShort(dateIso) : card?.doneMeta || 'On your schedule',
      hours,
      joinLink,
      calendarUrl,
      ready: Boolean(joinLink),
      code: raw?.code || '',
    };
  }

  if (day1 && day2) {
    return {
      kicker: 'Live Weekend Boardroom',
      title: cmsBatch?.name || 'Leadership Essentials program',
      when: `${fmtShort(day1)} – ${fmtShort(day2)}`,
      hours: '9:00 AM – 7:00 PM IST (both days)',
      joinLink: '',
      calendarUrl: day1CalendarUrl(day1, '9:00 AM'),
      ready: false,
      code: '',
    };
  }

  return {
    kicker: 'Live sessions',
    title: 'Your next session',
    when: 'Dates appear when your batch is linked',
    hours: '',
    joinLink: '',
    calendarUrl: '',
    ready: false,
    code: '',
  };
}

/**
 * Live whisper for this learner — never nudges a completed due/task.
 * Priority: open practice → open dues → next journey task → session → streak/motivation.
 */
export function enrolledWhisperFallback({
  name = '',
  nextSession = null,
  nextTaskTitle = '',
  nextTaskId = null,
  dueItems = [],
  practice = [],
  ritualsUnlocked = false,
  practiceDoneToday = 0,
  practiceTotalToday = 0,
  currentStreak = 0,
} = {}) {
  const first = String(name || '').trim().split(/\s+/)[0] || '';
  const hi = first ? `${first}, ` : '';

  const openPractice = (practice || []).find((p) => !p.done);
  if (openPractice?.title) {
    return `${hi}finish ${openPractice.title} today — that keeps your streak honest.`;
  }

  const openDues = (dueItems || []).filter((d) => !d.done);
  const urgent = openDues.find((d) => d.urgent || /overdue|today|tomorrow/i.test(String(d.due || '')));
  if (urgent?.title) {
    return `${hi}${urgent.title} is ${String(urgent.due || 'due soon').toLowerCase()}. Finish it before the live room.`;
  }
  if (openDues[0]?.title) {
    return `${hi}${openDues[0].title} is still open this week. Clear it while you have momentum.`;
  }

  const dueDoneIds = new Set(
    (dueItems || []).filter((d) => d.done && d.taskId).map((d) => d.taskId)
  );
  const nextStillOpen =
    nextTaskTitle &&
    (!nextTaskId || !dueDoneIds.has(nextTaskId));
  if (nextStillOpen) {
    return `${hi}pick up ${nextTaskTitle} next — it keeps you current with your cohort.`;
  }

  if (nextSession?.title) {
    const when = nextSession.meta || nextSession.doneMeta || nextSession.date || 'soon';
    return `${hi}your next live session is ${nextSession.title} — ${when}. Join a few minutes early.`;
  }

  if (practiceTotalToday > 0 && practiceDoneToday >= practiceTotalToday) {
    if (currentStreak >= 2) {
      return `${hi}${currentStreak}-day streak and today’s practice is done. Rest the checklist — show up sharp for the next live room.`;
    }
    return `${hi}today’s practice is done. You’re clear for now — come back tomorrow or open My Program for the next milestone.`;
  }

  if (!ritualsUnlocked) {
    return `${hi}pre-work and Day 1–2 set the foundation. Your 5 Rituals unlock after the intensive weekend.`;
  }

  return `${hi}you’re caught up. Protect the streak tomorrow — the women who show up daily walk into live sessions ready.`;
}

export function formatUpcomingWeekendLine(day1Iso) {
  if (!day1Iso) return '';
  const day2 = addCalendarDays(day1Iso, 1);
  const a = formatLepDay(day1Iso);
  const b = formatLepDay(day2);
  return a && b ? `${a} – ${b}` : a || '';
}

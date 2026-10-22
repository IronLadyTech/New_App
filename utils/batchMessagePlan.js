/**
 * Every reminder for one batch as a dated, plain-language list for the CMS.
 *
 * Mirrors what the scheduler actually sends (LMS functions/lepReminderRules.js and
 * lepNotificationAnchors.js) — change both together, or CX will see promises the
 * scheduler does not keep.
 */

const CORE_SESSION_CODES = new Set(['S0', 'S1', 'S2', 'S3', 'S4', 'S5', 'S6', 'S7', 'S8']);
const REGISTERED_SESSION_CODES = new Set(['S0', 'S1', 'S2']);
const SENDABLE_CONDITIONS = new Set(['', 'all']);

const AUDIENCE = {
  all: 'Everyone',
  attended: 'Only those who attended',
  absent: 'Only those who missed it',
  incomplete: 'Only if the task is not done',
  prework: 'Only if pre-work is not done',
  ritualsNotToday: 'Only if rituals not ticked today',
  paymentPending: 'Part-paid learners',
  certified: 'Only certified learners',
};

const HELD_REASON = 'Not sent yet — needs attendance and task data, so it never reaches the wrong person';

function parseMs(iso) {
  const t = iso ? Date.parse(iso) : NaN;
  return Number.isFinite(t) ? t : null;
}

function sessionsForRef(batch, ref) {
  const sessions = batch?.sessions || [];
  if (!ref || ref === '*') return sessions.filter((s) => CORE_SESSION_CODES.has(s.code));
  if (ref === 'PTW') return sessions.filter((s) => s.code === 'PTW' || s.notifyRef === 'PTW' || String(s.code).startsWith('PTW'));
  return sessions.filter((s) => s.code === ref || s.notifyRef === ref);
}

function istParts(ms) {
  const d = new Date(ms);
  const day = new Intl.DateTimeFormat('en-IN', { timeZone: 'Asia/Kolkata', weekday: 'short', day: 'numeric', month: 'short' }).format(d);
  const time = new Intl.DateTimeFormat('en-IN', { timeZone: 'Asia/Kolkata', hour: 'numeric', minute: '2-digit', hour12: true }).format(d);
  const dayKey = new Intl.DateTimeFormat('en-CA', { timeZone: 'Asia/Kolkata' }).format(d);
  return { day, time: time.toUpperCase(), dayKey };
}

function istHour(iso) {
  const ms = parseMs(iso);
  if (ms == null) return null;
  return Number(new Intl.DateTimeFormat('en-GB', { timeZone: 'Asia/Kolkata', hour: '2-digit', hour12: false }).format(new Date(ms)));
}

/** Same rule as the scheduler: morning-session "tomorrow" reminders go at 7 PM the evening before. */
function adjustFireAt(event, session, fireAtMs) {
  if (event?.code !== 'R-24h' || !session?.startAt) return fireAtMs;
  const hour = istHour(session.startAt);
  const day = String(session.date || '').slice(0, 10);
  if (hour == null || hour >= 12 || !day) return fireAtMs;
  const prev = new Date(`${day}T19:00:00+05:30`);
  prev.setUTCDate(prev.getUTCDate() - 1);
  return prev.getTime();
}

function fill(text, vars) {
  let source = String(text || '');
  if (!vars.joinLink) source = source.replace(/Join:?\s*\{\{joinLink\}\}/gi, 'Join from the Iron Lady app.');
  return source
    .replace(/\{\{(\w+)\}\}/g, (_, k) => vars[k] ?? '')
    .replace(/\s+([.,!?])/g, '$1')
    .replace(/\s{2,}/g, ' ')
    .replace(/[.]{2,}/g, '.')
    .trim()
    // An empty last placeholder leaves "Next:" — end the sentence instead.
    .replace(/[:\s]+$/, '.');
}

function channelLabel(ch = {}) {
  const parts = [];
  if (ch.push !== false) parts.push('App notification');
  if (ch.whatsapp) parts.push('WhatsApp (not connected yet)');
  if (ch.email) parts.push('Email (not connected yet)');
  return parts.join(' · ');
}

function describeRepeat(anchor = {}) {
  const at = anchor.time ? ` at ${anchor.time}` : '';
  if (anchor.type === 'daily') return `Every day${at}`;
  if (anchor.type === 'weekly') return `Every ${anchor.weekday || 'Sat'}${at}`;
  if (anchor.type === 'taskOpen') return `When each task opens${at}`;
  if (anchor.type === 'taskDue') return `${anchor.dayOffset ? `${anchor.dayOffset} day after` : 'On the day'} each task is due${at}`;
  if (anchor.type === 'day1') {
    const n = anchor.dayOffset || 0;
    return n ? `${Math.abs(n)} day${Math.abs(n) > 1 ? 's' : ''} ${n < 0 ? 'before' : 'after'} Day 1${at}` : `On Day 1${at}`;
  }
  if (anchor.type === 'event') {
    return {
      enrolled: 'When a learner joins the batch',
      sessionRescheduled: 'When a session time changes',
      taskSubmitted: 'When a learner submits a task',
      sessionAbsent: 'When a learner misses a session',
      mandatoryOverdue2d: 'When a required task is 2 days late',
      ritualsInactive3d: 'When rituals are not ticked for 3 days',
    }[anchor.trigger] || 'When something happens';
  }
  return 'On a schedule';
}

/**
 * @param {object} batch     cms_batches doc
 * @param {Array}  events    cms_notificationEvents
 * @param {object} opts      { learner: 'register'|'paid'|'late', now, sampleName }
 * @returns {{ automatic: boolean, blocker: string|null, days: Array, other: Array }}
 */
export function buildBatchMessagePlan(batch, events, { learner = 'paid', now = Date.now(), sampleName = 'Priya' } = {}) {
  const learnerEvents = (events || []).filter((e) => {
    const r = e.recipients || ['participant'];
    return r.includes('participant') && e.active !== false;
  });

  let blocker = null;
  if (!batch?.lmsGroupId) blocker = 'This batch is not linked to its learners yet (Batch setup), so no reminder can reach them.';
  else if (batch.status !== 'live' || batch.automationEnabled !== true) blocker = 'Automatic reminders are off for this batch. Turn them on at the top when the dates and Zoom links are right.';
  const automatic = !blocker;

  const rows = [];
  const other = [];
  for (const ev of learnerEvents) {
    const anchor = ev.anchor || {};
    const condition = String(ev.condition || 'all');
    const sendable = SENDABLE_CONDITIONS.has(condition === 'all' ? '' : condition);
    if (anchor.type !== 'sessionStart' && anchor.type !== 'sessionEnd') {
      other.push({
        key: ev.id || ev.code,
        title: ev.name || ev.title || ev.code,
        when: describeRepeat(anchor),
        audience: AUDIENCE[condition] || 'Everyone',
        body: fill(ev.body, { name: sampleName, session: 'the session', time: '', task: 'her next task', joinLink: '' }),
        status: 'Not sent automatically yet',
      });
      continue;
    }
    for (const session of sessionsForRef(batch, anchor.ref)) {
      if (learner === 'register' && !REGISTERED_SESSION_CODES.has(session.code)) continue;
      const edge = anchor.type === 'sessionStart' ? parseMs(session.startAt) : parseMs(session.endAt);
      if (edge == null) continue;
      const fireAtMs = adjustFireAt(ev, session, edge + (anchor.offsetMinutes || 0) * 60000);
      const when = istParts(fireAtMs);
      const vars = {
        name: sampleName,
        session: session.title || session.code,
        time: istParts(parseMs(session.startAt) ?? fireAtMs).time,
        date: session.date || '',
        task: '',
        joinLink: session.joinLink || '',
      };
      const past = fireAtMs < now;
      let status;
      if (!sendable) status = HELD_REASON;
      else if (!automatic) status = 'Will send once automatic reminders are on';
      else status = past ? 'Sent' : 'Sends automatically';
      rows.push({
        key: `${ev.id || ev.code}|${session.code}`,
        code: ev.code,
        fireAtMs,
        day: when.day,
        dayKey: when.dayKey,
        time: when.time,
        title: fill(ev.title || ev.name, vars),
        body: fill(ev.body, vars),
        sessionTitle: session.title,
        audience: AUDIENCE[condition] || 'Everyone',
        channels: channelLabel(ev.channels),
        status,
        sends: sendable && automatic,
        held: !sendable,
        past,
      });
    }
  }

  rows.sort((a, b) => a.fireAtMs - b.fireAtMs);
  const days = [];
  for (const row of rows) {
    const last = days[days.length - 1];
    if (last && last.dayKey === row.dayKey) last.items.push(row);
    else days.push({ dayKey: row.dayKey, day: row.day, items: [row] });
  }
  return { automatic, blocker, days, other };
}

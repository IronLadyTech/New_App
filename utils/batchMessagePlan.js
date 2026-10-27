/**
 * Every reminder for one batch as a dated, plain-language list for the CMS.
 *
 * Mirrors what the scheduler actually sends (LMS functions/lepReminderRules.js,
 * lepNotificationAnchors.js and lepTimeAnchors.js) — change both together, or CX will
 * see promises the scheduler does not keep.
 */

import LEP_TASK_SCHEDULE from '../constants/lepTaskSchedule.json';

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
const DATA_REASON = 'Not sent yet — its text needs data the app does not send yet (score, task list…)';

// --- Clock-time rules (day1 / daily / weekly) — same as LMS functions/lepTimeAnchors.js ---
const DAY_MS = 24 * 60 * 60 * 1000;
const WEEKDAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const RITUALS_CODES = new Set(['RITUALS-AM', 'RITUALS-PM']);
const TIME_ANCHOR_VARS = new Set(['name', 'batch', 'date']);

function addDays(day, n) {
  return new Date(Date.parse(`${day}T00:00:00Z`) + n * DAY_MS).toISOString().slice(0, 10);
}

function istMs(day, hhmm) {
  const m = String(hhmm || '').match(/^(\d{1,2}):(\d{2})$/);
  return m ? Date.parse(`${day}T${m[1].padStart(2, '0')}:${m[2]}:00+05:30`) : null;
}

/** Days (YYYY-MM-DD, offset from Day 1) a day1 / daily / weekly rule fires on. */
function timeFireDays(batch, event) {
  const anchor = event.anchor || {};
  const day1 = String(batch?.day1Date || '').slice(0, 10);
  if (!/^\d{4}-\d{2}-\d{2}$/.test(day1)) return [];
  if (anchor.type === 'day1') {
    const n = Number(anchor.dayOffset) || 0;
    return [{ day: addDays(day1, n), offset: n }];
  }
  const lastCore = (batch.sessions || [])
    .filter((x) => CORE_SESSION_CODES.has(x.code) && !x.cancelled)
    .map((x) => String(x.date || '').slice(0, 10))
    .filter((d) => d >= day1)
    .sort()
    .pop();
  const from = Number.isFinite(anchor.fromDay) ? anchor.fromDay : RITUALS_CODES.has(event.code) ? 2 : 0;
  const to = Number.isFinite(anchor.toDay)
    ? anchor.toDay
    : lastCore
      ? Math.round((Date.parse(`${lastCore}T00:00:00Z`) - Date.parse(`${day1}T00:00:00Z`)) / DAY_MS)
      : 28;
  const weekday = WEEKDAYS.indexOf(anchor.weekday || 'Sat');
  const out = [];
  for (let n = from; n <= to; n += 1) {
    const day = addDays(day1, n);
    if (anchor.type === 'weekly' && new Date(`${day}T00:00:00Z`).getUTCDay() !== weekday) continue;
    out.push({ day, offset: n });
  }
  return out;
}

// --- Task reminders (taskOpen / taskDue) — same as LMS functions/lepTaskReminders.js ---
const REGISTER_PHASES = new Set(['pre-program', 'orientation']);

function taskReminderKind(event) {
  const a = event?.anchor || {};
  if (a.ref && a.ref !== '*') return null;
  if (event.code === 'MAND-OVERDUE' || event.priority === 'mandatory') return null;
  if (a.type === 'taskOpen') return 'open';
  if (a.type === 'taskDue') return (Number(a.dayOffset) || 0) >= 1 ? 'overdue' : 'due';
  return null;
}

function phaseOpenIso(batch, phaseId) {
  const o = batch?.phaseOverrides?.[phaseId];
  if (o === 'locked' || o === 'open') return null;
  if (/^\d{4}-\d{2}-\d{2}$/.test(String(o || ''))) return o;
  const day1 = String(batch?.day1Date || '').slice(0, 10);
  const n = LEP_TASK_SCHEDULE.phaseOpenDay[phaseId];
  return /^\d{4}-\d{2}-\d{2}$/.test(day1) && Number.isFinite(n) ? addDays(day1, n) : null;
}

function taskDueIso(batch, task) {
  if (!task.dueSession || batch?.phaseOverrides?.[task.phase] === 'locked') return null;
  const s = (batch?.sessions || []).find((x) => x.code === task.dueSession && !x.cancelled);
  const d = String(s?.date || '').slice(0, 10);
  return /^\d{4}-\d{2}-\d{2}$/.test(d) ? d : null;
}

/** [{ kind, day, tasks }] — one per day, phases opening together share one. */
function taskReminderGroups(batch, event, learner) {
  const kind = taskReminderKind(event);
  const shift = Number(event.anchor?.dayOffset) || 0;
  const groups = new Map();
  for (const task of LEP_TASK_SCHEDULE.tasks) {
    if (learner === 'register' && !REGISTER_PHASES.has(task.phase)) continue;
    const base = kind === 'open' ? phaseOpenIso(batch, task.phase) : taskDueIso(batch, task);
    if (!base) continue;
    const day = addDays(base, shift);
    if (!groups.has(day)) groups.set(day, { kind, day, tasks: [] });
    groups.get(day).tasks.push(task);
  }
  return [...groups.values()];
}

function fillableWith(event, available) {
  const text = `${event?.title || ''} ${event?.body || ''}`;
  return [...text.matchAll(/\{\{(\w+)\}\}/g)].every((m) => available.has(m[1]));
}

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
    if (String(batch?.program || 'LEP').toUpperCase() === 'LEP' && taskReminderKind(ev)) {
      const groups = taskReminderGroups(batch, ev, learner);
      if (!groups.length || istMs(groups[0].day, anchor.time) == null) {
        other.push({
          key: ev.id || ev.code,
          title: ev.name || ev.title || ev.code,
          when: describeRepeat(anchor),
          audience: 'Everyone',
          body: fill(ev.body, { name: sampleName, task: 'her next task', pendingTasks: 'her pending tasks' }),
          status: 'Needs Day 1, the session dates and a time (HH:MM) to send',
        });
        continue;
      }
      for (const g of groups) {
        const fireAtMs = istMs(g.day, anchor.time);
        const when = istParts(fireAtMs);
        const [first] = g.tasks;
        const n = g.tasks.length;
        const past = fireAtMs < now;
        rows.push({
          key: `${ev.id || ev.code}|${g.day}`,
          code: ev.code,
          fireAtMs,
          day: when.day,
          dayKey: when.dayKey,
          time: when.time,
          title: g.kind === 'open' ? (n > 1 ? `${n} tasks open` : `New: ${first.title}`) : g.kind === 'due' ? (n > 1 ? `Due today · ${n} tasks` : 'Due today') : ev.title || 'Task overdue',
          body: g.kind === 'open' ? first.opens : g.kind === 'due' ? first.due : `Still pending: ${g.tasks.slice(0, 2).map((t) => t.title).join(', ')}${n > 2 ? ` and ${n - 2} more` : ''}`,
          sessionTitle: g.tasks.map((t) => t.title).join(' · '),
          audience: g.kind === 'open' ? 'Everyone' : 'Only those who have not handed it in',
          channels: channelLabel(ev.channels),
          status: !automatic ? 'Will send once automatic reminders are on' : past ? 'Sent' : 'Sends automatically',
          sends: automatic,
          held: false,
          past,
        });
      }
      continue;
    }
    if (['day1', 'daily', 'weekly'].includes(anchor.type)) {
      const fillable = fillableWith(ev, TIME_ANCHOR_VARS);
      const allDays = timeFireDays(batch, ev);
      const days = allDays.filter((d) => learner !== 'register' || d.offset <= 1);
      if (!sendable || !fillable || !days.length || istMs(days[0].day, anchor.time) == null) {
        const partPaidOnly = allDays.length && !days.length && istMs(allDays[0].day, anchor.time) != null;
        other.push({
          key: ev.id || ev.code,
          title: ev.name || ev.title || ev.code,
          when: describeRepeat(anchor),
          audience: AUDIENCE[condition] || 'Everyone',
          body: fill(ev.body, { name: sampleName, session: 'the session', time: '', task: 'her next task', joinLink: '' }),
          status: !sendable
            ? HELD_REASON
            : !fillable
              ? DATA_REASON
              : partPaidOnly
                ? 'Part-paid learners get reminders only up to Day 2'
                : 'Needs a Day 1 date and a time (HH:MM) to send',
        });
        continue;
      }
      for (const { day } of days) {
        const fireAtMs = istMs(day, anchor.time);
        const when = istParts(fireAtMs);
        const vars = { name: sampleName, batch: batch?.name || '', date: day };
        const past = fireAtMs < now;
        rows.push({
          key: `${ev.id || ev.code}|${day}`,
          code: ev.code,
          fireAtMs,
          day: when.day,
          dayKey: when.dayKey,
          time: when.time,
          title: fill(ev.title || ev.name, vars),
          body: fill(ev.body, vars),
          sessionTitle: describeRepeat(anchor),
          audience: AUDIENCE[condition] || 'Everyone',
          channels: channelLabel(ev.channels),
          status: !automatic ? 'Will send once automatic reminders are on' : past ? 'Sent' : 'Sends automatically',
          sends: automatic,
          held: false,
          past,
        });
      }
      continue;
    }
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

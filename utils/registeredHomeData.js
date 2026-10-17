import { PAYMENT_STATUS } from '../constants/programs';
import { isLepEnrolled } from './lepState';
import {
  learnerLeadDetails,
  learnerProgramDates,
  lepBatchIsAssigned,
  programPaymentStatus,
} from './programAccess';
import {
  addCalendarDays,
  formatDateIST,
  orientationFromDay1Saturday,
} from './lepBatchSchedule';

export const REG_STATUSES = ['enroll', 'batch', 'prework', 'ready'];

export const ROLE_OPTIONS = ['Technology', 'Marketing', 'Finance', 'HR', 'Operations', 'Other'];

/** City + field of work on profile — required before Day 1. */
export function isLepProfileInfoDone(profile) {
  const lead = learnerLeadDetails(profile);
  const city = String(profile?.city || lead.city || '').trim();
  const domain = String(
    profile?.domain || profile?.leadershipRole || lead.industry || ''
  ).trim();
  return Boolean(city && domain);
}

/**
 * Progress locker on registered home. Moves as she completes each phase.
 * Paying enrollment does not skip Pre-work — Day 1 only unlocks after required tasks.
 * Batch date is chosen in welcome/gate — not on this tracker.
 * 3rd bar: Orientation (before Thu) → Day 1 (after orientation) → Day 2 (after Day 1).
 */
const DOW = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
const DOW_SHORT = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const MON = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

/** Upcoming intensive milestone for the 3rd locker bar. */
export function intensiveMilestoneLabel(dates, now = new Date()) {
  if (!dates?.orientation || !dates?.day1) return 'Day 1';
  const today = formatDateIST(now);
  if (today < dates.orientation) return 'Orientation';
  if (today <= dates.day1) return 'Day 1';
  return 'Day 2';
}

const PREVIEW = {
  enroll: {
    pill: 'Registered',
    step: 0,
    cta: 'Complete enrollment',
    dated: false,
    statusLine: 'Complete your enrollment to secure your seat.',
    guide: 'Start with enrollment — it secures your seat and unlocks your batch dates.',
    note: 'In this order. Nothing is locked; due dates follow your batch.',
    tasks: [
      ['enroll', 'Complete enrollment', 'About 5 minutes', true, 'now'],
      ['via', 'VIA Survey · 15 min', 'Due dates appear once you pick a batch', true, 'todo'],
      ['bhag', 'Write your B-HAG · 10 min', 'Due dates appear once you pick a batch', true, 'todo'],
      ['nsdc', 'NSDC registration', 'Due dates appear once you pick a batch', true, 'todo'],
      ['profile', 'Profile info', 'Due dates appear once you pick a batch', true, 'todo'],
    ],
  },
  batch: {
    pill: 'Enrolled',
    step: 0,
    cta: 'Choose my batch date',
    dated: false,
    statusLine: 'Your seat is secured. Pick your batch date to unlock pre-work due dates.',
    guide: 'Pick your batch first — your pre-work due dates follow it.',
    note: 'Batch date is chosen on the welcome screen. Due dates follow once it is set.',
    tasks: [
      ['enroll', 'Complete enrollment', 'Done', true, 'done'],
      ['via', 'VIA Survey · 15 min', 'Due dates appear once you pick a batch', true, 'todo'],
      ['bhag', 'Write your B-HAG · 10 min', 'Due dates appear once you pick a batch', true, 'todo'],
      ['nsdc', 'NSDC registration', 'Due dates appear once you pick a batch', true, 'todo'],
      ['profile', 'Profile info', 'Due dates appear once you pick a batch', true, 'todo'],
    ],
  },
  prework: {
    pill: 'Pre-work',
    step: 1,
    cta: 'Continue pre-work',
    dated: true,
    orientation: 'Thu 22 Oct · 7:00 PM',
    day1Eyebrow: 'DAY 1 · IN 8 DAYS',
    day1When: 'Sat 24 Oct · 9:00 AM',
    day1Iso: '2026-10-24',
    day1Clock: '9:00 AM',
    guide: 'Your VIA Survey and B-HAG are due Wednesday 8:00 PM — we discuss your B-HAG at Orientation.',
    note: 'Due before Orientation on Thursday.',
    tasks: [
      ['enroll', 'Complete enrollment', 'Done', true, 'done'],
      ['via', 'VIA Survey · 15 min', 'Due Wed 21 Oct, 8:00 PM', true, 'now'],
      ['bhag', 'Write your B-HAG · 10 min', 'Due Wed 21 Oct, 8:00 PM', true, 'todo'],
      ['nsdc', 'NSDC registration', 'Due Fri 23 Oct', true, 'todo'],
      ['profile', 'Profile info', 'Due Wed 21 Oct, 8:00 PM', true, 'todo'],
    ],
  },
  ready: {
    pill: 'Ready for Day 1',
    step: 2,
    cta: 'Add to calendar',
    dated: true,
    orientation: 'Thu 22 Oct · 7:00 PM',
    day1Eyebrow: 'DAY 1 · IN 8 DAYS',
    day1When: 'Sat 24 Oct · 9:00 AM',
    day1Iso: '2026-10-24',
    day1Clock: '9:00 AM',
    guide: 'You are all set. See you at Orientation on Thursday, 7:00 PM.',
    note: 'All pre-work done. Join links arrive 1 hour before each session.',
    tasks: [
      ['enroll', 'Complete enrollment', 'Done', true, 'done'],
      ['via', 'VIA Survey', 'Done · report uploaded', true, 'done'],
      ['bhag', 'Write your B-HAG', 'Done', true, 'done'],
      ['nsdc', 'NSDC registration', 'Done', true, 'done'],
      ['profile', 'Profile info', 'Done', true, 'done'],
    ],
  },
};

function stepsFor(step, milestone = 'Day 1') {
  const labels = ['Registered', 'Pre-work', milestone];
  return labels.map((label, index) => ({
    label,
    state: index < step ? 'done' : index === step ? 'now' : 'todo',
  }));
}

function packTasks(rows) {
  return rows.map(([id, title, meta, required, state]) => ({ id, title, meta, required, state }));
}

function modelFrom(status, firstName, spec) {
  const tasks = packTasks(spec.tasks);
  const done = tasks.filter((task) => task.state === 'done').length;
  const nextTask = tasks.find((task) => task.state === 'now') || null;
  const lockerStep = spec.step;
  const milestone = spec.milestone || 'Day 1';
  const phases = [
    {
      key: 'registered',
      label: 'Registered',
      pill: 'Registered',
      body: spec.statusLine || 'Complete your enrollment to secure your seat.',
      dated: false,
      cta: lockerStep === 0 ? spec.cta : 'Complete enrollment',
      ctaTaskId: 'enroll',
      unlocked: true,
      active: lockerStep === 0,
      done: lockerStep > 0,
    },
    {
      key: 'prework',
      label: 'Pre-work',
      pill: 'Pre-work',
      body: spec.note || 'Finish VIA, B-HAG and NSDC before Day 1.',
      dated: Boolean(spec.dated),
      orientation: spec.orientation || '',
      day1Eyebrow: spec.day1Eyebrow || '',
      day1When: spec.day1When || '',
      cta: lockerStep >= 1 ? spec.cta : 'Finish Registered first',
      ctaTaskId: lockerStep >= 1 ? nextTask?.id || 'via' : null,
      unlocked: lockerStep >= 1,
      active: lockerStep === 1,
      done: lockerStep > 1,
    },
    {
      key: 'day1',
      label: milestone,
      pill: `Ready for ${milestone}`,
      body: spec.dated ? `${spec.orientation} · ${spec.day1When}` : 'Day 1 opens after pre-work.',
      dated: Boolean(spec.dated) && lockerStep >= 2,
      orientation: spec.orientation || '',
      day1Eyebrow: spec.day1Eyebrow || '',
      day1When: spec.day1When || '',
      cta: 'Add to calendar',
      ctaTaskId: 'calendar',
      unlocked: true,
      ctaBlocked: false,
      active: lockerStep === 2,
      done: false,
    },
  ];
  return {
    firstName,
    status,
    pill: spec.pill,
    statusLine: spec.statusLine || '',
    dated: spec.dated,
    orientation: spec.orientation || '',
    day1Eyebrow: spec.day1Eyebrow || '',
    day1When: spec.day1When || '',
    day1Iso: spec.day1Iso || '',
    day1Clock: spec.day1Clock || '',
    steps: stepsFor(lockerStep, milestone),
    lockerStep,
    phases,
    cta: spec.cta,
    ctaTaskId: nextTask?.id || null,
    guide: spec.guide,
    note: spec.note,
    tasks,
    doneCount: done,
    taskCount: tasks.length,
    showBring: status === 'ready',
  };
}

/** Sample copy from registered-home-reference.html, for the dev preview. */
export function buildPreviewRegisteredHome(status, firstName) {
  const key = PREVIEW[status] ? status : 'enroll';
  return modelFrom(key, firstName, PREVIEW[key]);
}

function parseIso(iso) {
  const [y, m, d] = String(iso || '').split('-').map(Number);
  if (!y || !m || !d) return null;
  return new Date(y, m - 1, d);
}

export function formatLepDay(iso) {
  const date = parseIso(iso);
  if (!date) return '';
  return `${DOW_SHORT[date.getDay()]} ${date.getDate()} ${MON[date.getMonth()]}`;
}

function weekdayName(iso) {
  const date = parseIso(iso);
  return date ? DOW[date.getDay()] : '';
}

function clockLabel(raw) {
  const value = String(raw || '').trim();
  const match = /^(\d{1,2}):(\d{2})/.exec(value);
  if (!match) return '';
  let hour = Number(match[1]);
  const suffix = hour >= 12 ? 'PM' : 'AM';
  hour = hour % 12 || 12;
  return `${hour}:${match[2]} ${suffix}`;
}

function sessionClock(batch, dateIso, code) {
  const sessions = Array.isArray(batch?.sessions) ? batch.sessions : [];
  const hit = sessions.find((session) => {
    if (!session?.startTime) return false;
    const date = String(session.date || session.sessionDate || '').slice(0, 10);
    if (date && dateIso && date === dateIso) return true;
    if (code && session.code === code && (!date || date === dateIso)) return true;
    return false;
  });
  return hit ? clockLabel(hit.startTime) : '';
}

function withClock(dayLabel, clock) {
  return clock ? `${dayLabel} · ${clock}` : dayLabel;
}

function day1Countdown(day1, now) {
  const today = formatDateIST(now);
  const diff = Math.round((Date.parse(day1) - Date.parse(today)) / 86400000);
  if (diff < 0) return 'DAY 1';
  if (diff === 0) return 'DAY 1 · TODAY';
  if (diff === 1) return 'DAY 1 · IN 1 DAY';
  return `DAY 1 · IN ${diff} DAYS`;
}

function batchDates(profile, cmsBatch) {
  const zohoDates = learnerProgramDates(profile, 'lep');
  const day1 =
    cmsBatch?.day1Date ||
    profile?.programAccess?.lep?.day1Date ||
    zohoDates.start || // LEP_Reg_Date — Zoho "LEP Start Date"
    null;
  if (!day1) return null;
  const orientation =
    cmsBatch?.orientationDate ||
    profile?.programAccess?.lep?.orientationDate ||
    orientationFromDay1Saturday(day1);
  return { day1, orientation, end: zohoDates.end || cmsBatch?.endDate || '' };
}

/** Paid, and Day 1's calendar day has arrived. Before that, the registered home stays. */
export function lepDay1HasStarted(profile, cmsBatch, now = new Date()) {
  if (!isLepEnrolled(profile)) return false;
  const dates = batchDates(profile, cmsBatch);
  if (!dates?.day1) return false;
  return formatDateIST(now) >= dates.day1;
}

function dueMeta(dateIso, clock) {
  const day = formatLepDay(dateIso);
  if (!day) return 'Due dates appear once you pick a batch';
  return clock ? `Due ${day}, ${clock}` : `Due ${day}`;
}

/**
 * @param {{ profile: object, cmsBatch: object|null, viaDone: boolean, nsdcDone: boolean, bhagDone: boolean, profileDone?: boolean, now?: Date }} input
 */
export function buildRegisteredHome(input) {
  const {
    profile,
    cmsBatch,
    viaDone,
    nsdcDone,
    bhagDone,
    profileDone = isLepProfileInfoDone(profile),
    now = new Date(),
  } = input;
  const firstName = String(profile?.displayName || profile?.firstName || 'there').trim().split(/\s+/)[0] || 'there';
  const pay = programPaymentStatus(profile, 'lep');
  const enrolled = pay === PAYMENT_STATUS.PAID;
  const seatHeld = pay === PAYMENT_STATUS.REGISTER || enrolled;
  const linked = lepBatchIsAssigned(profile);
  const preworkComplete = Boolean(viaDone && bhagDone && nsdcDone && profileDone);
  const dates = linked ? batchDates(profile, cmsBatch) : null;

  // CTA / copy phase — paying full fee early still leaves pre-work open.
  let status = 'enroll';
  if (seatHeld && !linked) status = 'batch';
  else if (seatHeld && linked && !preworkComplete) status = enrolled ? 'prework' : 'enroll';
  else if (seatHeld && linked && preworkComplete) status = enrolled ? 'ready' : 'enroll';

  // Locker bars: Registered → Pre-work → Day 1 (moves with real progress).
  const lockerStep =
    seatHeld && linked && preworkComplete ? 2 : seatHeld && linked ? 1 : 0;

  const orientClock = dates ? sessionClock(cmsBatch, dates.orientation, 'S0') : '';
  const day1Clock = dates ? sessionClock(cmsBatch, dates.day1, 'S1') : '';
  const viaDue = dates ? addCalendarDays(dates.orientation, -1) : '';
  const nsdcDue = dates ? addCalendarDays(dates.orientation, 1) : '';
  const viaClock = dates ? sessionClock(cmsBatch, viaDue, '') : '';
  const nsdcClock = dates ? sessionClock(cmsBatch, nsdcDue, '') : '';

  const noDate = 'Due dates appear once you pick a batch';

  const rows = [
    {
      id: 'enroll',
      title: 'Complete enrollment',
      required: true,
      done: enrolled,
      openMeta: 'About 5 minutes',
      doneMeta: 'Done',
    },
    {
      id: 'via',
      title: status === 'ready' ? 'VIA Survey' : 'VIA Survey · 15 min',
      required: true,
      done: viaDone,
      openMeta: dates ? dueMeta(viaDue, viaClock) : noDate,
      doneMeta: 'Done · report uploaded',
    },
    {
      id: 'bhag',
      title: status === 'ready' ? 'Write your B-HAG' : 'Write your B-HAG · 10 min',
      required: true,
      done: bhagDone,
      openMeta: dates ? dueMeta(viaDue, viaClock) : noDate,
      doneMeta: 'Done',
    },
    {
      id: 'nsdc',
      title: 'NSDC registration',
      required: true,
      done: nsdcDone,
      openMeta: dates ? dueMeta(nsdcDue, nsdcClock) : noDate,
      doneMeta: 'Done',
    },
    {
      id: 'profile',
      title: 'Profile info',
      required: true,
      done: profileDone,
      openMeta: dates ? dueMeta(viaDue, viaClock) : noDate,
      doneMeta: 'Done',
    },
  ];

  let markedNow = false;
  const tasks = rows.map((row) => {
    let state = 'todo';
    if (row.done) state = 'done';
    else if (!markedNow) {
      state = 'now';
      markedNow = true;
    }
    return {
      id: row.id,
      title: row.title,
      required: row.required,
      state,
      meta: row.done ? row.doneMeta : row.openMeta,
    };
  });

  const orientDay = dates ? weekdayName(dates.orientation) : '';
  const viaWeekday = viaDue ? weekdayName(viaDue) : '';
  const guide =
    status === 'enroll'
      ? lockerStep >= 1
        ? 'Enrollment can wait — finish VIA, B-HAG and NSDC so you are ready for Day 1.'
        : 'Start with enrollment — it secures your seat and unlocks your batch dates.'
      : status === 'batch'
        ? 'Pick your batch first — your pre-work due dates follow it.'
        : status === 'prework'
          ? `Your VIA Survey and B-HAG are due ${viaWeekday}${viaClock ? ` ${viaClock}` : ''} — we discuss your B-HAG at Orientation.`
          : `You are all set. See you at Orientation on ${orientDay}${orientClock ? `, ${orientClock}` : ''}.`;

  const note =
    status === 'prework'
      ? `Due before Orientation on ${orientDay}.`
      : status === 'ready'
        ? 'All pre-work done. Join links arrive 1 hour before each session.'
        : status === 'batch'
          ? 'Batch date is chosen on the welcome screen. Due dates follow once it is set.'
          : lockerStep >= 1
            ? 'Pre-work is the next blocker. Enrollment payment does not skip these steps.'
            : 'In this order. Pre-work unlocks after your batch date is set.';

  const statusLine =
    status === 'enroll' && lockerStep === 0
      ? 'Complete your enrollment to secure your seat.'
      : status === 'enroll' && lockerStep >= 1
        ? 'Seat held. Finish enrollment when ready — pre-work is your next blocker.'
        : status === 'batch'
          ? 'Your seat is secured. Pick your batch date to unlock pre-work due dates.'
          : '';

  const milestone = intensiveMilestoneLabel(dates, now);
  const pill =
    lockerStep === 2
      ? `Ready for ${milestone}`
      : lockerStep === 1
        ? 'Pre-work'
        : seatHeld
          ? 'Registered'
          : 'Registered';

  const nextTask = tasks.find((task) => task.state === 'now') || null;
  const preworkTask =
    tasks.find((task) => ['via', 'bhag', 'nsdc', 'profile'].includes(task.id) && task.state !== 'done') ||
    null;
  const cta = ctaForLocker({ lockerStep, linked, seatHeld, enrolled, nextTask, preworkTask, milestone });
  const day2Iso = dates?.day1 ? addCalendarDays(dates.day1, 1) : '';
  const weekendLabel =
    dates?.day1 && day2Iso ? `${formatLepDay(dates.day1)} – ${formatLepDay(day2Iso)}` : '';
  const phases = buildLockerPhases({
    lockerStep,
    linked,
    seatHeld,
    enrolled,
    nextTask,
    preworkTask,
    statusLine,
    dates,
    milestone,
    orientation: dates ? withClock(formatLepDay(dates.orientation), orientClock) : '',
    day1Eyebrow: dates ? day1Countdown(dates.day1, now) : '',
    day1When: dates ? withClock(formatLepDay(dates.day1), day1Clock) : '',
    weekendLabel,
    viaWeekday,
    viaClock,
  });

  return {
    firstName,
    status,
    pill,
    statusLine,
    dated: Boolean(dates) && lockerStep >= 1,
    orientation: dates ? withClock(formatLepDay(dates.orientation), orientClock) : '',
    day1Eyebrow: dates ? day1Countdown(dates.day1, now) : '',
    day1When: dates ? withClock(formatLepDay(dates.day1), day1Clock) : '',
    weekendLabel,
    milestone,
    steps: stepsFor(lockerStep, milestone),
    lockerStep,
    phases,
    cta,
    ctaTaskId: lockerStep === 1 ? preworkTask?.id || 'via' : nextTask?.id || null,
    guide,
    note,
    tasks,
    doneCount: tasks.filter((task) => task.state === 'done').length,
    taskCount: tasks.length,
    showBring: lockerStep === 2 && enrolled,
    day1Iso: dates?.day1 || '',
    day1Clock,
    orientationIso: dates?.orientation || '',
    orientationClock: orientClock,
  };
}

/** CTA label follows the locker phase and the next open task. */
function ctaForLocker({ lockerStep, linked, seatHeld, enrolled, nextTask, preworkTask, milestone }) {
  if (lockerStep >= 2) return 'Add to calendar';
  if (lockerStep === 1) return preworkCta(preworkTask || nextTask);
  if (!linked) return seatHeld ? 'Choose my batch date' : 'Complete enrollment';
  if (nextTask?.id === 'enroll') return 'Complete enrollment';
  return 'Complete enrollment';
}

function preworkCta(task) {
  if (task?.id === 'via') return 'Start VIA Survey';
  if (task?.id === 'bhag') return 'Write your B-HAG';
  if (task?.id === 'nsdc') return 'Complete NSDC registration';
  if (task?.id === 'profile') return 'Complete profile info';
  return 'Continue pre-work';
}

/** Three panels — Registered / Pre-work / Orientation|Day 1|Day 2 — each with its own caption + button. */
function buildLockerPhases({
  lockerStep,
  linked,
  seatHeld,
  enrolled,
  nextTask,
  preworkTask,
  statusLine,
  dates,
  milestone = 'Day 1',
  orientation,
  day1Eyebrow,
  day1When,
  weekendLabel,
  viaWeekday,
  viaClock,
}) {
  const registeredBody = !seatHeld
    ? 'Complete your enrollment to secure your seat.'
    : !linked
      ? 'Your seat is held. Pick your batch date to unlock pre-work due dates.'
      : statusLine || 'Seat held. You are registered for Leadership Essentials.';

  const preworkBody = dates
    ? `VIA and B-HAG are due ${viaWeekday}${viaClock ? ` ${viaClock}` : ''}. Finish NSDC before Day 1.`
    : 'Pick your batch date first — then VIA, B-HAG and NSDC unlock with due dates.';

  const day1Body = dates
    ? 'Orientation, then your Saturday–Sunday intensive — dates from your batch.'
    : 'Day 1 opens after pre-work is complete and your batch date is set.';

  const preCta = preworkCta(preworkTask);
  const preTaskId = preworkTask?.id || 'via';

  return [
    {
      key: 'registered',
      label: 'Registered',
      pill: 'Registered',
      body: registeredBody,
      dated: false,
      cta: enrolled
        ? 'Enrollment complete'
        : !linked && seatHeld
          ? 'Choose my batch date'
          : 'Complete enrollment',
      ctaTaskId: !linked && seatHeld ? 'batch' : 'enroll',
      unlocked: !enrolled || (!linked && seatHeld),
      ctaBlocked: enrolled && linked,
      active: lockerStep === 0,
      done: lockerStep > 0,
    },
    {
      key: 'prework',
      label: 'Pre-work',
      pill: 'Pre-work',
      body: preworkBody,
      dated: false,
      cta: lockerStep >= 1 ? preCta : 'Finish Registered first',
      ctaTaskId: lockerStep >= 1 ? preTaskId : null,
      unlocked: lockerStep >= 1,
      ctaBlocked: false,
      active: lockerStep === 1,
      done: lockerStep > 1,
    },
    {
      key: 'day1',
      label: milestone,
      pill: `Ready for ${milestone}`,
      body: day1Body,
      dated: Boolean(dates),
      orientation,
      day1Eyebrow: day1Eyebrow || 'INTENSIVE',
      day1When: weekendLabel || day1When,
      cta: 'Add to calendar',
      ctaTaskId: 'calendar',
      unlocked: Boolean(dates),
      ctaBlocked: !dates,
      active: lockerStep === 2,
      done: false,
    },
  ];
}

/** Parse `7:00 PM` or CMS `19:00` → { hour 0–23, minute }. */
function parseClockParts(clockLabelText) {
  const raw = String(clockLabelText || '').trim();
  const ampm = /^(\d{1,2}):(\d{2})\s*(AM|PM)$/i.exec(raw);
  if (ampm) {
    let hour = Number(ampm[1]) % 12;
    if (ampm[3].toUpperCase() === 'PM') hour += 12;
    return { hour, minute: ampm[2] };
  }
  const h24 = /^(\d{1,2}):(\d{2})$/.exec(raw);
  if (h24) return { hour: Number(h24[1]) % 24, minute: h24[2] };
  return null;
}

/** Google Calendar template for an LEP session (Orientation, Day 1, …). */
export function lepSessionCalendarUrl({ iso, clockLabelText, title, durationHours = 1 }) {
  if (!iso) return '';
  const compact = iso.replace(/-/g, '');
  const text = encodeURIComponent(title || 'LEP session');
  let dates = `${compact}/${addCalendarDays(iso, 1).replace(/-/g, '')}`;
  const parts = parseClockParts(clockLabelText);
  if (parts) {
    const hh = String(parts.hour).padStart(2, '0');
    const start = `${compact}T${hh}${parts.minute}00`;
    const endHour = String((parts.hour + Math.max(1, durationHours)) % 24).padStart(2, '0');
    dates = `${start}/${compact}T${endHour}${parts.minute}00`;
  }
  return `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${text}&dates=${dates}&ctz=Asia%2FKolkata`;
}

export function day1CalendarUrl(day1Iso, clockLabelText) {
  return lepSessionCalendarUrl({
    iso: day1Iso,
    clockLabelText,
    title: 'LEP Day 1',
    durationHours: 8,
  });
}

export function orientationCalendarUrl(orientationIso, clockLabelText) {
  return lepSessionCalendarUrl({
    iso: orientationIso,
    clockLabelText,
    title: 'LEP Orientation',
    durationHours: 1,
  });
}


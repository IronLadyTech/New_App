import { addCalendarDays, formatDateIST, orientationFromDay1Saturday, parseISODate } from './lepBatchSchedule';
import { inferLepDay1FromZohoRaw } from './lepDeskBatchDate';
import {
  isLepRitualsUnlocked,
  LEP_RITUALS_PRACTICE_ID,
  resolveLepDay1Iso,
} from './lepRitualsUnlock';
import { LEP_SESSION_TEMPLATE } from '../constants/lepSessionTemplate';
import { currentLepPhaseIdForDate } from './lepFlowGates';

export function todayIsoIST() {
  return formatDateIST(new Date());
}

/** Calendar days from Day 1 Saturday (negative = before Day 1). */
export function daysFromDay1(todayIso, day1Iso) {
  if (!day1Iso || !todayIso) return null;
  const t = parseISODate(todayIso);
  const d = parseISODate(day1Iso);
  return Math.round((t - d) / 86400000);
}

function dayIndexFromAnchor(todayIso, anchorIso) {
  const t = parseISODate(todayIso);
  const a = anchorIso ? parseISODate(anchorIso) : t;
  return Math.max(0, Math.floor((t - a) / 86400000));
}

export function principleNumberForDay(todayIso, anchorIso) {
  return (dayIndexFromAnchor(todayIso, anchorIso) % 27) + 1;
}

export function orientationIsoFromGroup(group) {
  const day1 = inferLepDay1FromZohoRaw(group?.zohoRawBatch);
  return day1 ? orientationFromDay1Saturday(day1) : null;
}

function row(partial) {
  return { programId: 'lep', ...partial };
}

function ritualsPracticeRow() {
  return row({
    id: 'daily-rituals',
    title: '5 Daily Rituals — morning check',
    meta: 'Ritual · 18 min',
    practiceId: LEP_RITUALS_PRACTICE_ID,
    dailyReset: true,
  });
}

function principleRow(todayIso, day1Iso) {
  const anchor = day1Iso ? addCalendarDays(day1Iso, 2) : todayIso;
  const n = principleNumberForDay(todayIso, anchor);
  return row({
    id: `daily-principle-${n}`,
    title: `Revise Principle ${n} from the 27 Principles`,
    meta: 'Daily revision · 2 min',
    practiceId: 'lep-principle',
    principleN: n,
    dailyReset: true,
  });
}

/** Session due today from LEP_Flow offsets (relative to Day 1 Sat). */
export function sessionDueToday(todayIso, day1Iso) {
  if (!day1Iso) return null;
  const offset = daysFromDay1(todayIso, day1Iso);
  if (offset == null) return null;
  return LEP_SESSION_TEMPLATE.find((s) => s.dayOffset === offset) || null;
}

/**
 * Today’s practice cards from batch Day 1 (LEP_Flow.pdf calendar).
 * Without a batch date → pre-program pool only.
 */
export function buildEnrolledDailyPractice(todayIso, anchorIso, day1Iso) {
  const offset = daysFromDay1(todayIso, day1Iso);
  const ritualsUnlocked = isLepRitualsUnlocked(todayIso, day1Iso);
  const session = sessionDueToday(todayIso, day1Iso);

  // No batch yet — keep pre-work focus.
  if (offset == null) {
    return [
      row({
        id: 'pre-via',
        title: 'Complete your VIA Survey',
        meta: 'Pre-program · before Orientation',
        taskId: 'lep-via-survey',
      }),
      row({
        id: 'pre-codesef',
        title: 'Fill the CoDeSeF Sheet',
        meta: 'Pre-program · before Orientation',
        taskId: 'lep-prep-codesef-sheet',
      }),
      row({
        id: 'pre-nsdc',
        title: 'Complete NSDC Registration',
        meta: 'Pre-program · before Day 1',
        taskId: 'lep-prep-nsdc',
      }),
    ];
  }

  // Before Orientation Thursday
  if (offset < -2) {
    return [
      row({
        id: 'pre-via',
        title: 'Complete your VIA Survey',
        meta: 'Due before Orientation',
        taskId: 'lep-via-survey',
      }),
      row({
        id: 'pre-codesef',
        title: 'Fill the CoDeSeF Sheet',
        meta: 'Due before Orientation',
        taskId: 'lep-prep-codesef-sheet',
      }),
      row({
        id: 'pre-principles',
        title: 'Watch the 27 Principles video',
        meta: 'Pre-work · 14 min',
        practiceId: 'lep-principles-video',
      }),
    ];
  }

  // Orientation Thursday (S0)
  if (offset === -2) {
    return [
      row({
        id: 's0-framework',
        title: 'Program Framework',
        meta: session ? `${session.title} · today` : 'Orientation · today',
        taskId: 'lep-orientation-framework',
      }),
      row({
        id: 's0-access',
        title: 'Program Access Essentials',
        meta: 'Orientation checklist',
        taskId: 'lep-orientation-access',
      }),
      row({
        id: 's0-schedule',
        title: 'Program Schedule',
        meta: 'Block your batch dates',
        taskId: 'lep-orientation-schedule',
      }),
    ];
  }

  // Friday before Day 1
  if (offset === -1) {
    return [
      row({
        id: 'fri-ready',
        title: 'Tick your Get ready checklist',
        meta: 'Day before Day 1',
        practiceId: 'lep-get-ready',
      }),
      row({
        id: 'fri-bhag',
        title: 'Write or refine your B-HAG',
        meta: 'Bring it to Day 1',
        practiceId: 'lep-bhag',
      }),
      row({
        id: 'fri-nsdc',
        title: 'Finish NSDC Registration',
        meta: 'Due before Day 1',
        taskId: 'lep-prep-nsdc',
      }),
    ];
  }

  // Day 1 Saturday (S1)
  if (offset === 0) {
    return [
      row({
        id: 'd1-promises',
        title: 'Promises and Agreements',
        meta: 'Day 1 · live weekend',
        taskId: 'lep-day1-promises',
      }),
      row({
        id: 'd1-beliefs',
        title: 'A-Game Self Awareness — Beliefs',
        meta: 'Day 1 · form',
        taskId: 'lep-day1-beliefs',
      }),
      row({
        id: 'd1-errc',
        title: 'ERRC Table',
        meta: 'Day 1 · before assignment',
        taskId: 'lep-day1-errc',
      }),
    ];
  }

  // Day 2 Sunday (S2)
  if (offset === 1) {
    return [
      row({
        id: 'd2-codesef',
        title: 'CoDeSeF',
        meta: 'Day 2 · strategies',
        taskId: 'lep-day2-codesef',
      }),
      row({
        id: 'd2-respond',
        title: 'Powerful Extreme Responding',
        meta: 'Day 2 · form',
        taskId: 'lep-day2-responding',
      }),
      row({
        id: 'd2-assign',
        title: 'Day 2 Assignment',
        meta: 'Day 2 · submit',
        taskId: 'lep-day2-assignment',
      }),
    ];
  }

  // Monday onward — rituals + principle + phase task
  const phaseId = currentLepPhaseIdForDate(todayIso, day1Iso, true);
  const phaseTask = {
    'week-1': {
      id: 'w1-roadmap',
      title: 'Your 0.5% League Roadmap',
      meta: 'Week 1 · after Closure',
      taskId: 'lep-day4-roadmap',
    },
    'week-2': {
      id: 'w2-pitch',
      title: 'Elevator Pitch practice',
      meta: 'Week 2 · brand',
      practiceId: 'lep-power-pitch',
    },
    'week-3': {
      id: 'w3-habits',
      title: 'Leadership Habits review',
      meta: 'Week 3',
      practiceId: 'lep-shameless',
    },
    'week-4': {
      id: 'w4-grad',
      title: 'Prepare for Graduation',
      meta: 'Week 4',
      practiceId: 'lep-get-ready',
    },
  }[phaseId] || {
    id: 'wk-next',
    title: session ? `Prep for ${session.title}` : 'Continue your LEP journey',
    meta: session ? `${session.weekLabel} · live today` : 'This week',
    practiceId: 'lep-get-ready',
  };

  return [
    ...(ritualsUnlocked ? [ritualsPracticeRow()] : []),
    principleRow(todayIso, day1Iso),
    // weekFocus: the hook swaps this for her next unfinished task of this week.
    row({ ...phaseTask, weekFocus: phaseId }),
  ];
}

/** Registered (part-paid) — same calendar gates, lighter pre-work focus. */
export function buildRegisteredDailyPractice(todayIso, anchorIso, day1Iso) {
  const offset = daysFromDay1(todayIso, day1Iso);
  const ritualsUnlocked = isLepRitualsUnlocked(todayIso, day1Iso);

  if (offset == null || offset < 0) {
    return [
      row({
        id: 'reg-via',
        title: 'Complete your VIA Survey',
        meta: 'Pre-work · before Day 1',
        taskId: 'lep-via-survey',
      }),
      row({
        id: 'reg-bhag',
        title: 'Write your B-HAG',
        meta: 'Pre-work · 10 min',
        practiceId: 'lep-bhag',
      }),
      row({
        id: 'reg-principles',
        title: 'Watch the 27 Principles video',
        meta: 'Pre-work · 14 min',
        practiceId: 'lep-principles-video',
      }),
    ];
  }

  if (offset <= 1) {
    return buildEnrolledDailyPractice(todayIso, anchorIso, day1Iso).slice(0, 3);
  }

  return [
    ...(ritualsUnlocked ? [ritualsPracticeRow()] : []),
    ...buildEnrolledDailyPractice(todayIso, anchorIso, day1Iso).filter((r) => r.id !== 'daily-rituals').slice(0, 2),
  ];
}

export { resolveLepDay1Iso };

import { PAYMENT_STATUS, PROGRAMS } from '../constants/programs';
import { COURSE_TASKS, coursePhases, currentPhaseId, isPhaseOpen } from '../constants/programCourseSlice';
import { programPaymentStatus } from './programAccess';

/**
 * One cohort timeline for LEP homes, counted from the batch's Day 1 (Saturday;
 * orientation is the Thursday before):
 *   - enrolmentNudge: how hard to push a part-paid learner, by days left
 *   - journeyRail:    the phase bar (done / current / next) for enrolled learners
 *   - journeyNextSteps: open tasks still to do, earlier phases (overdue) first
 */

const DAY_MS = 24 * 60 * 60 * 1000;
const ORIENTATION_BEFORE_DAY1 = 2;

export const NUDGE_LEVEL = {
  GENTLE: 'gentle', // a week or more to orientation
  FIRM: 'firm', // 4–6 days to orientation
  URGENT: 'urgent', // 0–3 days to orientation
  LAST: 'last', // Day 1 tomorrow or today
  AFTER: 'after', // batch started, still part-paid
};

function daysBetween(fromIso, toIso) {
  return Math.round((Date.parse(`${toIso}T12:00:00Z`) - Date.parse(`${fromIso}T12:00:00Z`)) / DAY_MS);
}

function whenWord(days) {
  if (days <= 0) return 'today';
  if (days === 1) return 'tomorrow';
  return `in ${days} days`;
}

/** Null unless she has paid only the registration fee and her batch has a Day 1. */
export function enrolmentNudge(profile, day1Iso, todayIso) {
  if (!day1Iso || !todayIso) return null;
  if (programPaymentStatus(profile, PROGRAMS.LEP) !== PAYMENT_STATUS.REGISTER) return null;
  const toDay1 = daysBetween(todayIso, day1Iso);
  const toOrientation = toDay1 - ORIENTATION_BEFORE_DAY1;

  if (toDay1 < 0) {
    return {
      level: NUDGE_LEVEL.AFTER,
      toDay1,
      toOrientation,
      title: 'Your batch has started',
      body: 'Complete enrolment to open Day 1 onward, or talk to your coordinator.',
      short: 'Batch started · enrol to continue',
    };
  }
  if (toDay1 <= 1) {
    return {
      level: NUDGE_LEVEL.LAST,
      toDay1,
      toOrientation,
      title: `Day 1 is ${whenWord(toDay1)}`,
      body: 'Your seat needs full enrolment before Day 1 begins.',
      short: `Day 1 ${whenWord(toDay1)} · enrol now`,
    };
  }
  if (toOrientation <= 3) {
    return {
      level: NUDGE_LEVEL.URGENT,
      toDay1,
      toOrientation,
      title: `Orientation is ${whenWord(toOrientation)}`,
      body: 'Complete enrolment to join orientation and Day 1 with your batch.',
      short: `Orientation ${whenWord(toOrientation)} · enrol now`,
    };
  }
  if (toOrientation <= 6) {
    return {
      level: NUDGE_LEVEL.FIRM,
      toDay1,
      toOrientation,
      title: `${toOrientation} days to orientation`,
      body: 'Complete enrolment this week to keep your seat in the batch.',
      short: `${toOrientation} days to orientation`,
    };
  }
  return {
    level: NUDGE_LEVEL.GENTLE,
    toDay1,
    toOrientation,
    title: 'Complete enrolment',
    body: 'Any time before orientation. It opens Day 1 and the four weeks after.',
    short: `Before orientation · ${toOrientation} days left`,
  };
}

/** Levels loud enough for the banner at the top of Home. */
export function isLoudNudge(nudge) {
  return !!nudge && nudge.level !== NUDGE_LEVEL.GENTLE;
}

const SHORT_LABEL = {
  'pre-program': 'Pre-work',
  orientation: 'Orientation',
  'day-1': 'Day 1',
  'day-2': 'Day 2',
  'week-1': 'Week 1',
  'week-2': 'Week 2',
  'week-3': 'Week 3',
  'week-4': 'Week 4',
  evaluation: 'Evaluation',
  certificate: 'Certificate',
};

// Community sessions run alongside the weeks; they are not a step on the bar.
function railPhases() {
  return coursePhases(PROGRAMS.LEP).filter((p) => SHORT_LABEL[p.id]);
}

/**
 * Three steps around today: the last one done, the current one, the next.
 * Current = the phase the batch calendar says she is in (same rule as My Program).
 */
export function journeyRail(profile, flow) {
  const phases = railPhases();
  if (!phases.length) return null;
  const enrolled = programPaymentStatus(profile, PROGRAMS.LEP) === PAYMENT_STATUS.PAID;
  const currentId = currentPhaseId(PROGRAMS.LEP, enrolled, flow);
  const at = Math.max(0, phases.findIndex((p) => p.id === currentId));
  const start = Math.max(0, Math.min(at - 1, phases.length - 3));
  const steps = phases.slice(start, start + 3).map((p, i) => {
    const idx = start + i;
    return {
      id: p.id,
      label: SHORT_LABEL[p.id],
      title: p.title,
      state: idx < at ? 'done' : idx === at ? 'current' : 'next',
    };
  });
  return { steps, current: phases[at], currentIndex: steps.findIndex((s) => s.state === 'current') };
}

/**
 * Open tasks she still has to do. Earlier phases first (they are overdue), then the
 * current one. Counts are for the current phase, so "2 of 5" means this week.
 */
export function journeyNextSteps(profile, flow, isDone, limit = 4) {
  const enrolled = programPaymentStatus(profile, PROGRAMS.LEP) === PAYMENT_STATUS.PAID;
  const currentId = currentPhaseId(PROGRAMS.LEP, enrolled, flow);
  const tasks = [];
  let done = 0;
  let total = 0;
  for (const phase of coursePhases(PROGRAMS.LEP)) {
    if (!isPhaseOpen(phase, enrolled, flow)) continue;
    const list = (COURSE_TASKS[PROGRAMS.LEP] || [])
      .filter((t) => t.phase === phase.id)
      .sort((a, b) => (a.order ?? 0) - (b.order ?? 0));
    const isCurrent = phase.id === currentId;
    list.forEach((t) => {
      const finished = isDone(PROGRAMS.LEP, t.id);
      if (isCurrent) {
        total += 1;
        if (finished) done += 1;
      }
      if (!finished) {
        tasks.push({
          id: t.id,
          title: t.title,
          meta: isCurrent ? SHORT_LABEL[phase.id] || phase.title : `${SHORT_LABEL[phase.id] || phase.title} · catch up`,
          state: isCurrent ? 'todo' : 'overdue',
          taskId: t.id,
        });
      }
    });
  }
  const overdue = tasks.filter((t) => t.state === 'overdue').length;
  return {
    tasks: tasks.slice(0, limit),
    more: Math.max(0, tasks.length - limit),
    done,
    total,
    note: overdue
      ? `${overdue} from an earlier phase still open — clear those first.`
      : tasks.length
        ? 'Finish these before the next live session.'
        : 'All open tasks done. The next phase opens on the batch calendar.',
  };
}

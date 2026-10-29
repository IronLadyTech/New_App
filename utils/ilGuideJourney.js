import { PROGRAMS, PAYMENT_STATUS } from '../constants/programs';
import {
  COURSE_TASKS,
  coursePhases,
  isPhaseOpen,
} from '../constants/programCourseSlice';
import { getEnrolledPrograms, programPaymentStatus } from './programAccess';
import { phaseGate } from './phaseUnlock';

// `flow` (phaseFlowFromBatch) carries the batch dates. Without it a paid learner's
// every phase counts as open, and the guide could point her at a task still locked.
function openTasks(programId, profile, flow) {
  const enrolled = programPaymentStatus(profile, programId) === PAYMENT_STATUS.PAID;
  const phases = coursePhases(programId);
  const out = [];
  phases.forEach((phase) => {
    if (!isPhaseOpen(phase, enrolled, flow)) return;
    (COURSE_TASKS[programId] || [])
      .filter((t) => t.phase === phase.id)
      .sort((a, b) => (a.order ?? 0) - (b.order ?? 0))
      .forEach((t) => out.push(t));
  });
  return out;
}

/** My Program journey progress (course slice + demo/LMS done flags). */
export function journeyProgressForProgram(programId, profile, isDone, flow) {
  const tasks = openTasks(programId, profile, flow);
  if (!tasks.length) return { percent: 0, done: 0, total: 0 };
  const done = tasks.filter((t) => isDone(programId, t.id)).length;
  return {
    percent: Math.round((done / tasks.length) * 100),
    done,
    total: tasks.length,
  };
}

/** Next incomplete task in My Program journey order. */
export function nextJourneyTask(programId, profile, isDone, flow) {
  const tasks = openTasks(programId, profile, flow);
  const next = tasks.find((t) => !isDone(programId, t.id));
  if (!next) return null;
  return { id: next.id, title: next.title, type: next.type, phaseId: next.phase };
}

/** Whether she can open this task today — its phase's gate, as My Program shows it. */
export function isGuideTaskOpen(programId, profile, flow, taskId) {
  const task = (COURSE_TASKS[programId] || []).find((t) => t.id === taskId);
  if (!task) return true; // not a course task (a session, a practice): nothing to gate
  const phase = coursePhases(programId).find((p) => p.id === task.phase);
  const enrolled = programPaymentStatus(profile, programId) === PAYMENT_STATUS.PAID;
  return isPhaseOpen(phase, enrolled, flow);
}

function niceDay(iso) {
  const d = iso ? new Date(`${iso}T12:00:00`) : null;
  return d && !Number.isNaN(d.getTime())
    ? d.toLocaleDateString('en-IN', { weekday: 'short', day: 'numeric', month: 'short' })
    : null;
}

/**
 * The next phases still closed for her, from the same rule My Program uses
 * (phaseGate): when each opens and why it is closed, so the guide can answer
 * "when do my tasks open?" without inventing a date.
 *   reason 'date'    — opens on `opensOn`
 *   reason 'payment' — opens when she completes enrollment
 *   reason 'held'    — the team is holding it; no date to give
 */
export function upcomingUnlocks(programId, profile, flow, limit = 3) {
  const enrolled = programPaymentStatus(profile, programId) === PAYMENT_STATUS.PAID;
  const out = [];
  for (const phase of coursePhases(programId)) {
    const gate = phaseGate(phase, { enrolled, flow });
    if (gate.open || gate.reason === 'no-dates') continue;
    const tasks = (COURSE_TASKS[programId] || [])
      .filter((t) => t.phase === phase.id)
      .sort((a, b) => (a.order ?? 0) - (b.order ?? 0));
    if (!tasks.length) continue;
    out.push({
      phase: phase.title,
      opensOn: gate.reason === 'date' ? gate.opensOn : null,
      opensLabel: gate.reason === 'date' ? niceDay(gate.opensOn) : null,
      reason: gate.reason,
      taskCount: tasks.length,
      firstTasks: tasks.slice(0, 2).map((t) => t.title),
    });
  }
  // Dated ones soonest first; payment / held after them.
  out.sort((a, b) => (a.opensOn || '9999').localeCompare(b.opensOn || '9999'));
  return out.slice(0, limit);
}

export function primaryProgramForGuide(profile) {
  const enrolled = getEnrolledPrograms(profile);
  if (enrolled.some((p) => p.id === PROGRAMS.LEP)) return PROGRAMS.LEP;
  return enrolled[0]?.id || PROGRAMS.LEP;
}

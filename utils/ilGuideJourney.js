import { PROGRAMS, PAYMENT_STATUS } from '../constants/programs';
import {
  COURSE_TASKS,
  coursePhases,
  isPhaseOpen,
} from '../constants/programCourseSlice';
import { getEnrolledPrograms, programPaymentStatus } from './programAccess';

function openTasks(programId, profile) {
  const enrolled = programPaymentStatus(profile, programId) === PAYMENT_STATUS.PAID;
  const phases = coursePhases(programId);
  const out = [];
  phases.forEach((phase) => {
    if (!isPhaseOpen(phase, enrolled)) return;
    (COURSE_TASKS[programId] || [])
      .filter((t) => t.phase === phase.id)
      .sort((a, b) => (a.order ?? 0) - (b.order ?? 0))
      .forEach((t) => out.push(t));
  });
  return out;
}

/** My Program journey progress (course slice + demo/LMS done flags). */
export function journeyProgressForProgram(programId, profile, isDone) {
  const tasks = openTasks(programId, profile);
  if (!tasks.length) return { percent: 0, done: 0, total: 0 };
  const done = tasks.filter((t) => isDone(programId, t.id)).length;
  return {
    percent: Math.round((done / tasks.length) * 100),
    done,
    total: tasks.length,
  };
}

/** Next incomplete task in My Program journey order. */
export function nextJourneyTask(programId, profile, isDone) {
  const tasks = openTasks(programId, profile);
  const next = tasks.find((t) => !isDone(programId, t.id));
  if (!next) return null;
  return { id: next.id, title: next.title, type: next.type, phaseId: next.phase };
}

export function primaryProgramForGuide(profile) {
  const enrolled = getEnrolledPrograms(profile);
  if (enrolled.some((p) => p.id === PROGRAMS.LEP)) return PROGRAMS.LEP;
  return enrolled[0]?.id || PROGRAMS.LEP;
}

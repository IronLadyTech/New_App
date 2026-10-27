import { coursePhases, courseTasks, currentPhaseId } from '../constants/programCourseSlice';
import { PROGRAMS } from '../constants/programs';

/** Task completion % and current phase index for program progress cards. */
export function computeCourseProgress(programId, enrolled, lepFlow, taskIsDone) {
  const phases = coursePhases(programId);
  const phaseId = currentPhaseId(programId, enrolled, lepFlow);
  const currentIndex = Math.max(0, phases.findIndex((p) => p.id === phaseId));
  const all = [];
  phases.forEach((p) => {
    courseTasks(programId, p.id).forEach((t) => all.push(t));
  });
  const done = all.filter((t) => taskIsDone(programId, t.id)).length;
  const percent = all.length ? Math.round((done / all.length) * 100) : 0;
  return {
    percent,
    phaseN: currentIndex + 1,
    totalPhases: phases.length || 1,
    phaseId,
    phases,
  };
}

export function phaseTasksComplete(programId, phaseId, taskIsDone) {
  const tasks = courseTasks(programId, phaseId);
  if (!tasks.length) return false;
  return tasks.every((t) => taskIsDone(programId, t.id));
}

export const LEP_PHASE_BADGE_META = {
  'pre-program': { num: '01', short: 'Prep' },
  orientation: { num: '02', short: 'Orientation' },
  'day-1': { num: '03', short: 'Day 1' },
  'day-2': { num: '04', short: 'Day 2' },
  'week-1': { num: '05', short: 'Week 1' },
  'week-2': { num: '06', short: 'Week 2' },
  'week-3': { num: '07', short: 'Week 3' },
  'week-4': { num: '08', short: 'Week 4' },
  community: { num: '09', short: 'Community' },
  evaluation: { num: '10', short: 'Evaluation' },
  certificate: { num: '11', short: 'Certificate' },
};

/** Badges shown in the progress grid (matches MoM layout). */
export const LEP_PROGRESS_BADGE_PHASE_IDS = [
  'pre-program',
  'orientation',
  'day-1',
  'day-2',
  'week-1',
  'week-2',
  'week-3',
  'certificate',
];

/**
 * Badge tile state: earned when every task in that phase is done;
 * current when that phase is your journey step; locked until the phase opens on the calendar.
 */
export function resolvePhaseBadgeState(phaseId, { phases, currentPhaseId, enrolled, lepFlow, taskIsDone, isPhaseOpen }) {
  const phase = phases.find((p) => p.id === phaseId) || { id: phaseId };
  if (phaseTasksComplete(PROGRAMS.LEP, phaseId, taskIsDone)) return 'done';
  if (!isPhaseOpen(phase, enrolled, lepFlow)) return 'locked';
  if (phaseId === currentPhaseId) return 'current';
  const idx = phases.findIndex((p) => p.id === phaseId);
  const curIdx = phases.findIndex((p) => p.id === currentPhaseId);
  if (idx >= 0 && curIdx >= 0 && idx < curIdx) return 'current';
  return 'locked';
}

import { isTaskDoneStatus } from '../constants/programs';
import { practiceKey } from '../constants/practice';

/** CX asked for changes (needs improvement / rejected). */
export function isSentBack(status) {
  return status === 'needs_improvement' || status === 'rejected';
}

/**
 * Demo (local) + LMS submission done for one task id.
 * Use this for IL Guide / journey / dues so completed work is never re-nudged.
 */
export function isProgramTaskDone(programId, taskId, { isDone, getTaskSubmission } = {}) {
  if (!programId || !taskId) return false;
  // CX sent it back: not done, whatever this phone remembers — she has to resubmit.
  if (typeof getTaskSubmission === 'function' && isSentBack(getTaskSubmission(programId, taskId)?.status)) return false;
  if (typeof isDone === 'function' && isDone(programId, taskId)) return true;
  if (typeof getTaskSubmission === 'function') {
    const sub = getTaskSubmission(programId, taskId);
    if (isTaskDoneStatus(sub?.status)) return true;
    const practiceSub = getTaskSubmission(programId, practiceKey(taskId));
    if (isTaskDoneStatus(practiceSub?.status)) return true;
  }
  return false;
}

/** Bound checker for journey / guide hooks. */
export function makeTaskDoneChecker({ isDone, getTaskSubmission } = {}) {
  return (programId, taskId) =>
    isProgramTaskDone(programId, taskId, { isDone, getTaskSubmission });
}

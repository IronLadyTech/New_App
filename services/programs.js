/**
 * Program tasks + submissions — same Firestore collections as the web LMS.
 * Completing a task here updates the same docs the LMS reads.
 */
import {
  collection,
  doc,
  setDoc,
  onSnapshot,
  query,
  where,
  orderBy,
  serverTimestamp,
  deleteField,
} from 'firebase/firestore';
import { db } from './firebase';
import {
  PROGRAM_JOURNEY,
  SUBMISSION_STATUS,
  submissionDocId,
  getProgramEntry,
  isTaskDoneStatus,
} from '../constants/programs';

function clearReviewFieldsForResubmit(prev) {
  if (
    !prev?.reviewOutcome &&
    !prev?.feedback &&
    !prev?.reviewedAt &&
    !prev?.reviewedBy
  ) {
    return {};
  }
  return {
    reviewOutcome: deleteField(),
    feedback: deleteField(),
    reviewedAt: deleteField(),
    reviewedBy: deleteField(),
  };
}

export function subscribeToProgramTasks(programId, onData, onError) {
  const entry = getProgramEntry(programId);
  if (!entry) {
    onData([]);
    return () => {};
  }

  // Prefer ordered query; fall back to unordered if composite index missing
  const col = collection(db, entry.tasksCollection);
  let unsub = () => {};

  try {
    const q = query(col, orderBy('order', 'asc'));
    unsub = onSnapshot(
      q,
      (snap) => {
        onData(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
      },
      (err) => {
        // Fallback without orderBy
        unsub = onSnapshot(
          col,
          (snap) => {
            const tasks = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
            tasks.sort((a, b) => (a.order ?? 0) - (b.order ?? 0));
            onData(tasks);
          },
          onError
        );
        if (onError) onError(err);
      }
    );
  } catch (e) {
    if (onError) onError(e);
  }

  return () => unsub();
}

export function subscribeToUserProgramSubmissions(programId, userId, onData, onError) {
  const entry = getProgramEntry(programId);
  if (!entry || !userId) {
    onData([]);
    return () => {};
  }

  const q = query(
    collection(db, entry.submissionsCollection),
    where('userId', '==', userId)
  );

  return onSnapshot(
    q,
    (snap) => {
      onData(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
    },
    onError
  );
}

/**
 * Save / submit a task — same doc id + fields as web LMS
 * (`{uid}_{taskId}` in mbw_submissions | bm100_submissions | lep_submissions).
 */
export async function saveProgramSubmission({
  programId,
  userId,
  taskId,
  payload,
  batchId = 'default',
  previousSubmission = null,
}) {
  const entry = getProgramEntry(programId);
  if (!entry) throw new Error('Unknown program');
  if (!userId || !taskId) throw new Error('Missing user or task');

  const subId = submissionDocId(userId, taskId);
  const data = {
    taskId,
    userId,
    batchId: batchId || 'default',
    updatedAt: serverTimestamp(),
    ...payload,
    ...clearReviewFieldsForResubmit(previousSubmission),
  };

  if (!previousSubmission) {
    data.createdAt = serverTimestamp();
  }

  await setDoc(doc(db, entry.submissionsCollection, subId), data, { merge: true });
  return { id: subId, ...payload, taskId, userId, batchId };
}

/** Submit a simple text / link / watch task (maps to LMS statuses). */
export async function submitProgramTask({
  programId,
  userId,
  task,
  fields = {},
  batchId = 'default',
  previousSubmission = null,
}) {
  const type = task?.type || 'text';
  let status = SUBMISSION_STATUS.SUBMITTED;

  if (type === 'checklist') {
    const total = task.checklistItems?.length || 0;
    const ticked = Array.isArray(fields.checkedItems) ? fields.checkedItems.length : 0;
    status =
      total > 0 && ticked >= total
        ? SUBMISSION_STATUS.SUBMITTED
        : SUBMISSION_STATUS.UNLOCKED;
  }

  const payload = {
    type,
    status,
    submittedAt: new Date().toISOString(),
    ...fields,
  };

  if (type === 'watch_only') {
    payload.watchCompleted = true;
    payload.watchProgress = 1;
  }

  return saveProgramSubmission({
    programId,
    userId,
    taskId: task.id,
    payload,
    batchId,
    previousSubmission,
  });
}

export function submissionsByTaskId(submissions = []) {
  const map = {};
  submissions.forEach((s) => {
    if (s.taskId) map[s.taskId] = s;
  });
  return map;
}

export function programProgressStats(tasks = [], submissions = []) {
  const byTask = submissionsByTaskId(submissions);
  const total = tasks.length;
  const done = tasks.filter((t) => isTaskDoneStatus(byTask[t.id]?.status)).length;
  const percent = total > 0 ? Math.round((done / total) * 100) : 0;
  return { total, done, percent };
}

export { PROGRAM_JOURNEY, SUBMISSION_STATUS, submissionDocId, isTaskDoneStatus };

/** Iron Lady program codes — same as web LMS. */
export const PROGRAMS = {
  LEP: 'lep',
  BM100: '100bm',
  MBW: 'mbw',
};

export const PROGRAM_JOURNEY = [
  {
    id: PROGRAMS.LEP,
    code: 'LEP',
    shortLabel: 'LEP',
    title: 'Leadership Essentials Program',
    tasksCollection: 'lep_tasks',
    submissionsCollection: 'lep_submissions',
    order: 0,
  },
  {
    id: PROGRAMS.BM100,
    code: '100BM',
    shortLabel: '100BM',
    title: '100 Board Members',
    tasksCollection: 'bm100_tasks',
    submissionsCollection: 'bm100_submissions',
    order: 1,
  },
  {
    id: PROGRAMS.MBW,
    code: 'MBW',
    shortLabel: 'MBW',
    title: 'Master of Business Warfare',
    tasksCollection: 'mbw_tasks',
    submissionsCollection: 'mbw_submissions',
    order: 2,
  },
];

export const TASK_TYPES = {
  WATCH_ONLY: 'watch_only',
  TEXT: 'text',
  LINK: 'link',
  EDITABLE_TEMPLATE: 'editable_template',
  FILE_UPLOAD: 'file_upload',
  VIDEO_RECORD: 'video_record',
  RECURRING_POST: 'recurring_post',
  CHECKLIST: 'checklist',
};

/** Same status values the web LMS + Firestore rules expect. */
export const SUBMISSION_STATUS = {
  LOCKED: 'locked',
  UNLOCKED: 'unlocked',
  SUBMITTED: 'submitted',
  UNDER_REVIEW: 'under_review',
  NEEDS_IMPROVEMENT: 'needs_improvement',
  REJECTED: 'rejected',
  COMPLETED: 'completed',
};

export const PAYMENT_STATUS = {
  UNPAID: 'unpaid',
  REGISTER: 'register',
  PAID: 'paid',
};

export function getProgramEntry(programIdOrCode) {
  const raw = String(programIdOrCode || '').toLowerCase();
  return (
    PROGRAM_JOURNEY.find(
      (p) =>
        p.id === raw ||
        p.code.toLowerCase() === raw ||
        p.shortLabel.toLowerCase() === raw
    ) || null
  );
}

export function submissionDocId(userId, taskId) {
  return `${userId}_${taskId}`;
}

/** Statuses that count as "done" on dashboards / progress. */
export function isTaskDoneStatus(status) {
  return [
    SUBMISSION_STATUS.SUBMITTED,
    SUBMISSION_STATUS.UNDER_REVIEW,
    SUBMISSION_STATUS.COMPLETED,
  ].includes(status);
}

export function statusLabel(status) {
  switch (status) {
    case SUBMISSION_STATUS.COMPLETED:
      return 'Completed';
    case SUBMISSION_STATUS.SUBMITTED:
      return 'Submitted';
    case SUBMISSION_STATUS.UNDER_REVIEW:
      return 'Under review';
    case SUBMISSION_STATUS.NEEDS_IMPROVEMENT:
      return 'Needs improvement';
    case SUBMISSION_STATUS.REJECTED:
      return 'Rejected';
    case SUBMISSION_STATUS.UNLOCKED:
      return 'In progress';
    case SUBMISSION_STATUS.LOCKED:
      return 'Locked';
    default:
      return 'Not started';
  }
}

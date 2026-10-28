/**
 * Batch names and empty states for learners — never show CMS / CRM / Zoho / sync jargon.
 */

export const COHORT_SUBLINE_FALLBACK =
  'Your batch dates and batchmates appear here once your seat is confirmed.';

export const COHORT_WEEK_EMPTY_META =
  'Live sessions, reminders, and team updates from your cohort show here.';

export const BATCH_SESSIONS_PENDING =
  'Your live sessions appear here once your batch schedule is ready.';

export const BATCH_CALENDAR_PENDING =
  'Your batch calendar appears here once your Day 1 date is set.';

export const NOTIFICATIONS_INBOX_EMPTY =
  'Nothing here yet. Reminders, session updates, and messages from your cohort appear here — and on your phone if notifications are on.';

export const TASK_MATERIALS_PENDING =
  'Your orientation schedule file is not here yet. Your team will add it before Day 1.';

export const TASK_MATERIALS_LOAD_FAILED =
  'Could not load batch materials. Check your connection and pull to refresh.';

export const TASK_SAVE_FAILED =
  'Not saved yet. Your answers are still here — tap Submit again when you are back online.';

export const HOME_PROGRAMS_EMPTY =
  'After you complete enrollment, your program tasks appear here and under Learn.';

export const HOME_PROGRESS_FOOTNOTE = (count) =>
  `${count} program${count === 1 ? '' : 's'} · updates as you complete tasks`;

export const HOME_EVENTS_EMPTY =
  'No upcoming events yet. Live sessions and workshops from your cohort appear here when they are scheduled.';

export const HOME_ANNOUNCEMENTS_EMPTY =
  'No announcements yet. Updates from your Iron Lady team appear here.';

export const LEARN_PROGRAMS_SUBTITLE =
  'Your Iron Lady programs — pick up tasks where you left off.';

export const LEARN_PROGRAMS_EMPTY =
  'After payment, pull to refresh on Home or open Profile → Update my enrollment. Tasks appear under Learn.';

export const PROGRAM_TASKS_PROGRESS_SUBTITLE = (done, total) =>
  `${done} of ${total} completed · saved on your account`;

export const PROGRAM_TASKS_EMPTY =
  'Your task list is not ready yet. Pull to refresh, or contact support if this stays empty after enrollment.';

export const PROFILE_TASK_PROGRESS_LABEL = 'Task progress';

export const PROFILE_REFRESH_ACCESS_LABEL = 'Update my enrollment';

export const PROFILE_REFRESH_ACCESS_MENU = 'Just paid? Update my enrollment';

export const PROFILE_NO_PROGRAM_HINT =
  'No program linked yet. Tap “Update my enrollment” below after payment, or sign in with the mobile number you registered with.';

export const CONFIRM_100BM_COHORT_INTRO =
  'Payment is complete. Pick your programme start date — we will confirm your seat and unlock your journey.';

export const SETTINGS_PROFILE_SAVED = 'Profile updated.';

export const TASK_SUBMIT_SUCCESS =
  'Submitted. Your team can review your work — status updates on this task.';

export const TASK_SUBMIT_VISIBLE_STATUS = (status) =>
  `Status: ${status} — you can see updates here on each task.`;

/** Strip staff-only QA labels from cms_batches.name before showing in the app. */
export function formatLearnerFacingBatchTitle(raw) {
  let s = String(raw || '').trim();
  if (!s) return '';
  s = s.replace(/\s*\(\s*no\s*crm\s*\)\s*/gi, ' ');
  s = s.replace(/^cms\s*qa\s*[·\-–—]\s*/i, '');
  s = s.replace(/\(\s*no\s*zoho\s*\)/gi, '');
  s = s.replace(/\b(qa\s*test|cms\s*only)\b/gi, '');
  s = s.replace(/\s{2,}/g, ' ').trim();
  if (!s) {
    const fallback = String(raw || '').trim();
    const dateish = fallback.match(/\d{1,2}\s+[A-Za-z]{3,}\s+\d{4}|\d{1,2}\/\d{1,2}\/\d{4}/);
    return dateish ? dateish[0] : fallback.replace(/\(\s*no\s*crm\s*\)/gi, '').trim();
  }
  return s;
}

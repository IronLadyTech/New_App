import { addCalendarDays, parseISODate } from './lepBatchSchedule';
import { inferLepDay1FromZohoRaw } from './lepDeskBatchDate';

/**
 * LEP_Flow.pdf: participants learn 5 Rituals only after the Week 0 intensive
 * (Day 1 Sat + Day 2 Sun). Tracker and content unlock from Monday (Day 1 + 2).
 */
export const LEP_RITUALS_UNLOCK_DAYS_AFTER_DAY1 = 2;

export const LEP_RITUALS_PRACTICE_ID = 'lep-rituals';

const LEP_RITUALS_TASK_IDS = new Set(['lep-day3-5-rituals', 'lep-quiz-5-rituals']);

export function lepRitualsUnlockIso(day1Iso) {
  if (!day1Iso) return null;
  return addCalendarDays(String(day1Iso).slice(0, 10), LEP_RITUALS_UNLOCK_DAYS_AFTER_DAY1);
}

export function resolveLepDay1Iso({ cmsBatch, group, zohoRawBatch } = {}) {
  const fromCms = cmsBatch?.day1Date ? String(cmsBatch.day1Date).slice(0, 10) : null;
  if (fromCms) return fromCms;
  // Explicit null/'' means "no Zoho range" — do not fall back to a stale group copy.
  const raw = zohoRawBatch !== undefined ? zohoRawBatch : group?.zohoRawBatch;
  return inferLepDay1FromZohoRaw(raw) || null;
}

export function isLepRitualsUnlocked(todayIso, day1Iso) {
  const unlock = lepRitualsUnlockIso(day1Iso);
  if (!unlock) return false;
  return parseISODate(todayIso) >= parseISODate(unlock);
}

export function filterLepPrework(items, unlocked) {
  if (unlocked) return items;
  return items.filter((item) => item.practiceId !== LEP_RITUALS_PRACTICE_ID);
}

export function filterLepPracticeItems(items, unlocked) {
  if (unlocked) return items;
  return items.filter((item) => item.practiceId !== LEP_RITUALS_PRACTICE_ID);
}

export function filterLepCourseTasks(tasks, programId, unlocked) {
  if (programId !== 'lep' || unlocked) return tasks;
  return tasks.filter((t) => !LEP_RITUALS_TASK_IDS.has(t.id));
}

export function isLepRitualsPracticeId(practiceId) {
  return practiceId === LEP_RITUALS_PRACTICE_ID;
}

export function isLepRitualsCourseTask(taskId) {
  return LEP_RITUALS_TASK_IDS.has(taskId);
}

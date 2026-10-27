import { addCalendarDays, parseISODate } from './lepBatchSchedule';
import { lepRitualsUnlockIso } from './lepRitualsUnlock';
import {
  LEP_FIVE_RITUALS,
  LEP_RITUAL_DAILY_MARKS_MAX,
  LEP_RITUAL_MARK_EACH,
  LEP_RITUAL_WEEKLY_MARKS_MAX,
} from '../constants/lepFiveRituals';
const PROGRAM = 'lep';

/** Storage key in CourseDemo `done` map: lep:ritual-mark:{id}:{YYYY-MM-DD} */
export function lepRitualMarkKey(ritualId, isoDate) {
  return `ritual-mark:${ritualId}:${String(isoDate || '').slice(0, 10)}`;
}

export function isRitualMarkedOnDay(isDoneOnDay, ritualId, isoDate) {
  return isDoneOnDay(PROGRAM, lepRitualMarkKey(ritualId, isoDate));
}

export function dailyMarksForDate(isDoneOnDay, isoDate) {
  let sum = 0;
  for (const r of LEP_FIVE_RITUALS) {
    if (isRitualMarkedOnDay(isDoneOnDay, r.id, isoDate)) sum += LEP_RITUAL_MARK_EACH;
  }
  return sum;
}

/** Monday of the ISO week containing `isoDate` (IST noon anchor). */
export function mondayOfWeekContaining(isoDate) {
  const d = parseISODate(isoDate);
  const dow = d.getUTCDay();
  const monOffset = dow === 0 ? -6 : 1 - dow;
  return addCalendarDays(isoDate, monOffset);
}

/** Seven ISO dates Mon–Sun for the week containing `isoDate`. */
export function weekDaysMonSun(isoDate) {
  const mon = mondayOfWeekContaining(isoDate);
  return [0, 1, 2, 3, 4, 5, 6].map((i) => addCalendarDays(mon, i));
}

/**
 * First Monday–Sunday tracker week: starts on unlock Monday (day1+2), not before.
 */
export function trackerWeekDays(todayIso, day1Iso) {
  const unlock = lepRitualsUnlockIso(day1Iso);
  if (!unlock) return [];
  const unlockMon = mondayOfWeekContaining(unlock);
  const todayMon = mondayOfWeekContaining(todayIso);
  const weekStart =
    parseISODate(todayMon) >= parseISODate(unlockMon) ? todayMon : unlockMon;
  return [0, 1, 2, 3, 4, 5, 6].map((i) => addCalendarDays(weekStart, i));
}

export function weeklyMarksForWeek(isDoneOnDay, weekDays) {
  return weekDays.reduce((sum, iso) => sum + dailyMarksForDate(isDoneOnDay, iso), 0);
}

export function buildRitualsDashboardModel({ todayIso, day1Iso, isDoneOnDay }) {
  const unlock = lepRitualsUnlockIso(day1Iso);
  const weekDays = trackerWeekDays(todayIso, day1Iso);
  const grid = LEP_FIVE_RITUALS.map((ritual) => ({
    ...ritual,
    days: weekDays.map((iso) => ({
      iso,
      marked: isRitualMarkedOnDay(isDoneOnDay, ritual.id, iso),
      marks: isRitualMarkedOnDay(isDoneOnDay, ritual.id, iso) ? LEP_RITUAL_MARK_EACH : 0,
      isToday: iso === todayIso,
      beforeUnlock: unlock && parseISODate(iso) < parseISODate(unlock),
    })),
  }));

  const todayMarks = dailyMarksForDate(isDoneOnDay, todayIso);
  const weekMarks = weeklyMarksForWeek(isDoneOnDay, weekDays);

  return {
    unlockIso: unlock,
    weekDays,
    grid,
    todayMarks,
    todayMarksMax: LEP_RITUAL_DAILY_MARKS_MAX,
    weekMarks,
    weekMarksMax: LEP_RITUAL_WEEKLY_MARKS_MAX,
    allRitualsDoneToday: todayMarks >= LEP_RITUAL_DAILY_MARKS_MAX,
  };
}

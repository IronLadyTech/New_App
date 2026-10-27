import { addCalendarDays, parseISODate } from './lepBatchSchedule';
import { practiceDailyKey } from '../constants/practice';

/** Active IST days derived from learner progress keys on `lep`. */
export function activeDaysFromDone(doneMap = {}) {
  const days = new Set();
  Object.keys(doneMap).forEach((fullKey) => {
    if (!fullKey.startsWith('lep:')) return;
    const rest = fullKey.slice(4);
    const dated =
      /(?:practice-day:[^:]+|active-day):(\d{4}-\d{2}-\d{2})$/.exec(rest) ||
      /^active-day:(\d{4}-\d{2}-\d{2})$/.exec(rest) ||
      /^ritual-mark:[^:]+:(\d{4}-\d{2}-\d{2})$/.exec(rest);
    if (dated) days.add(dated[1]);
  });
  return [...days].sort();
}

function mondayOfWeekContaining(todayIso) {
  const d = parseISODate(todayIso);
  const dow = d.getUTCDay();
  const monOffset = dow === 0 ? -6 : 1 - dow;
  return addCalendarDays(todayIso, monOffset);
}

export function weekWeekdaysMonFri(todayIso) {
  const mon = mondayOfWeekContaining(todayIso);
  return [0, 1, 2, 3, 4].map((i) => addCalendarDays(mon, i));
}

/** Consecutive IST days with any practice activity ending today (or yesterday if today empty). */
export function currentStreak(activeSet, todayIso) {
  let streak = 0;
  let d = todayIso;
  if (!activeSet.has(d)) d = addCalendarDays(todayIso, -1);
  while (activeSet.has(d)) {
    streak += 1;
    d = addCalendarDays(d, -1);
  }
  return streak;
}

export function computeLepStreakMetrics(doneMap, todayIso) {
  const active = activeDaysFromDone(doneMap);
  const activeSet = new Set(active);
  const weekdays = weekWeekdaysMonFri(todayIso);
  const weekFilled = weekdays.map((iso) => activeSet.has(iso));
  const weekActiveDays = weekFilled.filter(Boolean).length;

  return {
    activeDays: active,
    currentStreak: currentStreak(activeSet, todayIso),
    weekActiveDays,
    weekTotal: 5,
    weekdays,
    weekFilled,
    todayActive: activeSet.has(todayIso),
  };
}

export function lepActiveDayKey(todayIso) {
  return `active-day:${todayIso}`;
}

export function ritualsDoneOnDay(isDoneOnDay, todayIso) {
  return isDoneOnDay('lep', practiceDailyKey('lep-rituals', todayIso));
}

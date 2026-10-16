/**
 * LEP participant gates aligned to LEP_Flow.pdf / Journey v1.5.
 * Day 1 = batch Saturday (`day1Date`). Offsets are calendar days from Day 1.
 */
import { addCalendarDays, parseISODate } from './lepBatchSchedule';
import {
  isLepRitualsUnlocked,
  lepRitualsUnlockIso,
  LEP_RITUALS_UNLOCK_DAYS_AFTER_DAY1,
  resolveLepDay1Iso,
} from './lepRitualsUnlock';

export {
  isLepRitualsUnlocked,
  lepRitualsUnlockIso,
  LEP_RITUALS_UNLOCK_DAYS_AFTER_DAY1,
  resolveLepDay1Iso,
};

/** First calendar day (IST) a journey phase may open. */
export const LEP_PHASE_DAY_OFFSET = {
  'pre-program': -14,
  orientation: -2,
  'day-1': 0,
  'day-2': 1,
  'week-1': 2,
  'week-2': 2,
  'week-3': 7,
  'week-4': 14,
  community: 2,
  evaluation: 28,
  certificate: 28,
};

export function lepPhaseUnlockIso(day1Iso, phaseId) {
  if (!day1Iso || !phaseId) return null;
  const offset = LEP_PHASE_DAY_OFFSET[phaseId];
  if (offset == null) return null;
  return addCalendarDays(String(day1Iso).slice(0, 10), offset);
}

export function isLepJourneyPhaseOpen(phaseId, todayIso, day1Iso, enrolled, openRegistered) {
  if (!phaseId) return false;
  const paymentOk = enrolled || openRegistered;
  if (!paymentOk) return false;

  if (!day1Iso) {
    return ['pre-program', 'orientation'].includes(phaseId) && paymentOk;
  }

  const unlockIso = lepPhaseUnlockIso(day1Iso, phaseId);
  if (!unlockIso) return false;
  return parseISODate(todayIso) >= parseISODate(unlockIso);
}

const LEP_PHASE_ORDER = [
  'pre-program',
  'orientation',
  'day-1',
  'day-2',
  'week-1',
  'week-2',
  'week-3',
  'week-4',
  'community',
  'evaluation',
  'certificate',
];

/** openRegistered flags for registered (part-paid) learners — mirrors programCourseSlice. */
const LEP_OPEN_REGISTERED = {
  'pre-program': true,
  orientation: true,
  'day-1': true,
  'day-2': false,
  'week-1': false,
  'week-2': false,
  'week-3': false,
  'week-4': false,
  community: false,
  evaluation: false,
  certificate: false,
};

/** Parallel track. Open on its own date, but it must not become "you are here". */
const LEP_PARALLEL_PHASES = new Set(['community']);

/**
 * Furthest sequential phase open today.
 * Community unlocks the Monday after Day 1 and sits after Week 4 in the list,
 * so treating it as the next journey step marks earlier weeks done too soon.
 */
export function currentLepPhaseIdForDate(todayIso, day1Iso, enrolled) {
  let lastOpen = 'pre-program';
  for (const phaseId of LEP_PHASE_ORDER) {
    if (LEP_PARALLEL_PHASES.has(phaseId)) continue;
    const openRegistered = !!LEP_OPEN_REGISTERED[phaseId];
    const open = isLepJourneyPhaseOpen(phaseId, todayIso, day1Iso, enrolled, openRegistered);
    if (!open) break;
    lastOpen = phaseId;
  }
  return lastOpen;
}

export function lepFlowContextFromBatch({ cmsBatch, group, zohoRawBatch } = {}) {
  const day1Iso = resolveLepDay1Iso({ cmsBatch, group, zohoRawBatch });
  return {
    programId: 'lep',
    day1Iso,
  };
}

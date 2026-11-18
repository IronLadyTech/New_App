import { PROGRAMS } from '../constants/programs';
import { learnerBatchLabel, learnerProgramDates } from './programAccess';
import { programBatchPhase } from './lepBatchHero';
import { daysFromDay1, todayIsoIST } from './lepDailyPractice';

export function resolveLepDay1Iso(profile, cmsBatch) {
  return (
    (cmsBatch?.day1Date && String(cmsBatch.day1Date).slice(0, 10)) ||
    // Her own Day 1 is written by both her batch pick and the Zoho sync, so it is the newest.
    // Older copies of the Zoho lead on her profile kept a past start date after she changed
    // batch (Home counted "Day 470" and said graduation had passed).
    String(profile?.programAccess?.lep?.day1Date || '').slice(0, 10) ||
    learnerProgramDates(profile, PROGRAMS.LEP).start ||
    ''
  );
}

/**
 * Enrolled LEP home layout:
 * - prelaunch — before cohort start (orientation, pre–Day 1)
 * - active — cohort in progress (Day 1 through batch end)
 * - alumni — batch end date passed
 */
export function resolveLepEnrolledCohortPhase(profile, day1Iso, now = new Date()) {
  const batchPhase = programBatchPhase(profile, PROGRAMS.LEP, now);
  if (batchPhase === 'earlier') return 'alumni';
  if (batchPhase === 'current') return 'active';
  if (batchPhase === 'upcoming') return 'prelaunch';

  const day1 = String(day1Iso || '').slice(0, 10);
  if (!day1) return 'prelaunch';

  const today = todayIsoIST(now);
  const offset = daysFromDay1(today, day1);
  if (offset == null) return 'prelaunch';
  if (offset < 0) return 'prelaunch';
  return 'active';
}

export function lepCohortBatchLine(profile) {
  const raw = learnerBatchLabel(profile, PROGRAMS.LEP);
  return raw ? String(raw).trim() : '';
}

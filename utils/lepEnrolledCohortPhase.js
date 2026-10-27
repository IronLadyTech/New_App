import { PROGRAMS } from '../constants/programs';
import { learnerBatchLabel, learnerProgramDates } from './programAccess';
import { programBatchPhase } from './lepBatchHero';
import { daysFromDay1, todayIsoIST } from './lepDailyPractice';

export function resolveLepDay1Iso(profile, cmsBatch) {
  return (
    (cmsBatch?.day1Date && String(cmsBatch.day1Date).slice(0, 10)) ||
    learnerProgramDates(profile, PROGRAMS.LEP).start ||
    String(profile?.programAccess?.lep?.day1Date || '').slice(0, 10) ||
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

/**
 * When each journey phase opens, for every program — one rule:
 *   payment allows it  AND  (CX opened it early  OR  its date has come)  AND  CX has not held it back.
 *
 * LEP counts calendar days from Day 1 Saturday (utils/lepFlowGates.js).
 * 100BM and MBW count weeks from the cohort start date (cms_batches.startDate),
 * following the week numbers on each phase. A batch without dates keeps the old
 * behaviour (open on payment) so nobody is locked out by a missing date.
 *
 * CX overrides live on the batch: cms_batches.phaseOverrides[phaseId] =
 *   'open' (open now) | 'locked' (hold back) | 'YYYY-MM-DD' (open on this date instead).
 */
import { addCalendarDays, parseISODate } from './lepBatchSchedule';
import { LEP_PHASE_DAY_OFFSET } from './lepFlowGates';
import { resolveLepDay1Iso } from './lepRitualsUnlock';
import { inferProgramStartFromZohoRaw } from './programStartDate';

/** First week (1-based) of each 100BM / MBW phase, from the phase labels (Wk1–Wk8 …). */
export const PROGRAM_PHASE_START_WEEK = {
  '100bm': {
    onboarding: null,
    'phase-1-foundation': 1,
    'phase-2-pitch-strategy': 9,
    'phase-3-board-ready': 15,
    'phase-4-challenges': 18,
    graduation: 24,
  },
  mbw: {
    'pre-preparation': null,
    'quarter-1': 1,
    'quarter-2': 13,
    'quarter-3': 25,
    'quarter-4': 37,
    graduation: 49,
  },
};

/** The dates and overrides one learner's batch gives the journey. */
export function phaseFlowFromBatch(programId, cmsBatch, todayIso) {
  const base = { programId, todayIso, overrides: cmsBatch?.phaseOverrides || {} };
  if (programId === 'lep') return { ...base, day1Iso: resolveLepDay1Iso({ cmsBatch }) };
  const startIso =
    (cmsBatch?.startDate && String(cmsBatch.startDate).slice(0, 10)) ||
    inferProgramStartFromZohoRaw(cmsBatch?.zohoBatchKey) ||
    null;
  return { ...base, startIso };
}

const ISO_DAY = /^\d{4}-\d{2}-\d{2}$/;

/** The date CX chose for this phase, when they chose one. */
export function customOpenDate(phaseId, flow) {
  const v = flow?.overrides?.[phaseId];
  return typeof v === 'string' && ISO_DAY.test(v) ? v : null;
}

/** The calendar date from the batch dates alone, ignoring any date CX chose. */
export function standardOpensOn(phaseId, flow) {
  if (!flow || !phaseId) return null;
  if (flow.programId === 'lep') {
    const offset = LEP_PHASE_DAY_OFFSET[phaseId];
    return flow.day1Iso && offset != null ? addCalendarDays(flow.day1Iso, offset) : null;
  }
  const week = PROGRAM_PHASE_START_WEEK[flow.programId]?.[phaseId];
  if (!week || !flow.startIso) return null;
  return addCalendarDays(flow.startIso, (week - 1) * 7);
}

/** ISO date a phase opens: CX's chosen date, else the calendar date (null = no date). */
export function phaseOpensOn(phaseId, flow) {
  return customOpenDate(phaseId, flow) || standardOpensOn(phaseId, flow);
}

/**
 * @returns {{ open: boolean, reason: 'payment'|'held'|'early'|'date'|'opened'|'no-dates', opensOn: string|null }}
 */
export function phaseGate(phase, { enrolled, flow }) {
  const opensOn = phaseOpensOn(phase?.id, flow);
  if (!phase) return { open: false, reason: 'payment', opensOn };
  if (!(enrolled || phase.openRegistered)) return { open: false, reason: 'payment', opensOn };
  const override = flow?.overrides?.[phase.id];
  if (override === 'locked') return { open: false, reason: 'held', opensOn };
  if (override === 'open') return { open: true, reason: 'early', opensOn };
  if (customOpenDate(phase.id, flow)) {
    return parseISODate(flow.todayIso) >= parseISODate(opensOn)
      ? { open: true, reason: 'opened', opensOn }
      : { open: false, reason: 'date', opensOn };
  }

  if (flow?.programId === 'lep') {
    // LEP without a Day 1 date: only the pre-work phases.
    if (!flow.day1Iso) return { open: ['pre-program', 'orientation'].includes(phase.id), reason: 'no-dates', opensOn };
    return opensOn && parseISODate(flow.todayIso) >= parseISODate(opensOn)
      ? { open: true, reason: 'opened', opensOn }
      : { open: false, reason: 'date', opensOn };
  }
  // 100BM / MBW: phases without a week number, or batches without a start date, open on payment.
  if (!opensOn) return { open: true, reason: 'no-dates', opensOn };
  return parseISODate(flow.todayIso) >= parseISODate(opensOn)
    ? { open: true, reason: 'opened', opensOn }
    : { open: false, reason: 'date', opensOn };
}

function niceDay(iso) {
  const d = iso ? new Date(`${iso}T12:00:00`) : null;
  return d && !Number.isNaN(d.getTime())
    ? d.toLocaleDateString('en-IN', { weekday: 'short', day: 'numeric', month: 'short' })
    : '';
}

/** Why a phase is closed, in the learner's words — and whether tapping should offer enrollment. */
export function phaseLockLabel(phase, { enrolled, flow }) {
  const gate = phaseGate(phase, { enrolled, flow });
  if (gate.open) return null;
  if (gate.reason === 'payment') return { text: 'Opens when you complete enrollment', enroll: true };
  if (gate.reason === 'date' && gate.opensOn) return { text: `Opens ${niceDay(gate.opensOn)}`, enroll: false };
  return { text: 'Opening soon', enroll: false };
}

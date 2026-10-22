/**
 * Which kind of learner the signed-in learner is — for showing CMS items meant
 * for part paid, full paid or late joiners. Mirrors LMS functions/learnerSegments.js
 * (the CMS counts and the scheduler); change both together.
 */
import { PAYMENT_STATUS } from '../constants/programs';
import { programPaymentStatus } from './programAccess';

function toMs(value) {
  if (!value) return null;
  if (typeof value === 'number') return value;
  if (typeof value.toMillis === 'function') return value.toMillis();
  if (typeof value.seconds === 'number') return value.seconds * 1000;
  const t = Date.parse(value);
  return Number.isFinite(t) ? t : null;
}

function batchStartMs(batch) {
  const sessions = batch?.sessions || [];
  const s0 = sessions.find((s) => s.code === 'S0') || sessions[0];
  const fromSession = toMs(s0?.startAt);
  if (fromSession) return fromSession;
  const day = String(batch?.orientationDate || batch?.day1Date || '').slice(0, 10);
  return day ? Date.parse(`${day}T09:00:00+05:30`) : null;
}

export function learnerPayment(profile, programId = 'lep') {
  const n = programPaymentStatus(profile, programId);
  if (n === PAYMENT_STATUS.PAID) return 'paid';
  if (n === PAYMENT_STATUS.REGISTER) return 'register';
  return 'unknown';
}

/** First payment after the batch's Orientation started. The CMS preview sets joinedLate directly. */
export function isLateJoiner(profile, batch, programId = 'lep') {
  const access = profile?.programAccess?.[programId] || {};
  if (access.joinedLate) return true;
  const start = batchStartMs(batch);
  const times = [access.registrationPaidAt, access.registeredAt, access.fullPaidAt, access.enrolledAt].map(toMs).filter(Boolean);
  return Boolean(start && times.length && Math.min(...times) > start);
}

/** Is a CMS item for `audience` ('all' | 'register' | 'paid' | 'late') meant for this learner? */
export function inAudience(audience, profile, batch, programId = 'lep') {
  if (!audience || audience === 'all') return true;
  if (audience === 'late') return isLateJoiner(profile, batch, programId);
  return learnerPayment(profile, programId) === audience;
}

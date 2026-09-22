import {
  PROGRAM_JOURNEY,
  PAYMENT_STATUS,
  getProgramEntry,
} from '../constants/programs';

function asList(value) {
  return Array.isArray(value) ? value : [];
}

function normalizePaymentStatus(value) {
  const v = (value || '').toString().toLowerCase().trim();
  if (['paid', 'full', 'complete', 'full_payment', 'paid_full'].includes(v)) {
    return PAYMENT_STATUS.PAID;
  }
  if (
    ['register', 'registration', 'reg', 'partial', 'registration_fee', 'completed'].includes(
      v
    )
  ) {
    return PAYMENT_STATUS.REGISTER;
  }
  if (
    [
      'unpaid',
      'not paid',
      'pending',
      'none',
      '',
      'failed',
      'declined',
      'rejected',
      'cancelled',
      'canceled',
      'refunded',
      'expired',
    ].includes(v)
  ) {
    return PAYMENT_STATUS.UNPAID;
  }
  return v || PAYMENT_STATUS.UNPAID;
}

/** Programs the learner is enrolled in (same sources as web LMS). */
export function getEnrolledProgramIds(profile) {
  const ids = new Set();
  if (!profile) return ids;

  const primary = getProgramEntry(profile.program);
  if (primary) ids.add(primary.id);

  asList(profile.programs).forEach((value) => {
    const entry = getProgramEntry(value);
    if (entry) ids.add(entry.id);
  });

  // Some profiles store enrolledCourses as program codes
  asList(profile.enrolledCourses).forEach((value) => {
    const entry = getProgramEntry(value);
    if (entry) ids.add(entry.id);
  });

  return ids;
}

export function getEnrolledPrograms(profile) {
  const ids = getEnrolledProgramIds(profile);
  return PROGRAM_JOURNEY.filter((p) => ids.has(p.id));
}

export function canAccessProgram(programIdOrCode, profile) {
  const entry = getProgramEntry(programIdOrCode);
  if (!entry || !profile) return false;
  return getEnrolledProgramIds(profile).has(entry.id);
}

export function programPaymentStatus(profile, programId) {
  const perProgram = profile?.programAccess?.[programId]?.paymentStatus;
  if (perProgram) return normalizePaymentStatus(perProgram);
  return normalizePaymentStatus(profile?.paymentStatus);
}

/** Enrolled + not unpaid → can open tasks (matches web canOpenProgramTasks). */
export function canOpenProgramTasks(programIdOrCode, profile) {
  const entry = getProgramEntry(programIdOrCode);
  if (!entry) return false;
  if (!canAccessProgram(entry.id, profile)) return false;
  return programPaymentStatus(profile, entry.id) !== PAYMENT_STATUS.UNPAID;
}

export function learnerBatchId(profile) {
  return profile?.batchId || profile?.batch || 'default';
}

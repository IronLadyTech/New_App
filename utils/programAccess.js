import {
  PROGRAM_JOURNEY,
  PAYMENT_STATUS,
  getProgramEntry,
} from '../constants/programs';

function asList(value) {
  return Array.isArray(value) ? value : [];
}

/** Match Zoho / Firestore program names (same rules as web LMS accessTiers). */
export function normalizeProgramId(value) {
  const v = String(value || '').toLowerCase().trim();
  if (!v) return null;
  if (
    ['mbw', 'master of business warfare', 'business warfare'].includes(v) ||
    v.includes('business warfare')
  ) {
    return 'mbw';
  }
  if (
    ['lep', 'leadership essentials program', 'leadership essentials'].includes(v) ||
    v.includes('leadership essentials')
  ) {
    return 'lep';
  }
  if (
    [
      '100bm',
      '100 bm',
      '100bm program',
      '100 board members program',
      '100 board members',
      '100 business minds',
    ].includes(v) ||
    /100\s*bm/.test(v) ||
    v.includes('100 board')
  ) {
    return '100bm';
  }
  const entry = getProgramEntry(v);
  return entry?.id || null;
}

/** programs may be an array, a comma string, or nested values from Zoho. */
function expandProgramValues(value) {
  if (value == null || value === '') return [];
  if (Array.isArray(value)) {
    return value.flatMap((item) => expandProgramValues(item));
  }
  return String(value)
    .split(',')
    .map((part) => part.trim())
    .filter(Boolean);
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

/** Programs the learner is enrolled in (Zoho + Firestore profile fields). */
export function getEnrolledProgramIds(profile) {
  const ids = new Set();
  if (!profile) return ids;

  const primaryId = normalizeProgramId(profile.program);
  if (primaryId) ids.add(primaryId);

  expandProgramValues(profile.programs).forEach((value) => {
    const id = normalizeProgramId(value);
    if (id) ids.add(id);
  });

  // Zoho writes per-program tiers here; always treat as enrolled (payment gates tasks).
  Object.keys(profile.programAccess || {}).forEach((programId) => {
    const id = normalizeProgramId(programId);
    if (id) ids.add(id);
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

import { PAYMENT_STATUS } from '../constants/programs';
import { normalizeProgramId, programPaymentStatus } from './programAccess';

export function lepFirstName(profile) {
  const raw = profile?.displayName || profile?.firstName || '';
  const first = String(raw).trim().split(/\s+/)[0];
  return first || 'Ananya';
}

export function lepFullName(profile) {
  return profile?.displayName || 'Ananya Rao';
}

export function getActiveProgram(profile) {
  if (profile?.labProgram) return profile.labProgram;
  return normalizeProgramId(profile?.program) || 'lep';
}

export function getLepState(profile) {
  const program = getActiveProgram(profile);
  if (profile?.labProgram === program && (profile?.labState === 'enrolled' || profile?.labState === 'registered')) {
    return profile.labState;
  }
  if (profile?.labLep === 'enrolled' || profile?.labLep === 'registered') {
    return profile.labLep;
  }
  const pay = programPaymentStatus(profile, program);
  if (pay === PAYMENT_STATUS.PAID) return 'enrolled';
  return 'registered';
}

export function isLepEnrolled(profile) {
  if (profile?.labProgram === 'lep' && (profile?.labState === 'enrolled' || profile?.labState === 'registered')) {
    return profile.labState === 'enrolled';
  }
  return programPaymentStatus(profile, 'lep') === PAYMENT_STATUS.PAID;
}

import { PAYMENT_STATUS } from '../constants/programs';
import { getEnrolledProgramIds, programPaymentStatus } from './programAccess';

export function mcRecordingsUnlocked(profile) {
  if (!profile) return false;
  if (profile.programAccess?.mc?.recordingsUnlocked === true) return true;
  if (profile.masterclassEnrolled === true) return true;
  const status = String(profile.leadStatus || profile.programAccess?.mc?.leadStatus || '').toLowerCase();
  return isMcLeadStatusText(status);
}

export function isMcLeadStatusText(statusRaw) {
  const s = String(statusRaw || '').toLowerCase().replace(/[_-]/g, ' ').trim();
  if (!s) return false;
  if (s.startsWith('mc ') || s.includes('masterclass')) return true;
  return ['mc enrolled', 'mc registered', 'mc completed', 'mc attended'].some((x) => s.includes(x));
}

/** Signed-in learner with MC access only (no LEP / 100BM / MBW seat yet). */
export function isMcOnlyProfile(profile) {
  if (!mcRecordingsUnlocked(profile)) return false;
  const ids = getEnrolledProgramIds(profile);
  const hasProgram = ['lep', '100bm', 'mbw'].some((id) => {
    if (!ids.has(id)) return false;
    const pay = programPaymentStatus(profile, id);
    return pay === PAYMENT_STATUS.PAID || pay === PAYMENT_STATUS.REGISTER;
  });
  return !hasProgram;
}

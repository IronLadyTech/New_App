/**
 * Learner-facing copy for profile / welcome saves — never show raw Zoho or Cloud Function errors.
 */

const SAVED_OK = 'Saved successfully.';
const SAVED_APP_ONLY =
  'Saved in the app. Your registration record will update shortly — no need to enter this again.';
const SAVE_FAILED = 'We could not save that right now. Check your connection and try again.';
const BATCH_SAVED_APP =
  'Your batch is saved in the app. If anything looks wrong on your dashboard, tap Change batch date or contact support@ironlady.tech.';

/** Strip technical detail before it could leak into UI. */
export function sanitizeParticipantDetail(raw) {
  const text = String(raw || '').trim();
  if (!text) return '';
  const lower = text.toLowerCase();
  if (
    lower.includes('zoho') ||
    lower.includes('cloud function') ||
    lower.includes('functions/') ||
    lower.includes('firebase') ||
    lower.includes('callable') ||
    lower.includes('oauth') ||
    lower.includes('crm/v2') ||
    lower.includes('leadid') ||
    lower.includes('emulator') ||
    lower.includes('deadline-exceeded') ||
    lower.includes('internal') ||
    lower.includes('cannot write lep_batch')
  ) {
    return '';
  }
  return text;
}

/**
 * After updateMyWelcomeProfile (city / domain / bhag).
 * @returns {{ saved: boolean, zohoSynced: boolean, message: string, isError: boolean }}
 */
export function welcomeSaveFeedback(result, error) {
  if (error) {
    const code = String(error?.code || '');
    const timedOut =
      code === 'functions/deadline-exceeded' ||
      code === 'client-timeout' ||
      String(error?.message || '').toLowerCase().includes('timeout');
    if (timedOut) {
      return { saved: true, zohoSynced: false, message: SAVED_APP_ONLY, isError: false };
    }
    return { saved: false, zohoSynced: false, message: SAVE_FAILED, isError: true };
  }
  if (result?.reasonCode === 'timeout') {
    return { saved: true, zohoSynced: false, message: SAVED_APP_ONLY, isError: false };
  }
  if (!result || result.ok === false) {
    const detail = sanitizeParticipantDetail(result?.reason);
    return {
      saved: false,
      zohoSynced: false,
      message: detail || SAVE_FAILED,
      isError: true,
    };
  }
  if (result.zoho === true) {
    return { saved: true, zohoSynced: true, message: SAVED_OK, isError: false };
  }
  return { saved: true, zohoSynced: false, message: SAVED_APP_ONLY, isError: false };
}

export function batchZohoFeedback(zohoResult, error) {
  if (error) {
    return { message: BATCH_SAVED_APP, showAlert: true };
  }
  if (zohoResult?.zoho === true) {
    return { message: '', showAlert: false };
  }
  return { message: BATCH_SAVED_APP, showAlert: true };
}

export function refreshAccessFeedback(data) {
  if (data?.ok === true || data?.throttled === true) {
    return 'Your access is up to date.';
  }
  return 'We could not refresh right now. Try again in a minute.';
}

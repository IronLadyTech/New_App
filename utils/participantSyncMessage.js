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
    return { message: BATCH_SAVED_APP, showAlert: true, reasonCode: 'error' };
  }
  if (zohoResult?.zoho === true) {
    return {
      message: 'Your batch is saved and your registration record is updated.',
      showAlert: true,
      reasonCode: 'zoho_ok',
    };
  }
  if (zohoResult?.reasonCode === 'lead_not_found') {
    return {
      message:
        'Your batch is saved in the app. If your dashboard looks wrong, email support@ironlady.tech with your mobile number.',
      showAlert: true,
      reasonCode: 'lead_not_found',
    };
  }
  if (zohoResult?.reasonCode === 'timeout') {
    return {
      message:
        'Your batch is saved. Your dashboard may take a minute to update — open Home again or pull to refresh.',
      showAlert: true,
      reasonCode: 'timeout',
    };
  }
  if (zohoResult?.reasonCode === 'zoho_write_failed') {
    return {
      message:
        'Your batch is saved in the app. If dates still look wrong, try Change batch date once or email support@ironlady.tech.',
      showAlert: true,
      reasonCode: 'zoho_write_failed',
    };
  }
  return { message: BATCH_SAVED_APP, showAlert: true, reasonCode: zohoResult?.reasonCode || 'zoho_pending' };
}

/** Staff / __DEV__: which leg failed after Change batch. */
export function batchSyncStageLabel(zohoResult) {
  if (!zohoResult) return 'no_response';
  if (zohoResult.zoho === true) return 'app_and_zoho';
  return `app_only:${zohoResult.reasonCode || 'unknown'}`;
}

export function refreshAccessFeedback(data) {
  if (data?.ok === true || data?.throttled === true) {
    return 'Your access is up to date.';
  }
  return 'We could not refresh right now. Try again in a minute.';
}

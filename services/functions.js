/**
 * Client wrappers for Iron Lady LMS Cloud Functions (lmsironlady).
 * Secrets stay server-side — never call Zoho from the app.
 */
import { httpsCallable } from 'firebase/functions';
import { functions, loginFunctions } from './firebase';

function call(name, data = {}) {
  return httpsCallable(functions, name)(data);
}

function formatCallableError(err, fallback) {
  const code = err?.code || '';
  if (code === 'functions/deadline-exceeded') {
    return 'The server timed out. Try again in a moment.';
  }
  if (code === 'functions/unavailable' || code === 'functions/internal') {
    return 'Cloud Function unavailable. Try again later.';
  }
  if (code === 'functions/permission-denied') {
    return err?.message || 'Permission denied.';
  }
  return err?.message || fallback;
}

/** First login — create Firebase user from Zoho IL_Users if credentials match. */
export async function ensureZohoUserOnLogin(email, password) {
  const { data } = await httpsCallable(loginFunctions, 'ensureZohoUserOnLogin')({
    email,
    password,
  });
  return data;
}

/** Pull this learner's entitlements from Zoho (throttled server-side). */
export async function refreshMyAccess() {
  try {
    const { data } = await call('refreshMyAccess', {});
    return data;
  } catch {
    return null;
  }
}

/** Sync password to Zoho (background — signup/login). */
export async function syncPasswordResetToZoho(newPassword, options = {}) {
  try {
    const { data } = await call('syncPasswordResetToZoho', {
      newPassword,
      phase: options.phase || 'login',
    });
    return data;
  } catch (err) {
    console.warn('Zoho credential sync:', err?.message || err);
    return null;
  }
}

/** Snapshot credential to Zoho before sending reset email. */
export async function syncCredentialBeforeReset(email) {
  try {
    const { data } = await call('syncCredentialBeforeReset', { email });
    return data;
  } catch (err) {
    console.warn('Pre-reset Zoho sync:', err?.message || err);
    return null;
  }
}

/**
 * Entitled lesson media URL (paid content gate).
 * Returns { url, reason } — reason set when denied/unavailable.
 */
export async function fetchLessonAsset(taskId) {
  if (!taskId) return { url: null, reason: 'unavailable' };
  try {
    const { data } = await call('getLessonAsset', { taskId });
    return { url: data?.url || null, reason: null };
  } catch (err) {
    const reason =
      err?.code === 'functions/permission-denied' ? err.message : 'unavailable';
    return { url: null, reason };
  }
}

/** IL Guide whisper — Firebase Cloud Function on lmsironlady. */
export async function fetchILGuideWhisperFromCloud(context) {
  try {
    const { data } = await call('ilGuideWhisper', { context });
    if (!data?.message) return null;
    return {
      id: data.id || `cloud-${Date.now()}`,
      message: data.message,
      job: data.job || 'nudge',
    };
  } catch (err) {
    if (err?.code === 'functions/permission-denied') return null;
    console.warn('IL Guide cloud:', err?.message || err);
    return null;
  }
}

export { formatCallableError };

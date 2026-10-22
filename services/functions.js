/**
 * Client wrappers for Iron Lady LMS Cloud Functions (lmsironlady).
 * Secrets stay server-side — never call Zoho from the app.
 */
import { httpsCallable } from 'firebase/functions';
import { functions, loginFunctions } from './firebase';

function call(name, data = {}) {
  return httpsCallable(functions, name)(data);
}

const WELCOME_SAVE_TIMEOUT_MS = 10_000;

export function isCallableTimeout(err) {
  const code = String(err?.code || '');
  const msg = String(err?.message || '').toLowerCase();
  return (
    code === 'functions/deadline-exceeded' ||
    code === 'client-timeout' ||
    msg.includes('deadline-exceeded') ||
    msg.includes('timeout')
  );
}

function withTimeout(promise, ms, label = 'client-timeout') {
  return new Promise((resolve, reject) => {
    const timer = setTimeout(() => {
      const err = new Error('Request timed out');
      err.code = label;
      reject(err);
    }, ms);
    promise.then(
      (v) => {
        clearTimeout(timer);
        resolve(v);
      },
      (e) => {
        clearTimeout(timer);
        reject(e);
      }
    );
  });
}

function formatCallableError(err, fallback) {
  const code = err?.code || '';
  if (__DEV__ && code) {
    console.warn('[Cloud Function]', code, err?.message || err);
  }
  if (code === 'functions/deadline-exceeded') {
    return 'The server timed out. Try again in a moment.';
  }
  if (code === 'functions/not-found') {
    return __DEV__
      ? 'Callable resolvePhoneAccess not deployed (lmsironlady).'
      : 'Service not ready. Try again later.';
  }
  if (code === 'functions/unavailable' || code === 'functions/internal') {
    return __DEV__
      ? `Cloud Function unavailable (${code}). Check emulator internet and reload with: npx expo start -c`
      : 'Cloud Function unavailable. Try again later.';
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

/** Look up this mobile number in Zoho and open guest or program access. */
export async function resolvePhoneAccess(phone) {
  const { data } = await call('resolvePhoneAccess', { phone });
  return data;
}

/** Save city, domain, or B-HAG onto this learner's Zoho Lead. */
export async function updateMyWelcomeProfile(fields) {
  const { data } = await call('updateMyWelcomeProfile', fields);
  return data;
}

/**
 * Save welcome fields (waits up to ~10s). Server writes Firestore before Zoho.
 */
export async function saveWelcomeProfileFields(fields) {
  try {
    return await withTimeout(updateMyWelcomeProfile(fields), WELCOME_SAVE_TIMEOUT_MS);
  } catch (err) {
    if (__DEV__) console.warn('[saveWelcomeProfileFields]', err?.code || err?.message || err);
    if (isCallableTimeout(err)) {
      return { ok: true, zoho: false, reasonCode: 'timeout' };
    }
    throw err;
  }
}

/** Fire-and-forget welcome sync — use on Continue so navigation is instant. */
export function syncWelcomeProfileInBackground(fields, onResult) {
  saveWelcomeProfileFields(fields)
    .then((data) => {
      onResult?.(data);
      return data;
    })
    .catch(() => {
      onResult?.({ ok: true, zoho: false, reasonCode: 'timeout' });
      return null;
    });
}

/** Staff test: deliver CMS event to a learner (in-app row + optional FCM). Requires deployed function. */
export async function sendParticipantNotificationTest({ targetUid, eventCode, title, body, go }) {
  const { data } = await call('sendParticipantNotificationTest', {
    targetUid,
    eventCode,
    title,
    body,
    go,
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
      taskId: data.taskId || null,
    };
  } catch (err) {
    if (err?.code === 'functions/permission-denied') return null;
    console.warn('IL Guide cloud:', err?.message || err);
    return null;
  }
}

export { formatCallableError };

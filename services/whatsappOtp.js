/**
 * WhatsApp Cloud API OTP via il-guide-api (/otp/send, /otp/verify).
 * The server holds the Meta token and returns a Firebase custom token on success.
 */
import { signInWithCustomToken } from 'firebase/auth';
import { auth } from './firebase';
import { ensureUserProfile } from './auth';
import { refreshMyAccess } from './functions';
import { IL_GUIDE_API_KEY, IL_GUIDE_API_URL } from '../constants/ilGuide';

/** Off unless EXPO_PUBLIC_WHATSAPP_OTP=true and the API URL is set — demo codes otherwise. */
export const WHATSAPP_OTP_ENABLED =
  process.env.EXPO_PUBLIC_WHATSAPP_OTP === 'true' && !!IL_GUIDE_API_URL;

async function post(path, body) {
  const headers = { 'Content-Type': 'application/json' };
  if (IL_GUIDE_API_KEY) headers['X-API-Key'] = IL_GUIDE_API_KEY;
  let res;
  try {
    res = await fetch(`${IL_GUIDE_API_URL.replace(/\/$/, '')}${path}`, {
      method: 'POST',
      headers,
      body: JSON.stringify(body),
    });
  } catch {
    throw new Error('No connection. Check your internet and try again.');
  }
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data?.detail || 'Something went wrong. Try again.');
  return data;
}

export function sendWhatsAppOtp(phone) {
  return post('/otp/send', { phone });
}

/** Returns the Firebase custom token; throws with a user-facing message on a bad code. */
export async function verifyWhatsAppOtp(phone, code) {
  const data = await post('/otp/verify', { phone, code });
  return data.token;
}

export async function signInWithOtpToken(token) {
  const credential = await signInWithCustomToken(auth, token);
  await ensureUserProfile(credential.user, {
    phoneNumber: credential.user.phoneNumber,
  });
  refreshMyAccess();
  return credential.user;
}

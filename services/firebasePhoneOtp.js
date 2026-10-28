/**
 * Firebase Auth phone SMS OTP (reCAPTCHA on device).
 * After verify, the user should match resolvePhoneAccess provisioning (phone on Zoho email account).
 */
import { signInWithPhoneNumber } from 'firebase/auth';
import { auth } from './firebase';
import { ensureUserProfile } from './auth';
import { refreshMyAccess } from './functions';

export function sendFirebasePhoneOtp(phoneE164, appVerifier) {
  return signInWithPhoneNumber(auth, phoneE164, appVerifier);
}

export async function confirmFirebasePhoneOtp(confirmation, code) {
  const trimmed = String(code || '').replace(/\D/g, '');
  if (trimmed.length < 6) throw new Error('Enter the 6-digit code from your SMS.');
  const credential = await confirmation.confirm(trimmed);
  await ensureUserProfile(credential.user, {
    phoneNumber: credential.user.phoneNumber,
    displayName: credential.user.displayName,
  });
  refreshMyAccess().catch(() => {});
  return credential.user;
}

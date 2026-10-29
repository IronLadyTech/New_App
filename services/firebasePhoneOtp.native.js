/**
 * Native Firebase phone SMS — Android/iOS use Play Integrity / silent device checks (no reCAPTCHA modal).
 */
import rnAuth from '@react-native-firebase/auth';
import { confirmFirebasePhoneOtp } from './firebasePhoneOtpShared';

export async function sendFirebasePhoneOtp(phoneE164) {
  const confirmation = await rnAuth().signInWithPhoneNumber(phoneE164);
  return {
    verificationId: confirmation.verificationId,
    // Guests: proves the number without a session on the app's (JS SDK) auth.
    checkCodeOnly: (code) => confirmation.confirm(code),
  };
}

/**
 * Guests: check the SMS code on the native auth instance only, then sign that out.
 * The app watches the JS SDK auth, so no account opens and no user doc is written.
 */
export async function verifyFirebasePhoneOtpOnly(confirmation, code) {
  const trimmed = String(code || '').replace(/\D/g, '');
  if (trimmed.length < 6) throw new Error('Enter the 6-digit code from your SMS.');
  if (typeof confirmation?.checkCodeOnly !== 'function') {
    throw new Error('Sign-in session expired. Go back and request a new code.');
  }
  await confirmation.checkCodeOnly(trimmed);
  await rnAuth().signOut().catch(() => {});
  return true;
}

export { confirmFirebasePhoneOtp };

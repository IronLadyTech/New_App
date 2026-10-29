/**
 * Web Firebase phone SMS — requires reCAPTCHA ApplicationVerifier.
 */
import { signInWithPhoneNumber } from 'firebase/auth';
import { auth } from './firebase';
import { confirmFirebasePhoneOtp } from './firebasePhoneOtpShared';

export function sendFirebasePhoneOtp(phoneE164, appVerifier) {
  return signInWithPhoneNumber(auth, phoneE164, appVerifier);
}

/** Web guests stay on the demo code (no Firebase SMS on web), so this is never reached there. */
export async function verifyFirebasePhoneOtpOnly() {
  throw new Error('Phone check is not available here. Go back and try again.');
}

export { confirmFirebasePhoneOtp };

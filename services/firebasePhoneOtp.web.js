/**
 * Web Firebase phone SMS — requires reCAPTCHA ApplicationVerifier.
 */
import { signInWithPhoneNumber } from 'firebase/auth';
import { auth } from './firebase';
import { confirmFirebasePhoneOtp } from './firebasePhoneOtpShared';

export function sendFirebasePhoneOtp(phoneE164, appVerifier) {
  return signInWithPhoneNumber(auth, phoneE164, appVerifier);
}

export { confirmFirebasePhoneOtp };

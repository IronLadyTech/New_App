/**
 * Native Firebase phone SMS — Android/iOS use Play Integrity / silent device checks (no reCAPTCHA modal).
 */
import rnAuth from '@react-native-firebase/auth';
import { confirmFirebasePhoneOtp } from './firebasePhoneOtpShared';

export async function sendFirebasePhoneOtp(phoneE164) {
  const confirmation = await rnAuth().signInWithPhoneNumber(phoneE164);
  return { verificationId: confirmation.verificationId };
}

export { confirmFirebasePhoneOtp };

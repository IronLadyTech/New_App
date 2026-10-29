import { PhoneAuthProvider, signInWithCredential } from 'firebase/auth';
import { auth } from './firebase';
import { ensureUserProfile } from './auth';
import { refreshMyAccess } from './functions';

export async function confirmFirebasePhoneOtp(confirmation, code) {
  const trimmed = String(code || '').replace(/\D/g, '');
  if (trimmed.length < 6) throw new Error('Enter the 6-digit code from your SMS.');

  let userCredential;
  if (typeof confirmation?.confirm === 'function') {
    userCredential = await confirmation.confirm(trimmed);
  } else if (confirmation?.verificationId) {
    const credential = PhoneAuthProvider.credential(confirmation.verificationId, trimmed);
    userCredential = await signInWithCredential(auth, credential);
  } else {
    throw new Error('Sign-in session expired. Go back and request a new code.');
  }

  await ensureUserProfile(userCredential.user, {
    phoneNumber: userCredential.user.phoneNumber,
    displayName: userCredential.user.displayName,
  });
  refreshMyAccess().catch(() => {});
  return userCredential.user;
}

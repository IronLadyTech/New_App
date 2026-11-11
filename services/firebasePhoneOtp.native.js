/**
 * Native Firebase phone SMS — Android/iOS use Play Integrity / silent device checks (no reCAPTCHA modal).
 */
import rnAuth from '@react-native-firebase/auth';
import { confirmFirebasePhoneOtp } from './firebasePhoneOtpShared';

// While she is checking a typed code, the native sign-in it causes is not an auto-verify.
let manualCheck = false;

export async function sendFirebasePhoneOtp(phoneE164) {
  const confirmation = await rnAuth().signInWithPhoneNumber(phoneE164);
  return {
    verificationId: confirmation.verificationId,
    // Guests: proves the number without a session on the app's (JS SDK) auth.
    checkCodeOnly: (code) => confirmation.confirm(code),
  };
}

/**
 * Check the SMS code on the native auth instance only, then sign that out. The app watches
 * the JS SDK auth, so no account opens and no user doc is written. Returns the Firebase ID
 * token proving the number (learners exchange it for their account via claimPhoneAccess).
 */
export async function verifyFirebasePhoneOtpOnly(confirmation, code) {
  const trimmed = String(code || '').replace(/\D/g, '');
  if (trimmed.length < 6) throw new Error('Enter the 6-digit code from your SMS.');
  if (typeof confirmation?.checkCodeOnly !== 'function') {
    throw new Error('Sign-in session expired. Go back and request a new code.');
  }
  manualCheck = true;
  try {
    await confirmation.checkCodeOnly(trimmed);
    // Firebase's proof that this phone received the code: claimPhoneAccess checks it on the
    // server before handing out the account token. Then leave the native session.
    const current = rnAuth().currentUser;
    const idToken = current ? await current.getIdToken().catch(() => null) : null;
    await rnAuth().signOut().catch(() => {});
    return idToken || null;
  } finally {
    manualCheck = false;
  }
}

function last10(phone) {
  return String(phone || '').replace(/\D/g, '').slice(-10);
}

/**
 * Android reads the Firebase SMS by itself (Google Play services' SMS Retriever, which works
 * even when her SMS app files the message under spam and shows no notification) and signs
 * the native auth in. Watch for that: take the same ID-token proof a typed code gives, leave
 * the native session, and hand the proof over — she never has to find the SMS.
 * Returns an unsubscribe. iOS and phones without Play services simply never fire.
 */
export function watchAutoVerified(phoneE164, onProof) {
  const want = last10(phoneE164);
  const since = Date.now() - 2 * 60 * 1000; // the SMS was requested on the previous screen
  let done = false;
  const unsubscribe = rnAuth().onAuthStateChanged(async (user) => {
    if (done || manualCheck || !user || last10(user.phoneNumber) !== want) return;
    const signedIn = Date.parse(user.metadata?.lastSignInTime || '') || 0;
    if (signedIn && signedIn < since) return; // an old native session, not this code
    done = true;
    const idToken = await user.getIdToken().catch(() => null);
    await rnAuth().signOut().catch(() => {});
    if (idToken) onProof(idToken);
  });
  return () => {
    done = true;
    unsubscribe();
  };
}

export { confirmFirebasePhoneOtp };

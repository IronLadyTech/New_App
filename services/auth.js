import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  updateProfile,
  onAuthStateChanged,
  sendPasswordResetEmail,
} from 'firebase/auth';
import { doc, setDoc, getDoc, serverTimestamp } from 'firebase/firestore';
import { auth, db } from './firebase';
import {
  ensureZohoUserOnLogin,
  refreshMyAccess,
  syncPasswordResetToZoho,
  syncCredentialBeforeReset,
} from './functions';

/**
 * Create account + Firestore users/{uid} profile.
 * Roles align with web LMS: student | moderator | admin | superadmin | guest
 */
export async function signUp({ email, password, displayName, role = 'student' }) {
  const credential = await createUserWithEmailAndPassword(
    auth,
    email.trim(),
    password
  );
  const { user } = credential;

  if (displayName) {
    await updateProfile(user, { displayName: displayName.trim() });
  }

  await ensureUserProfile(user, {
    displayName: displayName?.trim() || '',
    role: role === 'teacher' ? 'admin' : role,
  });

  syncPasswordResetToZoho(password, { phase: 'login' });
  refreshMyAccess();

  return { user };
}

/**
 * Sign in — same flow as web LMS:
 * 1) Firebase Auth
 * 2) On invalid credentials → ensureZohoUserOnLogin (asia-south1) then retry
 */
export async function signIn({ email, password }) {
  const trimmedEmail = email?.trim();

  try {
    const credential = await signInWithEmailAndPassword(
      auth,
      trimmedEmail,
      password
    );
    await ensureUserProfile(credential.user);
    syncPasswordResetToZoho(password, { phase: 'login' });
    refreshMyAccess();
    return credential.user;
  } catch (err) {
    if (
      err?.code !== 'auth/invalid-credential' &&
      err?.code !== 'auth/user-not-found' &&
      err?.code !== 'auth/wrong-password'
    ) {
      throw err;
    }
  }

  // First login — provision Firebase user from Zoho IL_Users, then retry
  let zohoProvision = null;
  try {
    zohoProvision = await ensureZohoUserOnLogin(trimmedEmail, password);
  } catch (provisionErr) {
    console.warn('Zoho first-login provision skipped:', provisionErr?.message);
  }

  let credential;
  try {
    credential = await signInWithEmailAndPassword(auth, trimmedEmail, password);
  } catch (retryErr) {
    if (
      retryErr?.code === 'auth/invalid-credential' ||
      retryErr?.code === 'auth/user-not-found' ||
      retryErr?.code === 'auth/wrong-password'
    ) {
      throw new Error(zohoLoginHint(zohoProvision));
    }
    throw retryErr;
  }

  await ensureUserProfile(credential.user);
  syncPasswordResetToZoho(password, { phase: 'login' });
  refreshMyAccess();
  return credential.user;
}

function zohoLoginHint(zohoProvision) {
  const zohoReason = zohoProvision?.reason;
  if (zohoReason === 'Password does not match Zoho IL_Users record') {
    return 'That password does not match your Iron Lady registration record. Use the exact password from your welcome email.';
  }
  if (zohoReason === 'No IL_Users record for this email') {
    return 'No registration account found for this email yet. Complete Pre-IL registration payment first, or contact support.';
  }
  if (zohoProvision?.alreadyExists) {
    return 'An LMS account already exists for this email with a different password. Use Forgot password.';
  }
  if (zohoProvision?.ok === false && zohoReason) {
    return `Sign-in failed: ${zohoReason}`;
  }
  return 'Invalid email or password. Use your registration email and the password from your Iron Lady welcome email.';
}

async function ensureUserProfile(user, extras = {}) {
  const ref = doc(db, 'users', user.uid);
  const snap = await getDoc(ref);
  if (snap.exists()) return { id: snap.id, ...snap.data() };

  const profile = {
    uid: user.uid,
    email: user.email,
    displayName:
      extras.displayName ||
      user.displayName ||
      user.email?.split('@')[0] ||
      '',
    role: extras.role || 'student',
    enrolledCourseIds: [],
    points: 0,
    badges: [],
    photoURL: user.photoURL || null,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  };
  await setDoc(ref, profile);
  return profile;
}

export async function logOut() {
  await signOut(auth);
}

export async function resetPassword(email) {
  const trimmed = email.trim();
  await syncCredentialBeforeReset(trimmed);
  await sendPasswordResetEmail(auth, trimmed);
}

export function subscribeToAuth(callback) {
  return onAuthStateChanged(auth, callback);
}

export async function fetchUserProfile(uid) {
  const snap = await getDoc(doc(db, 'users', uid));
  if (!snap.exists()) return null;
  return { id: snap.id, ...snap.data() };
}

export function isStaff(role) {
  return ['teacher', 'admin', 'moderator', 'superadmin'].includes(role);
}

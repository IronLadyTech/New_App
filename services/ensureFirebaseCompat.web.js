import firebase from 'firebase/compat/app';
import 'firebase/compat/auth';
import { firebaseConfig } from './firebase';

/** expo-firebase-recaptcha on web uses firebase/compat and needs an app. */
export function ensureFirebaseCompat() {
  try {
    if (!firebase.apps.length) {
      firebase.initializeApp(firebaseConfig);
    }
  } catch (e) {
    console.warn('Firebase compat init skipped', e?.message);
  }
}

ensureFirebaseCompat();

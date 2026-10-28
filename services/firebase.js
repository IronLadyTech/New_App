/**
 * Firebase bootstrap — same project as web LMS: lmsironlady
 */
import 'react-native-url-polyfill/auto';
import { initializeApp, getApps, getApp } from 'firebase/app';
import {
  connectAuthEmulator,
  getAuth,
  initializeAuth,
  getReactNativePersistence,
} from 'firebase/auth';
import {
  connectFirestoreEmulator,
  getFirestore,
  initializeFirestore,
} from 'firebase/firestore';
import { getStorage } from 'firebase/storage';
import { connectFunctionsEmulator, getFunctions } from 'firebase/functions';
import { Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

/** Web LMS keys (Expo web + shared fields). */
const WEB_FIREBASE = {
  apiKey: 'AIzaSyAdrvMFjHpbgQ937cM4MhMsdpCDFf25kpc',
  appId: '1:829229653695:web:a144087bd1003910eff00a',
};

/** From google-services.json — required for native Android callables/auth. */
const ANDROID_FIREBASE = {
  apiKey: 'AIzaSyDIGbeY0TRx_INFjqsXfKnTmZPJMBqCrjA',
  appId: '1:829229653695:android:66df2d9eca9a9066eff00a',
};

/** From GoogleService-Info.plist — required for native iOS auth / FCM. */
const IOS_FIREBASE = {
  apiKey: 'AIzaSyAERbe0Sm0tRzK3WYuwn3mrmczYZR0hs2o',
  appId: '1:829229653695:ios:94a2598fe833fa34eff00a',
};

const native =
  Platform.OS === 'android'
    ? ANDROID_FIREBASE
    : Platform.OS === 'ios'
      ? IOS_FIREBASE
      : WEB_FIREBASE;

export const firebaseConfig = {
  apiKey: native.apiKey,
  authDomain: 'lmsironlady.firebaseapp.com',
  projectId: 'lmsironlady',
  storageBucket: 'lmsironlady.firebasestorage.app',
  messagingSenderId: '829229653695',
  appId: native.appId,
};

function ensureFirebaseApp() {
  if (!getApps().length) {
    return initializeApp(firebaseConfig);
  }
  try {
    return getApp();
  } catch {
    return initializeApp(firebaseConfig);
  }
}

const app = ensureFirebaseApp();

/** Compat SDK only for web helpers — must run AFTER modular initializeApp (never import compat at top level). */
function ensureCompatAppForWeb() {
  if (Platform.OS !== 'web') return;
  const firebaseCompat = require('firebase/compat/app').default;
  require('firebase/compat/auth');
  if (!firebaseCompat.apps.length) {
    firebaseCompat.initializeApp(firebaseConfig);
  }
}

ensureCompatAppForWeb();

function createNativeAuth() {
  if (Platform.OS === 'web') {
    return getAuth(app);
  }
  try {
    if (typeof getReactNativePersistence === 'function') {
      return initializeAuth(app, {
        persistence: getReactNativePersistence(AsyncStorage),
      });
    }
  } catch (err) {
    const msg = String(err?.message || '');
    if (!/already exists/i.test(msg)) {
      console.warn('[firebase] initializeAuth:', msg);
    }
  }
  return getAuth(app);
}

const auth = createNativeAuth();

function createFirestore() {
  if (Platform.OS === 'web') {
    return getFirestore(app);
  }
  try {
    return initializeFirestore(app, {
      experimentalAutoDetectLongPolling: true,
    });
  } catch (err) {
    const msg = String(err?.message || '');
    if (/already/i.test(msg)) {
      return getFirestore(app);
    }
    throw err;
  }
}

export const db = createFirestore();
export const storage = getStorage(app);

/** Most callables (resolvePhoneAccess, refreshMyAccess, ilGuideWhisper). */
export const functions = getFunctions(app, 'us-central1');

/** Login provisioning callable is deployed to asia-south1. */
export const loginFunctions = getFunctions(app, 'asia-south1');

// Local development only: `EXPO_PUBLIC_FIREBASE_EMULATOR=1 npx expo start --web` runs the app
// against the Firebase emulators (auth 9099, Firestore 8080, functions 5001) — no production data.
if (process.env.EXPO_PUBLIC_FIREBASE_EMULATOR === '1') {
  const host = process.env.EXPO_PUBLIC_FIREBASE_EMULATOR_HOST || '127.0.0.1';
  connectAuthEmulator(auth, `http://${host}:9099`, { disableWarnings: true });
  connectFirestoreEmulator(db, host, 8080);
  connectFunctionsEmulator(functions, host, 5001);
  connectFunctionsEmulator(loginFunctions, host, 5001);
}

export { auth, app };
export default app;

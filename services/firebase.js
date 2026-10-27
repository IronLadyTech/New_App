/**
 * Firebase bootstrap — same project as web LMS: lmsironlady
 */
import 'react-native-url-polyfill/auto';
import { initializeApp, getApps, getApp } from 'firebase/app';
import {
  initializeAuth,
  getAuth,
  getReactNativePersistence,
} from 'firebase/auth';
import { initializeFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';
import { getFunctions } from 'firebase/functions';
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

const native = Platform.OS === 'android' ? ANDROID_FIREBASE : WEB_FIREBASE;

export const firebaseConfig = {
  apiKey: native.apiKey,
  authDomain: 'lmsironlady.firebaseapp.com',
  projectId: 'lmsironlady',
  storageBucket: 'lmsironlady.firebasestorage.app',
  messagingSenderId: '829229653695',
  appId: native.appId,
};

const app = getApps().length ? getApp() : initializeApp(firebaseConfig);

function createNativeAuth() {
  if (Platform.OS === 'web') {
    return getAuth(app);
  }
  if (typeof getReactNativePersistence === 'function') {
    try {
      return initializeAuth(app, {
        persistence: getReactNativePersistence(AsyncStorage),
      });
    } catch (err) {
      const msg = String(err?.message || '');
      if (!/already exists/i.test(msg)) {
        console.warn('[firebase] initializeAuth:', msg);
      }
    }
  }
  return getAuth(app);
}

const auth = createNativeAuth();

// Match web LMS: long-polling helps on flaky mobile networks
export const db = initializeFirestore(app, {
  experimentalAutoDetectLongPolling: true,
});
export const storage = getStorage(app);

/** Most callables (resolvePhoneAccess, refreshMyAccess, ilGuideWhisper). */
export const functions = getFunctions(app, 'us-central1');

/** Login provisioning callable is deployed to asia-south1. */
export const loginFunctions = getFunctions(app, 'asia-south1');

export { auth, app };
export default app;

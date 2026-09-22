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
import AsyncStorage from '@react-native-async-storage/async-storage';

export const firebaseConfig = {
  apiKey: 'AIzaSyAdrvMFjHpbgQ937cM4MhMsdpCDFf25kpc',
  authDomain: 'lmsironlady.firebaseapp.com',
  projectId: 'lmsironlady',
  storageBucket: 'lmsironlady.firebasestorage.app',
  messagingSenderId: '829229653695',
  appId: '1:829229653695:web:a144087bd1003910eff00a',
};

const app = getApps().length ? getApp() : initializeApp(firebaseConfig);

let auth;
try {
  auth = initializeAuth(app, {
    persistence: getReactNativePersistence(AsyncStorage),
  });
} catch {
  auth = getAuth(app);
}

// Match web LMS: long-polling helps on flaky mobile networks
export const db = initializeFirestore(app, {
  experimentalAutoDetectLongPolling: true,
});
export const storage = getStorage(app);

/** Default region (most callables). */
export const functions = getFunctions(app);

/** Login provisioning callable is deployed to asia-south1. */
export const loginFunctions = getFunctions(app, 'asia-south1');

export { auth, app };
export default app;

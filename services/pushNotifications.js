import { Platform } from 'react-native';
import Constants from 'expo-constants';
import * as Device from 'expo-device';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { removePushDevice, saveFcmToken, savePushDevice } from './firestore';

const INSTALL_ID_KEY = 'il.push.installId';
const NATIVE_TOKEN_KEY = 'il.push.nativeToken';
/** `${uid}:${token}` last written to Firestore from this phone. */
const SAVED_FOR_KEY = 'il.push.savedFor.v1';

/** Stable id for this install — one devices/{installId} row per phone. */
async function getInstallId() {
  let id = await AsyncStorage.getItem(INSTALL_ID_KEY).catch(() => null);
  if (!id) {
    id = `${Platform.OS}-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`;
    await AsyncStorage.setItem(INSTALL_ID_KEY, id).catch(() => {});
  }
  return id;
}

/** Expo push token (iPhone pushes go through Expo → APNs). null when unavailable. */
async function getExpoToken() {
  try {
    const projectId = Constants.expoConfig?.extra?.eas?.projectId || Constants.easConfig?.projectId;
    const res = await Notifications.getExpoPushTokenAsync(projectId ? { projectId } : undefined);
    return res?.data || null;
  } catch {
    return null;
  }
}

/** Expo Go (Android SDK 53+) throws if remote push APIs are used. */
export function isExpoGo() {
  return Constants.appOwnership === 'expo';
}

function notifications() {
  if (isExpoGo()) return null;
  try {
    return require('expo-notifications');
  } catch {
    return null;
  }
}

const Notifications = notifications();

try {
  Notifications?.setNotificationHandler?.({
    handleNotification: async () => ({
      shouldShowAlert: true,
      shouldShowBanner: true,
      shouldShowList: true,
      shouldPlaySound: true,
      shouldSetBadge: true,
    }),
  });
} catch {
  // Expo Go / unsupported runtime
}

/** Native FCM / APNs token — matches backend `users.fcmToken`. */
export async function getNativePushToken() {
  if (Platform.OS === 'web') {
    return { token: null, reason: 'web' };
  }
  if (!Notifications) {
    return { token: null, reason: 'expo-go' };
  }
  if (!Device.isDevice) {
    return { token: null, reason: 'simulator' };
  }

  const { status: existing } = await Notifications.getPermissionsAsync();
  let finalStatus = existing;
  if (existing !== 'granted') {
    const { status } = await Notifications.requestPermissionsAsync();
    finalStatus = status;
  }
  if (finalStatus !== 'granted') {
    return { token: null, reason: 'denied' };
  }

  if (Platform.OS === 'android') {
    await Notifications.setNotificationChannelAsync('default', {
      name: 'Iron Lady',
      importance: Notifications.AndroidImportance.HIGH,
      vibrationPattern: [0, 250, 250, 250],
    });
  }

  try {
    const deviceToken = await Notifications.getDevicePushTokenAsync();
    const token = deviceToken?.data;
    if (!token) return { token: null, reason: 'unavailable' };
    return { token, reason: null };
  } catch (e) {
    return { token: null, reason: e?.message || 'token_failed' };
  }
}

/**
 * Save this phone for push: its devices/{installId} row (native + Expo token), and on
 * Android also users.fcmToken, which the web LMS senders still read. The server skips
 * users.fcmToken when a device row carries the same token, so nothing arrives twice.
 */
export async function registerPushTokenForUser(uid) {
  if (!uid) return { ok: false, reason: 'no_user' };
  const { token, reason } = await getNativePushToken();
  if (!token) return { ok: false, reason };
  // Already saved for this learner on this phone: no write (each write re-renders the app).
  const savedKey = `${uid}:${token}`;
  if ((await AsyncStorage.getItem(SAVED_FOR_KEY).catch(() => null)) === savedKey) {
    return { ok: true, token, skipped: true };
  }
  const [installId, expoToken] = await Promise.all([getInstallId(), getExpoToken()]);
  await savePushDevice(uid, installId, {
    platform: Platform.OS,
    nativeToken: token,
    expoToken,
    appVersion: Constants.expoConfig?.version || '',
  });
  // An iPhone's native token is an APNs token, which FCM cannot use — Android only.
  if (Platform.OS === 'android') await saveFcmToken(uid, token);
  await AsyncStorage.setItem(NATIVE_TOKEN_KEY, token).catch(() => {});
  await AsyncStorage.setItem(SAVED_FOR_KEY, savedKey).catch(() => {});
  return { ok: true, token, expoToken };
}

/** Signing out: this phone stops getting her pushes; her other phones keep theirs. */
export async function unregisterPushForUser(uid) {
  if (!uid || Platform.OS === 'web') return;
  const [installId, nativeToken] = await Promise.all([
    AsyncStorage.getItem(INSTALL_ID_KEY).catch(() => null),
    AsyncStorage.getItem(NATIVE_TOKEN_KEY).catch(() => null),
  ]);
  await removePushDevice(uid, installId, nativeToken);
  await AsyncStorage.removeItem(NATIVE_TOKEN_KEY).catch(() => {});
  // Signed out: the next sign-in must write this phone's token again.
  await AsyncStorage.removeItem(SAVED_FOR_KEY).catch(() => {});
}

export function addPushTokenListener(callback) {
  if (!Notifications?.addPushTokenListener) return { remove() {} };
  try {
    return Notifications.addPushTokenListener(callback);
  } catch {
    return { remove() {} };
  }
}

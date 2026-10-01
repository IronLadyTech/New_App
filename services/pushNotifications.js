import { Platform } from 'react-native';
import Constants from 'expo-constants';
import * as Device from 'expo-device';
import { saveFcmToken } from './firestore';

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
      importance: Notifications.AndroidImportance.DEFAULT,
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

export async function registerPushTokenForUser(uid) {
  if (!uid) return { ok: false, reason: 'no_user' };
  const { token, reason } = await getNativePushToken();
  if (!token) return { ok: false, reason };
  await saveFcmToken(uid, token);
  return { ok: true, token };
}

export function addPushTokenListener(callback) {
  if (!Notifications?.addPushTokenListener) return { remove() {} };
  try {
    return Notifications.addPushTokenListener(callback);
  } catch {
    return { remove() {} };
  }
}

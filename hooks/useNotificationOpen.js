import { useEffect } from 'react';
import { Platform } from 'react-native';
import { isExpoGo } from '../services/pushNotifications';
import { normalizeGo } from '../utils/notificationGo';
import { navigateFromGo } from '../utils/navigationFromGo';

function notifications() {
  // Expo Go Android SDK 53+ throws if expo-notifications is loaded at all.
  if (Platform.OS === 'web' || isExpoGo()) return null;
  try {
    return require('expo-notifications');
  } catch {
    return null;
  }
}

/** Opens the right screen when the user taps a system push notification. */
export function useNotificationOpen() {
  useEffect(() => {
    const Notifications = notifications();
    if (!Notifications) return undefined;

    const handle = (response) => {
      const data = response?.notification?.request?.content?.data || {};
      const go = normalizeGo(data.go);
      if (go) navigateFromGo(go);
    };

    const sub = Notifications.addNotificationResponseReceivedListener(handle);

    Notifications.getLastNotificationResponseAsync()
      .then((last) => {
        if (last) handle(last);
      })
      .catch(() => {});

    return () => sub.remove();
  }, []);
}

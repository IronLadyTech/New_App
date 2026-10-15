import { useEffect, useRef } from 'react';
import { Platform } from 'react-native';
import { useAuth } from '../context/AuthContext';
import {
  addPushTokenListener,
  isExpoGo,
  registerPushTokenForUser,
} from '../services/pushNotifications';

/**
 * Registers native FCM/APNs token on `users.fcmToken` after sign-in.
 * Skipped in Expo Go — remote push was removed there from SDK 53.
 */
export function usePushNotifications() {
  const { user } = useAuth();
  const registeredRef = useRef(false);

  useEffect(() => {
    if (!user?.uid) {
      registeredRef.current = false;
      return undefined;
    }
    if (registeredRef.current) return undefined;
    if (Platform.OS === 'web' || isExpoGo()) return undefined;

    let cancelled = false;
    (async () => {
      try {
        const result = await registerPushTokenForUser(user.uid);
        if (cancelled) return;
        if (result.ok) {
          registeredRef.current = true;
        } else if (result.reason) {
          console.warn('[push] token not saved:', result.reason);
        }
      } catch (e) {
        console.warn('[push] registration failed:', e?.message || e);
      }
    })();

    const sub = addPushTokenListener(async () => {
      try {
        await registerPushTokenForUser(user.uid);
      } catch {
        // ignore
      }
    });

    return () => {
      cancelled = true;
      sub.remove?.();
    };
  }, [user?.uid]);
}

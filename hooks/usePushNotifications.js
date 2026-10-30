import { useEffect, useRef } from 'react';
import { Platform } from 'react-native';
import { useAuth } from '../context/AuthContext';
import { setupLocalEngagementNotifications } from '../services/localEngagementNotifications';
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
  const { user, profile } = useAuth();
  const registeredRef = useRef(false);
  const lastToken = useRef(null);

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
        if (result.token) lastToken.current = result.token;
        if (result.ok) {
          registeredRef.current = true;
          setupLocalEngagementNotifications(profile).catch(() => {});
        } else if (result.reason) {
          console.warn('[push] token not saved:', result.reason);
        }
      } catch (e) {
        console.warn('[push] registration failed:', e?.message || e);
      }
    })();

    // Only a real token change re-registers. Asking for the token (which registering does)
    // also fires this listener, so registering here unconditionally looped forever: a write to
    // users/{uid} every few seconds, and every screen redrew on each one.
    const sub = addPushTokenListener(async (event) => {
      const next = event?.data;
      if (!next || next === lastToken.current) return;
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

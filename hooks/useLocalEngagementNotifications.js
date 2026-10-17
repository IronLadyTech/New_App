import { useEffect, useRef } from 'react';
import { Platform } from 'react-native';
import { useAuth } from '../context/AuthContext';
import { setupLocalEngagementNotifications } from '../services/localEngagementNotifications';

/**
 * After sign-in: one-time welcome + daily streak local notification
 * (Duolingo-style, with Iron Lady large logo on Android).
 */
export function useLocalEngagementNotifications() {
  const { user, profile } = useAuth();
  const ranForUid = useRef(null);

  useEffect(() => {
    if (Platform.OS === 'web') return undefined;
    if (!user?.uid) {
      ranForUid.current = null;
      return undefined;
    }
    // Re-run when display name arrives so streak copy uses the right first name.
    const key = `${user.uid}:${profile?.displayName || profile?.firstName || ''}`;
    if (ranForUid.current === key) return undefined;
    ranForUid.current = key;

    let cancelled = false;
    (async () => {
      try {
        await setupLocalEngagementNotifications(profile);
      } catch (e) {
        if (!cancelled) {
          console.warn('[local-notif] setup failed:', e?.message || e);
        }
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [user?.uid, profile?.displayName, profile?.firstName]);
}

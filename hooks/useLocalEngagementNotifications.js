import { useCallback, useEffect, useRef } from 'react';
import { AppState, Platform } from 'react-native';
import { useAuth } from '../context/AuthContext';
import { setupLocalEngagementNotifications } from '../services/localEngagementNotifications';

/**
 * After sign-in: one-time welcome + daily streak local notification
 * (Duolingo-style, with Iron Lady large logo on Android).
 */
export function useLocalEngagementNotifications() {
  const { user, profile } = useAuth();
  const lastOkKey = useRef('');

  const runSetup = useCallback(async () => {
    if (Platform.OS === 'web' || !user?.uid) return;
    const key = `${user.uid}:${profile?.displayName || profile?.firstName || ''}`;
    try {
      const result = await setupLocalEngagementNotifications(profile);
      if (result.streak?.ok) {
        lastOkKey.current = key;
      } else if (result.streak?.reason && result.streak.reason !== 'expo-go') {
        console.warn('[local-notif] streak:', result.streak.reason);
      }
    } catch (e) {
      console.warn('[local-notif] setup failed:', e?.message || e);
    }
  }, [user?.uid, profile?.displayName, profile?.firstName, profile]);

  useEffect(() => {
    if (Platform.OS === 'web') return undefined;
    if (!user?.uid) {
      lastOkKey.current = '';
      return undefined;
    }

    const key = `${user.uid}:${profile?.displayName || profile?.firstName || ''}`;
    if (lastOkKey.current === key) return undefined;

    let cancelled = false;
    (async () => {
      if (!cancelled) await runSetup();
    })();

    const sub = AppState.addEventListener('change', (state) => {
      if (state !== 'active' || cancelled) return;
      // Retry after the user grants notification permission in system settings.
      if (lastOkKey.current !== key) runSetup();
    });

    return () => {
      cancelled = true;
      sub.remove();
    };
  }, [user?.uid, profile?.displayName, profile?.firstName, runSetup]);
}

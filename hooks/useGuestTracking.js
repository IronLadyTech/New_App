import { useEffect } from 'react';
import { AppState } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { getGuestIdentity, trackGuest } from '../services/appGuest';
import { scheduleGuestReminder } from '../services/localEngagementNotifications';

/** Guest app: count visits for the CMS guest list and keep the evening nudge set. */
export function useGuestTracking() {
  useEffect(() => {
    trackGuest('open');
    Promise.all([getGuestIdentity(), AsyncStorage.getItem('il_guest_name').catch(() => null)])
      .then(([{ tier }, name]) => scheduleGuestReminder({ name, tier }))
      .catch(() => {});
    const sub = AppState.addEventListener('change', (state) => {
      if (state === 'active') trackGuest('open');
    });
    return () => sub.remove();
  }, []);
}

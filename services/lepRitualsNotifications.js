import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';
import { isExpoGo } from './pushNotifications';

const FLAG = 'il.notif.lep-rituals.v1';
const DAILY_ID = 'il-lep-rituals-daily';
const WEEKLY_ID = 'il-lep-rituals-weekly';
const CHANNEL = 'lep-rituals';

function notifications() {
  if (Platform.OS === 'web' || isExpoGo()) return null;
  try {
    return require('expo-notifications');
  } catch {
    return null;
  }
}

async function ensurePermission(Notifications) {
  const { status: existing } = await Notifications.getPermissionsAsync();
  if (existing === 'granted') return true;
  const { status } = await Notifications.requestPermissionsAsync();
  return status === 'granted';
}

/**
 * Local reminders after 5 Rituals unlock: 8:00 morning nudge + Sunday 9:00 weekly score reminder.
 * Server CMS rules (RITUALS-AM / RITUALS-PM) still need unlock checks on the scheduler.
 */
export async function scheduleLepRitualsNotifications() {
  const Notifications = notifications();
  if (!Notifications) return { ok: false, reason: 'unavailable' };

  try {
    const already = await AsyncStorage.getItem(FLAG);
    if (already === '1') return { ok: true, skipped: true };

    const allowed = await ensurePermission(Notifications);
    if (!allowed) return { ok: false, reason: 'denied' };

    if (Platform.OS === 'android') {
      await Notifications.setNotificationChannelAsync(CHANNEL, {
        name: '5 Daily Rituals',
        importance: Notifications.AndroidImportance.HIGH,
      });
    }

    const Types = Notifications.SchedulableTriggerInputTypes || { DAILY: 'daily', CALENDAR: 'calendar' };

    await Notifications.cancelScheduledNotificationAsync(DAILY_ID).catch(() => {});
    await Notifications.scheduleNotificationAsync({
      identifier: DAILY_ID,
      content: {
        title: '5 Daily Rituals',
        body: 'Tick your five rituals in the tracker — up to 5 marks today.',
        color: '#ED1D24',
        data: { go: { to: 'home', screen: 'RitualsDashboard' }, kind: 'lep-rituals-daily' },
      },
      trigger:
        Platform.OS === 'ios'
          ? { type: Types.CALENDAR, repeats: true, hour: 8, minute: 0 }
          : { type: Types.DAILY, hour: 8, minute: 0, channelId: CHANNEL },
    });

    await Notifications.cancelScheduledNotificationAsync(WEEKLY_ID).catch(() => {});
    await Notifications.scheduleNotificationAsync({
      identifier: WEEKLY_ID,
      content: {
        title: 'Weekly rituals score',
        body: 'Check your 35-mark week on the 5 Rituals dashboard.',
        color: '#ED1D24',
        data: { go: { to: 'profile', screen: 'WeeklyBrief' }, kind: 'lep-rituals-weekly' },
      },
      trigger:
        Platform.OS === 'ios'
          ? { type: Types.CALENDAR, repeats: true, weekday: 1, hour: 9, minute: 0 }
          : { type: Types.CALENDAR, repeats: true, weekday: 1, hour: 9, minute: 0, channelId: CHANNEL },
    });

    await AsyncStorage.setItem(FLAG, '1');
    return { ok: true };
  } catch (e) {
    return { ok: false, reason: e?.message || 'schedule_failed' };
  }
}

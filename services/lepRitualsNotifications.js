import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';
import { isExpoGo } from './pushNotifications';

// v2: new wording — bumping the key makes every phone reschedule once with it.
const FLAG = 'il.notif.lep-rituals.v2';
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
 * Local reminders after 5 Rituals unlock: 8:00 morning nudge + Monday 9:00 weekly score reminder.
 * serverDaily: her batch has automatic reminders on, so the scheduler sends the morning
 * nudge (CMS RITUALS-AM) — skip the phone's own, or she gets two.
 */
export async function scheduleLepRitualsNotifications({ serverDaily = false } = {}) {
  const Notifications = notifications();
  if (!Notifications) return { ok: false, reason: 'unavailable' };

  try {
    // Re-run when the mode changes (batch switched to automatic, or back).
    const mode = serverDaily ? 'server' : 'local';
    const already = await AsyncStorage.getItem(FLAG);
    if (already === mode || (already === '1' && mode === 'local')) return { ok: true, skipped: true };

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
    if (!serverDaily) await Notifications.scheduleNotificationAsync({
      identifier: DAILY_ID,
      content: {
        title: 'Before your first meeting',
        body: 'Lead yourself before you lead the room. 5 Rituals, ten minutes.',
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
        title: 'Your week, scored',
        body: 'You keep a scorecard for your team. This one is yours: 35 marks, one week.',
        color: '#ED1D24',
        data: { go: { to: 'profile', screen: 'WeeklyBrief' }, kind: 'lep-rituals-weekly' },
      },
      trigger:
        Platform.OS === 'ios'
          ? { type: Types.CALENDAR, repeats: true, weekday: 1, hour: 9, minute: 0 }
          : { type: Types.CALENDAR, repeats: true, weekday: 1, hour: 9, minute: 0, channelId: CHANNEL },
    });

    await AsyncStorage.setItem(FLAG, mode);
    return { ok: true };
  } catch (e) {
    return { ok: false, reason: e?.message || 'schedule_failed' };
  }
}

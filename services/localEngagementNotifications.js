import { Linking, Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { isExpoGo } from './pushNotifications';

const WELCOME_FLAG = 'il.notif.welcome.v1';
const STREAK_ID = 'il-daily-streak';
const WELCOME_ID = 'il-welcome-install';
const STREAK_CHANNEL = 'streak';
const DEFAULT_CHANNEL = 'default';
/** 7:00 PM local — Duolingo-style streak nudge. */
const STREAK_HOUR = 19;
const STREAK_MINUTE = 0;

/**
 * Never require expo-notifications in Expo Go on Android — SDK 53+ throws
 * on module load (remote push removed). Use a dev build / APK for these.
 */
function notifications() {
  if (Platform.OS === 'web' || isExpoGo()) return null;
  try {
    return require('expo-notifications');
  } catch {
    return null;
  }
}

let handlerReady = false;

function ensureHandler(Notifications) {
  if (handlerReady) return;
  try {
    Notifications.setNotificationHandler({
      handleNotification: async () => ({
        shouldShowAlert: true,
        shouldShowBanner: true,
        shouldShowList: true,
        shouldPlaySound: true,
        shouldSetBadge: true,
      }),
    });
    handlerReady = true;
  } catch {
    // ignore
  }
}

async function ensureChannels(Notifications) {
  ensureHandler(Notifications);
  if (Platform.OS !== 'android') return;
  await Notifications.setNotificationChannelAsync(DEFAULT_CHANNEL, {
    name: 'Iron Lady',
    importance: Notifications.AndroidImportance.HIGH,
    vibrationPattern: [0, 250, 250, 250],
  });
  await Notifications.setNotificationChannelAsync(STREAK_CHANNEL, {
    name: 'Daily streak',
    importance: Notifications.AndroidImportance.HIGH,
    vibrationPattern: [0, 250, 250, 250],
    description: 'Daily reminder to keep your Iron Lady practice streak',
  });
}

async function ensurePermission(Notifications) {
  const { status: existing } = await Notifications.getPermissionsAsync();
  if (existing === 'granted') return true;
  const { status } = await Notifications.requestPermissionsAsync({
    ios: {
      allowAlert: true,
      allowBadge: true,
      allowSound: true,
    },
  });
  return status === 'granted';
}

function triggerTypes(Notifications) {
  return Notifications.SchedulableTriggerInputTypes || {
    TIME_INTERVAL: 'timeInterval',
    DAILY: 'daily',
    CALENDAR: 'calendar',
  };
}

/** Daily 7 PM — Android `daily`; iOS repeating `calendar` (daily trigger is Android-only in native). */
function buildStreakTrigger(Notifications) {
  const Types = triggerTypes(Notifications);
  if (Platform.OS === 'ios') {
    return {
      type: Types.CALENDAR,
      repeats: true,
      hour: STREAK_HOUR,
      minute: STREAK_MINUTE,
    };
  }
  return {
    type: Types.DAILY,
    hour: STREAK_HOUR,
    minute: STREAK_MINUTE,
    channelId: STREAK_CHANNEL,
  };
}

/**
 * One-time welcome after install / first open.
 * Full-color Iron Lady logo in the notification header/shade: app.json expo-notifications largeIcon → notification_large_icon.
 */
export async function scheduleWelcomeNotification() {
  const Notifications = notifications();
  if (!Notifications) return { ok: false, reason: 'unavailable' };

  try {
    const already = await AsyncStorage.getItem(WELCOME_FLAG);
    if (already === '1') return { ok: true, skipped: true };

    const allowed = await ensurePermission(Notifications);
    if (!allowed) return { ok: false, reason: 'denied' };
    await ensureChannels(Notifications);

    await Notifications.scheduleNotificationAsync({
      identifier: WELCOME_ID,
      content: {
        title: 'Welcome to Iron Lady',
        body: "You're in. Open the app — your first practice starts today.",
        color: '#ED1D24',
        sound: true,
        data: { go: { to: 'myProgram' }, kind: 'welcome' },
      },
      trigger: {
        type: triggerTypes(Notifications).TIME_INTERVAL,
        seconds: 4,
        channelId: DEFAULT_CHANNEL,
      },
    });

    await AsyncStorage.setItem(WELCOME_FLAG, '1');
    return { ok: true };
  } catch (e) {
    return { ok: false, reason: e?.message || 'welcome_failed' };
  }
}

const STREAK_PREFIX = 'il-streak-';
const STREAK_CATEGORY = 'streak'; // category ids may not contain "-" or ":"

/** Every streak reminder this phone has scheduled (and the old single repeating one). */
async function cancelStreakReminders(Notifications) {
  await Notifications.cancelScheduledNotificationAsync(STREAK_ID).catch(() => {});
  try {
    const pending = await Notifications.getAllScheduledNotificationsAsync();
    await Promise.all(
      (pending || [])
        .filter((req) => String(req?.identifier || '').startsWith(STREAK_PREFIX))
        .map((req) => Notifications.cancelScheduledNotificationAsync(req.identifier).catch(() => {}))
    );
  } catch {
    // nothing scheduled
  }
}

/**
 * The week of streak reminders from utils/streakReminderPlan.js — one per evening, each with its
 * own words, rebuilt whenever the streak changes. `reminders` empty / null: cancel them all
 * (not an LEP learner, or signed out).
 */
export async function syncStreakReminders(reminders) {
  const Notifications = notifications();
  if (!Notifications) return { ok: false, reason: 'unavailable' };
  try {
    await cancelStreakReminders(Notifications);
    if (!reminders?.length) return { ok: true, cancelled: true };
    const allowed = await ensurePermission(Notifications);
    if (!allowed) return { ok: false, reason: 'denied' };
    await ensureChannels(Notifications);
    await Notifications.setNotificationCategoryAsync(STREAK_CATEGORY, [
      { identifier: 'practise', buttonTitle: 'Practise now', options: { opensAppToForeground: true } },
    ]).catch(() => {});
    const Types = triggerTypes(Notifications);
    for (const r of reminders) {
      await Notifications.scheduleNotificationAsync({
        identifier: `${STREAK_PREFIX}${r.key}`,
        content: {
          title: r.title,
          body: r.body,
          subtitle: 'Daily practice',
          color: '#ED1D24',
          sound: true,
          categoryIdentifier: STREAK_CATEGORY,
          // Tap → Home. "Practise now" → straight into her first unfinished practice.
          data: { go: { to: 'home' }, actions: { practise: { to: 'practice' } }, kind: 'streak' },
        },
        trigger: { type: Types.DATE || 'date', date: r.at, channelId: STREAK_CHANNEL },
      });
    }
    return { ok: true, scheduled: reminders.length };
  } catch (e) {
    return { ok: false, reason: e?.message || 'streak_failed' };
  }
}

const BATTERY_ASKED = 'il.notif.batteryAsked.v1';

// Makers whose battery savers kill scheduled reminders unless the app is set to "No restrictions".
const AGGRESSIVE_BATTERY = /xiaomi|redmi|poco|oppo|realme|oneplus|vivo|iqoo|huawei|honor/i;

/** True on the phones above, from the build's manufacturer/brand (Android only). */
export function hasAggressiveBatterySaver() {
  if (Platform.OS !== 'android') return false;
  const c = Platform.constants || {};
  return AGGRESSIVE_BATTERY.test(`${c.Manufacturer || ''} ${c.Brand || ''}`);
}

/**
 * Once, on those phones: explain, then open this app's settings page, where Battery →
 * "No restrictions" (and Autostart on Xiaomi) keeps the 7 PM reminder alive. Apps cannot
 * change this themselves; `explain` resolves true when she wants to go there.
 */
export async function suggestBatteryUnrestrictedOnce(explain) {
  if (!hasAggressiveBatterySaver()) return;
  try {
    if (await AsyncStorage.getItem(BATTERY_ASKED)) return;
    await AsyncStorage.setItem(BATTERY_ASKED, '1');
    if (await explain()) await Linking.openSettings();
  } catch {
    /* settings page unavailable: nothing else to do */
  }
}

const EXACT_ALARM_ASKED = 'il.notif.exactAlarmAsked.v1';

/**
 * Android 12+: without "Alarms & reminders" the 7 PM reminder is an inexact alarm that
 * battery savers (Xiaomi, Oppo, Vivo…) push back by many minutes or drop. Asks once —
 * `explain` shows our reason first and resolves true to open the system setting.
 * @returns {Promise<boolean>} true when exact alarms are allowed (now or after she allowed it)
 */
export async function ensureExactAlarmsOnce(explain) {
  const Notifications = notifications();
  if (Platform.OS !== 'android' || !Notifications?.getExactAlarmPermissionsAsync) return true;
  try {
    const now = await Notifications.getExactAlarmPermissionsAsync();
    if (now?.granted) return true;
    if (now?.canAskAgain === false) return false;
    if (await AsyncStorage.getItem(EXACT_ALARM_ASKED)) return false;
    await AsyncStorage.setItem(EXACT_ALARM_ASKED, '1');
    if (!(await explain())) return false;
    const after = await Notifications.requestExactAlarmPermissionsAsync();
    return !!after?.granted;
  } catch {
    return false;
  }
}

/** Call after sign-in once permissions are available. */
export async function setupLocalEngagementNotifications(profile) {
  if (Platform.OS === 'web' || isExpoGo()) {
    return { welcome: { ok: false, reason: 'expo-go' }, streak: { ok: false, reason: 'expo-go' } };
  }
  const welcome = await scheduleWelcomeNotification();
  // Streak reminders are planned from the learner's real streak by StreakReminderSync (inside
  // the app's providers). Here: retire the old single repeating "keep your streak" reminder.
  const Notifications = notifications();
  if (Notifications) await Notifications.cancelScheduledNotificationAsync(STREAK_ID).catch(() => {});
  const streak = { ok: true, movedToSync: true };
  if (!welcome.ok && welcome.reason) {
    console.warn('[local-notif] welcome:', welcome.reason);
  }
  if (!streak.ok && streak.reason) {
    console.warn('[local-notif] streak:', streak.reason);
  }
  return { welcome, streak };
}

const GUEST_ID = 'il-guest-daily';

/**
 * Daily evening nudge for app guests (no account) until they finish the 4-day
 * challenge. Masterclass guests are pointed back to their recordings too.
 */
export async function scheduleGuestReminder({ name, tier } = {}) {
  if (Platform.OS === 'web' || isExpoGo()) return { ok: false, reason: 'unavailable' };
  const Notifications = notifications();
  if (!Notifications) return { ok: false, reason: 'unavailable' };
  try {
    const allowed = await ensurePermission(Notifications);
    if (!allowed) return { ok: false, reason: 'denied' };
    await ensureChannels(Notifications);
    await Notifications.cancelScheduledNotificationAsync(GUEST_ID).catch(() => {});
    const who = String(name || '').trim().split(/\s+/)[0];
    await Notifications.scheduleNotificationAsync({
      identifier: GUEST_ID,
      content: {
        title: who ? `${who}, 10 minutes for you tonight` : '10 minutes for you tonight',
        body:
          tier === 'mc'
            ? 'Rewatch your Masterclass recordings, then take the next day of your leadership challenge.'
            : 'The next day of your 4-day leadership challenge is waiting in Iron Lady.',
        color: '#ED1D24',
        sound: true,
        data: { go: { to: 'home' }, kind: 'guest' },
      },
      trigger: buildStreakTrigger(Notifications),
    });
    return { ok: true };
  } catch (e) {
    return { ok: false, reason: e?.message || 'guest_failed' };
  }
}

/** She finished the challenge — stop the daily guest nudge. */
export async function cancelGuestReminder() {
  const Notifications = notifications();
  if (!Notifications) return;
  await Notifications.cancelScheduledNotificationAsync(GUEST_ID).catch(() => {});
}

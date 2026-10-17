import { Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { isExpoGo } from './pushNotifications';

const WELCOME_FLAG = 'il.notif.welcome.v1';
const STREAK_ID = 'il-daily-streak';
const WELCOME_ID = 'il-welcome-install';
const STREAK_CHANNEL = 'streak';
const DEFAULT_CHANNEL = 'default';

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
  const { status } = await Notifications.requestPermissionsAsync();
  return status === 'granted';
}

function triggerTypes(Notifications) {
  return Notifications.SchedulableTriggerInputTypes || {
    TIME_INTERVAL: 'timeInterval',
    DAILY: 'daily',
  };
}

function firstName(profile) {
  const raw =
    profile?.displayName ||
    profile?.firstName ||
    profile?.name ||
    profile?.welcomeFirstName ||
    '';
  const part = String(raw).trim().split(/\s+/)[0];
  return part || 'Iron Lady';
}

/**
 * One-time welcome after install / first open.
 * Large Iron Lady logo on Android comes from manifest large_notification_icon.
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

/**
 * Duolingo-style daily streak nudge (local, repeating).
 * Android shows the Iron Lady logo as the large icon on the right.
 */
export async function scheduleDailyStreakNotification(profile) {
  const Notifications = notifications();
  if (!Notifications) return { ok: false, reason: 'unavailable' };

  try {
    const allowed = await ensurePermission(Notifications);
    if (!allowed) return { ok: false, reason: 'denied' };
    await ensureChannels(Notifications);

    const name = firstName(profile);
    // Cancel previous schedule so copy stays fresh with the learner’s name.
    await Notifications.cancelScheduledNotificationAsync(STREAK_ID).catch(() => {});

    await Notifications.scheduleNotificationAsync({
      identifier: STREAK_ID,
      content: {
        title: `${name}, keep your streak!`,
        body: "Do today's practice in Iron Lady — don't let the streak break.",
        color: '#ED1D24',
        sound: true,
        data: { go: { to: 'myProgram' }, kind: 'streak' },
      },
      trigger: {
        type: triggerTypes(Notifications).DAILY,
        hour: 19,
        minute: 0,
        channelId: STREAK_CHANNEL,
      },
    });

    return { ok: true };
  } catch (e) {
    return { ok: false, reason: e?.message || 'streak_failed' };
  }
}

/** Call after sign-in once permissions are available. */
export async function setupLocalEngagementNotifications(profile) {
  if (Platform.OS === 'web' || isExpoGo()) {
    return { welcome: { ok: false, reason: 'expo-go' }, streak: { ok: false, reason: 'expo-go' } };
  }
  const welcome = await scheduleWelcomeNotification();
  const streak = await scheduleDailyStreakNotification(profile);
  if (!welcome.ok && welcome.reason) {
    console.warn('[local-notif] welcome:', welcome.reason);
  }
  if (!streak.ok && streak.reason) {
    console.warn('[local-notif] streak:', streak.reason);
  }
  return { welcome, streak };
}

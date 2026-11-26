import { useEffect, useState } from 'react';
import { Alert, AppState, Linking, Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { calendarKeyFromUrl } from './calendarLinks';

export { calendarAllDay, calendarDates, calendarKeyFromUrl, googleCalendarUrl } from './calendarLinks';

/**
 * "Add to calendar" for every event and session in the app: one Google Calendar link format
 * (with a correct end time, also past midnight) and a remembered "added" state per event, so a
 * button she already used turns into a small green "In your calendar".
 *
 * On many Android phones the Google Calendar app takes over calendar.google.com links but drops
 * the event details (it just opens the month view). So on Android the link goes to Chrome, which
 * shows Google's "add event" page. And the button turns green only after she says it was saved.
 */

// v2: v1 marked an event as added as soon as the link opened, even when nothing was saved.
const KEY = 'il.calendarAdded.v2';
let added = {};
let loaded = false;
const subs = new Set();

function notify() {
  subs.forEach((fn) => fn());
}

async function load() {
  if (loaded) return;
  loaded = true;
  try {
    added = JSON.parse((await AsyncStorage.getItem(KEY)) || '{}') || {};
  } catch {
    added = {};
  }
  notify();
}

export function isCalendarAdded(key) {
  return Boolean(key && added[key]);
}

export function markCalendarAdded(key) {
  if (!key || added[key]) return;
  added = { ...added, [key]: new Date().toISOString().slice(0, 10) };
  AsyncStorage.setItem(KEY, JSON.stringify(added)).catch(() => {});
  notify();
}

async function openCalendarLink(url) {
  if (Platform.OS === 'android') {
    try {
      // Chrome's own link: opens the page in Chrome, not in the Calendar app.
      await Linking.openURL(`googlechrome://navigate?url=${url}`);
      return true;
    } catch {
      /* no Chrome: the plain link */
    }
  }
  await Linking.openURL(url);
  return true;
}

/** When she comes back to the app, ask whether the event was saved; only then turn it green. */
function confirmWhenBack(key) {
  if (!key || Platform.OS === 'web') {
    markCalendarAdded(key);
    return;
  }
  let left = false;
  const sub = AppState.addEventListener('change', (state) => {
    if (state !== 'active') {
      left = true;
      return;
    }
    if (!left) return;
    sub.remove();
    Alert.alert('Is it in your calendar?', 'Tap Yes once you have saved the event in Google Calendar.', [
      { text: 'Not yet', style: 'cancel' },
      { text: 'Yes, saved', onPress: () => markCalendarAdded(key) },
    ]);
  });
  // Never keep listening for long.
  setTimeout(() => sub.remove(), 30 * 60 * 1000);
}

/** Open the calendar link; the event shows as added once she confirms it was saved. */
export async function addToCalendar(url) {
  if (!url) return false;
  try {
    await openCalendarLink(url);
    confirmWhenBack(calendarKeyFromUrl(url));
    return true;
  } catch {
    return false;
  }
}

/** True once this event's calendar link was opened on this phone. */
export function useCalendarAdded(url) {
  const key = calendarKeyFromUrl(url);
  const [, force] = useState(0);
  useEffect(() => {
    const fn = () => force((n) => n + 1);
    subs.add(fn);
    load();
    return () => subs.delete(fn);
  }, []);
  return isCalendarAdded(key);
}

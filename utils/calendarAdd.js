import { useEffect, useState } from 'react';
import { Alert, AppState, Linking, Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { calendarKeyFromUrl } from './calendarLinks';
import {
  addEventToDevice,
  deviceCalendarAvailable,
  deviceEventExists,
  eventFromCalendarUrl,
  openDeviceEvent,
} from './deviceCalendar';

export { calendarAllDay, calendarDates, calendarKeyFromUrl, googleCalendarUrl } from './calendarLinks';

/**
 * "Add to calendar" for every event and session in the app, with a remembered "added" state per
 * event, so a button she already used turns into a small green "In your calendar".
 *
 * APK 1.2.0+: the app writes the event into her phone calendar itself, so it knows it is there
 * (no question) and notices when she deletes it. Older APK, or calendar permission refused: the
 * Google Calendar link, and the button turns green only after she says she saved it.
 */

// v2: v1 marked an event as added as soon as the link opened, even when nothing was saved.
// A value is the date it was added ("2026-11-26") or { on, id } when the app wrote it itself.
const KEY = 'il.calendarAdded.v2';
let added = {};
let loaded = false;
const subs = new Set();

function notify() {
  subs.forEach((fn) => fn());
}

function save() {
  AsyncStorage.setItem(KEY, JSON.stringify(added)).catch(() => {});
}

/** Events the app wrote itself and she has since deleted go back to "Add to calendar". */
let checking = false;
async function dropDeleted() {
  if (!deviceCalendarAvailable || checking) return;
  checking = true;
  try {
    const gone = [];
    for (const [key, v] of Object.entries(added)) {
      if (v && typeof v === 'object' && v.id && (await deviceEventExists(v.id)) === false) gone.push(key);
    }
    if (gone.length) {
      added = { ...added };
      gone.forEach((k) => delete added[k]);
      save();
      notify();
    }
  } finally {
    checking = false;
  }
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
  dropDeleted();
  // Back in the app (she may have deleted an event in her calendar meanwhile).
  AppState.addEventListener('change', (s) => s === 'active' && dropDeleted());
}

export function isCalendarAdded(key) {
  return Boolean(key && added[key]);
}

/** The phone-calendar event id, when the app wrote the event itself. */
export function calendarEventId(key) {
  const v = key ? added[key] : null;
  return v && typeof v === 'object' ? v.id || null : null;
}

export function markCalendarAdded(key, eventId = null) {
  if (!key || (added[key] && !eventId)) return;
  const on = new Date().toISOString().slice(0, 10);
  added = { ...added, [key]: eventId ? { on, id: String(eventId) } : on };
  save();
  notify();
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

/** Add the event: straight into her phone calendar when it can, else the Google Calendar link. */
export async function addToCalendar(url) {
  if (!url) return false;
  const key = calendarKeyFromUrl(url);
  if (deviceCalendarAvailable) {
    const id = await addEventToDevice(eventFromCalendarUrl(url));
    if (id) {
      markCalendarAdded(key, id);
      return true;
    }
  }
  try {
    await Linking.openURL(url);
    confirmWhenBack(key);
    return true;
  } catch {
    return false;
  }
}

/** Tapping "In your calendar": open the event the app wrote, or add it again. */
export async function openAddedEvent(url) {
  const id = calendarEventId(calendarKeyFromUrl(url));
  if (id && (await openDeviceEvent(id))) return true;
  return addToCalendar(url);
}

/** True once this event is in her calendar (written by the app, or she confirmed it). */
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

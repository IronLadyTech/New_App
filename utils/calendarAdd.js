import { useEffect, useState } from 'react';
import { Linking } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { calendarKeyFromUrl } from './calendarLinks';

export { calendarAllDay, calendarDates, calendarKeyFromUrl, googleCalendarUrl } from './calendarLinks';

/**
 * "Add to calendar" for every event and session in the app: one Google Calendar link format
 * (with a correct end time, also past midnight) and a remembered "added" state per event, so a
 * button she already used turns into a small green "In your calendar".
 */

const KEY = 'il.calendarAdded.v1';
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

/** Open the calendar link; once it opened, remember the event as added. */
export async function addToCalendar(url) {
  if (!url) return false;
  try {
    await Linking.openURL(url);
    markCalendarAdded(calendarKeyFromUrl(url));
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

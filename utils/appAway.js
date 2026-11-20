import { useEffect, useState } from 'react';
import { AppState } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

/**
 * How long she was away before this visit, in whole days. A visit starts when the app opens
 * or comes back to the front; "away" is measured from when she last left it. The answer holds
 * for the whole visit, so a welcome-back message does not vanish as she moves around.
 */
const LAST_SEEN_KEY = 'il_app_last_seen_at';
const DAY_MS = 24 * 60 * 60 * 1000;

let daysAway = 0;
let ready = false;
const listeners = new Set();
const emit = () => listeners.forEach((fn) => fn(daysAway));

async function startVisit() {
  const now = Date.now();
  const prev = Number(await AsyncStorage.getItem(LAST_SEEN_KEY).catch(() => null)) || 0;
  daysAway = prev > 0 && now > prev ? Math.floor((now - prev) / DAY_MS) : 0;
  ready = true;
  AsyncStorage.setItem(LAST_SEEN_KEY, String(now)).catch(() => {});
  emit();
}

let started = false;
function ensureStarted() {
  if (started) return;
  started = true;
  startVisit();
  let state = AppState.currentState;
  AppState.addEventListener('change', (next) => {
    // Leaving: remember when. Coming back: a new visit, measured from that moment.
    if (next === 'background') AsyncStorage.setItem(LAST_SEEN_KEY, String(Date.now())).catch(() => {});
    if (state !== 'active' && next === 'active') startVisit();
    state = next;
  });
}

/** Whole days since she last used the app (0 on a normal day), for this visit. */
export function useDaysAway() {
  ensureStarted();
  const [value, setValue] = useState(ready ? daysAway : 0);
  useEffect(() => {
    listeners.add(setValue);
    if (ready) setValue(daysAway);
    return () => listeners.delete(setValue);
  }, []);
  return value;
}

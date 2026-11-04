/**
 * The guest's 4-Day Challenge progress, kept on her phone.
 *
 * Unlock rule (content map, "gate on time, not on submission"): Day 1 opens when she
 * starts; Day n opens at 6:00 AM on the (n-1)th morning after. Days stay open once
 * opened, so a skipped day is an unfilled segment, never a block.
 *
 * The CMS guest list hears: challenge-start (first open), challenge-day {day} (each
 * day submitted), challenge-done (all four submitted).
 */
import { useCallback, useEffect, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { getGuestIdentity, trackGuest } from './appGuest';
import { cancelGuestReminder } from './localEngagementNotifications';
import { CHALLENGE_LENGTH } from '../screens/guest/challengeContent';

const KEY = 'il_guest_challenge_v1';
const OPEN_HOUR = 6;
const EMPTY = { startedAt: null, answers: {}, doneAt: {} };

const listeners = new Set();
let cache = null;

async function read() {
  // Progress belongs to one number: another guest signing in on this phone starts fresh.
  const { phone } = await getGuestIdentity();
  if (cache && cache.phone === (phone || null)) return cache;
  try {
    const raw = await AsyncStorage.getItem(KEY);
    const saved = raw ? { ...EMPTY, ...JSON.parse(raw) } : null;
    cache = saved && (saved.phone || null) === (phone || null) ? saved : { ...EMPTY, phone: phone || null };
  } catch {
    cache = { ...EMPTY, phone: phone || null };
  }
  return cache;
}

async function write(next) {
  cache = next;
  listeners.forEach((fn) => fn(next));
  try {
    await AsyncStorage.setItem(KEY, JSON.stringify(next));
  } catch {
    // stays in memory for this session
  }
}

/** When Day n opens (ms), or null before she has started. */
export function opensAt(progress, n) {
  if (!progress?.startedAt) return null;
  if (n <= 1) return progress.startedAt;
  const d = new Date(progress.startedAt);
  d.setHours(OPEN_HOUR, 0, 0, 0);
  d.setDate(d.getDate() + (n - 1));
  return d.getTime();
}

/** 'done' | 'open' | 'locked' */
export function dayState(progress, n, now = Date.now()) {
  if (progress?.doneAt?.[n]) return 'done';
  if (n === 1) return 'open';
  const at = opensAt(progress, n);
  return at != null && now >= at ? 'open' : 'locked';
}

export function doneCount(progress) {
  return Object.keys(progress?.doneAt || {}).length;
}

/** The day to send her to next: first open, not-done day; else the first locked one. */
export function nextDay(progress, now = Date.now()) {
  for (let n = 1; n <= CHALLENGE_LENGTH; n += 1) {
    if (dayState(progress, n, now) === 'open') return n;
  }
  for (let n = 1; n <= CHALLENGE_LENGTH; n += 1) {
    if (dayState(progress, n, now) === 'locked') return n;
  }
  return null;
}

/** "Opens tomorrow, 6:00 AM" / "Opens Thu, 6:00 AM" */
export function opensLabel(progress, n, now = Date.now()) {
  const at = opensAt(progress, n);
  if (at == null) return n === 1 ? 'Open now' : `Opens ${n - 1} day${n > 2 ? 's' : ''} after you start`;
  if (now >= at) return 'Open now';
  const day = new Date(at);
  const today = new Date(now);
  today.setHours(0, 0, 0, 0);
  const diff = Math.round((new Date(at).setHours(0, 0, 0, 0) - today.getTime()) / 86400000);
  const when =
    diff <= 0 ? 'today' : diff === 1 ? 'tomorrow' : day.toLocaleDateString('en-IN', { weekday: 'short' });
  return `Opens ${when}, ${OPEN_HOUR}:00 AM`;
}

export async function startChallenge() {
  const p = await read();
  if (p.startedAt) return p;
  const next = { ...p, startedAt: Date.now() };
  await write(next);
  trackGuest('challenge-start');
  return next;
}

/** Keep a draft while she types (nothing reported). */
export async function saveDraft(n, answers) {
  const p = await read();
  await write({ ...p, answers: { ...p.answers, [n]: { ...(p.answers[n] || {}), ...answers } } });
}

/** She submitted Day n. Returns the new progress. */
export async function submitDay(n, answers) {
  const p = await read();
  const next = {
    ...p,
    startedAt: p.startedAt || Date.now(),
    answers: { ...p.answers, [n]: { ...(p.answers[n] || {}), ...answers } },
    doneAt: { ...p.doneAt, [n]: p.doneAt[n] || Date.now() },
  };
  await write(next);
  trackGuest('challenge-day', { day: n });
  if (doneCount(next) >= CHALLENGE_LENGTH) {
    trackGuest('challenge-done');
    cancelGuestReminder();
  }
  return next;
}

/** Live progress for screens; re-reads whenever any screen saves. */
export function useGuestChallenge() {
  const [progress, setProgress] = useState(cache);
  const [now, setNow] = useState(Date.now());
  useEffect(() => {
    let alive = true;
    read().then((p) => alive && setProgress(p));
    const fn = (p) => setProgress(p);
    listeners.add(fn);
    // Re-check unlocks once a minute while a challenge screen is open.
    const t = setInterval(() => setNow(Date.now()), 60000);
    return () => {
      alive = false;
      listeners.delete(fn);
      clearInterval(t);
    };
  }, []);
  const refresh = useCallback(() => setNow(Date.now()), []);
  return { progress: progress || EMPTY, ready: !!progress, now, refresh };
}

import { useEffect, useLayoutEffect, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';
import * as Updates from 'expo-updates';
import { doc, setDoc } from 'firebase/firestore';
import { db } from '../services/firebase';

/**
 * Tab-switch timing, split where the time goes:
 *   queue  — tap (UI thread) until JS starts handling it: JS was busy with something else
 *   render — JS handling it until the navigator committed the new tab
 *   paint  — commit until two frames later: the new screen on the display
 * Plus the JS thread's worst stall in the last few seconds (a cheap timer-drift probe).
 *
 * Testing aid. The overlay is off by default (long-press the version line in Profile).
 * While PERF_UPLOAD is on, the last samples also go to app_activity/{uid}.perfDebug so they
 * can be read without a screenshot — remove once tab switching is fixed.
 */
const PERF_UPLOAD = true; // collecting from testers' phones to find the slow tab switch; turn off after
const KEY = 'il.perfHud.v1';
const state = { on: false, tap: null, history: [], worstLagMs: 0, uid: null };
const bootAt = Date.now();
// name → { count, totalMs, maxMs } for tab screens; name → count for shared data sources.
const renders = {};
const changes = {};
const listeners = new Set();
let probe = null;
let flushTimer = null;
let dirty = false;

function emit() {
  listeners.forEach((fn) => fn({ ...state }));
}

// A 250 ms timer that fires late by X ms means the JS thread was blocked for ~X ms.
function startProbe() {
  if (probe) return;
  let expected = Date.now() + 250;
  let worst = 0;
  let windowStart = Date.now();
  probe = setInterval(() => {
    const now = Date.now();
    worst = Math.max(worst, now - expected);
    expected = now + 250;
    if (now - windowStart >= 5000) {
      state.worstLagMs = Math.max(0, Math.round(worst));
      worst = 0;
      windowStart = now;
      if (state.on) emit();
    }
  }, 250);
}

function scheduleFlush() {
  if (!PERF_UPLOAD || !state.uid || flushTimer) return;
  flushTimer = setTimeout(() => {
    flushTimer = null;
    if (!dirty || !state.uid) return;
    dirty = false;
    setDoc(
      doc(db, 'app_activity', state.uid),
      {
        uid: state.uid,
        perfDebug: {
          at: new Date().toISOString(),
          upSec: Math.round((Date.now() - bootAt) / 1000),
          device: `${Platform.constants?.Brand || ''} ${Platform.constants?.Model || ''}`.trim(),
          update: Updates.updateId ? String(Updates.updateId).slice(0, 8) : 'embedded',
          samples: state.history.slice(0, 20),
          renders,
          changes,
        },
      },
      { merge: true }
    ).catch(() => {});
  }, 8000);
}

/** Signed-in learner: samples are uploaded for her. */
export function setPerfUser(uid) {
  state.uid = uid || null;
  if (PERF_UPLOAD && uid) startProbe();
}

export async function loadPerfHud() {
  try {
    if ((await AsyncStorage.getItem(KEY)) === '1') setPerfHud(true);
  } catch {
    /* stays off */
  }
}

export function setPerfHud(on) {
  state.on = on;
  AsyncStorage.setItem(KEY, on ? '1' : '0').catch(() => {});
  if (on) startProbe();
  emit();
}

export function togglePerfHud() {
  setPerfHud(!state.on);
}

/** Tab bar: she tapped this tab. tapAt is the UI thread's time of the tap. */
export function markTabTap(name, tapAt) {
  const jsAt = Date.now();
  state.tap = { name, tapAt: tapAt || jsAt, jsAt };
}

/** Tab bar: the navigator committed the new tab; paint = two frames later. */
export function markTabShown(name) {
  const tap = state.tap;
  if (!tap || tap.name !== name) return;
  state.tap = null;
  const shownAt = Date.now();
  requestAnimationFrame(() =>
    requestAnimationFrame(() => {
      const paintAt = Date.now();
      const sample = {
        tab: name,
        total: paintAt - tap.tapAt,
        queue: tap.jsAt - tap.tapAt,
        render: shownAt - tap.jsAt,
        paint: paintAt - shownAt,
        jsLag: state.worstLagMs,
        at: new Date(paintAt).toISOString().slice(11, 19),
      };
      state.history = [sample, ...state.history].slice(0, 20);
      dirty = true;
      scheduleFlush();
      emit();
    })
  );
}

export function usePerfHud() {
  const [snap, setSnap] = useState({ ...state });
  useEffect(() => {
    listeners.add(setSnap);
    return () => listeners.delete(setSnap);
  }, []);
  return snap;
}

/**
 * Tab root screens: how often they redraw and how long the whole subtree takes
 * (render start → its layout effects, which run after every child's).
 */
export function useRenderProbe(name) {
  const start = Date.now();
  useLayoutEffect(() => {
    const ms = Date.now() - start;
    const r = renders[name] || (renders[name] = { count: 0, totalMs: 0, maxMs: 0 });
    r.count += 1;
    r.totalMs += ms;
    r.maxMs = Math.max(r.maxMs, ms);
    dirty = true;
    scheduleFlush();
  });
}

/** Shared data sources: how often their value changes (each change redraws every reader). */
export function useChangeProbe(name, value) {
  useEffect(() => {
    changes[name] = (changes[name] || 0) + 1;
    dirty = true;
    scheduleFlush();
  }, [name, value]);
}

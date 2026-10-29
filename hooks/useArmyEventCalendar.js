import { useEffect, useMemo, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { ARMY_EVENTS_SHEETS } from '../constants/armyEventCalendar';
import {
  mergeArmyEventLists,
  nextArmyEvent,
  parseArmyEventsCsv,
  upcomingArmyEventsForLearn,
  upcomingHighlightEvents,
} from '../utils/armyEventCalendar';

let cache = { at: 0, events: null, error: null, version: 0 };
let inflight = null;
const TTL_MS = 15 * 60 * 1000;
/** Bump when sheet sources / parse rules change so stale cache is dropped. */
const CACHE_VERSION = 4;
// Raw sheet text, not parsed events: re-parsing on load keeps "TODAY" and past-event cut-offs current.
const STORE_KEY = `armyEvents:csv:v${CACHE_VERSION}`;

function parseSheets(texts) {
  const now = new Date();
  return mergeArmyEventLists(
    texts.map((text, i) => parseArmyEventsCsv(text, now, { forceYear: ARMY_EVENTS_SHEETS[i]?.year }))
  );
}

function memoryFresh() {
  return cache.events && cache.version === CACHE_VERSION && Date.now() - cache.at < TTL_MS;
}

/** Last download saved on the phone — shown at once while a fresh copy loads. */
async function loadStoredEvents() {
  try {
    const raw = await AsyncStorage.getItem(STORE_KEY);
    const saved = raw ? JSON.parse(raw) : null;
    if (!Array.isArray(saved?.texts) || saved.texts.length !== ARMY_EVENTS_SHEETS.length) return null;
    return { events: parseSheets(saved.texts), at: saved.at || 0 };
  } catch {
    return null;
  }
}

async function loadSheetEvents() {
  if (memoryFresh()) return { events: cache.events, error: cache.error };
  // Engage mounts two cards that both ask: one download serves them.
  if (inflight) return inflight;
  inflight = (async () => {
    try {
      const texts = await Promise.all(
        ARMY_EVENTS_SHEETS.map(async (sheet) => {
          const res = await fetch(sheet.csvUrl);
          if (!res.ok) throw new Error(`${sheet.name} HTTP ${res.status}`);
          return res.text();
        })
      );
      const at = Date.now();
      const events = parseSheets(texts);
      cache = { at, events, error: null, version: CACHE_VERSION };
      AsyncStorage.setItem(STORE_KEY, JSON.stringify({ at, texts })).catch(() => {});
      return { events, error: null };
    } finally {
      inflight = null;
    }
  })();
  return inflight;
}

/** Start the download early (app open), so Engage has events before she gets there. */
export function prefetchArmyEvents() {
  loadSheetEvents().catch(() => {});
}

/**
 * Upcoming Army / community events from Event Planner 2026 + 2027 tabs.
 */
export function useArmyEventCalendar() {
  const warm = cache.version === CACHE_VERSION && cache.events;
  const [events, setEvents] = useState(warm ? cache.events : []);
  const [loading, setLoading] = useState(!warm);
  const [error, setError] = useState(cache.error);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      if (!cache.events) {
        const stored = await loadStoredEvents();
        if (cancelled) return;
        if (stored?.events?.length) {
          setEvents(stored.events);
          setLoading(false);
        }
      }
      try {
        const result = await loadSheetEvents();
        if (cancelled) return;
        setEvents(result.events);
        setError(result.error);
      } catch (e) {
        if (cancelled) return;
        setError(e?.message || 'calendar_failed');
        console.warn('[army-calendar]', e?.message || e);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const upcoming = useMemo(() => upcomingArmyEventsForLearn(events, { limit: 28 }), [events]);
  const highlights = useMemo(() => upcomingHighlightEvents(events, { limit: 4 }), [events]);
  const nextHighlight = useMemo(
    () => nextArmyEvent(events, { highlightOnly: true }),
    [events]
  );
  const nextOnline = useMemo(() => nextArmyEvent(events, { mode: 'online' }), [events]);
  const nextOffline = useMemo(() => nextArmyEvent(events, { mode: 'offline' }), [events]);
  const nextAny = useMemo(() => nextArmyEvent(events), [events]);
  /** Next session for the main card; spotlights render separately. */
  const featured = useMemo(
    () => nextOnline || upcoming[0] || null,
    [nextOnline, upcoming]
  );

  return {
    events,
    upcoming,
    highlights,
    nextHighlight,
    featured,
    nextOnline,
    nextOffline,
    nextAny,
    loading,
    error,
  };
}

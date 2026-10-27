import { useEffect, useMemo, useState } from 'react';
import { ARMY_EVENTS_SHEETS } from '../constants/armyEventCalendar';
import {
  mergeArmyEventLists,
  nextArmyEvent,
  parseArmyEventsCsv,
  upcomingArmyEvents,
  upcomingArmyEventsForLearn,
  upcomingHighlightEvents,
} from '../utils/armyEventCalendar';

let cache = { at: 0, events: null, error: null, version: 0 };
const TTL_MS = 15 * 60 * 1000;
/** Bump when sheet sources / parse rules change so stale cache is dropped. */
const CACHE_VERSION = 3;

async function loadSheetEvents() {
  const now = Date.now();
  if (cache.events && cache.version === CACHE_VERSION && now - cache.at < TTL_MS) {
    return { events: cache.events, error: cache.error };
  }
  const lists = await Promise.all(
    ARMY_EVENTS_SHEETS.map(async (sheet) => {
      const res = await fetch(sheet.csvUrl);
      if (!res.ok) throw new Error(`${sheet.name} HTTP ${res.status}`);
      const text = await res.text();
      return parseArmyEventsCsv(text, new Date(), { forceYear: sheet.year });
    })
  );
  const events = mergeArmyEventLists(lists);
  cache = { at: now, events, error: null, version: CACHE_VERSION };
  return { events, error: null };
}

/**
 * Upcoming Army / community events from Event Planner 2026 + 2027 tabs.
 */
export function useArmyEventCalendar() {
  const [events, setEvents] = useState(
    cache.version === CACHE_VERSION && cache.events ? cache.events : []
  );
  const [loading, setLoading] = useState(!(cache.version === CACHE_VERSION && cache.events));
  const [error, setError] = useState(cache.error);

  useEffect(() => {
    let cancelled = false;
    (async () => {
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

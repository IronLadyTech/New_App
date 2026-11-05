import { useEffect, useRef } from 'react';
import { AppState } from 'react-native';
import { refreshMyAccess } from '../services/functions';

/** At most once per this long from the phone (the server also throttles to once a minute). */
const MIN_GAP_MS = 5 * 60 * 1000;

/**
 * Pull her Zoho details whenever she opens or comes back to the app, so a change CX made
 * in Zoho (a rescheduled batch, a payment, a new programme) reaches her screens within
 * seconds of opening — not only at her next sign-in. The server writes her profile; the
 * profile listener in AuthContext then updates every screen, and the batch she sees
 * follows her new Day 1 (utils/resolveLearnerCmsBatch.js).
 */
export function useAccessRefreshOnOpen(uid) {
  const last = useRef(0);
  useEffect(() => {
    if (!uid) return undefined;
    const pull = () => {
      if (Date.now() - last.current < MIN_GAP_MS) return;
      last.current = Date.now();
      refreshMyAccess().catch(() => {});
    };
    // Sign-in already refreshes; the first pull is on the next return to the app.
    last.current = Date.now();
    const sub = AppState.addEventListener('change', (state) => {
      if (state === 'active') pull();
    });
    return () => sub.remove();
  }, [uid]);
}

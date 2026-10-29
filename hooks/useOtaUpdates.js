import { useEffect } from 'react';
import { AppState } from 'react-native';
import * as Updates from 'expo-updates';

/** An update that lands this soon after launch is applied at once, behind the splash. */
const APPLY_DURING_SPLASH_MS = 6000;

/**
 * Apply over-the-air updates without the "close and open twice" dance:
 * - at launch: check and download; if it arrives while the splash is still up, restart
 *   into it straight away (she never sees the old screen);
 * - otherwise: restart into it the next time she comes back to the app.
 * Dev builds and web have no updates — this does nothing there.
 */
export function useOtaUpdates() {
  useEffect(() => {
    if (__DEV__ || !Updates.isEnabled) return undefined;
    const startedAt = Date.now();
    let ready = false;
    let leftApp = false;
    let cancelled = false;

    (async () => {
      try {
        const check = await Updates.checkForUpdateAsync();
        if (!check.isAvailable || cancelled) return;
        const fetched = await Updates.fetchUpdateAsync();
        if (!fetched.isNew || cancelled) return;
        ready = true;
        if (Date.now() - startedAt < APPLY_DURING_SPLASH_MS) await Updates.reloadAsync();
      } catch {
        /* offline or server busy: the default check on next launch still runs */
      }
    })();

    const sub = AppState.addEventListener('change', (state) => {
      if (state === 'background') leftApp = true;
      if (state === 'active' && leftApp && ready) Updates.reloadAsync().catch(() => {});
    });
    return () => {
      cancelled = true;
      sub.remove();
    };
  }, []);
}

/** "update 1a2b3c4d · 29 Oct" for the Profile footer; null when running the APK's own bundle. */
export function otaLabel() {
  if (!Updates.isEnabled || Updates.isEmbeddedLaunch || !Updates.updateId) return null;
  const when = Updates.createdAt
    ? ` · ${Updates.createdAt.toLocaleString('en-IN', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}`
    : '';
  return `update ${String(Updates.updateId).slice(0, 8)}${when}`;
}

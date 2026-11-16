import { useEffect } from 'react';
import { AppState } from 'react-native';
import * as Updates from 'expo-updates';
import AsyncStorage from '@react-native-async-storage/async-storage';

/** Set just before restarting into an update: the restart must not replay the intro. */
export const OTA_SKIP_INTRO_KEY = 'il.ota.skipIntro';

async function restartIntoUpdate() {
  await AsyncStorage.setItem(OTA_SKIP_INTRO_KEY, '1').catch(() => {});
  await Updates.reloadAsync();
}

/**
 * Whether the launch splash is still covering the app. A restart is only invisible while it is:
 * once she sees her screen, restarting shows the splash/loading again and then the same screen.
 */
let splashShowing = true;
export function markSplashGone() {
  splashShowing = false;
}

/** Away at least this long: restarting into a waiting update on her return is not noticed. */
const APPLY_AFTER_AWAY_MS = 10 * 60 * 1000;

/**
 * Apply over-the-air updates without the "close and open twice" dance, and never in her face:
 * - at launch: check and download; if it arrives while the splash is still up, restart
 *   into it straight away (she never sees the old screen);
 * - otherwise: never while she is using the app. It applies when she comes back after 10+ minutes
 *   away, or on the next fresh open (expo-updates launches the downloaded update by itself).
 * Dev builds and web have no updates — this does nothing there.
 */
export function useOtaUpdates() {
  useEffect(() => {
    if (__DEV__ || !Updates.isEnabled) return undefined;
    let ready = false;
    let leftAt = 0;
    let cancelled = false;

    (async () => {
      try {
        const check = await Updates.checkForUpdateAsync();
        if (!check.isAvailable || cancelled) return;
        const fetched = await Updates.fetchUpdateAsync();
        if (!fetched.isNew || cancelled) return;
        ready = true;
        if (splashShowing) await restartIntoUpdate();
      } catch {
        /* offline or server busy: the default check on next launch still runs */
      }
    })();

    const sub = AppState.addEventListener('change', (state) => {
      if (state === 'background') leftAt = Date.now();
      if (state === 'active' && leftAt && ready && Date.now() - leftAt >= APPLY_AFTER_AWAY_MS) {
        restartIntoUpdate().catch(() => {});
      }
      if (state === 'active') leftAt = 0;
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

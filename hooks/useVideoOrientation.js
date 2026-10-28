import { useEffect } from 'react';
import { Platform } from 'react-native';
import * as ScreenOrientation from 'expo-screen-orientation';

export async function lockPortrait() {
  if (Platform.OS === 'web') return;
  try {
    await ScreenOrientation.lockAsync(ScreenOrientation.OrientationLock.PORTRAIT_UP);
  } catch {
    // Expo Go / web preview may not support locking.
  }
}

export async function lockLandscape() {
  if (Platform.OS === 'web') return;
  try {
    await ScreenOrientation.lockAsync(ScreenOrientation.OrientationLock.LANDSCAPE);
  } catch {
    // ignore
  }
}

/** Lock landscape only while in-app fullscreen video; restore portrait when it closes. */
export function useVideoLandscape(active) {
  useEffect(() => {
    if (Platform.OS === 'web') {
      const orientation = globalThis.screen?.orientation;
      if (!orientation) return undefined;
      if (active) orientation.lock?.('landscape').catch(() => {});
      else orientation.unlock?.();
      return () => {
        orientation.unlock?.();
      };
    }

    if (!active) {
      lockPortrait();
      return undefined;
    }

    lockLandscape();

    return () => {
      lockPortrait();
    };
  }, [active]);
}

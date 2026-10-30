import React, { useEffect, useRef, useState } from 'react';
import { AppState, Platform, Text, View } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

/*
 * "You're offline" without a native network module (so it ships over the air): a tiny
 * HEAD request to Google's connectivity endpoint — every 30 s online, every 8 s offline, and
 * at once when she returns to the app. Two failures in a row before showing it, so one slow
 * request on a weak signal does not flash the banner.
 */
const PROBE_URL = 'https://clients3.google.com/generate_204';
const ONLINE_EVERY_MS = 30000;
const OFFLINE_EVERY_MS = 8000;
const TIMEOUT_MS = 5000;

async function reachable() {
  const ctrl = new AbortController();
  const t = setTimeout(() => ctrl.abort(), TIMEOUT_MS);
  try {
    const res = await fetch(PROBE_URL, { method: 'HEAD', cache: 'no-store', signal: ctrl.signal });
    return res.status < 500;
  } catch {
    return false;
  } finally {
    clearTimeout(t);
  }
}

export default function OfflineBanner() {
  const insets = useSafeAreaInsets();
  const [offline, setOffline] = useState(false);
  const fails = useRef(0);

  useEffect(() => {
    if (Platform.OS === 'web') return undefined; // the browser shows its own offline state
    let timer = null;
    let stopped = false;
    let active = AppState.currentState === 'active';

    const check = async () => {
      clearTimeout(timer);
      if (stopped || !active) return;
      const ok = await reachable();
      if (stopped) return;
      fails.current = ok ? 0 : fails.current + 1;
      const isOffline = fails.current >= 2;
      setOffline(isOffline);
      timer = setTimeout(check, isOffline || fails.current ? OFFLINE_EVERY_MS : ONLINE_EVERY_MS);
    };

    check();
    const sub = AppState.addEventListener('change', (s) => {
      active = s === 'active';
      if (active) check();
      else clearTimeout(timer);
    });
    return () => {
      stopped = true;
      clearTimeout(timer);
      sub.remove();
    };
  }, []);

  if (!offline) return null;
  return (
    <View
      pointerEvents="none"
      accessibilityRole="alert"
      accessibilityLiveRegion="polite"
      style={{
        position: 'absolute',
        left: 12,
        right: 12,
        top: insets.top + 8,
        zIndex: 9998,
        elevation: 98,
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#1B2B30',
        borderRadius: 14,
        paddingHorizontal: 14,
        paddingVertical: 10,
      }}
    >
      <MaterialIcons name="wifi-off" size={18} color="#FFFFFF" />
      <Text style={{ color: '#FFFFFF', marginLeft: 10, flex: 1, fontSize: 13, lineHeight: 18 }}>
        You're offline — turn on mobile data or Wi-Fi. Your work will sync when you're back.
      </Text>
    </View>
  );
}

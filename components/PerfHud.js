import React, { useEffect } from 'react';
import { Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { loadPerfHud, usePerfHud } from '../utils/perfHud';

/** Testing overlay: tab switch times and JS thread health. Renders nothing while off. */
export default function PerfHud() {
  const insets = useSafeAreaInsets();
  const hud = usePerfHud();
  useEffect(() => {
    loadPerfHud();
  }, []);
  if (!hud.on) return null;
  const tone = (ms) => (ms <= 150 ? '#7CE0A3' : ms <= 400 ? '#FFD479' : '#FF8A8A');
  return (
    <View
      pointerEvents="none"
      style={{
        position: 'absolute',
        top: insets.top + 4,
        left: 8,
        zIndex: 9999,
        elevation: 99,
        backgroundColor: 'rgba(0,0,0,0.78)',
        borderRadius: 8,
        paddingHorizontal: 8,
        paddingVertical: 5,
      }}
    >
      <Text style={{ color: '#FFFFFF', fontSize: 11, fontWeight: '700' }}>
        JS worst stall (5 s) <Text style={{ color: tone(hud.worstLagMs) }}>{hud.worstLagMs} ms</Text>
      </Text>
      {hud.history.slice(0, 6).map((h, i) => (
        <Text key={`${h.tab}-${i}`} style={{ color: tone(h.total), fontSize: 11 }}>
          {`${h.tab}: ${h.total} ms (queue ${h.queue} · render ${h.render} · paint ${h.paint})`}
        </Text>
      ))}
      {!hud.history.length ? (
        <Text style={{ color: '#CCCCCC', fontSize: 11 }}>Tap the tabs to measure</Text>
      ) : null}
    </View>
  );
}

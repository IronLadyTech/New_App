import React, { useEffect, useState } from 'react';
import { View } from 'react-native';
import Reanimated, {
  Easing,
  FadeIn,
  FadeOut,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withTiming,
} from 'react-native-reanimated';
import ILText from '../il/ILText';
import { G } from '../../constants/guestTheme';
import { IL_FONTS } from '../../constants/ironLadyBrand';
import { LEP_PRINCIPLE_TITLES } from '../../constants/lepPrincipleWatch';

const RED = '#ED1D24';
const PRINCIPLES = Object.entries(LEP_PRINCIPLE_TITLES).map(([n, t]) => `Principle ${n} · ${t}`);

/** A page being laid out: lines that breathe, a red sweep along the top. UI thread only. */
function PaperSkeleton() {
  const pulse = useSharedValue(0.35);
  const sweep = useSharedValue(0);
  useEffect(() => {
    pulse.value = withRepeat(withTiming(1, { duration: 700, easing: Easing.inOut(Easing.quad) }), -1, true);
    sweep.value = withRepeat(withTiming(1, { duration: 1100, easing: Easing.inOut(Easing.cubic) }), -1, false);
  }, []);
  const lines = useAnimatedStyle(() => ({ opacity: pulse.value }));
  const bar = useAnimatedStyle(() => ({ transform: [{ translateX: -120 + sweep.value * 360 }] }));
  const widths = ['62%', '100%', '94%', '100%', '78%', '100%', '88%', '54%'];
  return (
    <View
      style={{
        width: 220,
        height: 280,
        borderRadius: 14,
        backgroundColor: '#FFFFFF',
        overflow: 'hidden',
        shadowColor: '#113744',
        shadowOpacity: 0.1,
        shadowRadius: 14,
        shadowOffset: { width: 0, height: 6 },
        elevation: 4,
      }}
    >
      <View style={{ height: 4, backgroundColor: '#F3E3E3', overflow: 'hidden' }}>
        <Reanimated.View style={[{ width: 120, height: 4, backgroundColor: RED, borderRadius: 2 }, bar]} />
      </View>
      <Reanimated.View style={[{ padding: 18 }, lines]}>
        <View style={{ width: '70%', height: 14, borderRadius: 7, backgroundColor: '#E6DDD0', marginBottom: 18 }} />
        {widths.map((w, i) => (
          <View key={i} style={{ width: w, height: 8, borderRadius: 4, backgroundColor: '#EFE8DC', marginBottom: 11 }} />
        ))}
        <View style={{ flexDirection: 'row', marginTop: 8 }}>
          <View style={{ flex: 1, height: 46, borderRadius: 8, backgroundColor: '#F7E6E6', marginRight: 8 }} />
          <View style={{ flex: 1, height: 46, borderRadius: 8, backgroundColor: '#E3ECEE' }} />
        </View>
      </Reanimated.View>
    </View>
  );
}

/** Full-screen "opening" state for an in-app document: a page taking shape, plus a principle to read. */
export default function DocumentLoader({ label }) {
  const [i, setI] = useState(() => Math.floor(Math.random() * PRINCIPLES.length));
  useEffect(() => {
    const t = setInterval(() => setI((n) => (n + 1) % PRINCIPLES.length), 1800);
    return () => clearInterval(t);
  }, []);
  return (
    <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 28 }}>
      <PaperSkeleton />
      <ILText
        role="label"
        color={G.ink}
        align="center"
        style={{ marginTop: 26, fontFamily: IL_FONTS.display, fontSize: 20, lineHeight: 26 }}
        numberOfLines={2}
      >
        {label ? `Opening ${label}` : 'Opening your document'}
      </ILText>
      <View style={{ height: 44, marginTop: 10, justifyContent: 'center' }}>
        <Reanimated.View key={i} entering={FadeIn.duration(260)} exiting={FadeOut.duration(200)}>
          <ILText role="bodySm" color={G.meta} align="center" style={{ fontSize: 14, lineHeight: 20 }}>
            {PRINCIPLES[i]}
          </ILText>
        </Reanimated.View>
      </View>
    </View>
  );
}

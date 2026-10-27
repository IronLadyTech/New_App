import React, { useCallback, useState } from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import Animated, {
  interpolate,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';
import ILText from '../il/ILText';
import Pressable from '../il/Press';
import { G, af } from '../../constants/guestTheme';
import { WhiteCard } from '../../screens/lep/LepBits';

const FLIP_MS = 480;
const MIN_SLOT_H = 160;
const MAX_SLOT_H = 340;

function CoinFace({ eyebrow, children, backgroundColor, hint }) {
  return (
    <WhiteCard style={{ borderRadius: 18, padding: 16, backgroundColor, flex: 1 }}>
      <ILText role="eyebrow" color={G.cta} style={[af, { fontSize: 10 }]}>
        {eyebrow}
      </ILText>
      <ScrollView
        style={{ marginTop: 10, flexGrow: 0 }}
        contentContainerStyle={{ paddingBottom: 4 }}
        showsVerticalScrollIndicator={false}
        nestedScrollEnabled
      >
        {children}
      </ScrollView>
      {hint ? (
        <ILText role="bodySm" color={G.meta} style={{ marginTop: 10, fontSize: 11 }}>
          {hint}
        </ILText>
      ) : null}
    </WhiteCard>
  );
}

/**
 * One coin in a fixed slot: tap flips between front and back (no extra copy outside).
 */
export default function LepTaskInsightFlipCard({ front, back, backgroundColor = G.pink }) {
  const spin = useSharedValue(0);
  const [slotH, setSlotH] = useState(MIN_SLOT_H);

  const bumpHeight = useCallback((event) => {
    const h = Math.ceil(event.nativeEvent.layout.height);
    const clamped = Math.min(MAX_SLOT_H, Math.max(MIN_SLOT_H, h));
    setSlotH((prev) => (clamped > prev ? clamped : prev));
  }, []);

  if (!back?.content) {
    return (
      <View style={styles.shell}>
        <CoinFace eyebrow={front.eyebrow} backgroundColor={backgroundColor}>
          {front.content}
        </CoinFace>
      </View>
    );
  }

  const toggle = () => {
    spin.value = withTiming(spin.value < 0.5 ? 1 : 0, { duration: FLIP_MS });
  };

  const frontFace = useAnimatedStyle(() => {
    const rotateY = interpolate(spin.value, [0, 1], [0, 180]);
    return {
      transform: [{ perspective: 1400 }, { rotateY: `${rotateY}deg` }],
      backfaceVisibility: 'hidden',
      opacity: spin.value < 0.5 ? 1 : 0,
    };
  });

  const backFace = useAnimatedStyle(() => {
    const rotateY = interpolate(spin.value, [0, 1], [180, 360]);
    return {
      transform: [{ perspective: 1400 }, { rotateY: `${rotateY}deg` }],
      backfaceVisibility: 'hidden',
      opacity: spin.value >= 0.5 ? 1 : 0,
    };
  });

  return (
    <View style={styles.shell}>
      <View
        style={styles.measure}
        pointerEvents="none"
        accessibilityElementsHidden
        importantForAccessibility="no-hide-descendants"
      >
        <View onLayout={bumpHeight} style={styles.measureFace}>
          <CoinFace eyebrow={front.eyebrow} backgroundColor={backgroundColor}>
            {front.content}
          </CoinFace>
        </View>
        <View onLayout={bumpHeight} style={styles.measureFace}>
          <CoinFace eyebrow={back.eyebrow} backgroundColor={backgroundColor}>
            {back.content}
          </CoinFace>
        </View>
      </View>

      <Pressable
        onPress={toggle}
        accessibilityRole="button"
        accessibilityLabel={`${front.eyebrow}. ${back.eyebrow}`}
        accessibilityHint="Tap to flip the card"
        style={styles.press}
      >
        <View style={[styles.slot, { height: slotH }]}>
          <Animated.View style={[styles.face, frontFace]} collapsable={false} needsOffscreenAlphaCompositing>
            <CoinFace eyebrow={front.eyebrow} backgroundColor={backgroundColor} hint="Tap to flip">
              {front.content}
            </CoinFace>
          </Animated.View>
          <Animated.View style={[styles.face, backFace]} collapsable={false} needsOffscreenAlphaCompositing>
            <CoinFace eyebrow={back.eyebrow} backgroundColor={backgroundColor} hint="Tap to flip back">
              {back.content}
            </CoinFace>
          </Animated.View>
        </View>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  shell: {
    marginTop: 16,
  },
  measure: {
    position: 'absolute',
    left: 0,
    right: 0,
    opacity: 0,
    zIndex: -1,
    height: 0,
    overflow: 'hidden',
  },
  measureFace: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: 0,
  },
  press: {
    width: '100%',
  },
  slot: {
    width: '100%',
    overflow: 'hidden',
  },
  face: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: 0,
    bottom: 0,
    width: '100%',
    height: '100%',
  },
});

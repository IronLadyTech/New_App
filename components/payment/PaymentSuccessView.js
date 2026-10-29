import React, { useEffect, useRef } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import Animated, {
  Easing,
  runOnJS,
  useAnimatedStyle,
  useReducedMotion,
  useSharedValue,
  withDelay,
  withSequence,
  withSpring,
  withTiming,
} from 'react-native-reanimated';
import ILText from '../il/ILText';
import { IL_BRAND } from '../../constants/ironLadyBrand';

/**
 * Payment confirmed — a tick that lands, the amount and reference, then it carries her
 * on to the programme page that payment opened. Plain Views, no animated SVG (Android
 * does not redraw animated SVG props). Reduced motion: no pop or ripple, same timing.
 */

const GREEN = '#1B7A4A';
const GREEN_SOFT = 'rgba(27,122,74,0.14)';
const HOLD_MS = 3200; // long enough to read the amount, short enough not to feel stuck

export default function PaymentSuccessView({
  amountLabel,
  programTitle,
  reference,
  statusChip,
  nextLabel,
  onNext,
  onReceipt,
}) {
  const reduced = useReducedMotion();
  const circle = useSharedValue(reduced ? 1 : 0);
  const tick = useSharedValue(reduced ? 1 : 0);
  const ripple = useSharedValue(0);
  const body = useSharedValue(reduced ? 1 : 0);
  const progress = useSharedValue(0);
  const left = useRef(false);

  const go = () => {
    if (left.current) return;
    left.current = true;
    onNext?.();
  };

  useEffect(() => {
    if (!reduced) {
      circle.value = withSpring(1, { damping: 11, stiffness: 160 });
      tick.value = withDelay(220, withSpring(1, { damping: 9, stiffness: 220 }));
      ripple.value = withDelay(260, withSequence(withTiming(1, { duration: 900, easing: Easing.out(Easing.quad) })));
      body.value = withDelay(380, withTiming(1, { duration: 420, easing: Easing.out(Easing.cubic) }));
    }
    progress.value = withDelay(
      600,
      withTiming(1, { duration: HOLD_MS - 600, easing: Easing.linear }, (done) => done && runOnJS(go)())
    );
  }, []);

  const circleStyle = useAnimatedStyle(() => ({ transform: [{ scale: circle.value }] }));
  const tickStyle = useAnimatedStyle(() => ({
    opacity: tick.value > 0 ? 1 : 0,
    transform: [{ scale: 0.4 + 0.6 * tick.value }],
  }));
  const rippleStyle = useAnimatedStyle(() => ({
    opacity: 0.5 * (1 - ripple.value),
    transform: [{ scale: 1 + ripple.value * 0.9 }],
  }));
  const bodyStyle = useAnimatedStyle(() => ({
    opacity: body.value,
    transform: [{ translateY: (1 - body.value) * 14 }],
  }));
  const barStyle = useAnimatedStyle(() => ({ width: `${progress.value * 100}%` }));

  return (
    <SafeAreaView style={styles.screen} edges={['top', 'bottom']}>
      <View style={styles.centre}>
        <View style={styles.badgeWrap}>
          <Animated.View style={[styles.ripple, rippleStyle]} />
          <Animated.View style={[styles.circle, circleStyle]}>
            <Animated.View style={tickStyle}>
              <MaterialIcons name="check" size={64} color="#FFFFFF" />
            </Animated.View>
          </Animated.View>
        </View>

        <Animated.View style={[styles.body, bodyStyle]}>
          <ILText role="eyebrow" color={GREEN} align="center">
            Payment successful
          </ILText>
          {amountLabel ? (
            <ILText role="display" color={IL_BRAND.forest} align="center" style={styles.amount}>
              {amountLabel}
            </ILText>
          ) : null}
          <ILText role="body" color={IL_BRAND.muted} align="center" style={styles.program}>
            {programTitle}
          </ILText>
          {statusChip ? (
            <View style={styles.chip}>
              <MaterialIcons name="verified" size={16} color={GREEN} />
              <ILText role="label" color={GREEN} style={styles.chipText}>
                {statusChip}
              </ILText>
            </View>
          ) : null}
          {reference ? (
            <ILText role="bodySm" color={IL_BRAND.dim} align="center" style={styles.reference}>
              Ref · {reference}
            </ILText>
          ) : null}
        </Animated.View>
      </View>

      <View style={styles.footer}>
        <ILText role="bodySm" color={IL_BRAND.muted} align="center">
          {nextLabel}
        </ILText>
        <View style={styles.track}>
          <Animated.View style={[styles.bar, barStyle]} />
        </View>
        <Pressable onPress={go} accessibilityRole="button" style={styles.primary}>
          <ILText role="button" color="#FFFFFF">
            Go now
          </ILText>
        </Pressable>
        {onReceipt ? (
          <Pressable
            onPress={() => {
              left.current = true; // she chose the receipt — do not pull her away from it
              onReceipt();
            }}
            accessibilityRole="button"
            style={styles.secondary}
          >
            <ILText role="label" color={IL_BRAND.red}>
              View receipt
            </ILText>
          </Pressable>
        ) : null}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: IL_BRAND.cream },
  centre: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 24 },
  badgeWrap: { width: 132, height: 132, alignItems: 'center', justifyContent: 'center' },
  ripple: { position: 'absolute', width: 112, height: 112, borderRadius: 56, backgroundColor: GREEN_SOFT },
  circle: {
    width: 104,
    height: 104,
    borderRadius: 52,
    backgroundColor: GREEN,
    alignItems: 'center',
    justifyContent: 'center',
  },
  body: { marginTop: 24, alignItems: 'center' },
  amount: { marginTop: 10, fontSize: 40, lineHeight: 48 },
  program: { marginTop: 4 },
  chip: {
    marginTop: 16,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 999,
    backgroundColor: GREEN_SOFT,
  },
  chipText: { marginLeft: 6 },
  reference: { marginTop: 14 },
  footer: { paddingHorizontal: 24, paddingBottom: 16 },
  track: { marginTop: 10, height: 4, borderRadius: 2, backgroundColor: 'rgba(17,55,68,0.12)', overflow: 'hidden' },
  bar: { height: '100%', backgroundColor: GREEN },
  primary: {
    marginTop: 18,
    borderRadius: 999,
    paddingVertical: 15,
    alignItems: 'center',
    backgroundColor: IL_BRAND.forest,
  },
  secondary: { marginTop: 10, paddingVertical: 10, alignItems: 'center' },
});

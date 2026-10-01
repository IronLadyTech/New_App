import React, { useCallback, useLayoutEffect } from 'react';
import { View } from 'react-native';
import Animated, {
  Easing,
  interpolate,
  useAnimatedProps,
  useAnimatedStyle,
  useSharedValue,
  withSequence,
  withSpring,
  withTiming,
} from 'react-native-reanimated';
import Svg, { Rect } from 'react-native-svg';
import { IL_BRAND, IL_FONTS } from '../../constants/ironLadyBrand';

const CTA = '#ED1D24';
const BOX_W = 48;
const BOX_H = 52;
const RADIUS = 14;
const PERIM = 2 * (BOX_W + BOX_H) - 8 * RADIUS + 2 * Math.PI * RADIUS;
const AnimatedRect = Animated.createAnimatedComponent(Rect);
const EASE = Easing.bezier(0.2, 0.8, 0.2, 1);

export default function OtpDigitBox({ digit, active }) {
  const dealIn = useSharedValue(1);
  const lift = useSharedValue(0);
  const spark = useSharedValue(0);

  const playDeal = useCallback(() => {
    dealIn.value = 0;
    dealIn.value = withSpring(1, { damping: 11, stiffness: 190 });
    lift.value = withSequence(
      withTiming(1, { duration: 150 }),
      withTiming(0, { duration: 270, easing: EASE })
    );
    spark.value = 0;
    spark.value = withTiming(1, { duration: 920, easing: Easing.bezier(0.45, 0, 0.2, 1) });
  }, [dealIn, lift, spark]);

  useLayoutEffect(() => {
    if (digit) playDeal();
    else {
      dealIn.value = 1;
      spark.value = 0;
      lift.value = 0;
    }
  }, [digit, playDeal, dealIn, spark, lift]);

  const boxStyle = useAnimatedStyle(() => ({
    transform: [
      { translateY: -5 * lift.value },
      { rotate: `${-3 * lift.value}deg` },
    ],
  }));
  const digitStyle = useAnimatedStyle(() => ({
    opacity: digit ? interpolate(dealIn.value, [0, 0.6, 1], [0, 1, 1]) : 0,
    transform: [
      { translateY: (1 - dealIn.value) * 22 },
      { rotate: `${(1 - dealIn.value) * -14}deg` },
      { scale: 0.7 + 0.3 * dealIn.value },
    ],
  }));
  const sparkProps = useAnimatedProps(() => ({
    strokeDashoffset: -spark.value * PERIM,
    strokeOpacity: interpolate(spark.value, [0, 0.02, 0.88, 1], [0, 1, 1, 0]),
  }));

  const empty = !digit;

  return (
    <Animated.View
      style={[
        {
          width: BOX_W,
          height: BOX_H,
          borderRadius: RADIUS,
          backgroundColor: empty ? '#EEEAE2' : IL_BRAND.white,
          borderWidth: active || !!digit ? 1.6 : 0,
          borderColor: active ? CTA : digit ? IL_BRAND.ink : 'transparent',
          alignItems: 'center',
          justifyContent: 'center',
          overflow: 'visible',
        },
        active
          ? {
              shadowColor: CTA,
              shadowOpacity: 0.35,
              shadowRadius: 8,
              shadowOffset: { width: 0, height: 0 },
            }
          : null,
        boxStyle,
      ]}
    >
      {active ? (
        <View
          pointerEvents="none"
          style={{
            position: 'absolute',
            top: -5,
            left: -5,
            right: -5,
            bottom: -5,
            borderRadius: RADIUS + 4,
            borderWidth: 4,
            borderColor: 'rgba(237,29,36,0.18)',
          }}
        />
      ) : null}
      <Animated.Text
        style={[
          {
            fontFamily: IL_FONTS.semibold,
            fontSize: 22,
            color: IL_BRAND.ink,
          },
          digitStyle,
        ]}
      >
        {digit || ''}
      </Animated.Text>
      <Svg pointerEvents="none" width={BOX_W + 8} height={BOX_H + 8} style={{ position: 'absolute', top: -4, left: -4 }}>
        <AnimatedRect
          x={4}
          y={4}
          width={BOX_W}
          height={BOX_H}
          rx={RADIUS}
          fill="none"
          stroke={CTA}
          strokeWidth={4}
          strokeLinecap="round"
          strokeDasharray={`${PERIM * 0.42} ${PERIM * 0.58}`}
          animatedProps={sparkProps}
        />
      </Svg>
    </Animated.View>
  );
}

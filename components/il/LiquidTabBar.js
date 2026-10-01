import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { Platform, Pressable, StyleSheet, Text, View } from 'react-native';
import { Ionicons, MaterialIcons } from '@expo/vector-icons';
import { BlurView } from 'expo-blur';
import { LinearGradient } from 'expo-linear-gradient';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Animated, {
  Extrapolation,
  interpolate,
  runOnJS,
  useAnimatedProps,
  useAnimatedReaction,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from 'react-native-reanimated';
import Svg, { Path } from 'react-native-svg';
import { IL_FONTS } from '../../constants/ironLadyBrand';
import { G, af } from '../../constants/guestTheme';

const AnimatedPath = Animated.createAnimatedComponent(Path);
Animated.addWhitelistedNativeProps({ d: true });

const BEAD = 42;
const SOCK = 30;
const PILL_H = 64;
const BAR_TOP = 26;
const SIDE = 18;
const LABEL_H = 0;
const K = 0.55228475;
const LEAD = { damping: 16, stiffness: 260, mass: 0.5 };
const TRAIL = { damping: 14, stiffness: 140, mass: 0.75 };
const ACCENT = G.cta;
const TEAL = 'rgba(17,55,68,0.78)';
const TEAL_EDGE = 'rgba(248,214,212,0.28)';

export const LIQUID_TAB_PAD = BAR_TOP + PILL_H + 28;

function clamp(n, min, max) {
  'worklet';
  return Math.min(max, Math.max(min, n));
}

function slotCenter(index, slot) {
  'worklet';
  return SIDE + (index + 0.5) * slot;
}

function nearestIndex(x, slot, count) {
  'worklet';
  if (slot <= 0) return 0;
  return clamp(Math.round((x - SIDE) / slot - 0.5), 0, count - 1);
}

function dockPath(width, cx, smear) {
  'worklet';
  const w = Math.max(width, 1);
  const top = BAR_TOP;
  const bot = top + PILL_H;
  const left = SIDE;
  const right = w - SIDE;
  const r = PILL_H / 2;
  const stretch = 1 + Math.abs(smear) * 0.18;
  const trail = smear > 0.04 ? 1.2 : smear < -0.04 ? 0.82 : 1;
  const lead = smear > 0.04 ? 0.82 : smear < -0.04 ? 1.2 : 1;
  const rx = SOCK * stretch;
  const sl = clamp(cx - rx * trail, left + r + 4, right - r - 4);
  const sr = clamp(cx + rx * lead, left + r + 4, right - r - 4);
  const depth = SOCK + Math.abs(smear) * 3;
  const bowl = top + depth;
  const ck = depth * K;

  return [
    `M ${left + r} ${top}`,
    `L ${sl} ${top}`,
    `C ${sl} ${top + ck} ${cx - rx * K} ${bowl} ${cx} ${bowl}`,
    `C ${cx + rx * K} ${bowl} ${sr} ${top + ck} ${sr} ${top}`,
    `L ${right - r} ${top}`,
    `C ${right - r * 0.45} ${top} ${right} ${top + r * 0.45} ${right} ${top + r}`,
    `L ${right} ${bot - r}`,
    `C ${right} ${bot - r * 0.45} ${right - r * 0.45} ${bot} ${right - r} ${bot}`,
    `L ${left + r} ${bot}`,
    `C ${left + r * 0.45} ${bot} ${left} ${bot - r * 0.45} ${left} ${bot - r}`,
    `L ${left} ${top + r}`,
    `C ${left} ${top + r * 0.45} ${left + r * 0.45} ${top} ${left + r} ${top}`,
    'Z',
  ].join(' ');
}

export default function LiquidTabBar({ items, activeIndex, onPress, page = 'transparent' }) {
  const insets = useSafeAreaInsets();
  const bottom = Math.max(insets.bottom, Platform.OS === 'android' ? 8 : 6);
  const svgH = BAR_TOP + PILL_H + LABEL_H + bottom;
  const [width, setWidth] = useState(0);
  const [nearest, setNearest] = useState(activeIndex);
  const count = items.length || 1;
  const slot = Math.max(width - SIDE * 2, 1) / count;

  const cx = useSharedValue(0);
  const groove = useSharedValue(0);
  const smear = useSharedValue(0);
  const drag = useSharedValue(0);
  const ready = useSharedValue(0);
  const widthSV = useSharedValue(0);
  const slotSV = useSharedValue(0);
  const countSV = useSharedValue(count);
  const pressX = useSharedValue(0);

  useEffect(() => {
    countSV.value = count;
  }, [count]);

  const snapTo = useCallback(
    (index) => {
      const item = items[index];
      if (item) onPress(item, index);
    },
    [items, onPress]
  );

  const place = (nextWidth) => {
    setWidth(nextWidth);
    const nextSlot = (nextWidth - SIDE * 2) / count;
    widthSV.value = nextWidth;
    slotSV.value = nextSlot;
    if (!ready.value && nextWidth) {
      const start = slotCenter(activeIndex, nextSlot);
      cx.value = start;
      groove.value = start;
      ready.value = 1;
    }
  };

  useEffect(() => {
    if (!width || drag.value) return;
    const next = slotCenter(activeIndex, slot);
    if (!ready.value) {
      cx.value = next;
      groove.value = next;
      ready.value = 1;
      return;
    }
    setNearest(activeIndex);
    cx.value = withSpring(next, LEAD);
    groove.value = withSpring(next, TRAIL, (finished) => {
      'worklet';
      if (finished) smear.value = withSpring(0, TRAIL);
    });
  }, [activeIndex, slot, width]);

  useAnimatedReaction(
    () => nearestIndex(cx.value, slotSV.value, countSV.value),
    (next, prev) => {
      if (next !== prev) runOnJS(setNearest)(next);
    }
  );

  const dockProps = useAnimatedProps(() => ({
    d: dockPath(widthSV.value, groove.value, smear.value),
  }));

  const beadStyle = useAnimatedStyle(() => ({
    transform: [
      { translateX: cx.value - BEAD / 2 },
      { scaleX: interpolate(Math.abs(smear.value), [0, 1], [1, 1.14], Extrapolation.CLAMP) },
      { scaleY: interpolate(Math.abs(smear.value), [0, 1], [1, 0.9], Extrapolation.CLAMP) },
    ],
  }));

  const selectAt = (x) => {
    'worklet';
    const idx = nearestIndex(x, slotSV.value, countSV.value);
    const target = slotCenter(idx, slotSV.value);
    smear.value = withSpring(0, TRAIL);
    cx.value = withSpring(target, LEAD);
    groove.value = withSpring(target, TRAIL);
    runOnJS(setNearest)(idx);
    runOnJS(snapTo)(idx);
  };

  const tap = Gesture.Tap().onEnd((e, success) => {
    if (!success) return;
    selectAt(e.x);
  });

  const pan = Gesture.Pan()
    .minDistance(12)
    .onBegin((e) => {
      drag.value = 1;
      pressX.value = e.x;
      runOnJS(setNearest)(nearestIndex(e.x, slotSV.value, countSV.value));
    })
    .onUpdate((e) => {
      const s = slotSV.value;
      const min = SIDE + s * 0.5;
      const max = widthSV.value - SIDE - s * 0.5;
      const x = clamp(e.x, min, max);
      cx.value = x;
      groove.value = groove.value + (x - groove.value) * 0.18;
      smear.value = clamp((x - groove.value) / 14, -1.15, 1.15);
    })
    .onEnd((e) => {
      drag.value = 0;
      selectAt(e.x);
    })
    .onFinalize(() => {
      drag.value = 0;
    });

  const dockGesture =
    Platform.OS === 'web' ? Gesture.Tap().enabled(false) : Gesture.Exclusive(pan, tap);

  return (
    <View
      pointerEvents="box-none"
      onLayout={(e) => place(e.nativeEvent.layout.width)}
      style={{
        position: 'absolute',
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: page,
      }}
    >
      <GestureDetector gesture={dockGesture} touchAction="auto">
        <Animated.View collapsable={false} style={{ height: svgH, overflow: 'visible' }}>
          <BlurView
            pointerEvents="none"
            intensity={Platform.OS === 'ios' ? 36 : 22}
            tint="dark"
            style={{
              position: 'absolute',
              left: SIDE,
              right: SIDE,
              top: BAR_TOP,
              height: PILL_H,
              borderRadius: PILL_H / 2,
              overflow: 'hidden',
              backgroundColor: TEAL,
              borderWidth: StyleSheet.hairlineWidth,
              borderColor: TEAL_EDGE,
            }}
          />
          <LinearGradient
            pointerEvents="none"
            colors={['rgba(61,143,154,0.22)', 'rgba(17,55,68,0.08)', 'rgba(17,55,68,0.2)']}
            locations={[0, 0.45, 1]}
            start={{ x: 0.5, y: 0 }}
            end={{ x: 0.5, y: 1 }}
            style={{
              position: 'absolute',
              left: SIDE,
              right: SIDE,
              top: BAR_TOP,
              height: PILL_H,
              borderRadius: PILL_H / 2,
            }}
          />
          {width > 0 ? (
            <Svg width={width} height={svgH} style={{ position: 'absolute', left: 0, top: 0, pointerEvents: 'none' }}>
              <AnimatedPath
                d={dockPath(width, slotCenter(activeIndex, slot), 0)}
                animatedProps={dockProps}
                fill="rgba(17,55,68,0.28)"
                stroke={TEAL_EDGE}
                strokeWidth={1}
              />
            </Svg>
          ) : null}

          <View
            style={{
              position: 'absolute',
              left: SIDE,
              right: SIDE,
              top: BAR_TOP,
              height: PILL_H,
              flexDirection: 'row',
            }}
          >
            {items.map((item, index) => {
              const icon = (
                <TabIcon item={item} index={index} cx={cx} slotSV={slotSV} />
              );
              if (Platform.OS !== 'web') {
                return <React.Fragment key={item.key}>{icon}</React.Fragment>;
              }
              return (
                <Pressable
                  key={item.key}
                  accessibilityRole="button"
                  accessibilityLabel={item.label}
                  onPress={() => snapTo(index)}
                  style={{ flex: 1 }}
                >
                  {icon}
                </Pressable>
              );
            })}
          </View>

          <Animated.View
            pointerEvents="none"
            style={[
              {
                position: 'absolute',
                top: BAR_TOP - BEAD / 2 + 5,
                width: BEAD,
                height: BEAD,
                borderRadius: BEAD / 2,
                overflow: 'hidden',
                borderWidth: 1,
                borderColor: 'rgba(248,214,212,0.45)',
              },
              Platform.OS === 'web'
                ? { boxShadow: '0 8px 18px rgba(237,29,36,0.28)' }
                : {
                    shadowColor: ACCENT,
                    shadowOffset: { width: 0, height: 6 },
                    shadowOpacity: 0.3,
                    shadowRadius: 10,
                    elevation: 12,
                  },
              beadStyle,
            ]}
          >
            <LinearGradient
              colors={['#F24A50', ACCENT, '#C4181E']}
              locations={[0, 0.5, 1]}
              start={{ x: 0.3, y: 0 }}
              end={{ x: 0.75, y: 1 }}
              style={StyleSheet.absoluteFill}
            />
            {items.map((item, index) => (
              <BeadIcon key={item.key} item={item} index={index} cx={cx} slotSV={slotSV} />
            ))}
          </Animated.View>

        </Animated.View>
      </GestureDetector>
    </View>
  );
}

function TabGlyph({ name, pack, size, color }) {
  if (pack === 'material') return <MaterialIcons name={name} size={size} color={color} />;
  return <Ionicons name={name} size={size} color={color} />;
}

function TabIcon({ item, index, cx, slotSV }) {
  const iconStyle = useAnimatedStyle(() => {
    const slot = slotSV.value || 1;
    const dist = Math.abs(cx.value - slotCenter(index, slot));
    const near = interpolate(dist, [0, slot * 0.42], [1, 0], Extrapolation.CLAMP);
    return { opacity: 1 - near };
  });

  return (
    <View
      accessible
      accessibilityRole="button"
      accessibilityLabel={item.label}
      style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}
    >
      <Animated.View style={iconStyle}>
        <TabGlyph name={item.outline} pack={item.pack} size={20} color="rgba(245,242,232,0.78)" />
      </Animated.View>
      <Text
        numberOfLines={1}
        style={[
          af,
          {
            marginTop: 2,
            fontSize: 9,
            lineHeight: 11,
            color: 'rgba(245,242,232,0.92)',
            fontFamily: IL_FONTS.semibold,
            textAlign: 'center',
          },
        ]}
      >
        {item.label}
      </Text>
    </View>
  );
}

function BeadIcon({ item, index, cx, slotSV }) {
  const style = useAnimatedStyle(() => {
    const slot = slotSV.value || 1;
    const dist = Math.abs(cx.value - slotCenter(index, slot));
    const t = interpolate(dist, [0, slot * 0.4], [1, 0], Extrapolation.CLAMP);
    return { opacity: t };
  });

  return (
    <Animated.View
      style={[
        {
          position: 'absolute',
          left: 0,
          right: 0,
          top: 0,
          bottom: 0,
          alignItems: 'center',
          justifyContent: 'center',
        },
        style,
      ]}
    >
      <TabGlyph name={item.icon} pack={item.pack} size={20} color="#FFFFFF" />
    </Animated.View>
  );
}

function isHiddenTab(options) {
  if (options.tabBarButton === null || options.href === null) return true;
  if (options.tabBarItemStyle?.display === 'none') return true;
  return false;
}

export function useLiquidItems(state, descriptors, iconFor) {
  return useMemo(
    () =>
      state.routes
        .map((route) => {
          const options = descriptors[route.key]?.options || {};
          if (isHiddenTab(options)) return null;
          const icons = iconFor(route.name);
          return {
            key: route.key,
            name: route.name,
            label: String(options.tabBarLabel || options.title || route.name),
            icon: icons.icon,
            outline: icons.outline,
            pack: icons.pack,
          };
        })
        .filter(Boolean),
    [state.routes, descriptors, iconFor]
  );
}

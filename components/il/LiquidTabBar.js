import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Platform, Text, View } from 'react-native';
import { Ionicons, MaterialIcons } from '@expo/vector-icons';
import { BlurView } from 'expo-blur';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import Reanimated, {
  runOnJS,
  useAnimatedProps,
  useAnimatedReaction,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withTiming,
} from 'react-native-reanimated';
import Svg, { Path } from 'react-native-svg';
import { IL_FONTS } from '../../constants/ironLadyBrand';
import { G } from '../../constants/guestTheme';

/*
 * The bead, the socket it sits in and the drag all run on the UI thread (Reanimated +
 * Gesture Handler). A busy JS thread — a screen mounting, a Firestore snapshot — can no
 * longer stall or desync them; JS only hears when the tab under the bead changes.
 */

const BEAD = 48;
const BOWL = BEAD / 2 + 7;
const SHOULDER = 10;
const MIN_CORNER = 8;
const PILL_H = 62;
const BAR_TOP = 30;
const SIDE = 16;
const ACCENT = G.cta;
const GLASS = 'rgba(17,55,68,0.86)';
const GLASS_EDGE = 'rgba(248,214,212,0.45)';
const NAME = '#F5F2E8';
const ICON_DIM = 'rgba(245,242,232,0.78)';
const SPRING = { damping: 15, stiffness: 220, mass: 0.6 };
/** Let the bead get most of the way before the new screen mounts. */
const NAV_DELAY_MS = 140;

export const LIQUID_TAB_PAD = BAR_TOP + PILL_H + 24;

const AnimatedPath = Reanimated.createAnimatedComponent(Path);
const IS_WEB = Platform.OS === 'web';

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

function smoothstep(a, b, t) {
  'worklet';
  const k = clamp((t - a) / (b - a), 0, 1);
  return k * k * (3 - 2 * k);
}

/** 0 at rest, 1 at a fast flick (velocity in px/ms). */
function speedOf(v) {
  'worklet';
  return clamp(Math.abs(v) / 1.2, 0, 1);
}

function arc(rad, x, y, sweep) {
  'worklet';
  return rad < 0.5 ? `L ${x} ${y}` : `A ${rad} ${rad} 0 0 ${sweep} ${x} ${y}`;
}

/**
 * Largest shoulder radius (up to `want`) whose tangent point on the flat edge stays
 * `room` px from the notch centre. Tangency: d² = BOWL² + 2·BOWL·s.
 */
function fitShoulder(want, room) {
  'worklet';
  return clamp((room * room - BOWL * BOWL) / (2 * BOWL), 0, want);
}

/**
 * Bar outline with a socket under the bead, solved for tangency: a convex shoulder
 * turns the flat edge down, a concave bowl concentric with the bead wraps it, and a
 * second shoulder brings it back up. While moving, the trailing shoulder draws out
 * long and the leading one tightens.
 */
function dockPath(width, cx, v) {
  'worklet';
  const w = Math.max(width, 1);
  const top = BAR_TOP;
  const bot = top + PILL_H;
  const left = SIDE;
  const right = w - SIDE;
  const r = PILL_H / 2;
  const x = clamp(cx, left + BOWL, right - BOWL);

  const speed = speedOf(v);
  const trail = SHOULDER + 26 * speed;
  const lead = SHOULDER * (1 - 0.6 * speed);
  const sL = fitShoulder(v > 0 ? trail : lead, x - left - MIN_CORNER);
  const sR = fitShoulder(v > 0 ? lead : trail, right - x - MIN_CORNER);
  const dL = Math.sqrt(BOWL * BOWL + 2 * BOWL * sL);
  const dR = Math.sqrt(BOWL * BOWL + 2 * BOWL * sR);
  const kL = BOWL / (BOWL + sL);
  const kR = BOWL / (BOWL + sR);
  // Top corners give way when the socket sits near an end of the bar.
  const rl = clamp(x - dL - left, 0, r);
  const rr = clamp(right - x - dR, 0, r);

  return [
    `M ${left} ${top + rl}`,
    arc(rl, left + rl, top, 1),
    `L ${x - dL} ${top}`,
    arc(sL, x - dL * kL, top + sL * kL, 1),
    `A ${BOWL} ${BOWL} 0 0 0 ${x + dR * kR} ${top + sR * kR}`,
    arc(sR, x + dR, top, 1),
    `L ${right - rr} ${top}`,
    arc(rr, right, top + rr, 1),
    `L ${right} ${bot - r}`,
    arc(r, right - r, bot, 1),
    `L ${left + r} ${bot}`,
    arc(r, left, bot - r, 1),
    'Z',
  ].join(' ');
}

const GlassBlur = React.memo(function GlassBlur() {
  // Android: the fill on top is near-opaque, so the blur is invisible but costs a pass every frame.
  if (Platform.OS !== 'ios') return null;
  return (
    <BlurView
      intensity={48}
      tint="dark"
      style={{
        position: 'absolute',
        left: SIDE,
        right: SIDE,
        top: BAR_TOP,
        height: PILL_H,
        borderRadius: PILL_H / 2,
        overflow: 'hidden',
        backgroundColor: GLASS,
      }}
    />
  );
});

function GlassDock({ width, height, x, v }) {
  const pathProps = useAnimatedProps(() => ({ d: dockPath(width, x.value, v.value) }));
  // Web blurs what is behind the bar, clipped to the same outline.
  const webClip = useAnimatedStyle(() =>
    IS_WEB ? { clipPath: `path('${dockPath(width, x.value, v.value)}')` } : {}
  );
  return (
    <View pointerEvents="none" style={{ position: 'absolute', left: 0, top: 0, width, height }}>
      {Platform.OS === 'web' ? (
        <Reanimated.View
          style={[
            {
              position: 'absolute',
              left: 0,
              top: 0,
              width,
              height,
              backgroundColor: GLASS,
              backdropFilter: 'blur(28px) saturate(180%)',
              WebkitBackdropFilter: 'blur(28px) saturate(180%)',
              boxShadow: '0 10px 24px rgba(17,55,68,0.18)',
            },
            webClip,
          ]}
        />
      ) : (
        <GlassBlur />
      )}
      <Svg width={width} height={height} style={{ position: 'absolute', left: 0, top: 0 }}>
        <AnimatedPath
          animatedProps={pathProps}
          fill={Platform.OS === 'web' ? 'rgba(17,55,68,0.35)' : GLASS}
          stroke={GLASS_EDGE}
          strokeWidth={1}
        />
      </Svg>
    </View>
  );
}

/** Each icon rises on its own proximity curve as the bead nears, then dips into it. */
function TabIcon({ item, index, slot, x }) {
  const lift = useAnimatedStyle(() => {
    const p = clamp(1 - Math.abs(x.value - slotCenter(index, slot)) / (slot * 0.8), 0, 1);
    return {
      opacity: 1 - smoothstep(0.6, 0.92, p),
      transform: [{ translateY: -8 * Math.sin(Math.PI * p) }],
    };
  });
  return (
    <Reanimated.View style={lift}>
      <TabGlyph name={item.outline} pack={item.pack} size={20} color={ICON_DIM} />
    </Reanimated.View>
  );
}

export default function LiquidTabBar({ items, activeIndex, onPress }) {
  const insets = useSafeAreaInsets();
  const bottom = Math.max(insets.bottom, 8);
  const [width, setWidth] = useState(0);
  const count = items.length || 1;
  const slot = Math.max(width - SIDE * 2, 1) / count;
  const safeIndex = clamp(activeIndex, 0, count - 1);
  const [hover, setHover] = useState(safeIndex);

  const x = useSharedValue(slotCenter(safeIndex, slot));
  const v = useSharedValue(0); // smoothed velocity, px/ms — stretches the socket
  const dragging = useSharedValue(false);

  const placed = useRef(false);
  // Where the bead is already springing to, so the focus change that follows a tap doesn't restart it.
  const aim = useRef({ index: -1, slot: 0 });
  const navTimer = useRef(null);
  const itemsRef = useRef(items);
  const onPressRef = useRef(onPress);
  const safeIndexRef = useRef(safeIndex);
  itemsRef.current = items;
  onPressRef.current = onPress;
  safeIndexRef.current = safeIndex;

  // Velocity from the bead's own motion; it settles back to 0 when a spring ends.
  useAnimatedReaction(
    () => x.value,
    (cur, prev) => {
      if (prev == null) return;
      v.value += ((cur - prev) / 16 - v.value) * 0.35;
    }
  );

  // JS hears only when the tab under the bead changes (label colour, bead icon).
  useAnimatedReaction(
    () => nearestIndex(x.value, slot, count),
    (i, prev) => {
      if (i !== prev) runOnJS(setHover)(i);
    },
    [slot, count]
  );

  const settle = () => {
    'worklet';
    v.value = withTiming(0, { duration: 160 });
  };

  const springTo = (target) => {
    'worklet';
    x.value = withSpring(target, SPRING, (finished) => {
      if (finished) settle();
    });
  };

  const navigate = (index) => {
    const item = itemsRef.current[index];
    if (!item) return;
    aim.current = { index, slot };
    if (navTimer.current) clearTimeout(navTimer.current);
    // Same tab again (back to its root) has no slide to protect.
    if (index === safeIndexRef.current) {
      onPressRef.current(item, index);
      return;
    }
    navTimer.current = setTimeout(() => {
      navTimer.current = null;
      onPressRef.current(item, index);
    }, NAV_DELAY_MS);
  };

  useEffect(() => () => navTimer.current && clearTimeout(navTimer.current), []);

  const minX = SIDE + slot * 0.5;
  const maxX = width - SIDE - slot * 0.5;

  const snapAt = (px) => {
    'worklet';
    const index = nearestIndex(px, slot, count);
    springTo(slotCenter(index, slot));
    runOnJS(navigate)(index);
  };

  const gesture = useMemo(() => {
    const pan = Gesture.Pan()
      .minDistance(2)
      // Move only once it is a drag: a tap glides from where the bead is, never jumps to the finger.
      .onStart((e) => {
        dragging.value = true;
        x.value = clamp(e.x, minX, maxX);
      })
      .onUpdate((e) => {
        x.value = clamp(e.x, minX, maxX);
      })
      .onEnd(() => {
        snapAt(x.value);
      })
      .onFinalize(() => {
        dragging.value = false;
      });
    const tap = Gesture.Tap().onEnd((e, ok) => {
      if (ok) snapAt(e.x);
    });
    return Gesture.Race(pan, tap);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [slot, count, minX, maxX]);

  // Focus changed from elsewhere (a deep link, a "Go to Learn" button): slide there.
  useEffect(() => {
    if (!width || dragging.value) return;
    const target = slotCenter(safeIndex, slot);
    if (!placed.current) {
      x.value = target;
      placed.current = true;
      aim.current = { index: safeIndex, slot };
      setHover(safeIndex);
      return;
    }
    // A tap elsewhere is still pending navigation: don't pull the bead back to the old tab.
    if (navTimer.current) return;
    if (aim.current.index === safeIndex && aim.current.slot === slot) return;
    aim.current = { index: safeIndex, slot };
    springTo(target);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [safeIndex, slot, width]);

  const beadStyle = useAnimatedStyle(() => {
    const speed = speedOf(v.value);
    return {
      transform: [{ translateX: x.value }, { scaleX: 1 + 0.14 * speed }, { scaleY: 1 - 0.1 * speed }],
    };
  });

  const svgH = BAR_TOP + PILL_H;

  return (
    <View
      pointerEvents="box-none"
      onLayout={(e) => setWidth(e.nativeEvent.layout.width)}
      style={{
        position: 'absolute',
        left: 0,
        right: 0,
        bottom: 0,
        paddingBottom: bottom,
        zIndex: 40,
        elevation: 40,
      }}
    >
      <GestureDetector gesture={gesture}>
        <View style={{ height: svgH, overflow: 'visible' }}>
          {width > 0 ? <GlassDock width={width} height={svgH} x={x} v={v} /> : null}

          <View
            accessibilityRole="tablist"
            style={{
              position: 'absolute',
              left: SIDE,
              right: SIDE,
              top: BAR_TOP,
              height: PILL_H,
              flexDirection: 'row',
            }}
          >
            {items.map((item, index) => (
              <View
                key={item.key}
                accessible
                accessibilityRole="tab"
                accessibilityLabel={item.label}
                accessibilityState={{ selected: index === safeIndex }}
                accessibilityActions={[{ name: 'activate' }]}
                onAccessibilityAction={() => {
                  springTo(slotCenter(index, slot));
                  navigate(index);
                }}
                style={{ flex: 1, alignItems: 'center', justifyContent: 'flex-end', paddingBottom: 9 }}
              >
                {width > 0 ? <TabIcon item={item} index={index} slot={slot} x={x} /> : null}
                <Text
                  numberOfLines={1}
                  style={{
                    marginTop: 3,
                    fontSize: 11,
                    lineHeight: 13,
                    textAlign: 'center',
                    color: index === hover ? NAME : ICON_DIM,
                    fontFamily: index === hover ? IL_FONTS.semibold : IL_FONTS.medium,
                  }}
                >
                  {item.label}
                </Text>
              </View>
            ))}
          </View>

          {width > 0 ? (
            <Reanimated.View
              pointerEvents="none"
              style={[
                {
                  position: 'absolute',
                  top: BAR_TOP - BEAD / 2,
                  width: BEAD,
                  height: BEAD,
                  marginLeft: -BEAD / 2,
                  borderRadius: BEAD / 2,
                  backgroundColor: ACCENT,
                  alignItems: 'center',
                  justifyContent: 'center',
                  zIndex: 3,
                  ...(Platform.OS === 'web'
                    ? { boxShadow: '0 8px 16px rgba(237,29,36,0.28)' }
                    : {
                        shadowColor: ACCENT,
                        shadowOffset: { width: 0, height: 6 },
                        shadowOpacity: 0.28,
                        shadowRadius: 8,
                        elevation: 14,
                      }),
                },
                beadStyle,
              ]}
            >
              <TabGlyph name={items[hover]?.icon} pack={items[hover]?.pack} size={22} color="#FFFFFF" />
            </Reanimated.View>
          ) : null}
        </View>
      </GestureDetector>
    </View>
  );
}

function TabGlyph({ name, pack, size, color }) {
  if (pack === 'material') return <MaterialIcons name={name} size={size} color={color} />;
  return <Ionicons name={name} size={size} color={color} />;
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

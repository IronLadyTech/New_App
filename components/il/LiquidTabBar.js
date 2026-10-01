import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Animated, PanResponder, Platform, Text, View } from 'react-native';
import { Ionicons, MaterialIcons } from '@expo/vector-icons';
import { BlurView } from 'expo-blur';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Svg, { Path } from 'react-native-svg';
import { IL_FONTS } from '../../constants/ironLadyBrand';
import { G } from '../../constants/guestTheme';

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

export const LIQUID_TAB_PAD = BAR_TOP + PILL_H + 24;

function clamp(n, min, max) {
  return Math.min(max, Math.max(min, n));
}

function slotCenter(index, slot) {
  return SIDE + (index + 0.5) * slot;
}

function nearestIndex(x, slot, count) {
  if (slot <= 0) return 0;
  return clamp(Math.round((x - SIDE) / slot - 0.5), 0, count - 1);
}

function smoothstep(a, b, t) {
  const k = clamp((t - a) / (b - a), 0, 1);
  return k * k * (3 - 2 * k);
}

/** 0 at rest, 1 at a fast flick (velocity in px/ms). */
function speedOf(v) {
  return clamp(Math.abs(v) / 1.2, 0, 1);
}

function arc(rad, x, y, sweep) {
  return rad < 0.5 ? `L ${x} ${y}` : `A ${rad} ${rad} 0 0 ${sweep} ${x} ${y}`;
}

/**
 * Largest shoulder radius (up to `want`) whose tangent point on the flat edge stays
 * `room` px from the notch centre. Tangency: d² = BOWL² + 2·BOWL·s.
 */
function fitShoulder(want, room) {
  return clamp((room * room - BOWL * BOWL) / (2 * BOWL), 0, want);
}

/**
 * Bar outline with a socket under the bead, solved for tangency: a convex shoulder
 * turns the flat edge down, a concave bowl concentric with the bead wraps it, and a
 * second shoulder brings it back up. While moving, the trailing shoulder draws out
 * long and the leading one tightens.
 */
function dockPath(width, cx, v) {
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

function GlassDock({ width, height, d }) {
  return (
    <View pointerEvents="none" style={{ position: 'absolute', left: 0, top: 0, width, height }}>
      {Platform.OS === 'web' ? (
        <View
          style={{
            position: 'absolute',
            left: 0,
            top: 0,
            width,
            height,
            backgroundColor: GLASS,
            backdropFilter: 'blur(28px) saturate(180%)',
            WebkitBackdropFilter: 'blur(28px) saturate(180%)',
            clipPath: `path('${d}')`,
            boxShadow: '0 10px 24px rgba(17,55,68,0.18)',
          }}
        />
      ) : (
        <BlurView
          intensity={Platform.OS === 'ios' ? 48 : 32}
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
      )}
      <Svg width={width} height={height} style={{ position: 'absolute', left: 0, top: 0 }}>
        <Path
          d={d}
          fill={Platform.OS === 'web' ? 'rgba(17,55,68,0.35)' : GLASS}
          stroke={GLASS_EDGE}
          strokeWidth={1}
        />
      </Svg>
    </View>
  );
}

export default function LiquidTabBar({ items, activeIndex, onPress }) {
  const insets = useSafeAreaInsets();
  const bottom = Math.max(insets.bottom, 8);
  const [width, setWidth] = useState(0);
  const count = items.length || 1;
  const slot = Math.max(width - SIDE * 2, 1) / count;
  const safeIndex = clamp(activeIndex, 0, count - 1);
  const beadX = useRef(new Animated.Value(slotCenter(safeIndex, slot))).current;
  const [frame, setFrame] = useState({ cx: 0, v: 0 });
  const [hover, setHover] = useState(safeIndex);
  const cxRef = useRef(0);
  const motion = useRef({ x: 0, lastX: 0, v: 0, t: 0, raf: 0 });
  const placed = useRef(false);
  const dragging = useRef(false);
  const widthRef = useRef(0);
  const slotRef = useRef(slot);
  const countRef = useRef(count);
  const itemsRef = useRef(items);
  const onPressRef = useRef(onPress);
  const barLeft = useRef(0);
  const barRef = useRef(null);

  widthRef.current = width;
  slotRef.current = slot;
  countRef.current = count;
  itemsRef.current = items;
  onPressRef.current = onPress;

  // One rAF loop tracks position + smoothed velocity, and parks itself once still.
  useEffect(() => {
    const m = motion.current;
    const tick = () => {
      const now = Date.now();
      const moved = m.x - m.lastX;
      m.v += (moved / Math.max(now - m.t, 1) - m.v) * 0.35;
      m.lastX = m.x;
      m.t = now;
      if (moved === 0 && Math.abs(m.v) < 0.01) {
        m.v = 0;
        m.raf = 0;
        setFrame({ cx: m.x, v: 0 });
        return;
      }
      setFrame({ cx: m.x, v: m.v });
      m.raf = requestAnimationFrame(tick);
    };
    const sub = beadX.addListener(({ value }) => {
      cxRef.current = value;
      m.x = value;
      if (!m.raf) {
        m.t = Date.now();
        m.raf = requestAnimationFrame(tick);
      }
    });
    return () => {
      beadX.removeListener(sub);
      if (m.raf) cancelAnimationFrame(m.raf);
      m.raf = 0;
    };
  }, [beadX]);

  const xFromEvent = (e) => {
    const pageX = e.nativeEvent.pageX;
    if (typeof pageX === 'number') return pageX - barLeft.current;
    return e.nativeEvent.locationX;
  };

  const slideTo = (x) => {
    const min = SIDE + slotRef.current * 0.5;
    const max = widthRef.current - SIDE - slotRef.current * 0.5;
    const next = clamp(x, min, max);
    beadX.setValue(next);
    setHover(nearestIndex(next, slotRef.current, countRef.current));
  };

  const snapTo = (index) => {
    const item = itemsRef.current[index];
    const target = slotCenter(index, slotRef.current);
    setHover(index);
    Animated.spring(beadX, {
      toValue: target,
      damping: 15,
      stiffness: 220,
      mass: 0.6,
      useNativeDriver: false,
    }).start();
    if (item) onPressRef.current(item, index);
  };

  const pan = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: (_, g) => Math.abs(g.dx) > 2 || Math.abs(g.dy) > 2,
      onPanResponderGrant: (e) => {
        dragging.current = true;
        slideTo(xFromEvent(e));
      },
      onPanResponderMove: (e) => {
        slideTo(xFromEvent(e));
      },
      onPanResponderRelease: (e, g) => {
        dragging.current = false;
        const x = xFromEvent(e);
        const tapped = Math.abs(g.dx) < 8 && Math.abs(g.dy) < 8;
        snapTo(nearestIndex(tapped ? x : cxRef.current || x, slotRef.current, countRef.current));
      },
      onPanResponderTerminate: () => {
        dragging.current = false;
      },
    })
  ).current;

  useEffect(() => {
    if (!width || dragging.current) return;
    const next = slotCenter(safeIndex, slot);
    if (!placed.current) {
      motion.current.x = next;
      motion.current.lastX = next;
      beadX.setValue(next);
      setFrame({ cx: next, v: 0 });
      setHover(safeIndex);
      placed.current = true;
      return;
    }
    setHover(safeIndex);
    Animated.spring(beadX, {
      toValue: next,
      damping: 15,
      stiffness: 220,
      mass: 0.6,
      useNativeDriver: false,
    }).start();
  }, [beadX, safeIndex, slot, width]);

  const svgH = BAR_TOP + PILL_H;
  const { cx, v } = frame;
  const speed = speedOf(v);

  return (
    <View
      ref={barRef}
      pointerEvents="box-none"
      onLayout={(e) => {
        setWidth(e.nativeEvent.layout.width);
        const node = barRef.current;
        if (node && typeof node.measureInWindow === 'function') {
          node.measureInWindow((x) => {
            barLeft.current = x || 0;
          });
        }
      }}
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
      <View style={{ height: svgH, overflow: 'visible' }} {...pan.panHandlers}>
        {width > 0 ? <GlassDock width={width} height={svgH} d={dockPath(width, cx, v)} /> : null}

        <View
          pointerEvents="none"
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
          {items.map((item, index) => {
            // Each icon rises on its own proximity curve as the bead nears, then dips into it.
            const p = clamp(1 - Math.abs(cx - slotCenter(index, slot)) / (slot * 0.8), 0, 1);
            return (
              <View
                key={item.key}
                accessibilityRole="tab"
                accessibilityLabel={item.label}
                accessibilityState={{ selected: index === safeIndex }}
                style={{ flex: 1, alignItems: 'center', justifyContent: 'flex-end', paddingBottom: 9 }}
              >
                <View
                  style={{
                    opacity: 1 - smoothstep(0.6, 0.92, p),
                    transform: [{ translateY: -8 * Math.sin(Math.PI * p) }],
                  }}
                >
                  <TabGlyph name={item.outline} pack={item.pack} size={20} color={ICON_DIM} />
                </View>
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
            );
          })}
        </View>

        {width > 0 ? (
          <>
            <Animated.View
              pointerEvents="none"
              style={{
                position: 'absolute',
                top: BAR_TOP - BEAD / 2,
                width: BEAD,
                height: BEAD,
                marginLeft: -BEAD / 2,
                borderRadius: BEAD / 2,
                backgroundColor: ACCENT,
                alignItems: 'center',
                justifyContent: 'center',
                // Squash along the direction of travel.
                transform: [
                  { translateX: beadX },
                  { scaleX: 1 + 0.14 * speed },
                  { scaleY: 1 - 0.1 * speed },
                ],
                ...(Platform.OS === 'web'
                  ? { boxShadow: '0 8px 16px rgba(237,29,36,0.28)' }
                  : {
                      shadowColor: ACCENT,
                      shadowOffset: { width: 0, height: 6 },
                      shadowOpacity: 0.28,
                      shadowRadius: 8,
                      elevation: 14,
                    }),
              }}
            >
              <TabGlyph name={items[hover]?.icon} pack={items[hover]?.pack} size={22} color="#FFFFFF" />
            </Animated.View>
          </>
        ) : null}
      </View>
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

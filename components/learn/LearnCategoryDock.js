import React, { useCallback, useMemo, useRef, useState } from 'react';
import { Platform, ScrollView, StyleSheet, View } from 'react-native';
import { BlurView } from 'expo-blur';
import { MaterialIcons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Reanimated, {
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withSpring,
  withTiming,
} from 'react-native-reanimated';
import Pressable from '../il/Press';
import ILText from '../il/ILText';
import { G, af } from '../../constants/guestTheme';
import { LIQUID_TAB_PILL_STACK } from '../il/LiquidTabBar';

const GAP_ABOVE_TAB = 10;
const BEAD_HEADROOM = 12;
const TAB_SIDE = 16;
const TAB_BAR_LIFT = LIQUID_TAB_PILL_STACK + BEAD_HEADROOM + GAP_ABOVE_TAB;

/** Collapsed FAB only — bubbles float over content, not in scroll padding. */
export const LEARN_CATEGORY_DOCK_PAD = 24;

const TEAL_GLASS = 'rgba(17,55,68,0.82)';
const GLASS_EDGE = 'rgba(248,214,212,0.45)';
const GLASS_HI = 'rgba(255,255,255,0.22)';

const FAB = 52;
const BUBBLE_GAP = 6;
const STAGGER_MS = 55;

/** Customer-facing order — maps to existing Learn chip ids in LepLearnScreen. */
const EXPLORE_OPTIONS = [
  { id: 'For you', title: 'For You', hint: 'Personalized recommendations', icon: 'auto-awesome' },
  { id: 'Case studies', title: 'Case Studies', hint: 'Real experiences and success stories', icon: 'business-center' },
  { id: 'Events', title: 'Events', hint: 'Upcoming workshops and events', icon: 'event' },
  { id: 'Community stories', title: 'Stories', hint: 'Inspirational leadership stories', icon: 'record-voice-over' },
  { id: 'Principles', title: 'Principles', hint: 'Iron Lady leadership principles', icon: 'menu-book' },
];

const SPRING_IN = { damping: 17, stiffness: 200, mass: 0.75 };
const SPRING_OUT = { damping: 20, stiffness: 260 };

function GlassShell({ children, style, intensity = 72, dark = true }) {
  const shell = [
    styles.glassBase,
    dark ? { backgroundColor: TEAL_GLASS } : { backgroundColor: 'rgba(255,255,255,0.72)' },
    style,
  ];
  if (Platform.OS === 'ios') {
    return (
      <BlurView intensity={intensity} tint={dark ? 'dark' : 'light'} style={shell}>
        {children}
      </BlurView>
    );
  }
  return <View style={shell}>{children}</View>;
}

function ExploreBubble({ option, index, visible, active, onPress, total }) {
  const enter = useSharedValue(0);

  React.useEffect(() => {
    if (visible) {
      enter.value = withDelay(index * STAGGER_MS, withSpring(1, SPRING_IN));
    } else {
      enter.value = withDelay((total - 1 - index) * 32, withTiming(0, { duration: 180 }));
    }
  }, [visible, index, enter, total]);

  const anim = useAnimatedStyle(() => ({
    opacity: enter.value,
    transform: [
      { translateX: (1 - enter.value) * 48 },
      { scale: 0.92 + enter.value * 0.08 },
    ],
  }));

  return (
    <Reanimated.View style={anim} pointerEvents={visible ? 'auto' : 'none'}>
      <Pressable
        onPress={onPress}
        accessibilityRole="button"
        accessibilityLabel={option.title}
        accessibilityState={{ selected: active }}
      >
        <GlassShell dark={false} intensity={58} style={styles.bubble}>
          <View style={[styles.bubbleIcon, active && styles.bubbleIconActive]}>
            <MaterialIcons name={option.icon} size={18} color={active ? '#FFFFFF' : G.dark} />
          </View>
          <ILText role="label" color={G.ink} numberOfLines={1} style={[af, styles.bubbleTitle]}>
            {option.title}
          </ILText>
        </GlassShell>
      </Pressable>
    </Reanimated.View>
  );
}

/**
 * Floating glass Explore — FAB with options in one short horizontal row (R→L).
 */
export default function LearnCategoryDock({ items, value, onChange }) {
  const insets = useSafeAreaInsets();
  const busy = useRef(false);
  const [open, setOpen] = useState(false);
  const [showBubbles, setShowBubbles] = useState(false);

  const options = useMemo(
    () => EXPLORE_OPTIONS.filter((o) => items.includes(o.id)),
    [items]
  );

  const dockBottom = Math.max(insets.bottom, 8) + TAB_BAR_LIFT;
  const fabSpin = useSharedValue(0);

  const close = useCallback(() => {
    setShowBubbles(false);
    fabSpin.value = withSpring(0, SPRING_OUT);
    setTimeout(() => {
      setOpen(false);
      busy.current = false;
    }, 280);
  }, [fabSpin]);

  const toggleExplore = () => {
    if (busy.current) return;
    if (open) {
      busy.current = true;
      close();
      return;
    }
    setOpen(true);
    fabSpin.value = withSpring(1, SPRING_IN);
    requestAnimationFrame(() => setShowBubbles(true));
  };

  const pick = (id) => {
    if (busy.current) return;
    busy.current = true;
    setShowBubbles(false);
    fabSpin.value = withSpring(0, SPRING_OUT);
    setTimeout(() => {
      onChange?.(id);
      setOpen(false);
      busy.current = false;
    }, 260);
  };

  const fabStyle = useAnimatedStyle(() => ({
    transform: [{ rotate: `${fabSpin.value * 90}deg` }],
  }));

  return (
    <>
      {open ? (
        <Pressable
          onPress={close}
          accessibilityRole="button"
          accessibilityLabel="Close Explore"
          style={styles.backdrop}
        />
      ) : null}

      <View pointerEvents="box-none" style={[styles.anchor, { bottom: dockBottom }]}>
        <View pointerEvents="box-none" style={styles.row}>
          {open ? (
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              bounces={false}
              style={styles.bubbleScroll}
              contentContainerStyle={styles.bubbleRow}
            >
              {options.map((opt, index) => (
                <ExploreBubble
                  key={opt.id}
                  option={opt}
                  index={index}
                  total={options.length}
                  visible={showBubbles}
                  active={value === opt.id}
                  onPress={() => pick(opt.id)}
                />
              ))}
            </ScrollView>
          ) : null}

          <Reanimated.View style={fabStyle}>
            <Pressable
              onPress={toggleExplore}
              accessibilityRole="button"
              accessibilityLabel={open ? 'Close Explore navigation' : 'Open Explore navigation'}
              accessibilityState={{ expanded: open }}
              style={styles.fabShadow}
            >
              <GlassShell style={styles.fab} intensity={80}>
                <MaterialIcons name={open ? 'close' : 'explore'} size={26} color="#F5F2E8" />
              </GlassShell>
            </Pressable>
          </Reanimated.View>
        </View>
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 25,
    backgroundColor: 'rgba(17,55,68,0.18)',
  },
  anchor: {
    position: 'absolute',
    right: TAB_SIDE,
    left: TAB_SIDE,
    zIndex: 30,
    elevation: 30,
    alignItems: 'flex-end',
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    maxWidth: '100%',
  },
  bubbleScroll: {
    flexGrow: 0,
    flexShrink: 1,
    marginRight: BUBBLE_GAP,
    maxHeight: 44,
  },
  bubbleRow: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    gap: BUBBLE_GAP,
    paddingRight: 2,
  },
  glassBase: {
    borderWidth: 1,
    borderColor: GLASS_EDGE,
    overflow: 'hidden',
  },
  bubble: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 999,
    paddingVertical: 5,
    paddingLeft: 5,
    paddingRight: 11,
    backgroundColor: 'rgba(255,255,255,0.94)',
    shadowColor: '#113744',
    shadowOpacity: 0.12,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
    elevation: 6,
    gap: 7,
  },
  bubbleIcon: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: 'rgba(17,55,68,0.08)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  bubbleIconActive: {
    backgroundColor: G.cta,
  },
  bubbleTitle: {
    fontSize: 12,
    lineHeight: 15,
    maxWidth: 92,
  },
  fabShadow: {
    borderRadius: FAB / 2,
    shadowColor: G.cta,
    shadowOpacity: 0.35,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 3 },
    elevation: 10,
  },
  fab: {
    width: FAB,
    height: FAB,
    borderRadius: FAB / 2,
    alignItems: 'center',
    justifyContent: 'center',
    borderColor: GLASS_HI,
  },
});
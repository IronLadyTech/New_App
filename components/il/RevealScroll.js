import React, { createContext, useContext, useMemo } from 'react';
import { View, useWindowDimensions } from 'react-native';
import Reanimated, {
  runOnJS,
  useAnimatedScrollHandler,
  useAnimatedStyle,
  useReducedMotion,
  useSharedValue,
} from 'react-native-reanimated';

/**
 * Scroll-driven reveal for whole screens (the MBW page's motion, everywhere): as she scrolls,
 * each block of the page rises and fades into place, tied to her finger — it plays back on the
 * way up. Runs on the UI thread (Reanimated); reduced motion shows a normal page.
 *
 *   <RevealScrollView …same props as ScrollView…>{blocks}</RevealScrollView>
 *
 * Each direct child is a block. If the content is wrapped in one plain View, that View's
 * children are the blocks instead (two levels deep), so screens need no restructuring.
 * Screens that already own their scroll (e.g. an RN Animated header) use
 * <RevealProvider scrollY={sharedValue}><RevealBlocks>{…}</RevealBlocks></RevealProvider>.
 */
const Fx = createContext(null);
const Offset = createContext(null);

export function RevealProvider({ scrollY, children }) {
  const { height } = useWindowDimensions();
  const value = useMemo(() => ({ scrollY, viewportH: height }), [scrollY, height]);
  return <Fx.Provider value={value}>{children}</Fx.Provider>;
}

function Reveal({ children }) {
  const fx = useContext(Fx);
  const base = useContext(Offset);
  const reduced = useReducedMotion();
  const y = useSharedValue(-1);
  const viewport = fx?.viewportH || 800;
  const style = useAnimatedStyle(() => {
    if (!fx || reduced || y.value < 0) return {};
    const top = (base ? base.value : 0) + y.value;
    // Starts as the block's top enters at the bottom edge; settles when it is a third of the way
    // up the screen — long enough to be seen, not just a flicker at the edge.
    const p = Math.min(1, Math.max(0, (fx.scrollY.value + viewport - top - 10) / (viewport * 0.38)));
    const e = 1 - (1 - p) * (1 - p); // ease out
    return { opacity: e, transform: [{ translateY: (1 - e) * 64 }, { scale: 0.92 + 0.08 * e }] };
  });
  return (
    <Reanimated.View
      onLayout={(e) => {
        y.value = e.nativeEvent.layout.y;
      }}
      style={style}
    >
      {children}
    </Reanimated.View>
  );
}

/** A plain wrapper View whose children become blocks; it reports where it sits in the page. */
function OffsetView({ element, depth }) {
  const parent = useContext(Offset);
  const own = useSharedValue(0);
  const at = useSharedValue(0);
  const { onLayout, children, ...rest } = element.props;
  return (
    <View
      {...rest}
      onLayout={(e) => {
        own.value = e.nativeEvent.layout.y;
        at.value = (parent ? parent.value : 0) + e.nativeEvent.layout.y;
        onLayout?.(e);
      }}
    >
      <Offset.Provider value={at}>{wrapBlocks(children, depth + 1)}</Offset.Provider>
    </View>
  );
}

function wrapBlocks(children, depth = 0) {
  const list = React.Children.toArray(children).filter(Boolean);
  if (list.length === 1 && depth < 2 && React.isValidElement(list[0]) && list[0].type === View) {
    return <OffsetView element={list[0]} depth={depth} />;
  }
  return list.map((child, i) => <Reveal key={child.key ?? i}>{child}</Reveal>);
}

/** The blocks of a page; use inside RevealProvider (RevealScrollView does this for you). */
export function RevealBlocks({ children }) {
  return wrapBlocks(children, 0);
}

/** Drop-in ScrollView with the scroll reveal. `onScroll` (a plain function) still gets events. */
export function RevealScrollView({ children, onScroll, scrollEventThrottle, ...props }) {
  const scrollY = useSharedValue(0);
  const forward = onScroll;
  const handler = useAnimatedScrollHandler((e) => {
    scrollY.value = e.contentOffset.y;
    if (forward) runOnJS(forward)({ nativeEvent: { contentOffset: { x: e.contentOffset.x, y: e.contentOffset.y } } });
  });
  return (
    <RevealProvider scrollY={scrollY}>
      <Reanimated.ScrollView {...props} onScroll={handler} scrollEventThrottle={scrollEventThrottle || 16}>
        <RevealBlocks>{children}</RevealBlocks>
      </Reanimated.ScrollView>
    </RevealProvider>
  );
}

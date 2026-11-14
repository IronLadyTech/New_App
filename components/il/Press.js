import React, { useState } from 'react';
import { Pressable, StyleSheet } from 'react-native';
import Reanimated, { useAnimatedStyle, useSharedValue, withSpring, withTiming } from 'react-native-reanimated';

/**
 * The app's one tappable: every screen imports this as `Pressable`.
 *
 * Touch feedback everywhere, so a tap is seen at once even when the next screen takes a moment:
 * the touched card / row / button settles in slightly (scale 0.975) and softens, then springs
 * back on release. It keeps the item's own shape (no grey square over rounded cards), looks the
 * same on Android and iPhone, and runs on the UI thread (Reanimated), never a JS render per frame.
 *
 * A screen that draws its own pressed look (`style={({ pressed }) => …}`) keeps it; pass
 * `pressFeedback={false}` to switch the default off. Popup backdrops and full-screen tap areas
 * get none.
 *
 * It also resolves `style={({ pressed }) => …}` itself: NativeWind's interop drops function
 * styles on Android (buttons lose their background and layout), so Pressable always gets a
 * plain style object.
 */
const AnimatedPressable = Reanimated.createAnimatedComponent(Pressable);
const IN = { duration: 90 };
const OUT = { damping: 18, stiffness: 320, mass: 0.6 };

/** A full-screen / full-area tap target (a popup backdrop, the splash): no feedback over it. */
function isBackdrop(style) {
  const s = StyleSheet.flatten(typeof style === 'function' ? style({ pressed: false }) : style) || {};
  // A dark see-through layer that fills the screen (side-by-side flex buttons keep feedback).
  if (s.flex === 1 && /^rgba\(\s*(0|12)\s*,/.test(String(s.backgroundColor || ''))) return true;
  return s.position === 'absolute' && s.top === 0 && s.bottom === 0 && s.left === 0 && s.right === 0;
}

function DynamicPress({ style, children, onPressIn, onPressOut, ...rest }) {
  const [pressed, setPressed] = useState(false);
  return (
    <Pressable
      {...rest}
      onPressIn={(e) => {
        setPressed(true);
        onPressIn?.(e);
      }}
      onPressOut={(e) => {
        setPressed(false);
        onPressOut?.(e);
      }}
      style={typeof style === 'function' ? style({ pressed }) : style}
    >
      {typeof children === 'function' ? children({ pressed }) : children}
    </Pressable>
  );
}

function FeedbackPress({ style, children, onPressIn, onPressOut, ...rest }) {
  const p = useSharedValue(0);
  // Disabled or not tappable: no feedback, but the same component, so its contents never rebuild.
  const live = Boolean(rest.onPress || rest.onLongPress) && !rest.disabled;
  // Keep the item's own opacity (e.g. a faded disabled button) — the press only softens it.
  const own = StyleSheet.flatten(style) || {};
  const base = typeof own.opacity === 'number' ? own.opacity : 1;
  const ownTransform = Boolean(own.transform);
  const feedback = useAnimatedStyle(
    () => ({
      opacity: base * (1 - 0.22 * p.value),
      // An item that sets its own transform keeps it; only plain items get the press scale.
      ...(ownTransform ? {} : { transform: [{ scale: 1 - 0.025 * p.value }] }),
    }),
    [base, ownTransform]
  );
  return (
    <AnimatedPressable
      {...rest}
      onPressIn={(e) => {
        if (live) p.value = withTiming(1, IN);
        onPressIn?.(e);
      }}
      onPressOut={(e) => {
        p.value = withSpring(0, OUT);
        onPressOut?.(e);
      }}
      style={[style, feedback]}
    >
      {children}
    </AnimatedPressable>
  );
}

export default function Press({ pressFeedback = true, ...props }) {
  const dynamic = typeof props.style === 'function' || typeof props.children === 'function';
  if (dynamic) return <DynamicPress {...props} />;
  if (!pressFeedback || isBackdrop(props.style)) return <Pressable {...props} />;
  return <FeedbackPress {...props} />;
}

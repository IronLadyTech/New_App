import React, { useState } from 'react';
import { Platform, Pressable, StyleSheet } from 'react-native';

/**
 * The app's one tappable: every screen imports this as `Pressable`.
 *
 * Touch feedback everywhere, so a tap is seen at once even when the next screen takes a moment:
 *   Android — the system grey ripple from the finger (drawn natively, costs no JS work)
 *   iPhone  — the touched item dims slightly while the finger is down, then fades back
 * A screen that draws its own pressed look (`style={({ pressed }) => …}`) keeps it; pass
 * `android_ripple={null}` / `pressFeedback={false}` to switch the default off (e.g. a backdrop).
 *
 * It also resolves `style={({ pressed }) => …}` itself: NativeWind's interop drops function
 * styles on Android (buttons lose their background and layout), so Pressable always gets a
 * plain style object.
 */
const RIPPLE = { color: 'rgba(0, 0, 0, 0.10)', foreground: true };

/** A full-screen / full-area tap target (a popup backdrop, the splash): no grey flash over it. */
function isBackdrop(style) {
  const s = StyleSheet.flatten(typeof style === 'function' ? style({ pressed: false }) : style) || {};
  // A dark see-through layer that fills the screen (side-by-side flex buttons keep their ripple).
  if (s.flex === 1 && /^rgba\(\s*(0|12)\s*,/.test(String(s.backgroundColor || ''))) return true;
  return s.position === 'absolute' && s.top === 0 && s.bottom === 0 && s.left === 0 && s.right === 0;
}
const IOS_PRESSED = { opacity: 0.6 };

export default function Press({
  style,
  children,
  onPressIn,
  onPressOut,
  android_ripple: ripple,
  pressFeedback = true,
  ...rest
}) {
  const [pressed, setPressed] = useState(false);
  const dynamic = typeof style === 'function' || typeof children === 'function';
  const tappable = Boolean(rest.onPress || rest.onLongPress) && !rest.disabled && !isBackdrop(style);
  // iPhone dim only when the screen has no pressed look of its own.
  const iosDim = Platform.OS === 'ios' && pressFeedback && tappable && !dynamic;
  const track = dynamic || iosDim;

  const resolved = typeof style === 'function' ? style({ pressed }) : style;

  return (
    <Pressable
      {...rest}
      android_ripple={
        ripple !== undefined ? ripple : pressFeedback && tappable && Platform.OS === 'android' ? RIPPLE : undefined
      }
      onPressIn={(e) => {
        if (track) setPressed(true);
        onPressIn?.(e);
      }}
      onPressOut={(e) => {
        if (track) setPressed(false);
        onPressOut?.(e);
      }}
      style={iosDim && pressed ? [resolved, IOS_PRESSED] : resolved}
    >
      {typeof children === 'function' ? children({ pressed }) : children}
    </Pressable>
  );
}

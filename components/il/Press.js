import React, { useState } from 'react';
import { Pressable } from 'react-native';

/**
 * Pressable that resolves `style={({ pressed }) => …}` itself.
 * NativeWind's interop drops function styles on Android (buttons lose their
 * background and layout), so we always hand it a plain style object.
 */
export default function Press({ style, children, onPressIn, onPressOut, ...rest }) {
  const [pressed, setPressed] = useState(false);
  const dynamic = typeof style === 'function' || typeof children === 'function';

  return (
    <Pressable
      {...rest}
      onPressIn={(e) => {
        if (dynamic) setPressed(true);
        onPressIn?.(e);
      }}
      onPressOut={(e) => {
        if (dynamic) setPressed(false);
        onPressOut?.(e);
      }}
      style={typeof style === 'function' ? style({ pressed }) : style}
    >
      {typeof children === 'function' ? children({ pressed }) : children}
    </Pressable>
  );
}

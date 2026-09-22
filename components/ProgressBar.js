import React from 'react';
import { View } from 'react-native';

export default function ProgressBar({ percent = 0, height = 8 }) {
  const clamped = Math.max(0, Math.min(100, percent || 0));
  return (
    <View
      className="w-full overflow-hidden rounded-full bg-ink-100"
      style={{ height }}
    >
      <View
        className="rounded-full bg-brand-600"
        style={{ width: `${clamped}%`, height }}
      />
    </View>
  );
}

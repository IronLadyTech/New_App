import React, { useCallback, useRef } from 'react';
import LiquidTabBar, { useLiquidItems } from './LiquidTabBar';

const ICONS = {
  Home: { icon: 'home', outline: 'home-outline' },
  Programs: { icon: 'layers', outline: 'layers', pack: 'material' },
  Engage: { icon: 'record-voice-over', outline: 'record-voice-over', pack: 'material' },
};

export default function GuestTabBar({ state, descriptors, navigation }) {
  const iconFor = useCallback((name) => ICONS[name] || { icon: 'ellipse', outline: 'ellipse-outline' }, []);
  const items = useLiquidItems(state, descriptors, iconFor);
  const last = useRef(0);
  const found = items.findIndex((item) => item.key === state.routes[state.index]?.key);
  const activeIndex = found >= 0 ? (last.current = found) : last.current;

  return (
    <LiquidTabBar
      items={items}
      activeIndex={activeIndex}
      onPress={(item) => {
        const event = navigation.emit({
          type: 'tabPress',
          target: item.key,
          canPreventDefault: true,
        });
        if (event.defaultPrevented) return;
        navigation.navigate(item.name);
      }}
    />
  );
}

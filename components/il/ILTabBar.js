import React, { useCallback, useRef } from 'react';
import { getFocusedRouteNameFromRoute } from '@react-navigation/native';
import LiquidTabBar, { useLiquidItems } from './LiquidTabBar';

// Screens with their own bottom composer; the floating bar would cover it.
const FULL_SCREEN = new Set(['ManagerChat']);

const ICONS = {
  Home: { icon: 'home', outline: 'home-outline' },
  MyProgram: { icon: 'flag', outline: 'flag-outline' },
  Learn: { icon: 'book', outline: 'book-outline' },
  Engage: { icon: 'people', outline: 'people-outline' },
  Programs: { icon: 'layers', outline: 'layers-outline' },
};

export default function ILTabBar({ state, descriptors, navigation }) {
  const iconFor = useCallback((name) => ICONS[name] || { icon: 'home', outline: 'home-outline' }, []);
  const items = useLiquidItems(state, descriptors, iconFor);
  const last = useRef(0);
  const found = items.findIndex((item) => item.key === state.routes[state.index]?.key);
  const activeIndex = found >= 0 ? (last.current = found) : last.current;
  const focused = getFocusedRouteNameFromRoute(state.routes[state.index]);
  if (FULL_SCREEN.has(focused)) return null;

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

import React, { useCallback, useEffect, useRef } from 'react';
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

/** Let the first screen settle (splash, data) before building the other tabs. */
const PRELOAD_AFTER_MS = 2500;

/** Tab stacks keep nested screens (e.g. Week 2 phase) until we explicitly return to root. */
const TAB_ROOT_SCREEN = {
  Home: 'LepHome',
  MyProgram: 'LepProgram',
  Learn: 'LepLearn',
  Engage: 'LepEngage',
};

export default function ILTabBar({ state, descriptors, navigation }) {
  const iconFor = useCallback((name) => ICONS[name] || { icon: 'home', outline: 'home-outline' }, []);
  const items = useLiquidItems(state, descriptors, iconFor);
  const last = useRef(0);
  const found = items.findIndex((item) => item.key === state.routes[state.index]?.key);
  const activeIndex = found >= 0 ? (last.current = found) : last.current;
  const focused = getFocusedRouteNameFromRoute(state.routes[state.index]);

  // Build every tab once, in the background, soon after launch: the first visit to Learn or
  // Engage then only shows a screen that already exists instead of building it on the tap.
  const preloaded = useRef(false);
  useEffect(() => {
    if (preloaded.current) return undefined;
    preloaded.current = true;
    const timer = setTimeout(() => {
      items.forEach((item, i) => {
        if (i !== activeIndex && typeof navigation.preload === 'function') navigation.preload(item.name);
      });
    }, PRELOAD_AFTER_MS);
    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

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
        // Back to the tab's first screen only if she had gone deeper; re-sending the root
        // screen when she is already on it just re-renders it for nothing.
        const root = TAB_ROOT_SCREEN[item.name];
        const deep = (state.routes.find((r) => r.key === item.key)?.state?.index ?? 0) > 0;
        if (root && deep) navigation.navigate(item.name, { screen: root });
        else navigation.navigate(item.name);
      }}
    />
  );
}

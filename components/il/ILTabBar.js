import React, { useCallback, useEffect, useRef } from 'react';
import { CommonActions, getFocusedRouteNameFromRoute } from '@react-navigation/native';
import LiquidTabBar, { useLiquidItems } from './LiquidTabBar';
import { markTabShown, markTabTap } from '../../utils/perfHud';

// Screens with their own bottom composer; the floating bar would cover it.
// Task and practice screens have their own back button; the floating bar covered the form.
const FULL_SCREEN = new Set(['ManagerChat', 'Practice', 'CourseTask', 'CoursePhase']);

const ICONS = {
  Home: { icon: 'home', outline: 'home-outline' },
  MyProgram: { icon: 'flag', outline: 'flag-outline' },
  Learn: { icon: 'book', outline: 'book-outline' },
  Engage: { icon: 'people', outline: 'people-outline' },
  Programs: { icon: 'layers', outline: 'layers-outline' },
};

/** Let the first screen settle (splash, data) before building the other tabs. */
const PRELOAD_AFTER_MS = 2500;
const PRELOAD_GAP_MS = 1500;

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
  const shownName = state.routes[state.index]?.name;
  useEffect(() => {
    markTabShown(shownName);
  }, [shownName]);

  // Build every tab once, in the background, soon after launch: the first visit to Learn or
  // Engage then only shows a screen that already exists instead of building it on the tap.
  const preloaded = useRef(false);
  useEffect(() => {
    if (preloaded.current) return undefined;
    preloaded.current = true;
    // One tab at a time, a gap between each: building all of them in one go held the JS thread
    // for close to a second on weak phones, and a tap or back press then did nothing.
    if (typeof navigation.preload !== 'function') return undefined;
    const queue = items.filter((_, i) => i !== activeIndex).map((item) => item.name);
    const timers = queue.map((name, n) =>
      setTimeout(() => navigation.preload(name), PRELOAD_AFTER_MS + n * PRELOAD_GAP_MS)
    );
    return () => timers.forEach(clearTimeout);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (FULL_SCREEN.has(focused)) return null;

  return (
    <LiquidTabBar
      items={items}
      activeIndex={activeIndex}
      onPress={(item, index, tapAt) => {
        const event = navigation.emit({
          type: 'tabPress',
          target: item.key,
          canPreventDefault: true,
        });
        if (event.defaultPrevented) return;
        markTabTap(item.name, tapAt);
        // Back to the tab's first screen only if she had gone deeper; re-sending the root
        // screen when she is already on it just re-renders it for nothing.
        const root = TAB_ROOT_SCREEN[item.name];
        const stack = state.routes.find((r) => r.key === item.key)?.state;
        // A tab whose stack lost its first screen (an inner screen opened before the tab existed)
        // would show that inner screen on every tap, with no way back: rebuild it from the root.
        if (root && stack?.key && stack.routes?.[0]?.name && stack.routes[0].name !== root) {
          navigation.dispatch({ ...CommonActions.reset({ index: 0, routes: [{ name: root }] }), target: stack.key });
          navigation.navigate(item.name);
          return;
        }
        const deep = (stack?.index ?? 0) > 0;
        if (root && deep) navigation.navigate(item.name, { screen: root, pop: true });
        else navigation.navigate(item.name);
      }}
    />
  );
}

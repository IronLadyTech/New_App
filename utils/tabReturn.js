import { StackActions } from '@react-navigation/native';

/**
 * Back from a page opened in another tab returns to the tab she came from.
 *
 * Example: Home → "Open task" opens CourseTask inside the My Program tab. Without this, Back
 * showed the My Program main page (which she never opened) and only a second Back reached Home.
 *
 * openInTab() marks the page with `fromTab`; returnToOriginTab (a stack screenListener on every
 * member tab stack) closes that page and switches back to `fromTab` on Back. If she has moved
 * to other tabs since, a plain Back (close the page) is right, so it only switches when `fromTab`
 * is still the previous tab.
 */

const isTabNavigator = (names) => names.includes('MyProgram') && names.includes('Home');

export function findTabNavigator(navigation) {
  let nav = navigation;
  while (nav) {
    if (isTabNavigator(nav.getState?.()?.routeNames || [])) return nav;
    nav = nav.getParent?.();
  }
  return null;
}

/** Name of the focused member tab in a (root) navigation state. */
export function focusedTabInState(state) {
  let s = state;
  while (s) {
    const route = s.routes?.[s.index ?? 0];
    if (isTabNavigator(s.routeNames || [])) return route?.name;
    s = route?.state;
  }
  return undefined;
}

/** Params for a page in `tab`, marked with the tab she is on now (when it is another tab). */
export function withFromTab(fromTab, tab, params) {
  if (!fromTab || fromTab === tab) return params;
  return { ...(params || {}), fromTab };
}

/** Open `screen` inside `tab`'s stack, above that tab's main page; Back returns here. */
export function openInTab(navigation, tab, screen, params) {
  const tabs = findTabNavigator(navigation);
  if (!tabs) {
    navigation.navigate(tab, { initial: false, screen, params });
    return;
  }
  const s = tabs.getState();
  const fromTab = s?.routes?.[s.index]?.name;
  tabs.navigate(tab, { initial: false, screen, params: withFromTab(fromTab, tab, params) });
}

const BACK_ACTIONS = new Set(['GO_BACK', 'POP']);
const leaving = new Set();

/** Stack `screenListeners` for the member tab stacks. */
export const returnToOriginTab = ({ navigation, route }) => ({
  beforeRemove: (e) => {
    if (leaving.has(route.key)) {
      leaving.delete(route.key);
      return;
    }
    const fromTab = route.params?.fromTab;
    if (!fromTab || !BACK_ACTIONS.has(e.data?.action?.type)) return;
    const tabs = navigation.getParent?.();
    const ts = tabs?.getState?.();
    if (!ts || !ts.routeNames?.includes(fromTab)) return;
    const history = ts.history || [];
    const prev = history[history.length - 2];
    const prevName = prev?.type === 'route' ? ts.routes.find((r) => r.key === prev.key)?.name : undefined;
    if (prevName !== fromTab) return; // she has moved around since: just close the page

    // Switch tab first, then close the page behind it, so she never sees the other tab's main page.
    e.preventDefault();
    leaving.add(route.key);
    tabs.goBack();
    navigation.dispatch(StackActions.pop());
  },
});

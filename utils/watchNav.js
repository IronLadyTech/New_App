import { getVideoPoster } from '../constants/preworkThumbs';

function findNavigator(navigation, predicate) {
  let nav = navigation;
  while (nav) {
    const names = nav.getState?.()?.routeNames || [];
    if (predicate(names)) return nav;
    nav = nav.getParent?.();
  }
  return null;
}

/** Attach a poster when the caller only passed assetKey / taskId / img. */
export function buildWatchParams(params = {}) {
  const uri = params.videoUrl || params.uri;
  const poster = getVideoPoster({
    practiceId: params.practiceId,
    taskId: params.taskId,
    assetKey: params.assetKey,
    uri,
    poster: params.poster,
    img: params.img,
  });
  const { img, uri: _uri, ...rest } = params;
  return poster ? { ...rest, poster } : rest;
}

/** Open Watch on the nearest stack, or route through the tab bar when needed. */
export function navigateWatch(navigation, params) {
  const watchParams = buildWatchParams(params);
  const direct = findNavigator(navigation, (names) => names.includes('Watch'));
  if (direct) {
    direct.navigate('Watch', watchParams);
    return;
  }

  const memberTab = findNavigator(
    navigation,
    (names) => names.includes('MyProgram') && names.includes('Home'),
  );
  if (memberTab) {
    memberTab.navigate('Engage', { screen: 'Watch', params: watchParams });
    return;
  }

  const guestRoot = findNavigator(navigation, (names) => names.includes('GuestTabs'));
  if (guestRoot) {
    guestRoot.navigate('Watch', watchParams);
    return;
  }

  navigation.navigate('Watch', watchParams);
}
/** Navigate to a nested screen in Home / MyProgram / etc. from any tab stack. */
export function navigateInMemberStack(navigation, stack, screen, params) {
  const direct = findNavigator(navigation, (names) => names.includes(screen));
  if (direct) {
    direct.navigate(screen, params);
    return;
  }

  const tab = findNavigator(
    navigation,
    (names) => names.includes('MyProgram') && names.includes('Home'),
  );
  if (tab) {
    tab.navigate(stack, { screen, params });
    return;
  }

  navigation.navigate(stack, { screen, params });
}

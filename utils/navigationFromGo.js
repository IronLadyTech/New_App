import { focusedTabInState, withFromTab } from './tabReturn';

/** Bound from AppNavigator — shared by push taps and in-app notification rows. */
let rootRef = null;

export function bindRootNavigation(navigationRef) {
  rootRef = navigationRef;
}

const fromTab = () => focusedTabInState(rootRef?.getRootState?.());

export function navigateFromGo(go) {
  if (!go || !rootRef?.isReady?.()) return false;

  if (go.to === 'back') {
    rootRef.goBack();
    return true;
  }

  if (go.to === 'task' && go.programId && go.taskId) {
    rootRef.navigate('MyProgram', {
      initial: false,
      screen: 'CourseTask',
      params: withFromTab(fromTab(), 'MyProgram', { programId: go.programId, taskId: go.taskId }),
    });
    return true;
  }
  if (go.to === 'payment') {
    rootRef.navigate('Profile', {
      initial: false,
      screen: 'PaymentEnrollment',
      params: withFromTab(fromTab(), 'Profile', go.programId ? { programId: go.programId } : undefined),
    });
    return true;
  }
  if (go.to === 'sessions') {
    rootRef.navigate('MyProgram', { pop: true, screen: 'LepProgram', params: { tab: 'Sessions' } });
    return true;
  }
  if (go.to === 'schedule') {
    rootRef.navigate('MyProgram', { pop: true, screen: 'LepProgram' });
    return true;
  }
  if (go.to === 'learn') {
    rootRef.navigate('Learn');
    return true;
  }
  if (go.to === 'engage') {
    rootRef.navigate('Engage');
    return true;
  }
  if (go.to === 'myProgram') {
    rootRef.navigate('MyProgram');
    return true;
  }
  if (go.to === 'guide') {
    rootRef.navigate('Home');
    return true;
  }
  if (go.to === 'home' && go.screen) {
    const atRoot = go.screen === 'LepHome';
    rootRef.navigate('Home', {
      initial: atRoot,
      ...(atRoot ? { pop: true } : { params: withFromTab(fromTab(), 'Home') }),
      screen: go.screen,
    });
    return true;
  }
  // Her first unfinished practice of today (streak reminder → "Practise now"); Home opens it.
  if (go.to === 'practice') {
    rootRef.navigate('Home', { pop: true, screen: 'LepHome', params: { openPractice: Date.now() } });
    return true;
  }
  // Plain "home" (streak and guest reminders): today's practice lives on Home.
  if (go.to === 'home') {
    rootRef.navigate('Home');
    return true;
  }
  if (go.to === 'profile' && go.screen) {
    const atRoot = go.screen === 'ProfileHome';
    rootRef.navigate('Profile', {
      initial: atRoot,
      ...(atRoot ? { pop: true } : { params: withFromTab(fromTab(), 'Profile') }),
      screen: go.screen,
    });
    return true;
  }
  return false;
}

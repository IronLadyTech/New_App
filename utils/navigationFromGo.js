/** Bound from AppNavigator — shared by push taps and in-app notification rows. */
let rootRef = null;

export function bindRootNavigation(navigationRef) {
  rootRef = navigationRef;
}

export function navigateFromGo(go) {
  if (!go || !rootRef?.isReady?.()) return false;

  if (go.to === 'back') {
    rootRef.goBack();
    return true;
  }

  if (go.to === 'task' && go.programId && go.taskId) {
    rootRef.navigate('MyProgram', {
      screen: 'CourseTask',
      params: { programId: go.programId, taskId: go.taskId },
    });
    return true;
  }
  if (go.to === 'payment') {
    rootRef.navigate('Profile', {
      screen: 'PaymentEnrollment',
      params: go.programId ? { programId: go.programId } : undefined,
    });
    return true;
  }
  if (go.to === 'sessions') {
    rootRef.navigate('MyProgram', { screen: 'LepProgram', params: { tab: 'Sessions' } });
    return true;
  }
  if (go.to === 'schedule') {
    rootRef.navigate('MyProgram', { screen: 'LepProgram' });
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
    rootRef.navigate('Home', { screen: go.screen });
    return true;
  }
  // Her first unfinished practice of today (streak reminder → "Practise now"); Home opens it.
  if (go.to === 'practice') {
    rootRef.navigate('Home', { screen: 'LepHome', params: { openPractice: Date.now() } });
    return true;
  }
  // Plain "home" (streak and guest reminders): today's practice lives on Home.
  if (go.to === 'home') {
    rootRef.navigate('Home');
    return true;
  }
  if (go.to === 'profile' && go.screen) {
    rootRef.navigate('Profile', { screen: go.screen });
    return true;
  }
  return false;
}

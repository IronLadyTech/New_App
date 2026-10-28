/**
 * One moment per app launch: the splash starts flying through the logo and the first
 * screen (already mounted underneath) begins to show. Screens with an entrance
 * (PhoneLoginScreen) start it here, so the splash and the screen read as one shot.
 */
let revealed = false;
const listeners = new Set();

/** Called once by IronLadyAnimatedSplash as its fly-through starts. */
export function markLaunchRevealed() {
  if (revealed) return;
  revealed = true;
  listeners.forEach((fn) => fn());
  listeners.clear();
}

/** True until the launch splash has started revealing — i.e. this screen is the first one seen. */
export function isLaunchRevealPending() {
  return !revealed;
}

/** Run `fn` when the splash reveals (right away if it already has). Returns an unsubscribe. */
export function onLaunchReveal(fn) {
  if (revealed) {
    fn();
    return () => {};
  }
  listeners.add(fn);
  return () => listeners.delete(fn);
}

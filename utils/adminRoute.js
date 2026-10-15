import { Platform } from 'react-native';

/** True on the web build at /admin — the staff CMS. */
export function isAdminPath() {
  if (Platform.OS !== 'web' || typeof window === 'undefined') return false;
  return /^\/admin(\/|$)/.test(window.location?.pathname || '');
}

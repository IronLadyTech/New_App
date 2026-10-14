import { Platform } from 'react-native';

/** True on the web build at /admin — the staff CMS. */
export function isAdminPath() {
  return Platform.OS === 'web' && /^\/admin(\/|$)/.test(window.location?.pathname || '');
}

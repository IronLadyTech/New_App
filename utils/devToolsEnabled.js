import { Platform } from 'react-native';

/**
 * Screen lab, splash preview, and other Metro-only shortcuts.
 * Native installs (including debug APKs) stay off unless explicitly enabled.
 */
export function devToolsEnabled() {
  if (!__DEV__) return false;
  if (process.env.EXPO_PUBLIC_ENABLE_DEV_TOOLS === 'true') return true;
  return Platform.OS === 'web';
}

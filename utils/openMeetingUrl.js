import { Linking, Platform } from 'react-native';

/** QA registration page — preview OTA sets EXPO_PUBLIC_ZOOM_TEST_ALL=1 to route every Join here. */
export const ZOOM_QA_REGISTRATION_URL =
  'https://us02web.zoom.us/meeting/register/4MZrwKfUR2WMrC3k6BQYnQ';

export function zoomTestAllJoins() {
  return process.env.EXPO_PUBLIC_ZOOM_TEST_ALL === '1';
}

/** CMS / admin pasted join URLs (Zoom, Meet, Teams). */
export function normalizeMeetingUrl(url) {
  const raw = String(url || '').trim();
  if (!raw) return '';
  if (/^zoommtg:/i.test(raw)) return raw;
  if (/^https?:\/\//i.test(raw)) return raw;
  if (/^[a-z0-9.-]+\.[a-z]{2,}\//i.test(raw)) return `https://${raw}`;
  return raw;
}

/** Join URL shown in UI and opened on tap (CMS link, or QA override when testing). */
export function resolveMeetingJoinUrl(url) {
  if (zoomTestAllJoins()) return ZOOM_QA_REGISTRATION_URL;
  return normalizeMeetingUrl(url);
}

/**
 * Open a live-session link. On web uses a new tab; on Android/iOS uses the system handler
 * (Zoom app when installed, otherwise browser).
 */
export function openMeetingUrl(url) {
  const target = resolveMeetingJoinUrl(url);
  if (!target) return false;
  if (Platform.OS === 'web' && typeof window !== 'undefined') {
    window.open(target, '_blank', 'noopener,noreferrer');
    return true;
  }
  Linking.openURL(target).catch(() => {});
  return true;
}
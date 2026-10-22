import { Linking, Platform } from 'react-native';
import { isInAppVideoUri, youtubeIdFromUri } from './videoSource';
import { navigateWatch } from './watchNav';

/**
 * Open a link from content (task materials, events, CMS links).
 * Videos — YouTube or direct files — always play in the app's Watch screen;
 * nothing ever sends a learner out to YouTube. Other links open as before.
 */
export function openLink(url, { navigation, title } = {}) {
  if (!url) return;
  if (isInAppVideoUri(url)) {
    if (navigation) navigateWatch(navigation, { videoUrl: url, title });
    // Without a navigator there is no in-app player to use — still never open YouTube.
    if (navigation || youtubeIdFromUri(url)) return;
  }
  if (Platform.OS === 'web' && typeof window !== 'undefined') {
    window.open(url, '_blank', 'noopener,noreferrer');
    return;
  }
  Linking.openURL(url).catch(() => {});
}

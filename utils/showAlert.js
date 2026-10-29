import { Alert, Platform } from 'react-native';

/** Alert.alert does nothing on web, so an error there vanished — use the browser's alert instead. */
export function showAlert(title, message) {
  if (Platform.OS === 'web') {
    if (typeof window !== 'undefined') window.alert(message ? `${title}\n\n${message}` : title);
    return;
  }
  Alert.alert(title, message);
}

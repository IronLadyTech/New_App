import { Platform } from 'react-native';

/** Cross-platform elevation that matches the approval cards. */
export function ilShadow(level = 1) {
  if (Platform.OS === 'android') {
    return { elevation: level === 2 ? 10 : 5 };
  }
  if (level === 2) {
    return {
      shadowColor: '#000000',
      shadowOffset: { width: 0, height: 14 },
      shadowOpacity: 0.22,
      shadowRadius: 22,
    };
  }
  return {
    shadowColor: '#141A2C',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.12,
    shadowRadius: 16,
  };
}

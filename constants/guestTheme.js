import { Platform } from 'react-native';

export const G = {
  page: '#F5F2E8',
  ink: '#113744',
  body: '#4A463D',
  meta: '#5A574F',
  line: '#EAE8DC',
  dash: '#DCD7C8',
  cta: '#ED1D24',
  teal: '#113744',
  tealMid: '#1A5C66',
  tealLight: '#3D8F9A',
  dark: '#113744',
  white: '#FFFFFF',
  mutedFill: '#F2EFE2',
  pink: '#F8D6D4',
};

export const af = Platform.OS === 'android' ? { includeFontPadding: false } : null;

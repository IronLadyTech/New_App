import React from 'react';
import { Platform, Text } from 'react-native';
import { IL_BRAND, IL_FONTS } from '../../constants/ironLadyBrand';

// Playfair ships old-style figures (9 drops below the line, 2 sits short); force lining digits.
const base =
  Platform.OS === 'android'
    ? { includeFontPadding: false, fontVariant: ['lining-nums'] }
    : { fontVariant: ['lining-nums'] };

const ROLES = {
  display: { fontFamily: IL_FONTS.display, fontSize: 32, lineHeight: 38, letterSpacing: -0.6 },
  displaySm: { fontFamily: IL_FONTS.display, fontSize: 26, lineHeight: 32, letterSpacing: -0.4 },
  title: { fontFamily: IL_FONTS.display, fontSize: 22, lineHeight: 28, letterSpacing: -0.3 },
  eyebrow: {
    fontFamily: IL_FONTS.bold,
    fontSize: 11,
    letterSpacing: Platform.OS === 'ios' ? 1.4 : 1.0,
    textTransform: 'uppercase',
  },
  body: { fontFamily: IL_FONTS.regular, fontSize: 15, lineHeight: 22 },
  bodySm: { fontFamily: IL_FONTS.regular, fontSize: 13, lineHeight: 19 },
  label: { fontFamily: IL_FONTS.semibold, fontSize: 14, lineHeight: 18 },
  button: { fontFamily: IL_FONTS.semibold, fontSize: 16, letterSpacing: -0.1 },
  wordmark: { fontFamily: IL_FONTS.display, fontSize: 20, lineHeight: 26, letterSpacing: 0 },
};

export default function ILText({
  role = 'body',
  color = IL_BRAND.ink,
  align,
  style,
  children,
  ...rest
}) {
  return (
    <Text
      // Phones with a large system font scale every word; past ~1.15× the cards overflow
      // and words get cut. Still honours larger text, just not without limit.
      maxFontSizeMultiplier={1.15}
      style={[base, ROLES[role] || ROLES.body, { color }, align ? { textAlign: align } : null, style]}
      {...rest}
    >
      {children}
    </Text>
  );
}

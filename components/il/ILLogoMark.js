import React from 'react';
import { Image, View } from 'react-native';

const LOGO = require('../../assets/il/logo.jpg');

export default function ILLogoMark({ size = 36 }) {
  return (
    <View
      style={{
        width: size,
        height: size,
        borderRadius: 8,
        overflow: 'hidden',
        backgroundColor: '#ED1D24',
      }}
      accessibilityRole="image"
      accessibilityLabel="Iron Lady"
    >
      <Image source={LOGO} style={{ width: size, height: size }} resizeMode="cover" />
    </View>
  );
}

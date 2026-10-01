import React from 'react';
import { ActivityIndicator, Text, View } from 'react-native';
import { IL_BRAND } from '../constants/ironLadyBrand';

export default function LoadingState({ message = 'Loading…' }) {
  return (
    <View
      style={{
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: IL_BRAND.cream,
        paddingHorizontal: 24,
      }}
    >
      <ActivityIndicator size="large" color={IL_BRAND.red} />
      <Text style={{ marginTop: 12, fontSize: 15, color: IL_BRAND.muted }}>{message}</Text>
    </View>
  );
}

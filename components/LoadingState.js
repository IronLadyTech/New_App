import React from 'react';
import { ActivityIndicator, Text, View } from 'react-native';
import { COLORS } from '../constants';

export default function LoadingState({ message = 'Loading…' }) {
  return (
    <View className="flex-1 items-center justify-center bg-ink-50 px-6">
      <ActivityIndicator size="large" color={COLORS.brand} />
      <Text className="mt-3 text-base text-ink-500">{message}</Text>
    </View>
  );
}

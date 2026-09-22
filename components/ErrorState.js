import React from 'react';
import { Text, TouchableOpacity, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

export default function ErrorState({
  message = 'Something went wrong.',
  onRetry,
}) {
  return (
    <View className="flex-1 items-center justify-center px-8 py-12">
      <Ionicons name="alert-circle-outline" size={40} color="#dc2626" />
      <Text className="mt-3 text-center text-base text-ink-700">{message}</Text>
      {onRetry ? (
        <TouchableOpacity
          onPress={onRetry}
          className="mt-4 rounded-xl border border-ink-200 bg-white px-4 py-2.5"
        >
          <Text className="font-medium text-brand-700">Try again</Text>
        </TouchableOpacity>
      ) : null}
    </View>
  );
}

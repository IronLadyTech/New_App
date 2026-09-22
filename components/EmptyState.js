import React from 'react';
import { Text, TouchableOpacity, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '../constants';

export default function EmptyState({
  icon = 'folder-open-outline',
  title = 'Nothing here yet',
  message = 'Check back soon.',
  actionLabel,
  onAction,
}) {
  return (
    <View className="flex-1 items-center justify-center px-8 py-12">
      <View className="mb-4 h-16 w-16 items-center justify-center rounded-full bg-brand-50">
        <Ionicons name={icon} size={32} color={COLORS.brand} />
      </View>
      <Text className="text-center text-lg font-semibold text-ink-900">{title}</Text>
      <Text className="mt-2 text-center text-sm leading-5 text-ink-500">{message}</Text>
      {actionLabel && onAction ? (
        <TouchableOpacity
          onPress={onAction}
          className="mt-5 rounded-xl bg-brand-600 px-5 py-3"
          activeOpacity={0.85}
        >
          <Text className="font-semibold text-white">{actionLabel}</Text>
        </TouchableOpacity>
      ) : null}
    </View>
  );
}

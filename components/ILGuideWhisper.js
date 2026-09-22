import React from 'react';
import { Text, TouchableOpacity, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { IL_GUIDE_NAME } from '../constants/ilGuide';
import { COLORS } from '../constants';

/**
 * Dismissible IL Guide nudge card — short mentor message, never a chat UI.
 */
export default function ILGuideWhisper({
  message,
  loading,
  hidden,
  onDismiss,
  variant = 'whisper',
}) {
  if (hidden || (!message && !loading)) return null;

  const isOnboard = variant === 'onboard';

  return (
    <View
      className={`mb-4 overflow-hidden rounded-2xl border ${
        isOnboard
          ? 'border-brand-300 bg-brand-50'
          : 'border-brand-200 bg-white'
      }`}
    >
      <View className="flex-row items-center justify-between px-4 pt-3">
        <View className="flex-row items-center">
          <View className="mr-2 h-8 w-8 items-center justify-center rounded-full bg-brand-600">
            <Ionicons name="sparkles" size={16} color="#fff" />
          </View>
          <View>
            <Text className="text-xs font-bold uppercase tracking-wide text-brand-700">
              {IL_GUIDE_NAME}
            </Text>
            <Text className="text-[10px] text-brand-500">whisper</Text>
          </View>
        </View>
        {onDismiss && !loading ? (
          <TouchableOpacity onPress={onDismiss} hitSlop={12} accessibilityLabel="Dismiss">
            <Ionicons name="close" size={20} color={COLORS.muted} />
          </TouchableOpacity>
        ) : null}
      </View>

      <View className="px-4 pb-4 pt-2">
        {loading ? (
          <Text className="text-sm text-ink-400">IL Guide is thinking…</Text>
        ) : (
          <Text
            className={`leading-6 text-ink-800 ${
              isOnboard ? 'text-base' : 'text-sm'
            }`}
          >
            {message}
          </Text>
        )}
        {!loading && !isOnboard ? (
          <Text className="mt-2 text-[10px] text-ink-400">
            Companion inside Iron Lady — not a chat. For account or payment help,
            use Profile → Settings or support.
          </Text>
        ) : null}
      </View>
    </View>
  );
}

import React from 'react';
import { Modal, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useILGuideWhisper } from '../hooks/useILGuideWhisper';
import { IL_GUIDE_NAME, IL_GUIDE_SURFACES } from '../constants/ilGuide';

/**
 * First-login welcome — IL Guide onboarding narrator (job 1).
 */
export default function ILGuideOnboardGate({ profile }) {
  const { whisper, loading, hidden, completeOnboard } = useILGuideWhisper(
    IL_GUIDE_SURFACES.ONBOARD
  );

  const show = profile && !profile.ilGuideOnboarded && !hidden;

  if (!show) return null;

  return (
    <Modal visible animationType="slide" transparent>
      <View className="flex-1 justify-end bg-black/40">
        <SafeAreaView edges={['bottom']} className="rounded-t-3xl bg-ink-50">
          <View className="px-5 pb-8 pt-4">
            <View className="mb-4 flex-row items-center">
              <View className="mr-3 h-12 w-12 items-center justify-center rounded-2xl bg-brand-600">
                <Ionicons name="sparkles" size={24} color="#fff" />
              </View>
              <View>
                <Text className="text-lg font-bold text-ink-950">
                  {IL_GUIDE_NAME}
                </Text>
                <Text className="text-xs text-ink-500">whisper · first visit</Text>
              </View>
            </View>

            <View className="mb-4 rounded-2xl border border-brand-200 bg-brand-50 p-4">
              {loading ? (
                <Text className="text-sm text-ink-500">IL Guide is preparing your welcome…</Text>
              ) : (
                <Text className="text-base leading-6 text-ink-800">
                  {whisper?.message ||
                    'Welcome to Iron Lady. Open Learn and take your first step when you are ready.'}
                </Text>
              )}
            </View>

            <TouchableOpacity
              onPress={completeOnboard}
              disabled={loading}
              className="items-center rounded-xl bg-brand-600 py-4"
            >
              <Text className="font-semibold text-white">
                {loading ? 'One moment…' : "Let's go"}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity onPress={completeOnboard} className="mt-3 items-center py-2">
              <Text className="text-sm text-ink-500">Skip for now</Text>
            </TouchableOpacity>
          </View>
        </SafeAreaView>
      </View>
    </Modal>
  );
}

import React from 'react';
import { FlatList, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { usePrograms } from '../../context/ProgramsContext';
import { useAuth } from '../../context/AuthContext';
import ProgressBar from '../../components/ProgressBar';
import LoadingState from '../../components/LoadingState';
import EmptyState from '../../components/EmptyState';
import { COLORS } from '../../constants';
import { PAYMENT_STATUS } from '../../constants/programs';
import { programPaymentStatus } from '../../utils/programAccess';
import ILGuideWhisper from '../../components/ILGuideWhisper';
import { useILGuideWhisper } from '../../hooks/useILGuideWhisper';
import { IL_GUIDE_SURFACES } from '../../constants/ilGuide';

export default function ProgramsScreen({ navigation }) {
  const { profile } = useAuth();
  const {
    enrolledPrograms,
    allPrograms,
    progressByProgram,
    canOpen,
    loading,
  } = usePrograms();
  const {
    whisper: ilWhisper,
    loading: ilLoading,
    hidden: ilHidden,
    dismiss: dismissILGuide,
  } = useILGuideWhisper(IL_GUIDE_SURFACES.LEARN);

  if (loading && !Object.keys(progressByProgram).length) {
    return <LoadingState message="Loading programs…" />;
  }

  // Always show all three journey programs; lock state reflects enrollment + payment.
  const list = allPrograms;

  return (
    <SafeAreaView className="flex-1 bg-ink-50" edges={['top']}>
      <View className="px-4 pb-2 pt-2">
        <Text className="text-2xl font-bold text-ink-950">Learn</Text>
        <Text className="mt-1 text-sm text-ink-500">
          Your Iron Lady programs — progress syncs with the web LMS
        </Text>
        <ILGuideWhisper
          message={ilWhisper?.message}
          loading={ilLoading}
          hidden={ilHidden}
          onDismiss={dismissILGuide}
        />
      </View>

      <FlatList
        data={list}
        keyExtractor={(item) => item.id}
        contentContainerStyle={{ padding: 16, paddingTop: 8, flexGrow: 1 }}
        ListEmptyComponent={
          <EmptyState
            icon="school-outline"
            title="No programs yet"
            message="Enrollment comes from Zoho. Pull to refresh after payment, or use Profile → Refresh access."
          />
        }
        renderItem={({ item }) => {
          const open = canOpen(item.id);
          const enrolled = enrolledPrograms.some((p) => p.id === item.id);
          const progress = progressByProgram[item.id] || {
            total: 0,
            done: 0,
            percent: 0,
          };
          const pay = programPaymentStatus(profile, item.id);

          const needsBalance =
            enrolled && pay === PAYMENT_STATUS.REGISTER;

          return (
            <TouchableOpacity
              disabled={!open && !needsBalance}
              onPress={() => {
                if (needsBalance) {
                  navigation.getParent()?.navigate('Profile', {
                    screen: 'PaymentEnrollment',
                    params: { programId: item.id },
                  });
                  return;
                }
                if (!open) return;
                navigation.navigate('ProgramTasks', {
                  programId: item.id,
                  title: item.title,
                });
              }}
              activeOpacity={0.85}
              className={`mb-3 rounded-2xl border border-ink-100 bg-white p-4 ${
                open || needsBalance ? '' : 'opacity-55'
              }`}
            >
              <View className="mb-2 flex-row items-start justify-between">
                <View className="flex-1 pr-3">
                  <Text className="text-xs font-semibold uppercase text-brand-700">
                    {item.shortLabel}
                  </Text>
                  <Text className="mt-0.5 text-base font-semibold text-ink-900">
                    {item.title}
                  </Text>
                </View>
                <Ionicons
                  name={open ? 'chevron-forward' : 'lock-closed'}
                  size={18}
                  color={COLORS.muted}
                />
              </View>

              <Text className="mb-2 text-xs text-ink-400">
                {!enrolled
                  ? 'Not enrolled'
                  : pay === PAYMENT_STATUS.UNPAID
                    ? 'Payment required'
                    : pay === PAYMENT_STATUS.REGISTER
                      ? 'Registration access'
                      : 'Full access'}
                {' · '}
                {progress.done}/{progress.total} tasks done
              </Text>

              <ProgressBar percent={progress.percent} />
              <Text className="mt-1.5 text-right text-xs font-semibold text-brand-700">
                {progress.percent}%
              </Text>
            </TouchableOpacity>
          );
        }}
      />
    </SafeAreaView>
  );
}

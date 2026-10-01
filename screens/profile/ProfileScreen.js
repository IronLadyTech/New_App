import React from 'react';
import { Alert, ScrollView, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../../context/AuthContext';
import { usePrograms } from '../../context/ProgramsContext';
import ProgressBar from '../../components/ProgressBar';
import { BADGE_DEFS, COLORS } from '../../constants';
import { PAYMENT_STATUS } from '../../constants/programs';
import { programPaymentStatus } from '../../utils/programAccess';
import { refreshMyAccess } from '../../services/functions';

function Row({ icon, label, onPress, danger }) {
  return (
    <TouchableOpacity
      onPress={onPress}
      className="mb-2 flex-row items-center rounded-2xl border border-ink-100 bg-white px-4 py-4"
    >
      <Ionicons
        name={icon}
        size={22}
        color={danger ? COLORS.danger : COLORS.brand}
      />
      <Text
        className={`ml-3 flex-1 text-base ${
          danger ? 'font-medium text-danger' : 'text-ink-900'
        }`}
      >
        {label}
      </Text>
      <Ionicons name="chevron-forward" size={18} color={COLORS.muted} />
    </TouchableOpacity>
  );
}

export default function ProfileScreen({ navigation }) {
  const { profile, role, logout, user } = useAuth();
  const { enrolledPrograms, progressByProgram } = usePrograms();

  const earnedBadges = BADGE_DEFS.filter(
    (b) => (profile?.points || 0) >= b.minPoints
  );

  const needsPayment = enrolledPrograms.some(
    (p) => programPaymentStatus(profile, p.id) === PAYMENT_STATUS.REGISTER
  );

  const onLogout = () => {
    Alert.alert('Sign out', 'Are you sure you want to sign out?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Sign out',
        style: 'destructive',
        onPress: () => logout(),
      },
    ]);
  };

  return (
    <SafeAreaView className="flex-1 bg-ink-50" edges={['top']}>
      <ScrollView contentContainerStyle={{ padding: 16, paddingBottom: 40 }}>
        <Text className="text-2xl font-bold text-ink-950">Profile</Text>

        <View className="mt-4 items-center rounded-2xl border border-ink-100 bg-white p-5">
          <View className="h-20 w-20 items-center justify-center rounded-full bg-brand-100">
            <Text className="text-3xl font-bold text-brand-700">
              {(profile?.displayName || profile?.email || '?')
                .charAt(0)
                .toUpperCase()}
            </Text>
          </View>
          <Text className="mt-3 text-xl font-semibold text-ink-950">
            {profile?.displayName || 'Learner'}
          </Text>
          <Text className="text-sm text-ink-500">{user?.email}</Text>
          <View className="mt-2 rounded-full bg-ink-100 px-3 py-1">
            <Text className="text-xs font-semibold uppercase text-ink-600">
              {role}
            </Text>
          </View>
          <Text className="mt-3 text-2xl font-bold text-brand-700">
            {profile?.points || 0}
          </Text>
          <Text className="text-xs text-ink-400">total points</Text>
        </View>

        <Text className="mb-2 mt-6 text-sm font-semibold uppercase tracking-wide text-ink-400">
          Learning
        </Text>
        <View className="mb-3 rounded-2xl border border-ink-100 bg-white p-4">
          <Text className="text-sm text-ink-500">
            {enrolledPrograms.length} enrolled programs (LMS sync)
          </Text>
          {enrolledPrograms.slice(0, 3).map((p) => (
            <View key={p.id} className="mt-3">
              <View className="mb-1 flex-row justify-between">
                <Text className="flex-1 text-sm text-ink-800" numberOfLines={1}>
                  {p.shortLabel}
                </Text>
                <Text className="ml-2 text-xs text-brand-700">
                  {progressByProgram[p.id]?.percent ?? 0}%
                </Text>
              </View>
              <ProgressBar percent={progressByProgram[p.id]?.percent ?? 0} />
            </View>
          ))}
        </View>

        <Text className="mb-2 mt-2 text-sm font-semibold uppercase tracking-wide text-ink-400">
          Badges
        </Text>
        <View className="mb-4 flex-row flex-wrap">
          {earnedBadges.length === 0 ? (
            <Text className="text-sm text-ink-500">
              Complete lessons to unlock badges.
            </Text>
          ) : (
            earnedBadges.map((b) => (
              <View
                key={b.id}
                className="mb-2 mr-2 rounded-full bg-brand-50 px-3 py-1.5"
              >
                <Text className="text-xs font-semibold text-brand-800">
                  {b.label}
                </Text>
              </View>
            ))
          )}
        </View>

        <Row
          icon="receipt-outline"
          label="Orders & receipts"
          onPress={() => navigation.navigate('Orders')}
        />
        {needsPayment ? (
          <Row
            icon="card-outline"
            label="Complete enrolment · pay balance"
            onPress={() => navigation.navigate('PaymentEnrollment')}
          />
        ) : null}
        <Row
          icon="ribbon-outline"
          label="Certificates & achievements"
          onPress={() => navigation.navigate('Certificates')}
        />
        <Row
          icon="refresh-outline"
          label="Just paid? Refresh access"
          onPress={async () => {
            await refreshMyAccess();
            Alert.alert('Access refreshed', 'Entitlements were re-checked with Zoho.');
          }}
        />
        <Row
          icon="settings-outline"
          label="Settings"
          onPress={() => navigation.navigate('Settings')}
        />
        <Row icon="log-out-outline" label="Sign out" onPress={onLogout} danger />
      </ScrollView>
    </SafeAreaView>
  );
}

import React, { useEffect, useState } from 'react';
import { Alert, Image, ScrollView, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../../context/AuthContext';
import { usePrograms } from '../../context/ProgramsContext';
import ProgressBar from '../../components/ProgressBar';
import { BADGE_DEFS, COLORS } from '../../constants';
import { PAYMENT_STATUS } from '../../constants/programs';
import {
  learnerBatchLabel,
  learnerEnrollmentLabel,
  programPaymentStatus,
  programsOnProfile,
} from '../../utils/programAccess';
import { pickAndSaveProfilePhoto } from '../../services/profilePhoto';
import { buildProgramBatchCard, sortProgramsByCurrentBatch } from '../../utils/lepBatchHero';
import { refreshMyAccess } from '../../services/functions';
import { programIdNeedingBalancePayment } from '../../utils/paymentEnrollment';
import { fetchUserProfile } from '../../services/auth';
import ILHeader from '../../components/il/ILHeader';

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
  const { profile, accountProfile, role, logout, user, patchProfile } = useAuth();
  const [uploadingPhoto, setUploadingPhoto] = useState(false);
  const { progressByProgram } = usePrograms();
  const source = {
    ...(profile || {}),
    ...(accountProfile || {}),
    programAccess: {
      ...(profile?.programAccess || {}),
      ...(accountProfile?.programAccess || {}),
    },
    programs: accountProfile?.programs?.length ? accountProfile.programs : profile?.programs,
    program: accountProfile?.program || profile?.program,
  };
  const programs = programsOnProfile(source);
  const phone =
    profile?.phoneNumber ||
    profile?.phone ||
    user?.phoneNumber ||
    null;
  const earnedBadges = BADGE_DEFS.filter(
    (b) => (profile?.points || 0) >= b.minPoints
  );

  const needsPayment = programs.some(
    (p) => programPaymentStatus(source, p.id) === PAYMENT_STATUS.REGISTER
  );

  const initial = (profile?.displayName || profile?.email || '?').charAt(0).toUpperCase();

  const onPickPhoto = async () => {
    if (!user?.uid || uploadingPhoto) return;
    setUploadingPhoto(true);
    try {
      const photoURL = await pickAndSaveProfilePhoto(user.uid);
      if (photoURL) patchProfile({ photoURL });
    } catch (err) {
      Alert.alert(
        'Photo',
        err?.code === 'permission' ? err.message : 'Could not upload that photo. Try again.'
      );
    } finally {
      setUploadingPhoto(false);
    }
  };

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
      <ILHeader
        photoUrl={profile?.photoURL}
        insetTop={false}
        onProfile={() => {}}
      />
      <ScrollView contentContainerStyle={{ padding: 16, paddingBottom: 40 }}>
        <Text className="text-2xl font-bold text-ink-950">Profile</Text>

        <View className="mt-4 items-center rounded-2xl border border-ink-100 bg-white p-5">
          <TouchableOpacity
            onPress={onPickPhoto}
            disabled={uploadingPhoto}
            accessibilityRole="button"
            accessibilityLabel="Upload profile photo"
            style={{ width: 80, height: 80 }}
          >
            <View className="h-20 w-20 items-center justify-center overflow-hidden rounded-full bg-brand-100">
              {profile?.photoURL ? (
                <Image
                  source={{ uri: profile.photoURL }}
                  style={{ width: 80, height: 80, opacity: uploadingPhoto ? 0.55 : 1 }}
                />
              ) : (
                <Text className="text-3xl font-bold text-brand-700">{initial}</Text>
              )}
            </View>
            <View
              style={{
                position: 'absolute',
                right: -2,
                bottom: -2,
                width: 28,
                height: 28,
                borderRadius: 14,
                backgroundColor: COLORS.brand,
                borderWidth: 2,
                borderColor: '#FFFFFF',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Ionicons name="camera" size={15} color="#FFFFFF" />
            </View>
          </TouchableOpacity>
          <Text className="mt-3 text-xl font-semibold text-ink-950">
            {profile?.displayName || 'Learner'}
          </Text>
          {user?.email ? (
            <Text className="text-sm text-ink-500">{user.email}</Text>
          ) : null}
          {phone ? (
            <Text className="mt-1 text-sm text-ink-500">{phone}</Text>
          ) : null}
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
          Program & batch
        </Text>
        <View className="mb-3 rounded-2xl border border-ink-100 bg-white p-4">
          {programs.length === 0 ? (
            <Text className="text-sm text-ink-500">
              No program linked yet. Tap “Refresh access” below after Zoho has your LEP seat, or sign in with the
              mobile number on your registration.
            </Text>
          ) : (
            sortProgramsByCurrentBatch(source, programs).map((p, i) => {
              const batch = buildProgramBatchCard(source, p.id).heading || learnerBatchLabel(source, p.id);
              return (
                <View
                  key={p.id}
                  style={{
                    paddingVertical: 12,
                    borderBottomWidth: i < programs.length - 1 ? 1 : 0,
                    borderBottomColor: '#E8E4DC',
                  }}
                >
                  <View className="flex-row items-center justify-between">
                    <Text className="text-base font-semibold text-ink-900">{p.shortLabel}</Text>
                    <Text className="text-xs font-semibold text-brand-700">
                      {learnerEnrollmentLabel(source, p.id)}
                    </Text>
                  </View>
                  <Text className="mt-1 text-sm text-ink-500">
                    {batch ? `Batch · ${batch}` : 'Batch dates will show here.'}
                  </Text>
                  <View className="mt-2">
                    <View className="mb-1 flex-row justify-between">
                      <Text className="text-xs text-ink-500">LMS task progress</Text>
                      <Text className="text-xs text-brand-700">
                        {progressByProgram[p.id]?.percent ?? 0}%
                      </Text>
                    </View>
                    <ProgressBar percent={progressByProgram[p.id]?.percent ?? 0} />
                  </View>
                </View>
              );
            })
          )}
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
            onPress={() =>
              navigation.navigate('PaymentEnrollment', {
                programId: programIdNeedingBalancePayment(profile),
              })
            }
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
            const data = await refreshMyAccess();
            const freshProfile = user?.uid ? await fetchUserProfile(user.uid).catch(() => null) : null;
            if (freshProfile) patchProfile(freshProfile);
            const batch = learnerBatchLabel(freshProfile || profile, 'lep');
            const hint =
              data?.ok === false
                ? 'We could not refresh right now. Try again in a minute.'
                : batch
                  ? `Your batch: ${batch}.`
                  : 'You are up to date. If your batch is missing, contact support@ironlady.tech.';
            Alert.alert('Access refreshed', hint);
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

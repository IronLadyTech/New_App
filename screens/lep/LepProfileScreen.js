import React, { useEffect, useState } from 'react';
import {
  Alert,
  Image,
  Linking,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  StatusBar as RNStatusBar,
  View,
} from 'react-native';
import { doc, getDoc } from 'firebase/firestore';
import { StatusBar } from 'expo-status-bar';
import Constants from 'expo-constants';
import { MaterialIcons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { IL_FONTS } from '../../constants/ironLadyBrand';
import ILText from '../../components/il/ILText';
import { G, af } from '../../constants/guestTheme';
import { LIQUID_TAB_PAD } from '../../components/il/LiquidTabBar';
import { useAuth } from '../../context/AuthContext';
import { useCourseDemo } from '../../context/CourseDemoContext';
import { lepFullName } from '../../utils/lepState';
import { PAYMENT_STATUS, PROGRAMS } from '../../constants/programs';
import { practiceKey } from '../../constants/practice';
import {
  isZohoBatchDateRange,
  learnerBatchId,
  learnerBhagText,
  learnerEnrollmentLabel,
  learnerLeadDetails,
  programPaymentStatus,
  programsOnProfile,
  zohoLeadBatchLabel,
} from '../../utils/programAccess';
import { buildProgramBatchCard, programBatchPhase, sortProgramsByCurrentBatch } from '../../utils/lepBatchHero';
import { db } from '../../services/firebase';
import { pickAndSaveProfilePhoto } from '../../services/profilePhoto';
import { LepHeader, Page, SoftChip, WhiteCard } from './LepBits';
import { useLepNav } from './useLepNav';
import { useGlassHeaderPad } from '../../components/il/GlassHeader';
import { useNotificationBellBadge } from '../../hooks/useNotificationBellBadge';
import { useMyReceipts } from '../../hooks/useMyReceipts';
import { useLearnerCmsBatch } from '../../hooks/useLearnerCmsBatch';
import ChooseBatchDateScreen from '../auth/ChooseBatchDateScreen';
import { updateUserProfile } from '../../services/firestore';
import { lockLepBatchChoice } from '../../utils/lockLepBatch';
import { resolveLepBatchDateLine } from '../../utils/lepDeskBatchDate';
import {
  PaymentBillingCard,
  ProfileBhagCard,
  ProfileStrengthCard,
} from './LepProfileSections';

function hasMasterclassOnProfile(source) {
  if (!source) return false;
  if (source.masterclassRegistered === true || source.masterclassCompleted === true) return true;
  const mc = source.programAccess?.mc || source.programAccess?.masterclass;
  if (mc && (mc.paymentStatus || mc.certificateUrl || mc.completed)) return true;
  const programs = Array.isArray(source.programs) ? source.programs : [];
  return programs.some((p) => /master\s*class|^mc$/i.test(String(p)));
}

/** Last menu box — Masterclass row only when the learner actually has MC. */
function profileMenuRows(hasMasterclass) {
  const rows = [];
  if (hasMasterclass) {
    rows.push({
      icon: 'workspace-premium',
      label: 'Masterclass Certificate',
      badge: '1 Issued',
      go: 'goCertificates',
    });
  }
  rows.push(
    {
      icon: 'inventory-2',
      label: 'Foundation Guides',
      sub: 'Open after you start principles',
      go: 'goFoundationGuides',
    },
    {
      icon: 'notifications-none',
      label: 'Notifications',
      go: 'goNotifications',
      notify: true,
    },
    { icon: 'help-outline', label: 'Help & Support', go: 'goHelp' },
    { icon: 'shield', label: 'Privacy', go: 'goPrivacy' },
    { icon: 'description', label: 'Terms', go: 'goTerms' }
  );
  return rows;
}

function useProgramGroups(profile, programIds) {
  const idsKey = programIds
    .map((programId) => {
      const batchId = learnerBatchId(profile, programId);
      const id = batchId && batchId !== 'default' && /^[A-Za-z0-9_-]+$/.test(batchId) ? batchId : '';
      return id ? `${programId}:${id}` : '';
    })
    .filter(Boolean)
    .join('|');
  const [groups, setGroups] = useState({});

  useEffect(() => {
    const pairs = idsKey ? idsKey.split('|') : [];
    if (!pairs.length) {
      setGroups({});
      return undefined;
    }
    let cancelled = false;
    Promise.all(
      pairs.map(async (pair) => {
        const splitAt = pair.indexOf(':');
        const programId = pair.slice(0, splitAt);
        const batchId = pair.slice(splitAt + 1);
        try {
          const snap = await getDoc(doc(db, 'groups', batchId));
          return [programId, snap.exists() ? { id: snap.id, ...snap.data() } : null];
        } catch {
          return [programId, null];
        }
      })
    ).then((rows) => {
      if (!cancelled) setGroups(Object.fromEntries(rows));
    });
    return () => {
      cancelled = true;
    };
  }, [idsKey]);

  return groups;
}

export default function LepProfileScreen() {
  const { profile, accountProfile, logout, user, patchProfile } = useAuth();
  const [uploadingPhoto, setUploadingPhoto] = useState(false);
  const demo = useCourseDemo();
  const insets = useSafeAreaInsets();
  const headerPad = useGlassHeaderPad();
  const nav = useLepNav();
  const hasUnread = useNotificationBellBadge();
  const { latest } = useMyReceipts();
  const { batch: cmsBatch } = useLearnerCmsBatch('lep');
  const [batchOpen, setBatchOpen] = useState(false);
  const [localFacts, setLocalFacts] = useState({});
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
  const anyEnrolled = programs.some((p) => programPaymentStatus(source, p.id) === PAYMENT_STATUS.PAID);
  const lead = learnerLeadDetails(source);
  const facts = {
    ...lead,
    domain: source?.domain || lead.industry || source?.leadershipRole || '',
    salaryRange: source?.salaryRange || source?.zohoLead?.Annual_Income || '',
    ...localFacts,
  };
  const name = facts.name || lepFullName(profile);
  const groups = useProgramGroups(source, programs.map((p) => p.id));
  const practiceBhag = String(demo.getSubmission('lep', practiceKey('lep-bhag'))?.data?.note || '').trim();
  const bhag = learnerBhagText(source) || practiceBhag || localFacts.bhag || '';
  const lepProgram = programs.find((p) => p.id === PROGRAMS.LEP) || programs[0] || { id: 'lep', title: 'Leadership Essentials' };
  const hasMasterclass = hasMasterclassOnProfile(source);
  const menuRows = profileMenuRows(hasMasterclass);
  const lepBatchLine = resolveLepBatchDateLine({
    profile: source,
    cmsBatch,
    zohoLive: zohoLeadBatchLabel(source, PROGRAMS.LEP),
  });

  const photoUrl = profile?.photoURL || '';
  const initial = String(name || '?').trim().charAt(0).toUpperCase();

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
    if (Platform.OS === 'web') {
      logout();
      return;
    }
    Alert.alert('Log out', 'Sign out of Iron Lady?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Log out', style: 'destructive', onPress: () => logout() },
    ]);
  };

  const onDeleteAccount = () => {
    Alert.alert(
      'Delete account',
      'Email support@ironlady.tech to delete your account. This cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Email support',
          style: 'destructive',
          onPress: () =>
            Linking.openURL(
              'mailto:support@ironlady.tech?subject=Delete%20my%20Iron%20Lady%20account'
            ).catch(() => {}),
        },
      ]
    );
  };

  const appVersion = Constants.expoConfig?.version || '1.0.0';
  const buildNumber =
    Constants.expoConfig?.android?.versionCode ||
    Constants.expoConfig?.ios?.buildNumber ||
    '';

  useEffect(() => {
    if (Platform.OS !== 'android') return undefined;
    RNStatusBar.setTranslucent(true);
    RNStatusBar.setBackgroundColor('transparent');
    RNStatusBar.setBarStyle('light-content');
    return undefined;
  }, []);

  const lockBatch = (picked) => {
    setBatchOpen(false);
    lockLepBatchChoice({ user, profile: source, patchProfile, picked }).catch(() => {});
  };

  return (
    <View style={{ flex: 1 }}>
    <Page>
      <StatusBar style="light" translucent backgroundColor="transparent" />
      <LepHeader
        floating
        scrim={false}
        photoUrl={profile?.photoURL}
        onNotifications={nav.goNotifications}
        onProfile={() => {}}
      />
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{
          paddingTop: 0,
          paddingHorizontal: 20,
          paddingBottom: LIQUID_TAB_PAD + Math.max(insets.bottom, 24) + 24,
        }}
      >
        <View
          style={{
            backgroundColor: G.dark,
            marginHorizontal: -20,
            paddingHorizontal: 20,
            paddingTop: headerPad + 20,
            paddingBottom: 22,
            borderBottomLeftRadius: 12,
            borderBottomRightRadius: 12,
          }}
        >
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
            <SoftChip onDark icon="fiber-manual-record">
              {anyEnrolled ? 'Your profile' : 'Registered participant'}
            </SoftChip>
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Settings"
              onPress={nav.goNudges}
              hitSlop={8}
              style={{
                width: 36,
                height: 36,
                borderRadius: 18,
                backgroundColor: 'rgba(255,255,255,0.12)',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <MaterialIcons name="settings" size={18} color="rgba(255,255,255,0.85)" />
            </Pressable>
          </View>
          <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 16 }}>
            <Pressable
              onPress={onPickPhoto}
              disabled={uploadingPhoto}
              accessibilityRole="button"
              accessibilityLabel="Upload profile photo"
              style={{ width: 64, height: 64 }}
            >
              {photoUrl ? (
                <Image
                  source={{ uri: photoUrl }}
                  style={{ width: 64, height: 64, borderRadius: 32, opacity: uploadingPhoto ? 0.55 : 1 }}
                />
              ) : (
                <View
                  style={{
                    width: 64,
                    height: 64,
                    borderRadius: 32,
                    backgroundColor: 'rgba(255,255,255,0.16)',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <ILText role="title" color="#FFFFFF" style={{ fontFamily: IL_FONTS.display, fontSize: 24 }}>
                    {initial}
                  </ILText>
                </View>
              )}
              <View
                style={{
                  position: 'absolute',
                  right: -2,
                  bottom: -2,
                  width: 26,
                  height: 26,
                  borderRadius: 13,
                  backgroundColor: G.cta,
                  borderWidth: 2,
                  borderColor: G.dark,
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <MaterialIcons name="photo-camera" size={14} color="#FFFFFF" />
              </View>
            </Pressable>
            <View style={{ flex: 1, marginLeft: 14, minWidth: 0 }}>
              <ILText role="title" color="#FFFFFF" numberOfLines={2} style={{ fontFamily: IL_FONTS.display, fontSize: 24 }}>
                {name}
              </ILText>
            </View>
          </View>
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', marginTop: 14, gap: 8 }}>
            {programs.map((p) => {
              const label = learnerEnrollmentLabel(source, p.id);
              const text =
                label === 'Enrolled'
                  ? `${p.code} Enrolled`
                  : label === 'Registered'
                    ? `${p.code} Registered`
                    : `${p.code} Applicant`;
              return (
                <Badge key={p.id} on={label !== 'Enrolled'}>
                  {text}
                </Badge>
              );
            })}
            {hasMasterclass ? <Badge>Masterclass Registered</Badge> : null}
          </View>
        </View>

        <ProfileStrengthCard
          facts={{ ...facts, bhag }}
          onSaved={(partial) => {
            setLocalFacts((prev) => ({ ...prev, ...partial }));
            patchProfile(partial);
            if (user?.uid && user.uid !== 'preview') {
              updateUserProfile(user.uid, partial).catch(() => {});
            }
          }}
        />
        <ProfileBhagCard
          bhag={bhag}
          field={facts.domain}
          onSaved={(partial) => {
            setLocalFacts((prev) => ({ ...prev, ...partial }));
            patchProfile(partial);
            if (user?.uid && user.uid !== 'preview') {
              updateUserProfile(user.uid, partial).catch(() => {});
            }
          }}
        />
        {programs.length ? (
          <WhiteCard style={{ marginTop: 14, borderRadius: 22, padding: 18 }}>
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <MaterialIcons name="event" size={16} color={G.ink} />
              <ILText role="eyebrow" color={G.meta} style={[af, { fontSize: 10, marginLeft: 8 }]}>
                Your batches
              </ILText>
            </View>
            {sortProgramsByCurrentBatch(source, programs).map((program, index) => {
              const enrolled = learnerEnrollmentLabel(source, program.id) === 'Enrolled';
              const batchCard = buildProgramBatchCard(source, program.id, groups[program.id]);
              const phase = programBatchPhase(source, program.id);
              const current = phase === 'current';
              const isLep = program.id === PROGRAMS.LEP;
              // Same date source as Enrollment Status — no double story.
              const { dateLine, awaitingZoho } = isLep
                ? lepBatchLine
                : {
                    dateLine: isZohoBatchDateRange(zohoLeadBatchLabel(source, program.id) || '')
                      ? zohoLeadBatchLabel(source, program.id)
                      : '',
                    awaitingZoho: false,
                  };
              return (
                <View
                  key={program.id}
                  style={{
                    marginTop: index === 0 ? 14 : 0,
                    paddingTop: index === 0 ? 0 : 14,
                    borderTopWidth: index === 0 ? 0 : 1,
                    borderTopColor: G.line,
                  }}
                >
                  <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
                    <View style={{ flexDirection: 'row', alignItems: 'center', flex: 1 }}>
                      {current ? (
                        <View style={{ backgroundColor: G.ink, borderRadius: 999, paddingHorizontal: 8, paddingVertical: 3 }}>
                          <ILText role="eyebrow" color={G.white} style={[af, { fontSize: 9 }]}>
                            Current
                          </ILText>
                        </View>
                      ) : null}
                    </View>
                    <View
                      style={{
                        backgroundColor: enrolled ? '#E8F6EE' : G.pink,
                        borderRadius: 999,
                        paddingHorizontal: 10,
                        paddingVertical: 4,
                        marginLeft: 8,
                      }}
                    >
                      <ILText role="eyebrow" color={enrolled ? '#1B7A4A' : G.cta} style={[af, { fontSize: 9 }]}>
                        {enrolled ? 'Enrolled' : 'Registered'}
                      </ILText>
                    </View>
                  </View>
                  <ILText
                    role="title"
                    color={G.ink}
                    style={{
                      marginTop: 8,
                      fontFamily: IL_FONTS.display,
                      fontSize: current ? 22 : 18,
                      lineHeight: current ? 28 : 24,
                    }}
                  >
                    {program.title}
                  </ILText>
                  <ILText
                    role="bodySm"
                    color={dateLine ? G.ink : G.meta}
                    style={{ marginTop: 6, fontSize: 15, lineHeight: 22 }}
                  >
                    {dateLine
                      ? awaitingZoho
                        ? `${dateLine} · syncing to Zoho`
                        : dateLine
                      : 'Not set in Zoho yet'}
                  </ILText>
                  {dateLine && batchCard.body ? (
                    <ILText role="bodySm" color={G.meta} style={{ marginTop: 4, fontSize: 13, lineHeight: 18 }}>
                      {batchCard.body}
                    </ILText>
                  ) : null}
                  {isLep && !enrolled ? (
                    <Pressable onPress={() => setBatchOpen(true)} style={{ marginTop: 10 }}>
                      <ILText role="label" color={G.cta} style={{ fontSize: 13 }}>
                        {dateLine ? 'Change batch date →' : 'Choose batch date →'}
                      </ILText>
                    </Pressable>
                  ) : null}
                  {!enrolled ? (
                    <Pressable onPress={nav.goEnroll} style={{ marginTop: 8 }}>
                      <ILText role="label" color={G.cta} style={{ fontSize: 13 }}>
                        Complete your enrollment →
                      </ILText>
                    </Pressable>
                  ) : null}
                </View>
              );
            })}
          </WhiteCard>
        ) : null}
        {lepProgram ? (
          <PaymentBillingCard
            program={lepProgram}
            source={source}
            latest={latest}
            onPay={nav.goEnroll}
            onReceipt={nav.goReceipt}
          />
        ) : null}

        <WhiteCard style={{ marginTop: 14, borderRadius: 22, overflow: 'hidden' }}>
          {menuRows.map((row, i) => (
            <Pressable
              key={row.label}
              accessibilityRole="button"
              accessibilityLabel={row.label}
              onPress={() => row.go && nav[row.go]?.()}
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                paddingHorizontal: 16,
                paddingVertical: 14,
                minHeight: 52,
                borderTopWidth: i ? 1 : 0,
                borderTopColor: G.line,
              }}
            >
              <MaterialIcons name={row.icon} size={20} color={G.ink} />
              <View style={{ flex: 1, marginLeft: 12, marginRight: 8 }}>
                <View style={{ flexDirection: 'row', alignItems: 'center', flexWrap: 'wrap' }}>
                  <ILText role="label" color={G.ink}>
                    {row.label}
                  </ILText>
                  {row.badge ? (
                    <View
                      style={{
                        marginLeft: 8,
                        backgroundColor: G.cta,
                        borderRadius: 999,
                        paddingHorizontal: 8,
                        paddingVertical: 3,
                      }}
                    >
                      <ILText role="eyebrow" color="#FFFFFF" style={[af, { fontSize: 10 }]}>
                        {row.badge}
                      </ILText>
                    </View>
                  ) : null}
                </View>
                {row.sub ? (
                  <ILText role="bodySm" color={G.meta} style={{ marginTop: 2, fontSize: 12 }}>
                    {row.sub}
                  </ILText>
                ) : null}
              </View>
              {row.notify && hasUnread ? (
                <View
                  style={{
                    width: 8,
                    height: 8,
                    borderRadius: 4,
                    backgroundColor: G.cta,
                    marginRight: 8,
                  }}
                />
              ) : null}
              <MaterialIcons name="chevron-right" size={18} color={G.meta} />
            </Pressable>
          ))}
        </WhiteCard>

        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Log out"
          onPress={onLogout}
          style={{ marginTop: 22, alignItems: 'center', paddingVertical: 8 }}
        >
          <ILText role="label" color={G.ink}>
            Log out
          </ILText>
        </Pressable>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Delete account"
          onPress={onDeleteAccount}
          style={{ alignItems: 'center', paddingVertical: 6 }}
        >
          <ILText role="bodySm" color={G.cta} style={{ fontSize: 13 }}>
            Delete account
          </ILText>
        </Pressable>
        <ILText role="bodySm" color={G.meta} style={{ textAlign: 'center', fontSize: 11, marginTop: 10, marginBottom: 8 }}>
          {`Iron Lady · Version ${appVersion}${buildNumber ? ` (build ${buildNumber})` : ''}`}
        </ILText>
      </ScrollView>
    </Page>
    {batchOpen ? (
      <Modal
        visible
        animationType="slide"
        presentationStyle="fullScreen"
        onRequestClose={() => setBatchOpen(false)}
      >
        <ChooseBatchDateScreen
          allowChange
          onBack={() => setBatchOpen(false)}
          onLock={lockBatch}
        />
      </Modal>
    ) : null}
    </View>
  );
}

function Badge({ children, on }) {
  return (
    <View
      style={{
        maxWidth: '100%',
        borderRadius: 999,
        paddingHorizontal: 10,
        paddingVertical: 5,
        borderWidth: 1,
        borderColor: on ? G.cta : 'rgba(255,255,255,0.28)',
      }}
    >
      <ILText role="label" color="#FFFFFF" style={[af, { fontSize: 11 }]}>
        {children}
      </ILText>
    </View>
  );
}


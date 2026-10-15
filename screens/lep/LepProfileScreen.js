import React, { useEffect, useState } from 'react';
import { Alert, Image, Platform, Pressable, ScrollView, View } from 'react-native';
import { doc, getDoc } from 'firebase/firestore';
import { StatusBar } from 'expo-status-bar';
import { MaterialIcons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { IL_FONTS } from '../../constants/ironLadyBrand';
import ILText from '../../components/il/ILText';
import { G, af } from '../../constants/guestTheme';
import { LIQUID_TAB_PAD } from '../../components/il/LiquidTabBar';
import { useAuth } from '../../context/AuthContext';
import { useCourseDemo } from '../../context/CourseDemoContext';
import { lepFullName } from '../../utils/lepState';
import { PAYMENT_STATUS, REGISTRATION_FEE } from '../../constants/programs';
import { practiceKey } from '../../constants/practice';
import {
  learnerBatchId,
  learnerBhagText,
  learnerEnrollmentLabel,
  learnerLeadDetails,
  programPaymentStatus,
  programsOnProfile,
  zohoPaymentDetail,
  zohoRegistrationAmount,
} from '../../utils/programAccess';
import { buildProgramBatchCard, programBatchPhase, sortProgramsByCurrentBatch } from '../../utils/lepBatchHero';
import { db } from '../../services/firebase';
import { fetchUserProfile } from '../../services/auth';
import { refreshMyAccess } from '../../services/functions';
import { pickAndSaveProfilePhoto } from '../../services/profilePhoto';
import { LepHeader, Page, SoftChip, WhiteCard } from './LepBits';
import { useLepNav } from './useLepNav';
import { useMyReceipts } from '../../hooks/useMyReceipts';
import { useGlassHeaderPad } from '../../components/il/GlassHeader';

function feeLabel(profile, programId) {
  const access = profile?.programAccess?.[programId] || {};
  const amount = Number(
    zohoRegistrationAmount(profile, programId) ??
      access.registrationFee ??
      access.registrationAmount ??
      REGISTRATION_FEE[programId] ??
      REGISTRATION_FEE.lep
  );
  return `₹${amount.toLocaleString('en-IN')}`;
}

const SETTINGS = [
  { icon: 'receipt-long', label: 'Orders & receipts', go: 'goOrders' },
  { icon: 'payments', label: 'Payment & enrollment', go: 'goEnroll' },
  { icon: 'workspace-premium', label: 'Certificates', go: 'goCertificate', certs: true },
  { icon: 'insights', label: 'Your progress', go: 'goProgress' },
  { icon: 'notifications-none', label: 'Nudges & reminders', go: 'goNudges' },
  { icon: 'help-outline', label: 'Help & Support' },
  { icon: 'lock-outline', label: 'Privacy' },
  { icon: 'description', label: 'Terms' },
];

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
  const { orders, latest, signedIn } = useMyReceipts();
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
  const facts = learnerLeadDetails(source);
  const name = facts.name || lepFullName(profile);
  const headline = [facts.designation, facts.industry, facts.experience].filter(Boolean).join(' · ');
  const filled = [facts.city, facts.experience, facts.designation, learnerBhagText(source)].filter(Boolean).length;
  const groups = useProgramGroups(source, programs.map((p) => p.id));
  const practiceBhag = String(demo.getSubmission('lep', practiceKey('lep-bhag'))?.data?.note || '').trim();
  const bhag = learnerBhagText(source) || practiceBhag;
  const fee = programs.length ? feeLabel(source, programs[0].id) : feeLabel(source, 'lep');

  useEffect(() => {
    if (!user?.uid) return undefined;
    let cancelled = false;
    (async () => {
      await refreshMyAccess();
      const fresh = await fetchUserProfile(user.uid).catch(() => null);
      if (!cancelled && fresh) patchProfile(fresh);
    })();
    return () => {
      cancelled = true;
    };
  }, [user?.uid, patchProfile]);

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

  return (
    <Page>
      <StatusBar style="dark" />
      <LepHeader floating photoUrl={profile?.photoURL} onNotifications={nav.goNotifications} onProfile={() => {}} />
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{
        paddingTop: headerPad + 4,
          paddingHorizontal: 20,
          paddingBottom: LIQUID_TAB_PAD + Math.max(insets.bottom, 24) + 24,
        }}
      >
        <View style={{ backgroundColor: G.dark, borderRadius: 28, padding: 18 }}>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
            <SoftChip onDark icon="fiber-manual-record">
              {anyEnrolled ? 'Your profile' : 'Registered participant'}
            </SoftChip>
            {anyEnrolled ? (
              <MaterialIcons name="settings" size={18} color="rgba(255,255,255,0.7)" />
            ) : (
              <Pressable onPress={onLogout} hitSlop={8}>
                <ILText role="label" color="#F8D6D4" style={{ fontSize: 13 }}>
                  Log out
                </ILText>
              </Pressable>
            )}
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
              {headline ? (
                <ILText role="bodySm" color="rgba(255,255,255,0.65)" numberOfLines={2} style={{ marginTop: 4, fontSize: 12 }}>
                  {headline}
                </ILText>
              ) : null}
            </View>
          </View>
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', marginTop: 14, gap: 8 }}>
            {programs.map((p) => (
              <Badge key={p.id} on>
                {`${p.code} · ${learnerEnrollmentLabel(source, p.id)}`}
              </Badge>
            ))}
          </View>
        </View>

        {latest ? (
          <Pressable onPress={() => nav.goReceipt(latest)}>
            <WhiteCard style={{ marginTop: 14, borderRadius: 22, padding: 18, borderWidth: 1, borderColor: G.cta }}>
              <ILText role="eyebrow" color={G.cta} style={[af, { fontSize: 10 }]}>
                Razorpay receipt
              </ILText>
              <ILText role="title" color={G.ink} style={{ marginTop: 8, fontFamily: IL_FONTS.display, fontSize: 28 }}>
                ₹{Number(latest.amountRupees || 0).toLocaleString('en-IN')} paid
              </ILText>
              <ILText role="bodySm" color={G.meta} style={{ marginTop: 6, fontSize: 13, lineHeight: 18 }}>
                {latest.programTitle || latest.description || 'Payment'}
                {latest.transactionId ? ` · ${latest.transactionId}` : ''}
              </ILText>
              <ILText role="label" color={G.cta} style={{ marginTop: 12 }}>
                View receipt →
              </ILText>
            </WhiteCard>
          </Pressable>
        ) : null}

        <WhiteCard style={{ marginTop: 14, borderRadius: 22, padding: 18 }}>
          <ILText role="eyebrow" color={G.cta} style={[af, { fontSize: 10 }]}>
            Your receipts
          </ILText>
          {(orders.length ? orders : latest ? [latest] : []).map((row, i) => (
            <Pressable
              key={row.id || row.transactionId}
              onPress={() => nav.goReceipt(row)}
              style={{
                marginTop: 14,
                paddingTop: i ? 14 : 0,
                borderTopWidth: i ? 1 : 0,
                borderTopColor: G.line,
              }}
            >
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <View style={{ flex: 1, paddingRight: 12 }}>
                  <ILText role="label" color={G.ink}>
                    {row.description || row.programTitle || 'Payment'}
                  </ILText>
                  <ILText role="bodySm" color={G.meta} style={{ marginTop: 4, fontSize: 12 }}>
                    {row.transactionId ? `Txn ${row.transactionId}` : 'Paid'}
                  </ILText>
                </View>
                <ILText role="title" color={G.ink} style={{ fontFamily: IL_FONTS.display, fontSize: 20 }}>
                  ₹{Number(row.amountRupees || 0).toLocaleString('en-IN')}
                </ILText>
              </View>
              <ILText role="label" color={G.cta} style={{ marginTop: 10 }}>
                View receipt →
              </ILText>
            </Pressable>
          ))}
          {!orders.length && !latest ? (
            <ILText role="bodySm" color={G.meta} style={{ marginTop: 10, fontSize: 13 }}>
              {signedIn ? 'No saved Razorpay receipt on this number yet.' : `Open Payment & enrollment for the ${fee} registration receipt.`}
            </ILText>
          ) : null}
        </WhiteCard>

        <WhiteCard style={{ marginTop: 14, borderRadius: 22, padding: 16 }}>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
            <View>
              <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                <ILText role="eyebrow" color={G.meta} style={[af, { fontSize: 10 }]}>
                  Profile strength
                </ILText>
                {filled === 4 ? (
                  <ILText role="label" color={G.cta} style={[af, { fontSize: 12, marginLeft: 6 }]}>
                    Complete
                  </ILText>
                ) : null}
              </View>
            </View>
            <ILText role="display" color={G.cta} style={{ fontFamily: IL_FONTS.display, fontSize: 22 }}>
              {Math.round((filled / 4) * 100)}%
            </ILText>
          </View>
          <AddRow icon="place" title="Current city" sub={facts.city} />
          <AddRow icon="work-outline" title="Years of experience" sub={facts.experience} />
          <AddRow icon="badge" title="Designation" sub={facts.designation} />
        </WhiteCard>

        <WhiteCard style={{ marginTop: 14, borderRadius: 22, padding: 18 }}>
          <ILText role="eyebrow" color={G.cta} style={[af, { fontSize: 10 }]}>
            MY B-HAG (BIG HAIRY AUDACIOUS GOAL)
          </ILText>
          <ILText
            role="title"
            color={G.ink}
            style={{ marginTop: 10, fontFamily: IL_FONTS.display, fontSize: 22, lineHeight: 28 }}
          >
            {bhag || 'Write your B-HAG'}
          </ILText>
          <Pressable onPress={() => nav.goPractice('lep', 'lep-bhag')} style={{ marginTop: 10 }}>
            <ILText role="label" color={G.cta} style={{ fontSize: 13 }}>
              {bhag ? 'Refine it →' : 'Write my B-HAG →'}
            </ILText>
          </Pressable>
        </WhiteCard>

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
                    color={batchCard.heading ? G.ink : G.meta}
                    style={{ marginTop: 6, fontSize: 15, lineHeight: 22 }}
                  >
                    {batchCard.heading || 'Batch dates will show here.'}
                  </ILText>
                  {batchCard.body ? (
                    <ILText role="bodySm" color={G.meta} style={{ marginTop: 4, fontSize: 13, lineHeight: 18 }}>
                      {batchCard.body}
                    </ILText>
                  ) : null}
                  {enrolled ? null : (
                    <Pressable onPress={nav.goEnroll} style={{ marginTop: 10 }}>
                      <ILText role="label" color={G.cta} style={{ fontSize: 13 }}>
                        Complete your enrollment →
                      </ILText>
                    </Pressable>
                  )}
                </View>
              );
            })}
          </WhiteCard>
        ) : null}

        <WhiteCard style={{ marginTop: 14, borderRadius: 22, padding: 18 }}>
          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
            <MaterialIcons name="receipt-long" size={16} color={G.ink} />
            <ILText role="eyebrow" color={G.ink} style={[af, { fontSize: 10, marginLeft: 8 }]}>
              PAYMENT & BILLING
            </ILText>
          </View>
          {(programs.length ? programs : []).map((program, i) => {
            const pay = zohoPaymentDetail(source, program.id);
            const paid =
              /completed|paid/i.test(pay.status || '') ||
              programPaymentStatus(source, program.id) === PAYMENT_STATUS.PAID;
            const note = [pay.paidOn, pay.txn].filter(Boolean).join(' · ');
            return (
              <View
                key={program.id}
                style={{
                  marginTop: 14,
                  paddingTop: i ? 14 : 0,
                  borderTopWidth: i ? 1 : 0,
                  borderTopColor: G.line,
                }}
              >
                <ILText role="label" color={G.ink}>
                  {program.title}
                </ILText>
                <View style={{ marginTop: 8, flexDirection: 'row', justifyContent: 'space-between' }}>
                  <View style={{ flex: 1, paddingRight: 12 }}>
                    <ILText role="bodySm" color={G.meta} style={{ fontSize: 12 }}>
                      Registration fee
                    </ILText>
                    <ILText role="bodySm" color={G.meta} style={{ marginTop: 3, fontSize: 12 }}>
                      {note || pay.status || (paid ? 'Paid' : 'Due')}
                    </ILText>
                  </View>
                  <View style={{ alignItems: 'flex-end' }}>
                    <ILText role="title" color={G.ink} style={{ fontFamily: IL_FONTS.display, fontSize: 18 }}>
                      {pay.amount != null ? `₹${pay.amount.toLocaleString('en-IN')}` : feeLabel(source, program.id)}
                    </ILText>
                    <ILText role="eyebrow" color={paid ? '#1B7A4A' : G.cta} style={[af, { fontSize: 9, marginTop: 4 }]}>
                      {pay.status || (paid ? 'PAID' : 'DUE')}
                    </ILText>
                  </View>
                </View>
              </View>
            );
          })}
        </WhiteCard>

        <WhiteCard style={{ marginTop: 14, borderRadius: 22, overflow: 'hidden' }}>
          {(anyEnrolled
            ? [
                { icon: 'workspace-premium', label: 'Certificates', extra: '0 issued', go: 'goCertificate' },
                { icon: 'file-download', label: 'Downloads', extra: 'Offline guides' },
                { icon: 'notifications-none', label: 'Notifications', go: 'goNudges' },
                { icon: 'help-outline', label: 'Help & Support' },
                { icon: 'lock-outline', label: 'Privacy' },
                { icon: 'description', label: 'Terms' },
              ]
            : SETTINGS
          ).map((row, i) => (
            <Pressable
              key={row.label}
              onPress={() => row.go && nav[row.go]?.()}
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                paddingHorizontal: 16,
                paddingVertical: 14,
                borderTopWidth: i ? 1 : 0,
                borderTopColor: G.line,
              }}
            >
              <MaterialIcons name={row.icon} size={20} color={G.ink} />
              <ILText role="label" color={G.ink} style={{ flex: 1, marginLeft: 12 }}>
                {row.label}
              </ILText>
              {row.extra ? (
                <ILText role="bodySm" color={G.meta} style={{ marginRight: 6, fontSize: 12 }}>
                  {row.extra}
                </ILText>
              ) : null}
              <MaterialIcons name="chevron-right" size={18} color={G.meta} />
            </Pressable>
          ))}
        </WhiteCard>

        <Pressable onPress={onLogout} style={{ marginTop: 22, alignItems: 'center', paddingVertical: 8 }}>
          <ILText role="label" color={G.ink}>
            Log out
          </ILText>
        </Pressable>
        <ILText role="bodySm" color={G.cta} style={{ textAlign: 'center', fontSize: 13, marginTop: 4 }}>
          Delete account
        </ILText>
        <ILText role="bodySm" color={G.meta} style={{ textAlign: 'center', fontSize: 11, marginTop: 10, marginBottom: 8 }}>
          Iron Lady Executive App · Version 2.4.0
        </ILText>
      </ScrollView>
    </Page>
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

function AddRow({ icon, title, sub }) {
  return (
    <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 14 }}>
      <View
        style={{
          width: 36,
          height: 36,
          borderRadius: 18,
          backgroundColor: G.mutedFill,
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <MaterialIcons name={icon} size={16} color={G.ink} />
      </View>
      <View style={{ flex: 1, marginLeft: 10 }}>
        <ILText role="label" color={G.ink}>
          {title}
        </ILText>
        {sub ? (
          <ILText role="bodySm" color={G.meta} style={{ fontSize: 12 }}>
            {sub}
          </ILText>
        ) : null}
      </View>
      {!sub ? (
        <ILText role="label" color={G.cta} style={[af, { fontSize: 12 }]}>
          + add
        </ILText>
      ) : null}
    </View>
  );
}

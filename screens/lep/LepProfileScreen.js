import React from 'react';
import { Alert, Image, Platform, Pressable, ScrollView, View } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { MaterialIcons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { IL_FONTS } from '../../constants/ironLadyBrand';
import ILText from '../../components/il/ILText';
import { G, af } from '../../constants/guestTheme';
import { LIQUID_TAB_PAD } from '../../components/il/LiquidTabBar';
import { useAuth } from '../../context/AuthContext';
import { getActiveProgram, isLepEnrolled, lepFullName } from '../../utils/lepState';
import { REGISTRATION_FEE } from '../../constants/programs';
import { LepHeader, Page, RedCta, SoftChip, WhiteCard } from './LepBits';
import { useLepNav } from './useLepNav';
import { FACE } from './lepData';
import { useMyReceipts } from '../../hooks/useMyReceipts';
import { useGlassHeaderPad } from '../../components/il/GlassHeader';

/** Profile text per program and state, so 100BM and MBW stop showing LEP details. */
const PROGRAM_PROFILE = {
  lep: {
    code: 'LEP',
    title: 'Leadership Essentials Program',
    short: 'Leadership Essentials',
    reg: {
      badges: [{ label: 'LEP Applicant', on: true }, { label: 'Masterclass Registered' }],
      bhag: 'Calibrated for Leadership Essentials · Foundation principle active',
      status: 'Seat reserved · Pending enrollment',
      heading: 'Leadership Essentials Program',
      body: 'Masterclass completed (4/4 Foundation Principles). Complete enrollment to unlock all 27 Principles, Private Cohort Triads & Thursday Circles.',
      date: 'Sat 20 – Sun 21 September, 2026',
      dateSub: '9:00 AM – 7:00 PM IST (Both days)',
      certs: 'Certificates · 1 issued',
    },
    enr: {
      badges: [{ label: 'LEP', on: true }, { label: '100BM' }],
      bhag: 'Calibrated for Leadership Essentials Program · Review milestone scheduled at Day 45',
      batch: 'MY BATCH',
      heading: 'Sat 20 – Sun 21 Sep, 2026',
      body: '9:00 AM – 7:00 PM IST (Both days) · Live Zoom',
    },
  },
  '100bm': {
    code: '100BM',
    title: '100 Board Members',
    short: '100 Board Members',
    reg: {
      badges: [{ label: '100BM Applicant', on: true }, { label: 'Onboarding preview' }],
      bhag: 'Calibrated for 100 Board Members · Onboarding preview active',
      status: 'Seat reserved · Pending enrollment',
      heading: '100 Board Members',
      body: 'Onboarding is open as a preview. Complete enrollment to unlock all 4 Phases, Practice Huddles and your cohort.',
      date: 'Cohort of Oct 2026 · starts Sat 3 Oct',
      dateSub: '~24 weeks online · weekly live Q&A',
      certs: 'Onboarding certificate · 1 issued',
    },
    enr: {
      badges: [{ label: '100BM', on: true }, { label: 'LEP', on: true }],
      bhag: 'Board ambition carried through to Graduation · Phase 2 in progress',
      batch: 'MY 100BM COHORT',
      heading: 'Batch B · 3 Oct 2026 – 4 Apr 2027',
      body: 'Weekly live Q&A · Thu 7:00 PM IST · online',
    },
  },
  mbw: {
    code: 'MBW',
    title: 'Master of Business Warfare',
    short: 'Master of Business Warfare',
    reg: {
      badges: [{ label: 'MBW Applicant', on: true }, { label: 'Preparation' }],
      bhag: 'Calibrated for Master of Business Warfare · Preparation week 5 of 12',
      status: 'Preparation · week 5 of 12',
      heading: 'Master of Business Warfare',
      body: 'Preparation week 5 of 12 — Orientation with Rajesh is done. The Q1 core session starts in eight weeks.',
      date: 'Q1 core session · in 8 weeks',
      dateSub: '1 year · 16 Impact Champions sessions + 4 with Suvarna',
      certs: 'Certificates · 0 issued',
    },
    enr: {
      badges: [{ label: 'MBW', on: true }, { label: 'LEP', on: true }],
      bhag: 'Your C-Suite ambition · CXO by 2028',
      batch: 'MY MBW YEAR',
      heading: 'Q1 · Week 4 of 52',
      body: 'Next: Session 2 · C-Suite Story Video · weekly WA-group deliverable',
    },
  },
};

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

export default function LepProfileScreen() {
  const { profile, logout } = useAuth();
  const insets = useSafeAreaInsets();
  const headerPad = useGlassHeaderPad();
  const nav = useLepNav();
  const { orders, latest, signedIn } = useMyReceipts();
  const enrolled = isLepEnrolled(profile);
  const name = lepFullName(profile);
  const program = PROGRAM_PROFILE[getActiveProgram(profile)] || PROGRAM_PROFILE.lep;
  const copy = enrolled ? program.enr : program.reg;
  const fee = `₹${(REGISTRATION_FEE[getActiveProgram(profile)] ?? REGISTRATION_FEE.lep).toLocaleString('en-IN')}`;

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
              {enrolled ? 'Your profile' : 'Registered participant'}
            </SoftChip>
            {enrolled ? (
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
            <Image
              source={profile?.photoURL ? { uri: profile.photoURL } : FACE}
              style={{ width: 64, height: 64, borderRadius: 32 }}
            />
            <View style={{ flex: 1, marginLeft: 14 }}>
              <ILText role="title" color="#FFFFFF" style={{ fontFamily: IL_FONTS.display, fontSize: 24 }}>
                {name}
              </ILText>
              <ILText role="bodySm" color="rgba(255,255,255,0.65)" style={{ marginTop: 4, fontSize: 12 }}>
                Iron Lady Army · since Sep 2026
              </ILText>
              <View style={{ flexDirection: 'row', marginTop: 10 }}>
                {copy.badges.map((b) => (
                  <Badge key={b.label} on={b.on}>
                    {b.label}
                  </Badge>
                ))}
              </View>
            </View>
          </View>
        </View>

        <Pressable onPress={() => latest && nav.goReceipt(latest)}>
          <WhiteCard style={{ marginTop: 14, borderRadius: 22, padding: 18, borderWidth: 1, borderColor: G.cta }}>
            <ILText role="eyebrow" color={G.cta} style={[af, { fontSize: 10 }]}>
              Razorpay receipt
            </ILText>
            <ILText role="title" color={G.ink} style={{ marginTop: 8, fontFamily: IL_FONTS.display, fontSize: 28 }}>
              ₹1 paid
            </ILText>
            <ILText role="bodySm" color={G.meta} style={{ marginTop: 6, fontSize: 13, lineHeight: 18 }}>
              {/* Name the program the saved payment was for, not the one being viewed. */}
              Programme balance ·{' '}
              {latest?.programTitle || latest?.description?.split(' — ')[0] || program.short}
              {latest?.transactionId && latest.transactionId !== 'Razorpay ₹1'
                ? ` · ${latest.transactionId}`
                : ''}
            </ILText>
            <ILText role="label" color={G.cta} style={{ marginTop: 12 }}>
              View ₹1 receipt →
            </ILText>
          </WhiteCard>
        </Pressable>

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
                <ILText role="label" color={G.cta} style={[af, { fontSize: 12, marginLeft: 6 }]}>
                  Good
                </ILText>
              </View>
              <ILText role="bodySm" color={G.meta} style={{ marginTop: 6, fontSize: 13 }}>
                Add 2 details to get better matches
              </ILText>
            </View>
            <ILText role="display" color={G.cta} style={{ fontFamily: IL_FONTS.display, fontSize: 22 }}>
              60%
            </ILText>
          </View>
          <AddRow icon="place" title="Current city" sub="Finding nearby meetups & peers" />
          <AddRow icon="work-outline" title="Years of experience" sub="Helps us group you with the right peers" />
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
            CXO by 2028 — Heading Enterprise Technology
          </ILText>
          <ILText role="bodySm" color={G.meta} style={{ marginTop: 6, fontSize: 13 }}>
            {copy.bhag}
          </ILText>
        </WhiteCard>

        <WhiteCard style={{ marginTop: 14, borderRadius: 22, padding: 18 }}>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <MaterialIcons name="event" size={16} color={G.ink} />
              <ILText role="eyebrow" color={G.ink} style={[af, { fontSize: 10, marginLeft: 8 }]}>
                {enrolled ? copy.batch : 'ENROLLMENT STATUS'}
              </ILText>
            </View>
            {!enrolled ? (
              <View style={{ backgroundColor: G.pink, borderRadius: 999, paddingHorizontal: 10, paddingVertical: 5 }}>
                <ILText role="eyebrow" color={G.cta} style={[af, { fontSize: 9 }]}>
                  {copy.status}
                </ILText>
              </View>
            ) : (
              <View style={{ backgroundColor: '#E8F6EE', borderRadius: 999, paddingHorizontal: 10, paddingVertical: 5 }}>
                <ILText role="eyebrow" color="#1B7A4A" style={[af, { fontSize: 9 }]}>
                  Confirmed
                </ILText>
              </View>
            )}
          </View>
          <ILText role="eyebrow" color={G.cta} style={[af, { marginTop: 16, fontSize: 10 }]}>
            {program.code}
          </ILText>
          <ILText
            role="title"
            color={G.ink}
            style={{ marginTop: 6, fontFamily: IL_FONTS.display, fontSize: 22, lineHeight: 28 }}
          >
            {copy.heading}
          </ILText>
          <ILText role="bodySm" color={G.meta} style={{ marginTop: 8, fontSize: 13, lineHeight: 18 }}>
            {copy.body}
          </ILText>
          {!enrolled ? (
            <View
              style={{
                marginTop: 14,
                backgroundColor: G.white,
                borderRadius: 16,
                borderWidth: 1,
                borderColor: G.line,
                padding: 14,
                flexDirection: 'row',
                alignItems: 'center',
              }}
            >
              <MaterialIcons name="schedule" size={16} color={G.ink} />
              <View style={{ flex: 1, marginLeft: 10 }}>
                <ILText role="label" color={G.ink}>
                  {copy.date}
                </ILText>
                <ILText role="bodySm" color={G.meta} style={{ marginTop: 2, fontSize: 12 }}>
                  {copy.dateSub}
                </ILText>
              </View>
              <ILText role="label" color={G.cta} style={{ fontSize: 12 }}>
                Change date
              </ILText>
            </View>
          ) : null}
          {enrolled ? (
            <View style={{ marginTop: 14, flexDirection: 'row', justifyContent: 'space-between' }}>
              <ILText role="bodySm" color={G.meta} style={{ fontSize: 12 }}>
                Need to reschedule?
              </ILText>
              <ILText role="label" color={G.cta} style={{ fontSize: 12 }}>
                Request a change ›
              </ILText>
            </View>
          ) : (
            <View style={{ marginTop: 14 }}>
              <RedCta label="Complete your enrollment →" onPress={nav.goEnroll} />
            </View>
          )}
          {!enrolled ? (
            <View style={{ marginTop: 16, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
              <ILText role="bodySm" color={G.meta} style={{ fontSize: 12 }}>
                Need help deciding?
              </ILText>
              <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                <MaterialIcons name="call" size={14} color={G.cta} />
                <ILText role="label" color={G.ink} style={{ marginLeft: 6, fontSize: 13 }}>
                  Talk to someone at Iron Lady
                </ILText>
              </View>
            </View>
          ) : null}
        </WhiteCard>

        <WhiteCard style={{ marginTop: 14, borderRadius: 22, padding: 18 }}>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <MaterialIcons name="receipt-long" size={16} color={G.ink} />
              <ILText role="eyebrow" color={G.ink} style={[af, { fontSize: 10, marginLeft: 8 }]}>
                PAYMENT & BILLING
              </ILText>
            </View>
            <ILText role="eyebrow" color="#1B7A4A" style={[af, { fontSize: 9 }]}>
              Synced from Zoho
            </ILText>
          </View>
          <ILText role="label" color={G.ink} style={{ marginTop: 14 }}>
            {program.title}
          </ILText>
          <ILText role="bodySm" color={G.meta} style={{ marginTop: 4, fontSize: 12 }}>
            {enrolled ? 'Paid in full' : 'Balance due'}
          </ILText>
          <View style={{ marginTop: 14, paddingTop: 14, borderTopWidth: 1, borderTopColor: G.line }}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
              <View style={{ flex: 1 }}>
                <ILText role="label" color={G.ink}>
                  Registration fee
                </ILText>
                <ILText role="bodySm" color={G.meta} style={{ marginTop: 3, fontSize: 12 }}>
                  Received · txn 4471 · 12 Sep
                </ILText>
              </View>
              <View style={{ alignItems: 'flex-end' }}>
                <ILText role="title" color={G.ink} style={{ fontFamily: IL_FONTS.display, fontSize: 18 }}>
                  {fee}
                </ILText>
                <ILText role="eyebrow" color="#1B7A4A" style={[af, { fontSize: 9, marginTop: 4 }]}>
                  PAID
                </ILText>
              </View>
            </View>
          </View>
        </WhiteCard>

        <WhiteCard style={{ marginTop: 14, borderRadius: 22, overflow: 'hidden' }}>
          {(enrolled
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
                {row.certs ? copy.certs : row.label}
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
        marginRight: 8,
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
        <ILText role="bodySm" color={G.meta} style={{ fontSize: 12 }}>
          {sub}
        </ILText>
      </View>
      <ILText role="label" color={G.cta} style={[af, { fontSize: 12 }]}>
        + add
      </ILText>
    </View>
  );
}

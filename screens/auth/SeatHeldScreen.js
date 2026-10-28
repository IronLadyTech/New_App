import React, { useEffect, useMemo } from 'react';
import { Alert, Linking, Platform, ScrollView, View } from 'react-native';
import Pressable from '../../components/il/Press';
import { StatusBar } from 'expo-status-bar';
import { MaterialIcons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { IL_FONTS } from '../../constants/ironLadyBrand';
import ILText from '../../components/il/ILText';
import { useAuth } from '../../context/AuthContext';
import { lockLepBatchChoice } from '../../utils/lockLepBatch';
import { buildPaymentEnrollmentView } from '../../utils/paymentEnrollment';
import { day1CalendarUrl } from '../../utils/registeredHomeData';
import { BATCHES } from './ChooseBatchDateScreen';

const PAGE = '#F7F6E4';
const INK = '#113744';
const BODY = '#4A463D';
const META = '#5A574F';
const LINE = '#EAE8DC';
const CTA = '#ED1D24';
const PAID = '#1E7A4B';
const TRACK = '#F2D7D8';
const DARK = '#113744';

const androidFix = Platform.OS === 'android' ? { includeFontPadding: false } : null;

function MoneyRow({ label, detail, amount, status, paid }) {
  return (
    <View
      style={{
        flexDirection: 'row',
        alignItems: 'flex-start',
        justifyContent: 'space-between',
        paddingVertical: 12,
      }}
    >
      <View style={{ flex: 1, minWidth: 0, marginRight: 12 }}>
        <ILText role="label" color={INK} style={[androidFix, { fontSize: 13, lineHeight: 18 }]}>
          {label}
        </ILText>
        <ILText
          role="bodySm"
          color={META}
          style={[androidFix, { marginTop: 2, fontSize: 11, lineHeight: 15 }]}
        >
          {detail}
        </ILText>
      </View>
      <View style={{ alignItems: 'flex-end' }}>
        <ILText
          role="title"
          color={INK}
          style={{
            fontFamily: IL_FONTS.displayBold,
            fontSize: 16,
            lineHeight: 21,
            letterSpacing: -0.2,
          }}
        >
          {amount}
        </ILText>
        <ILText
          role="eyebrow"
          color={paid ? PAID : CTA}
          style={[
            androidFix,
            {
              marginTop: 2,
              fontSize: 10,
              lineHeight: 14,
              letterSpacing: 1.2,
            },
          ]}
        >
          {status}
        </ILText>
      </View>
    </View>
  );
}

function BatchLine({ tag, title, note, last }) {
  return (
    <View
      style={{
        flexDirection: 'row',
        alignItems: 'flex-start',
        paddingTop: last ? 8 : 0,
        marginTop: last ? 4 : 0,
        borderTopWidth: last ? 1 : 0,
        borderTopColor: 'rgba(255,255,255,0.10)',
      }}
    >
      <View
        style={{
          marginTop: last ? 6 : 2,
          marginRight: 12,
          paddingHorizontal: 8,
          paddingVertical: 2,
          borderRadius: 4,
          backgroundColor: 'rgba(255,255,255,0.12)',
        }}
      >
        <ILText
          role="eyebrow"
          color="#FFFFFF"
          style={[androidFix, { fontSize: 10, lineHeight: 14, letterSpacing: 1.2 }]}
        >
          {tag}
        </ILText>
      </View>
      <View style={{ flex: 1, paddingTop: last ? 4 : 0 }}>
        <ILText
          role="label"
          color="#FFFFFF"
          style={[androidFix, { fontSize: 13.5, lineHeight: 18 }]}
        >
          {title}
        </ILText>
        <ILText
          role="bodySm"
          color="rgba(255,255,255,0.65)"
          style={[androidFix, { marginTop: 2, fontSize: 11.5, lineHeight: 16 }]}
        >
          {note}
        </ILText>
      </View>
    </View>
  );
}

export default function SeatHeldScreen({ navigation, route, onContinue }) {
  const insets = useSafeAreaInsets();
  const { profile, user, patchProfile } = useAuth();
  const name =
    route?.params?.name ||
    profile?.displayName?.split(' ')[0] ||
    'Ananya';
  const batch =
    route?.params?.batch ||
    BATCHES.find((b) => b.id === route?.params?.batchId) ||
    BATCHES[0];

  const vm = useMemo(
    () =>
      buildPaymentEnrollmentView(profile, user, {
        programId: 'lep',
        pickedBatch: batch,
      }),
    [profile, user, batch]
  );

  useEffect(() => {
    if (!batch?.day1Date && !batch?.cmsBatchId && !batch?.id) return;
    lockLepBatchChoice({ user, profile, patchProfile, picked: batch }).catch(() => {});
  }, [batch?.cmsBatchId, batch?.id, batch?.day1Date, user?.uid]);

  const finish = () => {
    if (typeof onContinue === 'function') {
      onContinue();
      return;
    }
    const isLab = !user?.uid || user.uid === 'preview';
    if (isLab && navigation?.navigate) {
      navigation.navigate('JourneyPicker', { name, batch });
      return;
    }
    if (navigation?.canGoBack?.()) navigation.goBack();
  };

  return (
    <View style={{ flex: 1, backgroundColor: PAGE }}>
      <StatusBar style="dark" />
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{
          paddingHorizontal: 20,
          paddingTop: Math.max(insets.top, 12) + 8,
          paddingBottom: Math.max(insets.bottom, 16) + 28,
        }}
      >
        <View>
          <ILText
            role="eyebrow"
            color={CTA}
            style={[
              androidFix,
              { fontSize: 10, lineHeight: 13, letterSpacing: 1.6, marginBottom: 4 },
            ]}
          >
            {vm.statusLine}
          </ILText>
          <ILText
            role="display"
            color={INK}
            style={{ fontSize: 27, lineHeight: 32, letterSpacing: -0.4 }}
          >
            {vm.headline}
          </ILText>
          <ILText
            role="bodySm"
            color={BODY}
            style={{ marginTop: 6, fontSize: 13, lineHeight: 20 }}
          >
            {vm.subline}
          </ILText>
        </View>

        <View
          style={{
            marginTop: 24,
            borderRadius: 20,
            backgroundColor: '#FFFFFF',
            borderWidth: 1,
            borderColor: LINE,
            padding: 20,
            shadowColor: '#0F1B3D',
            shadowOffset: { width: 0, height: 4 },
            shadowOpacity: 0.05,
            shadowRadius: 10,
            elevation: 2,
          }}
        >
          <View
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              justifyContent: 'space-between',
              paddingBottom: 4,
            }}
          >
            <ILText
              role="eyebrow"
              color={META}
              style={[androidFix, { fontSize: 10, lineHeight: 13, letterSpacing: 1.6, flex: 1 }]}
            >
              {vm.programLabel}
            </ILText>
            <View
              style={{
                marginLeft: 8,
                paddingHorizontal: 10,
                paddingVertical: 4,
                borderRadius: 999,
                backgroundColor: 'rgba(237,29,36,0.10)',
              }}
            >
              <ILText
                role="eyebrow"
                color={CTA}
                style={[androidFix, { fontSize: 10, lineHeight: 13, letterSpacing: 1.2 }]}
              >
                Balance due
              </ILText>
            </View>
          </View>

          <View style={{ borderTopWidth: 1, borderTopColor: LINE, marginTop: 8 }}>
            <MoneyRow
              label="Registration fee"
              detail={`Received · txn ending ${vm.txnLast4}`}
              amount={vm.registrationFeeLabel}
              status={`Paid ${vm.registrationPaidLabel}`}
              paid
            />
            <View style={{ height: 1, backgroundColor: LINE }} />
            <MoneyRow
              label="Programme balance"
              detail={vm.balanceNote}
              amount={vm.programBalanceLabel}
              status={vm.balanceDueLabel !== '—' ? `Due ${vm.balanceDueLabel}` : 'Due'}
            />
          </View>

          <View
            style={{
              marginTop: 16,
              height: 6,
              borderRadius: 999,
              backgroundColor: TRACK,
              overflow: 'hidden',
            }}
          >
            <View
              style={{
                width: `${vm.progressPercent}%`,
                height: '100%',
                borderRadius: 999,
                backgroundColor: PAID,
              }}
            />
          </View>

          <Pressable
            onPress={() =>
              Alert.alert(
                'Pay balance',
                'Razorpay checkout will open here on the signed-in build.'
              )
            }
            accessibilityRole="button"
            accessibilityLabel="Pay balance"
            style={({ pressed }) => ({
              marginTop: 16,
              width: '100%',
              paddingVertical: 12,
              borderRadius: 999,
              backgroundColor: CTA,
              alignItems: 'center',
              justifyContent: 'center',
              opacity: pressed ? 0.92 : 1,
              shadowColor: CTA,
              shadowOffset: { width: 0, height: 8 },
              shadowOpacity: 0.28,
              shadowRadius: 12,
              elevation: 4,
            })}
          >
            <ILText role="label" color="#FFFFFF" style={{ fontSize: 14, lineHeight: 18 }}>
              Pay {vm.programBalanceLabel}
            </ILText>
          </Pressable>

          <Pressable
            onPress={() =>
              Alert.alert(
                'Talk to Iron Lady',
                'Someone from the team will call you about the amount.'
              )
            }
            style={{ marginTop: 10, alignItems: 'center' }}
          >
            <ILText
              role="bodySm"
              color={META}
              align="center"
              style={[androidFix, { fontSize: 11, lineHeight: 16 }]}
            >
              Questions about the amount?{' '}
              <ILText
                role="label"
                color={INK}
                style={[androidFix, { fontSize: 11, lineHeight: 16 }]}
              >
                Talk to someone at Iron Lady
              </ILText>
            </ILText>
          </Pressable>
        </View>

        <View
          style={{
            marginTop: 24,
            borderRadius: 20,
            backgroundColor: DARK,
            padding: 20,
            overflow: 'hidden',
          }}
        >
          <View
            pointerEvents="none"
            style={{
              position: 'absolute',
              width: 144,
              height: 144,
              borderRadius: 72,
              right: -40,
              top: -40,
              backgroundColor: 'rgba(237,29,36,0.25)',
            }}
          />
          <ILText
            role="eyebrow"
            color={CTA}
            style={[androidFix, { fontSize: 10, lineHeight: 13, letterSpacing: 1.6 }]}
          >
            {vm.batchHeading}
          </ILText>
          <View style={{ marginTop: 10, gap: 10 }}>
            {vm.batchSessions.map((session, index) => (
              <BatchLine
                key={`${session.dayLabel}-${index}`}
                tag={session.dayLabel.replace('DAY ', 'Day ')}
                title={session.title}
                note={session.subtitle}
                last={index === vm.batchSessions.length - 1 && vm.batchSessions.length > 2}
              />
            ))}
          </View>
          <Pressable
            onPress={() => {
              const day1 = vm.batchSessions?.[0];
              if (day1?.placeholder || !day1?.dateIso) {
                Alert.alert('Calendar', 'Choose your batch date first to add sessions to your calendar.');
                return;
              }
              const clock = day1.title?.includes('·')
                ? day1.title.split('·').slice(1).join('·').trim()
                : '9:00 AM';
              Linking.openURL(day1CalendarUrl(day1.dateIso, clock)).catch(() => {
                Alert.alert('Calendar', 'Could not open your calendar app.');
              });
            }}
            style={({ pressed }) => ({
              marginTop: 12,
              width: '100%',
              paddingVertical: 10,
              borderRadius: 999,
              backgroundColor: 'rgba(255,255,255,0.10)',
              borderWidth: 1,
              borderColor: 'rgba(255,255,255,0.20)',
              alignItems: 'center',
              justifyContent: 'center',
              opacity: pressed ? 0.88 : 1,
            })}
          >
            <ILText role="label" color="#FFFFFF" style={{ fontSize: 13, lineHeight: 18 }}>
              Add all dates to calendar
            </ILText>
          </Pressable>
        </View>

        <Pressable
          onPress={finish}
          accessibilityRole="button"
          accessibilityLabel="Continue to my journey"
          style={({ pressed }) => ({
            marginTop: 24,
            width: '100%',
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'center',
            paddingVertical: 15,
            borderRadius: 999,
            backgroundColor: INK,
            opacity: pressed ? 0.9 : 1,
          })}
        >
          <ILText role="label" color="#FFFFFF" style={{ fontSize: 15, lineHeight: 20 }}>
            Continue to my journey
          </ILText>
          <MaterialIcons
            name="arrow-forward"
            size={18}
            color="#FFFFFF"
            style={{ marginLeft: 8 }}
          />
        </Pressable>
      </ScrollView>
    </View>
  );
}

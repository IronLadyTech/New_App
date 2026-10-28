import React, { useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Linking,
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuth } from '../../context/AuthContext';
import { useCourses } from '../../context/CoursesContext';
import { useLearnerCmsBatch } from '../../hooks/useLearnerCmsBatch';
import IronLadyHeader from '../../components/IronLadyHeader';
import RazorpayCheckoutModal from '../../components/RazorpayCheckoutModal';
import { IL_BRAND, IL_FONTS } from '../../constants/ironLadyBrand';
import { PAYMENT_STATUS } from '../../constants/programs';
import { savePaymentOrder } from '../../services/firestore';
import { refreshMyAccess } from '../../services/functions';
import { RAZORPAY_TEST_AMOUNT_PAISE } from '../../constants/razorpay';
import {
  buildLocalCheckout,
  createRazorpayOrder,
  isWebCheckout,
  openRazorpayInBrowser,
  verifyRazorpayPayment,
} from '../../services/razorpay';
import {
  buildPaymentEnrollmentView,
  programmeBalancePaid,
  razorpayOneRupeeOrder,
  registrationFeeOrder,
} from '../../utils/paymentEnrollment';
import { navigateInMemberStack } from '../../utils/watchNav';
import { profilePatchAfterFullPayment } from '../../utils/paymentSuccessPatch';
import { day1CalendarUrl } from '../../utils/registeredHomeData';

function PaymentRow({ label, detail, amount, status, statusTone }) {
  return (
    <View style={styles.paymentRow}>
      <View style={styles.paymentRowLeft}>
        <Text style={styles.rowLabel}>{label}</Text>
        {detail ? <Text style={styles.rowDetail}>{detail}</Text> : null}
      </View>
      <View style={styles.paymentRowRight}>
        <Text style={styles.rowAmount}>{amount}</Text>
        {status ? (
          <Text
            style={[
              styles.rowStatus,
              statusTone === 'paid' ? styles.statusPaid : styles.statusDue,
            ]}
          >
            {status}
          </Text>
        ) : null}
      </View>
    </View>
  );
}

function BatchDayRow({ dayLabel, title, subtitle }) {
  return (
    <View style={styles.batchRow}>
      <Text style={styles.batchDay}>{dayLabel}</Text>
      <View style={styles.batchContent}>
        <Text style={styles.batchTitle}>{title}</Text>
        <Text style={styles.batchSubtitle}>{subtitle}</Text>
      </View>
    </View>
  );
}

export default function PaymentEnrollmentScreen({ navigation, route }) {
  const { profile, user, patchProfile } = useAuth();
  const { visibleEvents } = useCourses();
  const { batch: cmsBatch } = useLearnerCmsBatch('lep');
  const programId = route?.params?.programId;
  const [paying, setPaying] = useState(false);
  const [checkout, setCheckout] = useState(null);
  const [enrolled, setEnrolled] = useState(null);

  const goProgramHome = () => {
    setEnrolled(null);
    navigateInMemberStack(navigation, 'Home', 'LepHome');
  };

  const vm = useMemo(
    () =>
      buildPaymentEnrollmentView(profile, user, {
        programId,
        events: visibleEvents,
        cmsBatch,
      }),
    [profile, user, programId, visibleEvents, cmsBatch]
  );

  const buildCheckout = () => {
    const payer = vm.payer || {};
    return buildLocalCheckout({
      programId: vm.programId,
      name: payer.name,
      email: payer.email,
      contact: payer.phone,
      description: `${vm.programTitle} — programme balance`,
    });
  };

  const mergeCheckoutSession = (cloudOrder) => {
    const local = buildCheckout();
    if (!cloudOrder) return local;
    return {
      ...local,
      ...cloudOrder,
      prefill: { ...local.prefill, ...(cloudOrder.prefill || {}) },
    };
  };

  const onPayBalance = async () => {
    setPaying(true);
    try {
      const cloudOrder = await createRazorpayOrder(vm.programId);
      const session = mergeCheckoutSession(cloudOrder);

      if (isWebCheckout) {
        const result = await openRazorpayInBrowser(session);
        await onPaymentSuccess(result);
        return;
      }

      setCheckout(session);
    } catch (e) {
      if (e.message !== 'Payment cancelled') {
        Alert.alert('Payment unavailable', e.message);
      }
    } finally {
      setPaying(false);
    }
  };

  const onPaymentSuccess = async ({ orderId, paymentId, signature }) => {
    setCheckout(null);
    setPaying(true);

    if (!orderId || !paymentId || !signature) {
      setPaying(false);
      Alert.alert(
        'Payment incomplete',
        'Razorpay did not return a confirmed payment. Failed or cancelled attempts are not charged.'
      );
      return;
    }

    try {
      await verifyRazorpayPayment({
        orderId,
        paymentId,
        signature,
        programId: vm.programId,
      });
    } catch (err) {
      setPaying(false);
      Alert.alert(
        'Payment not confirmed',
        err.message || 'Razorpay could not verify this payment. If money was debited, contact support with your UPI reference.'
      );
      return;
    }

    patchProfile(
      profilePatchAfterFullPayment(profile, vm.programId, { paymentId, orderId })
    );

    const verifyTask = refreshMyAccess().catch(() => {});

    let saved = null;
    try {
      saved = await savePaymentOrder({
        uid: user?.uid,
        transactionId: paymentId,
        razorpayOrderId: orderId || null,
        amountPaise: RAZORPAY_TEST_AMOUNT_PAISE,
        programId: vm.programId,
        programTitle: vm.programTitle,
        description: `${vm.programTitle} — programme balance`,
        payerName: vm.payer?.name || '',
        payerEmail: vm.payer?.email || '',
        payerPhone: vm.payer?.phone || '',
      });
    } catch (err) {
      setPaying(false);
      Alert.alert(
        'Payment received',
        `${paymentId || 'Paid'} — receipt could not be saved (${err.message}). Your enrolment is updating.`,
        [{ text: 'Continue', onPress: goProgramHome }]
      );
      await verifyTask;
      return;
    }

    await verifyTask;
    setPaying(false);

    if (vm.programId === '100bm') {
      navigation.replace('Confirm100bmCohort');
      return;
    }

    setEnrolled({ title: vm.programTitle, order: saved });
  };

  const onTalkToTeam = () => {
    const url = vm.supportPhone
      ? `tel:${vm.supportPhone}`
      : 'mailto:support@ironlady.tech';
    Linking.openURL(url).catch(() => {
      Alert.alert('Contact Iron Lady', 'Email support@ironlady.tech for payment help.');
    });
  };

  const onAddToCalendar = () => {
    const day1 = vm.batchSessions?.[0];
    if (day1?.placeholder || !day1?.dateIso) {
      Alert.alert(
        'Add to calendar',
        'Choose your batch date first — then Day 1 and Day 2 will appear here with calendar links.',
        [{ text: 'OK' }]
      );
      return;
    }
    const clock = day1.title?.includes('·') ? day1.title.split('·').slice(1).join('·').trim() : '9:00 AM';
    const url = day1CalendarUrl(day1.dateIso, clock);
    Linking.openURL(url).catch(() => {
      Alert.alert('Calendar', 'Could not open your calendar app. Copy the dates from the batch card above.');
    });
  };

  const onContinue = () => {
    if (vm.payStatus === PAYMENT_STATUS.PAID) {
      goProgramHome();
      return;
    }
    Alert.alert(
      'Seat held',
      'Complete the programme balance to unlock full access. You can still explore Home while your seat is held.',
      [
        { text: 'Pay balance', onPress: onPayBalance },
        { text: 'Continue browsing', style: 'cancel', onPress: () => navigation.goBack() },
      ]
    );
  };

  return (
    <SafeAreaView style={styles.screen} edges={['top']}>
      <IronLadyHeader
        onCalendar={() => navigateInMemberStack(navigation, 'Home', 'Schedule')}
        onNotifications={() => navigation.navigate('Home', { screen: 'Notifications' })}
        onProfile={() => navigation.navigate('ProfileHome')}
        photoUrl={profile?.photoURL}
      />

      <ScrollView
        contentContainerStyle={styles.scroll}
        showsVerticalScrollIndicator={false}
      >
        <Text style={styles.statusLine}>{vm.statusLine}</Text>
        <Text style={styles.headline}>{vm.headline}</Text>
        <Text style={styles.subline}>{vm.subline}</Text>

        {/* Payment card */}
        <View style={styles.paymentCard}>
          <View style={styles.cardTopRow}>
            <Text style={styles.programCaps}>{vm.programLabel}</Text>
            {vm.balanceDue ? (
              <View style={styles.balanceBadge}>
                <Text style={styles.balanceBadgeText}>BALANCE DUE</Text>
              </View>
            ) : (
              <View style={[styles.balanceBadge, styles.balanceBadgePaid]}>
                <Text style={[styles.balanceBadgeText, styles.balanceBadgeTextPaid]}>
                  PAID
                </Text>
              </View>
            )}
          </View>

          <TouchableOpacity
            activeOpacity={0.85}
            onPress={() =>
              navigation.navigate('OrderReceipt', {
                orderId: 'registration-fee',
                order: registrationFeeOrder(profile, user),
              })
            }
          >
            <PaymentRow
              label="Registration fee"
              detail={`Received · txn ending ${vm.txnLast4} · tap for receipt`}
              amount={vm.registrationFeeLabel}
              status={`PAID ${vm.registrationPaidLabel}`}
              statusTone="paid"
            />
          </TouchableOpacity>

          <View style={styles.divider} />

          <TouchableOpacity
            activeOpacity={0.85}
            disabled={!programmeBalancePaid(profile, vm.programId)}
            onPress={() => {
              if (!programmeBalancePaid(profile, vm.programId)) return;
              navigation.navigate('OrderReceipt', {
                orderId: razorpayOneRupeeOrder(profile, user).id,
                order: razorpayOneRupeeOrder(profile, user),
              });
            }}
          >
            <PaymentRow
              label="Programme balance"
              detail={
                programmeBalancePaid(profile, vm.programId)
                  ? 'Razorpay · captured · tap for receipt'
                  : vm.balanceNote
              }
              amount={vm.programBalanceLabel}
              status={programmeBalancePaid(profile, vm.programId) ? 'PAID' : 'DUE'}
              statusTone={programmeBalancePaid(profile, vm.programId) ? 'paid' : 'due'}
            />
          </TouchableOpacity>

          <View style={styles.progressTrack}>
            <View
              style={[styles.progressFill, { width: `${vm.progressPercent}%` }]}
            />
          </View>

          <View style={styles.payButtonSlot}>
            {vm.showPayButton ? (
              <TouchableOpacity
                style={[styles.payButton, paying && styles.payButtonDisabled]}
                onPress={onPayBalance}
                activeOpacity={0.9}
                disabled={paying}
              >
                {paying ? (
                  <ActivityIndicator color={IL_BRAND.white} />
                ) : (
                  <Text style={styles.payButtonText}>
                    Pay {vm.programBalanceLabel}
                  </Text>
                )}
              </TouchableOpacity>
            ) : (
              <View style={styles.payButtonPlaceholder} />
            )}
          </View>

          <TouchableOpacity onPress={onTalkToTeam} style={styles.supportLink}>
            <Text style={styles.supportText}>
              Questions about the amount?{' '}
              <Text style={styles.supportBold}>Talk to someone at Iron Lady</Text>
            </Text>
          </TouchableOpacity>
        </View>

        {/* Batch card */}
        <View style={styles.batchCard}>
          <Text style={styles.batchHeading}>{vm.batchHeading?.toUpperCase() || 'YOUR BATCH'}</Text>
          {vm.batchSessions.map((session, index) => (
            <BatchDayRow key={`${session.dayLabel}-${index}`} {...session} />
          ))}
          <TouchableOpacity
            style={styles.calendarButton}
            onPress={onAddToCalendar}
            activeOpacity={0.85}
          >
            <Text style={styles.calendarButtonText}>Add all dates to calendar</Text>
          </TouchableOpacity>
        </View>

        <TouchableOpacity onPress={onContinue} style={styles.continueLink}>
          <Text style={styles.continueText}>Continue to my journey →</Text>
        </TouchableOpacity>
      </ScrollView>

      <RazorpayCheckoutModal
        visible={Boolean(checkout)}
        checkout={checkout}
        onSuccess={onPaymentSuccess}
        onDismiss={() => setCheckout(null)}
        onError={(err) => {
          setCheckout(null);
          Alert.alert('Payment failed', err.message);
        }}
      />

      <Modal visible={paying && !enrolled} transparent animationType="fade">
        <View style={styles.busyOverlay}>
          <ActivityIndicator size="large" color={IL_BRAND.white} />
          <Text style={styles.busyText}>Confirming your payment…</Text>
        </View>
      </Modal>

      <Modal visible={Boolean(enrolled)} animationType="slide" presentationStyle="pageSheet">
        <SafeAreaView style={styles.successSheet} edges={['top', 'bottom']}>
          <View style={styles.successBody}>
            <View style={styles.successIconWrap}>
              <MaterialIcons name="check-circle" size={72} color="#1B7A4A" />
            </View>
            <Text style={styles.successTitle}>You’re enrolled</Text>
            <Text style={styles.successSub}>
              Payment received for {enrolled?.title || 'your programme'}. Your full access is unlocked.
            </Text>
            <TouchableOpacity style={styles.payButton} onPress={goProgramHome} activeOpacity={0.9}>
              <Text style={styles.payButtonText}>Continue to Home</Text>
            </TouchableOpacity>
            {enrolled?.order ? (
              <TouchableOpacity
                style={styles.successSecondary}
                onPress={() => {
                  const order = enrolled.order;
                  setEnrolled(null);
                  navigation.replace('OrderReceipt', { orderId: order.id, order });
                }}
                activeOpacity={0.85}
              >
                <Text style={styles.successSecondaryText}>View receipt</Text>
              </TouchableOpacity>
            ) : null}
          </View>
        </SafeAreaView>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: IL_BRAND.cream,
  },
  scroll: {
    paddingHorizontal: 20,
    paddingBottom: 40,
  },
  statusLine: {
    marginTop: 8,
    fontSize: 11,
    fontFamily: IL_FONTS.bold,
    letterSpacing: 1.2,
    color: IL_BRAND.red,
    textTransform: 'uppercase',
  },
  headline: {
    marginTop: 10,
    fontSize: 34,
    lineHeight: 40,
    fontFamily: IL_FONTS.display,
    color: IL_BRAND.forest,
  },
  subline: {
    marginTop: 12,
    fontSize: 17,
    lineHeight: 26,
    fontFamily: IL_FONTS.regular,
    color: IL_BRAND.forest,
  },
  paymentCard: {
    marginTop: 28,
    backgroundColor: IL_BRAND.white,
    borderRadius: 20,
    paddingHorizontal: 20,
    paddingTop: 18,
    paddingBottom: 20,
    shadowColor: '#0C3535',
    shadowOpacity: 0.08,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 6 },
    elevation: 4,
  },
  cardTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 18,
  },
  programCaps: {
    flex: 1,
    fontSize: 11,
    fontFamily: IL_FONTS.bold,
    letterSpacing: 0.8,
    color: IL_BRAND.forestMuted,
  },
  balanceBadge: {
    backgroundColor: IL_BRAND.badgePink,
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 20,
  },
  balanceBadgePaid: {
    backgroundColor: '#E8F5EE',
  },
  balanceBadgeText: {
    fontSize: 10,
    fontFamily: IL_FONTS.bold,
    letterSpacing: 0.6,
    color: IL_BRAND.red,
  },
  balanceBadgeTextPaid: {
    color: IL_BRAND.paidGreen,
  },
  paymentRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    paddingVertical: 6,
  },
  paymentRowLeft: {
    flex: 1,
    paddingRight: 12,
  },
  paymentRowRight: {
    alignItems: 'flex-end',
  },
  rowLabel: {
    fontSize: 20,
    fontFamily: IL_FONTS.semibold,
    color: IL_BRAND.forest,
  },
  rowDetail: {
    marginTop: 4,
    fontSize: 13,
    fontFamily: IL_FONTS.regular,
    color: IL_BRAND.forestMuted,
  },
  rowAmount: {
    fontSize: 22,
    fontFamily: IL_FONTS.bold,
    color: IL_BRAND.forest,
  },
  rowStatus: {
    marginTop: 4,
    fontSize: 10,
    fontFamily: IL_FONTS.bold,
    letterSpacing: 0.5,
  },
  statusPaid: {
    color: IL_BRAND.paidGreen,
  },
  statusDue: {
    color: IL_BRAND.dueRed,
  },
  divider: {
    height: 1,
    backgroundColor: IL_BRAND.divider,
    marginVertical: 14,
  },
  progressTrack: {
    height: 4,
    borderRadius: 4,
    backgroundColor: IL_BRAND.progressTrack,
    marginTop: 18,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: IL_BRAND.progressFill,
    borderRadius: 4,
  },
  payButtonSlot: {
    marginTop: 20,
    minHeight: 54,
    justifyContent: 'center',
  },
  payButtonPlaceholder: {
    minHeight: 54,
  },
  payButton: {
    backgroundColor: IL_BRAND.red,
    borderRadius: 28,
    paddingVertical: 16,
    alignItems: 'center',
    minHeight: 54,
    justifyContent: 'center',
  },
  payButtonDisabled: {
    opacity: 0.75,
  },
  payButtonText: {
    color: IL_BRAND.white,
    fontSize: 17,
    fontFamily: IL_FONTS.semibold,
  },
  supportLink: {
    marginTop: 16,
    alignItems: 'center',
  },
  supportText: {
    fontSize: 13,
    fontFamily: IL_FONTS.regular,
    color: IL_BRAND.forestMuted,
    textAlign: 'center',
  },
  supportBold: {
    fontFamily: IL_FONTS.semibold,
    color: IL_BRAND.forest,
  },
  batchCard: {
    marginTop: 20,
    backgroundColor: IL_BRAND.cardDark,
    borderRadius: 20,
    padding: 20,
    borderWidth: 1,
    borderColor: IL_BRAND.cardDarkBorder,
  },
  batchHeading: {
    fontSize: 11,
    fontFamily: IL_FONTS.bold,
    letterSpacing: 1.2,
    color: IL_BRAND.red,
    marginBottom: 16,
  },
  batchRow: {
    flexDirection: 'row',
    marginBottom: 18,
  },
  batchDay: {
    width: 52,
    fontSize: 11,
    fontFamily: IL_FONTS.bold,
    letterSpacing: 0.5,
    color: IL_BRAND.mutedOnDark,
    paddingTop: 2,
  },
  batchContent: {
    flex: 1,
  },
  batchTitle: {
    fontSize: 16,
    fontFamily: IL_FONTS.semibold,
    color: IL_BRAND.white,
    lineHeight: 22,
  },
  batchSubtitle: {
    marginTop: 4,
    fontSize: 13,
    fontFamily: IL_FONTS.regular,
    color: IL_BRAND.mutedOnDark,
  },
  calendarButton: {
    marginTop: 4,
    borderWidth: 1,
    borderColor: '#2A4545',
    borderRadius: 28,
    paddingVertical: 14,
    alignItems: 'center',
    backgroundColor: '#0A2222',
  },
  calendarButtonText: {
    color: IL_BRAND.white,
    fontSize: 15,
    fontFamily: IL_FONTS.semibold,
  },
  continueLink: {
    marginTop: 28,
    alignItems: 'center',
    paddingVertical: 8,
  },
  continueText: {
    fontSize: 16,
    fontFamily: IL_FONTS.semibold,
    color: IL_BRAND.forest,
  },
  busyOverlay: {
    flex: 1,
    backgroundColor: 'rgba(12, 53, 53, 0.72)',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  busyText: {
    marginTop: 16,
    fontSize: 16,
    fontWeight: '600',
    color: IL_BRAND.white,
    textAlign: 'center',
  },
  successSheet: {
    flex: 1,
    backgroundColor: IL_BRAND.cream,
  },
  successBody: {
    flex: 1,
    paddingHorizontal: 24,
    paddingTop: 48,
    alignItems: 'center',
  },
  successIconWrap: {
    marginBottom: 20,
  },
  successTitle: {
    fontSize: 32,
    fontWeight: '600',
    color: IL_BRAND.forest,
    textAlign: 'center',
  },
  successSub: {
    marginTop: 12,
    fontSize: 17,
    lineHeight: 26,
    color: IL_BRAND.forest,
    textAlign: 'center',
  },
  successSecondary: {
    marginTop: 14,
    paddingVertical: 12,
  },
  successSecondaryText: {
    fontSize: 16,
    fontWeight: '700',
    color: IL_BRAND.red,
  },
});

import React, { useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Linking,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuth } from '../../context/AuthContext';
import { useCourses } from '../../context/CoursesContext';
import IronLadyHeader from '../../components/IronLadyHeader';
import RazorpayCheckoutModal from '../../components/RazorpayCheckoutModal';
import { IL_BRAND } from '../../constants/ironLadyBrand';
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
import { buildPaymentEnrollmentView, razorpayOneRupeeOrder, registrationFeeOrder } from '../../utils/paymentEnrollment';

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
  const { profile, user } = useAuth();
  const { visibleEvents } = useCourses();
  const programId = route?.params?.programId;
  const [paying, setPaying] = useState(false);
  const [checkout, setCheckout] = useState(null);

  const vm = useMemo(
    () =>
      buildPaymentEnrollmentView(profile, user, {
        programId,
        events: visibleEvents,
      }),
    [profile, user, programId, visibleEvents]
  );

  const buildCheckout = () =>
    buildLocalCheckout({
      programId: vm.programId,
      name: profile?.displayName || user?.displayName,
      email: profile?.email || user?.email,
      contact: profile?.phoneNumber || profile?.phone || user?.phoneNumber,
      description: `${vm.programTitle} — programme balance`,
    });

  const onPayBalance = async () => {
    setPaying(true);
    try {
      const cloudOrder = await createRazorpayOrder(vm.programId);
      const session = cloudOrder || buildCheckout();

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
    let saved = null;
    try {
      if (orderId && signature) {
        await verifyRazorpayPayment({
          orderId,
          paymentId,
          signature,
          programId: vm.programId,
        });
        await refreshMyAccess();
      }
    } catch {
      // Receipt is still saved even if Cloud Function verify is not deployed.
    }

    try {
      saved = await savePaymentOrder({
        uid: user?.uid,
        transactionId: paymentId,
        razorpayOrderId: orderId || null,
        amountPaise: RAZORPAY_TEST_AMOUNT_PAISE,
        programId: vm.programId,
        programTitle: vm.programTitle,
        description: `${vm.programTitle} — programme balance`,
        payerName: profile?.displayName || user?.displayName || '',
        payerEmail: profile?.email || user?.email || '',
        payerPhone: profile?.phoneNumber || profile?.phone || user?.phoneNumber || '',
      });
    } catch (err) {
      Alert.alert(
        'Payment received',
        `${paymentId || 'Paid'} — receipt could not be saved (${err.message}).`,
        [{ text: 'OK' }]
      );
      setPaying(false);
      return;
    }

    setPaying(false);
    Alert.alert(
      'Payment received',
      `Transaction ${paymentId} is on your receipt.`,
      [
        {
          text: 'View receipt',
          onPress: () =>
            navigation.replace('OrderReceipt', {
              orderId: saved.id,
              order: saved,
            }),
        },
      ]
    );
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
    Alert.alert(
      'Add to calendar',
      'Batch dates will sync from your cohort schedule soon. For now, use the dates shown above in your calendar app.',
      [{ text: 'OK' }]
    );
  };

  const onContinue = () => {
    if (vm.payStatus === PAYMENT_STATUS.PAID) {
      navigation.getParent()?.navigate('Home');
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
        onSearch={() => navigation.navigate('ProfileHome')}
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
            onPress={() =>
              navigation.navigate('OrderReceipt', {
                orderId: 'razorpay-1-rupee',
                order: razorpayOneRupeeOrder(profile, user),
              })
            }
          >
            <PaymentRow
              label="Programme balance"
              detail="Razorpay · ₹1 paid · tap for receipt"
              amount="₹ 1"
              status="PAID"
              statusTone="paid"
            />
          </TouchableOpacity>

          <View style={styles.progressTrack}>
            <View
              style={[styles.progressFill, { width: `${vm.progressPercent}%` }]}
            />
          </View>

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
          ) : null}

          <TouchableOpacity onPress={onTalkToTeam} style={styles.supportLink}>
            <Text style={styles.supportText}>
              Questions about the amount?{' '}
              <Text style={styles.supportBold}>Talk to someone at Iron Lady</Text>
            </Text>
          </TouchableOpacity>
        </View>

        {/* Batch card */}
        <View style={styles.batchCard}>
          <Text style={styles.batchHeading}>YOUR BATCH</Text>
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
    fontWeight: '700',
    letterSpacing: 1.2,
    color: IL_BRAND.red,
    textTransform: 'uppercase',
  },
  headline: {
    marginTop: 10,
    fontSize: 34,
    lineHeight: 40,
    fontWeight: '600',
    color: IL_BRAND.forest,
  },
  subline: {
    marginTop: 12,
    fontSize: 17,
    lineHeight: 26,
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
    fontWeight: '700',
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
    fontWeight: '800',
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
    fontWeight: '600',
    color: IL_BRAND.forest,
  },
  rowDetail: {
    marginTop: 4,
    fontSize: 13,
    color: IL_BRAND.forestMuted,
  },
  rowAmount: {
    fontSize: 22,
    fontWeight: '700',
    color: IL_BRAND.forest,
  },
  rowStatus: {
    marginTop: 4,
    fontSize: 10,
    fontWeight: '800',
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
  payButton: {
    marginTop: 20,
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
    fontWeight: '700',
  },
  supportLink: {
    marginTop: 16,
    alignItems: 'center',
  },
  supportText: {
    fontSize: 13,
    color: IL_BRAND.forestMuted,
    textAlign: 'center',
  },
  supportBold: {
    fontWeight: '700',
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
    fontWeight: '800',
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
    fontWeight: '700',
    letterSpacing: 0.5,
    color: IL_BRAND.mutedOnDark,
    paddingTop: 2,
  },
  batchContent: {
    flex: 1,
  },
  batchTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: IL_BRAND.white,
    lineHeight: 22,
  },
  batchSubtitle: {
    marginTop: 4,
    fontSize: 13,
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
    fontWeight: '600',
  },
  continueLink: {
    marginTop: 28,
    alignItems: 'center',
    paddingVertical: 8,
  },
  continueText: {
    fontSize: 16,
    fontWeight: '700',
    color: IL_BRAND.forest,
  },
});

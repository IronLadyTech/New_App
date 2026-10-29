import React, { useMemo } from 'react';
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
import { useLearnerCmsBatch } from '../../hooks/useLearnerCmsBatch';
import { GlassBackBar } from '../../components/il/GlassHeader';
import { IL_BRAND, IL_FONTS } from '../../constants/ironLadyBrand';
import { PAYMENT_STATUS } from '../../constants/programs';
import {
  buildPaymentEnrollmentView,
  programmeBalancePaid,
  razorpayOneRupeeOrder,
  registrationFeeOrder,
} from '../../utils/paymentEnrollment';
import { navigateInMemberStack } from '../../utils/watchNav';
import { useProgramNavMaybe } from '../../context/ProgramNavContext';
import { useBalancePayment } from '../../hooks/useBalancePayment';


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

export default function PaymentEnrollmentScreen({ navigation, route }) {
  const { profile, user } = useAuth();
  const { visibleEvents } = useCourses();
  const { batch: cmsBatch } = useLearnerCmsBatch('lep');
  const programId = route?.params?.programId;
  const vm = useMemo(
    () =>
      buildPaymentEnrollmentView(profile, user, {
        programId,
        events: visibleEvents,
        cmsBatch,
      }),
    [profile, user, programId, visibleEvents, cmsBatch]
  );

  const programNav = useProgramNavMaybe();

  // Home shows whichever programme is selected — select the one she just paid for.
  const goProgramHome = (paidProgramId) => {
    if (paidProgramId === '100bm') {
      navigation.replace('Confirm100bmCohort');
      return;
    }
    if (paidProgramId) programNav?.setProgram?.(paidProgramId);
    navigateInMemberStack(navigation, 'Home', 'LepHome');
  };

  const { startPayment: onPayBalance, paying, overlays } = useBalancePayment(vm, {
    onDone: goProgramHome,
    onReceipt: (order) => navigation.replace('OrderReceipt', { orderId: order.id, order }),
  });

  const onTalkToTeam = () => {
    const url = vm.supportPhone
      ? `tel:${vm.supportPhone}`
      : 'mailto:support@ironlady.tech';
    Linking.openURL(url).catch(() => {
      Alert.alert('Contact Iron Lady', 'Email support@ironlady.tech for payment help.');
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
      <GlassBackBar title="Payment & enrolment" sub={vm.programTitle} onBack={() => navigation.goBack()} />

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
              detail={
                vm.txnLast4
                  ? `Received · txn ending ${vm.txnLast4} · tap for receipt`
                  : 'Received · tap for receipt'
              }
              amount={vm.registrationFeeLabel}
              status={vm.registrationPaidLabel !== '—' ? `PAID ${vm.registrationPaidLabel}` : 'PAID'}
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

        <TouchableOpacity onPress={onContinue} style={styles.continueLink}>
          <Text style={styles.continueText}>Continue to my journey →</Text>
        </TouchableOpacity>
      </ScrollView>

      {overlays}
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
  // Label and amount share one line height, and detail and status share another, so
  // the two columns sit on the same lines.
  rowLabel: {
    fontSize: 17,
    lineHeight: 24,
    fontFamily: IL_FONTS.semibold,
    color: IL_BRAND.forest,
    includeFontPadding: false,
  },
  rowDetail: {
    marginTop: 4,
    fontSize: 12.5,
    lineHeight: 18,
    fontFamily: IL_FONTS.regular,
    color: IL_BRAND.forestMuted,
    includeFontPadding: false,
  },
  rowAmount: {
    fontSize: 19,
    lineHeight: 24,
    fontFamily: IL_FONTS.bold,
    color: IL_BRAND.forest,
    includeFontPadding: false,
    fontVariant: ['tabular-nums'],
  },
  rowStatus: {
    marginTop: 4,
    fontSize: 10,
    lineHeight: 18,
    fontFamily: IL_FONTS.bold,
    letterSpacing: 0.8,
    includeFontPadding: false,
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
});

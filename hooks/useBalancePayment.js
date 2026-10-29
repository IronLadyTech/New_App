import React, { useState } from 'react';
import { ActivityIndicator, Modal, StyleSheet, Text, View } from 'react-native';
import { useAuth } from '../context/AuthContext';
import RazorpayCheckoutModal from '../components/RazorpayCheckoutModal';
import PaymentSuccessView from '../components/payment/PaymentSuccessView';
import { IL_BRAND, IL_FONTS } from '../constants/ironLadyBrand';
import { RAZORPAY_TEST_AMOUNT_PAISE } from '../constants/razorpay';
import { savePaymentOrder } from '../services/firestore';
import { refreshMyAccess } from '../services/functions';
import {
  buildLocalCheckout,
  createRazorpayOrder,
  isWebCheckout,
  openRazorpayInBrowser,
  verifyRazorpayPayment,
} from '../services/razorpay';
import { profilePatchAfterFullPayment } from '../utils/paymentSuccessPatch';
import { showAlert } from '../utils/showAlert';

const NEXT_STEP_LABEL = {
  lep: 'Taking you to your LEP home…',
  mbw: 'Taking you to your MBW home…',
  '100bm': 'Next: confirm your 100BM cohort…',
};

/**
 * Programme-balance payment through Razorpay, shared by the Profile payment page and the
 * Seat-held screen after batch selection: order → checkout → server verify → receipt →
 * the success tick, then `onDone(programId)` takes her to the page the payment opened.
 *
 * `vm` is buildPaymentEnrollmentView(). Render `overlays` once, anywhere in the screen.
 */
export function useBalancePayment(vm, { onDone, onReceipt } = {}) {
  const { profile, user, patchProfile } = useAuth();
  const [paying, setPaying] = useState(false);
  const [checkout, setCheckout] = useState(null);
  const [enrolled, setEnrolled] = useState(null);

  const checkoutSession = (cloudOrder) => {
    const payer = vm.payer || {};
    const local = buildLocalCheckout({
      programId: vm.programId,
      name: payer.name,
      email: payer.email,
      contact: payer.phone,
      description: `${vm.programTitle} — programme balance`,
    });
    if (!cloudOrder) return local;
    return { ...local, ...cloudOrder, prefill: { ...local.prefill, ...(cloudOrder.prefill || {}) } };
  };

  const onPaymentSuccess = async ({ orderId, paymentId, signature }) => {
    setCheckout(null);
    setPaying(true);

    if (!orderId || !paymentId || !signature) {
      setPaying(false);
      showAlert(
        'Payment incomplete',
        'Razorpay did not return a confirmed payment. Failed or cancelled attempts are not charged.'
      );
      return;
    }

    try {
      await verifyRazorpayPayment({ orderId, paymentId, signature, programId: vm.programId });
    } catch (err) {
      setPaying(false);
      showAlert(
        'Payment not confirmed',
        err.message ||
          'Razorpay could not verify this payment. If money was debited, contact support with your UPI reference.'
      );
      return;
    }

    patchProfile(profilePatchAfterFullPayment(profile, vm.programId, { paymentId, orderId }));
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
      // The server has already verified the payment — only the receipt copy failed.
      // She still gets the success page; the receipt list falls back to the Razorpay record.
      console.warn('savePaymentOrder failed:', err?.message);
    }

    await verifyTask;
    setPaying(false);
    setEnrolled({
      title: vm.programTitle,
      programId: vm.programId,
      order: saved,
      amountRupees: RAZORPAY_TEST_AMOUNT_PAISE / 100,
      reference: paymentId,
    });
  };

  const startPayment = async () => {
    if (paying) return;
    setPaying(true);
    try {
      const session = checkoutSession(await createRazorpayOrder(vm.programId));
      if (isWebCheckout) {
        await onPaymentSuccess(await openRazorpayInBrowser(session));
        return;
      }
      setCheckout(session);
    } catch (e) {
      if (e.message !== 'Payment cancelled') showAlert('Payment unavailable', e.message);
    } finally {
      setPaying(false);
    }
  };

  const finish = () => {
    const programId = enrolled?.programId;
    setEnrolled(null);
    onDone?.(programId);
  };

  const overlays = (
    <>
      <RazorpayCheckoutModal
        visible={Boolean(checkout)}
        checkout={checkout}
        onSuccess={onPaymentSuccess}
        onDismiss={() => setCheckout(null)}
        onError={(err) => {
          setCheckout(null);
          showAlert('Payment failed', err.message);
        }}
      />

      <Modal visible={paying && !enrolled && !checkout} transparent animationType="fade">
        <View style={styles.busyOverlay}>
          <ActivityIndicator size="large" color={IL_BRAND.white} />
          <Text style={styles.busyText}>Confirming your payment…</Text>
        </View>
      </Modal>

      <Modal visible={Boolean(enrolled)} animationType="fade" onRequestClose={finish}>
        {enrolled ? (
          <PaymentSuccessView
            amountLabel={`₹ ${Number(enrolled.amountRupees || 0).toLocaleString('en-IN')}`}
            programTitle={enrolled.title}
            reference={enrolled.reference}
            statusChip="Enrolled · full access unlocked"
            nextLabel={NEXT_STEP_LABEL[enrolled.programId] || 'Taking you to your programme…'}
            onNext={finish}
            onReceipt={
              enrolled.order && onReceipt
                ? () => {
                    const order = enrolled.order;
                    setEnrolled(null);
                    onReceipt(order);
                  }
                : null
            }
          />
        ) : null}
      </Modal>
    </>
  );

  return { startPayment, paying, overlays };
}

const styles = StyleSheet.create({
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
    fontFamily: IL_FONTS.semibold,
    color: IL_BRAND.white,
    textAlign: 'center',
  },
});

import { PAYMENT_STATUS } from '../constants/programs';

/** Optimistic profile patch after Razorpay success — stops home/profile flicker while Zoho syncs. */
export function profilePatchAfterFullPayment(profile, programId, { paymentId, orderId } = {}) {
  const id = programId || 'lep';
  const prev = profile?.programAccess?.[id] || {};
  const now = new Date().toISOString();
  return {
    paymentStatus: PAYMENT_STATUS.PAID,
    programAccess: {
      ...(profile?.programAccess || {}),
      [id]: {
        ...prev,
        paymentStatus: PAYMENT_STATUS.PAID,
        fullPaidAt: prev.fullPaidAt || now,
        ...(paymentId ? { razorpayPaymentId: paymentId } : {}),
        ...(orderId ? { razorpayOrderId: orderId } : {}),
      },
    },
  };
}

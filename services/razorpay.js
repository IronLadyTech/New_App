import { Platform } from 'react-native';
import { httpsCallable } from 'firebase/functions';
import { functions } from './firebase';
import { formatCallableError } from './functions';
import { RAZORPAY_KEY_ID, RAZORPAY_TEST_AMOUNT_PAISE } from '../constants/razorpay';

export function buildLocalCheckout({ programId, name, email, contact, description }) {
  return {
    keyId: RAZORPAY_KEY_ID,
    amount: RAZORPAY_TEST_AMOUNT_PAISE,
    currency: 'INR',
    name: 'Iron Lady',
    description: description || 'Programme balance — ₹1',
    programId,
    prefill: {
      name: name || '',
      email: email || '',
      contact: contact || '',
    },
    theme: { color: '#E8272A' },
  };
}

export async function createRazorpayOrder(programId) {
  try {
    const { data } = await httpsCallable(functions, 'createRazorpayOrder')({
      programId,
    });
    if (data?.orderId && data?.keyId) return data;
  } catch {
    // Functions not deployed — open checkout with public key only.
  }
  return null;
}

export async function verifyRazorpayPayment({
  orderId,
  paymentId,
  signature,
  programId,
}) {
  try {
    const { data } = await httpsCallable(functions, 'verifyRazorpayPayment')({
      orderId,
      paymentId,
      signature,
      programId,
    });
    return data;
  } catch (err) {
    throw new Error(formatCallableError(err, 'Payment verification failed.'));
  }
}

function loadRazorpayScript() {
  if (typeof document === 'undefined') {
    return Promise.reject(new Error('Razorpay needs a browser window.'));
  }
  if (window.Razorpay) return Promise.resolve(window.Razorpay);
  return new Promise((resolve, reject) => {
    const existing = document.querySelector('script[data-razorpay="1"]');
    if (existing) {
      existing.addEventListener('load', () => resolve(window.Razorpay));
      return;
    }
    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.async = true;
    script.dataset.razorpay = '1';
    script.onload = () => resolve(window.Razorpay);
    script.onerror = () => reject(new Error('Could not load Razorpay checkout.'));
    document.body.appendChild(script);
  });
}

/** Opens Razorpay in the current browser tab (web). */
export async function openRazorpayInBrowser(checkout) {
  const Razorpay = await loadRazorpayScript();
  return new Promise((resolve, reject) => {
    const options = {
      key: checkout.keyId,
      amount: checkout.amount,
      currency: checkout.currency || 'INR',
      name: checkout.name || 'Iron Lady',
      description: checkout.description || 'Programme balance',
      prefill: checkout.prefill || {},
      theme: checkout.theme || { color: '#E8272A' },
      modal: {
        ondismiss: () => reject(new Error('Payment cancelled')),
      },
      handler: (response) => {
        resolve({
          orderId: response.razorpay_order_id,
          paymentId: response.razorpay_payment_id,
          signature: response.razorpay_signature,
        });
      },
    };
    if (checkout.orderId) options.order_id = checkout.orderId;
    const rzp = new Razorpay(options);
    rzp.on('payment.failed', (resp) => {
      reject(new Error(resp?.error?.description || 'Payment failed'));
    });
    rzp.open();
  });
}

export const isWebCheckout = Platform.OS === 'web';

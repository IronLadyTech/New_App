import { Platform } from 'react-native';

/**
 * Phone sign-in OTP channel (one active at a time).
 *
 * - firebase — Firebase Auth SMS (default for production builds)
 * - whatsapp — Meta WhatsApp via il-guide-api (EXPO_PUBLIC_WHATSAPP_OTP=true)
 * - demo — on-screen code + custom token (local QA only)
 *
 * Web defaults to demo (no SMS reCAPTCHA WebView); set EXPO_PUBLIC_PHONE_OTP=firebase to override.
 */
const defaultMode = Platform.OS === 'web' ? 'demo' : 'firebase';
const raw = String(process.env.EXPO_PUBLIC_PHONE_OTP || defaultMode).toLowerCase();

export const PHONE_OTP_MODE =
  raw === 'whatsapp' && process.env.EXPO_PUBLIC_WHATSAPP_OTP === 'true'
    ? 'whatsapp'
    : raw === 'demo'
      ? 'demo'
      : raw === 'whatsapp'
        ? 'demo'
        : 'firebase';

export const USE_WHATSAPP_OTP = PHONE_OTP_MODE === 'whatsapp';
export const USE_FIREBASE_PHONE_OTP = PHONE_OTP_MODE === 'firebase';
export const USE_DEMO_PHONE_OTP = PHONE_OTP_MODE === 'demo';

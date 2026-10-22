/**
 * App guests (no program seat): remember the verified number and guest type on the
 * device, register her name (creates her Zoho Lead when the number was not in Zoho),
 * and report visits and challenge progress for the CMS guest list.
 * Every call is fire-and-forget — a guest is never blocked by tracking.
 */
import AsyncStorage from '@react-native-async-storage/async-storage';
import { httpsCallable } from 'firebase/functions';
import { functions } from './firebase';

const PHONE_KEY = 'il_guest_phone';
const TIER_KEY = 'il_guest_tier';
const OPEN_GAP_MS = 30 * 60 * 1000;
let lastOpenAt = 0;

export async function saveGuestIdentity({ phone, tier }) {
  try {
    if (phone) await AsyncStorage.setItem(PHONE_KEY, String(phone));
    await AsyncStorage.setItem(TIER_KEY, tier === 'mc' ? 'mc' : 'explore');
  } catch {
    // device storage unavailable — tracking just stays off
  }
}

/** { phone, tier } — tier 'mc' means Masterclass recordings are unlocked. */
export async function getGuestIdentity() {
  try {
    const [phone, tier] = await Promise.all([AsyncStorage.getItem(PHONE_KEY), AsyncStorage.getItem(TIER_KEY)]);
    return { phone: phone || null, tier: tier === 'mc' ? 'mc' : 'explore' };
  } catch {
    return { phone: null, tier: 'explore' };
  }
}

/** She typed her name on the guest start screen. */
export async function registerGuestName(name) {
  const { phone } = await getGuestIdentity();
  if (!phone) return;
  httpsCallable(functions, 'registerAppGuest')({ phone, name: String(name || '').trim() }).catch(() => {});
}

/** event: 'open' | 'challenge-start' | 'challenge-day' | 'challenge-done' | 'recording' */
export async function trackGuest(event, extra = {}) {
  if (event === 'open') {
    if (Date.now() - lastOpenAt < OPEN_GAP_MS) return;
    lastOpenAt = Date.now();
  }
  const { phone } = await getGuestIdentity();
  if (!phone) return;
  httpsCallable(functions, 'trackAppGuest')({ phone, event, ...extra }).catch(() => {});
}

import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { GUEST_PREVIEW } from '../utils/guestPreview';
import { subscribeToAuth, fetchUserProfile, logOut as authLogOut } from '../services/auth';
import { subscribeToUser } from '../services/firestore';
import {
  mergeProgramAccessPreservingPayment,
  mergeWelcomeProfilePreserving,
} from '../utils/programAccess';
import { PAYMENT_STATUS } from '../constants/programs';
import { devToolsEnabled } from '../utils/devToolsEnabled';
import { useChangeProbe } from '../utils/perfHud';
import { Timestamp } from 'firebase/firestore';
import { resolvePhoneAccess } from '../services/functions';

/**
 * Her last profile, kept on the phone: on the next open the app shows her own screen at once
 * (like other apps) and refreshes it from the server in the background — no sign-in screen
 * flash and no "Loading…" on every open. Timestamps are stored as { __ts: ms } and rebuilt.
 */
const PROFILE_CACHE_KEY = 'il_profile_cache_v1';
/** The guest's verified number (services/appGuest.js) — present only after a real OTP. */
const GUEST_PHONE_KEY = 'il_guest_phone';
/** A guest whose number gets a programme later (enrolled in Zoho) is sent to sign-in with it. */
export const LOGIN_PHONE_KEY = 'il_login_phone';
const GUEST_RECHECK_KEY = 'il_guest_recheck_at';
const GUEST_RECHECK_MS = 60 * 60 * 1000;

/**
 * Guest mode is kept on the phone, so she is never asked for the code again — but then a guest
 * who is enrolled later (or whose Zoho record is fixed) stayed a guest for good. At most once an
 * hour, ask the server about her number; true when it now has a programme seat.
 */
async function guestNowHasSeat(phone) {
  try {
    const last = Number(await AsyncStorage.getItem(GUEST_RECHECK_KEY)) || 0;
    if (Date.now() - last < GUEST_RECHECK_MS) return false;
    await AsyncStorage.setItem(GUEST_RECHECK_KEY, String(Date.now()));
    const access = await resolvePhoneAccess(phone);
    return Boolean(access && access.ok !== false && !access.guest);
  } catch {
    return false; // offline or server busy: she stays a guest, checked again next hour
  }
}

function encodeForCache(v) {
  if (v == null || typeof v !== 'object') return v;
  if (typeof v.toMillis === 'function') return { __ts: v.toMillis() };
  if (v instanceof Date) return { __ts: v.getTime() };
  if (Array.isArray(v)) return v.map(encodeForCache);
  const out = {};
  for (const [k, x] of Object.entries(v)) out[k] = encodeForCache(x);
  return out;
}

function decodeFromCache(v) {
  if (v == null || typeof v !== 'object') return v;
  if (typeof v.__ts === 'number' && Object.keys(v).length === 1) return Timestamp.fromMillis(v.__ts);
  if (Array.isArray(v)) return v.map(decodeFromCache);
  const out = {};
  for (const [k, x] of Object.entries(v)) out[k] = decodeFromCache(x);
  return out;
}

function readProfileCache() {
  return AsyncStorage.getItem(PROFILE_CACHE_KEY)
    .then((raw) => (raw ? JSON.parse(raw) : null))
    .catch(() => null);
}

const GUEST_KEY = 'il_guest_mode';
const LAB_LEP_KEY = 'il_lab_lep';
const LAB_JOURNEY_KEY = 'il_lab_journey';
const DEMO_KEY = 'il_demo';
const AuthContext = createContext(null);

/**
 * CMS preview: /admin shows the real app in a phone frame at
 * /?cmsPreview=1&program=lep&state=registered|enrolled&batch=<cms_batches id>&late=1.
 * Kept in memory only — never written to storage, so it cannot stick to a real session,
 * and the signed-in staff login does not end it.
 */
function readCmsPreview() {
  if (typeof window === 'undefined' || !window.location?.search) return null;
  try {
    const q = new URLSearchParams(window.location.search);
    if (q.get('cmsPreview') !== '1') return null;
    const program = ['lep', '100bm', 'mbw'].includes(q.get('program')) ? q.get('program') : 'lep';
    // &go=sessions|task|engage|learn (+ &task=<id>): open where the item CX just saved shows.
    const to = ['sessions', 'task', 'engage', 'learn'].includes(q.get('go')) ? q.get('go') : null;
    const previewGo = to && (to !== 'task' || q.get('task')) ? { to, programId: program, taskId: q.get('task') || '' } : null;
    return {
      previewGo,
      program,
      state: q.get('state') === 'enrolled' ? 'enrolled' : 'registered',
      regStatus: null,
      cmsBatchId: q.get('batch') || null,
      late: q.get('late') === '1',
      cmsPreview: true,
    };
  } catch {
    return null;
  }
}

const CMS_PREVIEW = GUEST_PREVIEW ? null : readCmsPreview();

function parseLabJourney(raw, legacyLep) {
  if (raw) {
    try {
      const v = JSON.parse(raw);
      if (v?.program && v?.state) {
        const regStatus = ['enroll', 'batch', 'prework', 'ready'].includes(v.regStatus) ? v.regStatus : null;
        return { program: v.program, state: v.state, regStatus };
      }
    } catch {
      /* ignore */
    }
  }
  if (legacyLep === 'enrolled' || legacyLep === 'registered') {
    return { program: 'lep', state: legacyLep };
  }
  return null;
}

function labProfile({ program, state, regStatus, cmsBatchId, late, cmsPreview }) {
  const enrolled = state === 'enrolled';
  const pay = enrolled ? 'paid' : 'register';
  if (cmsPreview) {
    // A finished-onboarding learner of the chosen batch, so the preview opens on Home.
    return {
      displayName: 'Ananya Rao',
      firstName: 'Ananya',
      role: 'student',
      program,
      programs: [program],
      paymentStatus: pay,
      programAccess: { [program]: { paymentStatus: pay, batchId: cmsBatchId || undefined, joinedLate: late || undefined } },
      ilGuideOnboarded: true,
      welcomeCompletedAt: 'cms-preview',
      labProgram: program,
      labState: state,
      labLep: program === 'lep' ? state : undefined,
      cmsPreview: true,
    };
  }
  return {
    displayName: 'Ananya Rao',
    firstName: 'Ananya',
    program,
    programs: [program],
    paymentStatus: pay,
    programAccess: { [program]: { paymentStatus: pay } },
    ilGuideOnboarded: enrolled,
    welcomeCompletedAt: enrolled ? 'lab-enrolled' : null,
    labProgram: program,
    labState: state,
    labLep: program === 'lep' ? state : undefined,
    labRegStatus: regStatus || null,
  };
}

const PREVIEW_PROFILE = {
  displayName: 'Ananya',
  role: 'student',
  ilGuideOnboarded: true,
  programs: ['lep', '100bm', 'mbw'],
  programAccess: {
    lep: { paymentStatus: 'paid' },
    '100bm': { paymentStatus: 'register' },
    mbw: { paymentStatus: 'register' },
  },
};

/** Fields servers stamp on every sync; a change in only these is not a change she can see. */
const SYNC_STAMP_KEYS = new Set([
  'updatedAt',
  'lastActiveAt',
  'lastSeenAt',
  'lastActivityAt',
  'zohoEntitlementsSyncedAt',
  'zohoWriteOrigin',
  'zohoWriteOriginAt',
  'zohoSyncedAt',
]);

/**
 * Same JSON for the same content whatever the key order: a profile patched on the phone and the
 * server's copy of it list keys in a different order, so the server echo after every save used to
 * count as a change and redraw the whole app a second time.
 */
function visibleJson(profile) {
  try {
    return JSON.stringify(profile, (key, value) => {
      if (SYNC_STAMP_KEYS.has(key)) return undefined;
      if (!value || typeof value !== 'object' || Array.isArray(value)) return value;
      if (typeof value.toMillis === 'function') return { __ts: value.toMillis() };
      const sorted = {};
      Object.keys(value)
        .sort()
        .forEach((k) => {
          sorted[k] = value[k];
        });
      return sorted;
    });
  } catch {
    return null;
  }
}

function sameVisibleProfile(prev, next) {
  if (!prev || !next) return false;
  const a = visibleJson(prev);
  return a !== null && a === visibleJson(next);
}

export function AuthProvider({ children }) {
  const [firebaseUser, setFirebaseUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [guestMode, setGuestMode] = useState(false);
  const [labJourney, setLabJourney] = useState(CMS_PREVIEW);
  // Set when a flow was opened from the journey picker, so the demo flow bar shows.
  const [demo, setDemo] = useState(false);
  // Sign-in screen the demo flow bar jumped to (null = start at phone login).
  const [authEntry, setAuthEntry] = useState(null);
  const [preview, setPreview] = useState(false);
  const previewRef = useRef(false);
  const onboardedRef = useRef(false);
  const [initializing, setInitializing] = useState(true);
  // The server's copy of her profile has arrived (not only the copy kept on the phone). Steps that
  // decide from what is missing (welcome, batch) wait for it: a stale phone copy opened them again.
  const [profileFresh, setProfileFresh] = useState(false);
  const [error, setError] = useState(null);

  // Read at once on launch, while Firebase restores her sign-in.
  const cacheRef = useRef(null);
  if (!cacheRef.current) cacheRef.current = readProfileCache();

  useEffect(() => {
    let cancelled = false;
    // Safety net only: a signed-out phone hears from Firebase in a moment. (At 400 ms the sign-in
    // screen used to flash before Firebase had restored a signed-in learner.)
    const failOpen = setTimeout(() => {
      if (!cancelled) setInitializing(false);
    }, 3000);

    const storageRead = Promise.all([
      AsyncStorage.getItem(GUEST_KEY),
      AsyncStorage.getItem(LAB_JOURNEY_KEY),
      AsyncStorage.getItem(LAB_LEP_KEY),
      AsyncStorage.getItem(DEMO_KEY),
      AsyncStorage.getItem(GUEST_PHONE_KEY),
    ])
      .then(([guest, journey, legacyLep, demoFlag, guestPhone]) => {
        if (cancelled || CMS_PREVIEW) return;
        if (!devToolsEnabled()) {
          // Real app: drop testing journeys, but a guest who verified her number stays a guest —
          // she used to be sent back to phone + OTP on every open.
          AsyncStorage.multiRemove([LAB_LEP_KEY, LAB_JOURNEY_KEY, DEMO_KEY]).catch(() => {});
          const realGuest = guest === '1' && demoFlag !== '1' && Boolean(guestPhone);
          if (realGuest) {
            setGuestMode(true);
            guestNowHasSeat(guestPhone).then(async (seated) => {
              if (!seated || cancelled) return;
              // Her programme is ready: sign-in, number filled in; the SMS still proves it is her.
              await AsyncStorage.setItem(LOGIN_PHONE_KEY, String(guestPhone)).catch(() => {});
              await AsyncStorage.multiRemove([GUEST_KEY, GUEST_RECHECK_KEY]).catch(() => {});
              setGuestMode(false);
            });
          } else AsyncStorage.removeItem(GUEST_KEY).catch(() => {});
          return;
        }
        const lab = parseLabJourney(journey, legacyLep);
        setLabJourney(lab);
        setGuestMode(guest === '1' && !lab);
        setDemo(demoFlag === '1');
      })
      .catch(() => {});

    const unsubAuth = subscribeToAuth(async (user) => {
      // Signed in: put the profile kept on this phone in place first, so the app opens on her
      // own screen with it — never a "Loading…" frame between sign-in and profile.
      if (user && !CMS_PREVIEW) {
        const cached = await cacheRef.current;
        if (!cancelled && cached?.uid === user.uid && cached.profile) {
          setProfile((prev) => prev || decodeFromCache(cached.profile));
        }
      }
      setFirebaseUser(user);
      if (!user) {
        if (!previewRef.current) setProfile(null);
        // Know whether she is a returning guest before showing anything (no sign-in flash).
        await storageRead;
        setInitializing(false);
        return;
      }
      if (!cancelled && !CMS_PREVIEW) {
        // Real phone/email login ends demo / lab journey so Ananya + flow bar cannot stick.
        setGuestMode(false);
        setLabJourney(null);
        setDemo(false);
        setAuthEntry(null);
        AsyncStorage.multiRemove([GUEST_KEY, LAB_LEP_KEY, LAB_JOURNEY_KEY, DEMO_KEY]).catch(
          () => {}
        );
      }
      // Opened from the copy on this phone: show it now; the server copy follows.
      const cached = await cacheRef.current;
      if (!cancelled && cached?.uid === user.uid && cached.profile) setInitializing(false);
      try {
        const p = await fetchUserProfile(user.uid);
        setProfile({
          ...p,
          ilGuideOnboarded: p?.ilGuideOnboarded === true || onboardedRef.current,
        });
        if (!cancelled) setProfileFresh(true);
      } catch (e) {
        setError(e.message);
      } finally {
        setInitializing(false);
      }
    });
    return () => {
      cancelled = true;
      clearTimeout(failOpen);
      unsubAuth();
    };
  }, []);

  useEffect(() => {
    if (!firebaseUser?.uid) {
      setProfileFresh(false);
      return undefined;
    }
    const unsub = subscribeToUser(
      firebaseUser.uid,
      (data) => {
        setProfileFresh(true);
        setProfile((prev) => {
          const programAccess = mergeProgramAccessPreservingPayment(
            prev?.programAccess,
            data?.programAccess
          );
          const paymentStatus =
            prev?.paymentStatus === PAYMENT_STATUS.PAID
              ? prev.paymentStatus
              : data?.paymentStatus;
          const welcome = mergeWelcomeProfilePreserving(prev, data);
          const next = {
            ...data,
            ...welcome,
            programAccess,
            paymentStatus,
            ilGuideOnboarded:
              data?.ilGuideOnboarded === true ||
              prev?.ilGuideOnboarded === true ||
              onboardedRef.current,
          };
          // Server syncs (Zoho, access refresh, activity stamps) rewrite her profile often with
          // nothing she can see changed. Keeping the same object then spares a redraw of every
          // screen and provider that reads the profile — the main lag on weaker phones.
          return sameVisibleProfile(prev, next) ? prev : next;
        });
      },
      (err) => setError(err.message)
    );
    return unsub;
  }, [firebaseUser?.uid]);

  // Keep the phone's copy of her profile current (a moment after changes settle).
  useEffect(() => {
    const uid = firebaseUser?.uid;
    if (!uid || !profile || preview || labJourney || CMS_PREVIEW) return undefined;
    const t = setTimeout(() => {
      try {
        AsyncStorage.setItem(
          PROFILE_CACHE_KEY,
          JSON.stringify({ uid, at: Date.now(), profile: encodeForCache(profile) })
        ).catch(() => {});
      } catch {
        /* a profile that cannot be stored just loads from the server next time */
      }
    }, 1500);
    return () => clearTimeout(t);
  }, [profile, firebaseUser?.uid, preview, labJourney]);

  const logout = useCallback(async () => {
    AsyncStorage.removeItem(PROFILE_CACHE_KEY).catch(() => {});
    cacheRef.current = Promise.resolve(null);
    previewRef.current = false;
    setPreview(false);
    await authLogOut();
    setProfile(null);
    setGuestMode(false);
    setLabJourney(null);
    setDemo(false);
    await AsyncStorage.multiRemove([GUEST_KEY, LAB_LEP_KEY, LAB_JOURNEY_KEY, DEMO_KEY]);
  }, []);

  const enterPreview = useCallback(() => {
    previewRef.current = true;
    setGuestMode(false);
    setLabJourney(null);
    AsyncStorage.multiRemove([LAB_LEP_KEY, LAB_JOURNEY_KEY]).catch(() => {});
    setPreview(true);
    setProfile(PREVIEW_PROFILE);
    setInitializing(false);
  }, []);

  const enterGuest = useCallback(async (firstName, { demo: fromDemo = false } = {}) => {
    // Her name is saved before the guest app opens, so its first screen greets her by name
    // (it used to say "future leader" until the next open).
    if (firstName) await AsyncStorage.setItem('il_guest_name', firstName).catch(() => {});
    setLabJourney(null);
    setGuestMode(true);
    setDemo(fromDemo);
    await AsyncStorage.setItem(GUEST_KEY, '1');
    if (fromDemo) await AsyncStorage.setItem(DEMO_KEY, '1');
    else await AsyncStorage.removeItem(DEMO_KEY);
    await AsyncStorage.multiRemove([LAB_LEP_KEY, LAB_JOURNEY_KEY]);
  }, []);

  const enterAuthFromGuest = useCallback(async () => {
    setGuestMode(false);
    await AsyncStorage.removeItem(GUEST_KEY);
  }, []);

  const leavePreview = () => {
    if (!previewRef.current) return;
    previewRef.current = false;
    setPreview(false);
    setProfile(null);
  };

  const exitToLogin = useCallback(async () => {
    leavePreview();
    setLabJourney(null);
    setGuestMode(false);
    setDemo(false);
    await AsyncStorage.multiRemove([GUEST_KEY, LAB_LEP_KEY, LAB_JOURNEY_KEY, DEMO_KEY]);
  }, []);

  /** Demo only: back to a sign-in step (phone, OTP, batch…) while keeping the flow bar. */
  const enterAuthDemo = useCallback(async (route) => {
    leavePreview();
    setLabJourney(null);
    setGuestMode(false);
    setDemo(true);
    setAuthEntry(route || null);
    await AsyncStorage.multiRemove([GUEST_KEY, LAB_LEP_KEY, LAB_JOURNEY_KEY]);
    await AsyncStorage.setItem(DEMO_KEY, '1');
  }, []);

  const enterJourneyPreview = useCallback(async (program, state, regStatus) => {
    const next = {
      program: ['lep', '100bm', 'mbw'].includes(program) ? program : 'lep',
      state: state === 'enrolled' ? 'enrolled' : 'registered',
      regStatus: ['enroll', 'batch', 'prework', 'ready'].includes(regStatus) ? regStatus : null,
    };
    leavePreview();
    setGuestMode(false);
    setLabJourney(next);
    setDemo(true);
    await AsyncStorage.setItem(LAB_JOURNEY_KEY, JSON.stringify(next));
    await AsyncStorage.setItem(DEMO_KEY, '1');
    await AsyncStorage.multiRemove([GUEST_KEY, LAB_LEP_KEY]);
  }, []);

  const enterLepPreview = useCallback(
    (state) => enterJourneyPreview('lep', state),
    [enterJourneyPreview]
  );

  const patchProfile = useCallback((partial) => {
    if (partial?.ilGuideOnboarded === true) onboardedRef.current = true;
    setProfile((prev) => {
      if (!prev) return { ...partial };
      const next = { ...prev, ...partial };
      if (partial.programAccess) {
        next.programAccess = mergeProgramAccessPreservingPayment(
          prev.programAccess,
          partial.programAccess
        );
      }
      if (
        prev.paymentStatus === PAYMENT_STATUS.PAID &&
        partial.paymentStatus &&
        partial.paymentStatus !== PAYMENT_STATUS.PAID
      ) {
        next.paymentStatus = prev.paymentStatus;
      }
      return next;
    });
  }, []);

  const resolvedProfile = useMemo(() => {
    if (!labJourney) return profile;
    const lab = labProfile(labJourney);
    const pid = lab.program;
    // The CMS preview is a made-up learner — never mix in the staff member's own access.
    const live = labJourney.cmsPreview ? {} : profile?.programAccess?.[pid] || {};
    return {
      ...(profile || {}),
      ...lab,
      ...(labJourney.cmsPreview ? { uid: profile?.uid || firebaseUser?.uid } : {}),
      programs: [pid],
      program: pid,
      phoneNumber: profile?.phoneNumber || profile?.phone || lab.phoneNumber,
      email: profile?.email,
      photoURL: profile?.photoURL,
      programAccess: {
        [pid]: {
          ...live,
          ...(lab.programAccess?.[pid] || {}),
          razorpayPaymentId: live.razorpayPaymentId,
          razorpayOrderId: live.razorpayOrderId,
          fullPaidAt: live.fullPaidAt,
          registrationFee: live.registrationFee,
          registrationAmount: live.registrationAmount,
          txnLast4: live.txnLast4 || live.transactionLast4,
        },
      },
    };
  }, [profile, labJourney, firebaseUser?.uid]);

  const value = useMemo(
    () => ({
      user: firebaseUser || (preview ? { uid: 'preview' } : null),
      accountProfile: profile,
      profile: resolvedProfile,
      role: resolvedProfile?.role || (guestMode ? 'guest' : 'student'),
      isAuthenticated: !GUEST_PREVIEW && (!!firebaseUser || preview || !!labJourney),
      isPreview: preview,
      demo,
      authEntry,
      journey: labJourney,
      cmsPreview: Boolean(labJourney?.cmsPreview),
      isGuest: !!GUEST_PREVIEW || (guestMode && !firebaseUser && !preview && !labJourney),
      isStaff: ['teacher', 'admin', 'moderator', 'superadmin'].includes(
        resolvedProfile?.role
      ),
      initializing,
      profileFresh: profileFresh || preview || Boolean(labJourney),
      error,
      logout,
      enterGuest,
      enterPreview,
      enterAuthFromGuest,
      enterLepPreview,
      enterJourneyPreview,
      enterAuthDemo,
      exitToLogin,
      patchProfile,
      setError,
    }),
    [
      firebaseUser,
      profile,
      resolvedProfile,
      guestMode,
      labJourney,
      preview,
      demo,
      authEntry,
      initializing,
      profileFresh,
      error,
      logout,
      enterGuest,
      enterPreview,
      enterAuthFromGuest,
      enterLepPreview,
      enterJourneyPreview,
      exitToLogin,
      patchProfile,
    ]
  );

  useChangeProbe('Auth', value);
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}

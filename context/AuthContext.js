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
  const [error, setError] = useState(null);

  useEffect(() => {
    let cancelled = false;
    const failOpen = setTimeout(() => {
      if (!cancelled) setInitializing(false);
    }, 400);

    Promise.all([
      AsyncStorage.getItem(GUEST_KEY),
      AsyncStorage.getItem(LAB_JOURNEY_KEY),
      AsyncStorage.getItem(LAB_LEP_KEY),
      AsyncStorage.getItem(DEMO_KEY),
    ])
      .then(([guest, journey, legacyLep, demoFlag]) => {
        if (cancelled || CMS_PREVIEW) return;
        if (!devToolsEnabled()) {
          AsyncStorage.multiRemove([GUEST_KEY, LAB_LEP_KEY, LAB_JOURNEY_KEY, DEMO_KEY]).catch(
            () => {}
          );
          return;
        }
        const lab = parseLabJourney(journey, legacyLep);
        setLabJourney(lab);
        setGuestMode(guest === '1' && !lab);
        setDemo(demoFlag === '1');
      })
      .catch(() => {});

    const unsubAuth = subscribeToAuth(async (user) => {
      setFirebaseUser(user);
      if (!user) {
        if (!previewRef.current) setProfile(null);
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
      try {
        const p = await fetchUserProfile(user.uid);
        setProfile({
          ...p,
          ilGuideOnboarded: p?.ilGuideOnboarded === true || onboardedRef.current,
        });
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
    if (!firebaseUser?.uid) return undefined;
    const unsub = subscribeToUser(
      firebaseUser.uid,
      (data) =>
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
          return {
            ...data,
            ...welcome,
            programAccess,
            paymentStatus,
            ilGuideOnboarded:
              data?.ilGuideOnboarded === true ||
              prev?.ilGuideOnboarded === true ||
              onboardedRef.current,
          };
        }),
      (err) => setError(err.message)
    );
    return unsub;
  }, [firebaseUser?.uid]);

  const logout = useCallback(async () => {
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
    setLabJourney(null);
    setGuestMode(true);
    setDemo(fromDemo);
    await AsyncStorage.setItem(GUEST_KEY, '1');
    if (fromDemo) await AsyncStorage.setItem(DEMO_KEY, '1');
    else await AsyncStorage.removeItem(DEMO_KEY);
    await AsyncStorage.multiRemove([LAB_LEP_KEY, LAB_JOURNEY_KEY]);
    if (firstName) {
      await AsyncStorage.setItem('il_guest_name', firstName);
    }
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

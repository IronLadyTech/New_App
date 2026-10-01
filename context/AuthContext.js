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
import { subscribeToAuth, fetchUserProfile, logOut as authLogOut } from '../services/auth';
import { subscribeToUser } from '../services/firestore';

const GUEST_KEY = 'il_guest_mode';
const LAB_LEP_KEY = 'il_lab_lep';
const LAB_JOURNEY_KEY = 'il_lab_journey';
const AuthContext = createContext(null);

function parseLabJourney(raw, legacyLep) {
  if (raw) {
    try {
      const v = JSON.parse(raw);
      if (v?.program && v?.state) return { program: v.program, state: v.state };
    } catch {
      /* ignore */
    }
  }
  if (legacyLep === 'enrolled' || legacyLep === 'registered') {
    return { program: 'lep', state: legacyLep };
  }
  return null;
}

function labProfile({ program, state }) {
  const enrolled = state === 'enrolled';
  const pay = enrolled ? 'paid' : 'register';
  return {
    displayName: 'Ananya Rao',
    firstName: 'Ananya',
    program,
    programs: [program],
    paymentStatus: pay,
    programAccess: { [program]: { paymentStatus: pay } },
    ilGuideOnboarded: true,
    labProgram: program,
    labState: state,
    labLep: program === 'lep' ? state : undefined,
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
  const [labJourney, setLabJourney] = useState(null);
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
    ])
      .then(([guest, journey, legacyLep]) => {
        if (cancelled) return;
        const lab = parseLabJourney(journey, legacyLep);
        setLabJourney(lab);
        setGuestMode(guest === '1' && !lab);
      })
      .catch(() => {});

    const unsubAuth = subscribeToAuth(async (user) => {
      setFirebaseUser(user);
      if (!user) {
        if (!previewRef.current) setProfile(null);
        setInitializing(false);
        return;
      }
      if (!cancelled) {
        setGuestMode(false);
        AsyncStorage.removeItem(GUEST_KEY).catch(() => {});
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
        setProfile((prev) => ({
          ...data,
          ilGuideOnboarded:
            data?.ilGuideOnboarded === true ||
            prev?.ilGuideOnboarded === true ||
            onboardedRef.current,
        })),
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
    await AsyncStorage.multiRemove([GUEST_KEY, LAB_LEP_KEY, LAB_JOURNEY_KEY]);
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

  const enterGuest = useCallback(async (firstName) => {
    setLabJourney(null);
    setGuestMode(true);
    await AsyncStorage.setItem(GUEST_KEY, '1');
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
    await AsyncStorage.multiRemove([GUEST_KEY, LAB_LEP_KEY, LAB_JOURNEY_KEY]);
  }, []);

  const enterJourneyPreview = useCallback(async (program, state) => {
    const next = {
      program: 'lep',
      state: state === 'enrolled' ? 'enrolled' : 'registered',
    };
    leavePreview();
    setGuestMode(false);
    setLabJourney(next);
    await AsyncStorage.setItem(LAB_JOURNEY_KEY, JSON.stringify(next));
    await AsyncStorage.multiRemove([GUEST_KEY, LAB_LEP_KEY]);
  }, []);

  const enterLepPreview = useCallback(
    (state) => enterJourneyPreview('lep', state),
    [enterJourneyPreview]
  );

  const patchProfile = useCallback((partial) => {
    if (partial?.ilGuideOnboarded === true) onboardedRef.current = true;
    setProfile((prev) => (prev ? { ...prev, ...partial } : { ...partial }));
  }, []);

  const resolvedProfile = useMemo(() => {
    if (!labJourney) return profile;
    const lab = labProfile(labJourney);
    const pid = lab.program;
    const live = profile?.programAccess?.[pid] || {};
    return {
      ...(profile || {}),
      ...lab,
      phoneNumber: profile?.phoneNumber || profile?.phone || lab.phoneNumber,
      email: profile?.email,
      photoURL: profile?.photoURL,
      programAccess: {
        ...(profile?.programAccess || {}),
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
  }, [profile, labJourney]);

  const value = useMemo(
    () => ({
      user: firebaseUser || (preview ? { uid: 'preview' } : null),
      accountProfile: profile,
      profile: resolvedProfile,
      role: resolvedProfile?.role || (guestMode ? 'guest' : 'student'),
      isAuthenticated: !!firebaseUser || preview || !!labJourney,
      isPreview: preview,
      isGuest: guestMode && !firebaseUser && !preview && !labJourney,
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

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}

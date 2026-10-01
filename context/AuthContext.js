import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { subscribeToAuth, fetchUserProfile, logOut as authLogOut } from '../services/auth';
import { subscribeToUser } from '../services/firestore';

const GUEST_KEY = 'il_guest_mode';
const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [firebaseUser, setFirebaseUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [guestMode, setGuestMode] = useState(false);
  const [initializing, setInitializing] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let cancelled = false;
    const failOpen = setTimeout(() => {
      if (!cancelled) setInitializing(false);
    }, 400);

    AsyncStorage.getItem(GUEST_KEY)
      .then((value) => {
        if (!cancelled) setGuestMode(value === '1');
      })
      .catch(() => {});

    const unsubAuth = subscribeToAuth(async (user) => {
      setFirebaseUser(user);
      if (!user) {
        setProfile(null);
        setInitializing(false);
        return;
      }
      if (!cancelled) {
        setGuestMode(false);
        AsyncStorage.removeItem(GUEST_KEY).catch(() => {});
      }
      try {
        const p = await fetchUserProfile(user.uid);
        setProfile(p);
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
      (data) => setProfile(data),
      (err) => setError(err.message)
    );
    return unsub;
  }, [firebaseUser?.uid]);

  const logout = useCallback(async () => {
    await authLogOut();
    setProfile(null);
    setGuestMode(false);
    await AsyncStorage.removeItem(GUEST_KEY);
  }, []);

  const enterGuest = useCallback(async (firstName) => {
    setGuestMode(true);
    await AsyncStorage.setItem(GUEST_KEY, '1');
    if (firstName) {
      await AsyncStorage.setItem('il_guest_name', firstName);
    }
  }, []);

  const enterAuthFromGuest = useCallback(async () => {
    setGuestMode(false);
    await AsyncStorage.removeItem(GUEST_KEY);
  }, []);

  const value = useMemo(
    () => ({
      user: firebaseUser,
      profile,
      role: profile?.role || (guestMode ? 'guest' : 'student'),
      isAuthenticated: !!firebaseUser,
      isGuest: guestMode && !firebaseUser,
      isStaff: ['teacher', 'admin', 'moderator', 'superadmin'].includes(
        profile?.role
      ),
      initializing,
      error,
      logout,
      enterGuest,
      enterAuthFromGuest,
      setError,
    }),
    [
      firebaseUser,
      profile,
      guestMode,
      initializing,
      error,
      logout,
      enterGuest,
      enterAuthFromGuest,
    ]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}

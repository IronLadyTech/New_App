import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';
import { subscribeToAuth, fetchUserProfile, logOut as authLogOut } from '../services/auth';
import { subscribeToUser } from '../services/firestore';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [firebaseUser, setFirebaseUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [initializing, setInitializing] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const unsubAuth = subscribeToAuth(async (user) => {
      setFirebaseUser(user);
      if (!user) {
        setProfile(null);
        setInitializing(false);
        return;
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
    return unsubAuth;
  }, []);

  // Live profile sync once authenticated
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
  }, []);

  const value = useMemo(
    () => ({
      user: firebaseUser,
      profile,
      role: profile?.role || 'student',
      isAuthenticated: !!firebaseUser,
      isStaff: ['teacher', 'admin', 'moderator', 'superadmin'].includes(
        profile?.role
      ),
      initializing,
      error,
      logout,
      setError,
    }),
    [firebaseUser, profile, initializing, error, logout]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}

/**
 * Web-only staff CMS at /admin. Same Firebase project and login as the app;
 * access needs users/{uid}.role in CMS_VIEW_ROLES.
 */
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, Platform, View } from 'react-native';
import { onAuthStateChanged, signInWithEmailAndPassword, signOut } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import Pressable from '../../components/il/Press';
import { auth, db } from '../../services/firebase';
import { CMS_EDIT_ROLES, CMS_VIEW_ROLES } from '../../constants/cms';
import { A, Btn, Card, Field, H, Input, Notice, T } from './adminUi';
import NotificationsAdmin from './NotificationsAdmin';
import ILGuideAdmin from './ILGuideAdmin';
import BatchHubAdmin from './BatchHubAdmin';
import { AdminWorkflowStrip } from './AdminSectionGuide';

const SECTIONS = [
  { key: 'hub', label: 'LEP batch', hint: 'Messages · content · practice', Screen: BatchHubAdmin },
  { key: 'templates', label: 'Program templates', hint: 'Message copy & rules', Screen: NotificationsAdmin },
  { key: 'ilguide', label: 'IL Guide coach', hint: 'In-app tips (once)', Screen: ILGuideAdmin },
];

const LEGACY_HASH = { batches: 'hub', content: 'hub', notifications: 'templates' };

function sectionFromHash() {
  const raw = Platform.OS === 'web' ? (window.location?.hash || '').replace('#', '') : '';
  const key = LEGACY_HASH[raw] || raw;
  return SECTIONS.some((s) => s.key === key) ? key : 'hub';
}

export default function AdminApp() {
  const [firebaseUser, setFirebaseUser] = useState(undefined);
  const [role, setRole] = useState(undefined);
  const [section, setSection] = useState(sectionFromHash);
  const logout = () => signOut(auth);

  useEffect(
    () =>
      onAuthStateChanged(auth, async (u) => {
        setRole(undefined);
        setFirebaseUser(u || null);
        if (!u) return;
        try {
          const snap = await getDoc(doc(db, 'users', u.uid));
          setRole(snap.exists() ? snap.data().role || null : null);
        } catch {
          setRole(null);
        }
      }),
    []
  );

  if (firebaseUser === undefined || (firebaseUser && role === undefined)) {
    return (
      <View style={{ flex: 1, minHeight: '100vh', alignItems: 'center', justifyContent: 'center', backgroundColor: A.page }}>
        <ActivityIndicator color={A.red} />
      </View>
    );
  }

  if (!firebaseUser) return <AdminSignIn />;

  if (!CMS_VIEW_ROLES.includes(role)) {
    return (
      <Centered>
        <H style={{ marginBottom: 8 }}>No access</H>
        <T color={A.muted} style={{ marginBottom: 16 }}>
          {firebaseUser.email || firebaseUser.phoneNumber} is a “{role || 'student'}” account. Ask an Admin to set your
          role to admin, pl or cem.
        </T>
        <Btn label="Sign out" kind="ghost" onPress={logout} />
      </Centered>
    );
  }

  const canEdit = CMS_EDIT_ROLES.includes(role);
  const go = (key) => {
    setSection(key);
    if (Platform.OS === 'web') window.history.replaceState(null, '', `#${key}`);
  };

  const Active = SECTIONS.find((s) => s.key === section).Screen;

  return (
    <View style={{ flex: 1, flexDirection: 'row', backgroundColor: A.page, minHeight: '100vh' }}>
      <View style={{ width: 230, backgroundColor: A.navy, paddingVertical: 22 }}>
        <View style={{ paddingHorizontal: 20, marginBottom: 26 }}>
          <T size={18} weight="bold" color="#fff">
            Iron Lady
          </T>
          <T size={12} color="#C8C2B6">
            Staff CMS for CEM & PL
          </T>
        </View>
        <AdminWorkflowStrip />
        {SECTIONS.map((s) => (
          <Pressable
            key={s.key}
            onPress={() => go(s.key)}
            style={({ pressed }) => ({
              paddingHorizontal: 20,
              paddingVertical: 11,
              backgroundColor: section === s.key ? 'rgba(255,255,255,0.12)' : pressed ? 'rgba(255,255,255,0.06)' : 'transparent',
              borderLeftWidth: 3,
              borderLeftColor: section === s.key ? A.red : 'transparent',
            })}
          >
            <T weight={section === s.key ? 'semibold' : 'regular'} color="#fff" size={14}>
              {s.label}
            </T>
            <T size={11} color="#A8B4C0" style={{ marginTop: 2 }}>
              {s.hint}
            </T>
          </Pressable>
        ))}
        <View style={{ marginTop: 'auto', paddingHorizontal: 20 }}>
          <T size={12} color="#C8C2B6" numberOfLines={1}>
            {firebaseUser.email}
          </T>
          <T size={12} color="#C8C2B6" style={{ marginBottom: 10 }}>
            {role.toUpperCase()}
            {canEdit ? '' : ' · view only'}
          </T>
          <Pressable onPress={logout}>
            <T size={13} weight="semibold" color="#fff" style={{ textDecorationLine: 'underline' }}>
              Sign out
            </T>
          </Pressable>
        </View>
      </View>
      <View style={{ flex: 1 }}>
        {section === 'hub' ? (
          <BatchHubAdmin canEdit={canEdit} onOpenTemplates={() => go('templates')} />
        ) : (
          <Active canEdit={canEdit} />
        )}
      </View>
    </View>
  );
}

function Centered({ children }) {
  return (
    <View style={{ flex: 1, minHeight: '100vh', alignItems: 'center', justifyContent: 'center', backgroundColor: A.page, padding: 16 }}>
      <Card style={{ width: '100%', maxWidth: 400 }}>{children}</Card>
    </View>
  );
}

function AdminSignIn() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  const submit = async () => {
    setError('');
    setBusy(true);
    try {
      await signInWithEmailAndPassword(auth, email.trim(), password);
    } catch (e) {
      setError(
        e?.code === 'auth/invalid-credential' || e?.code === 'auth/wrong-password'
          ? 'Wrong email or password.'
          : e.message
      );
    } finally {
      setBusy(false);
    }
  };

  return (
    <Centered>
      <H style={{ marginBottom: 4 }}>Staff sign in</H>
      <T color={A.muted} style={{ marginBottom: 18 }}>
        For Admin, PL and CEM accounts.
      </T>
      {error ? <Notice tone="error">{error}</Notice> : null}
      <Field label="Email">
        <Input value={email} onChangeText={setEmail} autoComplete="email" keyboardType="email-address" autoCapitalize="none" />
      </Field>
      <Field label="Password">
        <Input value={password} onChangeText={setPassword} secureTextEntry onSubmitEditing={submit} />
      </Field>
      <Btn label="Sign in" onPress={submit} loading={busy} />
    </Centered>
  );
}

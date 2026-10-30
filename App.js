import './global.css';
import 'react-native-gesture-handler';
import React, { useCallback, useEffect, useLayoutEffect, useState } from 'react';
import { View } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { lockPortrait } from './hooks/useVideoOrientation';
import * as SplashScreen from 'expo-splash-screen';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { AuthProvider } from './context/AuthContext';
import AppNavigator from './navigation/AppNavigator';
import { useILFonts } from './hooks/useILFonts';
import ErrorBoundary from './components/ErrorBoundary';
import IronLadyAnimatedSplash from './components/il/IronLadyAnimatedSplash';
import OfflineBanner from './components/OfflineBanner';
import { DevLaunchSplashPreviewProvider } from './context/DevLaunchSplashPreviewContext';
import { isAdminPath } from './utils/adminRoute';
import { OTA_SKIP_INTRO_KEY, useOtaUpdates } from './hooks/useOtaUpdates';
import AsyncStorage from '@react-native-async-storage/async-storage';

SplashScreen.preventAutoHideAsync().catch(() => {});

function Root() {
  // Must be evaluated in the browser on /admin — not at bundle load in Node during export.
  const [admin] = useState(() => typeof window !== 'undefined' && isAdminPath());
  const { fontsReady } = useILFonts();
  const [gaveUp, setGaveUp] = useState(false);
  const [splashDone, setSplashDone] = useState(false);
  const onSplashFinish = useCallback(() => setSplashDone(true), []);
  // Restarted into an over-the-air update a moment ago: she already saw the intro once.
  const [introChecked, setIntroChecked] = useState(false);
  useEffect(() => {
    AsyncStorage.getItem(OTA_SKIP_INTRO_KEY)
      .then((v) => {
        if (v === '1') {
          AsyncStorage.removeItem(OTA_SKIP_INTRO_KEY).catch(() => {});
          setSplashDone(true);
        }
      })
      .catch(() => {})
      .finally(() => setIntroChecked(true));
  }, []);

  // Safety net: the launch splash can never hold the app for more than 6s.
  useEffect(() => {
    const t = setTimeout(() => setSplashDone(true), 6000);
    return () => clearTimeout(t);
  }, []);

  // Android measures text once; drawing before the fonts load clips words ("Iron", "Continu").
  // Fonts are bundled, so this is a split second. Never hold the app longer than 2.5s.
  useEffect(() => {
    const t = setTimeout(() => setGaveUp(true), 2500);
    return () => clearTimeout(t);
  }, []);

  useEffect(() => {
    if (admin) {
      SplashScreen.hideAsync().catch(() => {});
    }
  }, [admin]);

  useLayoutEffect(() => {
    if (admin || splashDone) return;
    SplashScreen.hideAsync().catch(() => {});
  }, [admin, splashDone]);

  useEffect(() => {
    if (admin) return;
    lockPortrait();
  }, [admin]);

  const appReady = fontsReady || gaveUp;

  if (admin) {
    const AdminApp = require('./screens/admin/AdminApp').default;
    return (
      <SafeAreaProvider>
        <AdminApp />
      </SafeAreaProvider>
    );
  }

  // The app is drawn underneath the launch splash from the start, so the splash's
  // fly-through reveals the real first screen — one continuous shot, no cut or spinner.
  return (
    <SafeAreaProvider>
      {appReady ? (
        <DevLaunchSplashPreviewProvider>
          <AuthProvider>
            <StatusBar style="dark" translucent backgroundColor="transparent" />
            <AppNavigator />
            <OfflineBanner />
          </AuthProvider>
        </DevLaunchSplashPreviewProvider>
      ) : (
        <View style={{ flex: 1, backgroundColor: '#112B32' }} />
      )}
      {!splashDone && !introChecked ? (
        // A few ms while the skip note is read: the splash colour, so nothing flashes.
        <View style={{ position: 'absolute', left: 0, top: 0, right: 0, bottom: 0, backgroundColor: '#112B32' }} />
      ) : null}
      {!splashDone && introChecked ? (
        <>
          <StatusBar style="light" translucent backgroundColor="transparent" />
          <IronLadyAnimatedSplash ready={appReady} onFinish={onSplashFinish} />
        </>
      ) : null}
    </SafeAreaProvider>
  );
}

export default function App() {
  useOtaUpdates();
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <ErrorBoundary>
        <Root />
      </ErrorBoundary>
    </GestureHandlerRootView>
  );
}

import './global.css';
import 'react-native-gesture-handler';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, View } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import * as ScreenOrientation from 'expo-screen-orientation';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { AuthProvider } from './context/AuthContext';
import AppNavigator from './navigation/AppNavigator';
import { useILFonts } from './hooks/useILFonts';
import ErrorBoundary from './components/ErrorBoundary';
import { isAdminPath } from './utils/adminRoute';

function Root() {
  // Must be evaluated in the browser on /admin — not at bundle load in Node during export.
  const [admin] = useState(() => typeof window !== 'undefined' && isAdminPath());
  const { fontsReady } = useILFonts();
  const [gaveUp, setGaveUp] = useState(false);

  // Android measures text once; drawing before the fonts load clips words ("Iron", "Continu").
  // Fonts are bundled, so this is a split second. Never hold the app longer than 2.5s.
  useEffect(() => {
    const t = setTimeout(() => setGaveUp(true), 2500);
    return () => clearTimeout(t);
  }, []);

  useEffect(() => {
    if (admin) return;
    ScreenOrientation.lockAsync(ScreenOrientation.OrientationLock.PORTRAIT_UP).catch(() => {});
  }, [admin]);

  if (!fontsReady && !gaveUp) {
    return (
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: '#F7F6E4' }}>
        <ActivityIndicator size="large" color="#ED1D24" />
      </View>
    );
  }

  if (admin) {
    const AdminApp = require('./screens/admin/AdminApp').default;
    return (
      <SafeAreaProvider>
        <AdminApp />
      </SafeAreaProvider>
    );
  }

  return (
    <SafeAreaProvider>
      <AuthProvider>
        <StatusBar style="dark" translucent backgroundColor="transparent" />
        <AppNavigator />
      </AuthProvider>
    </SafeAreaProvider>
  );
}

export default function App() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <ErrorBoundary>
        <Root />
      </ErrorBoundary>
    </GestureHandlerRootView>
  );
}

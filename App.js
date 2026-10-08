import './global.css';
import 'react-native-gesture-handler';
import React, { useEffect, useState } from 'react';
import { View } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import * as ScreenOrientation from 'expo-screen-orientation';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { AuthProvider } from './context/AuthContext';
import AppNavigator from './navigation/AppNavigator';
import { useILFonts } from './hooks/useILFonts';
import ErrorBoundary from './components/ErrorBoundary';

function Root() {
  const { fontsReady } = useILFonts();
  const [gaveUp, setGaveUp] = useState(false);

  // Android measures text once; drawing before the fonts load clips words ("Iron", "Continu").
  // Fonts are bundled, so this is a split second. Never hold the app longer than 2.5s.
  useEffect(() => {
    const t = setTimeout(() => setGaveUp(true), 2500);
    return () => clearTimeout(t);
  }, []);

  useEffect(() => {
    ScreenOrientation.lockAsync(ScreenOrientation.OrientationLock.PORTRAIT_UP).catch(() => {});
  }, []);

  if (!fontsReady && !gaveUp) {
    return <View style={{ flex: 1, backgroundColor: '#113744' }} />;
  }

  return (
    <SafeAreaProvider>
      <AuthProvider>
        <StatusBar style="dark" />
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

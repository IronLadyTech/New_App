import React, { useRef, useState } from 'react';
import { View } from 'react-native';
import { NavigationContainer, useNavigationContainerRef } from '@react-navigation/native';
import { SafeAreaInsetsContext, useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAuth } from '../context/AuthContext';
import AuthNavigator from './AuthNavigator';
import DemoFlowBar from '../components/il/DemoFlowBar';
import { bindRootNavigation, navigateFromGo } from '../utils/navigationFromGo';
import { GUEST_PREVIEW } from '../utils/guestPreview';

function AuthenticatedBranch() {
  const AuthenticatedApp = require('./AuthenticatedApp').default;
  return <AuthenticatedApp />;
}

function GuestBranch() {
  const GuestNavigator = require('./GuestNavigator').default;
  return <GuestNavigator />;
}

export default function AppNavigator() {
  const { isAuthenticated, isGuest, demo, journey, cmsPreview } = useAuth();
  const insets = useSafeAreaInsets();
  const navRef = useNavigationContainerRef();
  const [route, setRoute] = useState(null);
  const openedPreviewGo = useRef(false);
  const track = () => {
    bindRootNavigation(navRef);
    setRoute(navRef.getCurrentRoute()?.name || null);
  };
  // CMS preview: open once on the screen where the item CX just saved shows.
  const onReady = () => {
    track();
    const go = journey?.previewGo || GUEST_PREVIEW?.go;
    if (go && !openedPreviewGo.current) {
      openedPreviewGo.current = true;
      navigateFromGo(go);
    }
  };

  const app = isAuthenticated ? (
    // A new demo flow remounts the app, so it opens fresh on Home.
    <AuthenticatedBranch key={journey ? `${journey.program}-${journey.state}` : 'account'} />
  ) : isGuest ? (
    <GuestBranch />
  ) : (
    <AuthNavigator />
  );

  // Demo: the flow bar sits on sign-in screens, every journey and the guest app.
  const showBar = !cmsPreview && !GUEST_PREVIEW && (!!journey || (demo && (isGuest || !isAuthenticated)));

  return (
    <NavigationContainer ref={navRef} onReady={onReady} onStateChange={track}>
      {showBar ? (
        <View style={{ flex: 1 }}>
          <DemoFlowBar route={route} navRef={navRef} />
          {/* The bar already covers the status bar, so screens below start flush. */}
          <SafeAreaInsetsContext.Provider value={{ ...insets, top: 0 }}>
            <View style={{ flex: 1 }}>{app}</View>
          </SafeAreaInsetsContext.Provider>
        </View>
      ) : (
        app
      )}
    </NavigationContainer>
  );
}

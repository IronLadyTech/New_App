import React, { useState } from 'react';
import { ActivityIndicator, View } from 'react-native';
import { WebView } from 'react-native-webview';
import { StatusBar } from 'expo-status-bar';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import ILText from '../../components/il/ILText';
import { G } from '../../constants/guestTheme';
import { GuestBackBar } from '../guest/GuestBits';
import { Page } from '../lep/LepBits';
import { LIQUID_TAB_PAD } from '../../components/il/LiquidTabBar';

export default function LegalWebScreen({ route, navigation }) {
  const insets = useSafeAreaInsets();
  const { url, title = 'Document' } = route.params || {};
  const [failed, setFailed] = useState(false);

  return (
    <Page>
      <StatusBar style="dark" />
      <GuestBackBar title={title} onBack={() => navigation.goBack()} />
      {!url ? (
        <ILText role="body" color={G.meta} style={{ padding: 20 }}>
          No link configured.
        </ILText>
      ) : failed ? (
        <ILText role="body" color={G.meta} style={{ padding: 20 }}>
          Could not load this page. Try again on Wi‑Fi or email support@ironlady.tech.
        </ILText>
      ) : (
        <WebView
          source={{ uri: url }}
          style={{ flex: 1, marginBottom: LIQUID_TAB_PAD + Math.max(insets.bottom, 8) }}
          startInLoadingState
          renderLoading={() => (
            <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
              <ActivityIndicator color={G.cta} />
            </View>
          )}
          onError={() => setFailed(true)}
          onHttpError={() => setFailed(true)}
        />
      )}
    </Page>
  );
}

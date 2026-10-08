import React, { useEffect, useState } from 'react';
import { ActivityIndicator, View } from 'react-native';
import * as Linking from 'expo-linking';
import { StatusBar } from 'expo-status-bar';
import { WebView } from 'react-native-webview';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import ILText from '../../components/il/ILText';
import { G } from '../../constants/guestTheme';
import { GuestBackBar } from '../guest/GuestBits';
import { Page, RedCta } from '../lep/LepBits';
import { arrayBufferToBase64 } from '../../utils/arrayBufferToBase64';
import { buildPdfViewerHtml } from '../../utils/buildPdfViewerHtml';
import { isPdfDocument } from '../../utils/taskDocumentUri';

export default function TaskDocumentScreen({ route, navigation }) {
  const insets = useSafeAreaInsets();
  const { url, label, pages } = route.params || {};
  const [html, setHtml] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      setLoading(true);
      setError(null);
      setHtml(null);

      if (!url) {
        setError('No document URL.');
        setLoading(false);
        return;
      }

      if (!isPdfDocument(url)) {
        setError('word');
        setLoading(false);
        return;
      }

      try {
        const res = await fetch(url);
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const base64 = arrayBufferToBase64(await res.arrayBuffer());
        if (!cancelled) {
          setHtml(buildPdfViewerHtml(base64, pages, label || 'Document'));
          setLoading(false);
        }
      } catch {
        if (!cancelled) {
          setError('Could not load this document. Check your connection and try again.');
          setLoading(false);
        }
      }
    }

    load();
    return () => {
      cancelled = true;
    };
  }, [url, label, pages]);

  const pageHint =
    pages?.length === 1
      ? `Page ${pages[0]}`
      : pages?.length
        ? `Pages ${pages.join(', ')}`
        : 'Full document';

  return (
    <Page>
      <StatusBar style="dark" />
      <View style={{ paddingTop: Math.max(insets.top, 8) }}>
        <GuestBackBar
          title={label || 'Document'}
          sub={`Read in app · ${pageHint}`}
          onBack={() => navigation.goBack()}
        />
      </View>

      {loading ? (
        <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
          <ActivityIndicator size="large" color="#ED1D24" />
        </View>
      ) : null}

      {error === 'word' ? (
        <View style={{ flex: 1, paddingHorizontal: 24, justifyContent: 'center' }}>
          <ILText role="body" color={G.body} style={{ fontSize: 15, lineHeight: 22 }}>
            Word templates open in your phone’s document app. Tap below to download the template,
            then return here to finish the task.
          </ILText>
          <View style={{ marginTop: 20 }}>
            <RedCta label="Open template" onPress={() => Linking.openURL(url).catch(() => {})} />
          </View>
        </View>
      ) : null}

      {error && error !== 'word' ? (
        <View style={{ flex: 1, paddingHorizontal: 24, justifyContent: 'center' }}>
          <ILText role="body" color={G.body} style={{ fontSize: 15, lineHeight: 22, textAlign: 'center' }}>
            {error}
          </ILText>
        </View>
      ) : null}

      {html ? (
        <WebView
          source={{ html, baseUrl: 'https://lmsironlady.web.app/' }}
          style={{ flex: 1, backgroundColor: '#F7F6E4' }}
          originWhitelist={['*']}
          javaScriptEnabled
          domStorageEnabled
          allowsInlineMediaPlayback
        />
      ) : null}
    </Page>
  );
}

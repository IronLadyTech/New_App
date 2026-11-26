import React, { useCallback, useEffect, useState } from 'react';
import { Platform, View } from 'react-native';
import * as Linking from 'expo-linking';
import { StatusBar } from 'expo-status-bar';
import { WebView } from 'react-native-webview';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import ILText from '../../components/il/ILText';
import { G } from '../../constants/guestTheme';
import { GuestBackBar } from '../guest/GuestBits';
import { Page, RedCta } from '../lep/LepBits';
import { fetchTaskPdfBase64, fetchTaskPdfBase64ViaFetch } from '../../utils/fetchTaskPdfBase64';
import { buildPdfViewerHtml, buildPdfViewerHtmlFromUrl } from '../../utils/buildPdfViewerHtml';
import { isPdfDocument } from '../../utils/taskDocumentUri';
import { useAuth } from '../../context/AuthContext';
import { setTaskReadingAck } from '../../utils/taskReadingAck';
import DocumentLoader from '../../components/program/DocumentLoader';

export default function TaskDocumentScreen({ route, navigation }) {
  const insets = useSafeAreaInsets();
  const { user } = useAuth();
  const { url, label, pages, ackProgramId, ackTaskId, allowDownload } = route.params || {};
  const [html, setHtml] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);
  // The first page is drawn (the viewer says so); until then the loader stays on top.
  const [shown, setShown] = useState(false);
  useEffect(() => {
    if (!html) return undefined;
    const t = setTimeout(() => setShown(true), 8000); // never leave her on the loader
    return () => clearTimeout(t);
  }, [html]);
  // Android WebView often cannot load remote PDFs (CORS) — embed bytes in-page instead.
  const [useUrlViewer, setUseUrlViewer] = useState(Platform.OS === 'web');

  const markRead = useCallback(() => {
    if (ackProgramId && ackTaskId && user?.uid) {
      setTaskReadingAck(user.uid, ackProgramId, ackTaskId).catch(() => {});
    }
  }, [ackProgramId, ackTaskId, user?.uid]);

  useEffect(() => {
    let cancelled = false;

    async function loadWithBase64() {
      try {
        const base64 =
          Platform.OS === 'web' ? await fetchTaskPdfBase64ViaFetch(url) : await fetchTaskPdfBase64(url);
        if (!cancelled) {
          setHtml(buildPdfViewerHtml(base64, pages, label || 'Document'));
          setLoading(false);
          markRead();
        }
      } catch (e) {
        if (!cancelled) {
          setError(
            e?.message === 'not_pdf'
              ? 'This PDF is not on the server yet. The full text is shown on the task screen instead.'
              : 'Could not load this document. Check your connection and try again.'
          );
          setLoading(false);
        }
      }
    }

    async function load() {
      setLoading(true);
      setError(null);
      setHtml(null);
      setShown(false);

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

      const remote = /^https?:\/\//i.test(String(url));
      if (remote && useUrlViewer) {
        if (!cancelled) {
          setHtml(buildPdfViewerHtmlFromUrl(url, pages, label || 'Document'));
          setLoading(false);
        }
        return;
      }

      await loadWithBase64();
    }

    load();
    return () => {
      cancelled = true;
    };
  }, [url, label, pages, useUrlViewer, markRead]);

  const onWebMessage = useCallback(
    (event) => {
      let data;
      try {
        data = JSON.parse(event.nativeEvent.data);
      } catch {
        return;
      }
      if (data?.type === 'pdf-ready') {
        setShown(true);
        markRead();
      }
      if (data?.type === 'pdf-error' && useUrlViewer) {
        setUseUrlViewer(false);
        setLoading(true);
      }
    },
    [markRead, useUrlViewer]
  );

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

      {loading && !html ? <DocumentLoader label={label} /> : null}

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
          {url ? (
            <View style={{ marginTop: 20 }}>
              <RedCta label="Open PDF in browser" onPress={() => Linking.openURL(url).catch(() => {})} />
            </View>
          ) : null}
        </View>
      ) : null}

      {html ? (
        <View style={{ flex: 1 }}>
          <WebView
            source={{ html, baseUrl: 'https://lmsironlady.web.app/' }}
            style={{ flex: 1, backgroundColor: '#F7F6E4' }}
            originWhitelist={['*']}
            javaScriptEnabled
            domStorageEnabled
            allowsInlineMediaPlayback
            onMessage={onWebMessage}
          />
          {!shown ? (
            <View style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: '#F7F6E4' }}>
              <DocumentLoader label={label} />
            </View>
          ) : null}
        </View>
      ) : null}

      {allowDownload && url && isPdfDocument(url) ? (
        <View style={{ paddingHorizontal: 20, paddingBottom: Math.max(insets.bottom, 12) + 8 }}>
          <RedCta
            label="Download PDF"
            icon="download"
            onPress={() => Linking.openURL(url).catch(() => {})}
          />
        </View>
      ) : null}
    </Page>
  );
}
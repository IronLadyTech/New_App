import React, { useEffect, useState } from 'react';
import { ActivityIndicator, Modal, View } from 'react-native';
import { WebView } from 'react-native-webview';
import { MaterialIcons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import ILText from '../il/ILText';
import Pressable from '../il/Press';
import { G, af } from '../../constants/guestTheme';
import { GuestBackBar } from '../../screens/guest/GuestBits';
import { arrayBufferToBase64 } from '../../utils/arrayBufferToBase64';
import { buildPdfViewerHtml } from '../../utils/buildPdfViewerHtml';
import { isPdfDocument } from '../../utils/taskDocumentUri';

/**
 * “Read worksheet” card on the task screen. Opens the PDF in a modal so the
 * WebView never sits inside the ScrollView — that nesting blocks taps on form
 * fields below on Android and web.
 */
export default function InlinePdfPreview({ url, label = 'Read worksheet', pages }) {
  const insets = useSafeAreaInsets();
  const [open, setOpen] = useState(false);
  const [html, setHtml] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    if (!open || loaded || !url) return;
    let cancelled = false;

    async function load() {
      setLoading(true);
      setError(null);

      if (!isPdfDocument(url)) {
        setError('This file cannot be previewed here.');
        setLoading(false);
        setLoaded(true);
        return;
      }

      try {
        const res = await fetch(url);
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const base64 = arrayBufferToBase64(await res.arrayBuffer());
        if (!cancelled) {
          setHtml(buildPdfViewerHtml(base64, pages, label));
          setLoaded(true);
          setLoading(false);
        }
      } catch {
        if (!cancelled) {
          setError('Could not load this document. Check your connection and try again.');
          setLoaded(true);
          setLoading(false);
        }
      }
    }

    load();
    return () => {
      cancelled = true;
    };
  }, [open, loaded, url, label, pages]);

  const pageHint =
    pages?.length === 1
      ? `page ${pages[0]}`
      : pages?.length
        ? `pages ${pages.join(', ')}`
        : 'full worksheet';

  const close = () => setOpen(false);

  return (
    <View style={{ marginTop: 18 }}>
      <Pressable
        onPress={() => setOpen(true)}
        style={{
          borderRadius: 18,
          padding: 16,
          backgroundColor: G.white,
          borderWidth: 1,
          borderColor: G.line,
          flexDirection: 'row',
          alignItems: 'center',
        }}
      >
        <View
          style={{
            width: 44,
            height: 44,
            borderRadius: 14,
            backgroundColor: G.pink,
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <MaterialIcons name="picture-as-pdf" size={22} color={G.cta} />
        </View>
        <View style={{ flex: 1, marginLeft: 12 }}>
          <ILText role="label" color={G.ink}>{label}</ILText>
          <ILText role="bodySm" color={G.meta} style={{ marginTop: 3, fontSize: 12 }}>
            Tap to read · {pageHint}
          </ILText>
        </View>
        <MaterialIcons name="chevron-right" size={18} color={G.meta} />
      </Pressable>

      <ILText role="eyebrow" color={G.meta} style={[af, { fontSize: 10, marginTop: 10 }]}>
        Type your answers in the form below
      </ILText>

      <Modal visible={open} animationType="slide" onRequestClose={close}>
        <View style={{ flex: 1, backgroundColor: G.page, paddingTop: Math.max(insets.top, 8) }}>
          <GuestBackBar title={label} sub={`Read only · ${pageHint}`} onBack={close} />
          {loading ? (
            <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
              <ActivityIndicator size="large" color={G.cta} />
            </View>
          ) : null}
          {error ? (
            <View style={{ flex: 1, padding: 24, justifyContent: 'center' }}>
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
            />
          ) : null}
        </View>
      </Modal>
    </View>
  );
}

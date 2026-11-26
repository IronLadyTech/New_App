import React, { useMemo, useRef, useState } from 'react';
import { ActivityIndicator, View } from 'react-native';
import { WebView } from 'react-native-webview';
import Pressable from '../il/Press';
import ILText from '../il/ILText';
import { G } from '../../constants/guestTheme';
import { WhiteCard } from '../../screens/lep/LepBits';
import { FEEDBACK_DONE_JS, feedbackFormUrl } from '../../utils/feedbackForms';

/**
 * A feedback form (Google Form / Zoho Survey) inside the task, her details filled in.
 * onDone() runs once when the form says it was submitted, or when she taps "I've submitted".
 */
export default function FeedbackFormView({ url, profile, done, onDone }) {
  const src = useMemo(() => feedbackFormUrl(url, profile), [url, profile?.uid, profile?.email]);
  const [loading, setLoading] = useState(true);
  const fired = useRef(false);
  const finish = () => {
    if (fired.current) return;
    fired.current = true;
    onDone();
  };

  if (done) {
    return (
      <WhiteCard style={{ marginTop: 18, borderRadius: 18, padding: 16 }}>
        <ILText role="label" color={G.ink} style={{ fontSize: 16 }}>
          Thank you. Your feedback is in.
        </ILText>
        <ILText role="bodySm" color={G.body} style={{ marginTop: 6, fontSize: 14, lineHeight: 20 }}>
          It shapes what we reinforce in the sessions ahead.
        </ILText>
      </WhiteCard>
    );
  }

  return (
    <View style={{ marginTop: 18 }}>
      <WhiteCard style={{ borderRadius: 18, padding: 0, overflow: 'hidden', height: 620 }}>
        <WebView
          source={{ uri: src }}
          style={{ flex: 1 }}
          nestedScrollEnabled
          injectedJavaScript={FEEDBACK_DONE_JS}
          onMessage={(e) => e.nativeEvent.data === 'il-feedback-done' && finish()}
          onLoadEnd={() => setLoading(false)}
          setSupportMultipleWindows={false}
        />
        {loading ? (
          <View
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              alignItems: 'center',
              justifyContent: 'center',
              backgroundColor: '#FFFFFF',
            }}
          >
            <ActivityIndicator color={G.cta} />
            <ILText role="bodySm" color={G.meta} style={{ marginTop: 8, fontSize: 13 }}>
              Opening the feedback form…
            </ILText>
          </View>
        ) : null}
      </WhiteCard>
      <Pressable onPress={finish} accessibilityRole="button" hitSlop={8} style={{ marginTop: 12, alignSelf: 'center' }}>
        <ILText role="label" color={G.meta} style={{ fontSize: 13 }}>
          Already submitted it? Mark this done
        </ILText>
      </Pressable>
    </View>
  );
}

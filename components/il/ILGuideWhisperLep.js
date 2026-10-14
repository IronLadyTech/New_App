import React from 'react';
import { View } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import Pressable from './Press';
import ILText from './ILText';
import { G, af } from '../../constants/guestTheme';
import { IL_FONTS } from '../../constants/ironLadyBrand';
import { IL_GUIDE_SURFACES } from '../../constants/ilGuide';
import { useILGuideWhisper } from '../../hooks/useILGuideWhisper';
import { GuideFace, WhiteCard } from '../../screens/lep/LepBits';
import { useLepNav } from '../../screens/lep/useLepNav';
import { PROGRAMS } from '../../constants/programs';

/**
 * LEP-styled IL Guide card — dynamic whisper with optional fallback copy.
 */
export default function ILGuideWhisperLep({
  surface = IL_GUIDE_SURFACES.LEARN,
  fallbackQuote = '',
  subtitle = 'Executive Mentor',
  style,
  children,
}) {
  const nav = useLepNav();
  const { whisper, loading, hidden, dismiss, reload } = useILGuideWhisper(surface);

  if (hidden && !loading && !fallbackQuote) return null;

  const message = whisper?.message || (!loading ? fallbackQuote : '');
  const openNext = () => {
    const taskId = whisper?.taskId || taskIdFromWhisperId(whisper?.id);
    if (taskId) nav.goCourseTask(PROGRAMS.LEP, taskId);
  };

  if (!message && !loading) return null;

  return (
    <WhiteCard
      style={[
        {
          marginTop: 16,
          borderRadius: 22,
          padding: 16,
          borderLeftWidth: 3,
          borderLeftColor: G.cta,
        },
        style,
      ]}
    >
      <View style={{ flexDirection: 'row', alignItems: 'flex-start' }}>
        <GuideFace size={44} />
        <View style={{ flex: 1, marginLeft: 12 }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', flex: 1 }}>
              <ILText role="label" color={G.ink} style={{ fontSize: 13 }}>
                IL Guide’s Whisper
              </ILText>
              {subtitle ? (
                <ILText role="bodySm" color={G.meta} style={{ marginLeft: 6, fontSize: 12 }}>
                  · {subtitle}
                </ILText>
              ) : null}
            </View>
            {whisper && !loading ? (
              <Pressable onPress={dismiss} hitSlop={8} accessibilityLabel="Dismiss whisper">
                <MaterialIcons name="close" size={18} color={G.meta} />
              </Pressable>
            ) : null}
          </View>
          {loading ? (
            <ILText role="bodySm" color={G.meta} style={{ marginTop: 10 }}>
              IL Guide is thinking…
            </ILText>
          ) : (
            <ILText
              role="title"
              color={G.ink}
              style={{ marginTop: 8, fontFamily: IL_FONTS.display, fontSize: 18, lineHeight: 24 }}
            >
              {message.startsWith('"') ? message : `“${message}”`}
            </ILText>
          )}
          {whisper?.taskId || taskIdFromWhisperId(whisper?.id) ? (
            <Pressable onPress={openNext} style={{ marginTop: 10 }}>
              <ILText role="label" color={G.cta} style={[af, { fontSize: 13 }]}>
                Open next task →
              </ILText>
            </Pressable>
          ) : null}
        </View>
      </View>
      {children}
      {!loading && !whisper && fallbackQuote ? (
        <Pressable onPress={reload} style={{ marginTop: 8 }}>
          <ILText role="bodySm" color={G.meta} style={{ fontSize: 11 }}>
            Tap to refresh IL Guide
          </ILText>
        </Pressable>
      ) : null}
    </WhiteCard>
  );
}

function taskIdFromWhisperId(id) {
  if (!id) return null;
  if (id.startsWith('learn-rec-')) return id.slice('learn-rec-'.length);
  if (id.startsWith('home-progress-')) return id.slice('home-progress-'.length);
  return null;
}

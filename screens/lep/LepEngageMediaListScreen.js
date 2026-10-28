import React from 'react';
import { ScrollView, View } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation, useRoute } from '@react-navigation/native';
import ILText from '../../components/il/ILText';
import { G } from '../../constants/guestTheme';
import { GuestBackBar } from '../guest/GuestBits';
import { CoverThumb, Page } from './LepBits';
import Pressable from '../../components/il/Press';
import { useLepNav } from './useLepNav';
import { CSUITE_HOME } from '../guest/guestData';
import { PODCASTS } from './lepData';
import { ENGAGE_VIDEO_SECTION, engageVideoShelfLabel } from '../../utils/learnMediaShelves';
import { LIQUID_TAB_PAD } from '../../components/il/LiquidTabBar';

/** YouTube mobile “Up next” thumb size (~16:9). */
const ROW_THUMB_W = 158;
const ROW_THUMB_H = 89;

const CONFIG = {
  csuite: {
    title: ENGAGE_VIDEO_SECTION.title,
    sub: ENGAGE_VIDEO_SECTION.sub,
  },
  podcast: {
    title: 'Iron Lady Speaks',
    sub: 'Conversations with women who made the leap',
  },
};

function durationFromMeta(meta) {
  if (!meta) return null;
  const bit = String(meta).split('·').pop();
  return bit ? bit.trim() : null;
}

function episodeFromMeta(meta) {
  if (!meta) return null;
  const bit = String(meta).split('·')[0];
  return bit ? bit.trim() : null;
}

/**
 * Compact row like YouTube browse (thumb left, copy right) — not full-bleed stacked posters.
 */
function CompactVideoRow({ img, title, line1, line2, duration, onPress, isLast }) {
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      style={{
        flexDirection: 'row',
        alignItems: 'flex-start',
        paddingVertical: 12,
        borderBottomWidth: isLast ? 0 : 1,
        borderBottomColor: G.line,
      }}
    >
      <View
        style={{
          width: ROW_THUMB_W,
          height: ROW_THUMB_H,
          borderRadius: 10,
          overflow: 'hidden',
          backgroundColor: G.dark,
        }}
      >
        <CoverThumb source={img} height={ROW_THUMB_H} time={duration} timeAlign="right" radius={10} />
      </View>
      <View style={{ flex: 1, marginLeft: 12, minHeight: ROW_THUMB_H, justifyContent: 'center' }}>
        <ILText
          role="label"
          color={G.ink}
          numberOfLines={2}
          style={{ fontSize: 14, lineHeight: 19, letterSpacing: -0.15 }}
        >
          {title}
        </ILText>
        {line1 ? (
          <ILText role="bodySm" color={G.meta} numberOfLines={1} style={{ marginTop: 6, fontSize: 12 }}>
            {line1}
          </ILText>
        ) : null}
        {line2 ? (
          <ILText role="bodySm" color={G.meta} numberOfLines={1} style={{ marginTop: 3, fontSize: 12 }}>
            {line2}
          </ILText>
        ) : null}
      </View>
    </Pressable>
  );
}

export default function LepEngageMediaListScreen() {
  const route = useRoute();
  const navigation = useNavigation();
  const insets = useSafeAreaInsets();
  const nav = useLepNav();
  const kind = route.params?.kind === 'podcast' ? 'podcast' : 'csuite';
  const meta = CONFIG[kind];

  const items =
    kind === 'csuite'
      ? CSUITE_HOME.map((c) => ({
          key: c.assetKey,
          img: c.img,
          title: c.title,
          line1: c.who,
          line2: engageVideoShelfLabel(c),
          duration: null,
          watch: { assetKey: c.assetKey, title: c.title, sub: c.who },
        }))
      : PODCASTS.map((ep) => ({
          key: ep.assetKey,
          img: ep.img,
          title: ep.title,
          line1: ep.who,
          line2: episodeFromMeta(ep.meta),
          duration: durationFromMeta(ep.meta),
          watch: { assetKey: ep.assetKey, title: ep.title, sub: ep.who },
        }));

  return (
    <Page>
      <StatusBar style="dark" />
      <View style={{ paddingTop: Math.max(insets.top, 8), paddingHorizontal: 20 }}>
        <GuestBackBar title={meta.title} sub={meta.sub} onBack={() => navigation.goBack()} />
      </View>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{
          paddingHorizontal: 20,
          paddingTop: 8,
          paddingBottom: LIQUID_TAB_PAD + Math.max(insets.bottom, 8) + 16,
        }}
      >
        <View style={{ borderRadius: 16, backgroundColor: '#FFFFFF', paddingHorizontal: 12, paddingVertical: 4 }}>
          {items.map((item, index) => (
            <CompactVideoRow
              key={item.key}
              img={item.img}
              title={item.title}
              line1={item.line1}
              line2={item.line2}
              duration={item.duration}
              isLast={index === items.length - 1}
              onPress={() => nav.goWatch(item.watch)}
            />
          ))}
        </View>
        {kind === 'podcast' ? (
          <ILText role="bodySm" color={G.meta} align="center" style={{ marginTop: 16, fontSize: 12 }}>
            Also on Apple Podcasts, Amazon Music and iHeart
          </ILText>
        ) : null}
      </ScrollView>
    </Page>
  );
}

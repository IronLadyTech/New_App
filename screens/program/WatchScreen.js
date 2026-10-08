import React from 'react';
import { ScrollView, View } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { MaterialIcons } from '@expo/vector-icons';
import { useNavigation, useRoute } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Pressable from '../../components/il/Press';
import { GuestBackBar } from '../guest/GuestBits';
import ILText from '../../components/il/ILText';
import { IL_FONTS } from '../../constants/ironLadyBrand';
import { G, af } from '../../constants/guestTheme';
import { LIQUID_TAB_PAD } from '../../components/il/LiquidTabBar';
import PracticeVideo from '../../components/program/PracticeVideo';
import { CoverThumb, Page, WhiteCard } from '../lep/LepBits';
import { getVideoPoster } from '../../constants/preworkThumbs';
import { getWatchMeta } from '../../constants/watchMeta';
import { getAssetVideoUrl } from '../../utils/resolveVideoUrl';
import { navigateWatch } from '../../utils/watchNav';
import { CSUITE_HOME } from '../guest/guestData';
import { PODCASTS } from '../lep/lepData';

function lookupCard(assetKey) {
  const podcast = PODCASTS.find((p) => p.assetKey === assetKey);
  if (podcast) return { title: podcast.title, sub: podcast.who, img: podcast.img };
  const csuite = CSUITE_HOME.find((c) => c.assetKey === assetKey);
  if (csuite) return { title: csuite.title, sub: csuite.who, img: csuite.img };
  return null;
}

export default function WatchScreen() {
  const navigation = useNavigation();
  const { params = {} } = useRoute();
  const insets = useSafeAreaInsets();
  const uri = params.videoUrl || getAssetVideoUrl(params.assetKey);
  const poster = getVideoPoster({
    assetKey: params.assetKey,
    practiceId: params.practiceId,
    taskId: params.taskId,
    uri,
    poster: params.poster,
    img: params.img,
  });
  const meta = getWatchMeta({
    assetKey: params.assetKey,
    practiceId: params.practiceId,
    title: params.title,
    sub: params.sub,
  });

  const openRelated = (assetKey) => {
    const card = lookupCard(assetKey);
    navigateWatch(navigation, {
      assetKey,
      title: card?.title,
      sub: card?.sub,
      img: card?.img,
    });
  };

  const openPractice = () => {
    if (!meta.practiceId) return;
    const names = navigation.getState()?.routeNames || [];
    if (names.includes('Practice')) {
      navigation.navigate('Practice', { programId: 'lep', practiceId: meta.practiceId });
      return;
    }
    navigation.navigate('Home', { screen: 'Practice', params: { programId: 'lep', practiceId: meta.practiceId } });
  };

  return (
    <Page>
      <StatusBar style="dark" />
      <View style={{ paddingTop: Math.max(insets.top, 8) }}>
        <GuestBackBar title={params.title || 'Watch'} sub={params.sub} onBack={() => navigation.goBack()} />
      </View>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{
          paddingHorizontal: 20,
          paddingBottom: LIQUID_TAB_PAD + Math.max(insets.bottom, 8),
        }}
      >
        {uri ? (
          <PracticeVideo uri={uri} poster={poster} height={220} />
        ) : (
          <ILText role="body" color={G.meta} style={{ marginTop: 24, textAlign: 'center' }}>
            This video is not available in the demo yet.
          </ILText>
        )}

        <View style={{ marginTop: 16, flexDirection: 'row', alignItems: 'center', flexWrap: 'wrap' }}>
          <View style={{ backgroundColor: G.pink, borderRadius: 999, paddingHorizontal: 10, paddingVertical: 5, marginRight: 8 }}>
            <ILText role="eyebrow" color={G.cta} style={[af, { fontSize: 9 }]}>
              {meta.tag}
            </ILText>
          </View>
          {meta.series ? (
            <ILText role="bodySm" color={G.meta} style={{ fontSize: 12 }}>
              {meta.series}
            </ILText>
          ) : null}
        </View>

        {params.title ? (
          <ILText
            role="title"
            color={G.ink}
            style={{ marginTop: 10, fontFamily: IL_FONTS.display, fontSize: 22, lineHeight: 28 }}
          >
            {params.title}
          </ILText>
        ) : null}
        {params.sub ? (
          <ILText role="body" color={G.meta} style={{ marginTop: 6, fontSize: 14 }}>
            {params.sub}
          </ILText>
        ) : null}

        {meta.takeaways.length ? (
          <WhiteCard style={{ marginTop: 18, borderRadius: 20, padding: 16 }}>
            <ILText role="eyebrow" color={G.cta} style={[af, { fontSize: 10 }]}>
              KEY TAKEAWAYS
            </ILText>
            {meta.takeaways.map((line) => (
              <View key={line} style={{ flexDirection: 'row', marginTop: 12, alignItems: 'flex-start' }}>
                <MaterialIcons name="check-circle" size={16} color={G.cta} style={{ marginTop: 2 }} />
                <ILText role="body" color={G.body} style={{ flex: 1, marginLeft: 10, fontSize: 14, lineHeight: 20 }}>
                  {line}
                </ILText>
              </View>
            ))}
          </WhiteCard>
        ) : null}

        {meta.prompt ? (
          <WhiteCard
            style={{
              marginTop: 12,
              borderRadius: 20,
              padding: 16,
              borderLeftWidth: 3,
              borderLeftColor: G.cta,
            }}
          >
            <ILText role="eyebrow" color={G.cta} style={[af, { fontSize: 10 }]}>
              IL GUIDE ASKS
            </ILText>
            <ILText role="title" color={G.ink} style={{ marginTop: 8, fontFamily: IL_FONTS.display, fontSize: 18, lineHeight: 24 }}>
              {meta.prompt}
            </ILText>
            <ILText role="bodySm" color={G.meta} style={{ marginTop: 8, fontSize: 13, lineHeight: 18 }}>
              Jot a one-line answer in your practice journal after you watch.
            </ILText>
          </WhiteCard>
        ) : null}

        {params.body ? (
          <ILText role="body" color={G.body} style={{ marginTop: 16, fontSize: 15, lineHeight: 22 }}>
            {params.body}
          </ILText>
        ) : null}

        {meta.practiceId ? (
          <Pressable
            onPress={openPractice}
            style={{
              marginTop: 16,
              backgroundColor: G.cta,
              borderRadius: 999,
              paddingVertical: 14,
              alignItems: 'center',
            }}
          >
            <ILText role="label" color="#FFFFFF">
              {meta.practiceLabel || 'Open practice'}
            </ILText>
          </Pressable>
        ) : null}

        {meta.relatedKeys.length ? (
          <View style={{ marginTop: 26 }}>
            <ILText role="title" color={G.ink} style={{ fontFamily: IL_FONTS.display, fontSize: 20 }}>
              Up next
            </ILText>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginTop: 12, marginHorizontal: -20 }}>
              <View style={{ flexDirection: 'row', paddingHorizontal: 20 }}>
                {meta.relatedKeys.map((key) => {
                  const card = lookupCard(key);
                  if (!card) return null;
                  return (
                    <Pressable
                      key={key}
                      onPress={() => openRelated(key)}
                      style={{ width: 200, marginRight: 12 }}
                    >
                      <WhiteCard style={{ borderRadius: 16, overflow: 'hidden' }}>
                        <View style={{ aspectRatio: 16 / 9, backgroundColor: G.dark }}>
                          <CoverThumb source={card.img} play />
                        </View>
                        <View style={{ padding: 10 }}>
                          <ILText role="label" color={G.ink} style={{ fontSize: 12 }} numberOfLines={2}>
                            {card.title}
                          </ILText>
                          <ILText role="bodySm" color={G.meta} style={{ marginTop: 4, fontSize: 11 }} numberOfLines={1}>
                            {card.sub}
                          </ILText>
                        </View>
                      </WhiteCard>
                    </Pressable>
                  );
                })}
              </View>
            </ScrollView>
          </View>
        ) : null}
      </ScrollView>
    </Page>
  );
}

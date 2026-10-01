import React from 'react';
import { Image, Pressable, ScrollView, View } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { MaterialIcons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { IL_FONTS } from '../../constants/ironLadyBrand';
import ILText from '../../components/il/ILText';
import { G, af } from '../../constants/guestTheme';
import { GuestBackBar, Page, PlayDisc, WhiteCard, fillAbs } from './GuestBits';
import { HERO } from './guestData';
import { LIQUID_TAB_PAD } from '../../components/il/LiquidTabBar';

const FALLBACK = 'By March 2028 I will run the India P&L, not report into it.';

export default function GuestChallengeBonusScreen({ navigation, route }) {
  const insets = useSafeAreaInsets();
  const bhag = route?.params?.bhag || FALLBACK;

  return (
    <Page>
      <StatusBar style="dark" />
      <View style={{ paddingTop: Math.max(insets.top, 8) }}>
        <GuestBackBar title="Day 1 · done" sub="Bonus unlocked" onBack={() => navigation.goBack()} />
      </View>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{
          paddingHorizontal: 20,
          paddingBottom: LIQUID_TAB_PAD + Math.max(insets.bottom, 8),
        }}
      >
        <WhiteCard style={{ borderRadius: 22, padding: 16, flexDirection: 'row', alignItems: 'flex-start' }}>
          <View
            style={{
              width: 28,
              height: 28,
              borderRadius: 14,
              backgroundColor: G.dark,
              alignItems: 'center',
              justifyContent: 'center',
              marginRight: 12,
              marginTop: 2,
            }}
          >
            <MaterialIcons name="check" size={16} color="#FFFFFF" />
          </View>
          <View style={{ flex: 1 }}>
            <ILText role="label" color={G.ink} style={{ fontSize: 15 }}>
              Your BHAG is on your card.
            </ILText>
            <ILText
              role="body"
              color={G.meta}
              style={{ marginTop: 6, fontFamily: IL_FONTS.displayItalic, fontSize: 15, lineHeight: 22 }}
            >
              “{bhag}”
            </ILText>
          </View>
        </WhiteCard>

        <ILText
          role="display"
          color={G.ink}
          style={{
            marginTop: 22,
            fontFamily: IL_FONTS.display,
            fontSize: 32,
            lineHeight: 38,
            letterSpacing: -0.5,
          }}
        >
          From regional lead to P&L owner in 18 months
        </ILText>
        <ILText role="body" color={G.meta} style={{ marginTop: 10, fontSize: 15, lineHeight: 22 }}>
          Matched to managers in marketing
        </ILText>

        <View style={{ marginTop: 16, height: 200, borderRadius: 24, overflow: 'hidden', backgroundColor: G.dark }}>
          <Image source={HERO} style={fillAbs} resizeMode="cover" />
          <View style={{ ...fillAbs, alignItems: 'center', justifyContent: 'center' }}>
            <PlayDisc size={56} />
          </View>
          <View
            style={{
              position: 'absolute',
              right: 12,
              bottom: 14,
              backgroundColor: 'rgba(17,55,68,0.72)',
              borderRadius: 999,
              paddingHorizontal: 8,
              paddingVertical: 3,
            }}
          >
            <ILText role="eyebrow" color="#FFFFFF" style={[af, { fontSize: 10 }]}>
              4:10
            </ILText>
          </View>
        </View>

        <WhiteCard
          style={{
            marginTop: 12,
            borderRadius: 22,
            padding: 14,
            flexDirection: 'row',
            alignItems: 'center',
          }}
        >
          <View
            style={{
              width: 28,
              height: 28,
              borderRadius: 14,
              borderWidth: 1.5,
              borderColor: G.pink,
              alignItems: 'center',
              justifyContent: 'center',
              marginRight: 12,
            }}
          >
            <View style={{ width: 10, height: 10, borderRadius: 2, borderWidth: 1.5, borderColor: G.cta }} />
          </View>
          <View style={{ flex: 1 }}>
            <ILText role="label" color={G.ink} style={{ fontSize: 14 }}>
              Read the case study
            </ILText>
            <ILText role="bodySm" color={G.meta} style={{ marginTop: 2, fontSize: 12, lineHeight: 17 }}>
              A before/after from an alumna at your level · 3 min
            </ILText>
          </View>
          <MaterialIcons name="chevron-right" size={20} color={G.meta} />
        </WhiteCard>

        <ILText role="eyebrow" color={G.cta} style={[af, { marginTop: 22, fontSize: 10, letterSpacing: 1.1 }]}>
          Tomorrow, 7:00 PM
        </ILText>
        <ILText
          role="title"
          color={G.ink}
          style={{ marginTop: 8, fontFamily: IL_FONTS.display, fontSize: 24, lineHeight: 30 }}
        >
          Why nobody senior knows what you did — and your number.
        </ILText>

        <Pressable
          onPress={() => navigation.navigate('ChallengeHub')}
          style={{
            marginTop: 22,
            backgroundColor: G.dark,
            borderRadius: 999,
            paddingVertical: 15,
            alignItems: 'center',
          }}
        >
          <ILText role="label" color="#FFFFFF">
            Back to my challenge
          </ILText>
        </Pressable>
        <Pressable
          style={{
            marginTop: 10,
            borderRadius: 999,
            paddingVertical: 15,
            alignItems: 'center',
            borderWidth: 1,
            borderColor: G.dash,
            backgroundColor: G.white,
          }}
        >
          <ILText role="label" color={G.ink}>
            Post my BHAG to the batch wall
          </ILText>
        </Pressable>
      </ScrollView>
    </Page>
  );
}

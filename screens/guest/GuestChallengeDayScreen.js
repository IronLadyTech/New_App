import React, { useState } from 'react';
import { Image, Pressable, ScrollView, TextInput, View } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { MaterialIcons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { IL_FONTS } from '../../constants/ironLadyBrand';
import ILText from '../../components/il/ILText';
import { G, af } from '../../constants/guestTheme';
import { GuestBackBar, Page, PlayDisc, WhiteCard, fillAbs } from './GuestBits';
import { HERO } from './guestData';
import { LIQUID_TAB_PAD } from '../../components/il/LiquidTabBar';

const SAMPLE = 'By March 2028 I will run the India P&L, not report into it.';
const ACTIONS = [
  'Building your network',
  'Developing leadership skills',
  'Understanding the business',
  'Increasing market visibility',
  'Learning new capabilities',
];

export default function GuestChallengeDayScreen({ navigation }) {
  const insets = useSafeAreaInsets();
  const [bhag, setBhag] = useState(SAMPLE);
  const [picked, setPicked] = useState(['Increasing market visibility']);

  const toggle = (item) => {
    setPicked((cur) => {
      if (cur.includes(item)) return cur.filter((x) => x !== item);
      if (cur.length >= 2) return [cur[1], item];
      return [...cur, item];
    });
  };

  return (
    <Page>
      <StatusBar style="dark" />
      <View style={{ paddingTop: Math.max(insets.top, 8) }}>
        <GuestBackBar
          title="Day 1 of 4"
          sub="BHAG and breakthrough actions"
          onBack={() => navigation.goBack()}
        />
      </View>
      <ScrollView
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
        contentContainerStyle={{
          paddingHorizontal: 20,
          paddingBottom: LIQUID_TAB_PAD + Math.max(insets.bottom, 8),
        }}
      >
        <View style={{ height: 200, borderRadius: 24, overflow: 'hidden', backgroundColor: G.dark }}>
          <Image source={HERO} style={fillAbs} resizeMode="cover" />
          <View style={{ ...fillAbs, alignItems: 'center', justifyContent: 'center' }}>
            <PlayDisc size={56} />
          </View>
          <ILText
            role="label"
            color="#FFFFFF"
            style={{
              position: 'absolute',
              left: 16,
              bottom: 14,
              fontFamily: IL_FONTS.display,
              fontSize: 16,
              lineHeight: 20,
            }}
          >
            Knowledge is not implementation
          </ILText>
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
              15:20
            </ILText>
          </View>
        </View>

        <WhiteCard style={{ marginTop: 16, borderRadius: 24, padding: 18 }}>
          <ILText role="eyebrow" color={G.cta} style={[af, { fontSize: 10, letterSpacing: 1.1 }]}>
            Task 1 · Your BHAG
          </ILText>
          <ILText
            role="display"
            color={G.ink}
            style={{
              marginTop: 10,
              fontFamily: IL_FONTS.display,
              fontSize: 28,
              lineHeight: 34,
              letterSpacing: -0.4,
            }}
          >
            Write your Big Hairy Audacious Goal in one sentence.
          </ILText>
          <ILText role="body" color={G.meta} style={{ marginTop: 10, fontSize: 15, lineHeight: 22 }}>
            Specific, time-bound, and big enough that saying it aloud feels uncomfortable.
          </ILText>
          <TextInput
            value={bhag}
            onChangeText={setBhag}
            multiline
            textAlignVertical="top"
            placeholder={SAMPLE}
            placeholderTextColor={G.meta}
            style={{
              marginTop: 16,
              minHeight: 96,
              borderRadius: 20,
              backgroundColor: G.page,
              paddingHorizontal: 16,
              paddingVertical: 16,
              color: G.ink,
              fontFamily: IL_FONTS.display,
              fontSize: 18,
              lineHeight: 26,
            }}
          />
        </WhiteCard>

        <WhiteCard style={{ marginTop: 12, borderRadius: 24, padding: 18 }}>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
            <ILText role="eyebrow" color={G.cta} style={[af, { fontSize: 10, letterSpacing: 1.1 }]}>
              Task 2 · Breakthrough actions
            </ILText>
            <ILText role="bodySm" color={G.meta} style={{ fontSize: 12 }}>
              {picked.length} of 2
            </ILText>
          </View>
          <ILText
            role="title"
            color={G.ink}
            style={{ marginTop: 10, fontFamily: IL_FONTS.display, fontSize: 22, lineHeight: 28 }}
          >
            Pick the two actions that will move your BHAG most.
          </ILText>
          <View style={{ marginTop: 14 }}>
            {ACTIONS.map((item) => {
              const on = picked.includes(item);
              return (
                <Pressable
                  key={item}
                  onPress={() => toggle(item)}
                  accessibilityRole="button"
                  accessibilityState={{ selected: on }}
                  style={{
                    marginTop: 8,
                    borderRadius: 999,
                    paddingVertical: 13,
                    paddingHorizontal: 18,
                    backgroundColor: on ? G.dark : G.white,
                    borderWidth: 1,
                    borderColor: on ? G.dark : G.line,
                  }}
                >
                  <ILText role="label" color={on ? '#FFFFFF' : G.ink} style={{ fontSize: 14 }}>
                    {item}
                  </ILText>
                </Pressable>
              );
            })}
          </View>
        </WhiteCard>

        <Pressable
          onPress={() => navigation.replace('ChallengeComplete', { bhag: bhag.trim() || SAMPLE })}
          style={{
            marginTop: 16,
            backgroundColor: G.cta,
            borderRadius: 999,
            paddingVertical: 15,
            alignItems: 'center',
            flexDirection: 'row',
            justifyContent: 'center',
          }}
        >
          <ILText role="label" color="#FFFFFF">
            Submit Day 1
          </ILText>
          <MaterialIcons name="arrow-forward" size={16} color="#FFFFFF" style={{ marginLeft: 6 }} />
        </Pressable>

        <View
          style={{
            marginTop: 12,
            borderRadius: 22,
            borderWidth: 1,
            borderColor: G.dash,
            padding: 16,
            flexDirection: 'row',
            alignItems: 'center',
          }}
        >
          <MaterialIcons name="lock-outline" size={18} color={G.meta} />
          <View style={{ flex: 1, marginLeft: 12 }}>
            <ILText role="eyebrow" color={G.meta} style={[af, { fontSize: 9, letterSpacing: 1 }]}>
              Bonus · Unlocks on submit
            </ILText>
            <ILText role="label" color={G.ink} style={{ marginTop: 4, fontSize: 14, lineHeight: 20 }}>
              From regional lead to P&L owner in 18 months
            </ILText>
            <ILText role="bodySm" color={G.meta} style={{ marginTop: 2, fontSize: 12 }}>
              Case study + a 4-minute video
            </ILText>
          </View>
        </View>
      </ScrollView>
    </Page>
  );
}

import React from 'react';
import { Image, Pressable, ScrollView, View } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { MaterialIcons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { IL_FONTS } from '../../constants/ironLadyBrand';
import ILText from '../../components/il/ILText';
import { G, af } from '../../constants/guestTheme';
import { GuestBackBar, Page } from './GuestBits';
import { LIQUID_TAB_PAD } from '../../components/il/LiquidTabBar';
import { useGuestActions } from './useGuestActions';

const LOGO = require('../../assets/il/logo.jpg');

const LINES = [
  { k: 'BHAG', v: 'By March 2028 I will run the India P&L, not report into it.' },
  { k: 'Market worth', v: '₹50 lakh' },
  {
    k: 'Brand statement',
    v: 'I stay in the room when it turns political — and bring the number that ends the argument.',
  },
  { k: 'The ask', v: 'I’d like to discuss leading the Q3 launch end to end.' },
];

export default function GuestChallengeDoneScreen({ navigation }) {
  const insets = useSafeAreaInsets();
  const { goProgram } = useGuestActions();

  return (
    <Page>
      <StatusBar style="dark" />
      <View style={{ paddingTop: Math.max(insets.top, 8) }}>
        <GuestBackBar title="Challenge complete" sub="4 of 4 days" onBack={() => navigation.goBack()} />
      </View>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{
          paddingHorizontal: 20,
          paddingBottom: LIQUID_TAB_PAD + Math.max(insets.bottom, 8),
        }}
      >
        <ILText
          role="eyebrow"
          color={G.cta}
          style={[af, { marginTop: 8, fontSize: 13, textAlign: 'center', letterSpacing: 0 }]}
        >
          Four evenings. Done.
        </ILText>
        <ILText
          role="display"
          color={G.ink}
          style={{
            marginTop: 8,
            fontFamily: IL_FONTS.display,
            fontSize: 34,
            lineHeight: 40,
            letterSpacing: -0.6,
            textAlign: 'center',
          }}
        >
          Your Leadership Card is ready, Priya.
        </ILText>

        <View style={{ marginTop: 22, backgroundColor: G.dark, borderRadius: 28, padding: 20 }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <Image source={LOGO} style={{ width: 22, height: 22, borderRadius: 4, marginRight: 8 }} />
              <ILText role="label" color="#FFFFFF" style={{ fontSize: 13 }}>
                Leadership Card
              </ILText>
            </View>
            <ILText role="bodySm" color="rgba(255,255,255,0.55)" style={{ fontSize: 12 }}>
              Batch Nov-A
            </ILText>
          </View>
          <ILText
            role="title"
            color="#FFFFFF"
            style={{ marginTop: 18, fontFamily: IL_FONTS.display, fontSize: 28, lineHeight: 34 }}
          >
            Priya S.
          </ILText>
          {LINES.map((row, i) => (
            <View
              key={row.k}
              style={{
                marginTop: 16,
                paddingTop: i ? 16 : 0,
                borderTopWidth: i ? 1 : 0,
                borderTopColor: 'rgba(255,255,255,0.12)',
              }}
            >
              <ILText role="eyebrow" color={G.pink} style={[af, { fontSize: 10, letterSpacing: 1.1 }]}>
                {row.k}
              </ILText>
              <ILText role="body" color="#FFFFFF" style={{ marginTop: 6, fontSize: 15, lineHeight: 22 }}>
                {row.v}
              </ILText>
            </View>
          ))}
        </View>

        <View style={{ flexDirection: 'row', marginTop: 14 }}>
          <Pressable
            style={{
              flex: 1,
              marginRight: 6,
              backgroundColor: G.dark,
              borderRadius: 999,
              paddingVertical: 13,
              alignItems: 'center',
              flexDirection: 'row',
              justifyContent: 'center',
            }}
          >
            <MaterialIcons name="share" size={16} color="#FFFFFF" />
            <ILText role="label" color="#FFFFFF" style={{ marginLeft: 8 }}>
              Share card
            </ILText>
          </Pressable>
          <Pressable
            style={{
              flex: 1,
              marginLeft: 6,
              backgroundColor: G.white,
              borderRadius: 999,
              paddingVertical: 13,
              alignItems: 'center',
              borderWidth: 1,
              borderColor: G.line,
            }}
          >
            <ILText role="label" color={G.ink}>
              Add to LinkedIn
            </ILText>
          </Pressable>
        </View>

        <View style={{ marginTop: 16, backgroundColor: G.pink, borderRadius: 28, padding: 20 }}>
          <ILText role="eyebrow" color={G.cta} style={[af, { fontSize: 10, letterSpacing: 1.1 }]}>
            What’s next
          </ILText>
          <ILText
            role="display"
            color={G.ink}
            style={{ marginTop: 8, fontFamily: IL_FONTS.display, fontSize: 26, lineHeight: 32, letterSpacing: -0.4 }}
          >
            You built 4 principles. There are 23 more.
          </ILText>
          <ILText role="body" color={G.body} style={{ marginTop: 10, fontSize: 15, lineHeight: 22 }}>
            The Leadership Essentials program (LEP) takes you through all 27 — a 2-day intensive, four weeks with your cohort, and certification.
          </ILText>
          <Pressable
            onPress={() => goProgram('lep')}
            style={{
              marginTop: 16,
              backgroundColor: G.cta,
              borderRadius: 999,
              paddingVertical: 14,
              alignItems: 'center',
              flexDirection: 'row',
              justifyContent: 'center',
            }}
          >
            <ILText role="label" color="#FFFFFF">
              Explore LEP
            </ILText>
            <MaterialIcons name="arrow-forward" size={16} color="#FFFFFF" style={{ marginLeft: 6 }} />
          </Pressable>
          <ILText role="bodySm" color={G.meta} style={{ marginTop: 12, textAlign: 'center', fontSize: 12 }}>
            Live Q&A tonight · 8:00 PM · 30 min
          </ILText>
        </View>
      </ScrollView>
    </Page>
  );
}

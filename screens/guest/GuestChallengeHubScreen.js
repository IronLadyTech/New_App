import React from 'react';
import { Pressable, ScrollView, View } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { MaterialIcons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { IL_FONTS } from '../../constants/ironLadyBrand';
import ILText from '../../components/il/ILText';
import { G, af } from '../../constants/guestTheme';
import { GuestBackBar, Page, PinkDisc, StatNum, WhiteCard } from './GuestBits';
import { LIQUID_TAB_PAD } from '../../components/il/LiquidTabBar';

const CARD = [
  { t: 'Your BHAG', d: 'Day 1 · tonight' },
  { t: 'Your number', d: '₹50 lakh · from the 5x rule', on: true },
  { t: 'Your brand statement', d: 'Day 3' },
  { t: 'Your ask', d: 'Day 4' },
];

const UPCOMING = [
  { n: '2', t: 'Projection and your worth', d: 'Opens Tue at 7:00 PM' },
  { n: '3', t: 'Brand and shameless pitching', d: 'Opens Wed at 7:00 PM' },
  { n: '4', t: 'Negotiation and politics', d: 'Opens Thu at 7:00 PM' },
];

export default function GuestChallengeHubScreen({ navigation }) {
  const insets = useSafeAreaInsets();

  return (
    <Page>
      <StatusBar style="dark" />
      <View style={{ paddingTop: Math.max(insets.top, 8) }}>
        <GuestBackBar
          title="The 4-Day Challenge"
          sub="Batch Nov-A · 15 women"
          onBack={() => navigation.goBack()}
          right={
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Share"
              style={{
                width: 40,
                height: 40,
                borderRadius: 20,
                backgroundColor: G.white,
                borderWidth: 1,
                borderColor: G.line,
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <MaterialIcons name="share" size={18} color={G.ink} />
            </Pressable>
          }
        />
      </View>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{
          paddingHorizontal: 20,
          paddingBottom: LIQUID_TAB_PAD + Math.max(insets.bottom, 8),
        }}
      >
        <ILText role="eyebrow" color={G.cta} style={[af, { fontSize: 11 }]}>
          You’re in, Priya.
        </ILText>
        <ILText
          role="display"
          color={G.ink}
          style={{ marginTop: 8, fontFamily: IL_FONTS.display, fontSize: 30, lineHeight: 36, letterSpacing: -0.5 }}
        >
          Four evenings. Four principles. One Leadership Card.
        </ILText>
        <ILText role="bodySm" color={G.meta} style={{ marginTop: 8, fontSize: 13 }}>
          Tailored for managers in marketing
        </ILText>
        <View style={{ flexDirection: 'row', marginTop: 16 }}>
          {[1, 0.35, 0.35, 0.35].map((o, i) => (
            <View
              key={i}
              style={{
                flex: 1,
                height: 4,
                borderRadius: 2,
                marginRight: i < 3 ? 6 : 0,
                backgroundColor: G.cta,
                opacity: o,
              }}
            />
          ))}
        </View>

        <View style={{ marginTop: 18, backgroundColor: G.dark, borderRadius: 24, padding: 20 }}>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
            <View
              style={{
                backgroundColor: G.cta,
                borderRadius: 999,
                paddingHorizontal: 10,
                paddingVertical: 4,
              }}
            >
              <ILText role="eyebrow" color="#FFFFFF" style={[af, { fontSize: 9 }]}>
                Day 1 · Tonight
              </ILText>
            </View>
            <ILText role="bodySm" color="rgba(255,255,255,0.7)" style={{ fontSize: 12 }}>
              Opens in 6h 12m
            </ILText>
          </View>
          <ILText
            role="title"
            color="#FFFFFF"
            style={{ marginTop: 14, fontFamily: IL_FONTS.display, fontSize: 24, lineHeight: 30 }}
          >
            BHAG and breakthrough actions
          </ILText>
          <ILText
            role="bodySm"
            color="rgba(255,255,255,0.72)"
            style={{ marginTop: 8, fontSize: 13, lineHeight: 19 }}
          >
            Where every Iron Lady journey starts: name the goal, then pick where to put your energy. 15 minutes, one task, one bonus.
          </ILText>
          <Pressable
            onPress={() => navigation.navigate('ChallengeDay')}
            style={{
              marginTop: 16,
              backgroundColor: G.cta,
              borderRadius: 999,
              paddingVertical: 13,
              alignItems: 'center',
              flexDirection: 'row',
              justifyContent: 'center',
            }}
          >
            <ILText role="label" color="#FFFFFF">
              Preview Day 1
            </ILText>
            <MaterialIcons name="arrow-forward" size={16} color="#FFFFFF" style={{ marginLeft: 6 }} />
          </Pressable>
        </View>

        <WhiteCard style={{ marginTop: 14, borderRadius: 22, padding: 16 }}>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
            <ILText role="eyebrow" color={G.cta} style={[af, { fontSize: 10 }]}>
              Your leadership card
            </ILText>
            <ILText role="bodySm" color={G.meta} style={{ fontSize: 12 }}>
              1 of 4
            </ILText>
          </View>
          {CARD.map((c) => (
            <View key={c.t} style={{ flexDirection: 'row', alignItems: 'center', marginTop: 14 }}>
              <View
                style={{
                  width: 22,
                  height: 22,
                  borderRadius: 11,
                  borderWidth: c.on ? 0 : 1.5,
                  borderColor: G.line,
                  backgroundColor: c.on ? G.ink : 'transparent',
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginRight: 12,
                }}
              >
                {c.on ? <MaterialIcons name="check" size={14} color="#FFFFFF" /> : null}
              </View>
              <View style={{ flex: 1 }}>
                <ILText
                  role="label"
                  color={G.ink}
                  style={{ fontSize: 14, fontStyle: c.on ? 'italic' : 'normal' }}
                >
                  {c.t}
                </ILText>
                <ILText role="bodySm" color={G.meta} style={{ fontSize: 12 }}>
                  {c.d}
                </ILText>
              </View>
            </View>
          ))}
          <Pressable onPress={() => navigation.navigate('ChallengeDone')} style={{ marginTop: 14 }}>
            <ILText role="label" color={G.cta} style={{ fontSize: 13 }}>
              See a finished card →
            </ILText>
          </Pressable>
        </WhiteCard>

        <ILText role="eyebrow" color={G.meta} style={[af, { marginTop: 22, fontSize: 10 }]}>
          Coming up
        </ILText>
        {UPCOMING.map((u) => (
          <WhiteCard
            key={u.n}
            style={{
              marginTop: 10,
              borderRadius: 18,
              padding: 14,
              flexDirection: 'row',
              alignItems: 'center',
            }}
          >
            <View
              style={{
                width: 32,
                height: 32,
                borderRadius: 16,
                backgroundColor: '#EDE9D8',
                alignItems: 'center',
                justifyContent: 'center',
                marginRight: 12,
              }}
            >
              <StatNum size={14} color={G.ink}>
                {u.n}
              </StatNum>
            </View>
            <View style={{ flex: 1 }}>
              <ILText role="label" color={G.ink} style={{ fontSize: 14 }}>
                {u.t}
              </ILText>
              <ILText role="bodySm" color={G.meta} style={{ fontSize: 12 }}>
                {u.d}
              </ILText>
            </View>
            <MaterialIcons name="lock-outline" size={16} color={G.meta} />
          </WhiteCard>
        ))}

        <View style={{ flexDirection: 'row', marginTop: 12 }}>
          <WhiteCard style={{ flex: 1, marginRight: 8, borderRadius: 18, padding: 16 }}>
            <PinkDisc name="groups" size={32} />
            <ILText role="label" color={G.ink} style={{ marginTop: 10, fontSize: 14 }}>
              Batch wall
            </ILText>
            <ILText role="bodySm" color={G.meta} style={{ marginTop: 4, fontSize: 12 }}>
              What 14 others wrote today
            </ILText>
          </WhiteCard>
          <WhiteCard style={{ flex: 1, marginLeft: 8, borderRadius: 18, padding: 16 }}>
            <PinkDisc name="emoji-events" size={32} />
            <ILText role="label" color={G.ink} style={{ marginTop: 10, fontSize: 14 }}>
              Invite a woman
            </ILText>
            <ILText role="bodySm" color={G.meta} style={{ marginTop: 4, fontSize: 12 }}>
              Who should be in this room
            </ILText>
          </WhiteCard>
        </View>
      </ScrollView>
    </Page>
  );
}

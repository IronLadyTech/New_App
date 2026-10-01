import React, { useMemo, useState } from 'react';
import { ScrollView, View } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialIcons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { IL_FONTS } from '../../constants/ironLadyBrand';
import ILText from '../../components/il/ILText';
import GuestHeader from '../../components/il/GuestHeader';
import { G, af } from '../../constants/guestTheme';
import {
  ActionLabel,
  DarkCard,
  FindCta,
  Kicker,
  Page,
  PillRow,
  SectionHead,
  WhiteCard,
} from './GuestBits';
import { useGuestActions } from './useGuestActions';

const DRILLS = [
  { emoji: '🎤', title: 'Power Pitch', meta: '3 min · Pitch', tag: 'Pitch' },
  { emoji: '🧘', title: 'Leadership Mirror', meta: '5 min · Presence', tag: 'Presence' },
  { emoji: '😶', title: 'Own the Silence', meta: '4 min · Presence', tag: 'Presence' },
  { emoji: '📝', title: 'Power Journal', meta: '7 min · Voice', tag: 'Voice' },
  { emoji: '💪', title: 'Power Pose Reset', meta: '2 min · Presence', tag: 'Presence' },
];

const REELS = [
  { title: 'Boardroom confidence', bg: '#113744' },
  { title: 'Negotiation', bg: '#3A6675' },
  { title: 'Strategy', bg: '#1E2E33' },
  { title: 'Founders', bg: '#5A574F' },
];

const PRINCIPLES = [
  { n: '01', title: 'Own the Room Before You Speak', locked: false },
  { n: '02', title: 'Say No Without Explaining', locked: false },
];

export default function GuestLearnScreen() {
  const insets = useSafeAreaInsets();
  const { findRegistration } = useGuestActions();
  const [filter, setFilter] = useState('All');
  const drills = useMemo(
    () => (filter === 'All' ? DRILLS : DRILLS.filter((d) => d.tag === filter)),
    [filter]
  );

  return (
    <Page>
      <StatusBar style="dark" />
      <GuestHeader />
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{
          paddingHorizontal: 20,
          paddingTop: 16,
          paddingBottom: Math.max(insets.bottom, 16) + 12,
        }}
      >
        <DarkCard>
          <Kicker onDark>Free to explore</Kicker>
          <ILText
            role="title"
            color="#FFFFFF"
            style={{
              marginTop: 8,
              fontFamily: IL_FONTS.display,
              fontSize: 21,
              lineHeight: 26,
            }}
          >
            Everything on this tab is unlocked
          </ILText>
          <ILText
            role="bodySm"
            color="rgba(255,255,255,0.70)"
            style={{ marginTop: 8, fontSize: 12.5, lineHeight: 18 }}
          >
            Drills, reels and a first look at the 27 Principles — watch, try, come back for more.
          </ILText>
        </DarkCard>

        <View style={{ marginTop: 24 }}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            <PillRow
              items={['All', 'Pitch', 'Presence', 'Voice']}
              value={filter}
              onChange={setFilter}
            />
          </ScrollView>
        </View>

        <View style={{ marginTop: 24 }}>
          <SectionHead title="Must try — guided drills" accent="No login" />
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', marginTop: 12, marginHorizontal: -5 }}>
            {drills.map((d) => (
              <View key={d.title} style={{ width: '50%', padding: 5 }}>
                <WhiteCard style={{ padding: 14, borderRadius: 16, minHeight: 108 }}>
                  <ILText style={{ fontSize: 22, lineHeight: 28 }}>{d.emoji}</ILText>
                  <ILText
                    role="label"
                    color={G.ink}
                    style={[af, { marginTop: 6, fontSize: 12.5, lineHeight: 16 }]}
                  >
                    {d.title}
                  </ILText>
                  <ILText
                    role="bodySm"
                    color={G.meta}
                    style={[af, { marginTop: 4, fontSize: 10.5, lineHeight: 14 }]}
                  >
                    {d.meta}
                  </ILText>
                </WhiteCard>
              </View>
            ))}
            {filter === 'All' ? (
              <View style={{ width: '50%', padding: 5 }}>
                <WhiteCard
                  dashed
                  style={{
                    padding: 14,
                    borderRadius: 16,
                    minHeight: 108,
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <ILText color={G.meta} style={{ fontSize: 18, lineHeight: 22 }}>
                    +
                  </ILText>
                  <ILText
                    role="label"
                    color={G.meta}
                    align="center"
                    style={[af, { marginTop: 4, fontSize: 11, lineHeight: 15 }]}
                  >
                    More drills unlock once you join
                  </ILText>
                </WhiteCard>
              </View>
            ) : null}
          </View>
        </View>

        <View style={{ marginTop: 24 }}>
          <SectionHead title="Watch free" accent="Reels" />
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', marginTop: 12, marginHorizontal: -5 }}>
            {REELS.map((r) => (
              <View key={r.title} style={{ width: '50%', padding: 5 }}>
                <View
                  style={{
                    borderRadius: 16,
                    overflow: 'hidden',
                    backgroundColor: r.bg,
                    aspectRatio: 3 / 4,
                    justifyContent: 'flex-end',
                    padding: 12,
                  }}
                >
                  <LinearGradient
                    colors={['transparent', 'rgba(0,0,0,0.70)']}
                    style={{ position: 'absolute', left: 0, right: 0, top: 0, bottom: 0 }}
                  />
                  <ILText
                    role="label"
                    color="#FFFFFF"
                    style={[af, { fontSize: 12, lineHeight: 16 }]}
                  >
                    {r.title}
                  </ILText>
                </View>
              </View>
            ))}
          </View>
        </View>

        <View style={{ marginTop: 24 }}>
          <SectionHead title="A first look at the 27 Principles" />
          <View style={{ marginTop: 12 }}>
            {PRINCIPLES.map((p) => (
              <WhiteCard
                key={p.n}
                style={{
                  marginTop: p.n === '01' ? 0 : 8,
                  paddingHorizontal: 16,
                  paddingVertical: 12,
                  borderRadius: 16,
                  flexDirection: 'row',
                  alignItems: 'center',
                }}
              >
                <View
                  style={{
                    width: 28,
                    height: 28,
                    borderRadius: 14,
                    backgroundColor: 'rgba(237,29,36,0.10)',
                    alignItems: 'center',
                    justifyContent: 'center',
                    marginRight: 10,
                  }}
                >
                  <ILText role="label" color={G.cta} style={[af, { fontSize: 11, lineHeight: 14 }]}>
                    {p.n}
                  </ILText>
                </View>
                <ILText
                  role="label"
                  color={G.ink}
                  style={[af, { flex: 1, fontSize: 13, lineHeight: 18, marginRight: 8 }]}
                  numberOfLines={1}
                >
                  {p.title}
                </ILText>
                <ActionLabel>Watch</ActionLabel>
              </WhiteCard>
            ))}
            <WhiteCard
              dashed
              style={{
                marginTop: 8,
                paddingHorizontal: 16,
                paddingVertical: 12,
                borderRadius: 16,
                flexDirection: 'row',
                alignItems: 'center',
                opacity: 0.7,
                backgroundColor: 'rgba(255,255,255,0.70)',
              }}
            >
              <View
                style={{
                  width: 28,
                  height: 28,
                  borderRadius: 14,
                  backgroundColor: G.mutedFill,
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginRight: 10,
                }}
              >
                <MaterialIcons name="lock-outline" size={14} color={G.meta} />
              </View>
              <ILText
                role="label"
                color={G.meta}
                style={[af, { flex: 1, fontSize: 13, lineHeight: 18 }]}
              >
                25 more principles
              </ILText>
              <ILText role="label" color={G.meta} style={[af, { fontSize: 11, lineHeight: 14 }]}>
                Locked
              </ILText>
            </WhiteCard>
          </View>
        </View>

        <FindCta
          kicker="Ready for more?"
          title="Unlock all 27 Principles & the full practice library"
          body="Takes two minutes to find your registration and pick up where these previews leave off."
          onPress={findRegistration}
        />
      </ScrollView>
    </Page>
  );
}

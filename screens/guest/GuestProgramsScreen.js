import React, { useMemo, useState } from 'react';
import { Image, Pressable, ScrollView, View } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialIcons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { IL_FONTS } from '../../constants/ironLadyBrand';
import ILText from '../../components/il/ILText';
import GuestHeader from '../../components/il/GuestHeader';
import { G, af } from '../../constants/guestTheme';
import {
  FindCta,
  Page,
  PillRow,
  PinkDisc,
  SectionHead,
  StatNum,
  StepNum,
  WhiteCard,
  fillAbs,
} from './GuestBits';
import { LIQUID_TAB_PAD } from '../../components/il/LiquidTabBar';
import { useGuestActions } from './useGuestActions';
import {
  DRILLS,
  HERO,
  PRINCIPLES_PREVIEW,
  PROGRAM_CARDS,
  PROGRAM_PATH,
  REELS,
} from './guestData';
import { useGlassHeaderPad } from '../../components/il/GlassHeader';

export default function GuestProgramsScreen() {
  const insets = useSafeAreaInsets();
  const headerPad = useGlassHeaderPad();
  const { findRegistration, goProgram } = useGuestActions();
  const [filter, setFilter] = useState('All');
  const drills = useMemo(
    () => (filter === 'All' ? DRILLS : DRILLS.filter((d) => d.tag === filter)),
    [filter]
  );

  return (
    <Page>
      <StatusBar style="dark" />
      <GuestHeader floating />
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{
          paddingHorizontal: 20,
          paddingTop: headerPad + 18,
          paddingBottom: LIQUID_TAB_PAD + Math.max(insets.bottom, 8),
        }}
      >
        <ILText
          role="eyebrow"
          color={G.cta}
          style={[af, { fontSize: 11, letterSpacing: 1.2 }]}
        >
          Free to explore
        </ILText>
        <ILText
          role="display"
          color={G.ink}
          style={{ marginTop: 8, fontFamily: IL_FONTS.display, fontSize: 32, lineHeight: 38, letterSpacing: -0.6 }}
        >
          Paths to the boardroom.{'\n'}One climb.
        </ILText>
        <ILText role="body" color={G.meta} style={{ marginTop: 10, fontSize: 15, lineHeight: 22 }}>
          Every program builds toward the same room. Explore free, then find where you belong.
        </ILText>

        <WhiteCard
          style={{
            marginTop: 20,
            borderRadius: 22,
            paddingVertical: 16,
            paddingHorizontal: 8,
            flexDirection: 'row',
            alignItems: 'center',
          }}
        >
          {PROGRAM_PATH.map((p, i) => (
            <React.Fragment key={p.id}>
              {i ? (
                <View style={{ flex: 1, height: 1, backgroundColor: G.line, marginHorizontal: 2 }} />
              ) : null}
              <Pressable onPress={() => goProgram(p.id)} style={{ alignItems: 'center', width: 64 }}>
                <View
                  style={{
                    width: 36,
                    height: 36,
                    borderRadius: 18,
                    backgroundColor: p.fill,
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <ILText role="label" color="#FFFFFF" style={[af, { fontSize: 8, letterSpacing: 0.4 }]}>
                    {p.code}
                  </ILText>
                </View>
                <ILText role="bodySm" color={G.ink} style={{ marginTop: 6, fontSize: 11 }}>
                  {p.meta}
                </ILText>
              </Pressable>
            </React.Fragment>
          ))}
        </WhiteCard>

        {PROGRAM_CARDS.map((p) => (
          <Pressable
            key={p.id}
            onPress={() => goProgram(p.id)}
            style={{ marginTop: 16, borderRadius: 24, overflow: 'hidden', minHeight: 280 }}
          >
            <Image source={HERO} style={fillAbs} resizeMode="cover" />
            <LinearGradient
              colors={
                p.id === 'lep'
                  ? ['rgba(90,20,28,0.55)', 'rgba(70,12,20,0.94)']
                  : p.id === 'mbw'
                    ? ['rgba(20,20,22,0.45)', 'rgba(12,12,14,0.94)']
                    : ['rgba(17,55,68,0.45)', 'rgba(10,32,40,0.94)']
              }
              style={fillAbs}
            />
            <View style={{ padding: 20, minHeight: 280, justifyContent: 'space-between' }}>
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <StatNum color="rgba(255,255,255,0.4)" size={28}>
                  {p.num}
                </StatNum>
                <View
                  style={{
                    backgroundColor: G.cta,
                    borderRadius: 999,
                    paddingHorizontal: 10,
                    paddingVertical: 5,
                  }}
                >
                  <ILText role="eyebrow" color="#FFFFFF" style={[af, { fontSize: 9, letterSpacing: 1 }]}>
                    {p.badge}
                  </ILText>
                </View>
              </View>
              <View>
                <ILText
                  role="title"
                  color="#FFFFFF"
                  style={{ fontFamily: IL_FONTS.display, fontSize: 24, lineHeight: 30 }}
                >
                  {p.title}
                </ILText>
                <ILText
                  role="bodySm"
                  color="rgba(255,255,255,0.82)"
                  style={{ marginTop: 8, fontSize: 13, lineHeight: 19 }}
                >
                  {p.body}
                </ILText>
                <View style={{ flexDirection: 'row', flexWrap: 'wrap', marginTop: 12 }}>
                  {p.chips.map((c) => (
                    <View
                      key={c}
                      style={{
                        marginRight: 8,
                        marginBottom: 6,
                        paddingHorizontal: 10,
                        paddingVertical: 5,
                        borderRadius: 999,
                        backgroundColor: 'rgba(255,255,255,0.12)',
                      }}
                    >
                      <ILText role="label" color="#FFFFFF" style={[af, { fontSize: 11 }]}>
                        {c}
                      </ILText>
                    </View>
                  ))}
                </View>
                <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 10 }}>
                  <ILText role="label" color="#FFFFFF" style={{ fontSize: 14 }}>
                    Explore
                  </ILText>
                  <MaterialIcons name="arrow-forward" size={16} color="#FFFFFF" style={{ marginLeft: 6 }} />
                </View>
              </View>
            </View>
          </Pressable>
        ))}

        <View
          style={{
            marginTop: 20,
            backgroundColor: G.dark,
            borderRadius: 24,
            padding: 20,
          }}
        >
          <ILText role="eyebrow" color={G.pink} style={[af, { fontSize: 10, letterSpacing: 1.2 }]}>
            60-second quiz
          </ILText>
          <ILText
            role="title"
            color="#FFFFFF"
            style={{ marginTop: 8, fontFamily: IL_FONTS.display, fontSize: 24, lineHeight: 30 }}
          >
            Not sure which one is yours?
          </ILText>
          <ILText
            role="bodySm"
            color="rgba(255,255,255,0.72)"
            style={{ marginTop: 8, fontSize: 13, lineHeight: 19 }}
          >
            Four quick questions about your level and your goal — we’ll point you to the right start.
          </ILText>
          <Pressable
            onPress={() => goProgram('mc')}
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
              Find my program
            </ILText>
            <MaterialIcons name="arrow-forward" size={16} color="#FFFFFF" style={{ marginLeft: 6 }} />
          </Pressable>
        </View>

        <View style={{ marginTop: 28 }}>
          <SectionHead title="Must try — guided drills" />
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginTop: 14 }}>
            <PillRow
              items={['All', 'Pitch', 'Presence', 'Voice']}
              value={filter}
              onChange={setFilter}
            />
          </ScrollView>
          <WhiteCard style={{ marginTop: 12, borderRadius: 22, paddingVertical: 4, paddingHorizontal: 4 }}>
            {drills.map((d, i) => (
              <View
                key={d.title}
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  paddingVertical: 12,
                  paddingHorizontal: 12,
                  borderTopWidth: i ? 1 : 0,
                  borderTopColor: G.line,
                }}
              >
                <PinkDisc name={d.icon} size={34} />
                <View style={{ flex: 1, marginLeft: 12 }}>
                  <ILText role="label" color={G.ink} style={{ fontSize: 14 }}>
                    {d.title}
                  </ILText>
                  <ILText role="bodySm" color={G.meta} style={{ marginTop: 2, fontSize: 12 }}>
                    {d.meta}
                  </ILText>
                </View>
                <ILText role="label" color={G.cta} style={{ fontSize: 13 }}>
                  Start →
                </ILText>
              </View>
            ))}
          </WhiteCard>
          <ILText role="bodySm" color={G.meta} style={{ marginTop: 10, fontSize: 12 }}>
            + More drills unlock once you join
          </ILText>
        </View>

        <View style={{ marginTop: 28 }}>
          <SectionHead title="Watch free · reels" />
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginTop: 14 }}>
            {REELS.map((title) => (
              <View key={title} style={{ width: 132, marginRight: 10 }}>
                <View style={{ height: 180, borderRadius: 16, overflow: 'hidden' }}>
                  <Image source={HERO} style={fillAbs} resizeMode="cover" />
                  <LinearGradient colors={['transparent', 'rgba(0,0,0,0.72)']} style={fillAbs} />
                  <View style={{ position: 'absolute', left: 10, right: 10, bottom: 12 }}>
                    <ILText role="label" color="#FFFFFF" style={{ fontSize: 13, lineHeight: 17 }}>
                      {title}
                    </ILText>
                  </View>
                </View>
              </View>
            ))}
          </ScrollView>
        </View>

        <View style={{ marginTop: 28 }}>
          <SectionHead title="A first look at the 27 Principles" accent="INSIDE LEP" />
          <WhiteCard style={{ marginTop: 12, borderRadius: 22, overflow: 'hidden' }}>
            {PRINCIPLES_PREVIEW.map((p, i) => (
              <View
                key={p.n}
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  paddingHorizontal: 16,
                  paddingVertical: 14,
                  borderBottomWidth: 1,
                  borderBottomColor: G.line,
                }}
              >
                <StepNum size={15} style={{ width: 32 }}>
                  {p.n}
                </StepNum>
                <ILText role="label" color={G.ink} style={{ flex: 1, fontSize: 14 }}>
                  {p.title}
                </ILText>
                <ILText role="label" color={G.cta} style={{ fontSize: 13 }}>
                  Watch
                </ILText>
              </View>
            ))}
            <View
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                paddingHorizontal: 16,
                paddingVertical: 14,
              }}
            >
              <MaterialIcons name="lock-outline" size={16} color={G.meta} />
              <ILText role="bodySm" color={G.meta} style={{ flex: 1, marginLeft: 8, fontSize: 13 }}>
                25 more principles
              </ILText>
              <ILText role="bodySm" color={G.meta} style={{ fontSize: 13 }}>
                Locked
              </ILText>
            </View>
          </WhiteCard>
        </View>

        <View style={{ marginTop: 28 }}>
          <SectionHead title="What you’ll unlock" />
          <WhiteCard style={{ marginTop: 12, borderRadius: 22, padding: 16 }}>
            {[
              ['Your batch & community circle', 'Cohort chat, Thursday triads'],
              ['All 27 Principles, in order', 'Full practice library, tracked progress'],
              ['Certificates & program record', 'Shareable, tied to your name'],
            ].map(([t, s]) => (
              <View key={t} style={{ flexDirection: 'row', marginTop: t.startsWith('Your') ? 0 : 14 }}>
                <MaterialIcons name="check" size={18} color={G.cta} style={{ marginTop: 2 }} />
                <View style={{ marginLeft: 10, flex: 1 }}>
                  <ILText role="label" color={G.ink} style={{ fontSize: 14 }}>
                    {t}
                  </ILText>
                  <ILText role="bodySm" color={G.meta} style={{ marginTop: 2, fontSize: 12 }}>
                    {s}
                  </ILText>
                </View>
              </View>
            ))}
          </WhiteCard>
        </View>

        <FindCta
          kicker="Ready for more?"
          title="Unlock all 27 Principles & the full practice library"
          body="Takes two minutes to find your registration and pick up where these previews leave off."
          onPress={findRegistration}
        />

        <ILText role="label" color={G.ink} style={{ marginTop: 20, fontSize: 13 }}>
          Every program includes
        </ILText>
        <ILText role="bodySm" color={G.meta} style={{ marginTop: 4, fontSize: 12, lineHeight: 18 }}>
          LMS access · 1 year of free community · scholarships available
        </ILText>
      </ScrollView>
    </Page>
  );
}

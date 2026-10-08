import React, { useRef, useState } from 'react';
import { Image, ScrollView, useWindowDimensions, View } from 'react-native';
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
  PinkDisc,
  PlayDisc,
  SectionHead,
  StatNum,
  WhiteCard,
  WorthTrack,
  fillAbs,
} from './GuestBits';
import { CoverThumb } from '../lep/LepBits';
import { LIQUID_TAB_PAD } from '../../components/il/LiquidTabBar';
import Pressable from '../../components/il/Press';
import { useGuestActions } from './useGuestActions';
import {
  CHALLENGE_DAYS,
  COMMUNITY_VIDEOS,
  CSUITE_HOME,
  DRILLS,
  EPISODES,
  FACE,
  HERO,
  MC_COVER,
  HOME_SLIDES,
  QOTD,
  STORIES,
  TOPICS,
} from './guestData';
import { useGlassHeaderPad } from '../../components/il/GlassHeader';
import ArmyPass from './ArmyPass';

const navDot = {
  width: 36,
  height: 36,
  borderRadius: 18,
  borderWidth: 1,
  borderColor: G.line,
  backgroundColor: G.white,
  alignItems: 'center',
  justifyContent: 'center',
};

export default function GuestHomeScreen() {
  const insets = useSafeAreaInsets();
  const headerPad = useGlassHeaderPad();
  const { width } = useWindowDimensions();
  const { findRegistration, goProgram, goDrill, goChallenge, goEngage, goWatch } = useGuestActions();
  const [slide, setSlide] = useState(0);
  const pager = useRef(null);
  const cardW = width - 40;

  const goSlide = (next) => {
    const n = Math.max(0, Math.min(HOME_SLIDES.length - 1, next));
    pager.current?.scrollTo({ x: n * cardW, animated: true });
    setSlide(n);
  };

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
        <ArmyPass />
        <ILText role="body" color={G.meta} align="center" style={{ marginTop: 12, fontSize: 15, lineHeight: 22 }}>
          Tonight, you take your first step.
        </ILText>

        <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 16 }}>
          <View style={{ flexDirection: 'row' }}>
            {[0, 1, 2].map((i) => (
              <Image
                key={i}
                source={FACE}
                style={{
                  width: 28,
                  height: 28,
                  borderRadius: 14,
                  marginLeft: i ? -8 : 0,
                  borderWidth: 2,
                  borderColor: G.page,
                }}
              />
            ))}
            <View
              style={{
                marginLeft: -8,
                width: 28,
                height: 28,
                borderRadius: 14,
                backgroundColor: G.cta,
                alignItems: 'center',
                justifyContent: 'center',
                borderWidth: 2,
                borderColor: G.page,
              }}
            >
              <ILText role="label" color="#FFFFFF" style={[af, { fontSize: 8 }]}>
                +78K
              </ILText>
            </View>
          </View>
          <ILText role="bodySm" color={G.ink} style={{ marginLeft: 10, flex: 1, fontSize: 13, lineHeight: 18 }}>
            Women across India are already in.{' '}
            <ILText role="label" color={G.cta} style={{ fontSize: 13 }}>
              You’re next.
            </ILText>
          </ILText>
        </View>

        <View style={{ marginTop: 22 }}>
          <ScrollView
            ref={pager}
            horizontal
            pagingEnabled
            showsHorizontalScrollIndicator={false}
            onMomentumScrollEnd={(e) =>
              setSlide(Math.round(e.nativeEvent.contentOffset.x / cardW))
            }
          >
            {HOME_SLIDES.map((s) => (
              <View key={s.program} style={{ width: cardW }}>
                <View style={{ borderRadius: 24, overflow: 'hidden', height: 360 }}>
                  <Image source={s.img || HERO} style={{ width: '100%', height: '100%' }} resizeMode="cover" />
                  <LinearGradient
                    colors={['rgba(17,55,68,0.35)', 'rgba(10,32,40,0.94)']}
                    style={fillAbs}
                  />
                  <View style={{ position: 'absolute', left: 18, right: 18, top: 16, bottom: 18 }}>
                    <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                      <View
                        style={{
                          backgroundColor: G.cta,
                          borderRadius: 999,
                          paddingHorizontal: 10,
                          paddingVertical: 4,
                        }}
                      >
                        <ILText role="eyebrow" color="#FFFFFF" style={[af, { fontSize: 9, letterSpacing: 1.2 }]}>
                          {s.kicker}
                        </ILText>
                      </View>
                      <ILText role="bodySm" color="rgba(255,255,255,0.8)" style={{ fontSize: 11 }}>
                        {slide + 1}/4
                      </ILText>
                    </View>
                    <ILText
                      role="eyebrow"
                      color="rgba(255,255,255,0.75)"
                      style={[af, { marginTop: 18, fontSize: 10, letterSpacing: 1.4 }]}
                    >
                      {s.program}
                    </ILText>
                    <ILText
                      role="title"
                      color="#FFFFFF"
                      style={{ marginTop: 8, fontFamily: IL_FONTS.display, fontSize: 26, lineHeight: 32 }}
                    >
                      {s.title}
                    </ILText>
                    <ILText
                      role="bodySm"
                      color="rgba(255,255,255,0.78)"
                      style={{ marginTop: 8, fontSize: 13, lineHeight: 19 }}
                    >
                      {s.body}
                    </ILText>
                    <View style={{ flexDirection: 'row', marginTop: 12, flexWrap: 'wrap' }}>
                      {s.chips.map((c) => (
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
                    <Pressable
                      onPress={() => goProgram(s.id)}
                      style={{
                        marginTop: 'auto',
                        backgroundColor: '#FFFFFF',
                        borderRadius: 999,
                        paddingVertical: 12,
                        alignItems: 'center',
                        flexDirection: 'row',
                        justifyContent: 'center',
                      }}
                    >
                      <ILText role="label" color={G.ink} style={{ fontSize: 14 }}>
                        {s.cta}
                      </ILText>
                      <MaterialIcons name="arrow-forward" size={16} color={G.ink} style={{ marginLeft: 6 }} />
                    </Pressable>
                  </View>
                </View>
              </View>
            ))}
          </ScrollView>
          <View style={{ flexDirection: 'row', justifyContent: 'center', alignItems: 'center', marginTop: 12 }}>
            <Pressable onPress={() => goSlide(slide - 1)} style={navDot}>
              <MaterialIcons name="chevron-left" size={18} color={G.ink} />
            </Pressable>
            <View style={{ flexDirection: 'row', marginHorizontal: 12 }}>
              {HOME_SLIDES.map((_, i) => (
                <View
                  key={i}
                  style={{
                    width: i === slide ? 16 : 7,
                    height: 7,
                    borderRadius: 4,
                    marginHorizontal: 3,
                    backgroundColor: i === slide ? G.cta : G.line,
                  }}
                />
              ))}
            </View>
            <Pressable onPress={() => goSlide(slide + 1)} style={navDot}>
              <MaterialIcons name="chevron-right" size={18} color={G.ink} />
            </Pressable>
          </View>
        </View>

        <View style={{ marginTop: 28 }}>
          <SectionHead title="Stories from women like you" accent="See all" />
          <ILText role="bodySm" color={G.meta} style={{ marginTop: 4, fontSize: 12 }}>
            60-second stories · tap a circle
          </ILText>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginTop: 14 }}>
            {STORIES.map((label) => (
              <View key={label} style={{ alignItems: 'center', marginRight: 14, width: 64 }}>
                <View style={{ padding: 2, borderRadius: 32, borderWidth: 2, borderColor: G.cta }}>
                  <Image source={FACE} style={{ width: 52, height: 52, borderRadius: 26 }} />
                </View>
                <ILText role="bodySm" color={G.ink} align="center" style={{ marginTop: 6, fontSize: 11 }}>
                  {label}
                </ILText>
              </View>
            ))}
          </ScrollView>
          <WhiteCard onPress={goEngage} style={{ marginTop: 14, borderRadius: 22, overflow: 'hidden' }}>
            <View style={{ height: 180 }}>
              <Image source={HERO} style={{ width: '100%', height: '100%' }} resizeMode="cover" />
              <View
                style={{
                  position: 'absolute',
                  top: 12,
                  left: 12,
                  backgroundColor: G.cta,
                  borderRadius: 999,
                  paddingHorizontal: 10,
                  paddingVertical: 4,
                }}
              >
                <ILText role="eyebrow" color="#FFFFFF" style={[af, { fontSize: 9, letterSpacing: 1 }]}>
                  #ImpactStories
                </ILText>
              </View>
              <View style={{ ...fillAbs, alignItems: 'center', justifyContent: 'center' }}>
                <PlayDisc size={48} />
              </View>
            </View>
            <View style={{ padding: 16 }}>
              <ILText role="label" color={G.ink} style={{ fontSize: 15, lineHeight: 21 }}>
                “From Career Break to Thriving Psychiatrist: Leadership Essentials Program Transformed My Mindset!”
              </ILText>
              <ILText role="bodySm" color={G.meta} style={{ marginTop: 6, fontSize: 12 }}>
                Ruhi Satija · Consultant Psychiatrist
              </ILText>
            </View>
          </WhiteCard>
        </View>

        <View style={{ marginTop: 28 }}>
          <SectionHead title="Challenges" />
          <ILText role="bodySm" color={G.meta} style={{ marginTop: 4, fontSize: 12 }}>
            15 minutes a day · free for everyone
          </ILText>
          <View style={{ marginTop: 14, backgroundColor: G.dark, borderRadius: 24, padding: 20 }}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
              <ILText role="eyebrow" color="#FFFFFF" style={[af, { fontSize: 10, letterSpacing: 1.2 }]}>
                Featured · from the Masterclass
              </ILText>
              <ILText role="bodySm" color="rgba(255,255,255,0.7)" style={{ fontSize: 12 }}>
                Starts Mon
              </ILText>
            </View>
            <ILText
              role="title"
              color="#FFFFFF"
              style={{ marginTop: 10, fontFamily: IL_FONTS.display, fontSize: 26, lineHeight: 32 }}
            >
              The 4-Day Challenge
            </ILText>
            <ILText role="bodySm" color="rgba(255,255,255,0.72)" style={{ marginTop: 8, fontSize: 13, lineHeight: 19 }}>
              One video and one task each evening. Your Leadership Card fills as you go.
            </ILText>
            {CHALLENGE_DAYS.map((d) => (
              <View
                key={d.n}
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  marginTop: 10,
                  backgroundColor: 'rgba(255,255,255,0.06)',
                  borderRadius: 16,
                  paddingVertical: 10,
                  paddingHorizontal: 12,
                }}
              >
                <View
                  style={{
                    width: 26,
                    height: 26,
                    borderRadius: 13,
                    backgroundColor: d.on ? G.cta : 'transparent',
                    borderWidth: d.on ? 0 : 1,
                    borderColor: 'rgba(255,255,255,0.35)',
                    alignItems: 'center',
                    justifyContent: 'center',
                    marginRight: 12,
                  }}
                >
                  <ILText role="label" color="#FFFFFF" style={[af, { fontSize: 12 }]}>
                    {d.n}
                  </ILText>
                </View>
                <View style={{ flex: 1 }}>
                  <ILText role="label" color="#FFFFFF" style={{ fontSize: 14 }}>
                    {d.t}
                  </ILText>
                  <ILText role="bodySm" color="rgba(255,255,255,0.65)" style={{ fontSize: 12 }}>
                    {d.d}
                  </ILText>
                </View>
              </View>
            ))}
            <Pressable
              onPress={goChallenge}
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
                See the challenge
              </ILText>
              <MaterialIcons name="arrow-forward" size={16} color="#FFFFFF" style={{ marginLeft: 6 }} />
            </Pressable>
          </View>
          <View style={{ flexDirection: 'row', marginTop: 10 }}>
            <WhiteCard style={{ flex: 1, marginRight: 8, borderRadius: 18, padding: 14 }}>
              <ILText role="eyebrow" color={G.cta} style={[af, { fontSize: 10 }]}>
                3 days
              </ILText>
              <ILText role="label" color={G.ink} style={{ marginTop: 6, fontSize: 14 }}>
                3-Day Challenge
              </ILText>
              <ILText role="bodySm" color={G.meta} style={{ marginTop: 4, fontSize: 12 }}>
                Starts any day
              </ILText>
            </WhiteCard>
            <WhiteCard style={{ flex: 1, marginLeft: 8, borderRadius: 18, padding: 14 }}>
              <ILText role="eyebrow" color={G.cta} style={[af, { fontSize: 10 }]}>
                2 days
              </ILText>
              <ILText role="label" color={G.ink} style={{ marginTop: 6, fontSize: 14 }}>
                Weekend Challenge
              </ILText>
              <ILText role="bodySm" color={G.meta} style={{ marginTop: 4, fontSize: 12 }}>
                Sat & Sun
              </ILText>
            </WhiteCard>
          </View>
        </View>

        <View style={{ marginTop: 28 }}>
          <SectionHead title="Start here" accent="Free" />
          <WhiteCard onPress={() => goProgram('mc')} style={{ marginTop: 12, borderRadius: 22, overflow: 'hidden' }}>
            <View style={{ height: 160 }}>
              <Image source={MC_COVER} style={{ width: '100%', height: '100%' }} resizeMode="cover" />
              <View
                style={{
                  position: 'absolute',
                  top: 12,
                  left: 12,
                  backgroundColor: G.cta,
                  borderRadius: 999,
                  paddingHorizontal: 10,
                  paddingVertical: 4,
                }}
              >
                <ILText role="eyebrow" color="#FFFFFF" style={[af, { fontSize: 9 }]}>
                  Next batch
                </ILText>
              </View>
            </View>
            <View style={{ padding: 16 }}>
              <ILText role="title" color={G.ink} style={{ fontFamily: IL_FONTS.display, fontSize: 18 }}>
                Masterclass (MC) · two evenings
              </ILText>
              <ILText role="bodySm" color={G.meta} style={{ marginTop: 6, fontSize: 13, lineHeight: 18 }}>
                Tue 7:00 PM and Wed 6:30 PM · four of the 27 principles
              </ILText>
              <View
                style={{
                  marginTop: 14,
                  backgroundColor: G.dark,
                  borderRadius: 999,
                  paddingVertical: 12,
                  alignItems: 'center',
                }}
              >
                <ILText role="label" color="#FFFFFF">
                  See dates
                </ILText>
              </View>
            </View>
          </WhiteCard>
        </View>

        <View style={{ marginTop: 28 }}>
          <SectionHead title="Practice" />
          <ILText role="bodySm" color={G.meta} style={{ marginTop: 4, fontSize: 12 }}>
            One question a day · 30 seconds
          </ILText>
          <WhiteCard style={{ marginTop: 12, borderRadius: 22, padding: 16 }}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
              <ILText role="eyebrow" color={G.cta} style={[af, { fontSize: 10 }]}>
                Question of the day
              </ILText>
              <ILText role="bodySm" color={G.meta} style={{ fontSize: 11 }}>
                Principle · Projection
              </ILText>
            </View>
            <ILText role="label" color={G.ink} style={{ marginTop: 10, fontSize: 16, lineHeight: 22 }}>
              Your project saved the company ₹1.4 Cr. In the quarterly review, your manager presents it as the team’s win. What do you do?
            </ILText>
            {QOTD.map(([k, t]) => {
              const on = k === 'B';
              return (
                <View
                  key={k}
                  style={{
                    marginTop: 10,
                    borderRadius: 16,
                    borderWidth: 1,
                    borderColor: on ? G.ink : G.line,
                    padding: 12,
                    flexDirection: 'row',
                    alignItems: 'center',
                    backgroundColor: on ? 'rgba(17,55,68,0.04)' : G.white,
                  }}
                >
                  <View
                    style={{
                      width: 26,
                      height: 26,
                      borderRadius: 13,
                      backgroundColor: on ? G.ink : G.mutedFill,
                      alignItems: 'center',
                      justifyContent: 'center',
                      marginRight: 10,
                    }}
                  >
                    <ILText role="label" color={on ? '#FFFFFF' : G.ink} style={[af, { fontSize: 12 }]}>
                      {k}
                    </ILText>
                  </View>
                  <ILText role="bodySm" color={G.ink} style={{ flex: 1, fontSize: 13, lineHeight: 18 }}>
                    {t}
                  </ILText>
                </View>
              );
            })}
            <View style={{ marginTop: 14, backgroundColor: '#F3F0E4', borderRadius: 16, padding: 14 }}>
              <ILText role="label" color={G.ink} style={{ fontSize: 14 }}>
                Spot on — that’s projection.
              </ILText>
              <ILText role="bodySm" color={G.meta} style={{ marginTop: 6, fontSize: 12, lineHeight: 18 }}>
                Projection, not performance. Men show 60% of the work as 100%; women do 99% and point at the 1% still pending. One clear line in the room — what you did and what it unlocks next — is shameless pitching done well.
              </ILText>
            </View>
          </WhiteCard>
        </View>

        <View style={{ marginTop: 28 }}>
          <SectionHead title="C-suite conversations" accent="See all" />
          <ILText role="bodySm" color={G.meta} style={{ marginTop: 4, fontSize: 12 }}>
            Leaders who sit at the top table
          </ILText>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginTop: 12 }}>
            {CSUITE_HOME.map((c) => (
              <Pressable
                key={c.title}
                onPress={() => goWatch({ assetKey: c.assetKey, title: c.title, sub: c.who })}
                style={{ width: 220, marginRight: 12 }}
              >
                <WhiteCard style={{ borderRadius: 18, overflow: 'hidden' }}>
                  <View style={{ aspectRatio: 16 / 9, backgroundColor: G.dark }}>
                    <CoverThumb source={c.img} play time={c.tag} />
                  </View>
                  <View style={{ padding: 12 }}>
                    <ILText role="label" color={G.ink} numberOfLines={2} style={{ fontSize: 13, lineHeight: 18 }}>
                      {c.title}
                    </ILText>
                    <ILText role="bodySm" color={G.meta} style={{ marginTop: 4, fontSize: 11 }} numberOfLines={1}>
                      {c.who}
                    </ILText>
                  </View>
                </WhiteCard>
              </Pressable>
            ))}
          </ScrollView>
        </View>

        <WhiteCard style={{ marginTop: 24, borderRadius: 22, padding: 16 }}>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
            <ILText role="eyebrow" color={G.cta} style={[af, { fontSize: 10 }]}>
              Know your worth
            </ILText>
            <ILText role="bodySm" color={G.meta} style={{ fontSize: 11 }}>
              The 5x rule
            </ILText>
          </View>
          <ILText role="bodySm" color={G.ink} style={{ marginTop: 10, fontSize: 13 }}>
            Years of experience: 10
          </ILText>
          <WorthTrack value={0.42} />
          <View style={{ flexDirection: 'row', alignItems: 'baseline', marginTop: 14 }}>
            <StatNum size={28}>₹50 lakh</StatNum>
            <ILText role="bodySm" color={G.meta} style={{ marginLeft: 8, fontSize: 13 }}>
              your market number
            </ILText>
          </View>
        </WhiteCard>

        <View style={{ marginTop: 20, backgroundColor: G.dark, borderRadius: 22, padding: 16 }}>
          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
            <View
              style={{
                width: 36,
                height: 36,
                borderRadius: 10,
                backgroundColor: G.cta,
                alignItems: 'center',
                justifyContent: 'center',
                marginRight: 10,
              }}
            >
              <MaterialIcons name="mic" size={18} color="#FFFFFF" />
            </View>
            <View>
              <ILText role="label" color="#FFFFFF">
                Iron Lady Speaks
              </ILText>
              <ILText role="bodySm" color="rgba(255,255,255,0.65)" style={{ fontSize: 11 }}>
                The official podcast · hosted by Rajesh Bhat
              </ILText>
            </View>
          </View>
          <Pressable
            onPress={() =>
              goWatch({
                assetKey: EPISODES[0].assetKey,
                title: EPISODES[0].title,
                sub: EPISODES[0].person,
              })
            }
            style={{ marginTop: 14, borderRadius: 18, overflow: 'hidden' }}
          >
            <View style={{ aspectRatio: 16 / 9, backgroundColor: G.dark }}>
              <CoverThumb source={EPISODES[0].img} play time={`Latest · ${EPISODES[0].min}`} />
            </View>
            <View style={{ paddingTop: 12 }}>
              <ILText role="label" color="#FFFFFF" style={{ fontSize: 14, lineHeight: 19 }}>
                {EPISODES[0].title}
              </ILText>
              <ILText role="bodySm" color="rgba(255,255,255,0.75)" style={{ marginTop: 4, fontSize: 11 }}>
                {EPISODES[0].person}
              </ILText>
            </View>
          </Pressable>
        </View>

        <View style={{ marginTop: 28 }}>
          <SectionHead title="Must try" />
          <ILText role="bodySm" color={G.meta} style={{ marginTop: 4, fontSize: 12 }}>
            Five guided practice drills, done right on this screen — no registration needed
          </ILText>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginTop: 14 }}>
            {DRILLS.map((d) => (
              <WhiteCard
                key={d.title}
                onPress={() => goDrill(d.id)}
                style={{ width: 140, marginRight: 10, borderRadius: 18, padding: 14 }}
              >
                <PinkDisc name={d.icon} size={36} />
                <ILText role="label" color={G.ink} style={{ marginTop: 10, fontSize: 14 }}>
                  {d.title}
                </ILText>
                <ILText role="bodySm" color={G.meta} style={{ marginTop: 4, fontSize: 12 }}>
                  {d.meta.split(' · ')[0]}
                </ILText>
                <ILText role="label" color={G.cta} style={{ marginTop: 10, fontSize: 13 }}>
                  Start →
                </ILText>
              </WhiteCard>
            ))}
          </ScrollView>
        </View>

        <View style={{ marginTop: 28 }}>
          <SectionHead title="Community videos" accent="See all" />
          <ILText role="bodySm" color={G.meta} style={{ marginTop: 4, fontSize: 12 }}>
            Real women · real turning points
          </ILText>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginTop: 14 }}>
            {COMMUNITY_VIDEOS.map((v) => (
              <Pressable
                key={v.title}
                onPress={() => goWatch({ assetKey: v.assetKey, title: v.title, sub: v.meta })}
                style={{ width: 240, marginRight: 12 }}
              >
                <WhiteCard style={{ borderRadius: 18, overflow: 'hidden' }}>
                  <View style={{ aspectRatio: 16 / 9, backgroundColor: G.dark }}>
                    <CoverThumb source={v.img} play />
                  </View>
                  <View style={{ padding: 12 }}>
                    <ILText role="label" color={G.ink} numberOfLines={3} style={{ fontSize: 13, lineHeight: 18 }}>
                      {v.title}
                    </ILText>
                    {v.meta ? (
                      <ILText role="bodySm" color={G.meta} style={{ marginTop: 4, fontSize: 11 }}>
                        {v.meta}
                      </ILText>
                    ) : null}
                  </View>
                </WhiteCard>
              </Pressable>
            ))}
          </ScrollView>
        </View>

        <View style={{ marginTop: 28 }}>
          <SectionHead title="Explore by topic" />
          <ILText role="bodySm" color={G.meta} style={{ marginTop: 4, fontSize: 12 }}>
            Short videos, reads and drills on what matters most
          </ILText>
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', marginTop: 8, marginHorizontal: -5 }}>
            {TOPICS.map((t) => (
              <View key={t.title} style={{ width: '50%', padding: 5 }}>
                <WhiteCard
                  style={{
                    borderRadius: 16,
                    padding: 14,
                    flexDirection: 'row',
                    alignItems: 'center',
                    minHeight: 64,
                  }}
                >
                  <PinkDisc name={t.icon} size={32} />
                  <ILText
                    role="label"
                    color={G.ink}
                    style={{ marginLeft: 10, flex: 1, fontSize: 13, lineHeight: 17 }}
                  >
                    {t.title}
                  </ILText>
                </WhiteCard>
              </View>
            ))}
          </View>
        </View>

        <View style={{ marginTop: 24 }}>
          <SectionHead title="Events & movement" accent="All cities" />
          <ILText role="bodySm" color={G.meta} style={{ marginTop: 4, fontSize: 12 }}>
            Open to everyone
          </ILText>
          <View style={{ marginTop: 14, borderRadius: 24, overflow: 'hidden' }}>
            <View style={{ minHeight: 240 }}>
              <Image source={HERO} style={fillAbs} resizeMode="cover" />
              <LinearGradient colors={['rgba(17,55,68,0.2)', 'rgba(10,32,40,0.94)']} style={fillAbs} />
              <View style={{ padding: 18, minHeight: 240, justifyContent: 'flex-end' }}>
                <View
                  style={{
                    alignSelf: 'flex-start',
                    backgroundColor: G.cta,
                    borderRadius: 999,
                    paddingHorizontal: 10,
                    paddingVertical: 5,
                    marginBottom: 12,
                  }}
                >
                  <ILText role="eyebrow" color="#FFFFFF" style={[af, { fontSize: 9 }]}>
                    Walk to the Board
                  </ILText>
                </View>
                <ILText
                  role="title"
                  color="#FFFFFF"
                  style={{ fontFamily: IL_FONTS.display, fontSize: 24, lineHeight: 30 }}
                >
                  India’s largest women’s leadership movement
                </ILText>
                <ILText
                  role="bodySm"
                  color="rgba(255,255,255,0.75)"
                  style={{ marginTop: 8, fontSize: 13, lineHeight: 18 }}
                >
                  Aug 2026 · 1,000+ women · Bengaluru, Mumbai, Pune, Hyderabad, Chennai, Delhi NCR
                </ILText>
                <View style={{ flexDirection: 'row', marginTop: 14 }}>
                  <Pressable
                    style={{
                      backgroundColor: G.cta,
                      borderRadius: 999,
                      paddingVertical: 12,
                      paddingHorizontal: 18,
                      marginRight: 8,
                    }}
                  >
                    <ILText role="label" color="#FFFFFF">
                      Watch the recap
                    </ILText>
                  </Pressable>
                  <Pressable
                    style={{
                      paddingHorizontal: 18,
                      borderRadius: 999,
                      borderWidth: 1,
                      borderColor: 'rgba(255,255,255,0.5)',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    <ILText role="label" color="#FFFFFF">
                      Notify me
                    </ILText>
                  </Pressable>
                </View>
              </View>
            </View>
          </View>
        </View>

        <WhiteCard
          style={{
            marginTop: 12,
            borderRadius: 20,
            padding: 14,
            flexDirection: 'row',
            alignItems: 'center',
          }}
        >
          <View
            style={{
              width: 48,
              borderRadius: 12,
              backgroundColor: G.pink,
              alignItems: 'center',
              paddingVertical: 6,
              marginRight: 12,
            }}
          >
            <ILText role="eyebrow" color={G.cta} style={[af, { fontSize: 8 }]}>
              Sep
            </ILText>
            <ILText role="title" color={G.ink} style={{ fontFamily: IL_FONTS.display, fontSize: 18 }}>
              26
            </ILText>
          </View>
          <View style={{ flex: 1 }}>
            <ILText role="label" color={G.ink}>
              Bengaluru chapter meetup
            </ILText>
            <ILText role="bodySm" color={G.meta} style={{ marginTop: 2, fontSize: 12 }}>
              Sat · 10:00 AM · in person
            </ILText>
          </View>
          <View
            style={{
              borderWidth: 1,
              borderColor: G.cta,
              borderRadius: 999,
              paddingHorizontal: 12,
              paddingVertical: 6,
            }}
          >
            <ILText role="label" color={G.cta} style={{ fontSize: 12 }}>
              RSVP
            </ILText>
          </View>
        </WhiteCard>

        <WhiteCard style={{ marginTop: 12, borderRadius: 20, padding: 16 }}>
          <ILText role="eyebrow" color={G.cta} style={[af, { fontSize: 10 }]}>
            Principle of the day
          </ILText>
          <ILText
            role="title"
            color={G.ink}
            style={{ marginTop: 8, fontFamily: IL_FONTS.display, fontSize: 20, lineHeight: 26 }}
          >
            Knowledge is not implementation.
          </ILText>
          <ILText role="bodySm" color={G.meta} style={{ marginTop: 8, fontSize: 13, lineHeight: 19 }}>
            Leadership is imbibed and practised, step by step. The more you practise, the more you get. Pick one action today.
          </ILText>
        </WhiteCard>

        <WhiteCard style={{ marginTop: 12, borderRadius: 20, padding: 16 }}>
          <View
            style={{
              alignSelf: 'flex-start',
              backgroundColor: G.ink,
              borderRadius: 999,
              paddingHorizontal: 10,
              paddingVertical: 4,
            }}
          >
            <ILText role="eyebrow" color="#FFFFFF" style={[af, { fontSize: 9 }]}>
              Browsing as a guest
            </ILText>
          </View>
          <ILText role="bodySm" color={G.meta} style={{ marginTop: 10, fontSize: 13, lineHeight: 19 }}>
            You can watch and read everything here. Your own batch, principles and community open once we can match you to a registration.
          </ILText>
          <Pressable onPress={findRegistration} style={{ marginTop: 10 }}>
            <ILText role="label" color={G.cta}>
              Find my registration →
            </ILText>
          </Pressable>
        </WhiteCard>

        <FindCta
          kicker="If you have registered already"
          title="We just need to match your number"
          body="Tell us the number you registered with, or the email, and we will connect this device to your record."
          onPress={findRegistration}
        />
      </ScrollView>
    </Page>
  );
}

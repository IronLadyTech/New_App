import React, { useEffect, useState } from 'react';
import Reanimated, {
  FadeIn,
  LinearTransition,
  runOnJS,
  useAnimatedReaction,
  useAnimatedRef,
  useAnimatedScrollHandler,
  useAnimatedStyle,
  useReducedMotion,
  useSharedValue,
  withDelay,
  withRepeat,
  withTiming,
  Easing,
} from 'react-native-reanimated';
import { Image, View, useWindowDimensions } from 'react-native';
import Pressable from '../../components/il/Press';
import { StatusBar } from 'expo-status-bar';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialIcons } from '@expo/vector-icons';
import Svg, { Path } from 'react-native-svg';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { IL_FONTS } from '../../constants/ironLadyBrand';
import ILText from '../../components/il/ILText';
import { G, af } from '../../constants/guestTheme';
import {
  FindCta,
  GuestBackBar,
  Page,
  PinkDisc,
  QuarterNum,
  SerifTitle,
  StatNum,
  StepNum,
  WhiteCard,
  YearRing,
  fillAbs,
} from './GuestBits';
import { useGuestActions } from './useGuestActions';
import { useLepNav } from '../lep/useLepNav';
import { EPISODES, FACE } from './guestData';
import { COVER } from '../lep/lepData';

const META = {
  mc: { title: 'Masterclass (MC)', sub: 'Start here · two live evenings' },
  lep: { title: 'Leadership Essentials program (LEP)', sub: 'Most chosen · 11 steps' },
  '100bm': { title: '100 Board Members (100BM)', sub: 'Board-ready · 6 months' },
  mbw: { title: 'Master of Business Warfare (MBW)', sub: 'By application · 1 year' },
};

export default function GuestProgramDetailScreen({ navigation, route }) {
  const insets = useSafeAreaInsets();
  const member = route?.params?.member === true;
  const { findRegistration, goWatch } = useGuestActions();
  const lepNav = useLepNav();
  const onFind = member ? () => lepNav.goEnroll() : findRegistration;
  const id = route?.params?.id || 'mc';
  const meta = META[id] || META.mc;

  // Scroll position on the UI thread: drives the MBW page's parallax, reveals and reading line.
  const { height: viewportH } = useWindowDimensions();
  const scrollY = useSharedValue(0);
  const contentH = useSharedValue(1);
  const onScroll = useAnimatedScrollHandler((e) => {
    scrollY.value = e.contentOffset.y;
  });
  const readLine = useAnimatedStyle(() => {
    const room = Math.max(1, contentH.value - viewportH * 0.8);
    return { width: `${Math.min(100, Math.max(0, (scrollY.value / room) * 100))}%` };
  });
  const fx = React.useMemo(() => ({ scrollY, viewportH }), [scrollY, viewportH]);

  return (
    <Page>
      <StatusBar style="dark" />
      <View style={{ paddingTop: Math.max(insets.top, 8) }}>
        <GuestBackBar title={meta.title} sub={meta.sub} onBack={() => navigation.goBack()} />
      </View>
      {id === 'mbw' ? (
        <View style={{ height: 2, backgroundColor: G.line }}>
          <Reanimated.View style={[{ height: 2, backgroundColor: G.cta }, readLine]} />
        </View>
      ) : null}
      <ScrollFx.Provider value={fx}>
      <Reanimated.ScrollView
        showsVerticalScrollIndicator={false}
        onScroll={onScroll}
        scrollEventThrottle={16}
        onContentSizeChange={(w, h) => {
          contentH.value = h;
        }}
        contentContainerStyle={{ paddingBottom: Math.max(insets.bottom, 16) + 24 }}
      >
        {id === 'lep' ? (
          <LepBody onFind={onFind} />
        ) : id === '100bm' ? (
          <BmBody onFind={onFind} member={member} />
        ) : id === 'mbw' ? (
          <MbwBody onFind={onFind} onWatch={goWatch} />
        ) : (
          <McBody onFind={onFind} />
        )}
      </Reanimated.ScrollView>
      </ScrollFx.Provider>
    </Page>
  );
}

/** The page column of every programme page: its blocks rise into place as she scrolls. */
function Pad({ children, style }) {
  return <RevealPad style={style}>{children}</RevealPad>;
}

function McBody({ onFind }) {
  const practise = [
    ['01', 'BHAG', 'Name the goal that scares you — the first step of every Iron Lady journey.'],
    ['02', 'Differentiated branding', 'The image you create in other people’s minds, built on strengths.'],
    ['03', 'Shameless pitching', 'Ask for what you deserve, confidently and unapologetically.'],
    ['04', 'The art of negotiation', 'You get what you negotiate for — not just what you deserve.'],
  ];
  return (
    <View>
      <View style={{ backgroundColor: G.dark, paddingHorizontal: 20, paddingTop: 20, paddingBottom: 28 }}>
        <KickerPill>Live · twice every week</KickerPill>
        <Headline light lines={['Two evenings.', 'A different career.']} accentLast />
        <ILText role="body" color="rgba(255,255,255,0.78)" style={{ marginTop: 10, fontSize: 15, lineHeight: 22 }}>
          The live on-ramp to the Iron Lady method. Four of the 27 principles, practised in the room — not just heard.
        </ILText>
        <McArt />
      </View>

      <Pad>
      <Section title="Pick your two evenings" sub="Same content, two slots every week" />
      <View
        style={{
          marginTop: 12,
          backgroundColor: G.dark,
          borderRadius: 20,
          padding: 16,
          borderWidth: 2,
          borderColor: G.cta,
        }}
      >
        <SlotRow dark a="Tue" as="7:00 PM · Evening 1" b="Wed" bs="6:30 PM · Evening 2" label="Weekday slot" />
      </View>
      <WhiteCard style={{ marginTop: 10, borderRadius: 20, padding: 16 }}>
        <SlotRow a="Fri" as="7:00 PM · Evening 1" b="Sat" bs="5:00 PM · Evening 2" label="Weekend slot" />
      </WhiteCard>

      <Section title="What you’ll practise" sub="4 of the 27 principles" />
      <View style={{ flexDirection: 'row', flexWrap: 'wrap', marginTop: 8, marginHorizontal: -6 }}>
        {practise.map((p) => (
          <View key={p[0]} style={{ width: '50%', padding: 6 }}>
            <WhiteCard style={{ borderRadius: 18, padding: 14, minHeight: 148 }}>
              <StepNum size={20}>{p[0]}</StepNum>
              <SerifTitle size={16} style={{ marginTop: 8 }}>
                {p[1]}
              </SerifTitle>
              <ILText role="bodySm" color={G.meta} style={{ marginTop: 6, fontSize: 12, lineHeight: 17 }}>
                {p[2]}
              </ILText>
            </WhiteCard>
          </View>
        ))}
      </View>

      <View style={{ marginTop: 16, backgroundColor: G.dark, borderRadius: 22, padding: 20 }}>
        <ILText
          role="title"
          color="#FFFFFF"
          style={{ fontFamily: IL_FONTS.displayItalic, fontSize: 20, lineHeight: 28 }}
        >
          “Leadership is not defined by the position you hold but by the courage to take the next bold step.”
        </ILText>
        <ILText role="bodySm" color="rgba(255,255,255,0.7)" style={{ marginTop: 10, fontSize: 12 }}>
          Suvarna Hegde · Co-Founder & CEO, Iron Lady
        </ILText>
      </View>

      <StatRow
        items={[
          ['78,000+', 'trained'],
          ['191', 'earn ₹1Cr+'],
          ['1M', 'women · our goal'],
        ]}
      />
      <RedCta label="See Masterclass dates" onPress={onFind} />
      <AdvisorNote />
      </Pad>
    </View>
  );
}

function Sunset({ fill, day, time }) {
  return (
    <View style={{ alignItems: 'center', marginRight: 10 }}>
      <Svg width={56} height={32}>
        <Path d="M6 28 A22 22 0 0 1 50 28 Z" fill={fill} />
        <Path d="M0 29 H56" stroke={G.ink} strokeWidth={1.5} strokeLinecap="round" />
      </Svg>
      <ILText role="label" color={G.ink} style={[af, { marginTop: 4, fontSize: 12 }]}>
        {day}
      </ILText>
      <ILText role="bodySm" color={G.meta} style={[af, { fontSize: 10 }]}>
        {time}
      </ILText>
    </View>
  );
}

function McArt() {
  const steps = [
    ['01', 'BHAG', 26],
    ['02', 'Brand', 42],
    ['03', 'Pitch', 58],
    ['04', 'Ask', 74],
  ];
  return (
    <View style={{ marginTop: 18, borderRadius: 20, overflow: 'hidden' }}>
      <LinearGradient colors={['#FFF6EC', '#F8D6D4']} style={fillAbs} />
      <View style={{ padding: 16 }}>
        <View style={{ flexDirection: 'row', alignItems: 'flex-end' }}>
          <Sunset fill={G.cta} day="Tue" time="7 PM" />
          <Sunset fill="#F28B6B" day="Wed" time="6:30 PM" />
          <View style={{ flex: 1, flexDirection: 'row', alignItems: 'flex-end', marginLeft: 6 }}>
            {steps.map(([n, label, h], i) => (
              <View key={n} style={{ flex: 1, alignItems: 'center', marginLeft: i ? 3 : 0 }}>
                {i === steps.length - 1 ? (
                  <Svg width={18} height={22} style={{ marginBottom: 2 }}>
                    <Path d="M3 22 V2" stroke={G.ink} strokeWidth={1.5} />
                    <Path d="M3 2 L16 7 L3 12 Z" fill={G.cta} />
                  </Svg>
                ) : null}
                <View
                  style={{
                    width: '100%',
                    height: h,
                    borderTopLeftRadius: 8,
                    borderTopRightRadius: 8,
                    backgroundColor: G.dark,
                    opacity: 0.55 + i * 0.15,
                    alignItems: 'center',
                    paddingTop: 5,
                  }}
                >
                  <StatNum color="#FFFFFF" size={11}>
                    {n}
                  </StatNum>
                </View>
                <ILText role="bodySm" color={G.ink} style={[af, { marginTop: 4, fontSize: 10 }]}>
                  {label}
                </ILText>
              </View>
            ))}
          </View>
        </View>
        <ILText
          role="title"
          color={G.ink}
          style={{ marginTop: 14, fontFamily: IL_FONTS.displayItalic, fontSize: 18, lineHeight: 24 }}
        >
          “Knowledge alone is not enough.”
        </ILText>
        <ILText role="bodySm" color={G.meta} style={{ marginTop: 2, fontSize: 12 }}>
          Two evenings · four principles, practised live
        </ILText>
      </View>
    </View>
  );
}

function LepBody({ onFind }) {
  const steps = [
    ['01', 'Pre-Program Preparation', 'VIA Survey, photograph, CoDeSeF sheet'],
    ['03', 'Day 1 — Personal Transformation', 'A-Game Self Awareness, Crucibles of Leadership, ERRC Table'],
    ['04', 'Day 2 — Strategies and Tactics', 'CoDeSeF, Maximise Key Relationships, Purpose Peg Table'],
    ['05', 'Weeks 1–4 · Practice & profile', '0.5% League Roadmap, LinkedIn & resume, Shameless Pitch'],
    ['11', 'Certificate', 'LEP Certification & the Iron Lady Alumni'],
  ];
  const weeks = [
    { k: 'W0', on: true, t: 'The 2-day intensive', when: 'Sat + Sun · 9 AM – 7 PM', d: 'All 27 principles, live, in one weekend.' },
    { k: 'W1', t: 'Differentiated brand', when: 'Tue 7 PM · Sat 9 AM', d: 'Completion review, then your brand statement.' },
    { k: 'W2', t: 'Shameless pitching', when: 'Sat 6:30 PM', d: 'Pitch it out loud — to your cohort first.' },
    { k: 'W3', t: 'Leadership habits', when: 'Wed 7 PM · Sat 9 AM', d: 'Progress Q&A and the daily rituals that stick.' },
    { k: 'W4', t: 'Certification', when: 'Sat 7:30 PM', d: 'Graduate — and join the alumni.' },
  ];

  return (
    <View>
      <View style={{ backgroundColor: '#4A1520', paddingHorizontal: 20, paddingTop: 20, paddingBottom: 28 }}>
        <View
          style={{
            alignSelf: 'flex-start',
            backgroundColor: 'rgba(255,255,255,0.12)',
            borderRadius: 999,
            paddingHorizontal: 10,
            paddingVertical: 5,
          }}
        >
          <ILText role="eyebrow" color="#FFFFFF" style={[af, { fontSize: 9 }]}>
            Starts every Saturday
          </ILText>
        </View>
        <Headline light lines={['All 27 principles.', 'One month.', 'A new trajectory.']} />
        <ILText role="body" color="rgba(255,255,255,0.75)" style={{ marginTop: 10, fontSize: 15, lineHeight: 22 }}>
          For women who are ready to stop waiting to be noticed.
        </ILText>
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', marginTop: 18, marginHorizontal: -3 }}>
          {Array.from({ length: 27 }, (_, i) => (
            <View
              key={i}
              style={{
                width: 32,
                height: 32,
                borderRadius: 16,
                margin: 3,
                backgroundColor: i < 4 ? G.pink : 'rgba(255,255,255,0.12)',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <StatNum color={i < 4 ? G.cta : '#FFFFFF'} size={11}>
                {i + 1}
              </StatNum>
            </View>
          ))}
        </View>
        <ILText role="bodySm" color="rgba(255,255,255,0.65)" style={{ marginTop: 8, fontSize: 12 }}>
          1–4 you meet in the Masterclass · all 27 open in LEP
        </ILText>
      </View>

      <Pad>
        <Section title="11 steps · one transformation" sub="Unlock in order" />
        <ILText role="body" color={G.ink} style={{ marginTop: 10, fontSize: 15, lineHeight: 22 }}>
          <ILText role="label" color={G.ink}>
            The 2 days that change how you show up.{' '}
          </ILText>
          A short, structured cohort — live Day 1 and Day 2, then four weeks of practice, closing on your certificate.
        </ILText>
        <WhiteCard style={{ marginTop: 14, borderRadius: 22, paddingHorizontal: 16, paddingVertical: 6 }}>
          {steps.map((s, i) => (
            <View
              key={s[0]}
              style={{
                flexDirection: 'row',
                paddingVertical: 14,
                borderTopWidth: i ? 1 : 0,
                borderTopColor: G.line,
              }}
            >
              <StepNum size={18} style={{ width: 40 }}>
                {s[0]}
              </StepNum>
              <View style={{ flex: 1 }}>
                <SerifTitle size={16}>{s[1]}</SerifTitle>
                <ILText role="bodySm" color={G.meta} style={{ marginTop: 4, fontSize: 12, lineHeight: 17 }}>
                  {s[2]}
                </ILText>
              </View>
            </View>
          ))}
        </WhiteCard>

        <WhiteCard
          style={{
            marginTop: 14,
            borderRadius: 20,
            padding: 14,
            flexDirection: 'row',
            alignItems: 'center',
          }}
        >
          <PinkDisc name="play-arrow" size={36} />
          <View style={{ marginLeft: 12, flex: 1 }}>
            <ILText role="eyebrow" color={G.cta} style={[af, { fontSize: 9 }]}>
              Try it free right now
            </ILText>
            <ILText role="label" color={G.ink} style={{ marginTop: 4, fontSize: 15 }}>
              A first look at the 27 Principles
            </ILText>
            <ILText role="bodySm" color={G.meta} style={{ marginTop: 2, fontSize: 12 }}>
              Two open, watch free right now
            </ILText>
          </View>
        </WhiteCard>

        <Section title="The shift" sub="Where the month takes you" />
        <View style={{ flexDirection: 'row', marginTop: 12 }}>
          <WhiteCard style={{ flex: 1, marginRight: 6, borderRadius: 18, padding: 14 }}>
            <ILText role="eyebrow" color={G.meta} style={[af, { fontSize: 9 }]}>
              Before
            </ILText>
            <ILText role="bodySm" color={G.ink} style={{ marginTop: 8, fontSize: 13, lineHeight: 19 }}>
              Doing 99% of the work, pointing at the 1% still pending.
            </ILText>
            <ILText role="bodySm" color={G.ink} style={{ marginTop: 8, fontSize: 13, lineHeight: 19 }}>
              Waiting for the work to speak.
            </ILText>
          </WhiteCard>
          <View
            style={{
              flex: 1,
              marginLeft: 6,
              borderRadius: 18,
              padding: 14,
              backgroundColor: G.dark,
            }}
          >
            <ILText role="eyebrow" color={G.pink} style={[af, { fontSize: 9 }]}>
              After
            </ILText>
            <ILText role="bodySm" color="#FFFFFF" style={{ marginTop: 8, fontSize: 13, lineHeight: 19 }}>
              Projecting what you deliver, in one clear line.
            </ILText>
            <ILText role="bodySm" color="#FFFFFF" style={{ marginTop: 8, fontSize: 13, lineHeight: 19 }}>
              Asking — and negotiating — for what you’re worth.
            </ILText>
          </View>
        </View>

        <Section title="Your four weeks" sub="Live sessions with your cohort" />
        <WhiteCard style={{ marginTop: 12, borderRadius: 22, padding: 16 }}>
          {weeks.map((w, i) => (
            <View key={w.k} style={{ flexDirection: 'row', marginTop: i ? 16 : 0 }}>
              <View style={{ alignItems: 'center', marginRight: 12 }}>
                <View
                  style={{
                    width: 36,
                    height: 36,
                    borderRadius: 18,
                    backgroundColor: w.on ? G.cta : G.white,
                    borderWidth: w.on ? 0 : 1.5,
                    borderColor: G.ink,
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <ILText role="label" color={w.on ? '#FFFFFF' : G.ink} style={[af, { fontSize: 11 }]}>
                    {w.k}
                  </ILText>
                </View>
                {i < weeks.length - 1 ? (
                  <View style={{ width: 1, flex: 1, minHeight: 18, backgroundColor: G.line, marginTop: 4 }} />
                ) : null}
              </View>
              <View style={{ flex: 1, paddingBottom: 4 }}>
                <SerifTitle size={16}>{w.t}</SerifTitle>
                <View
                  style={{
                    alignSelf: 'flex-start',
                    marginTop: 6,
                    backgroundColor: '#F3F0E4',
                    borderRadius: 8,
                    paddingHorizontal: 8,
                    paddingVertical: 3,
                  }}
                >
                  <ILText role="bodySm" color={G.ink} style={{ fontSize: 11 }}>
                    {w.when}
                  </ILText>
                </View>
                <ILText role="bodySm" color={G.meta} style={{ marginTop: 6, fontSize: 12, lineHeight: 17 }}>
                  {w.d}
                </ILText>
              </View>
            </View>
          ))}
        </WhiteCard>

        <Section title="Your community, every Thursday" sub="8–9 PM · after the month ends too" />
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', marginTop: 10 }}>
          {['YUKTI', 'DISHA', 'UDAAN', 'Visibility Platform'].map((c) => (
            <View
              key={c}
              style={{
                marginRight: 8,
                marginBottom: 8,
                borderWidth: 1,
                borderColor: G.line,
                backgroundColor: G.white,
                borderRadius: 999,
                paddingHorizontal: 12,
                paddingVertical: 8,
              }}
            >
              <ILText role="label" color={G.ink} style={{ fontSize: 12 }}>
                {c}
              </ILText>
            </View>
          ))}
        </View>

        <Section title="She did it" />
        <PodcastRow
          kicker="Iron Lady Speaks · 36 min"
          title="“My Work Will Speak for Me” — the biggest myth she broke after 21 years"
          person="Mohini Hanwate · Global Quality Lead"
        />

        <View style={{ marginTop: 14, backgroundColor: G.pink, borderRadius: 22, padding: 18, flexDirection: 'row' }}>
          <StatNum color={G.cta} size={36}>
            191
          </StatNum>
          <ILText
            role="bodySm"
            color={G.cta}
            style={{ flex: 1, marginLeft: 12, fontSize: 14, lineHeight: 20, paddingTop: 4 }}
          >
            women in the Iron Lady community now earn ₹1 crore or more a year.
          </ILText>
        </View>

        <FindCta
          kicker="Ready to start?"
          title="Your Day 1 could be two weeks away"
          body="Find your registration, or pick a batch date if you haven’t signed up yet."
          onPress={onFind}
        />
        <GhostCta label="Talk to an advisor" />
        <AdvisorNote />
      </Pad>
    </View>
  );
}

function BmBody({ onFind, member }) {
  const arc = [
    ['S', 'Onboarding', true],
    ['1', 'Foundation', false],
    ['2', 'Pitch &\nStrategy', false],
    ['3', 'Board\nReady', false],
    ['4', 'Challenge', false],
    ['F', 'Graduation', true],
  ];
  return (
    <View>
      <View style={{ backgroundColor: G.dark, paddingHorizontal: 20, paddingTop: 20, paddingBottom: 28, alignItems: 'center' }}>
        <View
          style={{
            backgroundColor: 'rgba(255,255,255,0.1)',
            borderRadius: 999,
            paddingHorizontal: 10,
            paddingVertical: 5,
          }}
        >
          <ILText role="eyebrow" color="#FFFFFF" style={[af, { fontSize: 9 }]}>
            6 months · online · starts every month
          </ILText>
        </View>
        <Headline
          light
          accentLast
          lines={['There’s a seat at the board.', 'It has your name on it.']}
        />
        <BoardDots />
        <ILText
          role="bodySm"
          color="rgba(255,255,255,0.7)"
          align="center"
          style={{ marginTop: 16, fontSize: 13, lineHeight: 19 }}
        >
          100 Board Members prepares senior women for board roles — image, capability, pitch and network.
        </ILText>
      </View>

      <Pad>
        <Section title="Board-ready, one phase at a time" sub="Six months · fully online" />
        <ILText role="body" color={G.meta} style={{ marginTop: 8, fontSize: 15, lineHeight: 22 }}>
          No in-person days — live weekly Q&A, real practice drills, and a profile a board actually notices.
        </ILText>
        <WhiteCard style={{ marginTop: 14, borderRadius: 22, padding: 16 }}>
          <ILText role="eyebrow" color={G.cta} style={[af, { fontSize: 9 }]}>
            Your 6-month arc
          </ILText>
          <View style={{ flexDirection: 'row', marginTop: 14, justifyContent: 'space-between' }}>
            {arc.map(([n, l, red]) => (
              <View key={n} style={{ alignItems: 'center', width: 52 }}>
                <View
                  style={{
                    width: 28,
                    height: 28,
                    borderRadius: 14,
                    backgroundColor: red ? G.cta : G.ink,
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <StepNum color="#FFFFFF" size={12}>
                    {n}
                  </StepNum>
                </View>
                <ILText
                  role="bodySm"
                  color={G.ink}
                  align="center"
                  style={{ marginTop: 6, fontSize: 9, lineHeight: 12 }}
                >
                  {l}
                </ILText>
              </View>
            ))}
          </View>
        </WhiteCard>

        <Section title="The six-month climb" />
        <WhiteCard style={{ marginTop: 12, borderRadius: 22, padding: 16 }}>
          <View style={{ flexDirection: 'row', alignItems: 'flex-start' }}>
            <View
              style={{
                backgroundColor: G.pink,
                borderRadius: 8,
                paddingHorizontal: 8,
                paddingVertical: 3,
                marginRight: 10,
              }}
            >
              <ILText role="eyebrow" color={G.cta} style={[af, { fontSize: 8 }]}>
                Pre
              </ILText>
            </View>
            <View style={{ flex: 1 }}>
              <ILText role="label" color={G.ink}>
                Your core story
              </ILText>
              <ILText role="bodySm" color={G.meta} style={{ marginTop: 2, fontSize: 12 }}>
                Plus your milestone table, practised before session 1
              </ILText>
            </View>
          </View>
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', marginTop: 12, marginHorizontal: -4 }}>
            {[1, 2, 3, 4, 5, 6].map((n) => (
              <View key={n} style={{ width: '33.33%', padding: 4 }}>
                <View
                  style={{
                    borderRadius: 14,
                    padding: 10,
                    minHeight: 88,
                    backgroundColor: n === 1 ? G.dark : G.white,
                    borderWidth: n === 1 ? 0 : 1,
                    borderColor: G.line,
                  }}
                >
                  <StepNum color={n === 1 ? '#FFFFFF' : G.ink} size={18}>
                    {n}
                  </StepNum>
                  <ILText
                    role="label"
                    color={n === 1 ? '#FFFFFF' : G.ink}
                    style={{ marginTop: 4, fontSize: 12 }}
                  >
                    Core session
                  </ILText>
                  <ILText
                    role="bodySm"
                    color={n === 1 ? 'rgba(255,255,255,0.7)' : G.meta}
                    style={{ marginTop: 2, fontSize: 10 }}
                  >
                    Sat 9:00–12:30
                  </ILText>
                </View>
              </View>
            ))}
          </View>
          <ILText role="bodySm" color={G.meta} style={{ marginTop: 10, fontSize: 12, lineHeight: 17 }}>
            Each with a working session before and after · Sat 8:00–8:45 AM
          </ILText>
        </WhiteCard>

        <Section title="Nine practice drills" sub="Rehearse the rooms before you’re in them" />
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', marginTop: 10 }}>
          {['LinkedIn', 'SuperPower statement', 'ERRC grid', 'Role plays', 'Read like a leader', 'AI speech', '+3 more'].map(
            (c) => (
              <View
                key={c}
                style={{
                  marginRight: 8,
                  marginBottom: 8,
                  borderWidth: 1,
                  borderColor: G.line,
                  backgroundColor: c.startsWith('+') ? '#F3F0E4' : G.white,
                  borderRadius: 999,
                  paddingHorizontal: 12,
                  paddingVertical: 8,
                }}
              >
                <ILText role="label" color={G.ink} style={{ fontSize: 12 }}>
                  {c}
                </ILText>
              </View>
            )
          )}
        </View>

        <Section title="Practice you can preview" sub="1 free now" />
        <WhiteCard
          style={{
            marginTop: 12,
            borderRadius: 18,
            padding: 14,
            flexDirection: 'row',
            alignItems: 'center',
          }}
        >
          <PinkDisc name="share" size={36} />
          <View style={{ flex: 1, marginLeft: 12 }}>
            <ILText role="label" color={G.ink}>
              LinkedIn Optimization
            </ILText>
            <ILText role="bodySm" color={G.meta} style={{ fontSize: 12, marginTop: 2 }}>
              Open now, free preview drill
            </ILText>
          </View>
          <ILText role="label" color={G.cta} style={{ fontSize: 13 }}>
            Start
          </ILText>
        </WhiteCard>
        <WhiteCard
          dashed
          style={{ marginTop: 10, borderRadius: 18, padding: 14, flexDirection: 'row', alignItems: 'center' }}
        >
          <MaterialIcons name="lock-outline" size={16} color={G.meta} />
          <View style={{ flex: 1, marginLeft: 10 }}>
            <ILText role="label" color={G.ink} style={{ fontSize: 13 }}>
              SuperPower Statement, ERRC Grid + 6 more
            </ILText>
            <ILText role="bodySm" color={G.meta} style={{ fontSize: 12, marginTop: 2 }}>
              Unlocks a phase at a time, once you join
            </ILText>
          </View>
        </WhiteCard>

        <StatRow
          items={[
            ['78,000+', 'women enrolled'],
            ['4.9★', 'average rating'],
            ['Weekly', 'live Q&A'],
          ]}
        />

        <Section title="Your champions" />
        <Champion name="Rekha Nagaraj" role="National 100 Board Members Champion, Iron Lady" />
        <Champion name="Charu Sharma" role="National Board Readiness Leader, Iron Lady" photo={COVER.speaks04c} />

        <Section title="From the boardroom" />
        <PodcastRow
          kicker="Iron Lady Speaks · 72 min"
          title="From invisible legal head to global board member"
          person="Lakshmi Nayak · senior director and board member, global MNC"
          img={COVER.speaks02}
        />

        <FindCta
          kicker={member ? 'Your next program' : 'Ready to start?'}
          title={member ? 'Register for 100 Board Members' : 'Onboarding opens as soon as you register'}
          body={
            member
              ? 'You finished LEP — 100BM is the six-month board journey. Open enrollment to register or complete payment.'
              : 'Find your registration, or pick a batch date if you haven’t signed up yet.'
          }
          onPress={onFind}
          ctaLabel={member ? 'Enrollment & payment' : 'Find my registration'}
        />
        {!member ? <GhostCta label="Talk to an advisor" /> : null}
        {!member ? <AdvisorNote /> : null}
      </Pad>
    </View>
  );
}

/**
 * MBW (C-Suite League) for a guest. Copy follows iamironlady.com's MBW page: a 1-year programme
 * for C-suite mastery and the ₹1 Crore+ band, competitor- and market-centric strategy, business
 * war tactics to win without fighting. Quarter names from the programme team (Nov 2026).
 */
const MBW_QUARTERS = [
  {
    q: 'Q1',
    title: 'Discover Your Edge',
    weeks: 'Wk 1–12',
    about:
      'Find what makes you indispensable at the top — your strengths, your story and a C-suite profile the market reads the way you intend.',
  },
  {
    q: 'Q2',
    title: 'Master the Influence',
    weeks: 'Wk 13–24',
    about:
      'Pitch, negotiate and move decisions without waiting for a title. Build the alliances that speak for you in rooms you are not in.',
  },
  {
    q: 'Q3',
    title: 'See Beyond Business',
    weeks: 'Wk 25–36',
    about:
      'Think the way a board does: markets, competitors, P&L and the economy. Read the whole field, not just your function.',
  },
  {
    q: 'Q4',
    title: 'Own the Power Game',
    weeks: 'Wk 37–48',
    about:
      'Your C-suite game plan: positioning, timing and the moves to claim the role — and the ₹1 Crore+ band that comes with it.',
  },
];

const MBW_BUILD = [
  {
    icon: 'workspace-premium',
    title: 'A C-suite profile',
    line: 'The story the market and your board remember you by.',
    how: 'Built in Q1: your strengths, wins and positioning turned into a profile you use in every room.',
  },
  {
    icon: 'shield',
    title: 'Business war tactics',
    line: 'Win without fighting — out-think, don’t out-shout.',
    how: 'Competitor-centric moves for politics, bias and turf — practised on your own situations each session.',
  },
  {
    icon: 'insights',
    title: 'Board-level judgement',
    line: 'P&L, markets and competitors, read like a CEO.',
    how: 'Built in Q3: you take one business decision apart the way a board would — numbers, market, risk.',
  },
  {
    icon: 'record-voice-over',
    title: 'Influence without a title',
    line: 'Decisions move because you shaped them first.',
    how: 'Built in Q2: pitching, negotiation and the alliances that carry your ideas before the meeting starts.',
  },
  {
    icon: 'flag',
    title: 'A 12-month game plan',
    line: 'Your route to the C-suite and the ₹1 Crore+ band.',
    how: 'Built in Q4: the role, the timing and the next three moves — written, reviewed, and yours to run.',
  },
  {
    icon: 'groups',
    title: 'A closed senior circle',
    line: 'Peers who pressure-test your moves — and play to win.',
    how: 'One cohort for the whole year, kept small, so the people who hear your plan are the ones who challenge it.',
  },
];

/**
 * Scroll-driven motion for the MBW page (patterns from Apple product pages, Airbnb, MasterClass
 * and the App Store "Today" cards): the hero recedes in parallax, each block rises into place as
 * it enters the screen (tied to the finger, so it reverses on the way back up), and the year is
 * a swipeable deck of quarter cards. Everything runs on the UI thread (Reanimated); reduced
 * motion turns the scroll effects off.
 */
const ScrollFx = React.createContext(null);
const RevealOffset = React.createContext(null);

/** The page column; every direct child rises into place as it scrolls into view. */
function RevealPad({ children, style }) {
  const padY = useSharedValue(0);
  return (
    <View
      style={[{ paddingHorizontal: 20 }, style]}
      onLayout={(e) => {
        padY.value = e.nativeEvent.layout.y;
      }}
    >
      <RevealOffset.Provider value={padY}>
        {React.Children.map(children, (child, i) => (child ? <Reveal key={child.key ?? i}>{child}</Reveal> : child))}
      </RevealOffset.Provider>
    </View>
  );
}

function Reveal({ children }) {
  const fx = React.useContext(ScrollFx);
  const padY = React.useContext(RevealOffset);
  const reduced = useReducedMotion();
  const y = useSharedValue(-1);
  const viewport = fx?.viewportH || 800;
  const style = useAnimatedStyle(() => {
    if (!fx || reduced || y.value < 0) return {};
    const top = (padY ? padY.value : 0) + y.value;
    const p = Math.min(1, Math.max(0, (fx.scrollY.value + viewport - top - 10) / (viewport * 0.38)));
    const e = 1 - (1 - p) * (1 - p);
    return { opacity: e, transform: [{ translateY: (1 - e) * 64 }, { scale: 0.92 + 0.08 * e }] };
  });
  return (
    <Reanimated.View
      onLayout={(e) => {
        y.value = e.nativeEvent.layout.y;
      }}
      style={style}
    >
      {children}
    </Reanimated.View>
  );
}

/** The year as swipeable cards: the centred quarter is full size, its neighbours recede. */
/** Auto-slide pace, and how long a tapped or swiped quarter stays put so she can read it. */
const QUARTER_AUTO_MS = 6000;
const QUARTER_HOLD_MS = 20000;

function QuarterDeck({ active, onChange }) {
  const { width } = useWindowDimensions();
  const cardW = Math.min(width - 64, 380);
  const gap = 12;
  const snap = cardW + gap;
  const side = (width - cardW) / 2;
  const x = useSharedValue(0);
  // While the deck slides to a quarter chosen elsewhere, the cards it passes are not "chosen".
  const target = useSharedValue(-1);
  const ref = useAnimatedRef();

  const touching = useSharedValue(0);
  // Last time she touched the deck (tap or swipe): auto-slide waits HOLD_MS after it.
  const pausedAt = React.useRef(0);
  const hold = () => {
    pausedAt.current = Date.now();
  };
  const onScroll = useAnimatedScrollHandler({
    onScroll: (e) => {
      x.value = e.contentOffset.x;
    },
    onBeginDrag: () => {
      target.value = -1;
      touching.value = 1;
    },
    onEndDrag: () => {
      touching.value = 0;
      runOnJS(hold)();
    },
  });
  const reduced = useReducedMotion();
  // Auto-slide to the next quarter every few seconds (Q4 goes back to Q1). A swipe takes over;
  // it starts again a few seconds after she lets go. Reduced motion: no auto-slide.
  useEffect(() => {
    if (reduced) return undefined;
    const t = setInterval(() => {
      if (touching.value || Date.now() - pausedAt.current < QUARTER_HOLD_MS) return;
      const now = Math.max(0, Math.min(MBW_QUARTERS.length - 1, Math.round(x.value / snap)));
      const next = (now + 1) % MBW_QUARTERS.length;
      slideToRef.current(next);
      onChange(next);
    }, QUARTER_AUTO_MS);
    return () => clearInterval(t);
  }, [snap, reduced]);
  // The card in the centre becomes the selected quarter (ring + text follow).
  useAnimatedReaction(
    () => Math.max(0, Math.min(MBW_QUARTERS.length - 1, Math.round(x.value / snap))),
    (i, prev) => {
      if (target.value >= 0) {
        if (i === target.value) target.value = -1;
        return;
      }
      if (prev !== null && i !== prev) runOnJS(onChange)(i);
    },
    [snap]
  );
  const slideTo = (i) => {
    if (Math.round(x.value / snap) === i) return;
    target.value = i;
    ref.current?.scrollTo?.({ x: i * snap, animated: true });
  };
  const slideToRef = React.useRef(slideTo);
  slideToRef.current = slideTo;

  return (
    <View style={{ marginHorizontal: -20, marginTop: 12 }}>
      <Reanimated.ScrollView
        ref={ref}
        horizontal
        showsHorizontalScrollIndicator={false}
        snapToInterval={snap}
        decelerationRate="fast"
        disableIntervalMomentum
        onScroll={onScroll}
        scrollEventThrottle={16}
        contentContainerStyle={{ paddingHorizontal: side - gap / 2 }}
      >
        {MBW_QUARTERS.map((q, i) => (
          <QuarterCard
            key={q.q}
            q={q}
            i={i}
            x={x}
            snap={snap}
            width={cardW}
            gap={gap}
            onPress={() => {
              hold();
              slideTo(i);
              onChange(i);
            }}
          />
        ))}
      </Reanimated.ScrollView>
      <View style={{ flexDirection: 'row', justifyContent: 'center', marginTop: 14 }}>
        {MBW_QUARTERS.map((q, i) => (
          <DeckDot key={q.q} i={i} x={x} snap={snap} />
        ))}
      </View>
    </View>
  );
}

function QuarterCard({ q, i, x, snap, width, gap, onPress }) {
  const style = useAnimatedStyle(() => {
    const d = Math.min(1, Math.abs(x.value - i * snap) / snap);
    return { opacity: 1 - 0.45 * d, transform: [{ scale: 1 - 0.08 * d }] };
  });
  return (
    <Reanimated.View style={[{ width, marginHorizontal: gap / 2 }, style]}>
      <Pressable
        onPress={onPress}
        pressFeedback={false}
        accessibilityRole="button"
        accessibilityLabel={`${q.q}, ${q.title}, ${q.weeks}`}
        style={{ backgroundColor: G.dark, borderRadius: 26, padding: 22, minHeight: 236, overflow: 'hidden' }}
      >
        <ILText
          role="display"
          color="rgba(248,214,212,0.16)"
          style={{
            position: 'absolute',
            right: -6,
            top: -18,
            fontFamily: IL_FONTS.display,
            fontSize: 132,
            lineHeight: 150,
            letterSpacing: -4,
          }}
        >
          {q.q}
        </ILText>
        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
          <View style={{ width: 8, height: 8, borderRadius: 4, backgroundColor: G.cta, marginRight: 8 }} />
          <ILText role="label" color="rgba(255,255,255,0.72)" style={{ fontSize: 12 }}>
            {`Quarter ${i + 1} of 4 · ${q.weeks}`}
          </ILText>
        </View>
        <ILText
          role="display"
          color="#FFFFFF"
          style={{ marginTop: 34, fontFamily: IL_FONTS.display, fontSize: 28, lineHeight: 33, letterSpacing: -0.5 }}
        >
          {q.title}
        </ILText>
        <ILText role="body" color="rgba(255,255,255,0.8)" style={{ marginTop: 10, fontSize: 14.5, lineHeight: 21 }}>
          {q.about}
        </ILText>
      </Pressable>
    </Reanimated.View>
  );
}

function DeckDot({ i, x, snap }) {
  const style = useAnimatedStyle(() => {
    const d = Math.min(1, Math.abs(x.value - i * snap) / snap);
    return { width: 8 + 18 * (1 - d), opacity: 0.35 + 0.65 * (1 - d) };
  });
  return (
    <Reanimated.View style={[{ height: 8, borderRadius: 4, backgroundColor: G.cta, marginHorizontal: 4 }, style]} />
  );
}

/**
 * One outcome card. The box floats (its colour, edge and shadow drift gently on their own rhythm)
 * while the words stay perfectly still on top, so they are always sharp and easy to read. An open
 * card stops floating. UI thread only (Reanimated).
 */
function FloatingCard({ item, i }) {
  const reduced = useReducedMotion();
  const drift = useSharedValue(0);
  useEffect(() => {
    if (reduced) return;
    drift.value = withDelay(
      i * 260,
      withRepeat(withTiming(1, { duration: 3200 + (i % 3) * 500, easing: Easing.inOut(Easing.sin) }), -1, true)
    );
  }, [reduced]);
  const dark = i % 3 === 0;
  const [open, setOpen] = useState(false);
  const boxStyle = useAnimatedStyle(
    () => ({
      transform: [{ translateY: open ? 0 : -3 + 6 * drift.value }, { scale: open ? 1 : 1 + 0.012 * drift.value }],
      shadowOpacity: open ? 0.12 : 0.08 + 0.08 * drift.value,
    }),
    [open]
  );
  return (
    <Reanimated.View
      layout={LinearTransition.duration(220)}
      style={{ width: open ? '100%' : '50%', padding: 4, paddingVertical: 8 }}
    >
      <Pressable
        onPress={() => setOpen(!open)}
        pressFeedback={false}
        accessibilityRole="button"
        accessibilityState={{ expanded: open }}
        style={{ padding: 15, minHeight: 158 }}
      >
        {/* The floating box, behind the words. */}
        <Reanimated.View
          pointerEvents="none"
          style={[
            {
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              borderRadius: 18,
              backgroundColor: dark ? G.dark : G.white,
              borderWidth: dark ? 0 : 1,
              borderColor: G.line,
              shadowColor: '#0E2A31',
              shadowRadius: 12,
              shadowOffset: { width: 0, height: 8 },
              elevation: 3,
            },
            boxStyle,
          ]}
        />
        <View
          style={{
            width: 34,
            height: 34,
            borderRadius: 17,
            backgroundColor: dark ? G.cta : G.dark,
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <MaterialIcons name={item.icon} size={18} color="#FFFFFF" />
        </View>
        <ILText role="label" color={dark ? '#FFFFFF' : G.ink} style={{ marginTop: 10, fontSize: 15, lineHeight: 20 }}>
          {item.title}
        </ILText>
        <ILText
          role="body"
          color={dark ? 'rgba(255,255,255,0.92)' : G.ink}
          style={{ marginTop: 5, fontSize: 13.5, lineHeight: 19, opacity: dark ? 1 : 0.82 }}
        >
          {item.line}
        </ILText>
        {open ? (
          <Reanimated.View entering={FadeIn.duration(220)} style={{ marginTop: 10 }}>
            <ILText role="body" color={dark ? '#FFFFFF' : G.ink} style={{ fontSize: 15, lineHeight: 22 }}>
              {item.how}
            </ILText>
          </Reanimated.View>
        ) : null}
      </Pressable>
    </Reanimated.View>
  );
}

/** The champion: tap to read what she does for the cohort, and talk to her. */
function ChampionCard({ name, role, about, photo }) {
  const [open, setOpen] = useState(false);
  return (
    <Reanimated.View layout={LinearTransition.duration(220)}>
      <Pressable
        onPress={() => setOpen(!open)}
        accessibilityRole="button"
        accessibilityState={{ expanded: open }}
        style={{
          marginTop: 10,
          borderRadius: 18,
          padding: 12,
          backgroundColor: open ? G.dark : G.white,
          borderWidth: open ? 0 : 1,
          borderColor: G.line,
        }}
      >
        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
          <Image source={photo || FACE} style={{ width: 48, height: 48, borderRadius: 24 }} />
          <View style={{ marginLeft: 12, flex: 1 }}>
            <ILText role="label" color={open ? '#FFFFFF' : G.ink}>
              {name}
            </ILText>
            <ILText role="bodySm" color={open ? 'rgba(255,255,255,0.7)' : G.meta} style={{ marginTop: 2, fontSize: 12 }}>
              {role}
            </ILText>
          </View>
          <MaterialIcons name={open ? 'expand-less' : 'expand-more'} size={22} color={open ? '#FFFFFF' : G.meta} />
        </View>
        {open ? (
          <Reanimated.View entering={FadeIn.duration(220)} style={{ marginTop: 12 }}>
            <ILText role="body" color="rgba(255,255,255,0.86)" style={{ fontSize: 14, lineHeight: 21 }}>
              {about}
            </ILText>
          </Reanimated.View>
        ) : null}
      </Pressable>
    </Reanimated.View>
  );
}

/** The featured Iron Lady Speaks episode: cover, play, and it plays in the app. */
function EpisodeCard({ episode, onPlay }) {
  if (!episode) return null;
  return (
    <Pressable
      onPress={() => onPlay?.({ assetKey: episode.assetKey, title: episode.title, sub: episode.person })}
      accessibilityRole="button"
      accessibilityLabel={`Play: ${episode.title}`}
      style={{ marginTop: 12, borderRadius: 20, overflow: 'hidden', backgroundColor: G.dark }}
    >
      <View style={{ height: 170 }}>
        <Image source={episode.img} style={{ width: '100%', height: '100%' }} resizeMode="cover" />
        <View style={[fillAbs, { backgroundColor: 'rgba(14,42,49,0.35)', alignItems: 'center', justifyContent: 'center' }]}>
          <View
            style={{
              width: 56,
              height: 56,
              borderRadius: 28,
              backgroundColor: G.cta,
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <MaterialIcons name="play-arrow" size={32} color="#FFFFFF" />
          </View>
        </View>
      </View>
      <View style={{ padding: 14 }}>
        <ILText role="label" color="rgba(255,255,255,0.7)" style={{ fontSize: 12 }}>
          {`Iron Lady Speaks · ${episode.min}`}
        </ILText>
        <ILText role="label" color="#FFFFFF" style={{ marginTop: 4, fontSize: 15, lineHeight: 20 }}>
          {episode.title}
        </ILText>
        <ILText role="bodySm" color="rgba(255,255,255,0.7)" style={{ marginTop: 3, fontSize: 12 }}>
          {episode.person}
        </ILText>
      </View>
    </Pressable>
  );
}

function MbwBody({ onFind, onWatch }) {
  const [quarter, setQuarter] = useState(0);
  const fx = React.useContext(ScrollFx);
  const reduced = useReducedMotion();
  // Parallax: the hero drifts up slower than the page, fades, and the ring recedes.
  const heroStyle = useAnimatedStyle(() => {
    if (!fx || reduced) return {};
    const s = Math.max(0, fx.scrollY.value);
    return { transform: [{ translateY: s * 0.38 }], opacity: Math.max(0, 1 - s / 520) };
  });
  const ringStyle = useAnimatedStyle(() => {
    if (!fx || reduced) return {};
    const s = Math.max(0, fx.scrollY.value);
    return { transform: [{ scale: Math.max(0.78, 1 - s / 1400) }, { rotate: `${Math.min(24, s / 18)}deg` }] };
  });
  return (
    <View>
      <View style={{ backgroundColor: G.dark, overflow: 'hidden' }}>
        <Reanimated.View
          style={[{ paddingHorizontal: 20, paddingTop: 20, paddingBottom: 28, alignItems: 'center' }, heroStyle]}
        >
          <View
            style={{
              backgroundColor: 'rgba(255,255,255,0.1)',
              borderRadius: 999,
              paddingHorizontal: 10,
              paddingVertical: 5,
            }}
          >
            <ILText role="eyebrow" color="#FFFFFF" style={[af, { fontSize: 9 }]}>
              C-Suite League · 1 year · by application
            </ILText>
          </View>
          <Headline light accentLast lines={['Master of Business Warfare.', 'From capability to command.']} />
          <Reanimated.View style={ringStyle}>
            <YearRing active={quarter} />
          </Reanimated.View>
          <ILText
            role="bodySm"
            color="rgba(255,255,255,0.7)"
            align="center"
            style={{ marginTop: 16, fontSize: 13, lineHeight: 19 }}
          >
            One year to not just enter the C-suite, but hold it — four quarters with a closed circle of senior women.
          </ILText>
        </Reanimated.View>
      </View>

      <RevealPad>
        <Section title="Built for the top table" />
        <ILText role="body" color={G.meta} style={{ marginTop: 8, fontSize: 15, lineHeight: 22 }}>
          Not a course — a war room. A year of competitor-centric, market-centric strategy, so the move to the C-suite stops
          being a distant dream and becomes a plan with a date on it.
        </ILText>
        <View style={{ flexDirection: 'row', marginTop: 14 }}>
          {[
            ['100+', 'Iron Ladies past ₹1 Crore a year'],
            ['78,000+', 'women in the Iron Lady network'],
          ].map(([n, label], i) => (
            <WhiteCard key={n} style={{ flex: 1, borderRadius: 18, padding: 14, marginLeft: i ? 8 : 0 }}>
              <StatNum color={G.cta} size={24}>
                {n}
              </StatNum>
              <ILText role="bodySm" color={G.meta} style={{ marginTop: 4, fontSize: 12, lineHeight: 16 }}>
                {label}
              </ILText>
            </WhiteCard>
          ))}
        </View>

        <Section title="Your year" />
        <QuarterDeck active={quarter} onChange={setQuarter} />

        <Section title="What you walk out with" />
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', marginTop: 10, marginHorizontal: -4 }}>
          {MBW_BUILD.map((b, i) => (
            <FloatingCard key={b.title} item={b} i={i} />
          ))}
        </View>

        <Section title="How you get in" />
        <WhiteCard style={{ marginTop: 12, borderRadius: 22, padding: 16 }}>
          {[
            ['1', 'Apply', 'Tell us where you lead today and the role you are going for next.'],
            ['2', 'A conversation, not a form', 'A senior advisor looks at your scope, your ambition and your 2–3 year plan.'],
            ['3', 'Take your seat', 'A closed cohort — about five batches a year, kept small on purpose.'],
          ].map((s, i) => (
            <View key={s[0]} style={{ flexDirection: 'row', marginTop: i ? 16 : 0 }}>
              <View
                style={{
                  width: 28,
                  height: 28,
                  borderRadius: 14,
                  backgroundColor: i === 0 ? G.cta : G.mutedFill,
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginRight: 12,
                }}
              >
                <StatNum color={i === 0 ? '#FFFFFF' : G.ink} size={14}>
                  {s[0]}
                </StatNum>
              </View>
              <View style={{ flex: 1 }}>
                <ILText role="label" color={G.ink}>
                  {s[1]}
                </ILText>
                <ILText role="bodySm" color={G.meta} style={{ marginTop: 3, fontSize: 12 }}>
                  {s[2]}
                </ILText>
              </View>
            </View>
          ))}
        </WhiteCard>


        <Section title="If life gets in the way" />
        <WhiteCard style={{ marginTop: 12, borderRadius: 22, padding: 16 }}>
          {[
            ['60 days’ notice', '₹5,000 to reschedule'],
            ['30 days’ notice', '₹7,000 to reschedule'],
            ['10 days’ notice', '₹10,000 to reschedule'],
          ].map((r, i) => (
            <View
              key={r[0]}
              style={{
                flexDirection: 'row',
                justifyContent: 'space-between',
                paddingVertical: 10,
                borderTopWidth: i ? 1 : 0,
                borderTopColor: G.line,
              }}
            >
              <ILText role="label" color={G.ink} style={{ fontSize: 13 }}>
                {r[0]}
              </ILText>
              <ILText role="label" color={G.ink} style={{ fontSize: 13 }}>
                {r[1]}
              </ILText>
            </View>
          ))}
          <ILText role="bodySm" color={G.meta} style={{ marginTop: 8, fontSize: 12, lineHeight: 17 }}>
            Under 15 days’ notice, the session fee is forfeited — the room is small on purpose, and every seat is held for you.
          </ILText>
        </WhiteCard>

        <Section title="Your champion" />
        <ChampionCard
          name="Bavani Sivam"
          role="National C-Suite Champion, Iron Lady"
          about="She walks with every MBW cohort for the whole year — from your admissions conversation to your C-suite game plan in Q4. Bring her your toughest move; that is what she is there for."
        />

        <Section title="Watch first" />
        <EpisodeCard episode={EPISODES[0]} onPlay={onWatch} />

        <FindCta
          kicker="Your next move"
          title="Is the C-suite your next move?"
          body="100+ Iron Ladies have crossed the ₹1 Crore band. Tell us where you lead today — we’ll show you the fastest route to the top table."
          onPress={onFind}
          ctaLabel="Apply for MBW"
        />
        <GhostCta label="Talk to an advisor" />
        <AdvisorNote />
      </RevealPad>
    </View>
  );
}

function Headline({ lines, accentLast, light }) {
  return (
    <View style={{ marginTop: 12 }}>
      {lines.map((line, i) => {
        const accent = accentLast && i === lines.length - 1;
        return (
          <ILText
            key={line}
            role="display"
            color={accent ? (light ? G.pink : G.cta) : light ? '#FFFFFF' : G.ink}
            style={{
              fontFamily: accent ? IL_FONTS.displayItalic : IL_FONTS.display,
              fontSize: 32,
              lineHeight: 38,
              letterSpacing: -0.6,
            }}
          >
            {line}
          </ILText>
        );
      })}
    </View>
  );
}

function KickerPill({ children }) {
  return (
    <View
      style={{
        alignSelf: 'flex-start',
        backgroundColor: G.pink,
        borderRadius: 999,
        paddingHorizontal: 10,
        paddingVertical: 5,
      }}
    >
      <ILText role="eyebrow" color={G.cta} style={[af, { fontSize: 9 }]}>
        {children}
      </ILText>
    </View>
  );
}

function Section({ title, sub }) {
  return (
    <View style={{ marginTop: 24 }}>
      <ILText role="title" color={G.ink} style={{ fontFamily: IL_FONTS.display, fontSize: 20, lineHeight: 26 }}>
        {title}
      </ILText>
      {sub ? (
        <ILText role="bodySm" color={G.meta} style={{ marginTop: 4, fontSize: 12 }}>
          {sub}
        </ILText>
      ) : null}
    </View>
  );
}

function SlotRow({ label, a, as, b, bs, dark }) {
  const color = dark ? '#FFFFFF' : G.ink;
  const meta = dark ? 'rgba(255,255,255,0.7)' : G.meta;
  return (
    <View style={{ flexDirection: 'row', alignItems: 'center' }}>
      <View style={{ flex: 1 }}>
        <ILText role="eyebrow" color={dark ? G.pink : G.cta} style={[af, { fontSize: 9 }]}>
          {label}
        </ILText>
        <View style={{ flexDirection: 'row', marginTop: 8 }}>
          <View style={{ flex: 1 }}>
            <StatNum color={color} size={22}>
              {a}
            </StatNum>
            <ILText role="bodySm" color={meta} style={{ fontSize: 11 }}>
              {as}
            </ILText>
          </View>
          <View style={{ flex: 1 }}>
            <StatNum color={color} size={22}>
              {b}
            </StatNum>
            <ILText role="bodySm" color={meta} style={{ fontSize: 11 }}>
              {bs}
            </ILText>
          </View>
        </View>
      </View>
      <MaterialIcons name="check" size={18} color={color} />
    </View>
  );
}

function StatRow({ items }) {
  return (
    <View style={{ flexDirection: 'row', marginTop: 16 }}>
      {items.map((s, i) => (
        <WhiteCard
          key={s[1]}
          style={{
            flex: 1,
            marginRight: i < items.length - 1 ? 8 : 0,
            borderRadius: 16,
            paddingVertical: 14,
            alignItems: 'center',
          }}
        >
          <StatNum size={s[0] === 'Weekly' ? 18 : 20}>{s[0]}</StatNum>
          <ILText role="bodySm" color={G.meta} style={{ marginTop: 4, fontSize: 11 }} align="center">
            {s[1]}
          </ILText>
        </WhiteCard>
      ))}
    </View>
  );
}

function RedCta({ label, onPress }) {
  return (
    <Pressable
      onPress={onPress}
      style={{
        marginTop: 14,
        backgroundColor: G.cta,
        borderRadius: 999,
        paddingVertical: 14,
        alignItems: 'center',
        flexDirection: 'row',
        justifyContent: 'center',
      }}
    >
      <ILText role="label" color="#FFFFFF">
        {label}
      </ILText>
      <MaterialIcons name="arrow-forward" size={16} color="#FFFFFF" style={{ marginLeft: 6 }} />
    </Pressable>
  );
}

function DarkCta({ label, onPress }) {
  return (
    <Pressable
      onPress={onPress}
      style={{
        marginTop: 12,
        backgroundColor: G.dark,
        borderRadius: 999,
        paddingVertical: 14,
        alignItems: 'center',
        flexDirection: 'row',
        justifyContent: 'center',
      }}
    >
      <ILText role="label" color="#FFFFFF">
        {label}
      </ILText>
      <MaterialIcons name="arrow-forward" size={16} color="#FFFFFF" style={{ marginLeft: 6 }} />
    </Pressable>
  );
}

function GhostCta({ label }) {
  return (
    <View
      style={{
        marginTop: 10,
        borderWidth: 1,
        borderColor: G.ink,
        borderRadius: 999,
        paddingVertical: 13,
        alignItems: 'center',
      }}
    >
      <ILText role="label" color={G.ink}>
        {label}
      </ILText>
    </View>
  );
}

function AdvisorNote() {
  return (
    <ILText role="bodySm" color={G.meta} align="center" style={{ marginTop: 14, fontSize: 12 }}>
      LMS access · 1 year free community · scholarships available
    </ILText>
  );
}

function Champion({ name, role, photo }) {
  return (
    <WhiteCard
      style={{
        marginTop: 10,
        borderRadius: 18,
        padding: 12,
        flexDirection: 'row',
        alignItems: 'center',
      }}
    >
      <Image source={photo || FACE} style={{ width: 44, height: 44, borderRadius: 22 }} />
      <View style={{ marginLeft: 12, flex: 1 }}>
        <ILText role="label" color={G.ink}>
          {name}
        </ILText>
        <ILText role="bodySm" color={G.meta} style={{ marginTop: 2, fontSize: 12 }}>
          {role}
        </ILText>
      </View>
    </WhiteCard>
  );
}

function PodcastRow({ kicker, title, person, img }) {
  return (
    <WhiteCard
      style={{
        marginTop: 12,
        borderRadius: 18,
        padding: 14,
        flexDirection: 'row',
        alignItems: 'center',
      }}
    >
      {img ? (
        <View style={{ width: 72, height: 40, borderRadius: 10, overflow: 'hidden', backgroundColor: G.dark, marginRight: 12 }}>
          <Image source={img} style={{ width: '100%', height: '100%' }} resizeMode="cover" />
        </View>
      ) : (
      <View
        style={{
          width: 44,
          height: 44,
          borderRadius: 12,
          backgroundColor: G.cta,
          alignItems: 'center',
          justifyContent: 'center',
          marginRight: 12,
        }}
      >
        <MaterialIcons name="mic" size={22} color="#FFFFFF" />
      </View>
      )}
      <View style={{ flex: 1 }}>
        <ILText role="eyebrow" color={G.cta} style={[af, { fontSize: 8 }]}>
          {kicker}
        </ILText>
        <ILText role="label" color={G.ink} style={{ marginTop: 4, fontSize: 13, lineHeight: 18 }}>
          {title}
        </ILText>
        <ILText role="bodySm" color={G.meta} style={{ marginTop: 3, fontSize: 11 }}>
          {person}
        </ILText>
      </View>
    </WhiteCard>
  );
}

function BoardDots() {
  const spots = [
    [0, -52],
    [36, -38],
    [52, 0],
    [36, 38],
    [0, 52],
    [-36, 38],
    [-52, 0],
    [-36, -38],
  ];
  return (
    <View style={{ width: 160, height: 140, marginTop: 20, alignItems: 'center', justifyContent: 'center' }}>
      <View
        style={{
          width: 72,
          height: 40,
          borderRadius: 20,
          borderWidth: 2,
          borderColor: 'rgba(255,255,255,0.25)',
        }}
      />
      {spots.map(([x, y], i) => (
        <View
          key={i}
          style={{
            position: 'absolute',
            width: 10,
            height: 10,
            borderRadius: 5,
            backgroundColor: i === 4 ? G.cta : 'rgba(255,255,255,0.28)',
            transform: [{ translateX: x }, { translateY: y }],
          }}
        />
      ))}
    </View>
  );
}

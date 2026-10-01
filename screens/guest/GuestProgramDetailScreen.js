import React from 'react';
import { Image, Pressable, ScrollView, View } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialIcons } from '@expo/vector-icons';
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
import { COVER, FACE, HERO } from './guestData';

const META = {
  mc: { title: 'Masterclass (MC)', sub: 'Start here · two live evenings' },
  lep: { title: 'Leadership Essentials program (LEP)', sub: 'Most chosen · 11 steps' },
  '100bm': { title: '100 Board Members (100BM)', sub: 'Board-ready · 6 months' },
  mbw: { title: 'Master of Business Warfare (MBW)', sub: 'By application · 1 year' },
};

export default function GuestProgramDetailScreen({ navigation, route }) {
  const insets = useSafeAreaInsets();
  const { findRegistration } = useGuestActions();
  const id = route?.params?.id || 'mc';
  const meta = META[id] || META.mc;

  return (
    <Page>
      <StatusBar style="dark" />
      <View style={{ paddingTop: Math.max(insets.top, 8) }}>
        <GuestBackBar title={meta.title} sub={meta.sub} onBack={() => navigation.goBack()} />
      </View>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: Math.max(insets.bottom, 16) + 24 }}
      >
        {id === 'lep' ? (
          <LepBody onFind={findRegistration} />
        ) : id === '100bm' ? (
          <BmBody onFind={findRegistration} />
        ) : id === 'mbw' ? (
          <MbwBody onFind={findRegistration} />
        ) : (
          <McBody onFind={findRegistration} />
        )}
      </ScrollView>
    </Page>
  );
}

function Pad({ children, style }) {
  return <View style={[{ paddingHorizontal: 20 }, style]}>{children}</View>;
}

function McBody({ onFind }) {
  const practise = [
    ['01', 'BHAG', 'Name the goal that scares you — the first step of every Iron Lady journey.'],
    ['02', 'Differentiated branding', 'The image you create in other people’s minds, built on strengths.'],
    ['03', 'Shameless pitching', 'Ask for what you deserve, confidently and unapologetically.'],
    ['04', 'The art of negotiation', 'You get what you negotiate for — not just what you deserve.'],
  ];
  return (
    <Pad style={{ paddingTop: 8 }}>
      <KickerPill>Live · twice every week</KickerPill>
      <Headline lines={['Two evenings.', 'A different career.']} accentLast />
      <ILText role="body" color={G.meta} style={{ marginTop: 10, fontSize: 15, lineHeight: 22 }}>
        The live on-ramp to the Iron Lady method. Four of the 27 principles, practised in the room — not just heard.
      </ILText>
      <View style={{ marginTop: 18, borderRadius: 20, overflow: 'hidden', height: 180 }}>
        <Image source={HERO} style={fillAbs} resizeMode="cover" />
        <LinearGradient colors={['transparent', 'rgba(10,32,40,0.85)']} style={fillAbs} />
        <ILText
          role="title"
          color="#FFFFFF"
          style={{
            position: 'absolute',
            left: 16,
            right: 16,
            bottom: 16,
            fontFamily: IL_FONTS.displayItalic,
            fontSize: 18,
            lineHeight: 24,
          }}
        >
          “Knowledge alone is not enough.”
        </ILText>
      </View>

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
  );
}

function LepBody({ onFind }) {
  const steps = [
    ['01', 'Pre-Program Preparation', 'VIA Survey, 3 photographs, CoDeSeF sheet'],
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
        <RedCta label="Check my eligibility" onPress={onFind} />
        <GhostCta label="Talk to an advisor" />
        <AdvisorNote />
      </Pad>
    </View>
  );
}

function BmBody({ onFind }) {
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
          kicker="Ready to start?"
          title="Onboarding opens as soon as you register"
          body="Find your registration, or pick a batch date if you haven’t signed up yet."
          onPress={onFind}
        />
        <DarkCta label="Check my eligibility" onPress={onFind} />
        <GhostCta label="Talk to an advisor" />
        <AdvisorNote />
      </Pad>
    </View>
  );
}

function MbwBody({ onFind }) {
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
            1 year · by application · ~5 batches a year
          </ILText>
        </View>
        <Headline
          light
          accentLast
          lines={['Master of Business Warfare.', 'For women who already lead.']}
        />
        <YearRing />
        <ILText
          role="bodySm"
          color="rgba(255,255,255,0.7)"
          align="center"
          style={{ marginTop: 16, fontSize: 13, lineHeight: 19 }}
        >
          A year-long strategy circle for senior women heading to the C-suite — four in-person sessions, one closed cohort.
        </ILText>
      </View>

      <Pad>
        <Section title="For women who already lead" />
        <ILText role="body" color={G.meta} style={{ marginTop: 8, fontSize: 15, lineHeight: 22 }}>
          Not a workshop — a strategy circle. Four powerful in-person sessions across a year, built around positioning, timing and the moves only a room of peers can pressure-test.
        </ILText>

        <Section title="Your year" sub="Four in-person sessions, one each quarter" />
        <WhiteCard style={{ marginTop: 12, borderRadius: 22, padding: 12 }}>
          <View style={{ flexDirection: 'row', flexWrap: 'wrap' }}>
            {['Q1', 'Q2', 'Q3', 'Q4'].map((q, i) => (
              <View key={q} style={{ width: '50%', padding: 4 }}>
                <View
                  style={{
                    borderRadius: 16,
                    padding: 14,
                    minHeight: 88,
                    backgroundColor: i === 0 ? G.dark : G.white,
                    borderWidth: i === 0 ? 0 : 1,
                    borderColor: G.line,
                  }}
                >
                  <QuarterNum color={i === 0 ? '#FFFFFF' : G.ink} size={26}>
                    {q}
                  </QuarterNum>
                  <ILText
                    role="body"
                    color={i === 0 ? '#FFFFFF' : G.ink}
                    style={{ marginTop: 6, fontFamily: IL_FONTS.medium, fontSize: 13, lineHeight: 17 }}
                  >
                    In-person session
                  </ILText>
                  <ILText
                    role="bodySm"
                    color={i === 0 ? 'rgba(255,255,255,0.7)' : G.meta}
                    style={{ fontSize: 11 }}
                  >
                    In person
                  </ILText>
                </View>
              </View>
            ))}
          </View>
          <ILText role="bodySm" color={G.meta} style={{ marginTop: 10, paddingHorizontal: 4, fontSize: 12, lineHeight: 18 }}>
            One year, four rooms, no weekly modules to keep up with — each session is built around what you bring to it, not a syllabus you scroll through.
          </ILText>
        </WhiteCard>

        <Section title="What you build" sub="For leaders at enterprise level" />
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', marginTop: 10 }}>
          {['Enterprise strategy', 'C-suite influence', 'Win without fighting', 'Senior peer circle'].map((c) => (
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

        <Section title="How you get in" />
        <WhiteCard style={{ marginTop: 12, borderRadius: 22, padding: 16 }}>
          {[
            ['1', 'Find your registration', 'Most women arrive here through LEP or 100BM.'],
            ['2', 'We place you on the right path', 'MBW included, when you’re ready for it.'],
            ['3', 'Take your seat', 'A closed cohort · about five batches a year.'],
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
        <Champion name="Bavani Sivam" role="National C-Suite Champion, Iron Lady" />

        <Section title="Listen first" />
        <PodcastRow
          kicker="Iron Lady Speaks · 46 min"
          title="The One Notch Up: A Global CEO’s Blueprint for Leadership"
          person="Simon Newman · Co-Founder & Chairman, Iron Lady"
        />

        <FindCta
          kicker="Curious?"
          title="Curious if it’s your next step?"
          body="Most women arrive here through LEP or 100BM. Find your registration, and we’ll place you on the right path — MBW included, when you’re ready for it."
          onPress={onFind}
        />
        <RedCta label="Apply for MBW" onPress={onFind} />
        <GhostCta label="Talk to an advisor" />
        <AdvisorNote />
      </Pad>
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

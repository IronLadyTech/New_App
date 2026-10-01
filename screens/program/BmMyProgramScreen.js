import React, { useState } from 'react';
import { ScrollView, View } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { MaterialIcons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { IL_FONTS } from '../../constants/ironLadyBrand';
import ILText from '../../components/il/ILText';
import { G, af } from '../../constants/guestTheme';
import { LIQUID_TAB_PAD } from '../../components/il/LiquidTabBar';
import { useAuth } from '../../context/AuthContext';
import { useProgramNav } from '../../context/ProgramNavContext';
import { FilterBar, LepHeader, Page, ProgressDark, UnderlineTabs, WhiteCard } from '../lep/LepBits';
import { useLepNav } from '../lep/useLepNav';
import { useGlassHeaderPad } from '../../components/il/GlassHeader';

const PRE = [
  { kicker: 'Pre-program · now', title: 'Brand creation video', meta: 'Your Core Story, 2–3 minutes on camera', now: true },
  { kicker: 'Pre-program', title: 'Milestone Table practice', meta: 'Draft the milestones you will present at Onboarding' },
  { kicker: 'Pre-program', title: 'Resume preparation', meta: 'Bring a current draft — you will rework it in Phase 1' },
];

const AHEAD = [
  { kicker: 'Phase 1', title: 'Foundation', meta: 'Board-member image, brand video, resume' },
  { kicker: 'Phase 2', title: 'Pitch & Strategy', meta: 'Pitching, influencing and mid-level politics' },
  { kicker: 'Phase 3', title: 'Board Ready', meta: 'Strategic outlook, strategy review, mock interview' },
  { kicker: 'Phase 4', title: 'Challenges', meta: 'Walk to Board, LinkedIn video, Speak like a CEO' },
  { kicker: 'Graduation', title: 'Your speech video', meta: '' },
];

const PHASES = [
  { kicker: 'Onboarding', title: 'Core story · milestone table', meta: 'Brand video, Milestone Table and resume reviewed', done: true },
  { kicker: 'Phase 1', title: 'Foundation', meta: 'Board-member image, brand video, resume', done: true },
  { kicker: 'Phase 2 · now', title: 'Pitch & strategy', meta: 'Pitching and influencing, and mid-level politics', now: true },
  { kicker: 'Phase 3', title: 'Board ready', meta: 'Strategic outlook, strategy review, mock interview' },
  { kicker: 'Phase 4', title: 'Challenges', meta: 'Walk to Board, LinkedIn video, Speak like a CEO' },
  { kicker: 'Graduation', title: 'Your speech video', meta: '' },
];

const DRILLS = [
  { label: 'LinkedIn Optimization', done: true },
  { label: 'SuperPower Statement', done: true },
  { label: 'ERRC Grid', done: true },
  { label: 'Imperfect Brand Video', done: false },
  { label: 'Mock Interview', done: false },
  { label: 'Walk to Board', done: false },
  { label: '+2 more', done: false },
];

export default function BmMyProgramScreen() {
  const { profile } = useAuth();
  const { stage, setProgram } = useProgramNav();
  const insets = useSafeAreaInsets();
  const headerPad = useGlassHeaderPad();
  const nav = useLepNav();
  const registered = stage === 'registered';
  const [tab, setTab] = useState('Journey');
  const [prog, setProg] = useState('100BM');

  return (
    <Page>
      <StatusBar style="dark" />
      <LepHeader
        floating
        photoUrl={profile?.photoURL}
        onNotifications={nav.goNotifications}
        onProfile={nav.goProfile}
      />
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{
          paddingTop: headerPad + 4,
          paddingHorizontal: 20,
          paddingBottom: LIQUID_TAB_PAD + Math.max(insets.bottom, 8),
        }}
      >
        <ILText role="eyebrow" color={G.cta} style={[af, { fontSize: 10, letterSpacing: 1.4 }]}>
          My Program
        </ILText>
        <ILText
          role="display"
          color={G.ink}
          style={{ marginTop: 8, fontFamily: IL_FONTS.display, fontSize: 32, lineHeight: 38 }}
        >
          100 Board Members
        </ILText>

        {registered ? null : (
          <View style={{ marginTop: 18 }}>
            <FilterBar
              items={['All', 'LEP', '100BM']}
              value={prog}
              onChange={(v) => {
                setProg(v);
                if (v === 'LEP') setProgram('lep');
                if (v === 'All') setProgram('all');
              }}
            />
          </View>
        )}

        <View style={{ marginTop: 18 }}>
          <UnderlineTabs items={['Journey', 'Sessions', 'Cohort']} value={tab} onChange={setTab} />
        </View>

        {tab === 'Journey' ? (
          registered ? <RegisteredJourney /> : <EnrolledJourney />
        ) : (
          <LockedNote tab={tab} registered={registered} />
        )}
      </ScrollView>
    </Page>
  );
}

function Row({ item, last }) {
  const now = item.now;
  const done = item.done;
  return (
    <View
      style={{
        flexDirection: 'row',
        alignItems: 'flex-start',
        paddingHorizontal: 16,
        paddingVertical: 14,
        borderBottomWidth: last ? 0 : 1,
        borderBottomColor: G.line,
        backgroundColor: now ? G.pink : 'transparent',
      }}
    >
      <View
        style={{
          width: 24,
          height: 24,
          borderRadius: 12,
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: now ? G.cta : done ? G.ink : 'transparent',
          borderWidth: now || done ? 0 : 1.5,
          borderColor: G.line,
        }}
      >
        {done || now ? (
          <MaterialIcons name={done ? 'check' : 'arrow-forward'} size={14} color="#FFFFFF" />
        ) : null}
      </View>
      <View style={{ flex: 1, marginLeft: 12 }}>
        <ILText role="eyebrow" color={now ? G.cta : G.meta} style={[af, { fontSize: 9 }]}>
          {item.kicker}
        </ILText>
        <ILText role="label" color={G.ink} style={{ marginTop: 2 }}>
          {item.title}
        </ILText>
        {item.meta ? (
          <ILText role="bodySm" color={G.meta} style={{ marginTop: 2, fontSize: 12, lineHeight: 17 }}>
            {item.meta}
          </ILText>
        ) : null}
      </View>
    </View>
  );
}

function RegisteredJourney() {
  return (
    <>
      <View style={{ marginTop: 16, backgroundColor: G.dark, borderRadius: 24, padding: 18 }}>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
          <ILText role="eyebrow" color={G.pink} style={[af, { fontSize: 9 }]}>
            Registered · pre-program
          </ILText>
          <ILText role="eyebrow" color="rgba(255,255,255,0.7)" style={[af, { fontSize: 9 }]}>
            0 of 3 done
          </ILText>
        </View>
        <ILText
          role="title"
          color="#FFFFFF"
          style={{ marginTop: 10, fontFamily: IL_FONTS.display, fontSize: 24, lineHeight: 30 }}
        >
          Before your first session
        </ILText>
        <ILText role="bodySm" color="rgba(255,255,255,0.72)" style={{ marginTop: 8, fontSize: 13, lineHeight: 19 }}>
          Three things Iron Lady needs from you — not your batch leader, you. Onboarding opens once enrolment is complete.
        </ILText>
      </View>

      <WhiteCard style={{ marginTop: 14, borderRadius: 22, overflow: 'hidden' }}>
        {PRE.map((item, i) => (
          <Row key={item.title} item={item} last={i === PRE.length - 1} />
        ))}
      </WhiteCard>

      <ILText role="title" color={G.ink} style={{ marginTop: 26, fontFamily: IL_FONTS.display, fontSize: 22 }}>
        What’s ahead
      </ILText>
      <ILText role="bodySm" color={G.meta}>
        4 phases + Graduation
      </ILText>
      <WhiteCard style={{ marginTop: 12, borderRadius: 22, overflow: 'hidden' }}>
        {AHEAD.map((item, i) => (
          <Row key={item.title} item={item} last={i === AHEAD.length - 1} />
        ))}
      </WhiteCard>

      <View style={{ marginTop: 16, flexDirection: 'row', alignItems: 'flex-start' }}>
        <MaterialIcons name="info" size={16} color={G.cta} style={{ marginTop: 2 }} />
        <ILText role="bodySm" color={G.ink} style={{ flex: 1, marginLeft: 8, fontSize: 13, lineHeight: 19 }}>
          <ILText role="label" color={G.ink} style={{ fontSize: 13 }}>
            Why this order matters.{' '}
          </ILText>
          Foundation works from your Core Story and resume live in the room. Send both in before your cohort starts and the phase works for you, not on you.
        </ILText>
      </View>
    </>
  );
}

function EnrolledJourney() {
  return (
    <>
      <View style={{ marginTop: 16 }}>
        <ProgressDark
          kicker="Your progress"
          title="Phase 2 of 4"
          percent={40}
          right="1 of 4 phases"
          foot="Pitch & strategy · Weekly Q&A Thu 7:00 PM IST"
        />
      </View>
      <ILText role="title" color={G.ink} style={{ marginTop: 22, fontFamily: IL_FONTS.display, fontSize: 22 }}>
        Your phases
      </ILText>
      <ILText role="bodySm" color={G.meta}>
        Weekly online cohort work, each phase with pre, live and post activities
      </ILText>
      <WhiteCard style={{ marginTop: 12, borderRadius: 22, overflow: 'hidden' }}>
        {PHASES.map((item, i) => (
          <Row key={item.title} item={item} last={i === PHASES.length - 1} />
        ))}
      </WhiteCard>
      <ILText role="title" color={G.ink} style={{ marginTop: 26, fontFamily: IL_FONTS.display, fontSize: 22 }}>
        Practice sessions
      </ILText>
      <ILText role="bodySm" color={G.meta}>
        3 of 9 complete
      </ILText>
      <View style={{ flexDirection: 'row', flexWrap: 'wrap', marginTop: 12 }}>
        {DRILLS.map((d) => (
          <View
            key={d.label}
            style={{
              marginRight: 8,
              marginBottom: 8,
              borderRadius: 999,
              paddingHorizontal: 12,
              paddingVertical: 8,
              backgroundColor: d.done ? G.pink : G.white,
              borderWidth: d.done ? 0 : 1,
              borderColor: G.line,
            }}
          >
            <ILText role="label" color={d.done ? G.cta : G.ink} style={{ fontSize: 12 }}>
              {d.done ? `✓ ${d.label}` : d.label}
            </ILText>
          </View>
        ))}
      </View>
    </>
  );
}

function LockedNote({ tab, registered }) {
  return (
    <WhiteCard style={{ marginTop: 18, borderRadius: 22, padding: 20 }}>
      <ILText role="label" color={G.ink}>
        {tab}
      </ILText>
      <ILText role="bodySm" color={G.meta} style={{ marginTop: 8, fontSize: 13, lineHeight: 19 }}>
        {registered
          ? `${tab} open once your 100BM seat is confirmed.`
          : `${tab} for this cohort — weekly live Q&A, intensives and your practice huddle.`}
      </ILText>
    </WhiteCard>
  );
}

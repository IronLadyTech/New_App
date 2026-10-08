import React, { useState } from 'react';
import { Image, ScrollView, View } from 'react-native';
import Pressable from '../../components/il/Press';
import { StatusBar } from 'expo-status-bar';
import { MaterialIcons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { IL_FONTS } from '../../constants/ironLadyBrand';
import ILText from '../../components/il/ILText';
import { G, af } from '../../constants/guestTheme';
import { LIQUID_TAB_PAD } from '../../components/il/LiquidTabBar';
import { useAuth } from '../../context/AuthContext';
import { useProgramNav } from '../../context/ProgramNavContext';
import {
  FilterBar,
  LepHeader,
  LinkRow,
  Page,
  ProgressDark,
  RedCta,
  UnderlineTabs,
  WhiteCard,
} from '../lep/LepBits';
import { useLepNav } from '../lep/useLepNav';
import { useGlassHeaderPad } from '../../components/il/GlassHeader';
import { PROGRAMS } from '../../constants/programs';
import { coursePhases, currentPhaseId, isPhaseOpen } from '../../constants/programCourseSlice';
import ThisPhaseBlock from './ThisPhaseBlock';

const FACES = [
  require('../../assets/il/portraits/priyanka-sunder.png'),
  require('../../assets/il/portraits/kamini-chawla.png'),
  require('../../assets/il/portraits/rekha-sharma.png'),
  require('../../assets/il/portraits/radhika-sharma.png'),
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

const SESSIONS_UP = [
  { mon: 'OCT', day: '09', title: 'Weekly Q&A', meta: 'Thu 7:00 PM IST · live online · add a question first', cta: 'Join' },
  { mon: 'OCT', day: '11', title: 'Confidential intensive · Pitch & strategy', meta: 'Phase 2 core session · live online', cta: 'Remind me' },
  { mon: 'OCT', day: '14', title: 'Practice huddle · Imperfect Brand Video', meta: 'Small group · bring your draft', cta: 'Add' },
];

const SESSIONS_DONE = [
  { mon: 'OCT', day: '02', title: 'Weekly Q&A', meta: 'Attended · check-in saved' },
  { mon: 'SEP', day: '27', title: 'Phase 1 · Foundation wrap-up', meta: 'Attended' },
];

const COHORT_WEEK = [
  { icon: 'mic', title: '5 women posted their Imperfect Brand Video', meta: 'Phase 2 drill · give one reply' },
  { icon: 'chat', title: '3 questions queued for Thursday’s Q&A', meta: 'Add yours' },
  { icon: 'military-tech', title: 'Board ambitions shared: 14 of 18', meta: 'Yours: Independent director by 2028' },
];

const HUDDLE = ['SuperPower Statement', 'Mock Interview', 'Walk to Board'];

export default function BmMyProgramScreen() {
  const { profile } = useAuth();
  const { stage, setProgram, section, setSection } = useProgramNav();
  const insets = useSafeAreaInsets();
  const headerPad = useGlassHeaderPad();
  const nav = useLepNav();
  const registered = stage === 'registered';
  const tab = section === 'Sessions' || section === 'Cohort' ? section : 'Journey';
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
                if (v === 'All') setProgram('all');
                if (v === 'LEP') setProgram('lep');
                if (v === '100BM') setProgram('100bm');
              }}
            />
          </View>
        )}

        <View style={{ marginTop: 18 }}>
          <UnderlineTabs items={['Journey', 'Sessions', 'Cohort']} value={tab} onChange={setSection} />
        </View>

        {tab === 'Journey' ? (
          registered ? <RegisteredJourney onEnroll={nav.goEnroll} /> : <EnrolledJourney />
        ) : tab === 'Sessions' ? (
          <SessionsBody locked={registered} />
        ) : (
          <CohortBody locked={registered} />
        )}
      </ScrollView>
    </Page>
  );
}

function UnlockBm({
  onEnroll,
  title = 'Unlock Sessions and Cohort',
  body = 'Live Q&A, intensives, recordings and your practice huddle open the day the balance is paid.',
}) {
  return (
    <View style={{ marginTop: 22, backgroundColor: G.dark, borderRadius: 24, padding: 20 }}>
      <ILText role="eyebrow" color={G.cta} style={[af, { fontSize: 10 }]}>
        ENROLLMENT PENDING
      </ILText>
      <ILText
        role="display"
        color="#FFFFFF"
        style={{ marginTop: 10, fontFamily: IL_FONTS.display, fontSize: 24, lineHeight: 30 }}
      >
        {title}
      </ILText>
      <ILText role="body" color="rgba(255,255,255,0.72)" style={{ marginTop: 8, fontSize: 14, lineHeight: 20 }}>
        {body}
      </ILText>
      <View style={{ marginTop: 18 }}>
        <RedCta label="Complete enrollment →" onPress={onEnroll} />
      </View>
    </View>
  );
}

function PhaseList({ locked, onEnroll }) {
  const nav = useLepNav();
  const phaseId = currentPhaseId(PROGRAMS.BM100, !locked);
  const phases = coursePhases(PROGRAMS.BM100);
  const currentIndex = phases.findIndex((x) => x.id === phaseId);
  return (
    <>
      <ILText role="title" color={G.ink} style={{ marginTop: 26, fontFamily: IL_FONTS.display, fontSize: 22 }}>
        Your phases
      </ILText>
      <ILText role="bodySm" color={G.meta}>
        {locked ? 'Onboarding is open now · Phases 1–4 unlock on enrollment' : '4 phases + Graduation · pre, live and post work in each'}
      </ILText>
      <WhiteCard style={{ marginTop: 12, borderRadius: 22, overflow: 'hidden' }}>
        {phases.map((p, i) => {
          const shut = locked && !isPhaseOpen(p, false);
          const now = p.id === phaseId;
          const done = !locked && i < currentIndex;
          return (
            <Pressable
              key={p.id}
              onPress={shut ? onEnroll : () => nav.goCoursePhase(PROGRAMS.BM100, p.id)}
              accessibilityRole="button"
              accessibilityState={{ disabled: shut }}
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                paddingHorizontal: 16,
                paddingVertical: 14,
                borderTopWidth: i ? 1 : 0,
                borderTopColor: G.line,
                backgroundColor: now ? G.pink : 'transparent',
                opacity: shut ? 0.6 : 1,
              }}
            >
              <MaterialIcons
                name={shut ? 'lock' : done ? 'check-circle' : now ? 'radio-button-checked' : 'radio-button-unchecked'}
                size={22}
                color={shut ? G.meta : now ? G.cta : done ? G.ink : '#C8C4B6'}
              />
              <View style={{ marginLeft: 12, flex: 1 }}>
                <ILText role="eyebrow" color={now ? G.cta : G.meta} style={[af, { fontSize: 10 }]}>
                  {now ? 'Now · ' : ''}
                  {p.id === 'onboarding' ? 'Before Week 1' : p.id === 'graduation' ? 'Finale' : `Phase ${i}`}
                </ILText>
                <ILText role="label" color={G.ink} style={{ marginTop: 2 }}>
                  {p.title}
                </ILText>
                <ILText role="bodySm" color={G.meta} style={{ marginTop: 2, fontSize: 12 }}>
                  {p.sub}
                </ILText>
              </View>
              {shut ? (
                <MaterialIcons name="lock-outline" size={16} color={G.meta} />
              ) : (
                <MaterialIcons name="chevron-right" size={18} color={G.meta} />
              )}
            </Pressable>
          );
        })}
      </WhiteCard>
    </>
  );
}

function RegisteredJourney({ onEnroll }) {
  return (
    <>
      <View style={{ marginTop: 16 }}>
        <ProgressDark
          kicker="Registered · pre-program"
          title="Onboarding"
          percent={5}
          foot="Part payment received · Onboarding open now · Phases 1–4 unlock on enrollment"
        />
      </View>

      <ThisPhaseBlock
        programId={PROGRAMS.BM100}
        phaseId={currentPhaseId(PROGRAMS.BM100, false)}
        style={{ marginTop: 22 }}
      />

      <PhaseList locked onEnroll={onEnroll} />

      <View style={{ marginTop: 16, flexDirection: 'row', alignItems: 'flex-start' }}>
        <MaterialIcons name="info" size={16} color={G.cta} style={{ marginTop: 2 }} />
        <ILText role="bodySm" color={G.ink} style={{ flex: 1, marginLeft: 8, fontSize: 13, lineHeight: 19 }}>
          <ILText role="label" color={G.ink} style={{ fontSize: 13 }}>
            Why this order matters.{' '}
          </ILText>
          Foundation works from your Core Story and resume live in the room. Send both in before your cohort starts and the phase works for you, not on you.
        </ILText>
      </View>
      <UnlockBm
        onEnroll={onEnroll}
        title="Unlock Phases 1–4"
        body="Your seat is held with a part payment. Foundation, Pitch & Strategy, Board Ready, Challenges and Graduation open the day your balance is paid."
      />
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

      <ThisPhaseBlock
        programId={PROGRAMS.BM100}
        phaseId={currentPhaseId(PROGRAMS.BM100, true)}
        style={{ marginTop: 22 }}
      />

      <PhaseList locked={false} />
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

function DateTile({ mon, day, hot, muted }) {
  return (
    <View
      style={{
        width: 48,
        height: 52,
        borderRadius: 12,
        backgroundColor: hot ? G.cta : G.mutedFill,
        alignItems: 'center',
        justifyContent: 'center',
        opacity: muted ? 0.7 : 1,
      }}
    >
      <ILText role="eyebrow" color={hot ? '#FFFFFF' : G.meta} style={[af, { fontSize: 9 }]}>
        {mon}
      </ILText>
      <ILText
        role="title"
        color={hot ? '#FFFFFF' : G.ink}
        style={{ fontFamily: IL_FONTS.display, fontSize: 18, lineHeight: 22 }}
      >
        {day}
      </ILText>
    </View>
  );
}

function LockTag() {
  return (
    <View style={{ flexDirection: 'row', alignItems: 'center' }}>
      <MaterialIcons name="lock-outline" size={14} color={G.meta} />
      <ILText role="label" color={G.meta} style={{ marginLeft: 4, fontSize: 12 }}>
        On enrollment
      </ILText>
    </View>
  );
}

function SessionsBody({ locked = false }) {
  const nav = useLepNav();
  return (
    <>
      <View style={{ marginTop: 22, flexDirection: 'row', alignItems: 'flex-end' }}>
        <View style={{ flex: 1, paddingRight: 8 }}>
          <ILText role="title" color={G.ink} style={{ fontFamily: IL_FONTS.display, fontSize: 22 }}>
            Coming up
          </ILText>
          <ILText role="bodySm" color={G.meta} style={{ marginTop: 4 }}>
            Weekly online · Phase 2 · Pitch & strategy
          </ILText>
        </View>
        {locked ? null : <LinkRow label="Add all to calendar" onPress={nav.goSchedule} />}
      </View>
      <WhiteCard style={{ marginTop: 12, borderRadius: 22, paddingHorizontal: 16 }}>
        {SESSIONS_UP.map((s, i) => {
          const hot = i === 0 && !locked;
          return (
            <View
              key={s.title}
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                paddingVertical: 14,
                borderTopWidth: i ? 1 : 0,
                borderTopColor: G.line,
              }}
            >
              <DateTile mon={s.mon} day={s.day} hot={hot} muted={locked} />
              <View style={{ flex: 1, marginLeft: 12, marginRight: 8 }}>
                <ILText role="label" color={G.ink}>
                  {s.title}
                </ILText>
                <ILText role="bodySm" color={G.meta} style={{ marginTop: 3, fontSize: 12, lineHeight: 17 }}>
                  {s.meta}
                </ILText>
              </View>
              {locked ? (
                <MaterialIcons name="lock-outline" size={18} color={G.meta} />
              ) : hot ? (
                <Pressable
                  onPress={nav.goCheckin}
                  style={{ backgroundColor: G.cta, borderRadius: 999, paddingHorizontal: 18, paddingVertical: 10 }}
                >
                  <ILText role="label" color="#FFFFFF" style={{ fontSize: 13 }}>
                    {s.cta}
                  </ILText>
                </Pressable>
              ) : (
                <Pressable onPress={nav.goSchedule} hitSlop={8}>
                  <ILText role="label" color={G.cta} style={{ fontSize: 13 }}>
                    {s.cta}
                  </ILText>
                </Pressable>
              )}
            </View>
          );
        })}
      </WhiteCard>

      {locked ? (
        <UnlockBm onEnroll={nav.goEnroll} />
      ) : (
        <>
          <ILText role="title" color={G.ink} style={{ marginTop: 26, fontFamily: IL_FONTS.display, fontSize: 22 }}>
            Done
          </ILText>
          <ILText role="bodySm" color={G.meta}>
            Recordings and your check-ins
          </ILText>
          <WhiteCard style={{ marginTop: 12, borderRadius: 22, paddingHorizontal: 16 }}>
            {SESSIONS_DONE.map((s, i) => (
              <View
                key={s.title}
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  paddingVertical: 14,
                  borderTopWidth: i ? 1 : 0,
                  borderTopColor: G.line,
                }}
              >
                <DateTile mon={s.mon} day={s.day} />
                <View style={{ flex: 1, marginLeft: 12, marginRight: 8 }}>
                  <ILText role="label" color={G.ink}>
                    {s.title}
                  </ILText>
                  <ILText role="bodySm" color={G.meta} style={{ marginTop: 3, fontSize: 12 }}>
                    {s.meta}
                  </ILText>
                </View>
                <ILText role="label" color={G.cta} style={{ fontSize: 13 }}>
                  Recording
                </ILText>
              </View>
            ))}
          </WhiteCard>
        </>
      )}
    </>
  );
}

function CohortBody({ locked = false }) {
  const nav = useLepNav();
  return (
    <>
      <View style={{ marginTop: 18, backgroundColor: G.dark, borderRadius: 28, padding: 20 }}>
        <ILText role="eyebrow" color={G.cta} style={[af, { fontSize: 10 }]}>
          {locked ? 'Your cohort · after enrollment' : 'Your cohort'}
        </ILText>
        <ILText
          role="display"
          color="#FFFFFF"
          style={{ marginTop: 10, fontFamily: IL_FONTS.display, fontSize: 26, lineHeight: 32 }}
        >
          100BM cohort · Oct 2026
        </ILText>
        <ILText role="body" color="rgba(255,255,255,0.72)" style={{ marginTop: 8, fontSize: 14, lineHeight: 20 }}>
          18 women working toward board seats · fully online
        </ILText>
        <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: 18 }}>
          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
            {FACES.map((src, i) => (
              <Image
                key={i}
                source={src}
                style={{
                  width: 32,
                  height: 32,
                  borderRadius: 16,
                  marginLeft: i ? -8 : 0,
                  borderWidth: 2,
                  borderColor: G.dark,
                }}
              />
            ))}
            <View
              style={{
                width: 32,
                height: 32,
                borderRadius: 16,
                marginLeft: -8,
                backgroundColor: G.pink,
                borderWidth: 2,
                borderColor: G.dark,
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <ILText role="label" color={G.cta} style={[af, { fontSize: 10 }]}>
                +14
              </ILText>
            </View>
          </View>
          <Pressable
            onPress={locked ? nav.goEnroll : nav.goEngage}
            style={{
              borderWidth: 1,
              borderColor: 'rgba(255,255,255,0.28)',
              borderRadius: 999,
              paddingHorizontal: 14,
              paddingVertical: 9,
              flexDirection: 'row',
              alignItems: 'center',
            }}
          >
            <ILText role="label" color="#FFFFFF" style={[af, { fontSize: 13, marginRight: 6 }]}>
              WA group
            </ILText>
            <MaterialIcons name={locked ? 'lock-outline' : 'forum'} size={15} color="#FFFFFF" />
          </Pressable>
        </View>
      </View>

      <ILText role="title" color={G.ink} style={{ marginTop: 22, fontFamily: IL_FONTS.display, fontSize: 22 }}>
        Your practice huddle
      </ILText>
      <ILText role="bodySm" color={G.meta} style={{ marginTop: 4 }}>
        Small group · drills together
      </ILText>
      <WhiteCard style={{ marginTop: 12, borderRadius: 22, padding: 18 }}>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
          <ILText role="eyebrow" color={G.cta} style={[af, { fontSize: 10 }]}>
            EVERY OTHER WEEK
          </ILText>
          <MaterialIcons name="lock-outline" size={16} color={G.meta} />
        </View>
        <ILText role="title" color={G.ink} style={{ marginTop: 8, fontFamily: IL_FONTS.display, fontSize: 22 }}>
          Practice huddle
        </ILText>
        <ILText role="bodySm" color={G.meta} style={{ marginTop: 6, fontSize: 13, lineHeight: 19 }}>
          Rehearse your ask and your SuperPower Statement with the same four women.
        </ILText>
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', marginTop: 12 }}>
          {HUDDLE.map((c) => (
            <View
              key={c}
              style={{
                marginRight: 8,
                marginBottom: 8,
                backgroundColor: G.mutedFill,
                borderRadius: 999,
                paddingHorizontal: 12,
                paddingVertical: 6,
              }}
            >
              <ILText role="label" color={G.ink} style={[af, { fontSize: 11 }]}>
                {c}
              </ILText>
            </View>
          ))}
        </View>
        {locked ? (
          <View style={{ marginTop: 8 }}>
            <LockTag />
          </View>
        ) : (
          <Pressable
            onPress={nav.goSchedule}
            style={{
              marginTop: 10,
              backgroundColor: G.dark,
              borderRadius: 999,
              paddingVertical: 14,
              flexDirection: 'row',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <ILText role="label" color="#FFFFFF">
              Add next huddle
            </ILText>
            <MaterialIcons name="event" size={16} color="#FFFFFF" style={{ marginLeft: 8 }} />
          </Pressable>
        )}
      </WhiteCard>

      <View style={{ marginTop: 22, flexDirection: 'row', alignItems: 'flex-end' }}>
        <View style={{ flex: 1 }}>
          <ILText role="title" color={G.ink} style={{ fontFamily: IL_FONTS.display, fontSize: 22 }}>
            This week in your cohort
          </ILText>
          <ILText role="bodySm" color={G.meta} style={{ marginTop: 4 }}>
            From your WA group
          </ILText>
        </View>
        {locked ? <LockTag /> : <LinkRow label="Open group" onPress={nav.goEngage} />}
      </View>
      <WhiteCard style={{ marginTop: 12, borderRadius: 22, paddingHorizontal: 16, opacity: locked ? 0.72 : 1 }}>
        {COHORT_WEEK.map((row, i) => (
          <View
            key={row.title}
            style={{
              paddingVertical: 14,
              flexDirection: 'row',
              alignItems: 'center',
              borderTopWidth: i ? 1 : 0,
              borderTopColor: G.line,
            }}
          >
            <View
              style={{
                width: 36,
                height: 36,
                borderRadius: 18,
                backgroundColor: G.pink,
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <MaterialIcons name={row.icon} size={18} color={G.cta} />
            </View>
            <View style={{ marginLeft: 12, flex: 1 }}>
              <ILText role="label" color={G.ink}>
                {row.title}
              </ILText>
              <ILText role="bodySm" color={G.meta} style={{ marginTop: 3, fontSize: 12 }}>
                {row.meta}
              </ILText>
            </View>
          </View>
        ))}
      </WhiteCard>

      <WhiteCard style={{ marginTop: 16, borderRadius: 22, padding: 16, flexDirection: 'row', alignItems: 'center' }}>
        <View
          style={{
            width: 44,
            height: 44,
            borderRadius: 22,
            backgroundColor: G.dark,
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <MaterialIcons name="support-agent" size={22} color="#FFFFFF" />
        </View>
        <View style={{ flex: 1, marginLeft: 12, marginRight: 8 }}>
          <ILText role="label" color={G.ink}>
            Your Program Manager
          </ILText>
          <ILText role="bodySm" color={G.meta} style={{ marginTop: 3, fontSize: 12, lineHeight: 17 }}>
            Attendance, schedule changes and anything about your seat
          </ILText>
        </View>
        <Pressable
          onPress={nav.goNotifications}
          style={{ borderWidth: 1, borderColor: G.line, borderRadius: 999, paddingHorizontal: 14, paddingVertical: 8 }}
        >
          <ILText role="label" color={G.ink} style={{ fontSize: 13 }}>
            Message
          </ILText>
        </Pressable>
      </WhiteCard>

      {locked ? <UnlockBm onEnroll={nav.goEnroll} /> : null}
    </>
  );
}

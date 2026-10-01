import React, { useState } from 'react';
import { Image, Pressable, ScrollView, View } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { MaterialIcons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { IL_FONTS } from '../../constants/ironLadyBrand';
import ILText from '../../components/il/ILText';
import { G, af } from '../../constants/guestTheme';
import { LIQUID_TAB_PAD } from '../../components/il/LiquidTabBar';
import { useGlassHeaderPad } from '../../components/il/GlassHeader';
import { useAuth } from '../../context/AuthContext';
import { useProgramNav } from '../../context/ProgramNavContext';
import { GuideFace, LepHeader, Page, PillRow, SectionHead, WhiteCard } from '../lep/LepBits';
import { useLepNav } from '../lep/useLepNav';
import { FACE, HERO } from '../lep/lepData';

/** 100BM Learn, per the portal flow: For you · Sessions · Practice · Events, gated until enrollment. */
const CHIPS = ['For you', 'Sessions', 'Practice', 'Events'];
const CITIES = ['Bengaluru', 'Pune', 'Mumbai', 'Delhi NCR', 'Hyderabad'];

const PHASES = [
  { code: 'Ob', title: 'Onboarding', sub: 'Core story & milestone table' },
  { code: 'P1', title: 'Phase 1 · Foundation', sub: 'Board-member image, brand video, resume' },
  { code: 'P2', title: 'Phase 2 · Pitch & strategy', sub: 'Pitching and influencing, mid-level politics' },
  { code: 'P3', title: 'Phase 3 · Board ready', sub: 'Strategic outlook, strategy review, mock interview' },
  { code: 'P4', title: 'Phase 4 · Challenges', sub: 'Walk to Board, LinkedIn video, Speak like a CEO' },
  { code: 'Gr', title: 'Graduation', sub: 'Your speech video' },
];

const DRILLS = [
  { n: '01', title: 'LinkedIn Optimization', sub: 'Rebuild your profile for board visibility', status: 'Completed' },
  {
    n: '02',
    title: 'SuperPower Statement',
    sub: 'Your one-line executive pitch — name your leadership superpower and core capabilities',
    status: 'Completed',
  },
  { n: '03', title: 'ERRC Grid', sub: 'Eliminate, Reduce, Raise, Create — map your leadership habits', status: 'Not started' },
  { n: '04', title: 'Imperfect Brand Video', status: 'Locked' },
  { n: '05', title: 'Mock Interview', status: 'Locked' },
  { n: '06', title: 'Walk to Board', status: 'Locked' },
];

const HUDDLES = [
  { title: 'LinkedIn Optimization for board visibility', mins: '16 mins', state: 'not yet started' },
  { title: 'SuperPower Statement drill', mins: '21 mins', state: 'completed' },
  { title: 'Walk to Board prep', mins: '12 mins', state: 'in progress' },
];

const MEETUP = {
  kicker: 'PUNE CHAPTER MEETUP · LIVE',
  when: 'Sat, 11 AM',
  title: 'Breaking the Glass Ceiling into CXO',
  place: 'JW Marriott, Senapati Bapat Rd, Pune',
  who: '+28 attending',
};

export default function BmLearnScreen() {
  const { profile } = useAuth();
  const { stage } = useProgramNav();
  const insets = useSafeAreaInsets();
  const headerPad = useGlassHeaderPad();
  const nav = useLepNav();
  const enrolled = stage === 'enrolled';
  const [chip, setChip] = useState('For you');

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
        <Head chip={chip} enrolled={enrolled} />
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginTop: 16 }}>
          <PillRow items={CHIPS} value={chip} onChange={setChip} />
        </ScrollView>

        {enrolled ? (
          chip === 'Sessions' ? (
            <SessionsEnrolled onStart={nav.goMyProgram} />
          ) : chip === 'Practice' ? (
            <PracticeEnrolled onStart={nav.goAssignment} />
          ) : chip === 'Events' ? (
            <EventsPane enrolled onCal={nav.goSchedule} onTicket={nav.goTicket} />
          ) : (
            <ForYouEnrolled onTicket={nav.goTicket} />
          )
        ) : chip === 'Sessions' ? (
          <SessionsRegistered onEnroll={nav.goEnroll} />
        ) : chip === 'Practice' ? (
          <PracticeRegistered onEnroll={nav.goEnroll} />
        ) : chip === 'Events' ? (
          <EventsPane enrolled={false} onEnroll={nav.goEnroll} onTicket={nav.goTicket} />
        ) : (
          <ForYouRegistered onEnroll={nav.goEnroll} onTicket={nav.goTicket} />
        )}
      </ScrollView>
    </Page>
  );
}

const HEAD = {
  registered: {
    'For you': {
      title: '100BM Learn',
      badge: '100BM REGISTERED',
      sub: 'Onboarding open as a preview · Phases 1–4 and practice huddles unlock on enrollment',
    },
    Sessions: {
      title: 'Sessions',
      badge: '1 FREE',
      sub: '4 phases plus Graduation, board-readiness built one module at a time. Onboarding is open to every registrant.',
    },
    Practice: {
      title: 'Practice',
      badge: '1 FREE',
      sub: '9 self-paced drills between sessions — LinkedIn, pitch, role play and more. One is open now.',
    },
    Events: {
      title: 'Events',
      badge: 'PUBLIC OPEN',
      sub: 'Chapter meetups are open to every member. Cohort rooms open once your seat is confirmed.',
    },
  },
  enrolled: {
    'For you': null,
    Sessions: {
      kicker: 'LIVE NOW',
      title: 'Sessions',
      sub: '4 phases plus Graduation, one board-readiness module each. Phase 2 is live now.',
    },
    Practice: {
      kicker: '3 OPEN TO YOU',
      title: 'Practice',
      sub: '9 self-paced drills, unlocked as your 6 sessions progress. 3 are open now.',
    },
    Events: {
      kicker: 'FULL ACCESS',
      title: 'Events',
      sub: 'Your weekly Q&A, confidential intensives, practice huddles and every chapter meetup near you.',
    },
  },
};

function Head({ chip, enrolled }) {
  const copy = HEAD[enrolled ? 'enrolled' : 'registered'][chip];
  if (!copy) return null;
  return (
    <View>
      {copy.kicker ? (
        <ILText role="eyebrow" color={G.cta} style={[af, { fontSize: 10, letterSpacing: 1.2, marginBottom: 8 }]}>
          {copy.kicker}
        </ILText>
      ) : null}
      <View style={{ flexDirection: 'row', alignItems: 'flex-end', justifyContent: 'space-between' }}>
        <ILText role="display" color={G.ink} style={{ fontFamily: IL_FONTS.display, fontSize: 32, lineHeight: 38 }}>
          {copy.title}
        </ILText>
        {copy.badge ? (
          <View style={{ backgroundColor: G.mutedFill, borderRadius: 999, paddingHorizontal: 10, paddingVertical: 5 }}>
            <ILText role="eyebrow" color={G.ink} style={[af, { fontSize: 9, letterSpacing: 0.8 }]}>
              {copy.badge}
            </ILText>
          </View>
        ) : null}
      </View>
      <ILText role="body" color={G.meta} style={{ marginTop: 8, fontSize: 14, lineHeight: 20 }}>
        {copy.sub}
      </ILText>
    </View>
  );
}

/* ---------- shared pieces ---------- */

function Pill({ label, tone = 'cta' }) {
  const bg = tone === 'cta' ? G.cta : tone === 'dark' ? 'rgba(0,0,0,0.45)' : G.pink;
  const fg = tone === 'soft' ? G.cta : '#FFFFFF';
  return (
    <View style={{ backgroundColor: bg, borderRadius: 999, paddingHorizontal: 10, paddingVertical: 5 }}>
      <ILText role="eyebrow" color={fg} style={[af, { fontSize: 9, letterSpacing: 0.7 }]}>
        {label}
      </ILText>
    </View>
  );
}

function VideoHero({ badge, corner, kicker, title, body, footLeft, footRight, onPress, height = 300 }) {
  return (
    <Pressable
      onPress={onPress}
      style={{ marginTop: 18, borderRadius: 26, overflow: 'hidden', backgroundColor: G.dark }}
    >
      <View style={{ height: 150 }}>
        <Image source={HERO} style={{ width: '100%', height: '100%', opacity: 0.55 }} resizeMode="cover" />
        <View style={{ position: 'absolute', left: 12, top: 12 }}>
          <Pill label={badge} />
        </View>
        {corner ? (
          <View style={{ position: 'absolute', right: 12, top: 12 }}>
            <Pill label={corner} tone="dark" />
          </View>
        ) : null}
        <View
          style={{
            position: 'absolute',
            left: '50%',
            top: '50%',
            marginLeft: -28,
            marginTop: -28,
            width: 56,
            height: 56,
            borderRadius: 28,
            backgroundColor: G.cta,
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <MaterialIcons name="play-arrow" size={30} color="#FFFFFF" />
        </View>
      </View>
      <View style={{ padding: 18, minHeight: height - 150 }}>
        {kicker ? (
          <ILText role="eyebrow" color={G.cta} style={[af, { fontSize: 10, marginBottom: 8 }]}>
            {kicker}
          </ILText>
        ) : null}
        <ILText role="title" color="#FFFFFF" style={{ fontFamily: IL_FONTS.display, fontSize: 22, lineHeight: 28 }}>
          {title}
        </ILText>
        {body ? (
          <ILText role="body" color="rgba(255,255,255,0.72)" style={{ marginTop: 8, fontSize: 13, lineHeight: 19 }}>
            {body}
          </ILText>
        ) : null}
        {footLeft || footRight ? (
          <View
            style={{
              marginTop: 14,
              paddingTop: 12,
              borderTopWidth: 1,
              borderTopColor: 'rgba(255,255,255,0.12)',
              flexDirection: 'row',
              justifyContent: 'space-between',
              alignItems: 'center',
            }}
          >
            <ILText role="bodySm" color="rgba(255,255,255,0.72)" style={{ fontSize: 12 }}>
              {footLeft}
            </ILText>
            <ILText role="label" color="#FFFFFF" style={{ fontSize: 13 }}>
              {footRight}
            </ILText>
          </View>
        ) : null}
      </View>
    </Pressable>
  );
}

function GateCard({ kicker, title, body, cta, onPress }) {
  return (
    <View style={{ marginTop: 22, backgroundColor: G.dark, borderRadius: 24, padding: 20 }}>
      <ILText role="eyebrow" color={G.cta} style={[af, { fontSize: 10 }]}>
        {kicker}
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
      <Pressable
        onPress={onPress}
        style={({ pressed }) => ({
          marginTop: 18,
          backgroundColor: G.cta,
          borderRadius: 999,
          paddingVertical: 14,
          paddingHorizontal: 18,
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'center',
          opacity: pressed ? 0.9 : 1,
        })}
      >
        <ILText role="label" color="#FFFFFF">
          {cta}
        </ILText>
        <MaterialIcons name="arrow-forward" size={16} color="#FFFFFF" style={{ marginLeft: 8 }} />
      </Pressable>
    </View>
  );
}

function WhyCard({ title, body, foot }) {
  return (
    <>
      <View style={{ marginTop: 26 }}>
        <SectionHead title={title} />
      </View>
      <WhiteCard style={{ marginTop: 12, borderRadius: 20, padding: 18, borderLeftWidth: 3, borderLeftColor: G.cta }}>
        <ILText role="body" color={G.ink} style={{ fontSize: 15, lineHeight: 22 }}>
          {body}
        </ILText>
        <ILText role="bodySm" color={G.meta} style={{ marginTop: 10, fontSize: 13 }}>
          {foot}
        </ILText>
      </WhiteCard>
    </>
  );
}

function LockedShelf({ title, accent, items, kicker }) {
  return (
    <>
      <View style={{ marginTop: 26 }}>
        <SectionHead title={title} accent={accent} />
      </View>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginTop: 12, marginHorizontal: -20 }}>
        <View style={{ flexDirection: 'row', paddingHorizontal: 20 }}>
          {items.map((item) => (
            <WhiteCard key={item.title} style={{ width: 220, marginRight: 12, borderRadius: 20, padding: 12 }}>
              <View
                style={{
                  height: 84,
                  borderRadius: 14,
                  backgroundColor: G.mutedFill,
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <MaterialIcons name="lock-outline" size={18} color={G.meta} />
                <ILText role="bodySm" color={G.meta} style={{ marginTop: 4, fontSize: 11 }}>
                  Cohort only
                </ILText>
              </View>
              <ILText role="eyebrow" color={G.meta} style={[af, { marginTop: 12, fontSize: 10 }]}>
                {kicker(item)}
              </ILText>
              <ILText role="label" color={G.ink} style={{ marginTop: 4, fontSize: 15 }}>
                {item.shelfTitle || item.title}
              </ILText>
              {item.sub ? (
                <ILText role="bodySm" color={G.meta} style={{ marginTop: 4, fontSize: 12, lineHeight: 17 }} numberOfLines={3}>
                  {item.sub}
                </ILText>
              ) : null}
            </WhiteCard>
          ))}
        </View>
      </ScrollView>
    </>
  );
}

function EventCard({ onTicket, dated }) {
  return (
    <WhiteCard style={{ marginTop: 12, borderRadius: 22, padding: 16 }} onPress={onTicket}>
      <View style={{ flexDirection: 'row' }}>
        {dated ? (
          <View
            style={{
              width: 56,
              height: 64,
              borderRadius: 14,
              backgroundColor: G.dark,
              alignItems: 'center',
              justifyContent: 'center',
              marginRight: 14,
            }}
          >
            <ILText role="eyebrow" color={G.cta} style={[af, { fontSize: 10 }]}>
              OCT
            </ILText>
            <ILText role="title" color="#FFFFFF" style={{ fontFamily: IL_FONTS.display, fontSize: 22, lineHeight: 26 }}>
              05
            </ILText>
            <ILText role="eyebrow" color="rgba(255,255,255,0.6)" style={[af, { fontSize: 9 }]}>
              SAT
            </ILText>
          </View>
        ) : null}
        <View style={{ flex: 1 }}>
          {!dated ? (
            <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
              <ILText role="eyebrow" color={G.cta} style={[af, { fontSize: 10 }]}>
                {MEETUP.kicker}
              </ILText>
              <ILText role="eyebrow" color={G.meta} style={[af, { fontSize: 10 }]}>
                {MEETUP.when}
              </ILText>
            </View>
          ) : null}
          <ILText
            role="title"
            color={G.ink}
            style={{ marginTop: dated ? 0 : 8, fontFamily: IL_FONTS.display, fontSize: 19, lineHeight: 25 }}
          >
            {dated ? 'Pune Chapter Meetup' : MEETUP.title}
          </ILText>
          <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 6 }}>
            <MaterialIcons name="place" size={14} color={dated ? G.cta : G.meta} />
            <ILText role="bodySm" color={G.meta} style={{ marginLeft: 4, fontSize: 12, flex: 1 }} numberOfLines={1}>
              {MEETUP.place}
            </ILText>
          </View>
          {dated ? (
            <ILText role="bodySm" color={G.meta} style={{ marginTop: 4, fontSize: 12 }} numberOfLines={1}>
              “{MEETUP.title}”
            </ILText>
          ) : null}
        </View>
      </View>
      <View style={{ marginTop: 14, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
          {[0, 1, 2].map((i) => (
            <Image
              key={i}
              source={FACE}
              style={{ width: 24, height: 24, borderRadius: 12, marginLeft: i ? -8 : 0, borderWidth: 2, borderColor: G.white }}
            />
          ))}
          <ILText role="bodySm" color={G.meta} style={{ marginLeft: 8, fontSize: 12 }}>
            {MEETUP.who}
          </ILText>
        </View>
        <View style={{ backgroundColor: G.cta, borderRadius: 999, paddingHorizontal: 16, paddingVertical: 8 }}>
          <ILText role="label" color="#FFFFFF" style={{ fontSize: 12 }}>
            RSVP
          </ILText>
        </View>
      </View>
    </WhiteCard>
  );
}

function WhisperCard({ label, quote, pick }) {
  return (
    <WhiteCard style={{ marginTop: 16, borderRadius: 22, padding: 16, borderLeftWidth: 3, borderLeftColor: G.cta }}>
      <View style={{ flexDirection: 'row', alignItems: 'center' }}>
        <ILText role="eyebrow" color={G.cta} style={[af, { fontSize: 10 }]}>
          IL GUIDE’S WHISPER
        </ILText>
        <View style={{ width: 6, height: 6, borderRadius: 3, backgroundColor: G.cta, marginLeft: 8 }} />
        <ILText role="eyebrow" color={G.meta} style={[af, { marginLeft: 6, fontSize: 10 }]}>
          {label}
        </ILText>
      </View>
      <View style={{ flexDirection: 'row', marginTop: 14 }}>
        <GuideFace size={44} />
        <ILText
          role="title"
          color={G.ink}
          style={{ flex: 1, marginLeft: 12, fontFamily: IL_FONTS.display, fontSize: 17, lineHeight: 23 }}
        >
          “{quote}”
        </ILText>
      </View>
      <View style={{ flexDirection: 'row', flexWrap: 'wrap', marginTop: 12 }}>
        {CITIES.map((city) => (
          <View
            key={city}
            style={{
              marginRight: 8,
              marginTop: 6,
              paddingHorizontal: 12,
              paddingVertical: 6,
              borderRadius: 999,
              backgroundColor: city === pick ? G.dark : G.mutedFill,
            }}
          >
            <ILText role="label" color={city === pick ? '#FFFFFF' : G.ink} style={{ fontSize: 12 }}>
              {city}
            </ILText>
          </View>
        ))}
      </View>
    </WhiteCard>
  );
}

function NextCard({ kicker, title, body, cta, onPress }) {
  return <GateCard kicker={kicker} title={title} body={body} cta={cta} onPress={onPress} />;
}

/* ---------- Registered ---------- */

function ForYouRegistered({ onEnroll, onTicket }) {
  return (
    <>
      <VideoHero
        badge="FEATURED MASTERCLASS"
        corner="28 mins · Live case"
        kicker="A FIRST LOOK AT ONBOARDING"
        title="Onboarding is free to preview. Phase 1–4 content opens the day you enroll."
        footLeft="Onboarding · 4 phases"
        footRight="Start watch →"
      />

      <View style={{ marginTop: 26 }}>
        <SectionHead title="Phases at a glance" accent="4 phases + Graduation" />
      </View>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginTop: 12, marginHorizontal: -20 }}>
        <View style={{ flexDirection: 'row', paddingHorizontal: 20 }}>
          {PHASES.slice(0, 5).map((p, i) => (
            <WhiteCard key={p.code} style={{ width: 230, marginRight: 12, borderRadius: 20, padding: 12 }}>
              <View style={{ height: 96, borderRadius: 14, overflow: 'hidden', backgroundColor: G.mutedFill }}>
                {i === 0 ? (
                  <Image source={HERO} style={{ width: '100%', height: '100%' }} resizeMode="cover" />
                ) : (
                  <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
                    <MaterialIcons name="lock-outline" size={18} color={G.meta} />
                  </View>
                )}
              </View>
              <ILText role="eyebrow" color={i === 0 ? G.cta : G.meta} style={[af, { marginTop: 12, fontSize: 10 }]}>
                {i === 0 ? 'ONBOARDING' : `PHASE ${i}`}
              </ILText>
              <ILText role="label" color={G.ink} style={{ marginTop: 4, fontSize: 15 }} numberOfLines={1}>
                {i === 0 ? p.sub : p.title.split(' · ')[1]}
              </ILText>
              {i === 0 ? (
                <View style={{ height: 4, borderRadius: 2, backgroundColor: G.mutedFill, marginTop: 10 }}>
                  <View style={{ width: '62%', height: 4, borderRadius: 2, backgroundColor: G.cta }} />
                </View>
              ) : null}
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginTop: 10 }}>
                <ILText role="bodySm" color={G.meta} style={{ fontSize: 12 }}>
                  {i === 0 ? 'Free preview' : 'Unlocks upon enrollment'}
                </ILText>
                {i === 0 ? (
                  <ILText role="label" color={G.cta} style={{ fontSize: 13 }}>
                    Watch →
                  </ILText>
                ) : null}
              </View>
            </WhiteCard>
          ))}
        </View>
      </ScrollView>

      <View style={{ marginTop: 26 }}>
        <SectionHead title="Practice, once you’re in" accent="View all" />
      </View>
      {[
        { title: 'LinkedIn Optimization for board visibility', meta: 'Practice session · Unlocks on enrollment', open: true },
        { title: 'SuperPower Statement drill', meta: 'Practice session · Enrolled only' },
        { title: 'Walk to Board prep', meta: 'Practice session · Enrolled only' },
      ].map((d) => (
        <WhiteCard
          key={d.title}
          style={{ marginTop: 10, borderRadius: 20, padding: 14, flexDirection: 'row', alignItems: 'center', opacity: d.open ? 1 : 0.75 }}
        >
          <View
            style={{
              width: 44,
              height: 44,
              borderRadius: 14,
              backgroundColor: d.open ? G.pink : G.mutedFill,
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <MaterialIcons name={d.open ? 'play-circle-outline' : 'lock-outline'} size={20} color={d.open ? G.cta : G.meta} />
          </View>
          <View style={{ flex: 1, marginLeft: 12 }}>
            <ILText role="label" color={G.ink} numberOfLines={1}>
              {d.title}
            </ILText>
            <ILText role="bodySm" color={d.open ? G.meta : G.cta} style={{ marginTop: 3, fontSize: 12 }}>
              {d.meta}
            </ILText>
          </View>
          <MaterialIcons name={d.open ? 'bookmark-border' : 'lock-outline'} size={16} color={G.meta} />
        </WhiteCard>
      ))}

      <View style={{ marginTop: 26 }}>
        <SectionHead title="Upcoming events near you" />
      </View>
      <EventCard onTicket={onTicket} />

      <WhisperCard
        label="This week"
        quote="You do not ask for a seat at the table. You command the room so they pull one up."
      />

      <GateCard
        kicker="EXCLUSIVE COHORT ACCESS"
        title="Unlock all 4 Phases & Practice Huddles"
        body="Join the next 100 Board Members cohort of senior women headed for board seats."
        cta="Complete enrollment to access full library"
        onPress={onEnroll}
      />
    </>
  );
}

function SessionsRegistered({ onEnroll }) {
  return (
    <>
      <VideoHero
        badge="FREE PREVIEW"
        corner="Weekly online"
        title="Onboarding · Core story & milestone table"
        body="How board-ready women carry a room, before they speak"
        height={280}
      />
      <LockedShelf
        title="Locked until enrollment"
        accent="4 phases"
        items={PHASES.slice(1, 5).map((p) => ({ ...p, shelfTitle: p.title.split(' · ')[1] }))}
        kicker={(p) => `PHASE ${p.code.slice(1)}`}
      />
      <WhyCard
        title="Why the cohort runs live"
        body="Each phase runs with your cohort — pre-work, weekly live Q&A and confidential intensives, then a post-work wrap-up. Not a recording you catch later."
        foot="Live online · weekly Q&A"
      />
      <GateCard
        kicker="ENROLLMENT PENDING"
        title="Open all 4 phases"
        body="~24 weeks online, one board-readiness phase at a time."
        cta="Complete enrollment"
        onPress={onEnroll}
      />
    </>
  );
}

function PracticeRegistered({ onEnroll }) {
  return (
    <>
      <VideoHero
        badge="FREE PREVIEW"
        corner="Self-paced"
        title={DRILLS[0].title}
        body={DRILLS[0].sub}
        height={260}
      />
      <LockedShelf
        title="Locked until enrollment"
        accent="8 more drills"
        items={DRILLS.slice(1)}
        kicker={(d) => `DRILL ${d.n}`}
      />
      <WhyCard
        title="Why practice comes after Session 1"
        body="Each drill builds on what your batch covers live. They unlock in step with your 6 monthly sessions, not all at once."
        foot="Self-paced · done between weekly Q&A"
      />
      <GateCard
        kicker="ENROLLMENT PENDING"
        title="Open all 9 practice drills"
        body="LinkedIn, pitch, role play and more, timed to your sessions."
        cta="Complete enrollment"
        onPress={onEnroll}
      />
    </>
  );
}

/* ---------- Enrolled ---------- */

function ForYouEnrolled({ onTicket }) {
  return (
    <>
      <VideoHero
        badge="THIS PHASE, LIVE NOW"
        corner="28 mins · Live case"
        kicker="★ TARGETED RECOMMENDATION"
        title="Phase 2 · Pitch & strategy, live now"
        body="Pitching and influencing, and mid-level politics — work through it before this week’s live Q&A."
        footLeft="● Due before this week’s Q&A"
        footRight="Start watch ›"
      />

      <View style={{ marginTop: 26 }}>
        <SectionHead title="Continue watching" accent="2 in progress" />
      </View>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginTop: 12, marginHorizontal: -20 }}>
        <View style={{ flexDirection: 'row', paddingHorizontal: 20 }}>
          {[
            { kicker: 'ONBOARDING', title: 'Core story & milestone table', pct: 65, left: '8m left' },
            { kicker: 'PHASE 1', title: 'Foundation', pct: 35, left: '14m left' },
          ].map((c) => (
            <WhiteCard key={c.title} style={{ width: 240, marginRight: 12, borderRadius: 20, padding: 12 }}>
              <View style={{ height: 118, borderRadius: 14, overflow: 'hidden', backgroundColor: G.dark }}>
                <Image source={HERO} style={{ width: '100%', height: '100%' }} resizeMode="cover" />
                <View style={{ position: 'absolute', right: 8, bottom: 10 }}>
                  <Pill label={c.left} tone="dark" />
                </View>
                <View style={{ position: 'absolute', left: 0, right: 0, bottom: 0, height: 4, backgroundColor: 'rgba(255,255,255,0.3)' }}>
                  <View style={{ width: `${c.pct}%`, height: 4, backgroundColor: G.cta }} />
                </View>
              </View>
              <ILText role="eyebrow" color={G.cta} style={[af, { marginTop: 12, fontSize: 10 }]}>
                {c.kicker}
              </ILText>
              <ILText role="title" color={G.ink} style={{ marginTop: 4, fontFamily: IL_FONTS.display, fontSize: 17, lineHeight: 22 }}>
                {c.title}
              </ILText>
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginTop: 10, paddingTop: 10, borderTopWidth: 1, borderTopColor: G.line }}>
                <ILText role="bodySm" color={G.meta} style={{ fontSize: 12 }}>
                  {c.pct}% completed
                </ILText>
                <ILText role="label" color={G.cta} style={{ fontSize: 13 }}>
                  Resume
                </ILText>
              </View>
            </WhiteCard>
          ))}
        </View>
      </ScrollView>

      <View style={{ marginTop: 26 }}>
        <SectionHead title="Practice huddles" accent="View all" />
      </View>
      {HUDDLES.map((h) => (
        <WhiteCard key={h.title} style={{ marginTop: 10, borderRadius: 20, padding: 12, flexDirection: 'row', alignItems: 'center' }}>
          <View style={{ width: 76, height: 76, borderRadius: 14, overflow: 'hidden', backgroundColor: G.dark }}>
            <Image source={HERO} style={{ width: '100%', height: '100%' }} resizeMode="cover" />
            <View
              style={{
                position: 'absolute',
                left: 24,
                top: 24,
                width: 28,
                height: 28,
                borderRadius: 14,
                backgroundColor: 'rgba(255,255,255,0.85)',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <MaterialIcons name="play-arrow" size={16} color={G.ink} />
            </View>
          </View>
          <View style={{ flex: 1, marginLeft: 12 }}>
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <Pill label="NEW" tone="soft" />
              <ILText role="bodySm" color={G.meta} style={{ marginLeft: 8, fontSize: 12 }}>
                {h.mins}
              </ILText>
            </View>
            <ILText role="label" color={G.ink} style={{ marginTop: 6, fontSize: 15 }} numberOfLines={1}>
              {h.title}
            </ILText>
            <ILText role="bodySm" color={G.meta} style={{ marginTop: 2, fontSize: 12 }}>
              Practice session · {h.state}
            </ILText>
          </View>
          <MaterialIcons name="bookmark-border" size={18} color={G.ink} />
        </WhiteCard>
      ))}

      <View style={{ marginTop: 26 }}>
        <ILText role="eyebrow" color={G.cta} style={[af, { fontSize: 10, marginBottom: 4 }]}>
          IN-PERSON & REGIONAL
        </ILText>
        <SectionHead title="Upcoming events near you" accent="Chapter Hub" />
      </View>
      <EventCard dated onTicket={onTicket} />

      <WhisperCard label="Executive Mentor" quote="Tell me your city and I’ll show you events near you." pick="Pune" />

      <ILText role="bodySm" color={G.meta} style={{ marginTop: 20, textAlign: 'center', fontSize: 12 }}>
        100 Board Members · Cohort of Oct 2026 · Batch B
      </ILText>
    </>
  );
}

function PhaseRow({ phase, state, action, onAction }) {
  const done = state === 'done';
  const live = state === 'live';
  return (
    <WhiteCard style={{ marginTop: 10, borderRadius: 18, padding: 14, flexDirection: 'row', alignItems: 'center' }}>
      <View
        style={{
          width: 44,
          height: 44,
          borderRadius: 12,
          backgroundColor: done ? G.dark : live ? G.pink : G.mutedFill,
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <ILText
          role="title"
          color={done ? '#FFFFFF' : live ? G.cta : G.meta}
          style={{ fontFamily: IL_FONTS.display, fontSize: 16, lineHeight: 20 }}
        >
          {phase.code}
        </ILText>
      </View>
      <View style={{ flex: 1, marginLeft: 12, marginRight: 8 }}>
        <ILText role="label" color={G.ink} numberOfLines={1}>
          {phase.title}
        </ILText>
        <ILText role="bodySm" color={G.meta} style={{ marginTop: 2, fontSize: 12 }} numberOfLines={2}>
          {live ? 'Weekly Q&A · pre-work due' : phase.sub}
        </ILText>
      </View>
      {done ? (
        <ILText role="eyebrow" color="#1F7A4D" style={[af, { fontSize: 10 }]}>
          ● DONE
        </ILText>
      ) : live ? (
        <Pressable onPress={onAction} style={{ backgroundColor: G.cta, borderRadius: 999, paddingHorizontal: 12, paddingVertical: 7 }}>
          <ILText role="label" color="#FFFFFF" style={{ fontSize: 12 }}>
            {action}
          </ILText>
        </Pressable>
      ) : (
        <ILText role="label" color={G.ink} style={{ fontSize: 12 }}>
          {action}
        </ILText>
      )}
    </WhiteCard>
  );
}

function Divider({ label, color = G.meta }) {
  return (
    <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 22 }}>
      <View style={{ flex: 1, height: 1, backgroundColor: G.line }} />
      <ILText role="eyebrow" color={color} style={[af, { marginHorizontal: 10, fontSize: 10 }]}>
        {label}
      </ILText>
      <View style={{ flex: 1, height: 1, backgroundColor: G.line }} />
    </View>
  );
}

function SessionsEnrolled({ onStart }) {
  return (
    <>
      <WhiteCard style={{ marginTop: 18, borderRadius: 22, padding: 18 }}>
        <ILText role="eyebrow" color={G.cta} style={[af, { fontSize: 10 }]}>
          YOUR PROGRESS
        </ILText>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-end', marginTop: 8 }}>
          <ILText role="title" color={G.ink} style={{ fontFamily: IL_FONTS.display, fontSize: 20, lineHeight: 26 }}>
            1 of 4 complete
          </ILText>
          <ILText role="title" color={G.ink} style={{ fontFamily: IL_FONTS.display, fontSize: 26, lineHeight: 30 }}>
            25%
          </ILText>
        </View>
        <View style={{ height: 4, borderRadius: 2, backgroundColor: G.mutedFill, marginTop: 12 }}>
          <View style={{ width: '25%', height: 4, borderRadius: 2, backgroundColor: G.cta }} />
        </View>
        <ILText role="bodySm" color={G.meta} style={{ marginTop: 10, fontSize: 12 }}>
          Onboarding & Phase 1 done · Phase 2 is live now
        </ILText>
      </WhiteCard>

      <Divider label="COMPLETED" color="#1F7A4D" />
      <PhaseRow phase={PHASES[0]} state="done" />
      <PhaseRow phase={PHASES[1]} state="done" />

      <Divider label="LIVE NOW" color={G.cta} />
      <PhaseRow phase={PHASES[2]} state="live" action="Start pre-work" onAction={onStart} />

      <Divider label="UPCOMING" />
      <PhaseRow phase={PHASES[3]} action="Opens next" />
      <PhaseRow phase={PHASES[4]} action="Opens later" />
      <PhaseRow phase={PHASES[5]} action="Opens later" />

      <NextCard
        kicker="NEXT FOR YOU"
        title="Phase 2 · Pitch & strategy pre-work"
        body="15 minutes. Finish before this week’s Q&A and you walk in ready to pitch."
        cta="Start pre-work"
        onPress={onStart}
      />
    </>
  );
}

const STATUS = ['Not started', 'In progress', 'Completed', 'Locked'];

function PracticeEnrolled({ onStart }) {
  const [status, setStatus] = useState('Not started');
  const more = DRILLS.filter((d) => d.status === status);

  return (
    <>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginTop: 14 }}>
        <View style={{ flexDirection: 'row' }}>
          {STATUS.map((s) => (
            <Pressable
              key={s}
              onPress={() => setStatus(s)}
              style={{
                marginRight: 8,
                paddingHorizontal: 14,
                paddingVertical: 8,
                borderRadius: 999,
                backgroundColor: s === status ? G.dark : G.white,
                borderWidth: 1,
                borderColor: s === status ? G.dark : G.line,
              }}
            >
              <ILText role="label" color={s === status ? '#FFFFFF' : G.ink} style={{ fontSize: 12 }}>
                {s}
              </ILText>
            </Pressable>
          ))}
        </View>
      </ScrollView>

      <View style={{ marginTop: 22 }}>
        <SectionHead title="Do before Session 3" accent="3 open" />
      </View>
      <VideoHero
        badge="DRILL 03"
        corner="Self-paced"
        title={DRILLS[2].title}
        body={DRILLS[2].sub}
        onPress={onStart}
        height={260}
      />

      <View style={{ marginTop: 26 }}>
        <SectionHead title="More practice" accent="See all 9" />
      </View>
      {more.length ? (
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginTop: 12, marginHorizontal: -20 }}>
          <View style={{ flexDirection: 'row', paddingHorizontal: 20 }}>
            {more.map((d) => (
              <WhiteCard key={d.n} style={{ width: 230, marginRight: 12, borderRadius: 20, overflow: 'hidden' }}>
                <View style={{ height: 100, backgroundColor: G.dark }}>
                  {d.status === 'Locked' ? (
                    <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: G.mutedFill }}>
                      <MaterialIcons name="lock-outline" size={18} color={G.meta} />
                    </View>
                  ) : (
                    <Image source={HERO} style={{ width: '100%', height: '100%' }} resizeMode="cover" />
                  )}
                  <View style={{ position: 'absolute', right: 8, bottom: 8 }}>
                    <Pill label={d.status} tone="dark" />
                  </View>
                </View>
                <View style={{ padding: 14 }}>
                  <ILText role="eyebrow" color={G.cta} style={[af, { fontSize: 10 }]}>
                    DRILL {d.n}
                  </ILText>
                  <ILText role="label" color={G.ink} style={{ marginTop: 4, fontSize: 15 }}>
                    {d.title}
                  </ILText>
                  <ILText role="bodySm" color={G.meta} style={{ marginTop: 4, fontSize: 12, lineHeight: 17 }} numberOfLines={3}>
                    {d.sub || 'Unlocks with Phases 3–4'}
                  </ILText>
                </View>
              </WhiteCard>
            ))}
          </View>
        </ScrollView>
      ) : (
        <ILText role="bodySm" color={G.meta} style={{ marginTop: 12, fontSize: 13 }}>
          No drills here yet.
        </ILText>
      )}

      <View
        style={{
          marginTop: 22,
          borderRadius: 20,
          borderWidth: 1.5,
          borderColor: G.cta,
          backgroundColor: G.white,
          padding: 18,
        }}
      >
        <ILText role="eyebrow" color={G.cta} style={[af, { fontSize: 10 }]}>
          HOUSE RULE
        </ILText>
        <ILText role="body" color={G.ink} style={{ marginTop: 8, fontSize: 14, lineHeight: 21 }}>
          Drills unlock a session at a time, so what you practice always matches what your batch just covered live.
        </ILText>
      </View>

      <NextCard
        kicker="BRING ONE TO SESSION 3"
        title="Finish the ERRC Grid before this week’s Q&A"
        body="You’ll compare grids with your cohort live. 15 minutes, self-paced."
        cta="Start ERRC Grid"
        onPress={onStart}
      />
    </>
  );
}

/* ---------- Events (both states) ---------- */

const COHORT_ROOMS = [
  { title: 'Weekly live Q&A', meta: 'Thu · 7:00 PM IST · with your cohort', icon: 'forum' },
  { title: 'Confidential intensive', meta: 'Phase 2 · cohort only', icon: 'shield' },
  { title: 'Practice huddle', meta: 'SuperPower Statement, Mock Interview, Walk to Board', icon: 'groups' },
];

function EventsPane({ enrolled, onEnroll, onCal, onTicket }) {
  return (
    <>
      <View style={{ marginTop: 22 }}>
        <SectionHead title="Your cohort rooms" accent={enrolled ? 'Open' : 'Locked'} />
      </View>
      {COHORT_ROOMS.map((r) => (
        <WhiteCard
          key={r.title}
          style={{ marginTop: 10, borderRadius: 18, padding: 14, flexDirection: 'row', alignItems: 'center', opacity: enrolled ? 1 : 0.75 }}
        >
          <View
            style={{
              width: 44,
              height: 44,
              borderRadius: 14,
              backgroundColor: enrolled ? G.pink : G.mutedFill,
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <MaterialIcons name={enrolled ? r.icon : 'lock-outline'} size={20} color={enrolled ? G.cta : G.meta} />
          </View>
          <View style={{ flex: 1, marginLeft: 12 }}>
            <ILText role="label" color={G.ink}>
              {r.title}
            </ILText>
            <ILText role="bodySm" color={enrolled ? G.meta : G.cta} style={{ marginTop: 2, fontSize: 12 }} numberOfLines={1}>
              {enrolled ? r.meta : 'Opens once your 100BM seat is confirmed'}
            </ILText>
          </View>
          {enrolled ? (
            <Pressable onPress={onCal} hitSlop={6}>
              <MaterialIcons name="event" size={18} color={G.ink} />
            </Pressable>
          ) : null}
        </WhiteCard>
      ))}

      <View style={{ marginTop: 26 }}>
        <SectionHead title="Near you · open to every member" />
      </View>
      <EventCard dated={enrolled} onTicket={onTicket} />
      <WhiteCard style={{ marginTop: 10, borderRadius: 20, padding: 16 }}>
        <ILText role="eyebrow" color={G.cta} style={[af, { fontSize: 10 }]}>
          IRON LADY LIVE
        </ILText>
        <ILText role="title" color={G.ink} style={{ marginTop: 6, fontFamily: IL_FONTS.display, fontSize: 19, lineHeight: 25 }}>
          Walk to the Board
        </ILText>
        <ILText role="bodySm" color={G.meta} style={{ marginTop: 4, fontSize: 13 }}>
          Board members on how they got the call — open to every member.
        </ILText>
      </WhiteCard>

      {enrolled ? null : (
        <GateCard
          kicker="ENROLLMENT PENDING"
          title="Open your cohort rooms"
          body="Weekly Q&A, confidential intensives and practice huddles with your 100BM cohort."
          cta="Complete enrollment"
          onPress={onEnroll}
        />
      )}
    </>
  );
}

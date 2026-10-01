import React, { useEffect, useState } from 'react';
import { Pressable, ScrollView, View } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { IL_BRAND } from '../../constants/ironLadyBrand';
import ILText from '../../components/il/ILText';
import { PROGRAM_FILTERS, useProgramNav } from '../../context/ProgramNavContext';
import { getProgramEntry } from '../../constants/programs';
import {
  DateBadge,
  ProgramPage,
  SoftCard,
} from '../program/ProgramKit';

const CHIPS = ['For you', 'Principles', 'Case studies', 'Practice drills', 'C-suite & podcasts'];

const LIBRARIES = {
  all: {
    showing: 'Showing all your programs',
    featuredKicker: 'Featured masterclass',
    featuredMeta: '28 mins · Live Case',
    featuredEyebrow: 'Targeted recommendation',
    featuredTitle: 'Picked for women in Technology in Bengaluru',
    featuredBody:
      'Overcoming the engineering-to-VP ceiling: How senior tech leaders calibrate strategic executive presence in…',
    continueCount: '2 in progress',
    continue: [
      {
        kicker: 'Principle 04',
        title: 'The Anatomy of Boardroom Voice & Cadence',
        progress: 0.65,
        meta: '65% completed',
        left: '8m left',
        action: 'Resume',
      },
      {
        kicker: 'Executive case',
        title: 'Unflinching Negotiation on Compensation',
        progress: 0.35,
        meta: '35% completed',
        left: '14m left',
        action: 'Resume',
      },
    ],
    fresh: [
      ['Architecting Sovereign Alliances', 'By IL Guide & Global Leadership', '16 mins'],
      ['The 4 Invisible Rules of Power', 'Finance mastery for non-finance leaders', '21 mins'],
      ['Decisive Responses to Executive Pushback', 'Scripted mental models for live rooms', '12 mins'],
    ],
  },
  '100bm': {
    showing: '100 Board Members',
    live: 'Live now · Phase 2 · Pitch & strategy',
    featuredKicker: 'This week’s must-watch · 100BM',
    featuredMeta: 'C-suite · Live session',
    featuredEyebrow: 'Curated with Rajesh',
    featuredTitle: 'Winning Ways for Women',
    featuredBody: 'Indra Nooyi · former CEO, PepsiCo. Watch this before Phase 2 tests your pitch.',
    continueCount: 'Phase 2 in progress',
    continue: [
      {
        kicker: 'Phase 2 · now',
        title: 'Pitch & strategy',
        progress: 0.4,
        meta: 'Pitching and influencing',
        left: 'Live',
        action: 'Resume',
      },
      {
        kicker: 'Practice drill',
        title: 'Imperfect Brand Video',
        progress: 0.2,
        meta: 'Bring your draft to the huddle',
        left: '15 min',
        action: 'Start',
      },
    ],
    fresh: [
      ['Brand creation video', 'Your Core Story, 2–3 minutes on camera', '12 mins'],
      ['Milestone Table practice', 'The milestones you present at Onboarding', '18 mins'],
      ['SuperPower Statement', 'Say it out loud, under 20 seconds', '8 mins'],
    ],
  },
  mbw: {
    showing: 'Master of Business Warfare',
    live: 'Q1 · Week 4 of 52 · C-Suite Story',
    featuredKicker: 'This week’s must-watch · MBW',
    featuredMeta: 'C-suite · Live session',
    featuredEyebrow: 'Curated with Rajesh',
    featuredTitle: 'Winning Ways for Women',
    featuredBody: 'Indra Nooyi · former CEO, PepsiCo. Notice how she opens — then write story 2.',
    continueCount: 'Week 4 in progress',
    continue: [
      {
        kicker: 'Wk1–12',
        title: '27 Principles video',
        progress: 0.7,
        meta: 'Submit 3 key learnings',
        left: '9m left',
        action: 'Resume',
      },
      {
        kicker: 'Wk4 · this week',
        title: 'C-Suite Story',
        progress: 0.33,
        meta: '1 of 3 stories shared',
        left: '10 min',
        action: 'Continue',
      },
    ],
    fresh: [
      ['ERRC — watch the video', '3 things you’ll change to maximise your time', '16 mins'],
      ['LinkedIn % connects', 'Share the connection increase in the group', '11 mins'],
      ['Your C-Suite Talk', 'Topic submitted · prep session 10 days before', '14 mins'],
    ],
  },
  lep: {
    showing: 'Leadership Essentials program',
    live: 'Phase 4 of 11 · Day 2',
    featuredKicker: 'Featured masterclass',
    featuredMeta: '28 mins · Live Case',
    featuredEyebrow: 'Continue LEP',
    featuredTitle: 'The Shameless Speech',
    featuredBody: 'Pre-program video. Finish it before Day 1.',
    continueCount: '1 in progress',
    continue: [
      {
        kicker: 'Principle 03',
        title: 'The 27 Principles',
        progress: 0.45,
        meta: 'Daily revision · 2 min',
        left: '12m left',
        action: 'Resume',
      },
    ],
    fresh: [
      ['5 Daily Rituals', 'Morning check · LEP ritual', '6 mins'],
      ['CoDeSeF Sheet', 'Due this week', '10 mins'],
      ['Day 1 Assignment', 'Due Thursday', '18 mins'],
    ],
  },
};

const CITIES = ['Mumbai', 'Pune', 'Bengaluru', 'Delhi NCR', 'Hyderabad'];

function FilterRow({ value, onChange }) {
  return (
    <View
      style={{
        flexDirection: 'row',
        backgroundColor: '#EFEADF',
        borderRadius: 999,
        padding: 4,
        marginTop: 14,
      }}
    >
      {PROGRAM_FILTERS.map((item) => {
        const on = value === item.id;
        return (
          <Pressable
            key={item.id}
            onPress={() => onChange(item.id)}
            accessibilityRole="button"
            accessibilityState={{ selected: on }}
            style={{
              flex: 1,
              minHeight: 36,
              borderRadius: 999,
              alignItems: 'center',
              justifyContent: 'center',
              backgroundColor: on ? IL_BRAND.forest : 'transparent',
            }}
          >
            <ILText role="label" color={on ? '#FFFFFF' : IL_BRAND.muted} style={{ fontSize: 13 }}>
              {item.label}
            </ILText>
          </Pressable>
        );
      })}
    </View>
  );
}

function ContinueCard({ item, onPress }) {
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      style={{
        width: 230,
        backgroundColor: IL_BRAND.white,
        borderRadius: 18,
        marginRight: 12,
        overflow: 'hidden',
      }}
    >
      <View style={{ height: 120, backgroundColor: IL_BRAND.cardDark, justifyContent: 'flex-end' }}>
        <View
          style={{
            position: 'absolute',
            alignSelf: 'center',
            top: 36,
            width: 44,
            height: 44,
            borderRadius: 22,
            backgroundColor: 'rgba(255,255,255,0.92)',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <MaterialIcons name="play-arrow" size={26} color={IL_BRAND.ink} />
        </View>
        <View style={{ alignSelf: 'flex-end', margin: 8, backgroundColor: 'rgba(0,0,0,0.55)', borderRadius: 8, paddingHorizontal: 6, paddingVertical: 2 }}>
          <ILText role="bodySm" color="#FFFFFF" style={{ fontSize: 11 }}>
            {item.left}
          </ILText>
        </View>
        <View style={{ height: 4, backgroundColor: 'rgba(255,255,255,0.25)' }}>
          <View style={{ width: `${Math.round(item.progress * 100)}%`, height: 4, backgroundColor: IL_BRAND.red }} />
        </View>
      </View>
      <View style={{ padding: 12 }}>
        <ILText role="eyebrow" color={IL_BRAND.red} style={{ fontSize: 10 }}>
          {item.kicker}
        </ILText>
        <ILText role="label" style={{ marginTop: 4 }}>
          {item.title}
        </ILText>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginTop: 10 }}>
          <ILText role="bodySm" color={IL_BRAND.muted}>
            {item.meta}
          </ILText>
          <ILText role="label" color={IL_BRAND.red} style={{ fontSize: 13 }}>
            {item.action}
          </ILText>
        </View>
      </View>
    </Pressable>
  );
}

export default function LearnLibrary({ navigation }) {
  const { program, setProgram, stage } = useProgramNav();
  const [filter, setFilter] = useState(program === 'lep' || program === '100bm' || program === 'mbw' ? program : 'all');
  const [chip, setChip] = useState('For you');
  const [city, setCity] = useState('Pune');
  const library = LIBRARIES[filter] || LIBRARIES.all;
  const registered = (filter === '100bm' || filter === 'mbw') && stage === 'registered';

  useEffect(() => {
    if (program === '100bm' || program === 'mbw' || program === 'lep' || program === 'all') {
      setFilter(program);
    }
  }, [program]);

  const chooseFilter = (id) => {
    setFilter(id);
    setProgram(id);
  };

  const openProgram = () => {
    const id = filter === 'all' ? 'lep' : filter;
    const entry = getProgramEntry(id);
    navigation.navigate('ProgramTasks', {
      programId: id,
      title: entry?.title || 'Program',
    });
  };

  return (
    <ProgramPage>
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-end', marginTop: 8 }}>
        <ILText role="displaySm">Library</ILText>
        <ILText role="bodySm" color={IL_BRAND.muted} style={{ marginBottom: 4, flex: 1, textAlign: 'right', marginLeft: 12 }}>
          {library.showing}
        </ILText>
      </View>

      <FilterRow value={filter} onChange={chooseFilter} />

      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginTop: 14 }} contentContainerStyle={{ paddingRight: 8 }}>
        {CHIPS.map((item) => {
          const on = chip === item;
          return (
            <Pressable
              key={item}
              onPress={() => setChip(item)}
              accessibilityRole="button"
              accessibilityState={{ selected: on }}
              style={{
                marginRight: 8,
                borderRadius: 999,
                paddingHorizontal: 14,
                paddingVertical: 8,
                backgroundColor: on ? IL_BRAND.red : IL_BRAND.white,
              }}
            >
              <ILText role="label" color={on ? '#FFFFFF' : IL_BRAND.ink} style={{ fontSize: 13 }}>
                {item}
              </ILText>
            </Pressable>
          );
        })}
      </ScrollView>

      {library.live ? (
        <ILText role="bodySm" color={IL_BRAND.muted} style={{ marginTop: 12 }}>
          {library.live}
        </ILText>
      ) : null}

      <Pressable onPress={openProgram} accessibilityRole="button" style={{ marginTop: 12 }}>
        <View style={{ backgroundColor: IL_BRAND.cardDark, borderRadius: 22, padding: 16 }}>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', flex: 1, paddingRight: 8 }}>
              <View style={{ width: 6, height: 6, borderRadius: 3, backgroundColor: IL_BRAND.red, marginRight: 6 }} />
              <ILText role="eyebrow" color="#FFFFFF" style={{ fontSize: 10 }}>
                {library.featuredKicker}
              </ILText>
            </View>
            <ILText role="bodySm" color={IL_BRAND.mutedOnDark}>
              {library.featuredMeta}
            </ILText>
          </View>
          <View
            style={{
              marginTop: 16,
              width: 54,
              height: 54,
              borderRadius: 27,
              backgroundColor: IL_BRAND.red,
              alignItems: 'center',
              justifyContent: 'center',
              alignSelf: 'center',
            }}
          >
            <MaterialIcons name="play-arrow" size={32} color="#FFFFFF" />
          </View>
          <ILText role="eyebrow" color={IL_BRAND.redSoft} style={{ fontSize: 10, marginTop: 16 }}>
            {library.featuredEyebrow}
          </ILText>
          <ILText role="title" color="#FFFFFF" style={{ marginTop: 6 }}>
            {library.featuredTitle}
          </ILText>
          <ILText role="bodySm" color={IL_BRAND.mutedOnDark} style={{ marginTop: 6 }}>
            {library.featuredBody}
          </ILText>
          <View style={{ height: 1, backgroundColor: 'rgba(255,255,255,0.12)', marginTop: 14 }} />
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 12 }}>
            <ILText role="bodySm" color="#FFFFFF">
              High relevance to your B-HAG
            </ILText>
            <ILText role="label" color="#FFFFFF">
              Start watch
            </ILText>
          </View>
        </View>
      </Pressable>

      <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-end', marginTop: 22 }}>
        <ILText role="title">Continue watching</ILText>
        <ILText role="bodySm" color={IL_BRAND.muted}>
          {library.continueCount}
        </ILText>
      </View>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginTop: 12 }}>
        {library.continue.map((item) => (
          <ContinueCard key={item.title} item={item} onPress={openProgram} />
        ))}
      </ScrollView>

      <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-end', marginTop: 22 }}>
        <ILText role="title">Fresh this month</ILText>
        <Pressable onPress={openProgram} accessibilityRole="button">
          <ILText role="label" color={IL_BRAND.red} style={{ fontSize: 13 }}>
            View all
          </ILText>
        </Pressable>
      </View>
      {library.fresh.map(([title, by, mins], index) => (
        <Pressable key={title} onPress={openProgram} accessibilityRole="button">
          <SoftCard style={{ flexDirection: 'row', alignItems: 'center', opacity: registered && index > 0 ? 0.55 : 1 }}>
            <View
              style={{
                width: 64,
                height: 64,
                borderRadius: 14,
                backgroundColor: IL_BRAND.cardDark,
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <MaterialIcons name="play-arrow" size={28} color="#FFFFFF" />
            </View>
            <View style={{ flex: 1, marginLeft: 12 }}>
              <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                <View style={{ backgroundColor: '#FDECEC', borderRadius: 999, paddingHorizontal: 8, paddingVertical: 2 }}>
                  <ILText role="eyebrow" color={IL_BRAND.red} style={{ fontSize: 9 }}>
                    {registered && index > 0 ? 'Locked' : 'New'}
                  </ILText>
                </View>
                <ILText role="bodySm" color={IL_BRAND.muted} style={{ marginLeft: 8 }}>
                  {mins}
                </ILText>
              </View>
              <ILText role="label" style={{ marginTop: 4 }}>
                {title}
              </ILText>
              <ILText role="bodySm" color={IL_BRAND.muted}>
                {by}
              </ILText>
            </View>
            <MaterialIcons name={registered && index > 0 ? 'lock' : 'bookmark-border'} size={20} color={IL_BRAND.dim} />
          </SoftCard>
        </Pressable>
      ))}

      <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-end', marginTop: 22 }}>
        <View style={{ flex: 1, paddingRight: 12 }}>
          <ILText role="eyebrow" color={IL_BRAND.red} style={{ fontSize: 10 }}>
            In-person & regional
          </ILText>
          <ILText role="title">Upcoming events near you</ILText>
        </View>
        <ILText role="bodySm" color={IL_BRAND.muted}>
          Chapter Hub
        </ILText>
      </View>
      <SoftCard>
        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
          <DateBadge month="OCT" day="05" />
          <View style={{ flex: 1, marginLeft: 12 }}>
            <ILText role="bodySm" color={IL_BRAND.muted}>
              JW Marriott, Senapati Bapat Rd
            </ILText>
            <ILText role="label" style={{ marginTop: 2 }}>
              Pune Chapter Meetup
            </ILText>
            <ILText role="bodySm" color={IL_BRAND.muted}>
              Breaking the Glass Ceiling into CXO
            </ILText>
          </View>
        </View>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 12 }}>
          <ILText role="bodySm" color={IL_BRAND.muted}>
            +28 attending
          </ILText>
          <Pressable
            onPress={() => navigation.getParent()?.navigate('Engage')}
            accessibilityRole="button"
          >
            <ILText role="label" color={IL_BRAND.red}>
              RSVP
            </ILText>
          </Pressable>
        </View>
      </SoftCard>

      <SoftCard>
        <ILText role="eyebrow" color={IL_BRAND.red} style={{ fontSize: 10 }}>
          IL Guide’s Whisper · Executive Mentor
        </ILText>
        <ILText role="title" style={{ marginTop: 8 }}>
          Tell me your city and I’ll show you events near you.
        </ILText>
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', marginTop: 12 }}>
          {CITIES.map((item) => {
            const on = city === item;
            return (
              <Pressable
                key={item}
                onPress={() => setCity(item)}
                accessibilityRole="button"
                style={{
                  marginRight: 8,
                  marginBottom: 8,
                  borderRadius: 999,
                  paddingHorizontal: 12,
                  paddingVertical: 6,
                  backgroundColor: on ? IL_BRAND.forest : '#F3EFE8',
                }}
              >
                <ILText role="label" color={on ? '#FFFFFF' : IL_BRAND.ink} style={{ fontSize: 13 }}>
                  {item}
                </ILText>
              </Pressable>
            );
          })}
        </View>
      </SoftCard>

      {registered ? (
        <SoftCard>
          <ILText role="eyebrow" color={IL_BRAND.red} style={{ fontSize: 10 }}>
            Exclusive cohort access
          </ILText>
          <ILText role="title" style={{ marginTop: 6 }}>
            {filter === 'mbw' ? 'Unlock the MBW year' : 'Unlock all 4 phases & practice huddles'}
          </ILText>
          <ILText role="bodySm" color={IL_BRAND.muted} style={{ marginTop: 6 }}>
            The preview above is open. The rest of the library opens once the seat is paid.
          </ILText>
          <Pressable
            onPress={() =>
              navigation.getParent()?.navigate('Profile', {
                screen: 'PaymentEnrollment',
                params: { programId: filter },
              })
            }
            accessibilityRole="button"
            style={{
              marginTop: 14,
              backgroundColor: IL_BRAND.forest,
              borderRadius: 999,
              minHeight: 48,
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <ILText role="label" color="#FFFFFF">
              Complete enrollment to access full library
            </ILText>
          </Pressable>
        </SoftCard>
      ) : (
        <ILText role="bodySm" color={IL_BRAND.dim} style={{ marginTop: 16, textAlign: 'center' }}>
          Curated for Iron Lady cohorts · confidential leadership tracks
        </ILText>
      )}
    </ProgramPage>
  );
}

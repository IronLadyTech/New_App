import React, { useMemo, useState } from 'react';
import { Image, Linking, ScrollView, View } from 'react-native';
import Pressable from '../../components/il/Press';
import { StatusBar } from 'expo-status-bar';
import { MaterialIcons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { IL_FONTS } from '../../constants/ironLadyBrand';
import ILText from '../../components/il/ILText';
import { G, af } from '../../constants/guestTheme';
import { LIQUID_TAB_PAD } from '../../components/il/LiquidTabBar';
import { useAuth } from '../../context/AuthContext';
import { usePrograms } from '../../context/ProgramsContext';
import { PROGRAMS } from '../../constants/programs';
import { isLepEnrolled } from '../../utils/lepState';
import { CoverThumb, GuideFace, LepHeader, Page, PillRow, SectionHead, WhiteCard } from './LepBits';
import { useLepNav } from './useLepNav';
import {
  CASES_ENR,
  COVER,
  EVENT_ROOMS_ENR,
  FACE,
  LEARN_CASES_LOCKED,
  LEARN_CHIPS_ENR,
  LEARN_CHIPS_REG,
  LEARN_CITIES,
  LEARN_CITIES_ENR,
  LEARN_CONTINUE,
  LEARN_CONTINUE_ENR,
  LEARN_EVENTS_LOCKED,
  LEARN_FRESH,
  LEARN_FRESH_ENR,
  LEARN_WHISPER,
  LEARN_WHISPER_ENR,
  STORY_FEATURED_ENR,
  PRINCIPLES_COMMAND_ENR,
  PRINCIPLES_FOUND_ENR,
  PRINCIPLES_INFLUENCE_ENR,
  PRINCIPLES_LOCKED,
  PRINCIPLES_OPEN,
  STORIES_FUNC_ENR,
  PODCASTS,
} from './lepData';
import { useGlassHeaderPad } from '../../components/il/GlassHeader';
import ILGuideWhisperLep from '../../components/il/ILGuideWhisperLep';
import ILGuideWhisperExtras from '../../components/il/ILGuideWhisperExtras';
import { useArmyEventCalendar } from '../../hooks/useArmyEventCalendar';
import {
  armyEventCalendarUrl,
  armyEventModeLabel,
  nextRegionalChapterEvent,
} from '../../utils/armyEventCalendar';
import ArmyRegionalEventCard from '../../components/lep/ArmyRegionalEventCard';
import { learnerCityText } from '../../utils/programAccess';
import { IL_GUIDE_SURFACES } from '../../constants/ilGuide';
import { resolveLearnWhisper } from '../../utils/ilGuideProfilePrompts';
import {
  learnFeaturedHeadline,
  learnPickContinueRows,
  learnPickFeaturedCase,
  learnShelfForCase,
  LEARN_FRESH_SHELF,
  LEARN_CASE_INSPIRATION_CARD,
  LEARN_CASE_INSPIRATION_TASK_ID,
} from '../../utils/learnMediaShelves';
import { lepPrincipleWatch } from '../../constants/lepPrincipleWatch';

export default function LepLearnScreen() {
  const { profile } = useAuth();
  const insets = useSafeAreaInsets();
  const headerPad = useGlassHeaderPad();
  const nav = useLepNav();
  const enrolled = isLepEnrolled(profile);
  const chips = enrolled ? LEARN_CHIPS_ENR : LEARN_CHIPS_REG;
  const [chip, setChip] = useState('For you');

  return (
    <Page>
      <StatusBar style="dark" />
      <LepHeader floating photoUrl={profile?.photoURL} onNotifications={nav.goNotifications} onProfile={nav.goProfile} onCalendar={nav.goSchedule} />
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{
        paddingTop: headerPad + 4,
          paddingHorizontal: 20,
          paddingBottom: LIQUID_TAB_PAD + Math.max(insets.bottom, 8),
        }}
      >
        {enrolled ? (
          <>
            {chip !== 'For you' ? <EnrolledHead chip={chip} /> : null}
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginTop: chip === 'For you' ? 4 : 16 }}>
              <PillRow items={chips} value={chip} onChange={setChip} />
            </ScrollView>
            {chip === 'Principles' ? (
              <PrinciplesEnrolled
                onPrinciple={(n) => {
                  const w = lepPrincipleWatch(n);
                  if (!w) return;
                  if (w.practiceId === 'lep-shameless') {
                    nav.goPractice('lep', 'lep-shameless');
                    return;
                  }
                  nav.goPractice('lep', 'lep-principle', { principleN: n });
                }}
              />
            ) : chip === 'Case studies' ? (
              <CasesEnrolled
                onShareReflection={() => nav.goCourseTask('lep', LEARN_CASE_INSPIRATION_TASK_ID)}
              />
            ) : chip === 'Events' ? (
              <EventsEnrolled onCal={nav.goSchedule} onTriad={nav.goMyProgram} onTicket={nav.goEventDetail} />
            ) : chip === 'Community stories' ? (
              <StoriesEnrolled
                onHow={nav.goEngage}
                onSeeAll={() => nav.goEngageMediaList('podcast')}
                onWatch={nav.goWatch}
              />
            ) : (
              <EnrolledForYou onTicket={nav.goEventDetail} onWatch={nav.goWatch} />
            )}
          </>
        ) : (
          <>
            <RegisteredHead chip={chip} />
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginTop: 16 }}>
              <PillRow items={chips} value={chip} onChange={setChip} />
            </ScrollView>
            {chip === 'Principles' ? (
              <PrinciplesPane onEnroll={nav.goEnroll} onPractice={nav.goPractice} />
            ) : chip === 'Case studies' ? (
              <CasesPane onEnroll={nav.goEnroll} onWatch={nav.goWatch} />
            ) : chip === 'Events' ? (
              <EventsPane onEnroll={nav.goEnroll} onTicket={nav.goEventDetail} />
            ) : (
              <ForYouPane
                enrolled={false}
                onEnroll={nav.goEnroll}
                onTicket={nav.goEventDetail}
                onPractice={nav.goPractice}
                onWatch={nav.goWatch}
              />
            )}
          </>
        )}
      </ScrollView>
    </Page>
  );
}

const REG_HEAD = {
  'For you': {
    title: 'Learn Library',
    badge: 'LEP REGISTERED',
    sub: 'Preview principles and stories. Full library unlocks when enrollment completes.',
  },
  Principles: {
    title: 'The 27 Principles',
    badge: 'PREVIEW',
    sub: 'Start with the foundations open to registered learners. The full 27 unlock when your enrollment completes.',
  },
  'Case studies': {
    title: 'Case studies',
    badge: '1 FREE',
    sub: 'Real promotions, real negotiations, told by the women who ran them. One is open to every member.',
  },
  Events: {
    title: 'Events',
    badge: 'OPEN TO ALL',
    sub: 'Chapter meetups, open sessions and your cohort dates — all in one place.',
  },
};

function RegisteredHead({ chip }) {
  const copy = REG_HEAD[chip] || REG_HEAD['For you'];
  return (
    <>
      <View style={{ flexDirection: 'row', alignItems: 'flex-end', justifyContent: 'space-between' }}>
        <ILText
          role="display"
          color={G.ink}
          style={{ flexShrink: 1, fontFamily: IL_FONTS.display, fontSize: 32, lineHeight: 38 }}
        >
          {copy.title}
        </ILText>
        <View
          style={{
            marginLeft: 8,
            backgroundColor: G.mutedFill,
            borderRadius: 999,
            paddingHorizontal: 10,
            paddingVertical: 5,
          }}
        >
          <ILText role="eyebrow" color={G.ink} style={[af, { fontSize: 9, letterSpacing: 0.8 }]}>
            {copy.badge}
          </ILText>
        </View>
      </View>
      <ILText role="body" color={G.meta} style={{ marginTop: 8, fontSize: 14, lineHeight: 20 }}>
        {copy.sub}
      </ILText>
    </>
  );
}

function ForYouPane({ enrolled, onEnroll, onTicket, onPractice, onWatch }) {
  const { profile, user } = useAuth();
  const { upcoming, loading: calLoading } = useArmyEventCalendar();
  const regional = useMemo(
    () => nextRegionalChapterEvent(upcoming, { city: learnerCityText(profile) }),
    [upcoming, profile]
  );
  const learnWhisper = useMemo(
    () => resolveLearnWhisper(profile, user?.uid, LEARN_WHISPER),
    [profile, user?.uid]
  );
  const featured = useMemo(() => learnPickFeaturedCase(profile, CASES_ENR), [profile]);
  const headline = useMemo(() => learnFeaturedHeadline(profile), [profile]);
  const openWatch = (item) => {
    if (item.practiceId) onPractice?.('lep', item.practiceId);
    else if (item.assetKey) onWatch?.({ assetKey: item.assetKey, title: item.title, sub: item.who || item.meta });
  };

  return (
    <>
      <Pressable
        onPress={() =>
          featured
            ? onWatch?.({
                assetKey: featured.assetKey,
                title: featured.title,
                sub: featured.who,
              })
            : onEnroll?.()
        }
        style={{ marginTop: 18, borderRadius: 24, overflow: 'hidden', backgroundColor: G.dark }}
      >
        <View style={{ aspectRatio: 16 / 9 }}>
          <CoverThumb source={featured?.img || COVER.radhika} height="100%" play />
        </View>
      </Pressable>
      <ILText role="eyebrow" color={G.cta} style={[af, { marginTop: 12, fontSize: 10 }]}>
        {headline.toUpperCase()}
      </ILText>
      {featured ? (
        <ILText role="eyebrow" color={G.meta} style={[af, { marginTop: 6, fontSize: 9 }]}>
          {learnShelfForCase(featured)}
        </ILText>
      ) : null}
      <Pressable
        onPress={() =>
          featured
            ? onWatch?.({
                assetKey: featured.assetKey,
                title: featured.title,
                sub: featured.who,
              })
            : onEnroll?.()
        }
      >
        <ILText role="label" color={G.cta} style={{ marginTop: 6, fontSize: 13 }}>
          Start watch →
        </ILText>
      </Pressable>

      <View style={{ marginTop: 26 }}>
        <SectionHead title="Continue watching" accent={`${LEARN_CONTINUE.length} open`} />
      </View>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginTop: 12, marginHorizontal: -20 }}>
        <View style={{ flexDirection: 'row', alignItems: 'stretch', paddingHorizontal: 20 }}>
          {LEARN_CONTINUE.map((item) => (
            <ContinueCard
              key={item.title}
              item={item}
              onPress={() => (item.open ? openWatch(item) : onEnroll?.())}
            />
          ))}
        </View>
      </ScrollView>

      <View style={{ marginTop: 26 }}>
        <SectionHead title="Fresh this month" accent="View all" />
      </View>
      <WhiteCard style={{ marginTop: 12, borderRadius: 22, overflow: 'hidden' }}>
        {LEARN_FRESH.map((item, i) => (
          <Pressable
            key={item.title}
            onPress={() => (item.open ? openWatch(item) : onEnroll?.())}
            style={{
              paddingHorizontal: 14,
              paddingVertical: 14,
              flexDirection: 'row',
              alignItems: 'center',
              borderTopWidth: i ? 1 : 0,
              borderTopColor: G.line,
            }}
          >
            {item.img ? (
              <View style={{ width: 72, height: 40, borderRadius: 10, overflow: 'hidden', backgroundColor: G.dark }}>
                <CoverThumb source={item.img} />
              </View>
            ) : (
              <View
                style={{
                  width: 40,
                  height: 40,
                  borderRadius: 20,
                  backgroundColor: item.open ? G.pink : G.mutedFill,
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <MaterialIcons name={item.open ? 'play-arrow' : 'lock'} size={18} color={item.open ? G.cta : G.meta} />
              </View>
            )}
            <View style={{ flex: 1, marginLeft: 12 }}>
              <ILText role="label" color={G.ink} numberOfLines={1}>
                {item.title}
              </ILText>
              <ILText role="bodySm" color={item.open ? G.meta : G.cta} style={{ marginTop: 3, fontSize: 12 }}>
                {item.meta}
              </ILText>
            </View>
            <MaterialIcons name={item.open ? 'bookmark-border' : 'lock'} size={16} color={G.meta} />
          </Pressable>
        ))}
      </WhiteCard>

      <View style={{ marginTop: 26 }}>
        <SectionHead title="Upcoming events near you" />
      </View>
      {regional ? (
        <ArmyRegionalEventCard event={regional} onPress={() => onTicket?.(regional)} />
      ) : calLoading ? null : (
        <ILText role="bodySm" color={G.meta} style={{ marginTop: 12, fontSize: 13 }}>
          No chapter meetups scheduled near you yet — the Iron Lady calendar updates weekly.
        </ILText>
      )}

      <ILGuideWhisperLep
        surface={IL_GUIDE_SURFACES.LEARN}
        fallbackQuote={learnWhisper.quote}
        subtitle="This week"
      >
        <ILGuideWhisperExtras
          interactive={learnWhisper.interactive}
          mcq={learnWhisper.mcq}
          cityOptions={learnWhisper.interactive === 'city' ? LEARN_CITIES : []}
        />
      </ILGuideWhisperLep>

      {!enrolled ? <UnlockCard onEnroll={onEnroll} /> : null}
    </>
  );
}

function ContinueCard({ item, onPress }) {
  const showProgress = item.open && Number(item.pct) > 0;
  return (
    <WhiteCard
      onPress={onPress}
      style={{
        width: 240,
        marginRight: 12,
        borderRadius: 22,
        overflow: 'hidden',
        padding: 0,
        opacity: item.open ? 1 : 0.72,
      }}
    >
      <View style={{ width: '100%', height: 135, backgroundColor: G.dark }}>
        {item.img ? <CoverThumb source={item.img} height="100%" play={!item.open ? false : true} /> : null}
        {!item.open ? (
          <View
            style={{
              position: 'absolute',
              right: 10,
              top: 10,
              width: 28,
              height: 28,
              borderRadius: 14,
              backgroundColor: 'rgba(0,0,0,0.45)',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <MaterialIcons name="lock" size={14} color="#FFFFFF" />
          </View>
        ) : null}
      </View>
      <View style={{ padding: 14, minHeight: 128, justifyContent: 'space-between' }}>
        <View>
          <ILText role="eyebrow" color={G.cta} style={[af, { fontSize: 10 }]} numberOfLines={1}>
            {item.tag}
          </ILText>
          <ILText
            role="title"
            color={G.ink}
            numberOfLines={2}
            style={{
              marginTop: 6,
              fontFamily: IL_FONTS.display,
              fontSize: 17,
              lineHeight: 22,
              height: 44,
            }}
          >
            {item.title}
          </ILText>
        </View>
        {showProgress ? (
          <View>
            <View style={{ height: 4, backgroundColor: G.mutedFill, borderRadius: 2, overflow: 'hidden' }}>
              <View style={{ width: `${item.pct}%`, height: 4, backgroundColor: G.cta, borderRadius: 2 }} />
            </View>
            <View style={{ marginTop: 10, flexDirection: 'row', justifyContent: 'space-between' }}>
              <ILText role="bodySm" color={G.meta} style={{ fontSize: 12 }}>
                {item.pct}% completed
              </ILText>
              <ILText role="label" color={G.cta} style={{ fontSize: 12 }}>
                {item.cta}
              </ILText>
            </View>
          </View>
        ) : (
          <ILText role="label" color={item.open ? G.cta : G.meta} style={{ fontSize: 12 }}>
            {item.cta || (item.open ? 'Watch →' : 'Unlocks on enrollment')}
          </ILText>
        )}
      </View>
    </WhiteCard>
  );
}

function GateCard({ title, body, onPress }) {
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
      <Pressable
        onPress={onPress}
        style={({ pressed }) => ({
          marginTop: 18,
          alignSelf: 'flex-start',
          backgroundColor: G.cta,
          borderRadius: 999,
          paddingVertical: 12,
          paddingHorizontal: 20,
          flexDirection: 'row',
          alignItems: 'center',
          opacity: pressed ? 0.9 : 1,
        })}
      >
        <ILText role="label" color="#FFFFFF">
          Complete enrollment
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

function NumberRow({ item, locked, onPress }) {
  return (
    <WhiteCard
      onPress={onPress}
      style={{
        marginTop: 10,
        borderRadius: 18,
        padding: 14,
        flexDirection: 'row',
        alignItems: 'center',
        opacity: locked ? 0.72 : 1,
      }}
    >
      <View
        style={{
          width: 44,
          height: 44,
          borderRadius: 12,
          backgroundColor: locked ? G.mutedFill : G.pink,
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <ILText role="label" color={locked ? G.ink : G.cta} style={{ fontSize: 13 }}>
          {item.n}
        </ILText>
      </View>
      <View style={{ flex: 1, marginLeft: 12, marginRight: 8 }}>
        <ILText role="label" color={G.ink} numberOfLines={1} style={{ fontSize: 15 }}>
          {item.title}
        </ILText>
        <ILText role="bodySm" color={G.meta} style={{ marginTop: 2, fontSize: 13 }}>
          {item.min} · {item.track}
        </ILText>
      </View>
      {locked ? (
        <MaterialIcons name="lock-outline" size={16} color={G.meta} />
      ) : (
        <ILText role="label" color={G.cta} style={{ fontSize: 13 }}>
          {item.state}
        </ILText>
      )}
    </WhiteCard>
  );
}

function PrinciplesPane({ onEnroll, onPractice }) {
  return (
    <>
      <WhiteCard style={{ marginTop: 18, borderRadius: 22, padding: 18 }}>
        <ILText role="eyebrow" color={G.cta} style={[af, { fontSize: 10 }]}>
          FOUNDATION TRACK
        </ILText>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-end', marginTop: 8 }}>
          <ILText role="title" color={G.ink} style={{ fontFamily: IL_FONTS.display, fontSize: 20, lineHeight: 26 }}>
            0 principles absorbed
          </ILText>
          <ILText role="title" color={G.ink} style={{ fontFamily: IL_FONTS.display, fontSize: 24, lineHeight: 28 }}>
            0%
          </ILText>
        </View>
        <View style={{ marginTop: 12, height: 4, backgroundColor: G.mutedFill, borderRadius: 2 }}>
          <View style={{ width: '0%', height: 4, backgroundColor: G.cta, borderRadius: 2 }} />
        </View>
        <ILText role="bodySm" color={G.meta} style={{ marginTop: 10, fontSize: 13, lineHeight: 18 }}>
          Watch the open principles below. Progress counts as you complete them.
        </ILText>
      </WhiteCard>

      <View style={{ marginTop: 26 }}>
        <SectionHead title="Open to you" accent="Preview" />
      </View>
      {PRINCIPLES_OPEN.map((p) => (
        <NumberRow
          key={p.n}
          item={p}
          onPress={() => p.practiceId && onPractice?.('lep', p.practiceId)}
        />
      ))}

      <View style={{ marginTop: 26 }}>
        <SectionHead title="Locked until enrollment" accent="23 principles" />
      </View>
      {PRINCIPLES_LOCKED.map((p) => (
        <NumberRow key={p.n} item={p} locked />
      ))}
      <View
        style={{
          marginTop: 10,
          borderRadius: 18,
          borderWidth: 1,
          borderStyle: 'dashed',
          borderColor: G.line,
          paddingVertical: 14,
          paddingHorizontal: 16,
          flexDirection: 'row',
          alignItems: 'center',
        }}
      >
        <MaterialIcons name="more-horiz" size={18} color={G.meta} />
        <ILText role="label" color={G.ink} style={{ marginLeft: 10, fontSize: 14 }}>
          19 more principles across Influence & Command
        </ILText>
      </View>

      <GateCard
        title="Open all 27 Principles"
        body="Plus private cohort triads and the Thursday Circles."
        onPress={onEnroll}
      />
    </>
  );
}

function CasesPane({ onEnroll, onWatch }) {
  const featured = CASES_ENR.find((c) => c.featured);
  const locked = CASES_ENR.filter((c) => !c.featured).map((c) => ({
    tag: c.tag,
    title: c.title,
    meta: `${c.who} · cohort only`,
  }));
  return (
    <>
      <Pressable
        onPress={() =>
          featured &&
          onWatch?.({
            assetKey: featured.assetKey,
            title: featured.title,
            sub: `${featured.who} · Cybersecurity`,
          })
        }
        style={{ marginTop: 18, borderRadius: 24, overflow: 'hidden', backgroundColor: G.dark }}
      >
        <View style={{ aspectRatio: 16 / 9 }}>
          <CoverThumb source={COVER.priyanka} play time="31 mins" />
        </View>
      </Pressable>
      <View style={{ marginTop: 10, flexDirection: 'row', alignItems: 'center' }}>
        <View style={{ backgroundColor: G.cta, borderRadius: 999, paddingHorizontal: 10, paddingVertical: 5 }}>
          <ILText role="eyebrow" color="#FFFFFF" style={[af, { fontSize: 9 }]}>
            FREE PREVIEW
          </ILText>
        </View>
        <ILText role="bodySm" color={G.meta} style={{ marginLeft: 10, fontSize: 13 }}>
          Priyanka Sunder · Cybersecurity
        </ILText>
      </View>

      <View style={{ marginTop: 26 }}>
        <SectionHead title="Locked until enrollment" accent="8 case studies" />
      </View>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginTop: 12, marginHorizontal: -20 }}>
        <View style={{ flexDirection: 'row', paddingHorizontal: 20 }}>
          {locked.map((c) => (
            <WhiteCard key={c.title} style={{ width: 230, marginRight: 12, borderRadius: 20, padding: 12 }}>
              <View
                style={{
                  height: 92,
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
                {c.tag}
              </ILText>
              <ILText role="label" color={G.ink} style={{ marginTop: 4, fontSize: 15 }} numberOfLines={2}>
                {c.title}
              </ILText>
              <ILText role="bodySm" color={G.meta} style={{ marginTop: 6, fontSize: 12 }} numberOfLines={1}>
                {c.meta}
              </ILText>
            </WhiteCard>
          ))}
        </View>
      </ScrollView>

      <WhyCard
        title="Why cases stay inside the cohort"
        body="Every case names the company, the numbers and the conversation that turned it. The women who told them agreed to one room only — the cohort."
        foot="Confidential · not downloadable"
      />
      <GateCard
        title="Open all 8 case studies"
        body="Named companies, real numbers, the full transcript of each turn."
        onPress={onEnroll}
      />
    </>
  );
}

const EVENT_CITIES = ['All', 'Bengaluru', 'Mumbai', 'Pune', 'Delhi NCR', 'Hyderabad'];
const MON_SHORT = ['JAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUN', 'JUL', 'AUG', 'SEP', 'OCT', 'NOV', 'DEC'];

function cityMatches(eventCity, filterCity) {
  if (!filterCity || filterCity === 'All') return true;
  if (!eventCity) return filterCity === 'All';
  const a = String(eventCity).toLowerCase();
  const b = String(filterCity).toLowerCase().replace(/\s+ncr$/, '');
  if (a === b) return true;
  if (a.includes('delhi') && b.includes('delhi')) return true;
  if ((a.includes('bengaluru') || a.includes('bangalore')) && b.includes('bengaluru')) return true;
  return false;
}

function filterArmyEventsForCity(upcoming, city) {
  return (upcoming || []).filter((ev) => {
    // Online Army events are national — always listed; city chips filter offline only.
    if (ev.mode === 'online') return true;
    if (!city || city === 'All') return true;
    return cityMatches(ev.city, city);
  });
}

function openArmyEventCal(event) {
  const url = armyEventCalendarUrl(event);
  if (url) Linking.openURL(url).catch(() => {});
}

function ArmyEventRows({ events, onOpenEvent, emptyLabel = 'Upcoming Army events load from the Iron Lady calendar.' }) {
  if (!events.length) {
    return (
      <ILText role="bodySm" color={G.meta} style={{ marginTop: 12, fontSize: 13, lineHeight: 18 }}>
        {emptyLabel}
      </ILText>
    );
  }
  return events.map((e) => {
    const day = String(Number(e.dateIso.slice(8, 10)));
    const mon = MON_SHORT[Number(e.dateIso.slice(5, 7)) - 1];
    const hi = Boolean(e.highlight);
    return (
      <WhiteCard
        key={e.id}
        onPress={() => {
          if (onOpenEvent && e.mode === 'offline') onOpenEvent(e);
          else openArmyEventCal(e);
        }}
        style={{
          marginTop: 10,
          borderRadius: 18,
          padding: 14,
          flexDirection: 'row',
          alignItems: 'center',
          borderWidth: hi ? 1.5 : 0,
          borderColor: hi ? G.cta : 'transparent',
          backgroundColor: hi ? G.pink : G.white,
        }}
      >
        <View
          style={{
            width: 48,
            height: 52,
            borderRadius: 12,
            backgroundColor: hi ? G.cta : G.pink,
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <ILText role="eyebrow" color={hi ? '#FFFFFF' : G.cta} style={[af, { fontSize: 9 }]}>
            {hi ? '★' : mon}
          </ILText>
          <ILText
            role="title"
            color={hi ? '#FFFFFF' : G.ink}
            style={{ fontFamily: IL_FONTS.display, fontSize: 17, lineHeight: 20 }}
          >
            {day}
          </ILText>
        </View>
        <View style={{ flex: 1, marginLeft: 12, marginRight: 8 }}>
          {hi ? (
            <ILText role="eyebrow" color={G.cta} style={[af, { fontSize: 9, marginBottom: 2 }]}>
              SPOTLIGHT
            </ILText>
          ) : null}
          <ILText role="label" color={G.ink} numberOfLines={2} style={{ fontSize: 15 }}>
            {e.title}
          </ILText>
          <ILText role="bodySm" color={G.meta} style={{ marginTop: 2, fontSize: 13 }} numberOfLines={2}>
            {e.meta}
          </ILText>
        </View>
        <View
          style={{
            borderWidth: 1.5,
            borderColor: G.cta,
            borderRadius: 999,
            paddingHorizontal: 14,
            paddingVertical: 7,
          }}
        >
          <ILText role="label" color={G.cta} style={{ fontSize: 12 }}>
            RSVP
          </ILText>
        </View>
      </WhiteCard>
    );
  });
}

function EventsPane({ onEnroll, onTicket }) {
  const [city, setCity] = useState('All');
  const { upcoming } = useArmyEventCalendar();
  const openEvents = useMemo(() => filterArmyEventsForCity(upcoming, city).slice(0, 20), [upcoming, city]);

  return (
    <>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginTop: 12 }}>
        <View style={{ flexDirection: 'row' }}>
          {EVENT_CITIES.map((c) => (
            <Pressable
              key={c}
              onPress={() => setCity(c)}
              style={{
                marginRight: 8,
                paddingHorizontal: 14,
                paddingVertical: 8,
                borderRadius: 999,
                backgroundColor: c === city ? G.dark : G.white,
                borderWidth: 1,
                borderColor: c === city ? G.dark : G.line,
              }}
            >
              <ILText role="label" color={c === city ? '#FFFFFF' : G.ink} style={{ fontSize: 13 }}>
                {c}
              </ILText>
            </Pressable>
          ))}
        </View>
      </ScrollView>

      <View style={{ marginTop: 22 }}>
        <SectionHead title="Open to every member" accent={`${openEvents.length} upcoming`} />
      </View>
      <ArmyEventRows events={openEvents} onOpenEvent={onTicket} />

      <View style={{ marginTop: 26 }}>
        <SectionHead title="Cohort rooms" accent="After enrollment" />
      </View>
      {LEARN_EVENTS_LOCKED.map((e) => (
        <WhiteCard
          key={e.title}
          onPress={onTicket}
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
              width: 44,
              height: 44,
              borderRadius: 12,
              backgroundColor: G.pink,
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <MaterialIcons name={e.icon} size={18} color={G.cta} />
          </View>
          <View style={{ flex: 1, marginLeft: 12, marginRight: 8 }}>
            <ILText role="label" color={G.ink} style={{ fontSize: 15 }}>
              {e.title}
            </ILText>
            <ILText role="bodySm" color={G.meta} style={{ marginTop: 2, fontSize: 13 }}>
              {e.meta}
            </ILText>
          </View>
          <MaterialIcons name="chevron-right" size={18} color={G.meta} />
        </WhiteCard>
      ))}
    </>
  );
}

function UnlockCard({ onEnroll }) {
  return (
    <View style={{ marginTop: 20, backgroundColor: G.dark, borderRadius: 24, padding: 20 }}>
      <ILText role="eyebrow" color={G.cta} style={[af, { fontSize: 10 }]}>
        EXCLUSIVE COHORT ACCESS
      </ILText>
      <ILText
        role="display"
        color="#FFFFFF"
        style={{ marginTop: 10, fontFamily: IL_FONTS.display, fontSize: 26, lineHeight: 32 }}
      >
        Unlock all 27 Principles & Content Videos
      </ILText>
      <ILText role="body" color="rgba(255,255,255,0.72)" style={{ marginTop: 10, fontSize: 14, lineHeight: 20 }}>
        Join 500+ VP and Director women leaders in the upcoming executive cohort.
      </ILText>
      <Pressable
        onPress={onEnroll}
        style={{
          marginTop: 18,
          backgroundColor: G.cta,
          borderRadius: 999,
          paddingVertical: 14,
          paddingHorizontal: 18,
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <ILText role="label" color="#FFFFFF" style={{ flex: 1, textAlign: 'center' }}>
          Complete enrollment to access full library
        </ILText>
        <MaterialIcons name="arrow-forward" size={16} color="#FFFFFF" />
      </Pressable>
    </View>
  );
}

function EnrolledForYou({ onTicket, onWatch }) {
  const { profile, user } = useAuth();
  const { upcoming, loading: calLoading } = useArmyEventCalendar();
  const regional = useMemo(
    () => nextRegionalChapterEvent(upcoming, { city: learnerCityText(profile) }),
    [upcoming, profile]
  );
  const learnWhisper = useMemo(
    () => resolveLearnWhisper(profile, user?.uid, LEARN_WHISPER_ENR),
    [profile, user?.uid]
  );
  const featured = useMemo(() => learnPickFeaturedCase(profile, CASES_ENR), [profile]);
  const continueRows = useMemo(
    () => learnPickContinueRows(profile, CASES_ENR, LEARN_CONTINUE_ENR),
    [profile]
  );
  const headline = useMemo(() => learnFeaturedHeadline(profile), [profile]);
  const openWatch = (item) => {
    if (!item?.assetKey) return;
    onWatch?.({ assetKey: item.assetKey, title: item.title, sub: item.who || item.meta });
  };

  return (
    <>
      <Pressable
        onPress={() => featured && openWatch(featured)}
        style={{ marginTop: 18, borderRadius: 24, overflow: 'hidden', backgroundColor: G.dark }}
      >
        <View style={{ aspectRatio: 16 / 9 }}>
          <CoverThumb source={featured?.img || COVER.priyanka} height="100%" play />
        </View>
      </Pressable>
      <ILText role="eyebrow" color={G.cta} style={[af, { marginTop: 12, fontSize: 10 }]}>
        TARGETED RECOMMENDATION
      </ILText>
      <ILText
        role="title"
        color={G.ink}
        style={{ marginTop: 6, fontFamily: IL_FONTS.display, fontSize: 22, lineHeight: 28 }}
      >
        {headline}
      </ILText>
      <ILText role="bodySm" color={G.meta} style={{ marginTop: 4, fontSize: 13 }}>
        {featured?.who || 'Priyanka Sunder · Cybersecurity & Information Security'}
      </ILText>
      {featured ? (
        <ILText role="eyebrow" color={G.meta} style={[af, { marginTop: 8, fontSize: 9 }]}>
          {learnShelfForCase(featured)}
        </ILText>
      ) : null}

      <View style={{ marginTop: 26 }}>
        <SectionHead title="Continue watching" accent={`${continueRows.length} in progress`} />
      </View>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginTop: 12, marginHorizontal: -20 }}>
        <View style={{ flexDirection: 'row', paddingHorizontal: 20 }}>
          {continueRows.map((item) => (
            <Pressable key={item.title} onPress={() => openWatch(item)} style={{ marginRight: 12 }}>
              <WhiteCard style={{ width: 248, borderRadius: 22, overflow: 'hidden' }}>
                <View style={{ aspectRatio: 16 / 9, backgroundColor: G.dark }}>
                  <CoverThumb source={item.img} play time={item.left} />
                  <View style={{ position: 'absolute', left: 0, right: 0, bottom: 0, height: 3, backgroundColor: G.mutedFill }}>
                    <View style={{ width: `${item.pct}%`, height: 3, backgroundColor: G.cta }} />
                  </View>
                </View>
                <View style={{ padding: 14 }}>
                  <ILText role="eyebrow" color={G.cta} style={[af, { fontSize: 10 }]}>
                    {item.tag}
                  </ILText>
                  <ILText
                    role="title"
                    color={G.ink}
                    style={{ marginTop: 6, fontFamily: IL_FONTS.display, fontSize: 17, lineHeight: 22 }}
                  >
                    {item.title}
                  </ILText>
                  <View style={{ marginTop: 12, flexDirection: 'row', justifyContent: 'space-between' }}>
                    <ILText role="bodySm" color={G.meta} style={{ fontSize: 12 }}>
                      {item.pct}% completed
                    </ILText>
                    <ILText role="label" color={G.cta} style={{ fontSize: 12 }}>
                      {item.cta}
                    </ILText>
                  </View>
                </View>
              </WhiteCard>
            </Pressable>
          ))}
        </View>
      </ScrollView>

      <View style={{ marginTop: 26 }}>
        <SectionHead title="Fresh this month" accent="View all" />
      </View>
      <WhiteCard style={{ marginTop: 12, borderRadius: 22, overflow: 'hidden' }}>
        {LEARN_FRESH_ENR.map((item, i) => (
          <View
            key={item.title}
            style={{
              paddingHorizontal: 14,
              paddingVertical: 14,
              flexDirection: 'row',
              alignItems: 'center',
              borderTopWidth: i ? 1 : 0,
              borderTopColor: G.line,
            }}
          >
            <View style={{ width: 72, height: 40, borderRadius: 10, overflow: 'hidden', backgroundColor: G.dark }}>
              <CoverThumb source={item.img} />
            </View>
            <View style={{ flex: 1, marginLeft: 12 }}>
              <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                {item.neu ? (
                  <View style={{ backgroundColor: G.pink, borderRadius: 999, paddingHorizontal: 8, paddingVertical: 2, marginRight: 6 }}>
                    <ILText role="eyebrow" color={G.cta} style={[af, { fontSize: 8 }]}>
                      NEW
                    </ILText>
                  </View>
                ) : null}
                <ILText role="bodySm" color={G.meta} style={{ fontSize: 11 }}>
                  {item.time}
                </ILText>
              </View>
              <ILText role="label" color={G.ink} numberOfLines={1} style={{ marginTop: 4 }}>
                {item.title}
              </ILText>
              <ILText role="bodySm" color={G.meta} style={{ marginTop: 2, fontSize: 12 }} numberOfLines={1}>
                {item.meta}
              </ILText>
              {i === 0 ? (
                <ILText role="eyebrow" color={G.cta} style={[af, { marginTop: 4, fontSize: 8 }]}>
                  {LEARN_FRESH_SHELF}
                </ILText>
              ) : null}
            </View>
            <MaterialIcons name="bookmark-border" size={16} color={G.meta} />
          </View>
        ))}
      </WhiteCard>

      <View style={{ marginTop: 26, flexDirection: 'row', alignItems: 'flex-end' }}>
        <View style={{ flex: 1 }}>
          <ILText role="eyebrow" color={G.meta} style={[af, { fontSize: 10 }]}>
            IN-PERSON & REGIONAL
          </ILText>
          <ILText role="title" color={G.ink} style={{ fontFamily: IL_FONTS.display, fontSize: 22, marginTop: 4 }}>
            Upcoming events near you
          </ILText>
        </View>
        <ILText role="label" color={G.cta} style={{ fontSize: 12 }}>
          Chapter Hub
        </ILText>
      </View>
      {regional ? (
        <ArmyRegionalEventCard event={regional} onPress={() => onTicket?.(regional)} />
      ) : calLoading ? null : (
        <ILText role="bodySm" color={G.meta} style={{ marginTop: 12, fontSize: 13 }}>
          No chapter meetups scheduled near you yet.
        </ILText>
      )}

      <ILGuideWhisperLep
        surface={IL_GUIDE_SURFACES.LEARN}
        fallbackQuote={learnWhisper.quote}
        subtitle="Executive Mentor"
      >
        <ILGuideWhisperExtras
          interactive={learnWhisper.interactive}
          mcq={learnWhisper.mcq}
          cityOptions={learnWhisper.interactive === 'city' ? LEARN_CITIES_ENR : []}
        />
      </ILGuideWhisperLep>
      <ILText role="bodySm" color={G.meta} style={{ textAlign: 'center', marginTop: 18, fontSize: 12 }}>
        Curated for Iron Lady Cohorts · 100% confidential leadership tracks
      </ILText>
    </>
  );
}

function EnrolledHead({ chip }) {
  const copy = {
    Principles: {
      kicker: 'FULL ACCESS',
      title: 'The 27 Principles',
      sub: 'Three tracks, nine principles each. Foundation is behind you — Influence runs alongside Day 1.',
    },
    'Case studies': {
      kicker: '9 OPEN TO YOU',
      title: 'Case studies',
      sub: 'Named companies, real numbers, the conversation that turned it. Confidential to your cohort.',
    },
    Events: {
      kicker: 'FULL ACCESS',
      title: 'Events',
      sub: 'Your cohort dates, the Thursday Circle, and every chapter meetup near you.',
    },
    'Community stories': {
      kicker: 'FROM THE IRON LADY ARMY',
      title: 'Community stories',
      sub: 'Short, unpolished, told by women one or two steps ahead of where you are now.',
    },
  }[chip];
  if (!copy) return null;
  return (
    <View style={{ marginTop: 4 }}>
      <ILText role="eyebrow" color={G.cta} style={[af, { fontSize: 10, letterSpacing: 1.2 }]}>
        {copy.kicker}
      </ILText>
      <ILText
        role="display"
        color={G.ink}
        style={{ marginTop: 8, fontFamily: IL_FONTS.display, fontSize: 32, lineHeight: 38 }}
      >
        {copy.title}
      </ILText>
      <ILText role="body" color={G.meta} style={{ marginTop: 8, fontSize: 14, lineHeight: 20 }}>
        {copy.sub}
      </ILText>
    </View>
  );
}

function NextCard({ kicker, title, body, cta, onPress }) {
  return (
    <View style={{ marginTop: 20, backgroundColor: G.dark, borderRadius: 24, padding: 20 }}>
      <ILText role="eyebrow" color={G.cta} style={[af, { fontSize: 10 }]}>
        {kicker}
      </ILText>
      <ILText
        role="display"
        color="#FFFFFF"
        style={{ marginTop: 10, fontFamily: IL_FONTS.display, fontSize: 26, lineHeight: 32 }}
      >
        {title}
      </ILText>
      <ILText role="body" color="rgba(255,255,255,0.72)" style={{ marginTop: 10, fontSize: 14, lineHeight: 20 }}>
        {body}
      </ILText>
      <Pressable
        onPress={onPress}
        style={{
          marginTop: 18,
          backgroundColor: G.cta,
          borderRadius: 999,
          paddingVertical: 14,
          alignItems: 'center',
        }}
      >
        <ILText role="label" color="#FFFFFF">
          {cta}
        </ILText>
      </Pressable>
    </View>
  );
}

function PrinciplesEnrolled({ onPrinciple }) {
  const openPrinciple = (n) => {
    if (typeof onPrinciple === 'function') onPrinciple(Number(n));
  };

  return (
    <>
      <WhiteCard style={{ marginTop: 18, borderRadius: 22, padding: 16 }}>
        <ILText role="eyebrow" color={G.cta} style={[af, { fontSize: 10 }]}>
          YOUR PROGRESS
        </ILText>
        <View style={{ marginTop: 8, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-end' }}>
          <ILText role="title" color={G.ink} style={{ fontFamily: IL_FONTS.display, fontSize: 22 }}>
            9 of 27 complete
          </ILText>
          <ILText role="display" color={G.ink} style={{ fontFamily: IL_FONTS.display, fontSize: 26 }}>
            33%
          </ILText>
        </View>
        <View style={{ marginTop: 12, height: 4, backgroundColor: G.mutedFill, borderRadius: 2 }}>
          <View style={{ width: '33%', height: 4, backgroundColor: G.cta, borderRadius: 2 }} />
        </View>
        <ILText role="bodySm" color={G.meta} style={{ marginTop: 10, fontSize: 12 }}>
          Foundation closed on 12 Sep · Influence opens with Day 1
        </ILText>
      </WhiteCard>

      <ILText role="eyebrow" color={G.cta} style={[af, { marginTop: 22, fontSize: 10, textAlign: 'center' }]}>
        FOUNDATION · 01–09
      </ILText>
      {PRINCIPLES_FOUND_ENR.map((p) => (
        <WhiteCard
          key={p.n}
          onPress={() => openPrinciple(p.n)}
          style={{ marginTop: 10, borderRadius: 22, padding: 16, flexDirection: 'row', alignItems: 'center' }}
        >
          <View
            style={{
              width: 36,
              height: 36,
              borderRadius: 18,
              backgroundColor: G.dark,
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <ILText role="label" color="#FFFFFF" style={{ fontSize: 12 }}>
              {p.n}
            </ILText>
          </View>
          <View style={{ flex: 1, marginLeft: 12 }}>
            <ILText role="label" color={G.ink}>
              {p.title}
            </ILText>
            <ILText role="bodySm" color={G.meta} style={{ marginTop: 2, fontSize: 12 }}>
              {p.min}
            </ILText>
          </View>
          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
            <View style={{ width: 7, height: 7, borderRadius: 4, backgroundColor: '#1B7A4A', marginRight: 6 }} />
            <ILText role="eyebrow" color="#1B7A4A" style={[af, { fontSize: 9 }]}>
              {p.state}
            </ILText>
          </View>
        </WhiteCard>
      ))}
      <View
        style={{
          marginTop: 10,
          borderRadius: 18,
          backgroundColor: G.mutedFill,
          paddingVertical: 14,
          alignItems: 'center',
        }}
      >
        <ILText role="bodySm" color={G.meta} style={{ fontSize: 13 }}>
          5 more in Foundation · all complete
        </ILText>
      </View>

      <ILText role="eyebrow" color={G.cta} style={[af, { marginTop: 22, fontSize: 10, textAlign: 'center' }]}>
        INFLUENCE · 10–18
      </ILText>
      {PRINCIPLES_INFLUENCE_ENR.map((p) => (
        <WhiteCard
          key={p.n}
          onPress={() => openPrinciple(p.n)}
          style={{ marginTop: 10, borderRadius: 22, padding: 16, flexDirection: 'row', alignItems: 'center' }}
        >
          <View
            style={{
              width: 36,
              height: 36,
              borderRadius: 18,
              backgroundColor: p.hot ? G.pink : G.mutedFill,
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <ILText role="label" color={G.ink} style={{ fontSize: 12 }}>
              {p.n}
            </ILText>
          </View>
          <View style={{ flex: 1, marginLeft: 12 }}>
            <ILText role="label" color={G.ink} numberOfLines={1}>
              {p.title}
            </ILText>
            <ILText role="bodySm" color={G.meta} style={{ marginTop: 2, fontSize: 12 }}>
              {p.min}
            </ILText>
          </View>
          {p.hot ? (
            <View style={{ backgroundColor: G.cta, borderRadius: 999, paddingHorizontal: 12, paddingVertical: 8 }}>
              <ILText role="label" color="#FFFFFF" style={{ fontSize: 12 }}>
                {p.state}
              </ILText>
            </View>
          ) : (
            <ILText role="label" color={G.ink} style={{ fontSize: 12 }}>
              {p.state}
            </ILText>
          )}
        </WhiteCard>
      ))}

      <ILText role="eyebrow" color={G.cta} style={[af, { marginTop: 22, fontSize: 10, textAlign: 'center' }]}>
        COMMAND · 19–27
      </ILText>
      {PRINCIPLES_COMMAND_ENR.map((p) => (
        <WhiteCard key={p.n} style={{ marginTop: 10, borderRadius: 22, padding: 16, flexDirection: 'row', alignItems: 'center' }}>
          <View
            style={{
              width: 36,
              height: 36,
              borderRadius: 18,
              backgroundColor: G.mutedFill,
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <ILText role="label" color={G.ink} style={{ fontSize: 12 }}>
              {p.n}
            </ILText>
          </View>
          <View style={{ flex: 1, marginLeft: 12 }}>
            <ILText role="label" color={G.ink} numberOfLines={1}>
              {p.title}
            </ILText>
            <ILText role="bodySm" color={G.meta} style={{ marginTop: 2, fontSize: 12 }}>
              {p.min}
            </ILText>
          </View>
          <ILText role="bodySm" color={G.meta} style={{ fontSize: 12 }}>
            {p.state}
          </ILText>
        </WhiteCard>
      ))}

      <NextCard
        kicker="NEXT FOR YOU"
        title="Principle 10 · Negotiate from the seat you want"
        body="Watch the segment, then revise it out loud — same flow as Today’s practice on Home."
        cta="Resume principle 10 →"
        onPress={() => openPrinciple(10)}
      />
    </>
  );
}

function CasesEnrolled({ onShareReflection }) {
  const [fn, setFn] = useState('Technology');
  const { getTaskSubmission } = usePrograms();
  const inspirationSaved = getTaskSubmission(PROGRAMS.LEP, LEARN_CASE_INSPIRATION_TASK_ID);
  const list = CASES_ENR.filter((c) => c.fn === fn);
  const feat = list.find((c) => c.featured) || list[0];
  const more = list.filter((c) => c !== feat);
  return (
    <>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginTop: 16 }}>
        <View style={{ flexDirection: 'row' }}>
          {['Technology', 'Finance', 'Marketing', 'Founder'].map((item) => (
            <Pressable
              key={item}
              onPress={() => setFn(item)}
              style={{
                marginRight: 8,
                paddingHorizontal: 14,
                paddingVertical: 8,
                borderRadius: 999,
                backgroundColor: fn === item ? G.dark : G.white,
                borderWidth: 1,
                borderColor: fn === item ? G.dark : G.line,
              }}
            >
              <ILText role="label" color={fn === item ? '#FFFFFF' : G.ink} style={{ fontSize: 12 }}>
                {item}
              </ILText>
            </Pressable>
          ))}
        </View>
      </ScrollView>
      <View style={{ marginTop: 20, flexDirection: 'row', alignItems: 'flex-end' }}>
        <ILText role="title" color={G.ink} style={{ flex: 1, fontFamily: IL_FONTS.display, fontSize: 22 }}>
          Picked for {fn}
        </ILText>
        <ILText role="label" color={G.cta} style={{ fontSize: 12 }}>
          {list.length} cases
        </ILText>
      </View>
      {feat ? (
        <View style={{ marginTop: 12, borderRadius: 24, overflow: 'hidden', backgroundColor: G.dark }}>
          <View style={{ aspectRatio: 16 / 9 }}>
            <CoverThumb source={feat.img} play time={feat.time} />
          </View>
        </View>
      ) : null}
      {feat ? (
        <ILText role="bodySm" color={G.meta} style={{ marginTop: 10, fontSize: 13 }}>
          {feat.who} · {learnShelfForCase(feat)}
        </ILText>
      ) : null}
      <View style={{ marginTop: 22, flexDirection: 'row', alignItems: 'flex-end' }}>
        <ILText role="title" color={G.ink} style={{ flex: 1, fontFamily: IL_FONTS.display, fontSize: 22 }}>
          More in your track
        </ILText>
        <ILText role="label" color={G.cta} style={{ fontSize: 12 }}>
          See all
        </ILText>
      </View>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginTop: 12, marginHorizontal: -20 }}>
        <View style={{ flexDirection: 'row', paddingHorizontal: 20 }}>
          {more.map((item) => (
            <WhiteCard key={item.title} style={{ width: 240, marginRight: 12, borderRadius: 20, overflow: 'hidden' }}>
              <View style={{ aspectRatio: 16 / 9 }}>
                <CoverThumb source={item.img} play time={item.time} />
              </View>
              <View style={{ padding: 12 }}>
                <ILText role="eyebrow" color={G.cta} style={[af, { fontSize: 9 }]}>
                  {learnShelfForCase(item)}
                </ILText>
                <ILText role="label" color={G.ink} style={{ marginTop: 6, fontSize: 13 }} numberOfLines={2}>
                  {item.who}
                </ILText>
              </View>
            </WhiteCard>
          ))}
        </View>
      </ScrollView>
      <WhiteCard style={{ marginTop: 16, borderRadius: 22, padding: 16, borderLeftWidth: 3, borderLeftColor: G.cta }}>
        <ILText role="eyebrow" color={G.cta} style={[af, { fontSize: 10 }]}>
          HOUSE RULE
        </ILText>
        <ILText role="body" color={G.body} style={{ marginTop: 8, fontSize: 14, lineHeight: 20 }}>
          Each of these names a company and a number. They stay inside the cohort — no downloads, no forwarding.
        </ILText>
      </WhiteCard>
      <NextCard
        kicker={LEARN_CASE_INSPIRATION_CARD.kicker}
        title={LEARN_CASE_INSPIRATION_CARD.title}
        body={LEARN_CASE_INSPIRATION_CARD.body}
        cta={inspirationSaved?.textValue ? 'Update my check-in →' : LEARN_CASE_INSPIRATION_CARD.cta}
        onPress={onShareReflection}
      />
    </>
  );
}

function EventsEnrolled({ onCal, onTriad, onTicket }) {
  const [city, setCity] = useState('All');
  const { upcoming, featured, highlights } = useArmyEventCalendar();
  const armyEvents = useMemo(() => filterArmyEventsForCity(upcoming, city).slice(0, 20), [upcoming, city]);
  const spotlight = highlights.slice(0, 2);

  return (
    <>
      {featured ? (
        <View style={{ marginTop: 18, backgroundColor: G.dark, borderRadius: 28, padding: 18 }}>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
            <View
              style={{
                backgroundColor: G.cta,
                borderRadius: 999,
                paddingHorizontal: 10,
                paddingVertical: 5,
                flexDirection: 'row',
                alignItems: 'center',
              }}
            >
              <View style={{ width: 6, height: 6, borderRadius: 3, backgroundColor: '#FFFFFF', marginRight: 6 }} />
              <ILText role="eyebrow" color="#FFFFFF" style={[af, { fontSize: 9 }]} numberOfLines={1}>
                {featured.eyebrow}
              </ILText>
            </View>
            {armyEventModeLabel(featured) ? (
              <ILText role="bodySm" color="rgba(255,255,255,0.65)" style={{ fontSize: 12 }}>
                {armyEventModeLabel(featured)}
              </ILText>
            ) : null}
          </View>
          <ILText
            role="display"
            color="#FFFFFF"
            style={{ marginTop: 16, fontFamily: IL_FONTS.display, fontSize: 26, lineHeight: 32 }}
          >
            {featured.title}
          </ILText>
          <ILText role="body" color="rgba(255,255,255,0.72)" style={{ marginTop: 8, fontSize: 14 }}>
            {featured.whenLabel}
          </ILText>
          <Pressable
            onPress={() => openArmyEventCal(featured)}
            style={{
              marginTop: 16,
              backgroundColor: G.cta,
              borderRadius: 999,
              paddingVertical: 14,
              alignItems: 'center',
            }}
          >
            <ILText role="label" color="#FFFFFF">
              Add to calendar
            </ILText>
          </Pressable>
          <Pressable onPress={onCal} style={{ marginTop: 10, alignItems: 'center' }}>
            <ILText role="label" color="rgba(255,255,255,0.75)" style={{ fontSize: 12 }}>
              Open batch schedule →
            </ILText>
          </Pressable>
        </View>
      ) : null}

      {spotlight.map((ev) => (
        <WhiteCard
          key={ev.id}
          style={{
            marginTop: 12,
            borderRadius: 22,
            padding: 16,
            borderWidth: 1.5,
            borderColor: G.cta,
            backgroundColor: G.pink,
          }}
          onPress={() => openArmyEventCal(ev)}
        >
          <ILText role="eyebrow" color={G.cta} style={[af, { fontSize: 10 }]}>
            SPOTLIGHT
          </ILText>
          <ILText
            role="title"
            color={G.ink}
            style={{ marginTop: 8, fontFamily: IL_FONTS.display, fontSize: 20, lineHeight: 26 }}
          >
            {ev.title}
          </ILText>
          <ILText role="bodySm" color={G.meta} style={{ marginTop: 6, fontSize: 13 }}>
            {ev.whenLabel}
          </ILText>
        </WhiteCard>
      ))}

      <View style={{ marginTop: 24, flexDirection: 'row', alignItems: 'flex-end' }}>
        <ILText role="title" color={G.ink} style={{ flex: 1, fontFamily: IL_FONTS.display, fontSize: 22 }}>
          Your cohort rooms
        </ILText>
        <ILText role="label" color={G.cta} style={{ fontSize: 12 }}>
          Weekly
        </ILText>
      </View>
      {EVENT_ROOMS_ENR.map((item) => (
        <WhiteCard
          key={`${item.day}${item.title}`}
          style={{ marginTop: 10, borderRadius: 22, padding: 14, flexDirection: 'row', alignItems: 'center' }}
          onPress={onTicket}
        >
          <View
            style={{
              width: 52,
              borderRadius: 14,
              backgroundColor: G.mutedFill,
              alignItems: 'center',
              paddingVertical: 8,
            }}
          >
            <ILText role="eyebrow" color={G.cta} style={[af, { fontSize: 8 }]}>
              {item.dow}
            </ILText>
            <ILText role="title" color={G.ink} style={{ fontFamily: IL_FONTS.display, fontSize: 18, lineHeight: 22 }}>
              {item.day}
            </ILText>
          </View>
          <View style={{ flex: 1, marginLeft: 12 }}>
            <ILText role="label" color={G.ink}>
              {item.title}
            </ILText>
            <ILText role="bodySm" color={G.meta} style={{ marginTop: 3, fontSize: 12 }}>
              {item.meta}
            </ILText>
          </View>
          <View
            style={{
              backgroundColor: item.solid ? G.cta : G.white,
              borderWidth: 1,
              borderColor: G.cta,
              borderRadius: 999,
              paddingHorizontal: 12,
              paddingVertical: 8,
            }}
          >
            <ILText role="label" color={item.solid ? '#FFFFFF' : G.cta} style={{ fontSize: 12 }}>
              {item.cta}
            </ILText>
          </View>
        </WhiteCard>
      ))}

      <View style={{ marginTop: 24, flexDirection: 'row', alignItems: 'flex-end' }}>
        <ILText role="title" color={G.ink} style={{ flex: 1, fontFamily: IL_FONTS.display, fontSize: 22 }}>
          Army calendar
        </ILText>
        <ILText role="label" color={G.cta} style={{ fontSize: 12 }}>
          {armyEvents.length} upcoming
        </ILText>
      </View>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginTop: 12 }}>
        <View style={{ flexDirection: 'row' }}>
          {EVENT_CITIES.map((c) => (
            <Pressable
              key={c}
              onPress={() => setCity(c)}
              style={{
                marginRight: 8,
                paddingHorizontal: 14,
                paddingVertical: 8,
                borderRadius: 999,
                backgroundColor: c === city ? G.dark : G.white,
                borderWidth: 1,
                borderColor: c === city ? G.dark : G.line,
              }}
            >
              <ILText role="label" color={c === city ? '#FFFFFF' : G.ink} style={{ fontSize: 13 }}>
                {c}
              </ILText>
            </Pressable>
          ))}
        </View>
      </ScrollView>
      <ArmyEventRows events={armyEvents} onOpenEvent={onTicket} />

      <NextCard
        kicker="AFTER DAY 2"
        title="Your triad meets every Thursday for 12 weeks"
        body="Same three women, same hour. It is where the principles stop being theory."
        cta="See my triad →"
        onPress={onTriad}
      />
    </>
  );
}

/** The episode behind a story card — the same entry the Engage podcast list plays. */
function podcastWatch(story) {
  const ep = PODCASTS.find((p) => p.title === story.title);
  return ep ? { assetKey: ep.assetKey, title: ep.title, sub: ep.who } : null;
}

function StoriesEnrolled({ onHow, onSeeAll, onWatch }) {
  const play = (story) => {
    const watch = podcastWatch(story);
    if (watch) onWatch?.(watch);
    else onSeeAll?.();
  };
  return (
    <>
      <View style={{ marginTop: 20, flexDirection: 'row', alignItems: 'flex-end' }}>
        <ILText role="title" color={G.ink} style={{ flex: 1, fontFamily: IL_FONTS.display, fontSize: 22 }}>
          This week
        </ILText>
        <ILText role="label" color={G.cta} style={{ fontSize: 12 }}>
          New
        </ILText>
      </View>
      <Pressable
        onPress={() => play(STORY_FEATURED_ENR)}
        accessibilityRole="button"
        accessibilityLabel={`Play ${STORY_FEATURED_ENR.title}`}
      >
      <WhiteCard style={{ marginTop: 12, borderRadius: 24, overflow: 'hidden' }}>
        <View style={{ aspectRatio: 16 / 9, backgroundColor: G.dark }}>
          <CoverThumb source={STORY_FEATURED_ENR.img} play time={STORY_FEATURED_ENR.time} />
          <View
            style={{
              position: 'absolute',
              left: 14,
              top: 14,
              backgroundColor: '#1B7A4A',
              borderRadius: 999,
              paddingHorizontal: 10,
              paddingVertical: 5,
            }}
          >
            <ILText role="eyebrow" color="#FFFFFF" style={[af, { fontSize: 8 }]}>
              NEW THIS WEEK
            </ILText>
          </View>
        </View>
        <View style={{ padding: 16 }}>
          <ILText role="title" color={G.ink} style={{ fontFamily: IL_FONTS.display, fontSize: 22, lineHeight: 28 }}>
            {STORY_FEATURED_ENR.title}
          </ILText>
          <ILText role="bodySm" color={G.meta} style={{ marginTop: 6, fontSize: 13 }}>
            {STORY_FEATURED_ENR.who}
          </ILText>
        </View>
      </WhiteCard>
      </Pressable>

      <View style={{ marginTop: 22, flexDirection: 'row', alignItems: 'flex-end' }}>
        <ILText role="title" color={G.ink} style={{ flex: 1, fontFamily: IL_FONTS.display, fontSize: 22 }}>
          From women in Technology
        </ILText>
        <Pressable onPress={onSeeAll} accessibilityRole="button" accessibilityLabel="See all podcasts" hitSlop={10}>
          <ILText role="label" color={G.cta} style={{ fontSize: 12 }}>
            See all
          </ILText>
        </Pressable>
      </View>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginTop: 12, marginHorizontal: -20 }}>
        <View style={{ flexDirection: 'row', paddingHorizontal: 20 }}>
          {STORIES_FUNC_ENR.map((item) => (
            <Pressable
              key={item.title}
              onPress={() => play(item)}
              accessibilityRole="button"
              accessibilityLabel={`Play ${item.title}`}
            >
            <WhiteCard style={{ width: 200, marginRight: 12, borderRadius: 20, overflow: 'hidden' }}>
              <View style={{ aspectRatio: 16 / 9, backgroundColor: G.dark }}>
                <CoverThumb source={item.img} play time={item.time} />
              </View>
              <View style={{ padding: 12 }}>
                <ILText role="label" color={G.ink} style={{ fontSize: 13 }} numberOfLines={3}>
                  {item.title}
                </ILText>
                <ILText role="bodySm" color={G.meta} style={{ marginTop: 4, fontSize: 11 }}>
                  {item.who}
                </ILText>
              </View>
            </WhiteCard>
            </Pressable>
          ))}
        </View>
      </ScrollView>

      <View style={{ marginTop: 22, flexDirection: 'row', alignItems: 'flex-end' }}>
        <ILText role="title" color={G.ink} style={{ flex: 1, fontFamily: IL_FONTS.display, fontSize: 22 }}>
          From your own batch
        </ILText>
        <ILText role="label" color={G.cta} style={{ fontSize: 12 }}>
          Your cohort
        </ILText>
      </View>
      <WhiteCard style={{ marginTop: 12, borderRadius: 22, padding: 16, flexDirection: 'row', alignItems: 'center' }}>
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
                borderColor: G.white,
              }}
            />
          ))}
        </View>
        <View style={{ flex: 1, marginLeft: 12 }}>
          <ILText role="label" color={G.ink}>
            3 stories from your cohort
          </ILText>
          <ILText role="bodySm" color={G.meta} style={{ marginTop: 3, fontSize: 12 }}>
            Recorded in week one
          </ILText>
        </View>
        <ILText role="label" color={G.cta} style={{ fontSize: 12 }}>
          Watch
        </ILText>
      </WhiteCard>

      <NextCard
        kicker="YOUR TURN, EVENTUALLY"
        title="Every story here started as a bad week"
        body="Your cohort records theirs at the end of week four. Yours is already on the list."
        cta="See how it works →"
        onPress={onHow}
      />
    </>
  );
}

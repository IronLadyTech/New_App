import React, { useEffect, useMemo, useRef } from 'react';
import {
  Image,
  Linking,
  Platform,
  Pressable as RNPressable,
  ScrollView,
  StatusBar as RNStatusBar,
  View,
} from 'react-native';
import Pressable from '../../components/il/Press';
import { StatusBar } from 'expo-status-bar';
import { MaterialIcons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { IL_FONTS } from '../../constants/ironLadyBrand';
import ILText from '../../components/il/ILText';
import { G, af } from '../../constants/guestTheme';
import { LIQUID_TAB_PAD } from '../../components/il/LiquidTabBar';
import { useAuth } from '../../context/AuthContext';
import { isLepEnrolled } from '../../utils/lepState';
import { CoverThumb, LepHeader, LinkRow, Page, RedCta, SoftChip, WhiteCard } from './LepBits';
import { useLepNav } from './useLepNav';
import { CSUITE_HOME } from '../guest/guestData';
import { ARMY_STORIES, CIRCLE, CIRCLES_LOCKED, FACE, PODCASTS, PREWORK } from './lepData';
import { useGlassHeaderPad } from '../../components/il/GlassHeader';
import ILGuideWhisperLep from '../../components/il/ILGuideWhisperLep';
import { IL_GUIDE_SURFACES } from '../../constants/ilGuide';
import { LEP_COHORT_SOCIAL } from '../../constants/lepCohortCopy';
import { useLearnerCmsBatch } from '../../hooks/useLearnerCmsBatch';
import { useLepRitualsUnlocked } from '../../hooks/useLepRitualsUnlocked';
import { filterLepPrework } from '../../utils/lepRitualsUnlock';
import { useArmyEventCalendar } from '../../hooks/useArmyEventCalendar';
import { armyEventCalendarUrl } from '../../utils/armyEventCalendar';
import CmsEngageFeed from '../../components/lep/CmsEngageFeed';
import { useNavigation } from '@react-navigation/native';

const STORY_CARD_W = 220;
const STORY_THUMB_H = 124;
const STORY_TITLE_H = 36; // 2 lines @ 18

/** Rounded hero on cream page — avoids Android hairline flicker while scrolling. */
function EngageHeroShell({ children, style }) {
  return (
    <View style={{ alignSelf: 'stretch', backgroundColor: G.page, overflow: 'hidden' }}>
      <View
        style={{
          width: '100%',
          backgroundColor: G.dark,
          borderBottomLeftRadius: 24,
          borderBottomRightRadius: 24,
          overflow: 'hidden',
          ...style,
        }}
      >
        {children}
      </View>
    </View>
  );
}

function StoryVideoCard({ img, title, meta, time, onPress }) {
  return (
    <Pressable onPress={onPress} style={{ width: STORY_CARD_W, marginRight: 12 }}>
      <WhiteCard style={{ borderRadius: 18, overflow: 'hidden', height: STORY_THUMB_H + 12 + STORY_TITLE_H + 4 + 16 + 12 }}>
        <View style={{ height: STORY_THUMB_H, width: '100%', backgroundColor: G.dark }}>
          <CoverThumb source={img} height={STORY_THUMB_H} play time={time} />
        </View>
        <View style={{ paddingHorizontal: 12, paddingTop: 12, paddingBottom: 12 }}>
          <ILText
            role="label"
            color={G.ink}
            style={{ fontSize: 13, lineHeight: 18, height: STORY_TITLE_H }}
            numberOfLines={2}
          >
            {title}
          </ILText>
          <ILText role="bodySm" color={G.meta} style={{ marginTop: 4, fontSize: 11, height: 16 }} numberOfLines={1}>
            {meta}
          </ILText>
        </View>
      </WhiteCard>
    </Pressable>
  );
}

function CsuiteVideos({ nav }) {
  return (
    <>
      <View style={{ marginTop: 26, flexDirection: 'row', alignItems: 'flex-end' }}>
        <ILText role="title" color={G.ink} style={{ flex: 1, fontFamily: IL_FONTS.display, fontSize: 22 }}>
          C-suite conversations
        </ILText>
        <ILText role="bodySm" color={G.meta} style={{ fontSize: 12 }}>
          {CSUITE_HOME.length} videos
        </ILText>
      </View>
      <ILText role="bodySm" color={G.meta} style={{ marginTop: 4, fontSize: 12 }}>
        Learn from women at the top table
      </ILText>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        nestedScrollEnabled
        keyboardShouldPersistTaps="handled"
        style={{ marginTop: 12, marginHorizontal: -20 }}
      >
        <View style={{ flexDirection: 'row', alignItems: 'stretch', paddingHorizontal: 20 }}>
          {CSUITE_HOME.map((c) => (
            <StoryVideoCard
              key={c.title}
              img={c.img}
              title={c.title}
              meta={c.who}
              time={c.tag}
              onPress={() => nav.goWatch({ assetKey: c.assetKey, title: c.title, sub: c.who })}
            />
          ))}
        </View>
      </ScrollView>
    </>
  );
}

export default function LepEngageScreen() {
  const { profile } = useAuth();
  const insets = useSafeAreaInsets();
  const headerPad = useGlassHeaderPad();
  const nav = useLepNav();
  const enrolled = isLepEnrolled(profile);

  useEffect(() => {
    if (Platform.OS !== 'android') return undefined;
    RNStatusBar.setTranslucent(true);
    RNStatusBar.setBackgroundColor('transparent');
    RNStatusBar.setBarStyle('light-content');
    return undefined;
  }, []);

  return (
    <Page>
      <StatusBar style="light" translucent backgroundColor="transparent" />
      <LepHeader
        floating
        scrim={false}
        photoUrl={profile?.photoURL}
        onNotifications={nav.goNotifications}
        onProfile={nav.goProfile}
      />
      <ScrollView
        showsVerticalScrollIndicator={false}
        removeClippedSubviews={false}
        contentContainerStyle={{
          paddingTop: 0,
          paddingBottom: LIQUID_TAB_PAD + Math.max(insets.bottom, 8) + 8,
        }}
      >
        {enrolled ? (
          <EnrolledEngage nav={nav} topPad={headerPad} />
        ) : (
          <RegisteredEngage nav={nav} topPad={headerPad} />
        )}
      </ScrollView>
    </Page>
  );
}

function openArmyCalendar(event) {
  const url = armyEventCalendarUrl(event);
  if (url) Linking.openURL(url).catch(() => {});
}

function EnrolledEngage({ nav, topPad }) {
  const navigation = useNavigation();
  const { batch: cmsBatch } = useLearnerCmsBatch('lep');
  const { featured, nextOffline, highlights, loading: calendarLoading } = useArmyEventCalendar();
  const chapter = nextOffline;
  const spotlight = highlights.slice(0, 2);

  return (
    <>
      <EngageHeroShell
        style={{
          paddingTop: topPad + 28,
          paddingBottom: 22,
          paddingHorizontal: 20,
        }}
      >
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
          <SoftChip onDark icon="groups">
            Iron Lady Army
          </SoftChip>
          <SoftChip onDark>Member till Sep 2027</SoftChip>
        </View>
        <ILText
          role="display"
          color="#FFFFFF"
          style={{
            marginTop: 18,
            fontFamily: IL_FONTS.display,
            fontSize: 34,
            lineHeight: 40,
            letterSpacing: -0.7,
          }}
        >
          Your Iron Lady Army
        </ILText>
        <ILText role="body" color="rgba(255,255,255,0.72)" style={{ marginTop: 8, fontSize: 16, lineHeight: 22 }}>
          Live sessions, chapters, and the women building with you
        </ILText>
      </EngageHeroShell>

      <View style={{ paddingHorizontal: 20 }}>
      <CmsEngageFeed programId="lep" cmsBatch={cmsBatch} navigation={navigation} />
      {calendarLoading && !featured && spotlight.length === 0 ? (
        <View style={{ marginTop: 14, minHeight: 8 }} />
      ) : null}
      {featured ? (
        <WhiteCard
          style={{
            marginTop: 14,
            borderRadius: 22,
            padding: 18,
            borderWidth: featured.highlight ? 1.5 : 0,
            borderColor: featured.highlight ? G.cta : 'transparent',
            backgroundColor: featured.highlight ? G.pink : G.white,
          }}
        >
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', flex: 1, paddingRight: 8 }}>
              <View style={{ width: 7, height: 7, borderRadius: 4, backgroundColor: G.cta, marginRight: 8 }} />
              <ILText role="eyebrow" color={G.cta} style={[af, { fontSize: 10 }]} numberOfLines={1}>
                {featured.eyebrow}
              </ILText>
            </View>
            <ILText role="bodySm" color={G.meta} style={{ fontSize: 12 }} numberOfLines={1}>
              {featured.mode === 'offline' ? 'In person' : 'Live · Online'}
            </ILText>
          </View>
          <ILText
            role="title"
            color={G.ink}
            style={{ marginTop: 12, fontFamily: IL_FONTS.display, fontSize: 22, lineHeight: 28 }}
          >
            {featured.title}
          </ILText>
          <ILText role="bodySm" color={G.meta} style={{ marginTop: 8, fontSize: 13, lineHeight: 18 }}>
            {featured.whenLabel}
          </ILText>
          {featured.mode === 'online' && !featured.highlight ? (
            <View style={{ flexDirection: 'row', flexWrap: 'wrap', marginTop: 14 }}>
              {CIRCLE.map((c) => (
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
          ) : null}
          <View style={{ marginTop: 8 }}>
            <RedCta label="Add to calendar" icon="event" onPress={() => openArmyCalendar(featured)} />
          </View>
        </WhiteCard>
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
          onPress={() => openArmyCalendar(ev)}
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

      <WhiteCard style={{ marginTop: 12, borderRadius: 22, padding: 16 }} onPress={nav.goMyProgram}>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <View style={{ flex: 1 }}>
            <ILText role="label" color={G.ink}>
              {LEP_COHORT_SOCIAL.title}
            </ILText>
            <ILText role="bodySm" color={G.meta} style={{ marginTop: 4, fontSize: 12 }}>
              {LEP_COHORT_SOCIAL.sub}
            </ILText>
          </View>
          <ILText role="label" color={G.cta} style={{ fontSize: 12 }}>
            See batchmates ›
          </ILText>
        </View>
        <View style={{ marginTop: 14, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
            {[0, 1, 2, 3].map((i) => (
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
            <View
              style={{
                width: 28,
                height: 28,
                borderRadius: 14,
                marginLeft: -8,
                backgroundColor: G.dark,
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <ILText role="eyebrow" color="#FFFFFF" style={[af, { fontSize: 8 }]}>
                +37
              </ILText>
            </View>
          </View>
          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
            <View style={{ width: 7, height: 7, borderRadius: 4, backgroundColor: '#1B7A4A', marginRight: 6 }} />
            <ILText role="bodySm" color={G.meta} style={{ fontSize: 12 }}>
              8 active now
            </ILText>
          </View>
        </View>
      </WhiteCard>

      {chapter ? (
        <WhiteCard
          style={{ marginTop: 12, borderRadius: 22, padding: 16, flexDirection: 'row', alignItems: 'center' }}
          onPress={() => openArmyCalendar(chapter)}
        >
          <MaterialIcons name="place" size={18} color={G.ink} />
          <View style={{ flex: 1, marginLeft: 10 }}>
            <ILText role="label" color={G.ink}>
              {chapter.city ? `${chapter.city} Chapter` : 'Chapter meetup'}
            </ILText>
            <ILText role="bodySm" color={G.meta} style={{ marginTop: 3, fontSize: 12 }} numberOfLines={2}>
              {chapter.title} · {chapter.whenLabel}
            </ILText>
          </View>
          <View
            style={{
              borderWidth: 1,
              borderColor: G.cta,
              borderRadius: 999,
              paddingHorizontal: 12,
              paddingVertical: 8,
            }}
          >
            <ILText role="label" color={G.cta} style={{ fontSize: 12 }}>
              RSVP
            </ILText>
          </View>
        </WhiteCard>
      ) : null}

      <CsuiteVideos nav={nav} />

      <View style={{ marginTop: 26, flexDirection: 'row', alignItems: 'flex-end' }}>
        <ILText role="title" color={G.ink} style={{ flex: 1, fontFamily: IL_FONTS.display, fontSize: 22 }}>
          Stories from the Army
        </ILText>
        <ILText role="bodySm" color={G.meta} style={{ fontSize: 12 }}>
          {ARMY_STORIES.length} stories
        </ILText>
      </View>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        nestedScrollEnabled
        keyboardShouldPersistTaps="handled"
        style={{ marginTop: 12, marginHorizontal: -20 }}
      >
        <View style={{ flexDirection: 'row', alignItems: 'stretch', paddingHorizontal: 20 }}>
          {ARMY_STORIES.map((story) => (
            <StoryVideoCard
              key={story.title}
              img={story.img}
              title={story.title}
              meta={story.meta}
              time={story.time}
              onPress={() => nav.goWatch({ assetKey: story.assetKey, title: story.title, sub: story.meta })}
            />
          ))}
        </View>
      </ScrollView>

      <ILGuideWhisperLep
        surface={IL_GUIDE_SURFACES.COMMUNITY}
        fallbackQuote="Want to meet women from your industry?"
        subtitle="Executive Mentor"
      >
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', marginTop: 12 }}>
          {['Technology', 'Finance', 'Marketing', 'Not now'].map((item, i) => (
            <View
              key={item}
              style={{
                marginRight: 8,
                marginTop: 6,
                paddingHorizontal: 12,
                paddingVertical: 6,
                borderRadius: 999,
                borderWidth: 1,
                borderColor: G.line,
                backgroundColor: i === 3 ? 'transparent' : G.white,
              }}
            >
              <ILText role="label" color={G.ink} style={{ fontSize: 12 }}>
                {item}
              </ILText>
            </View>
          ))}
        </View>
      </ILGuideWhisperLep>
      </View>
    </>
  );
}

function RegisteredEngage({ nav, topPad }) {
  const navigation = useNavigation();
  const { batch: cmsBatch } = useLearnerCmsBatch('lep');
  const { unlocked: ritualsUnlocked } = useLepRitualsUnlocked({ cmsBatch });
  const ritualsLatch = useRef(ritualsUnlocked);
  if (ritualsUnlocked) ritualsLatch.current = true;
  const ritualsEffective = ritualsLatch.current;
  const prework = useMemo(
    () => filterLepPrework(PREWORK, ritualsEffective),
    [ritualsEffective, ritualsUnlocked]
  );
  const { upcoming, loading: calendarLoading } = useArmyEventCalendar();
  const eventRows = useMemo(() => upcoming.slice(0, 6), [upcoming]);
  const eventsLatch = useRef(eventRows);
  if (eventRows.length) eventsLatch.current = eventRows;
  const stableEventRows = eventRows.length ? eventRows : eventsLatch.current;

  return (
    <>
      <EngageHeroShell
        style={{
          paddingHorizontal: 20,
          paddingTop: topPad + 20,
          paddingBottom: 22,
          flexDirection: 'row',
          alignItems: 'center',
        }}
      >
        <View style={{ flex: 1 }}>
          <ILText role="title" color="#FFFFFF" style={{ fontFamily: IL_FONTS.display, fontSize: 26, lineHeight: 32 }}>
            The Iron Lady Army
          </ILText>
          <ILText role="bodySm" color="rgba(255,255,255,0.7)" style={{ marginTop: 6, fontSize: 13 }}>
            Open to every member
          </ILText>
        </View>
        <SoftChip onDark>Registered</SoftChip>
      </EngageHeroShell>

      <View style={{ paddingHorizontal: 20 }}>
      <CmsEngageFeed programId="lep" cmsBatch={cmsBatch} navigation={navigation} />
      <View style={{ marginTop: 20, flexDirection: 'row', alignItems: 'flex-end' }}>
        <ILText role="title" color={G.ink} style={{ flex: 1, fontFamily: IL_FONTS.display, fontSize: 22 }}>
          Iron Lady Speaks
        </ILText>
        <ILText role="bodySm" color={G.meta} style={{ fontSize: 12 }}>
          {PODCASTS.length} episodes · free
        </ILText>
      </View>
      <ILText role="bodySm" color={G.meta} style={{ marginTop: 4, fontSize: 12 }}>
        Conversations with women who made the leap
      </ILText>

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        nestedScrollEnabled
        keyboardShouldPersistTaps="handled"
        style={{ marginTop: 12, marginHorizontal: -20 }}
      >
        <View style={{ flexDirection: 'row', alignItems: 'stretch', paddingHorizontal: 20 }}>
          {PODCASTS.map((ep) => (
            <Pressable
              key={ep.assetKey}
              onPress={() => nav.goWatch({ assetKey: ep.assetKey, title: ep.title, sub: ep.who })}
              style={{ width: STORY_CARD_W, marginRight: 12 }}
            >
              <WhiteCard
                style={{
                  borderRadius: 18,
                  overflow: 'hidden',
                  height: STORY_THUMB_H + 12 + 14 + 6 + STORY_TITLE_H + 4 + 16 + 12,
                }}
              >
                <View style={{ height: STORY_THUMB_H, width: '100%', backgroundColor: G.dark }}>
                  <CoverThumb source={ep.img} height={STORY_THUMB_H} play time={ep.meta} />
                </View>
                <View style={{ paddingHorizontal: 12, paddingTop: 12, paddingBottom: 12 }}>
                  <ILText role="eyebrow" color={G.cta} style={[af, { fontSize: 9, height: 14 }]} numberOfLines={1}>
                    {ep.meta}
                  </ILText>
                  <ILText
                    role="label"
                    color={G.ink}
                    style={{ marginTop: 6, fontSize: 13, lineHeight: 18, height: STORY_TITLE_H }}
                    numberOfLines={2}
                  >
                    {ep.title}
                  </ILText>
                  <ILText
                    role="bodySm"
                    color={G.meta}
                    style={{ marginTop: 4, fontSize: 11, height: 16 }}
                    numberOfLines={1}
                  >
                    {ep.who}
                  </ILText>
                </View>
              </WhiteCard>
            </Pressable>
          ))}
        </View>
      </ScrollView>

      <View style={{ marginTop: 26, flexDirection: 'row', alignItems: 'flex-end' }}>
        <ILText role="title" color={G.ink} style={{ flex: 1, fontFamily: IL_FONTS.display, fontSize: 22 }}>
          Events
        </ILText>
      </View>
      {calendarLoading && stableEventRows.length === 0 ? (
        <View style={{ marginTop: 12, minHeight: 72 }} />
      ) : stableEventRows.length === 0 ? (
        <ILText role="bodySm" color={G.meta} style={{ marginTop: 12, fontSize: 13 }}>
          Upcoming Army events load from the Iron Lady calendar.
        </ILText>
      ) : (
        stableEventRows.map((ev) => {
          const day = String(Number(ev.dateIso.slice(8, 10)));
          const mon = ['JAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUN', 'JUL', 'AUG', 'SEP', 'OCT', 'NOV', 'DEC'][
            Number(ev.dateIso.slice(5, 7)) - 1
          ];
          return (
            <WhiteCard
              key={ev.id}
              style={{ marginTop: 12, borderRadius: 22, padding: 14, flexDirection: 'row', alignItems: 'center' }}
              onPress={() => openArmyCalendar(ev)}
            >
              <View
                style={{
                  width: 52,
                  borderRadius: 14,
                  backgroundColor: G.pink,
                  alignItems: 'center',
                  paddingVertical: 8,
                }}
              >
                <ILText role="eyebrow" color={G.cta} style={[af, { fontSize: 9 }]}>
                  {mon}
                </ILText>
                <ILText
                  role="title"
                  color={G.ink}
                  style={{ fontFamily: IL_FONTS.display, fontSize: 20, lineHeight: 24 }}
                >
                  {day}
                </ILText>
              </View>
              <View style={{ flex: 1, marginLeft: 12 }}>
                <ILText role="label" color={G.ink} numberOfLines={2}>
                  {ev.title}
                </ILText>
                <ILText role="bodySm" color={G.meta} style={{ marginTop: 4, fontSize: 12 }} numberOfLines={1}>
                  {ev.meta}
                </ILText>
              </View>
              <View
                style={{
                  borderWidth: 1,
                  borderColor: G.cta,
                  borderRadius: 999,
                  paddingHorizontal: 12,
                  paddingVertical: 8,
                }}
              >
                <ILText role="label" color={G.cta} style={{ fontSize: 12 }}>
                  RSVP
                </ILText>
              </View>
            </WhiteCard>
          );
        })
      )}

      <View style={{ marginTop: 26, flexDirection: 'row', alignItems: 'flex-end' }}>
        <ILText role="title" color={G.ink} style={{ flex: 1, fontFamily: IL_FONTS.display, fontSize: 22 }}>
          Prepare for Day 1
        </ILText>
        <ILText role="bodySm" color={G.meta} style={{ fontSize: 12 }}>
          {prework.length} essentials
        </ILText>
      </View>
      <ILText role="bodySm" color={G.meta} style={{ marginTop: 4, fontSize: 12 }}>
        Pre-work videos — not in the podcast library above
      </ILText>
      {prework.map((item) => (
        <WhiteCard
          key={item.practiceId}
          style={{ marginTop: 10, borderRadius: 18, overflow: 'hidden', flexDirection: 'row', alignItems: 'center' }}
          onPress={() => nav.goPractice('lep', item.practiceId)}
        >
          <View style={{ width: 88, height: 56, backgroundColor: G.dark }}>
            <CoverThumb source={item.thumb} play time={item.min} />
          </View>
          <View style={{ flex: 1, paddingHorizontal: 12, paddingVertical: 10 }}>
            <ILText role="label" color={G.ink} numberOfLines={1}>
              {item.title}
            </ILText>
            <ILText role="bodySm" color={G.meta} style={{ marginTop: 3, fontSize: 12 }} numberOfLines={2}>
              {item.sub}
            </ILText>
          </View>
          <MaterialIcons name="chevron-right" size={20} color={G.meta} style={{ marginRight: 10 }} />
        </WhiteCard>
      ))}

      <CsuiteVideos nav={nav} />

      <View style={{ marginTop: 26, flexDirection: 'row', alignItems: 'center' }}>
        <ILText role="eyebrow" color={G.meta} style={[af, { flex: 1, fontSize: 10, letterSpacing: 1 }]}>
          IN-PROGRAM CIRCLES
        </ILText>
        <MaterialIcons name="lock" size={12} color={G.meta} />
        <ILText role="bodySm" color={G.meta} style={{ marginLeft: 4, fontSize: 11 }}>
          Enrolled members only
        </ILText>
      </View>
      <View style={{ flexDirection: 'row', marginTop: 12 }}>
        {CIRCLES_LOCKED.map((item, i) => (
          <View
            key={item.title}
            style={{
              flex: 1,
              marginRight: i === 0 ? 10 : 0,
              borderRadius: 18,
              borderWidth: 1,
              borderStyle: 'dashed',
              borderColor: G.line,
              padding: 14,
              opacity: 0.7,
            }}
          >
            <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
              <MaterialIcons name={item.icon} size={18} color={G.meta} />
              <MaterialIcons name="lock" size={14} color={G.meta} />
            </View>
            <ILText role="label" color={G.meta} style={{ marginTop: 14 }}>
              {item.title}
            </ILText>
            <ILText role="bodySm" color={G.meta} style={{ marginTop: 4, fontSize: 12 }}>
              {item.meta}
            </ILText>
          </View>
        ))}
      </View>
      <ILText role="bodySm" color={G.meta} style={{ textAlign: 'center', marginTop: 16, fontSize: 13 }}>
        Batches & live breakout circles locked.
      </ILText>
      <RNPressable onPress={nav.goEnroll}>
        <ILText role="label" color={G.cta} style={{ textAlign: 'center', marginTop: 6 }}>
          Opens when your enrollment is complete →
        </ILText>
      </RNPressable>
      </View>
    </>
  );
}

function FreeDot() {
  return (
    <View style={{ backgroundColor: G.pink, borderRadius: 6, paddingHorizontal: 6, paddingVertical: 2 }}>
      <ILText role="eyebrow" color={G.cta} style={[af, { fontSize: 8 }]}>
        FREE
      </ILText>
    </View>
  );
}

function PlayDot({ small }) {
  const s = small ? 28 : 40;
  return (
    <View
      style={{
        width: s,
        height: s,
        borderRadius: s / 2,
        backgroundColor: G.cta,
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <MaterialIcons name="play-arrow" size={small ? 16 : 22} color="#FFFFFF" />
    </View>
  );
}

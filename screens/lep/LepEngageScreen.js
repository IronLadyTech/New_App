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
import { ENGAGE_VIDEO_SECTION, engageVideoShelfLabel } from '../../utils/learnMediaShelves';
import { CIRCLE, CIRCLES_LOCKED, FACE, PODCASTS, PREWORK } from './lepData';
import { useGlassHeaderPad } from '../../components/il/GlassHeader';
import ILGuideWhisperLep from '../../components/il/ILGuideWhisperLep';
import ILGuideWhisperExtras from '../../components/il/ILGuideWhisperExtras';
import { IL_GUIDE_SURFACES } from '../../constants/ilGuide';
import { useLearnerCmsBatch } from '../../hooks/useLearnerCmsBatch';
import { useLepRitualsUnlocked } from '../../hooks/useLepRitualsUnlocked';
import { filterLepPrework } from '../../utils/lepRitualsUnlock';
import { useArmyEventCalendar } from '../../hooks/useArmyEventCalendar';
import { armyEventCalendarUrl, armyEventModeLabel } from '../../utils/armyEventCalendar';
import CmsEngageFeed from '../../components/lep/CmsEngageFeed';
import { useNavigation } from '@react-navigation/native';
import {
  engageIndustryOptions,
  resolveEngageWhisper,
} from '../../utils/ilGuideProfilePrompts';

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

function EngageSectionHeader({ title, sub, countLabel, onViewAll }) {
  return (
    <>
      <View style={{ marginTop: 26, flexDirection: 'row', alignItems: 'flex-end' }}>
        <ILText role="title" color={G.ink} style={{ flex: 1, fontFamily: IL_FONTS.display, fontSize: 22 }}>
          {title}
        </ILText>
        <Pressable onPress={onViewAll} accessibilityRole="button" accessibilityLabel="View all">
          <ILText role="label" color={G.cta} style={{ fontSize: 12 }}>
            View all
          </ILText>
        </Pressable>
      </View>
      <View style={{ flexDirection: 'row', alignItems: 'flex-start', marginTop: 4, gap: 12 }}>
        {sub ? (
          <ILText role="bodySm" color={G.meta} style={{ flex: 1, fontSize: 12 }}>
            {sub}
          </ILText>
        ) : (
          <View style={{ flex: 1 }} />
        )}
        {countLabel ? (
          <ILText role="bodySm" color={G.meta} style={{ fontSize: 12 }}>
            {countLabel}
          </ILText>
        ) : null}
      </View>
    </>
  );
}

function CsuiteVideos({ nav }) {
  return (
    <>
      <EngageSectionHeader
        title={ENGAGE_VIDEO_SECTION.title}
        sub={ENGAGE_VIDEO_SECTION.sub}
        countLabel={`${CSUITE_HOME.length} videos`}
        onViewAll={() => nav.goEngageMediaList('csuite')}
      />
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
              key={c.assetKey}
              img={c.img}
              title={c.title}
              meta={c.who}
              time={engageVideoShelfLabel(c)}
              onPress={() => nav.goWatch({ assetKey: c.assetKey, title: c.title, sub: c.who })}
            />
          ))}
        </View>
      </ScrollView>
    </>
  );
}

function PodcastLibrary({ nav }) {
  return (
    <>
      <EngageSectionHeader
        title="Iron Lady Speaks"
        sub="Conversations with women who made the leap"
        countLabel={`${PODCASTS.length} episodes · free`}
        onViewAll={() => nav.goEngageMediaList('podcast')}
      />
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
                  <ILText role="bodySm" color={G.meta} style={{ marginTop: 4, fontSize: 11, height: 16 }} numberOfLines={1}>
                    {ep.who}
                  </ILText>
                </View>
              </WhiteCard>
            </Pressable>
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
        onCalendar={nav.goSchedule}
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
  const { profile, user } = useAuth();
  const { batch: cmsBatch } = useLearnerCmsBatch('lep');
  const engageWhisper = useMemo(
    () => resolveEngageWhisper(profile, user?.uid),
    [profile, user?.uid]
  );
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
            {armyEventModeLabel(featured) ? (
              <ILText role="bodySm" color={G.meta} style={{ fontSize: 12 }} numberOfLines={1}>
                {armyEventModeLabel(featured)}
              </ILText>
            ) : null}
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

      {chapter ? (
        <WhiteCard
          style={{ marginTop: 12, borderRadius: 22, padding: 16, flexDirection: 'row', alignItems: 'center' }}
          onPress={() => nav.goEventDetail(chapter)}
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

      <PodcastLibrary nav={nav} />

      <ILGuideWhisperLep
        surface={IL_GUIDE_SURFACES.COMMUNITY}
        fallbackQuote={engageWhisper.quote}
        subtitle="Executive Mentor"
      >
        <ILGuideWhisperExtras
          interactive={engageWhisper.interactive}
          mcq={engageWhisper.mcq}
          industryOptions={engageWhisper.interactive === 'industry' ? engageIndustryOptions() : []}
        />
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
      <PodcastLibrary nav={nav} />

      <View style={{ marginTop: 26, flexDirection: 'row', alignItems: 'flex-end' }}>
        <ILText role="title" color={G.ink} style={{ flex: 1, fontFamily: IL_FONTS.display, fontSize: 22 }}>
          Events
        </ILText>
      </View>
      {calendarLoading && eventRows.length === 0 ? (
        <View style={{ marginTop: 12, minHeight: 72 }} />
      ) : eventRows.length === 0 ? (
        <ILText role="bodySm" color={G.meta} style={{ marginTop: 12, fontSize: 13 }}>
          Upcoming Army events load from the Iron Lady calendar.
        </ILText>
      ) : (
        eventRows.map((ev) => {
          const day = String(Number(ev.dateIso.slice(8, 10)));
          const mon = ['JAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUN', 'JUL', 'AUG', 'SEP', 'OCT', 'NOV', 'DEC'][
            Number(ev.dateIso.slice(5, 7)) - 1
          ];
          return (
            <WhiteCard
              key={ev.id}
              style={{ marginTop: 12, borderRadius: 22, padding: 14, flexDirection: 'row', alignItems: 'center' }}
              onPress={() => (ev.mode === 'offline' ? nav.goEventDetail(ev) : openArmyCalendar(ev))}
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

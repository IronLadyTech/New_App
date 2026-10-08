import React, { useEffect, useRef, useState } from 'react';
import { Animated, Image, Pressable, ScrollView, View } from 'react-native';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import Reanimated, {
  interpolate,
  interpolateColor,
  runOnJS,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withTiming,
} from 'react-native-reanimated';
import { StatusBar } from 'expo-status-bar';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialIcons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { IL_FONTS } from '../../constants/ironLadyBrand';
import ILText from '../../components/il/ILText';
import { G, af } from '../../constants/guestTheme';
import { LIQUID_TAB_PAD } from '../../components/il/LiquidTabBar';
import { useAuth } from '../../context/AuthContext';
import { isLepEnrolled, lepFirstName } from '../../utils/lepState';
import {
  CheckRow,
  CoverThumb,
  DarkHero,
  GuideFace,
  LepHeader,
  LinkRow,
  Page,
  RedCta,
  SoftChip,
  WeekRing,
  WhisperCard,
  WhiteCard,
} from './LepBits';
import { useLepNav } from './useLepNav';
import {
  DUE_WEEK,
  ENR_PRACTICE,
  FACE,
  GET_READY,
  HERO,
  PREWORK,
  REG_PRACTICE,
  practiceSummary,
  ROLES,
  ARMY_STORIES,
  TODAY_MESSAGE,
} from './lepData';
import { useGlassHeaderPad } from '../../components/il/GlassHeader';
import { PROGRAMS } from '../../constants/programs';
import { useCourseDemo } from '../../context/CourseDemoContext';
import { isItemDone, practiceKey } from '../../constants/practice';
import { DueWeek } from '../program/ProgramKit';

export default function LepHomeScreen() {
  const { profile } = useAuth();
  return isLepEnrolled(profile) ? <EnrolledHome /> : <RegisteredHome />;
}

function Shell({ children }) {
  const insets = useSafeAreaInsets();
  const headerPad = useGlassHeaderPad();
  const { profile } = useAuth();
  const nav = useLepNav();
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
          paddingHorizontal: 20,
          paddingTop: headerPad + 8,
          paddingBottom: LIQUID_TAB_PAD + Math.max(insets.bottom, 8),
        }}
      >
        {children}
      </ScrollView>
    </Page>
  );
}

function RegisteredShell({ children, scrollY, headerGone, onScrollY }) {
  const insets = useSafeAreaInsets();
  const headerPad = useGlassHeaderPad();
  const { profile } = useAuth();
  const nav = useLepNav();
  return (
    <Page>
      <StatusBar style="dark" />
      <LepHeader
        floating
        photoUrl={profile?.photoURL}
        onNotifications={nav.goNotifications}
        onProfile={nav.goProfile}
        scrollY={scrollY}
        inert={headerGone}
      />
      <Animated.ScrollView
        showsVerticalScrollIndicator={false}
        scrollEventThrottle={16}
        onScroll={Animated.event([{ nativeEvent: { contentOffset: { y: scrollY } } }], {
          useNativeDriver: false,
          listener: (e) => onScrollY?.(e.nativeEvent.contentOffset.y),
        })}
        contentContainerStyle={{
          paddingHorizontal: 20,
          paddingTop: headerPad + 8,
          paddingBottom: LIQUID_TAB_PAD + Math.max(insets.bottom, 8),
        }}
      >
        {children}
      </Animated.ScrollView>
    </Page>
  );
}

function RegisteredHome() {
  const { profile } = useAuth();
  const name = lepFirstName(profile);
  const nav = useLepNav();
  const practice = useLivePractice(REG_PRACTICE);
  const scrollY = useRef(new Animated.Value(0)).current;
  const [headerGone, setHeaderGone] = useState(false);
  const [role, setRole] = useState('Technology');
  const [whisperOn, setWhisperOn] = useState(true);

  return (
    <RegisteredShell
      scrollY={scrollY}
      headerGone={headerGone}
      onScrollY={(y) => {
        const gone = y > 110;
        setHeaderGone((prev) => (prev === gone ? prev : gone));
      }}
    >
      <DarkHero>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
          <SoftChip onDark icon="fiber-manual-record">
            Leadership Essentials
          </SoftChip>
          <Image source={FACE} style={{ width: 36, height: 36, borderRadius: 18 }} />
        </View>
        <ILText
          role="display"
          color="#FFFFFF"
          style={{ marginTop: 18, fontFamily: IL_FONTS.display, fontSize: 34, lineHeight: 40, letterSpacing: -0.7 }}
        >
          Good morning, {name}.
        </ILText>
        <ILText role="body" color="rgba(255,255,255,0.72)" style={{ marginTop: 8, fontSize: 16, lineHeight: 22 }}>
          Your LEP batch starts in 9 days.
        </ILText>
        <View style={{ flexDirection: 'row', marginTop: 18, flexWrap: 'wrap', alignItems: 'center' }}>
          <CountChip n="09" l="DAYS" />
          <CountChip n="04" l="HOURS" />
          <View
            style={{
              backgroundColor: 'rgba(255,255,255,0.10)',
              borderRadius: 999,
              paddingHorizontal: 14,
              paddingVertical: 10,
              flexDirection: 'row',
              alignItems: 'center',
            }}
          >
            <MaterialIcons name="verified" size={14} color={G.pink} />
            <ILText role="label" color="#FFFFFF" style={[af, { marginLeft: 6, fontSize: 12 }]}>
              Seat reserved
            </ILText>
          </View>
        </View>

        <View style={{ marginTop: 20, paddingTop: 18, borderTopWidth: 1, borderTopColor: 'rgba(255,255,255,0.08)' }}>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
            <ILText role="eyebrow" color={G.pink} style={[af, { fontSize: 10 }]}>
              Your challenge · Day 1 of 3
            </ILText>
            <ILText role="bodySm" color="rgba(255,255,255,0.55)" style={{ fontSize: 12 }}>
              15 min
            </ILText>
          </View>
          <View style={{ flexDirection: 'row', marginTop: 10 }}>
            <View style={{ flex: 1, height: 3, backgroundColor: G.cta, borderRadius: 2, marginRight: 6 }} />
            <View style={{ flex: 1, height: 3, backgroundColor: 'rgba(255,255,255,0.16)', borderRadius: 2, marginRight: 6 }} />
            <View style={{ flex: 1, height: 3, backgroundColor: 'rgba(255,255,255,0.16)', borderRadius: 2 }} />
          </View>
          <ILText
            role="title"
            color="#FFFFFF"
            style={{ marginTop: 14, fontFamily: IL_FONTS.display, fontSize: 22, lineHeight: 28 }}
          >
            Power Pitch — say who you are in 30 seconds
          </ILText>
          <View style={{ marginTop: 16 }}>
            <RedCta label="Start today’s practice →" onPress={nav.goToday} />
          </View>
        </View>
      </DarkHero>

      <WhiteCard style={{ marginTop: 14, borderRadius: 22, padding: 16, borderColor: 'transparent' }}>
        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
          <MaterialIcons name="menu-book" size={15} color={G.cta} />
          <ILText role="eyebrow" color={G.cta} style={[af, { fontSize: 10, marginLeft: 8, letterSpacing: 1.1 }]}>
            Leadership Essentials program · at a glance
          </ILText>
        </View>
        <View style={{ flexDirection: 'row', marginTop: 14 }}>
          <GlanceCell label="Duration" value="1 month" />
          <View style={{ width: 10 }} />
          <GlanceCell label="Format" value="2-day intensive + weekly" />
        </View>
        <View style={{ flexDirection: 'row', marginTop: 10 }}>
          <GlanceCell label="Curriculum" value="All 27 principles" />
          <View style={{ width: 10 }} />
          <GlanceCell label="On completion" value="Certification" />
        </View>
      </WhiteCard>

      {whisperOn ? (
        <InkWhisper
          name={name}
          onClose={() => setWhisperOn(false)}
          onOpen={() => nav.goPractice('lep', 'lep-principles-video')}
        />
      ) : null}

      <PracticeDeck items={practice} onOpen={nav.goToday} onItem={nav.goPracticeItem} />

      <Section title="Today’s message" sub="Principle 01 · Your BHAG" />
      <WhiteCard
        style={{ marginTop: 12, borderRadius: 22, overflow: 'hidden' }}
        onPress={() =>
          nav.goWatch({
            assetKey: TODAY_MESSAGE.assetKey,
            title: TODAY_MESSAGE.title,
            sub: TODAY_MESSAGE.sub,
          })
        }
      >
        <View style={{ aspectRatio: 16 / 9 }}>
          <CoverThumb source={TODAY_MESSAGE.thumb} play time={TODAY_MESSAGE.duration} />
        </View>
        <View style={{ padding: 14 }}>
          <ILText role="eyebrow" color={G.cta} style={[af, { fontSize: 10 }]}>
            FOUNDATION PRINCIPLE
          </ILText>
          <ILText role="label" color={G.ink} style={{ marginTop: 6, fontSize: 16 }}>
            {TODAY_MESSAGE.title}
          </ILText>
          <ILText role="bodySm" color={G.meta} style={{ marginTop: 4, fontSize: 13, lineHeight: 18 }}>
            {TODAY_MESSAGE.hint}
          </ILText>
        </View>
      </WhiteCard>

      <WhiteCard style={{ marginTop: 14, borderRadius: 22, overflow: 'hidden' }}>
        <View style={{ backgroundColor: G.cta, paddingHorizontal: 16, paddingVertical: 10 }}>
          <ILText role="eyebrow" color="#FFFFFF" style={[af, { fontSize: 11 }]}>
            #ImpactStories
          </ILText>
        </View>
        <View style={{ padding: 16 }}>
          <ILText
            role="title"
            color={G.ink}
            style={{ fontFamily: IL_FONTS.display, fontSize: 20, lineHeight: 28 }}
          >
            “From Career Break to Thriving Psychiatrist: Leadership Essentials Program Transformed My Mindset!”
          </ILText>
          <ILText role="bodySm" color={G.meta} style={{ marginTop: 10, fontSize: 13 }}>
            Ruhi Satija · Consultant Psychiatrist
          </ILText>
        </View>
      </WhiteCard>

      <WhiteCard style={{ marginTop: 12, borderRadius: 22, padding: 16, flexDirection: 'row', alignItems: 'center' }}>
        <View
          style={{
            width: 40,
            height: 40,
            borderRadius: 20,
            backgroundColor: G.pink,
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <MaterialIcons name="place" size={18} color={G.cta} />
        </View>
        <View style={{ flex: 1, marginLeft: 12 }}>
          <ILText role="label" color={G.ink}>
            Bengaluru chapter meetup
          </ILText>
          <ILText role="bodySm" color={G.meta} style={{ marginTop: 2, fontSize: 12 }}>
            Sat 26 Sep · open to registered members
          </ILText>
        </View>
        <ILText role="label" color={G.cta}>
          RSVP
        </ILText>
      </WhiteCard>

      <View
        style={{
          marginTop: 12,
          borderRadius: 22,
          borderWidth: 1,
          borderStyle: 'dashed',
          borderColor: G.dash,
          padding: 14,
        }}
      >
        <ILText role="eyebrow" color={G.cta} style={[af, { fontSize: 10 }]}>
          Your enrolment · LEP · Batch 42
        </ILText>
        <Pressable
          onPress={nav.goEnroll}
          style={{
            marginTop: 12,
            backgroundColor: G.white,
            borderRadius: 18,
            padding: 14,
            flexDirection: 'row',
            alignItems: 'center',
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
            <MaterialIcons name="event" size={16} color={G.cta} />
          </View>
          <View style={{ flex: 1, marginLeft: 12 }}>
            <ILText role="label" color={G.ink}>
              Complete enrollment
            </ILText>
            <ILText role="bodySm" color={G.meta} style={{ marginTop: 2, fontSize: 12 }}>
              To secure your cohort seat
            </ILText>
          </View>
          <ILText role="label" color={G.cta}>
            Proceed →
          </ILText>
        </Pressable>
      </View>

      <WhiteCard style={{ marginTop: 12, borderRadius: 22, padding: 14, flexDirection: 'row', alignItems: 'center' }}>
        <View style={{ flexDirection: 'row' }}>
          {[0, 1, 2].map((i) => (
            <Image
              key={i}
              source={FACE}
              style={{ width: 28, height: 28, borderRadius: 14, marginLeft: i ? -8 : 0, borderWidth: 2, borderColor: G.white }}
            />
          ))}
        </View>
        <ILText role="label" color={G.ink} style={{ marginLeft: 6, fontSize: 12 }}>
          +42
        </ILText>
        <View style={{ flex: 1, marginLeft: 10 }}>
          <ILText role="label" color={G.ink}>
            42 women from Bengaluru
          </ILText>
          <ILText role="bodySm" color={G.meta} style={{ marginTop: 2, fontSize: 12 }}>
            Joining alongside you
          </ILText>
        </View>
        <MaterialIcons name="place" size={18} color={G.meta} />
      </WhiteCard>

      <Section title="Welcome to the community" sub="Stories and prep from women who made the leap" action="View all" onAction={nav.goEngage} />
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={{ marginTop: 12, marginHorizontal: -20 }}
        contentContainerStyle={{ paddingHorizontal: 20 }}
      >
        {ARMY_STORIES.map((clip) => (
          <Pressable
            key={clip.title}
            onPress={() => nav.goWatch({ assetKey: clip.assetKey, title: clip.title, sub: clip.meta })}
            style={{ width: 228, marginRight: 12 }}
          >
            <View style={{ aspectRatio: 16 / 9, borderRadius: 18, overflow: 'hidden', backgroundColor: G.dark }}>
              <CoverThumb source={clip.img} play time={clip.time} />
            </View>
            <ILText role="label" color={G.ink} style={{ marginTop: 8 }}>
              {clip.title}
            </ILText>
            <ILText role="bodySm" color={G.meta} style={{ marginTop: 2, fontSize: 12 }}>
              {clip.meta}
            </ILText>
          </Pressable>
        ))}
      </ScrollView>

      <WhiteCard style={{ marginTop: 22, borderRadius: 22, padding: 16, borderLeftWidth: 3, borderLeftColor: G.cta }}>
        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
          <Image source={FACE} style={{ width: 36, height: 36, borderRadius: 18 }} />
          <View style={{ marginLeft: 10 }}>
            <ILText role="label" color={G.ink}>
              IL Guide from Iron Lady
            </ILText>
            <ILText role="bodySm" color={G.meta} style={{ fontSize: 12 }}>
              Personalized curriculum check
            </ILText>
          </View>
        </View>
        <ILText role="title" color={G.ink} style={{ marginTop: 14, fontFamily: IL_FONTS.display, fontSize: 20, lineHeight: 26 }}>
          Which best describes your current leadership role?
        </ILText>
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', marginTop: 14 }}>
          {ROLES.map((item) => (
            <Pressable
              key={item}
              onPress={() => setRole(item)}
              style={{
                marginRight: 8,
                marginBottom: 8,
                paddingHorizontal: 14,
                paddingVertical: 8,
                borderRadius: 999,
                backgroundColor: role === item ? G.dark : G.mutedFill,
              }}
            >
              <ILText role="label" color={role === item ? '#FFFFFF' : G.ink} style={[af, { fontSize: 12 }]}>
                {item}
              </ILText>
            </Pressable>
          ))}
        </View>
        <ILText role="bodySm" color={G.meta} style={{ textAlign: 'right', fontSize: 12 }}>
          Not now
        </ILText>
      </WhiteCard>

      <BhagCard nav={nav} />
    </RegisteredShell>
  );
}

function EnrolledHome() {
  const { profile } = useAuth();
  const name = lepFirstName(profile);
  const nav = useLepNav();
  const practice = useLivePractice(ENR_PRACTICE);

  return (
    <Shell>
      <DarkHero>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
          <SoftChip onDark icon="verified">
            Enrolled · LEP
          </SoftChip>
          <SoftChip onDark>4 days to launch</SoftChip>
        </View>
        <ILText
          role="display"
          color="#FFFFFF"
          style={{ marginTop: 18, fontFamily: IL_FONTS.display, fontSize: 34, lineHeight: 40, letterSpacing: -0.7 }}
        >
          You’re all set, {name}.
        </ILText>
        <ILText role="body" color="rgba(255,255,255,0.72)" style={{ marginTop: 8, fontSize: 16, lineHeight: 22 }}>
          You’re in this batch. 48 women start together this Saturday.
        </ILText>
        <View
          style={{
            marginTop: 18,
            backgroundColor: 'rgba(255,255,255,0.08)',
            borderRadius: 999,
            paddingHorizontal: 14,
            paddingVertical: 10,
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          <View style={{ flexDirection: 'row', alignItems: 'center', flex: 1 }}>
            <MaterialIcons name="event" size={16} color="#FFFFFF" />
            <ILText role="label" color="#FFFFFF" style={[af, { marginLeft: 8, fontSize: 12 }]}>
              Sat 20 Sep · 9:00 AM IST
            </ILText>
          </View>
          <ILText role="label" color={G.pink} style={[af, { fontSize: 12 }]}>
            Confirmed
          </ILText>
        </View>
      </DarkHero>

      <View style={{ marginTop: 16 }}>
        <WhisperCard
          quote="Join 10 minutes early on Saturday. The first hour sets the tone and the room remembers who was already there."
          onPress={nav.goGuide}
        />
      </View>

      <Section title="Today’s practice" sub={practiceSummary(practice)} action="Open checklist" onAction={nav.goToday} />
      <WhiteCard style={{ marginTop: 12, borderRadius: 22, paddingHorizontal: 16 }}>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', paddingTop: 14, alignItems: 'center' }}>
          <SoftChip icon="local-fire-department">3-day streak</SoftChip>
          <ILText role="bodySm" color={G.meta} style={{ fontSize: 12 }}>
            Daily revision at 8:00 AM
          </ILText>
        </View>
        {practice.map((item, i) => (
          <CheckRow key={item.id} item={item} last={i === practice.length - 1} onPress={() => nav.goPracticeItem(item)} />
        ))}
      </WhiteCard>

      <DueWeek
        sub="Before Day 1 · Sat 20 Sep"
        onSchedule={nav.goSchedule}
        items={DUE_WEEK.map((item) => ({
          ...item,
          onPress: () => nav.goCourseTask(PROGRAMS.LEP, item.taskId),
        }))}
      />

      <WhiteCard style={{ marginTop: 14, borderRadius: 22, padding: 16, flexDirection: 'row', alignItems: 'center' }}>
        <WeekRing done={4} total={5} />
        <View style={{ flex: 1, marginLeft: 12 }}>
          <ILText role="label" color={G.ink}>
            This week · 4 of 5 active days
          </ILText>
          <ILText role="bodySm" color={G.meta} style={{ marginTop: 2, fontSize: 12, lineHeight: 17 }}>
            Red ring = weekdays you opened the app or finished a practice. Friday is still open. Never resets.
          </ILText>
          <View style={{ flexDirection: 'row', marginTop: 8 }}>
            {['M', 'T', 'W', 'T', 'F'].map((d, i) => (
              <View
                key={`${d}${i}`}
                style={{
                  width: 26,
                  height: 26,
                  borderRadius: 13,
                  marginRight: 6,
                  backgroundColor: i < 4 ? G.dark : G.mutedFill,
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <ILText role="label" color={i < 4 ? '#FFFFFF' : G.meta} style={[af, { fontSize: 10 }]}>
                  {d}
                </ILText>
              </View>
            ))}
          </View>
        </View>
      </WhiteCard>

      <Section title="Watch these 3 before Day 1" sub="Essential foundations curated by Rajesh & IL Guide" action="2 of 3 done" />
      {PREWORK.map((item) =>
        item.done ? (
        <WhiteCard
          key={item.n}
          onPress={() => item.practiceId && nav.goPractice('lep', item.practiceId)}
          style={{ marginTop: 10, borderRadius: 20, overflow: 'hidden', flexDirection: 'row' }}
        >
          <View style={{ width: 96, height: 86, backgroundColor: G.dark }}>
            <Image source={item.thumb || HERO} style={{ width: '100%', height: '100%', opacity: 0.55 }} resizeMode="cover" />
            <View
              style={{
                position: 'absolute',
                left: 34,
                top: 29,
                width: 28,
                height: 28,
                borderRadius: 14,
                backgroundColor: G.white,
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <MaterialIcons name="check" size={16} color={G.ink} />
            </View>
            <ILText role="label" color="#FFFFFF" style={{ position: 'absolute', left: 8, bottom: 8, fontSize: 10 }}>
              {item.min}
            </ILText>
          </View>
          <View style={{ flex: 1, padding: 12 }}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
              <ILText role="eyebrow" color={G.cta} style={[af, { fontSize: 11 }]}>
                {item.n}
              </ILText>
              <ILText role="label" color={G.cta} style={[af, { fontSize: 11 }]}>
                Watched
              </ILText>
            </View>
            <ILText role="label" color={G.ink} style={{ marginTop: 4 }}>
              {item.title}
            </ILText>
            <ILText role="bodySm" color={G.meta} style={{ marginTop: 2, fontSize: 12 }} numberOfLines={2}>
              {item.sub}
            </ILText>
          </View>
        </WhiteCard>
        ) : (
          <NextVideoCard
            key={item.n}
            item={item}
            onPress={() => item.practiceId && nav.goPractice('lep', item.practiceId)}
          />
        )
      )}

      <Section title="Get ready" sub="Day 1 checklist" />
      <WhiteCard style={{ marginTop: 12, borderRadius: 22, paddingHorizontal: 16 }}>
        {GET_READY.map((item, i) => (
          <CheckRow key={item.title} item={item} last={i === GET_READY.length - 1} />
        ))}
      </WhiteCard>

      <WhiteCard style={{ marginTop: 16, borderRadius: 22, padding: 18 }}>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
          <ILText role="eyebrow" color={G.meta} style={[af, { fontSize: 10 }]}>
            Live Weekend Boardroom
          </ILText>
          <MaterialIcons name="groups" size={18} color={G.ink} />
        </View>
        <ILText
          role="title"
          color={G.ink}
          style={{ marginTop: 8, fontFamily: IL_FONTS.display, fontSize: 22, lineHeight: 28 }}
        >
          Leadership Essentials program
        </ILText>
        <ILText role="body" color={G.body} style={{ marginTop: 10, fontSize: 14 }}>
          Sat 20 – Sun 21 Sep
        </ILText>
        <ILText role="bodySm" color={G.meta} style={{ marginTop: 4, fontSize: 13 }}>
          9:00 AM – 7:00 PM IST (both days)
        </ILText>
        <View style={{ marginTop: 16 }}>
          <RedCta label="Add to calendar (.ics)" icon="event" onPress={nav.goSchedule} />
        </View>
        <View
          style={{
            marginTop: 10,
            backgroundColor: G.dark,
            borderRadius: 999,
            paddingVertical: 14,
            alignItems: 'center',
          }}
        >
          <ILText role="label" color="#FFFFFF">
            Zoom Boardroom link
          </ILText>
          <ILText role="bodySm" color="rgba(255,255,255,0.6)" style={{ marginTop: 2, fontSize: 11 }}>
            Unlocks 24 hours before Day 1
          </ILText>
        </View>
      </WhiteCard>

    </Shell>
  );
}

function NextVideoCard({ item, onPress }) {
  return (
    <WhiteCard onPress={onPress} style={{ marginTop: 10, borderRadius: 22, padding: 12 }}>
      <View style={{ height: 180, borderRadius: 16, overflow: 'hidden', backgroundColor: G.dark }}>
        <Image source={item.thumb || HERO} style={{ width: '100%', height: '100%' }} resizeMode="cover" />
        <View
          style={{
            position: 'absolute',
            left: 10,
            top: 10,
            flexDirection: 'row',
            alignItems: 'center',
            backgroundColor: G.cta,
            borderRadius: 999,
            paddingHorizontal: 10,
            paddingVertical: 6,
          }}
        >
          <View style={{ width: 6, height: 6, borderRadius: 3, backgroundColor: '#FFFFFF', marginRight: 6 }} />
          <ILText role="eyebrow" color="#FFFFFF" style={[af, { fontSize: 10 }]}>
            Next to watch
          </ILText>
        </View>
        <View
          style={{
            position: 'absolute',
            left: '50%',
            top: '50%',
            width: 48,
            height: 48,
            marginLeft: -24,
            marginTop: -24,
            borderRadius: 24,
            backgroundColor: G.cta,
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <MaterialIcons name="play-arrow" size={26} color="#FFFFFF" />
        </View>
        <ILText role="label" color="#FFFFFF" style={{ position: 'absolute', right: 12, bottom: 10, fontSize: 13 }}>
          {item.min}
        </ILText>
      </View>
      <View style={{ flexDirection: 'row', alignItems: 'baseline', marginTop: 12 }}>
        <ILText role="title" color={G.cta} style={{ fontFamily: IL_FONTS.display, fontSize: 18, lineHeight: 22 }}>
          {item.n}
        </ILText>
        <ILText role="eyebrow" color={G.meta} style={[af, { fontSize: 11, marginLeft: 8 }]}>
          Crucial pre-requisite
        </ILText>
      </View>
      <ILText
        role="title"
        color={G.ink}
        style={{ marginTop: 4, fontFamily: IL_FONTS.display, fontSize: 20, lineHeight: 26 }}
      >
        {item.title}
      </ILText>
      <ILText role="bodySm" color={G.body} style={{ marginTop: 4, fontSize: 13, lineHeight: 19 }}>
        {item.sub}
      </ILText>
    </WhiteCard>
  );
}

function CountChip({ n, l }) {
  return (
    <View
      style={{
        backgroundColor: 'rgba(255,255,255,0.10)',
        borderRadius: 999,
        paddingHorizontal: 14,
        paddingVertical: 10,
        marginRight: 8,
        flexDirection: 'row',
        alignItems: 'baseline',
      }}
    >
      <ILText role="title" color="#FFFFFF" style={{ fontFamily: IL_FONTS.display, fontSize: 20, lineHeight: 24 }}>
        {n}
      </ILText>
      <ILText role="eyebrow" color="rgba(255,255,255,0.55)" style={[af, { fontSize: 10, marginLeft: 6 }]}>
        {l}
      </ILText>
    </View>
  );
}

function GlanceCell({ label, value }) {
  return (
    <View
      style={{
        flex: 1,
        backgroundColor: G.mutedFill,
        borderRadius: 16,
        paddingHorizontal: 14,
        paddingVertical: 14,
        minHeight: 86,
      }}
    >
      <ILText role="eyebrow" color={G.meta} style={[af, { fontSize: 10, letterSpacing: 1 }]}>
        {label}
      </ILText>
      <ILText
        role="title"
        color={G.ink}
        style={{ marginTop: 8, fontFamily: IL_FONTS.display, fontSize: 20, lineHeight: 26, letterSpacing: -0.3 }}
      >
        {value}
      </ILText>
    </View>
  );
}

const DECK_SPRING = { damping: 17, stiffness: 95, mass: 0.9 };

function useLivePractice(items) {
  const { isDone } = useCourseDemo();
  return items.map((item) => ({ ...item, done: isItemDone(item, isDone) }));
}

function PracticeDeck({ items, onOpen, onItem }) {
  const [aside, setAside] = useState([]);
  const leftover = items.filter((item) => !item.done);
  const remaining = leftover.filter((item) => !aside.includes(item.id));
  const stack = remaining.slice(0, 3);
  const canRefresh = aside.length > 0;
  const refresh = () => setAside([]);

  return (
    <WhiteCard style={{ marginTop: 22, borderRadius: 22, padding: 16, overflow: 'hidden' }}>
      <View style={{ flexDirection: 'row', alignItems: 'flex-end' }}>
        <View style={{ flex: 1 }}>
          <ILText role="title" color={G.ink} style={{ fontFamily: IL_FONTS.display, fontSize: 22, lineHeight: 28 }}>
            Today’s practice
          </ILText>
          <ILText role="bodySm" color={G.meta} style={{ marginTop: 4, fontSize: 13 }}>
            {practiceSummary(items)}
          </ILText>
        </View>
        <LinkRow label="Open checklist" onPress={onOpen} />
      </View>
      <View style={{ marginTop: 12, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
        <SoftChip icon="local-fire-department">2-day streak</SoftChip>
        <ILText role="bodySm" color={G.meta} style={{ fontSize: 12 }}>
          Daily revision at 8:00 AM
        </ILText>
      </View>

      {remaining.length ? (
        <View style={{ marginTop: 14, height: 208 }}>
          {stack
            .slice()
            .reverse()
            .map((item, paintI, arr) => {
              const slot = arr.length - 1 - paintI;
              return (
                <DeckCard
                  key={item.id}
                  item={item}
                  slot={slot}
                  onPress={() => (onItem ? onItem(item) : onOpen())}
                  onSkip={() => setAside((prev) => (prev.includes(item.id) ? prev : [...prev, item.id]))}
                />
              );
            })}
        </View>
      ) : (
        <View style={{ marginTop: 18, paddingVertical: 18, alignItems: 'center' }}>
          <MaterialIcons name="check-circle" size={22} color={G.ink} />
          <ILText role="label" color={G.ink} style={{ marginTop: 8 }}>
            {leftover.length ? 'That’s all for now.' : 'Today’s practice is done.'}
          </ILText>
          <ILText role="bodySm" color={G.meta} style={{ marginTop: 4, fontSize: 13, textAlign: 'center' }}>
            {leftover.length ? 'Swipe skipped the rest.' : 'The next card will wait for tomorrow.'}
          </ILText>
        </View>
      )}
      {canRefresh ? (
        <Pressable
          onPress={refresh}
          accessibilityRole="button"
          accessibilityLabel="Show skipped tasks again"
          hitSlop={8}
          style={({ pressed }) => ({
            alignSelf: 'center',
            marginTop: 12,
            opacity: pressed ? 0.55 : 1,
          })}
        >
          <MaterialIcons name="refresh" size={22} color={G.ink} />
        </Pressable>
      ) : null}
    </WhiteCard>
  );
}

function DeckCard({ item, slot, onPress, onSkip }) {
  const place = useSharedValue(slot);
  const dragX = useSharedValue(0);
  const front = slot === 0;

  useEffect(() => {
    place.value = withSpring(slot, DECK_SPRING);
  }, [place, slot]);

  const skip = () => onSkip?.();

  const pan = Gesture.Pan()
    .enabled(front)
    .activeOffsetX([-18, 18])
    .failOffsetY([-14, 14])
    .onUpdate((e) => {
      dragX.value = e.translationX;
    })
    .onEnd((e) => {
      const away = Math.abs(e.translationX) > 72 || Math.abs(e.velocityX) > 800;
      if (!away) {
        dragX.value = withSpring(0, DECK_SPRING);
        return;
      }
      const dir = (e.translationX === 0 ? e.velocityX : e.translationX) >= 0 ? 1 : -1;
      dragX.value = withTiming(dir * 460, { duration: 260 }, (finished) => {
        if (finished) runOnJS(skip)();
      });
    });

  const tap = Gesture.Tap()
    .enabled(true)
    .onEnd(() => {
      runOnJS(onPress)();
    });

  const gesture = front ? Gesture.Exclusive(pan, tap) : Gesture.Tap().onEnd(() => runOnJS(onPress)());

  const wrapStyle = useAnimatedStyle(() => {
    const s = place.value;
    const x = dragX.value;
    return {
      zIndex: Math.round(10 - s),
      transform: [
        { translateX: x },
        { translateY: s * 14 },
        { rotateZ: `${interpolate(x, [-220, 0, 220], [-10, 0, 10])}deg` },
        { scale: 1 - s * 0.045 },
      ],
    };
  });

  const faceStyle = useAnimatedStyle(() => ({
    backgroundColor: interpolateColor(place.value, [0, 1, 2], ['#113744', '#5C8188', '#D7E0DC']),
  }));

  const titleStyle = useAnimatedStyle(() => ({
    color: interpolateColor(place.value, [0, 1, 2], ['#F5F2E8', '#F5F2E8', '#113744']),
  }));

  const metaStyle = useAnimatedStyle(() => ({
    color: interpolateColor(place.value, [0, 1, 2], ['rgba(245,242,232,0.7)', 'rgba(245,242,232,0.78)', '#5A574F']),
  }));

  const eyeStyle = useAnimatedStyle(() => ({
    color: interpolateColor(place.value, [0, 1, 2], ['#F8D6D4', '#F8D6D4', '#113744']),
  }));

  return (
    <GestureDetector gesture={gesture}>
    <Reanimated.View style={[{ position: 'absolute', left: 0, right: 0, top: 0 }, wrapStyle]}>
      <Reanimated.View style={[{ borderRadius: 18, padding: 16, minHeight: 164 }, faceStyle]}>
          <Reanimated.Text
            style={[
              af,
              {
                fontFamily: IL_FONTS.bold,
                fontSize: 10,
                letterSpacing: 1,
                textTransform: 'uppercase',
              },
              eyeStyle,
            ]}
          >
            {slot === 0 ? 'Now' : `Next · ${slot + 1}`}
          </Reanimated.Text>
          <Reanimated.Text
            style={[
              {
                marginTop: 8,
                fontFamily: IL_FONTS.display,
                fontSize: 22,
                lineHeight: 28,
              },
              titleStyle,
            ]}
          >
            {item.title}
          </Reanimated.Text>
          <Reanimated.Text
            style={[
              {
                marginTop: 6,
                fontFamily: IL_FONTS.regular,
                fontSize: 13,
                lineHeight: 18,
              },
              metaStyle,
            ]}
          >
            {item.meta}
          </Reanimated.Text>
          {slot === 0 ? (
            <Reanimated.Text
              style={[
                {
                  marginTop: 16,
                  fontFamily: IL_FONTS.semibold,
                  fontSize: 14,
                  lineHeight: 18,
                },
                titleStyle,
              ]}
            >
              Start this task →
            </Reanimated.Text>
          ) : null}
          {front ? (
            <Reanimated.Text
              style={[
                {
                  marginTop: 6,
                  fontFamily: IL_FONTS.regular,
                  fontSize: 12,
                  lineHeight: 16,
                },
                metaStyle,
              ]}
            >
              Swipe left or right to skip
            </Reanimated.Text>
          ) : null}
        </Reanimated.View>
    </Reanimated.View>
    </GestureDetector>
  );
}

function InkWhisper({ name, onClose, onOpen }) {
  const full = `Nine days to Day 1, ${name}. Start with the 27 Principles video — it’s the language the whole program speaks.`;
  const [n, setN] = useState(0);
  const [blink, setBlink] = useState(true);
  const done = n >= full.length;

  useEffect(() => {
    setN(0);
    const type = setInterval(() => {
      setN((prev) => {
        if (prev >= full.length) {
          clearInterval(type);
          return prev;
        }
        return prev + 1;
      });
    }, 32);
    return () => clearInterval(type);
  }, [full]);

  useEffect(() => {
    if (done) {
      setBlink(false);
      return undefined;
    }
    const pulse = setInterval(() => setBlink((v) => !v), 420);
    return () => clearInterval(pulse);
  }, [done]);

  return (
    <WhiteCard style={{ marginTop: 14, borderRadius: 22, padding: 16 }}>
      <View style={{ flexDirection: 'row', alignItems: 'flex-start' }}>
        <GuideFace size={40} />
        <View style={{ flex: 1, marginLeft: 12 }}>
          <ILText role="label" color={G.ink}>
            IL Guide’s Whisper
          </ILText>
          <ILText role="bodySm" color={G.meta} style={{ marginTop: 2, fontSize: 12 }}>
            Cohort Guide
          </ILText>
        </View>
        <Pressable onPress={onClose} hitSlop={8}>
          <MaterialIcons name="close" size={18} color={G.meta} />
        </Pressable>
      </View>
      <ILText role="body" color={G.ink} style={{ marginTop: 12, fontSize: 16, lineHeight: 24, minHeight: 72 }}>
        {full.slice(0, n)}
        {!done && blink ? (
          <ILText role="body" color={G.cta} style={{ fontSize: 16, lineHeight: 24 }}>
            |
          </ILText>
        ) : null}
      </ILText>
      <Pressable onPress={onOpen} style={{ marginTop: 12 }}>
        <ILText role="label" color={G.cta}>
          Start the video →
        </ILText>
      </Pressable>
    </WhiteCard>
  );
}

function BhagCard({ nav }) {
  const demo = useCourseDemo();
  const pKey = practiceKey('lep-bhag');
  const saved = demo.getSubmission('lep', pKey);
  const bhag = saved?.data?.note?.trim();

  return (
    <WhiteCard style={{ marginTop: 14, borderRadius: 22, padding: 18 }}>
      <View style={{ flexDirection: 'row', alignItems: 'center' }}>
        <MaterialIcons name="auto-awesome" size={16} color={G.cta} />
        <ILText role="eyebrow" color={G.ink} style={[af, { fontSize: 10, marginLeft: 8 }]}>
          Your B-HAG (Big Hairy Audacious Goal)
        </ILText>
      </View>

      {bhag ? (
        <>
          <ILText
            role="title"
            color={G.ink}
            style={{ marginTop: 10, fontFamily: IL_FONTS.display, fontSize: 22, lineHeight: 28 }}
          >
            {bhag}
          </ILText>
          <ILText role="bodySm" color={G.meta} style={{ marginTop: 8, fontSize: 13, lineHeight: 18 }}>
            Saved · your north star for every LEP conversation
          </ILText>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 14 }}>
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <View style={{ width: 7, height: 7, borderRadius: 4, backgroundColor: G.cta, marginRight: 8 }} />
              <ILText role="bodySm" color={G.meta} style={{ fontSize: 12 }}>
                Primary LEP focus track
              </ILText>
            </View>
            <LinkRow label="Refine it →" onPress={() => nav.goPractice('lep', 'lep-bhag')} />
          </View>
        </>
      ) : (
        <>
          <ILText
            role="title"
            color={G.ink}
            style={{ marginTop: 10, fontFamily: IL_FONTS.display, fontSize: 22, lineHeight: 28 }}
          >
            Name the goal big enough to scare you
          </ILText>
          <ILText role="bodySm" color={G.meta} style={{ marginTop: 8, fontSize: 13, lineHeight: 18 }}>
            Principle 01 · Ask for what you want — start with one sentence.
          </ILText>
          <View style={{ flexDirection: 'row', marginTop: 16, flexWrap: 'wrap', gap: 10 }}>
            <Pressable
              onPress={() =>
                nav.goWatch({
                  assetKey: TODAY_MESSAGE.assetKey,
                  title: TODAY_MESSAGE.title,
                  sub: TODAY_MESSAGE.sub,
                })
              }
              style={{
                paddingHorizontal: 14,
                paddingVertical: 10,
                borderRadius: 999,
                backgroundColor: G.mutedFill,
              }}
            >
              <ILText role="label" color={G.ink} style={{ fontSize: 13 }}>
                Watch Principle 01
              </ILText>
            </Pressable>
            <Pressable
              onPress={() => nav.goPractice('lep', 'lep-bhag')}
              style={{
                paddingHorizontal: 14,
                paddingVertical: 10,
                borderRadius: 999,
                backgroundColor: G.cta,
              }}
            >
              <ILText role="label" color="#FFFFFF" style={{ fontSize: 13 }}>
                Write my BHAG →
              </ILText>
            </Pressable>
          </View>
        </>
      )}
    </WhiteCard>
  );
}

function Section({ title, sub, action, onAction }) {
  return (
    <View style={{ marginTop: 26, flexDirection: 'row', alignItems: 'flex-end' }}>
      <View style={{ flex: 1 }}>
        <ILText role="title" color={G.ink} style={{ fontFamily: IL_FONTS.display, fontSize: 22, lineHeight: 28 }}>
          {title}
        </ILText>
        {sub ? (
          <ILText role="bodySm" color={G.meta} style={{ marginTop: 4, fontSize: 13 }}>
            {sub}
          </ILText>
        ) : null}
      </View>
      {action ? <LinkRow label={action} onPress={onAction} /> : null}
    </View>
  );
}

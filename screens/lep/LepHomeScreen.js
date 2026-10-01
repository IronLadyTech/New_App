import React, { useState } from 'react';
import { Image, Pressable, ScrollView, View } from 'react-native';
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
  WhisperCard,
  WhiteCard,
} from './LepBits';
import { useLepNav } from './useLepNav';
import {
  DUE_WEEK,
  ENR_PRACTICE,
  COVER,
  FACE,
  GET_READY,
  HERO,
  PREWORK,
  REG_PRACTICE,
  ROLES,
} from './lepData';
import { useGlassHeaderPad } from '../../components/il/GlassHeader';

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

function RegisteredHome() {
  const { profile } = useAuth();
  const name = lepFirstName(profile);
  const nav = useLepNav();
  const [role, setRole] = useState('Technology');
  const [whisperOn, setWhisperOn] = useState(true);

  return (
    <Shell>
      <DarkHero>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
          <SoftChip onDark icon="fiber-manual-record">
            Leadership Excellence
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
            <Pressable onPress={() => setWhisperOn(false)} hitSlop={8}>
              <MaterialIcons name="close" size={18} color={G.meta} />
            </Pressable>
          </View>
          <ILText role="body" color={G.ink} style={{ marginTop: 12, fontSize: 16, lineHeight: 24 }}>
            Nine days to Day 1, {name}. Start with the 27 Principles video — it’s the language the whole program speaks.
          </ILText>
          <Pressable onPress={nav.goLearn} style={{ marginTop: 12 }}>
            <ILText role="label" color={G.cta}>
              Start the video →
            </ILText>
          </Pressable>
        </WhiteCard>
      ) : null}

      <Section title="Today’s practice" sub="2 of 4 done · about 20 min" action="Open checklist" onAction={nav.goToday} />
      <WhiteCard style={{ marginTop: 12, borderRadius: 22, paddingHorizontal: 16 }}>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', paddingTop: 14, alignItems: 'center' }}>
          <SoftChip icon="local-fire-department">2-day streak</SoftChip>
          <ILText role="bodySm" color={G.meta} style={{ fontSize: 12 }}>
            Daily revision at 8:00 AM
          </ILText>
        </View>
        {REG_PRACTICE.map((item, i) => (
          <CheckRow key={item.id} item={item} last={i === REG_PRACTICE.length - 1} onPress={nav.goToday} />
        ))}
      </WhiteCard>

      <Section title="Today’s message" sub="3 minutes from IL Guide" />
      <Pressable onPress={nav.goGuide} style={{ marginTop: 12, height: 200, borderRadius: 24, overflow: 'hidden' }}>
        <Image source={HERO} style={{ position: 'absolute', width: '100%', height: '100%' }} resizeMode="cover" />
        <LinearGradient colors={['transparent', 'rgba(17,55,68,0.55)']} style={{ position: 'absolute', left: 0, right: 0, top: 0, bottom: 0 }} />
        <View style={{ position: 'absolute', left: 16, top: 16 }}>
          <View style={{ backgroundColor: G.cta, borderRadius: 999, paddingHorizontal: 12, paddingVertical: 6 }}>
            <ILText role="eyebrow" color="#FFFFFF" style={[af, { fontSize: 10 }]}>
              Today’s message
            </ILText>
          </View>
        </View>
        <View
          style={{
            position: 'absolute',
            left: 0,
            right: 0,
            top: 74,
            alignItems: 'center',
          }}
        >
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
            <MaterialIcons name="play-arrow" size={30} color="#FFFFFF" />
          </View>
        </View>
        <View
          style={{
            position: 'absolute',
            right: 14,
            bottom: 14,
            backgroundColor: 'rgba(17,55,68,0.72)',
            borderRadius: 8,
            paddingHorizontal: 8,
            paddingVertical: 3,
          }}
        >
          <ILText role="label" color="#FFFFFF" style={{ fontSize: 11 }}>
            3:05
          </ILText>
        </View>
      </Pressable>

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
        {[
          { title: 'From Invisible to Unstoppable', sub: 'Charu Sharma · technology', time: '3:45', img: COVER.speaks04c },
          { title: 'From Factory Floors to the Boardroom', sub: 'Priyanka Singla · manufacturing', time: '2:18', img: COVER.speaks05 },
        ].map((clip) => (
          <View key={clip.title} style={{ width: 228, marginRight: 12 }}>
            <View style={{ aspectRatio: 16 / 9, borderRadius: 18, overflow: 'hidden', backgroundColor: G.dark }}>
              <CoverThumb source={clip.img} play time={clip.time} />
            </View>
            <ILText role="label" color={G.ink} style={{ marginTop: 8 }}>
              {clip.title}
            </ILText>
            <ILText role="bodySm" color={G.meta} style={{ marginTop: 2, fontSize: 12 }}>
              {clip.sub}
            </ILText>
          </View>
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

      <WhiteCard style={{ marginTop: 14, borderRadius: 22, padding: 18 }}>
        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
          <MaterialIcons name="auto-awesome" size={16} color={G.cta} />
          <ILText role="eyebrow" color={G.ink} style={[af, { fontSize: 10, marginLeft: 8 }]}>
            Your B-HAG (Big Hairy Audacious Goal)
          </ILText>
        </View>
        <ILText
          role="title"
          color={G.ink}
          style={{ marginTop: 10, fontFamily: IL_FONTS.display, fontSize: 22, lineHeight: 28 }}
        >
          CXO by 2028 · Heading Enterprise Technology
        </ILText>
        <ILText role="bodySm" color={G.meta} style={{ marginTop: 8, fontSize: 13, lineHeight: 18 }}>
          Calibrated during your initial leadership assessment
        </ILText>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 14 }}>
          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
            <View style={{ width: 7, height: 7, borderRadius: 4, backgroundColor: G.cta, marginRight: 8 }} />
            <ILText role="bodySm" color={G.meta} style={{ fontSize: 12 }}>
              Primary LEP focus track
            </ILText>
          </View>
          <LinkRow label="Refine it →" />
        </View>
      </WhiteCard>
    </Shell>
  );
}

function EnrolledHome() {
  const { profile } = useAuth();
  const name = lepFirstName(profile);
  const nav = useLepNav();

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
          Your seat in the boardroom is locked. 48 formidable women ready to rewrite their trajectory.
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

      <Section title="Today’s practice" sub="2 of 4 done · 3-day streak · daily revision at 8:00 AM" action="Open checklist" onAction={nav.goToday} />
      <WhiteCard style={{ marginTop: 12, borderRadius: 22, paddingHorizontal: 16 }}>
        {ENR_PRACTICE.map((item, i) => (
          <CheckRow
            key={item.id}
            item={item}
            last={i === ENR_PRACTICE.length - 1}
            onPress={item.id === 'e3' ? nav.goAssignment : nav.goToday}
          />
        ))}
      </WhiteCard>

      <Section title="Due this week" sub="Across your programs" action="See schedule" onAction={nav.goSchedule} />
      <WhiteCard style={{ marginTop: 12, borderRadius: 22, overflow: 'hidden' }}>
        {DUE_WEEK.map((item, i) => (
          <Pressable
            key={item.id}
            onPress={item.id === 'd1' ? nav.goAssignment : nav.goSchedule}
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              paddingHorizontal: 16,
              paddingVertical: 14,
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
              <MaterialIcons name={item.icon} size={18} color={G.cta} />
            </View>
            <View style={{ flex: 1, marginLeft: 12 }}>
              <ILText role="label" color={G.ink}>
                {item.title}
              </ILText>
              <ILText role="bodySm" color={G.meta} style={{ marginTop: 2, fontSize: 12 }}>
                {item.meta}
              </ILText>
            </View>
            <ILText role="label" color={G.cta} style={[af, { fontSize: 12 }]}>
              {item.due}
            </ILText>
          </Pressable>
        ))}
      </WhiteCard>

      <WhiteCard style={{ marginTop: 14, borderRadius: 22, padding: 16, flexDirection: 'row', alignItems: 'center' }}>
        <View style={{ width: 56, height: 56, alignItems: 'center', justifyContent: 'center' }}>
          <ILText role="display" color={G.cta} style={{ fontFamily: IL_FONTS.display, fontSize: 18 }}>
            4/5
          </ILText>
        </View>
        <View style={{ flex: 1, marginLeft: 8 }}>
          <ILText role="label" color={G.ink}>
            This week · 4 of 5 active days
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
        <WhiteCard key={item.n} style={{ marginTop: 10, borderRadius: 20, overflow: 'hidden', flexDirection: 'row' }}>
          <View style={{ width: 96, height: 86, backgroundColor: G.dark }}>
            <Image source={HERO} style={{ width: '100%', height: '100%', opacity: 0.55 }} resizeMode="cover" />
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
          <NextVideoCard key={item.n} item={item} />
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

function NextVideoCard({ item }) {
  return (
    <WhiteCard style={{ marginTop: 10, borderRadius: 22, padding: 12 }}>
      <View style={{ height: 180, borderRadius: 16, overflow: 'hidden', backgroundColor: G.dark }}>
        <Image source={HERO} style={{ width: '100%', height: '100%' }} resizeMode="cover" />
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

import React from 'react';
import { Image, Pressable, ScrollView, View } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { MaterialIcons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { IL_FONTS } from '../../constants/ironLadyBrand';
import ILText from '../../components/il/ILText';
import { G, af } from '../../constants/guestTheme';
import { LIQUID_TAB_PAD } from '../../components/il/LiquidTabBar';
import { useAuth } from '../../context/AuthContext';
import { isLepEnrolled } from '../../utils/lepState';
import { LepHeader, LinkRow, Page, RedCta, SoftChip, WhiteCard } from './LepBits';
import { useLepNav } from './useLepNav';
import { ARMY_STORIES, CIRCLE, CIRCLES_LOCKED, ENGAGE_EVENTS_REG, FACE, HERO, PODCASTS } from './lepData';

export default function LepEngageScreen() {
  const { profile } = useAuth();
  const insets = useSafeAreaInsets();
  const nav = useLepNav();
  const enrolled = isLepEnrolled(profile);

  return (
    <Page>
      <StatusBar style="dark" />
      <LepHeader photoUrl={profile?.photoURL} onNotifications={nav.goNotifications} onProfile={nav.goProfile} />
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{
          paddingHorizontal: 20,
          paddingBottom: LIQUID_TAB_PAD + Math.max(insets.bottom, 8),
        }}
      >
        {enrolled ? <EnrolledEngage nav={nav} /> : <RegisteredEngage nav={nav} />}
      </ScrollView>
    </Page>
  );
}

function EnrolledEngage({ nav }) {
  return (
    <>
      <View style={{ backgroundColor: G.dark, borderRadius: 24, padding: 18 }}>
        <ILText role="eyebrow" color="rgba(255,255,255,0.55)" style={[af, { fontSize: 10 }]}>
          IRON LADY
        </ILText>
        <View style={{ flexDirection: 'row', alignItems: 'flex-end', marginTop: 8 }}>
          <ILText
            role="title"
            color="#FFFFFF"
            style={{ flex: 1, fontFamily: IL_FONTS.display, fontSize: 28, lineHeight: 34 }}
          >
            Your Iron Lady Army
          </ILText>
          <View style={{ borderWidth: 1, borderColor: G.cta, borderRadius: 999, paddingHorizontal: 10, paddingVertical: 5 }}>
            <ILText role="eyebrow" color={G.pink} style={[af, { fontSize: 9 }]}>
              Member till Sep 2027
            </ILText>
          </View>
        </View>
      </View>

      <WhiteCard style={{ marginTop: 14, borderRadius: 22, padding: 18 }}>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
            <View style={{ width: 7, height: 7, borderRadius: 4, backgroundColor: G.cta, marginRight: 8 }} />
            <ILText role="eyebrow" color={G.cta} style={[af, { fontSize: 10 }]}>
              THIS THURSDAY
            </ILText>
          </View>
          <ILText role="bodySm" color={G.meta} style={{ fontSize: 12 }}>
            Live · Closed-door triad
          </ILText>
        </View>
        <ILText
          role="title"
          color={G.ink}
          style={{ marginTop: 12, fontFamily: IL_FONTS.display, fontSize: 24, lineHeight: 30 }}
        >
          Community Circle · Thu 8–9 PM
        </ILText>
        <ILText role="bodySm" color={G.meta} style={{ marginTop: 8, fontSize: 13, lineHeight: 18 }}>
          Small group sessions with women working through the same problems.
        </ILText>
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
        <View style={{ marginTop: 8 }}>
          <RedCta label="Add to calendar" icon="event" onPress={nav.goSchedule} />
        </View>
      </WhiteCard>

      <WhiteCard style={{ marginTop: 12, borderRadius: 22, padding: 16 }} onPress={nav.goMyProgram}>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <View style={{ flex: 1 }}>
            <ILText role="label" color={G.ink}>
              42 women in your LEP batch
            </ILText>
            <ILText role="bodySm" color={G.meta} style={{ marginTop: 4, fontSize: 12 }}>
              Leadership Track
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

      <WhiteCard
        style={{ marginTop: 12, borderRadius: 22, padding: 16, flexDirection: 'row', alignItems: 'center' }}
        onPress={nav.goTicket}
      >
        <MaterialIcons name="place" size={18} color={G.ink} />
        <View style={{ flex: 1, marginLeft: 10 }}>
          <ILText role="label" color={G.ink}>
            Bengaluru Chapter
          </ILText>
          <ILText role="bodySm" color={G.meta} style={{ marginTop: 3, fontSize: 12 }}>
            Next meetup: Sat 27 Sep
          </ILText>
        </View>
        <View style={{ borderWidth: 1, borderColor: G.cta, borderRadius: 999, paddingHorizontal: 12, paddingVertical: 8 }}>
          <ILText role="label" color={G.cta} style={{ fontSize: 12 }}>
            RSVP
          </ILText>
        </View>
      </WhiteCard>

      <View style={{ marginTop: 26, flexDirection: 'row', alignItems: 'center' }}>
        <ILText role="title" color={G.ink} style={{ flex: 1, fontFamily: IL_FONTS.display, fontSize: 22 }}>
          Stories from the Army
        </ILText>
        <ILText role="label" color={G.cta} style={{ fontSize: 12 }}>
          Confidential
        </ILText>
      </View>
      <View style={{ flexDirection: 'row', marginTop: 12 }}>
        {ARMY_STORIES.map((story, i) => (
          <WhiteCard key={story.title} style={{ flex: 1, marginRight: i === 0 ? 10 : 0, borderRadius: 20, overflow: 'hidden' }}>
            <View style={{ height: 110, backgroundColor: G.dark }}>
              <Image source={HERO} style={{ width: '100%', height: '100%', opacity: 0.55 }} resizeMode="cover" />
              <View
                style={{
                  position: 'absolute',
                  alignSelf: 'center',
                  top: 37,
                  left: '50%',
                  marginLeft: -18,
                  width: 36,
                  height: 36,
                  borderRadius: 18,
                  backgroundColor: 'rgba(255,255,255,0.92)',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <MaterialIcons name="play-arrow" size={20} color={G.ink} />
              </View>
              <View
                style={{
                  position: 'absolute',
                  right: 10,
                  bottom: 10,
                  backgroundColor: '#111',
                  borderRadius: 6,
                  paddingHorizontal: 6,
                  paddingVertical: 2,
                }}
              >
                <ILText role="eyebrow" color="#FFFFFF" style={[af, { fontSize: 8 }]}>
                  {story.time}
                </ILText>
              </View>
            </View>
            <View style={{ padding: 12 }}>
              <ILText role="label" color={G.ink} style={{ fontSize: 13 }} numberOfLines={3}>
                {story.title}
              </ILText>
              <ILText role="bodySm" color={G.meta} style={{ marginTop: 4, fontSize: 11 }}>
                {story.meta}
              </ILText>
            </View>
          </WhiteCard>
        ))}
      </View>

      <WhiteCard style={{ marginTop: 16, borderRadius: 22, padding: 16 }}>
        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
          <Image source={FACE} style={{ width: 36, height: 36, borderRadius: 18 }} />
          <View style={{ marginLeft: 10, flex: 1 }}>
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <ILText role="label" color={G.ink} style={{ fontSize: 13 }}>
                IL Guide’s Whisper
              </ILText>
              <ILText role="eyebrow" color={G.cta} style={[af, { marginLeft: 6, fontSize: 9 }]}>
                EXECUTIVE MENTOR
              </ILText>
            </View>
            <ILText role="body" color={G.body} style={{ marginTop: 8, fontSize: 14, lineHeight: 20 }}>
              Want to meet women from your industry?
            </ILText>
          </View>
        </View>
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
      </WhiteCard>
    </>
  );
}

function RegisteredEngage({ nav }) {
  return (
    <>
      <View style={{ backgroundColor: G.dark, borderRadius: 24, padding: 18, flexDirection: 'row', alignItems: 'center' }}>
        <View style={{ flex: 1 }}>
          <ILText role="title" color="#FFFFFF" style={{ fontFamily: IL_FONTS.display, fontSize: 26, lineHeight: 32 }}>
            The Iron Lady Army
          </ILText>
          <ILText role="bodySm" color="rgba(255,255,255,0.7)" style={{ marginTop: 6, fontSize: 13 }}>
            Open to every member
          </ILText>
        </View>
        <SoftChip onDark>Registered</SoftChip>
      </View>

      <View style={{ marginTop: 22, flexDirection: 'row', alignItems: 'flex-end' }}>
        <ILText role="title" color={G.ink} style={{ flex: 1, fontFamily: IL_FONTS.display, fontSize: 22 }}>
          Iron Lady Speaks
        </ILText>
        <LinkRow label="All episodes" />
      </View>

      <WhiteCard style={{ marginTop: 12, borderRadius: 22, padding: 14, flexDirection: 'row', alignItems: 'center' }}>
        <View
          style={{
            width: 56,
            height: 56,
            borderRadius: 14,
            backgroundColor: G.dark,
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <View style={{ position: 'absolute', top: 6, left: 6 }}>
            <FreeDot />
          </View>
          <MaterialIcons name="mic" size={22} color={G.pink} />
        </View>
        <View style={{ flex: 1, marginLeft: 12 }}>
          <SoftChip>Free</SoftChip>
          <ILText role="label" color={G.ink} style={{ marginTop: 6 }} numberOfLines={2}>
            {PODCASTS[0].title}
          </ILText>
          <ILText role="bodySm" color={G.meta} style={{ marginTop: 4, fontSize: 12 }}>
            {PODCASTS[0].meta}
          </ILText>
        </View>
        <PlayDot />
      </WhiteCard>

      <View style={{ flexDirection: 'row', marginTop: 10 }}>
        {PODCASTS.slice(1).map((ep, i) => (
          <WhiteCard key={ep.title} style={{ flex: 1, marginRight: i === 0 ? 10 : 0, borderRadius: 18, padding: 12 }}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
              <View
                style={{
                  width: 36,
                  height: 36,
                  borderRadius: 10,
                  backgroundColor: G.dark,
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <MaterialIcons name="mic" size={16} color={G.pink} />
              </View>
              <FreeDot />
            </View>
            <ILText role="label" color={G.ink} style={{ marginTop: 10, fontSize: 12 }} numberOfLines={3}>
              {ep.title}
            </ILText>
            <View style={{ marginTop: 10, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
              <ILText role="bodySm" color={G.meta} style={{ fontSize: 11 }}>
                {ep.meta.split('·')[1]?.trim() || ep.meta}
              </ILText>
              <PlayDot small />
            </View>
          </WhiteCard>
        ))}
      </View>

      <View style={{ marginTop: 26, flexDirection: 'row', alignItems: 'flex-end' }}>
        <ILText role="title" color={G.ink} style={{ flex: 1, fontFamily: IL_FONTS.display, fontSize: 22 }}>
          Events
        </ILText>
      </View>
      {ENGAGE_EVENTS_REG.map((ev) => (
        <WhiteCard
          key={ev.title}
          style={{ marginTop: 12, borderRadius: 22, padding: 14, flexDirection: 'row', alignItems: 'center' }}
          onPress={nav.goTicket}
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
              {ev.mon}
            </ILText>
            <ILText role="title" color={G.ink} style={{ fontFamily: IL_FONTS.display, fontSize: 20, lineHeight: 24 }}>
              {ev.day}
            </ILText>
          </View>
          <View style={{ flex: 1, marginLeft: 12 }}>
            <ILText role="label" color={G.ink} numberOfLines={1}>
              {ev.title}
            </ILText>
            <ILText role="bodySm" color={G.meta} style={{ marginTop: 4, fontSize: 12 }}>
              {ev.meta}
            </ILText>
          </View>
          <View style={{ borderWidth: 1, borderColor: G.cta, borderRadius: 999, paddingHorizontal: 12, paddingVertical: 8 }}>
            <ILText role="label" color={G.cta} style={{ fontSize: 12 }}>
              RSVP
            </ILText>
          </View>
        </WhiteCard>
      ))}

      <View style={{ marginTop: 26, flexDirection: 'row', alignItems: 'center' }}>
        <ILText role="title" color={G.ink} style={{ flex: 1, fontFamily: IL_FONTS.display, fontSize: 22 }}>
          Stories from the Army
        </ILText>
        <View style={{ backgroundColor: '#E8F6EE', borderRadius: 999, paddingHorizontal: 10, paddingVertical: 5 }}>
          <ILText role="eyebrow" color="#1B7A4A" style={[af, { fontSize: 9 }]}>
            Free Access
          </ILText>
        </View>
      </View>
      <View style={{ flexDirection: 'row', marginTop: 12 }}>
        {ARMY_STORIES.map((story, i) => (
          <WhiteCard key={story.title} style={{ flex: 1, marginRight: i === 0 ? 10 : 0, borderRadius: 20, overflow: 'hidden' }}>
            <View style={{ height: 110, backgroundColor: G.dark, alignItems: 'center', justifyContent: 'center' }}>
              <View
                style={{
                  width: 36,
                  height: 36,
                  borderRadius: 18,
                  backgroundColor: 'rgba(255,255,255,0.18)',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <MaterialIcons name="play-arrow" size={20} color="#FFFFFF" />
              </View>
              <View
                style={{
                  position: 'absolute',
                  right: 10,
                  bottom: 10,
                  backgroundColor: '#111',
                  borderRadius: 6,
                  paddingHorizontal: 6,
                  paddingVertical: 2,
                }}
              >
                <ILText role="eyebrow" color="#FFFFFF" style={[af, { fontSize: 8 }]}>
                  {story.time}
                </ILText>
              </View>
            </View>
            <View style={{ padding: 12 }}>
              <ILText role="label" color={G.ink} style={{ fontSize: 13 }} numberOfLines={3}>
                {story.title}
              </ILText>
              <ILText role="bodySm" color={G.meta} style={{ marginTop: 4, fontSize: 11 }}>
                {story.meta}
              </ILText>
            </View>
          </WhiteCard>
        ))}
      </View>

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
      <Pressable onPress={nav.goEnroll}>
        <ILText role="label" color={G.cta} style={{ textAlign: 'center', marginTop: 6 }}>
          Opens when your enrollment is complete →
        </ILText>
      </Pressable>
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

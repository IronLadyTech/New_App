import React, { useState } from 'react';
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
import { GuideFace, LepHeader, Page, PillRow, RedCta, SectionHead, SoftChip, WhiteCard } from './LepBits';
import { useLepNav } from './useLepNav';
import {
  CASES_MORE_ENR,
  EVENT_NEAR_ENR,
  EVENT_ROOMS_ENR,
  FACE,
  HERO,
  LEARN_CASES_LOCKED,
  LEARN_CHIPS_ENR,
  LEARN_CHIPS_REG,
  LEARN_CITIES,
  LEARN_CITIES_ENR,
  LEARN_CONTINUE,
  LEARN_CONTINUE_ENR,
  LEARN_EVENT_ENR,
  LEARN_EVENT_REG,
  LEARN_EVENTS_LOCKED,
  LEARN_EVENTS_OPEN,
  LEARN_FRESH,
  LEARN_FRESH_ENR,
  LEARN_WHISPER,
  LEARN_WHISPER_ENR,
  PRINCIPLES_COMMAND_ENR,
  PRINCIPLES_FOUND_ENR,
  PRINCIPLES_INFLUENCE_ENR,
  PRINCIPLES_LOCKED,
  PRINCIPLES_OPEN,
  STORIES_FUNC_ENR,
} from './lepData';

export default function LepLearnScreen() {
  const { profile } = useAuth();
  const insets = useSafeAreaInsets();
  const nav = useLepNav();
  const enrolled = isLepEnrolled(profile);
  const chips = enrolled ? LEARN_CHIPS_ENR : LEARN_CHIPS_REG;
  const [chip, setChip] = useState('For you');

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
        {enrolled ? (
          <>
            {chip !== 'For you' ? <EnrolledHead chip={chip} /> : null}
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginTop: chip === 'For you' ? 4 : 16 }}>
              <PillRow items={chips} value={chip} onChange={setChip} />
            </ScrollView>
            {chip === 'Principles' ? (
              <PrinciplesEnrolled onResume={nav.goPhase} />
            ) : chip === 'Case studies' ? (
              <CasesEnrolled onMark={nav.goMyProgram} />
            ) : chip === 'Events' ? (
              <EventsEnrolled onCal={nav.goSchedule} onTriad={nav.goMyProgram} onTicket={nav.goTicket} />
            ) : chip === 'Community stories' ? (
              <StoriesEnrolled onHow={nav.goEngage} />
            ) : (
              <EnrolledForYou onTicket={nav.goTicket} />
            )}
          </>
        ) : (
          <>
            <View style={{ flexDirection: 'row', alignItems: 'flex-end', justifyContent: 'space-between' }}>
              <ILText role="display" color={G.ink} style={{ fontFamily: IL_FONTS.display, fontSize: 32, lineHeight: 38 }}>
                Learn Library
              </ILText>
              <View style={{ backgroundColor: G.mutedFill, borderRadius: 999, paddingHorizontal: 10, paddingVertical: 5 }}>
                <ILText role="eyebrow" color={G.meta} style={[af, { fontSize: 9, letterSpacing: 0.8 }]}>
                  MASTERCLASS REGISTERED
                </ILText>
              </View>
            </View>
            <ILText role="body" color={G.meta} style={{ marginTop: 8, fontSize: 14, lineHeight: 20 }}>
              4 foundation principles accessible · 23 unlocked upon enrollment
            </ILText>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginTop: 16 }}>
              <PillRow items={chips} value={chip} onChange={setChip} />
            </ScrollView>
            {chip === 'Principles' ? (
              <PrinciplesPane enrolled={false} onEnroll={nav.goEnroll} />
            ) : chip === 'Case studies' ? (
              <CasesPane enrolled={false} onEnroll={nav.goEnroll} />
            ) : chip === 'Events' ? (
              <EventsPane enrolled={false} onEnroll={nav.goEnroll} onTicket={nav.goTicket} />
            ) : (
              <ForYouPane enrolled={false} onEnroll={nav.goEnroll} onTicket={nav.goTicket} />
            )}
          </>
        )}
      </ScrollView>
    </Page>
  );
}

function ForYouPane({ enrolled, onEnroll, onTicket }) {
  return (
    <>
      <View style={{ marginTop: 18, height: 268, borderRadius: 28, overflow: 'hidden', backgroundColor: G.dark, padding: 18 }}>
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
            <ILText role="eyebrow" color="#FFFFFF" style={[af, { fontSize: 9, letterSpacing: 0.7 }]}>
              FEATURED MASTERCLASS
            </ILText>
          </View>
          <ILText role="eyebrow" color="rgba(255,255,255,0.7)" style={[af, { fontSize: 10 }]}>
            28 mins · Live case
          </ILText>
        </View>
        <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
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
        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
          <MaterialIcons name="place" size={12} color={G.cta} />
          <ILText role="eyebrow" color={G.cta} style={[af, { marginLeft: 4, fontSize: 9, letterSpacing: 0.6 }]}>
            PICKED FOR WOMEN IN TECHNOLOGY IN BENGALURU
          </ILText>
        </View>
        <ILText
          role="title"
          color="#FFFFFF"
          style={{ marginTop: 8, fontFamily: IL_FONTS.display, fontSize: 24, lineHeight: 30 }}
        >
          Technology isn’t a cost. It’s a growth multiplier.
        </ILText>
        <ILText role="label" color="#FFFFFF" style={{ marginTop: 12, fontSize: 13 }}>
          Start watch →
        </ILText>
      </View>

      <View style={{ marginTop: 26 }}>
        <SectionHead title="Continue watching" accent="1 in progress" />
      </View>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginTop: 12, marginHorizontal: -20 }}>
        <View style={{ flexDirection: 'row', paddingHorizontal: 20 }}>
          {LEARN_CONTINUE.map((item) => (
            <ContinueCard key={item.title} item={item} />
          ))}
        </View>
      </ScrollView>

      <View style={{ marginTop: 26 }}>
        <SectionHead title="Fresh this month" accent="View all" />
      </View>
      <WhiteCard style={{ marginTop: 12, borderRadius: 22, overflow: 'hidden' }}>
        {LEARN_FRESH.map((item, i) => (
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
            <View style={{ flex: 1, marginLeft: 12 }}>
              <ILText role="label" color={G.ink} numberOfLines={1}>
                {item.title}
              </ILText>
              <ILText role="bodySm" color={item.open ? G.meta : G.cta} style={{ marginTop: 3, fontSize: 12 }}>
                {item.meta}
              </ILText>
            </View>
            <MaterialIcons name={item.open ? 'bookmark-border' : 'lock'} size={16} color={G.meta} />
          </View>
        ))}
      </WhiteCard>

      <View style={{ marginTop: 26 }}>
        <SectionHead title="Upcoming events near you" />
      </View>
      <WhiteCard style={{ marginTop: 12, borderRadius: 22, padding: 16 }} onPress={onTicket}>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
          <ILText role="eyebrow" color={G.cta} style={[af, { fontSize: 10 }]}>
            {LEARN_EVENT_REG.kicker}
          </ILText>
          <ILText role="eyebrow" color={G.meta} style={[af, { fontSize: 10 }]}>
            {LEARN_EVENT_REG.when}
          </ILText>
        </View>
        <ILText
          role="title"
          color={G.ink}
          style={{ marginTop: 8, fontFamily: IL_FONTS.display, fontSize: 20, lineHeight: 26 }}
        >
          {LEARN_EVENT_REG.title}
        </ILText>
        <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 8 }}>
          <MaterialIcons name="place" size={14} color={G.meta} />
          <ILText role="bodySm" color={G.meta} style={{ marginLeft: 4, fontSize: 13 }}>
            {LEARN_EVENT_REG.place}
          </ILText>
        </View>
        <View style={{ marginTop: 14, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
            {[0, 1].map((i) => (
              <Image
                key={i}
                source={FACE}
                style={{
                  width: 24,
                  height: 24,
                  borderRadius: 12,
                  marginLeft: i ? -8 : 0,
                  borderWidth: 2,
                  borderColor: G.white,
                }}
              />
            ))}
            <ILText role="bodySm" color={G.meta} style={{ marginLeft: 8, fontSize: 12 }}>
              {LEARN_EVENT_REG.who}
            </ILText>
          </View>
          <View style={{ backgroundColor: G.cta, borderRadius: 999, paddingHorizontal: 14, paddingVertical: 8 }}>
            <ILText role="label" color="#FFFFFF" style={{ fontSize: 12 }}>
              RSVP
            </ILText>
          </View>
        </View>
      </WhiteCard>

      <WhiteCard style={{ marginTop: 16, borderRadius: 22, padding: 16, borderLeftWidth: 3, borderLeftColor: G.cta }}>
        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
          <ILText role="eyebrow" color={G.cta} style={[af, { fontSize: 10 }]}>
            IL GUIDE’S WHISPER
          </ILText>
          <View style={{ width: 6, height: 6, borderRadius: 3, backgroundColor: G.cta, marginLeft: 8 }} />
          <ILText role="eyebrow" color={G.meta} style={[af, { marginLeft: 6, fontSize: 10 }]}>
            This week
          </ILText>
        </View>
        <View style={{ flexDirection: 'row', marginTop: 14 }}>
          <GuideFace size={44} />
          <ILText
            role="title"
            color={G.ink}
            style={{ flex: 1, marginLeft: 12, fontFamily: IL_FONTS.display, fontSize: 18, lineHeight: 24 }}
          >
            “{LEARN_WHISPER}”
          </ILText>
        </View>
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', marginTop: 14 }}>
          {LEARN_CITIES.map((city, i) => (
            <View
              key={city}
              style={{
                marginRight: 8,
                marginTop: 6,
                paddingHorizontal: 12,
                paddingVertical: 6,
                borderRadius: 999,
                backgroundColor: i === 0 ? G.mutedFill : G.white,
                borderWidth: 1,
                borderColor: G.line,
              }}
            >
              <ILText role="label" color={G.ink} style={{ fontSize: 12 }}>
                {city}
              </ILText>
            </View>
          ))}
        </View>
      </WhiteCard>

      {!enrolled ? <UnlockCard onEnroll={onEnroll} /> : null}
    </>
  );
}

function ContinueCard({ item }) {
  return (
    <WhiteCard
      style={{
        width: 240,
        marginRight: 12,
        borderRadius: 22,
        padding: 16,
        opacity: item.open ? 1 : 0.72,
      }}
    >
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
        <View
          style={{
            width: 36,
            height: 36,
            borderRadius: 18,
            backgroundColor: G.page,
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <MaterialIcons name="play-arrow" size={18} color={G.ink} />
        </View>
        {item.left ? (
          <View style={{ backgroundColor: G.mutedFill, borderRadius: 8, paddingHorizontal: 8, paddingVertical: 4 }}>
            <ILText role="eyebrow" color={G.ink} style={[af, { fontSize: 9 }]}>
              {item.left}
            </ILText>
          </View>
        ) : null}
      </View>
      <ILText role="eyebrow" color={G.cta} style={[af, { marginTop: 14, fontSize: 10 }]}>
        {item.tag}
      </ILText>
      <ILText
        role="title"
        color={G.ink}
        style={{ marginTop: 6, fontFamily: IL_FONTS.display, fontSize: 18, lineHeight: 24 }}
      >
        {item.title}
      </ILText>
      {item.open ? (
        <>
          <View style={{ marginTop: 14, height: 4, backgroundColor: G.mutedFill, borderRadius: 2, overflow: 'hidden' }}>
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
        </>
      ) : (
        <ILText role="bodySm" color={G.meta} style={{ marginTop: 14, fontSize: 12 }}>
          {item.cta}
        </ILText>
      )}
    </WhiteCard>
  );
}

function PrinciplesPane({ enrolled, onEnroll }) {
  return (
    <>
      <ILText role="title" color={G.ink} style={{ marginTop: 22, fontFamily: IL_FONTS.display, fontSize: 24 }}>
        The 27 Principles
      </ILText>
      <ILText role="bodySm" color={G.meta} style={{ marginTop: 6 }}>
        {enrolled ? 'Three tracks, nothing locked' : '4 of 27 open — the Foundation Principles from the Masterclass'}
      </ILText>
      <WhiteCard style={{ marginTop: 14, borderRadius: 22, padding: 16 }}>
        <ILText role="eyebrow" color={G.cta} style={[af, { fontSize: 10 }]}>
          FOUNDATION TRACK
        </ILText>
        <ILText role="label" color={G.ink} style={{ marginTop: 6 }}>
          4 absorbed · 15%
        </ILText>
        <View style={{ marginTop: 10, height: 4, backgroundColor: G.mutedFill, borderRadius: 2 }}>
          <View style={{ width: '15%', height: 4, backgroundColor: G.cta, borderRadius: 2 }} />
        </View>
      </WhiteCard>
      <WhiteCard style={{ marginTop: 12, borderRadius: 22, overflow: 'hidden' }}>
        {PRINCIPLES_OPEN.map((p, i) => (
          <View
            key={p.n}
            style={{
              paddingHorizontal: 16,
              paddingVertical: 14,
              flexDirection: 'row',
              alignItems: 'center',
              borderTopWidth: i ? 1 : 0,
              borderTopColor: G.line,
            }}
          >
            <ILText role="display" color={G.cta} style={{ fontFamily: IL_FONTS.display, fontSize: 18, width: 36 }}>
              {p.n}
            </ILText>
            <View style={{ flex: 1 }}>
              <ILText role="label" color={G.ink}>
                {p.title}
              </ILText>
              <ILText role="bodySm" color={G.meta} style={{ marginTop: 2, fontSize: 12 }}>
                {p.sub}
              </ILText>
            </View>
            <ILText role="label" color={G.cta} style={{ fontSize: 12 }}>
              {p.state}
            </ILText>
          </View>
        ))}
      </WhiteCard>
      {!enrolled ? (
        <>
          <WhiteCard style={{ marginTop: 12, borderRadius: 22, overflow: 'hidden' }}>
            {PRINCIPLES_LOCKED.map((p, i) => (
              <View
                key={p.n}
                style={{
                  paddingHorizontal: 16,
                  paddingVertical: 14,
                  flexDirection: 'row',
                  alignItems: 'center',
                  borderTopWidth: i ? 1 : 0,
                  borderTopColor: G.line,
                }}
              >
                <MaterialIcons name="lock" size={16} color={G.meta} />
                <ILText role="display" color={G.meta} style={{ fontFamily: IL_FONTS.display, fontSize: 16, width: 36, marginLeft: 8 }}>
                  {p.n}
                </ILText>
                <ILText role="label" color={G.meta} style={{ flex: 1 }}>
                  {p.title}
                </ILText>
              </View>
            ))}
            <View style={{ paddingHorizontal: 16, paddingVertical: 14, borderTopWidth: 1, borderTopColor: G.line }}>
              <ILText role="label" color={G.ink}>
                19 more across Influence & Command
              </ILText>
            </View>
          </WhiteCard>
          <View style={{ marginTop: 18 }}>
            <RedCta label="Complete enrollment" onPress={onEnroll} />
          </View>
        </>
      ) : null}
    </>
  );
}

function CasesPane({ enrolled, onEnroll }) {
  return (
    <>
      <ILText role="title" color={G.ink} style={{ marginTop: 22, fontFamily: IL_FONTS.display, fontSize: 24 }}>
        Case studies
      </ILText>
      <ILText role="bodySm" color={G.meta} style={{ marginTop: 6 }}>
        {enrolled ? '9 open, filtered by function' : '1 free preview · 8 locked inside the cohort'}
      </ILText>
      <WhiteCard style={{ marginTop: 14, borderRadius: 22, padding: 16 }}>
        <SoftChip>Free preview</SoftChip>
        <ILText
          role="title"
          color={G.ink}
          style={{ marginTop: 10, fontFamily: IL_FONTS.display, fontSize: 20, lineHeight: 26 }}
        >
          From Senior Manager to CXO in 14 months
        </ILText>
        <ILText role="bodySm" color={G.meta} style={{ marginTop: 8, fontSize: 13, lineHeight: 18 }}>
          One free case plays in full. Named companies and real numbers stay in the cohort room.
        </ILText>
      </WhiteCard>
      {!enrolled ? (
        <>
          <ILText role="title" color={G.ink} style={{ marginTop: 22, fontFamily: IL_FONTS.display, fontSize: 20 }}>
            Cohort only
          </ILText>
          <WhiteCard style={{ marginTop: 12, borderRadius: 22, overflow: 'hidden' }}>
            {LEARN_CASES_LOCKED.map((title, i) => (
              <View
                key={title}
                style={{
                  paddingHorizontal: 16,
                  paddingVertical: 14,
                  flexDirection: 'row',
                  alignItems: 'center',
                  borderTopWidth: i ? 1 : 0,
                  borderTopColor: G.line,
                }}
              >
                <MaterialIcons name="lock" size={16} color={G.meta} />
                <ILText role="label" color={G.meta} style={{ marginLeft: 10, flex: 1 }}>
                  {title}
                </ILText>
              </View>
            ))}
          </WhiteCard>
          <WhiteCard style={{ marginTop: 12, borderRadius: 22, padding: 16 }}>
            <ILText role="label" color={G.ink}>
              Why cases stay inside the cohort
            </ILText>
            <ILText role="bodySm" color={G.meta} style={{ marginTop: 6, fontSize: 13, lineHeight: 18 }}>
              Named companies, real numbers, one room only.
            </ILText>
          </WhiteCard>
          <View style={{ marginTop: 18 }}>
            <RedCta label="Complete enrollment" onPress={onEnroll} />
          </View>
        </>
      ) : null}
    </>
  );
}

function EventsPane({ enrolled, onEnroll, onTicket }) {
  return (
    <>
      <ILText role="title" color={G.ink} style={{ marginTop: 22, fontFamily: IL_FONTS.display, fontSize: 24 }}>
        Events
      </ILText>
      <ILText role="bodySm" color={G.meta} style={{ marginTop: 6 }}>
        {enrolled ? 'Cohort rooms unlocked' : 'Public events open · cohort rooms locked'}
      </ILText>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginTop: 14 }}>
        <View style={{ flexDirection: 'row' }}>
          {LEARN_CITIES.map((city, i) => (
            <View
              key={city}
              style={{
                marginRight: 8,
                paddingHorizontal: 14,
                paddingVertical: 8,
                borderRadius: 999,
                backgroundColor: i === 0 ? G.dark : G.white,
                borderWidth: 1,
                borderColor: i === 0 ? G.dark : G.line,
              }}
            >
              <ILText role="label" color={i === 0 ? '#FFFFFF' : G.ink} style={{ fontSize: 12 }}>
                {city}
              </ILText>
            </View>
          ))}
        </View>
      </ScrollView>
      <ILText role="eyebrow" color={G.meta} style={[af, { marginTop: 20, fontSize: 10 }]}>
        OPEN TO EVERY MEMBER
      </ILText>
      {LEARN_EVENTS_OPEN.map((item) => (
        <WhiteCard key={item.title} style={{ marginTop: 10, borderRadius: 22, padding: 16 }} onPress={onTicket}>
          <ILText role="label" color={G.ink}>
            {item.title}
          </ILText>
          <ILText role="bodySm" color={G.meta} style={{ marginTop: 4, fontSize: 12 }}>
            {item.meta}
          </ILText>
        </WhiteCard>
      ))}
      {!enrolled ? (
        <>
          <ILText role="eyebrow" color={G.meta} style={[af, { marginTop: 22, fontSize: 10 }]}>
            LOCKED COHORT ROOMS
          </ILText>
          {LEARN_EVENTS_LOCKED.map((item) => (
            <WhiteCard key={item.title} style={{ marginTop: 10, borderRadius: 22, padding: 16, flexDirection: 'row' }}>
              <MaterialIcons name="lock" size={16} color={G.meta} />
              <View style={{ marginLeft: 10, flex: 1 }}>
                <ILText role="label" color={G.meta}>
                  {item.title}
                </ILText>
                <ILText role="bodySm" color={G.meta} style={{ marginTop: 4, fontSize: 12 }}>
                  {item.meta}
                </ILText>
              </View>
            </WhiteCard>
          ))}
          <WhiteCard style={{ marginTop: 16, borderRadius: 22, padding: 16 }}>
            <ILText role="label" color={G.ink}>
              Complete enrollment by 15 Sep
            </ILText>
            <ILText role="bodySm" color={G.meta} style={{ marginTop: 6, fontSize: 13 }}>
              To keep the held seat and open Day 1, Day 2 and Thursday Circle.
            </ILText>
          </WhiteCard>
          <View style={{ marginTop: 18 }}>
            <RedCta label="Complete enrollment" onPress={onEnroll} />
          </View>
        </>
      ) : null}
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

function EnrolledForYou({ onTicket }) {
  const [city, setCity] = useState('Pune');
  return (
    <>
      <View style={{ marginTop: 18, height: 278, borderRadius: 28, overflow: 'hidden', backgroundColor: G.dark, padding: 18 }}>
        <View
          style={{
            alignSelf: 'flex-start',
            backgroundColor: 'rgba(255,255,255,0.12)',
            borderRadius: 999,
            paddingHorizontal: 10,
            paddingVertical: 5,
            flexDirection: 'row',
            alignItems: 'center',
          }}
        >
          <View style={{ width: 6, height: 6, borderRadius: 3, backgroundColor: G.cta, marginRight: 6 }} />
          <ILText role="eyebrow" color="#FFFFFF" style={[af, { fontSize: 9, letterSpacing: 0.7 }]}>
            FEATURED MASTERCLASS
          </ILText>
        </View>
        <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
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
        <ILText role="eyebrow" color="rgba(255,255,255,0.55)" style={[af, { fontSize: 10, alignSelf: 'flex-end' }]}>
          28 mins · Live case
        </ILText>
        <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 10 }}>
          <MaterialIcons name="star" size={12} color={G.cta} />
          <ILText role="eyebrow" color={G.cta} style={[af, { marginLeft: 4, fontSize: 9, letterSpacing: 0.6 }]}>
            TARGETED RECOMMENDATION
          </ILText>
        </View>
        <ILText
          role="title"
          color="#FFFFFF"
          style={{ marginTop: 8, fontFamily: IL_FONTS.display, fontSize: 24, lineHeight: 30 }}
        >
          Picked for women in Technology in Bengaluru
        </ILText>
        <ILText role="bodySm" color="rgba(255,255,255,0.7)" style={{ marginTop: 6, fontSize: 13 }}>
          Overcoming the engineering-to-VP ceiling: How senior women make the jump
        </ILText>
      </View>

      <View style={{ marginTop: 26 }}>
        <SectionHead title="Continue watching" accent="2 in progress" />
      </View>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginTop: 12, marginHorizontal: -20 }}>
        <View style={{ flexDirection: 'row', paddingHorizontal: 20 }}>
          {LEARN_CONTINUE_ENR.map((item) => (
            <WhiteCard key={item.title} style={{ width: 248, marginRight: 12, borderRadius: 22, overflow: 'hidden' }}>
              <View style={{ height: 120, backgroundColor: G.dark }}>
                <Image source={HERO} style={{ width: '100%', height: '100%', opacity: 0.7 }} resizeMode="cover" />
                <View
                  style={{
                    position: 'absolute',
                    alignSelf: 'center',
                    top: 42,
                    width: 36,
                    height: 36,
                    borderRadius: 18,
                    backgroundColor: 'rgba(255,255,255,0.92)',
                    alignItems: 'center',
                    justifyContent: 'center',
                    left: '50%',
                    marginLeft: -18,
                  }}
                >
                  <MaterialIcons name="play-arrow" size={20} color={G.ink} />
                </View>
                {item.left ? (
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
                      {item.left}
                    </ILText>
                  </View>
                ) : null}
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
            <View style={{ width: 44, height: 44, borderRadius: 22, overflow: 'hidden', backgroundColor: G.dark }}>
              <Image source={FACE} style={{ width: 44, height: 44 }} />
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
      <WhiteCard style={{ marginTop: 12, borderRadius: 22, padding: 16 }} onPress={onTicket}>
        <View style={{ flexDirection: 'row' }}>
          <View
            style={{
              width: 56,
              borderRadius: 16,
              backgroundColor: G.dark,
              alignItems: 'center',
              paddingVertical: 8,
            }}
          >
            <ILText role="eyebrow" color="#FFFFFF" style={[af, { fontSize: 9 }]}>
              {LEARN_EVENT_ENR.mon}
            </ILText>
            <ILText role="title" color="#FFFFFF" style={{ fontFamily: IL_FONTS.display, fontSize: 20, lineHeight: 24 }}>
              {LEARN_EVENT_ENR.day}
            </ILText>
            <ILText role="eyebrow" color="rgba(255,255,255,0.6)" style={[af, { fontSize: 8 }]}>
              {LEARN_EVENT_ENR.dow}
            </ILText>
          </View>
          <View style={{ flex: 1, marginLeft: 12 }}>
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <MaterialIcons name="place" size={12} color={G.meta} />
              <ILText role="bodySm" color={G.meta} style={{ marginLeft: 4, fontSize: 12 }}>
                {LEARN_EVENT_ENR.place}
              </ILText>
            </View>
            <ILText
              role="title"
              color={G.ink}
              style={{ marginTop: 6, fontFamily: IL_FONTS.display, fontSize: 20, lineHeight: 26 }}
            >
              {LEARN_EVENT_ENR.title}
            </ILText>
            <ILText role="bodySm" color={G.meta} style={{ marginTop: 4, fontSize: 13 }}>
              {LEARN_EVENT_ENR.sub}
            </ILText>
          </View>
        </View>
        <View style={{ marginTop: 14, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
            {[0, 1, 2].map((i) => (
              <Image
                key={i}
                source={FACE}
                style={{
                  width: 24,
                  height: 24,
                  borderRadius: 12,
                  marginLeft: i ? -8 : 0,
                  borderWidth: 2,
                  borderColor: G.white,
                }}
              />
            ))}
            <ILText role="bodySm" color={G.meta} style={{ marginLeft: 8, fontSize: 12 }}>
              {LEARN_EVENT_ENR.who}
            </ILText>
          </View>
          <View style={{ backgroundColor: G.cta, borderRadius: 999, paddingHorizontal: 14, paddingVertical: 8 }}>
            <ILText role="label" color="#FFFFFF" style={{ fontSize: 12 }}>
              RSVP
            </ILText>
          </View>
        </View>
      </WhiteCard>

      <WhiteCard style={{ marginTop: 16, borderRadius: 22, padding: 16, borderLeftWidth: 3, borderLeftColor: G.cta }}>
        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
          <GuideFace size={44} />
          <View style={{ marginLeft: 12, flex: 1 }}>
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <ILText role="label" color={G.ink} style={{ fontSize: 13 }}>
                IL Guide’s Whisper
              </ILText>
              <ILText role="bodySm" color={G.meta} style={{ marginLeft: 6, fontSize: 12 }}>
                · Executive Mentor
              </ILText>
            </View>
            <ILText
              role="title"
              color={G.ink}
              style={{ marginTop: 8, fontFamily: IL_FONTS.display, fontSize: 18, lineHeight: 24 }}
            >
              “{LEARN_WHISPER_ENR}”
            </ILText>
          </View>
        </View>
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', marginTop: 14 }}>
          {LEARN_CITIES_ENR.map((c) => (
            <Pressable
              key={c}
              onPress={() => setCity(c)}
              style={{
                marginRight: 8,
                marginTop: 6,
                paddingHorizontal: 12,
                paddingVertical: 6,
                borderRadius: 999,
                backgroundColor: city === c ? G.dark : G.white,
                borderWidth: 1,
                borderColor: city === c ? G.dark : G.line,
              }}
            >
              <ILText role="label" color={city === c ? '#FFFFFF' : G.ink} style={{ fontSize: 12 }}>
                {c}
              </ILText>
            </Pressable>
          ))}
        </View>
      </WhiteCard>
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

function PrinciplesEnrolled({ onResume }) {
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
          Foundation closed on 12 Sep · Influence opening with Day 1
        </ILText>
      </WhiteCard>

      <ILText role="eyebrow" color={G.cta} style={[af, { marginTop: 22, fontSize: 10, textAlign: 'center' }]}>
        FOUNDATION · 01–09
      </ILText>
      {PRINCIPLES_FOUND_ENR.map((p) => (
        <WhiteCard key={p.n} style={{ marginTop: 10, borderRadius: 22, padding: 16, flexDirection: 'row', alignItems: 'center' }}>
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
        <WhiteCard key={p.n} style={{ marginTop: 10, borderRadius: 22, padding: 16, flexDirection: 'row', alignItems: 'center' }}>
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
        title="Principle 10 · Negotiating from the seat you want"
        body="18 minutes. Finish before Saturday and you walk into Day 1 current."
        cta="Resume principle 10 →"
        onPress={onResume}
      />
    </>
  );
}

function CasesEnrolled({ onMark }) {
  const [fn, setFn] = useState('Technology');
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
          9 cases
        </ILText>
      </View>
      <View style={{ marginTop: 12, height: 220, borderRadius: 24, overflow: 'hidden', backgroundColor: G.dark }}>
        <Image source={HERO} style={{ width: '100%', height: '100%', opacity: 0.45 }} resizeMode="cover" />
        <View style={{ position: 'absolute', left: 16, right: 16, top: 16, flexDirection: 'row', justifyContent: 'space-between' }}>
          <View style={{ backgroundColor: G.cta, borderRadius: 999, paddingHorizontal: 10, paddingVertical: 5 }}>
            <ILText role="eyebrow" color="#FFFFFF" style={[af, { fontSize: 9 }]}>
              {fn.toUpperCase()}
            </ILText>
          </View>
          <ILText role="eyebrow" color="#FFFFFF" style={[af, { fontSize: 10 }]}>
            31 mins
          </ILText>
        </View>
        <View
          style={{
            position: 'absolute',
            top: 82,
            left: '50%',
            marginLeft: -28,
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
        <View style={{ position: 'absolute', left: 16, right: 16, bottom: 16 }}>
          <ILText
            role="title"
            color="#FFFFFF"
            style={{ fontFamily: IL_FONTS.display, fontSize: 22, lineHeight: 28 }}
          >
            Cybersecurity Is Not an IT Function. It Is a Business Responsibility.
          </ILText>
          <ILText role="bodySm" color="rgba(255,255,255,0.7)" style={{ marginTop: 6, fontSize: 12 }}>
            Board perspective · Security & Risk
          </ILText>
        </View>
      </View>
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
          {CASES_MORE_ENR.map((item) => (
            <WhiteCard key={item.title} style={{ width: 220, marginRight: 12, borderRadius: 20, overflow: 'hidden' }}>
              <View style={{ height: 110, backgroundColor: G.dark }}>
                <Image source={HERO} style={{ width: '100%', height: '100%', opacity: 0.55 }} resizeMode="cover" />
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
                    {item.time}
                  </ILText>
                </View>
              </View>
              <View style={{ padding: 12 }}>
                <ILText role="eyebrow" color={G.cta} style={[af, { fontSize: 9 }]}>
                  {item.tag}
                </ILText>
                <ILText role="label" color={G.ink} style={{ marginTop: 6, fontSize: 13 }} numberOfLines={3}>
                  {item.title}
                </ILText>
                <ILText role="bodySm" color={G.meta} style={{ marginTop: 4, fontSize: 11 }}>
                  {item.meta}
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
        kicker="BRING ONE TO DAY 2"
        title="Pick the case closest to your own ceiling"
        body="You’ll work it in your triad on Sunday. Choose before Saturday."
        cta="Mark a case for my triad →"
        onPress={onMark}
      />
    </>
  );
}

function EventsEnrolled({ onCal, onTriad, onTicket }) {
  return (
    <>
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
            <ILText role="eyebrow" color="#FFFFFF" style={[af, { fontSize: 9 }]}>
              4 DAYS TO LAUNCH
            </ILText>
          </View>
          <ILText role="bodySm" color="rgba(255,255,255,0.65)" style={{ fontSize: 12 }}>
            Live · Zoom
          </ILText>
        </View>
        <ILText
          role="display"
          color="#FFFFFF"
          style={{ marginTop: 16, fontFamily: IL_FONTS.display, fontSize: 28, lineHeight: 34 }}
        >
          Day 1 & Day 2
        </ILText>
        <ILText role="body" color="rgba(255,255,255,0.72)" style={{ marginTop: 8, fontSize: 14 }}>
          Sat 20 – Sun 21 Sep · 9:00 AM – 7:00 PM IST
        </ILText>
        <Pressable
          onPress={onCal}
          style={{
            marginTop: 16,
            backgroundColor: G.cta,
            borderRadius: 999,
            paddingVertical: 14,
            alignItems: 'center',
          }}
        >
          <ILText role="label" color="#FFFFFF">
            Add both days to calendar
          </ILText>
        </Pressable>
      </View>

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
          Near you · Bengaluru
        </ILText>
        <ILText role="label" color={G.cta} style={{ fontSize: 12 }}>
          Change city
        </ILText>
      </View>
      {EVENT_NEAR_ENR.map((item) => (
        <WhiteCard
          key={item.title}
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
              {item.mon}
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
          <View style={{ borderWidth: 1, borderColor: G.cta, borderRadius: 999, paddingHorizontal: 12, paddingVertical: 8 }}>
            <ILText role="label" color={G.cta} style={{ fontSize: 12 }}>
              {item.cta}
            </ILText>
          </View>
        </WhiteCard>
      ))}

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

function StoriesEnrolled({ onHow }) {
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
      <WhiteCard style={{ marginTop: 12, borderRadius: 24, overflow: 'hidden' }}>
        <View style={{ height: 160, backgroundColor: G.dark }}>
          <Image source={HERO} style={{ width: '100%', height: '100%', opacity: 0.6 }} resizeMode="cover" />
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
          <View
            style={{
              position: 'absolute',
              right: 14,
              bottom: 14,
              backgroundColor: '#111',
              borderRadius: 6,
              paddingHorizontal: 6,
              paddingVertical: 2,
            }}
          >
            <ILText role="eyebrow" color="#FFFFFF" style={[af, { fontSize: 8 }]}>
              3:40
            </ILText>
          </View>
        </View>
        <View style={{ padding: 16 }}>
          <ILText role="title" color={G.ink} style={{ fontFamily: IL_FONTS.display, fontSize: 22, lineHeight: 28 }}>
            What changed after my first 30 days
          </ILText>
          <ILText role="bodySm" color={G.meta} style={{ marginTop: 6, fontSize: 13 }}>
            Anjali K. · Product
          </ILText>
        </View>
      </WhiteCard>

      <View style={{ marginTop: 22, flexDirection: 'row', alignItems: 'flex-end' }}>
        <ILText role="title" color={G.ink} style={{ flex: 1, fontFamily: IL_FONTS.display, fontSize: 22 }}>
          From women in Technology
        </ILText>
        <ILText role="label" color={G.cta} style={{ fontSize: 12 }}>
          See all
        </ILText>
      </View>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginTop: 12, marginHorizontal: -20 }}>
        <View style={{ flexDirection: 'row', paddingHorizontal: 20 }}>
          {STORIES_FUNC_ENR.map((item) => (
            <WhiteCard key={item.title} style={{ width: 200, marginRight: 12, borderRadius: 20, overflow: 'hidden' }}>
              <View style={{ height: 110, backgroundColor: G.dark }}>
                <Image source={HERO} style={{ width: '100%', height: '100%', opacity: 0.55 }} resizeMode="cover" />
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
                    {item.time}
                  </ILText>
                </View>
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

import React, { useState } from 'react';
import { Image, Pressable as RNPressable, ScrollView, View } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialIcons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { IL_FONTS } from '../../constants/ironLadyBrand';
import ILText from '../../components/il/ILText';
import GuestHeader from '../../components/il/GuestHeader';
import { G, af } from '../../constants/guestTheme';
import {
  FindCta,
  Page,
  PillRow,
  PinkDisc,
  SectionHead,
  StatNum,
  WhiteCard,
  fillAbs,
} from './GuestBits';
import { LIQUID_TAB_PAD } from '../../components/il/LiquidTabBar';
import Pressable from '../../components/il/Press';
import { useGuestActions } from './useGuestActions';
import { CoverThumb } from '../lep/LepBits';
import { CSUITE_HOME, EPISODES, HERO, WINS } from './guestData';
import { useGlassHeaderPad } from '../../components/il/GlassHeader';

const TABS = ['Podcast', 'Events', 'C-suite'];
const CITIES = ['Bengaluru', 'Mumbai', 'Pune', 'Hyderabad'];

export default function GuestEngageScreen() {
  const insets = useSafeAreaInsets();
  const headerPad = useGlassHeaderPad();
  const { findRegistration, goWatch } = useGuestActions();
  const [tab, setTab] = useState('Podcast');
  const [city, setCity] = useState('Bengaluru');

  return (
    <Page>
      <StatusBar style="dark" />
      <GuestHeader floating />
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{
          paddingHorizontal: 20,
          paddingTop: headerPad + 18,
          paddingBottom: LIQUID_TAB_PAD + Math.max(insets.bottom, 8),
        }}
      >
        <ILText role="eyebrow" color={G.cta} style={[af, { fontSize: 11, letterSpacing: 1.2 }]}>
          The Iron Lady Army
        </ILText>
        <ILText
          role="display"
          color={G.ink}
          style={{ marginTop: 8, fontFamily: IL_FONTS.display, fontSize: 32, lineHeight: 38, letterSpacing: -0.6 }}
        >
          Listen. Show up. Learn{'\n'}from the top.
        </ILText>
        <ILText role="body" color={G.meta} style={{ marginTop: 10, fontSize: 15, lineHeight: 22 }}>
          Free for everyone — the podcast, events near you, and conversations with women at the top table.
        </ILText>

        <View style={{ marginTop: 18 }}>
          <WhiteCard style={{ borderRadius: 999, padding: 4, flexDirection: 'row' }}>
            {TABS.map((item) => {
              const on = item === tab;
              return (
                <Pressable
                  key={item}
                  onPress={() => setTab(item)}
                  style={{
                    flex: 1,
                    paddingVertical: 10,
                    borderRadius: 999,
                    backgroundColor: on ? G.dark : 'transparent',
                    alignItems: 'center',
                  }}
                >
                  <ILText role="label" color={on ? '#FFFFFF' : G.ink} style={[af, { fontSize: 13 }]}>
                    {item}
                  </ILText>
                </Pressable>
              );
            })}
          </WhiteCard>
        </View>

        <View
          style={{
            marginTop: 16,
            backgroundColor: G.dark,
            borderRadius: 22,
            paddingVertical: 18,
            flexDirection: 'row',
          }}
        >
          {[
            ['78,000', 'women chose\nstrategy over\nstruggle'],
            ['★ 4.9', 'rating'],
            ['3', 'flagship programs'],
          ].map(([n, l], i) => (
            <View
              key={n}
              style={{
                flex: 1,
                alignItems: 'center',
                borderLeftWidth: i ? 1 : 0,
                borderLeftColor: 'rgba(255,255,255,0.12)',
                paddingHorizontal: 8,
              }}
            >
              <StatNum color="#FFFFFF" size={22}>
                {n}
              </StatNum>
              <ILText
                role="bodySm"
                color="rgba(255,255,255,0.65)"
                align="center"
                style={{ marginTop: 4, fontSize: 11, lineHeight: 15 }}
              >
                {l}
              </ILText>
            </View>
          ))}
        </View>

        {tab === 'Podcast' ? <PodcastPane goWatch={goWatch} /> : null}
        {tab === 'Events' ? <EventsPane city={city} setCity={setCity} /> : null}
        {tab === 'C-suite' ? <CsuitePane goWatch={goWatch} /> : null}

        <FindCta
          title="78,000 women, one door in"
          body="Find your registration and the batch circle, chapter events and closed-door triads open up."
          onPress={findRegistration}
        />
      </ScrollView>
    </Page>
  );
}

function PodcastPane({ goWatch }) {
  return (
    <>
        <View style={{ marginTop: 28 }}>
          <SectionHead title="Women winning, this week" />
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginTop: 4 }}>
            <ILText role="bodySm" color={G.meta} style={{ fontSize: 12 }}>
              Real wins
            </ILText>
            <ILText role="label" color={G.cta} style={{ fontSize: 12 }}>
              See all
            </ILText>
          </View>
          <WhiteCard style={{ marginTop: 12, borderRadius: 22, paddingVertical: 6, paddingHorizontal: 4 }}>
            {WINS.map((w, i) => (
              <View
                key={w.title}
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  paddingVertical: 12,
                  paddingHorizontal: 12,
                  borderTopWidth: i ? 1 : 0,
                  borderTopColor: G.line,
                }}
              >
                <PinkDisc name={w.icon} size={36} />
                <View style={{ flex: 1, marginLeft: 12 }}>
                  <ILText role="label" color={G.ink} style={{ fontSize: 14, lineHeight: 19 }}>
                    {w.title}
                  </ILText>
                  <ILText role="bodySm" color={G.meta} style={{ marginTop: 2, fontSize: 12 }}>
                    {w.sub}
                  </ILText>
                </View>
              </View>
            ))}
          </WhiteCard>
        </View>

        <View style={{ marginTop: 28 }}>
          <SectionHead title="Iron Lady Speaks" />
          <ILText role="bodySm" color={G.meta} style={{ marginTop: 4, fontSize: 12 }}>
            The official podcast · hosted by Rajesh Bhat
          </ILText>
          <View style={{ marginTop: 14, borderRadius: 24, overflow: 'hidden', backgroundColor: G.dark }}>
            <View style={{ aspectRatio: 16 / 9 }}>
              <CoverThumb source={EPISODES[0].img} play />
            </View>
            <View style={{ padding: 16, backgroundColor: G.dark }}>
              <Pressable
                onPress={() =>
                  goWatch?.({
                    assetKey: EPISODES[0].assetKey,
                    title: EPISODES[0].title,
                    sub: EPISODES[0].person,
                  })
                }
                style={{
                  backgroundColor: G.cta,
                  borderRadius: 999,
                  paddingVertical: 13,
                  alignItems: 'center',
                  flexDirection: 'row',
                  justifyContent: 'center',
                }}
              >
                <MaterialIcons name="play-arrow" size={18} color="#FFFFFF" />
                <ILText role="label" color="#FFFFFF" style={{ marginLeft: 4 }}>
                  Play episode
                </ILText>
              </Pressable>
            </View>
          </View>

          <WhiteCard style={{ marginTop: 12, borderRadius: 22, paddingVertical: 6 }}>
            {EPISODES.slice(1).map((e, i) => (
              <Pressable
                key={e.title}
                onPress={() => goWatch?.({ assetKey: e.assetKey, title: e.title, sub: e.person })}
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  paddingHorizontal: 12,
                  paddingVertical: 12,
                  borderTopWidth: i ? 1 : 0,
                  borderTopColor: G.line,
                }}
              >
                <View style={{ width: 72, height: 40, borderRadius: 10, overflow: 'hidden', backgroundColor: G.dark }}>
                  <CoverThumb source={e.img} />
                </View>
                <View style={{ flex: 1, marginHorizontal: 12 }}>
                  <ILText role="label" color={G.ink} style={{ fontSize: 13, lineHeight: 18 }}>
                    {e.title}
                  </ILText>
                  <ILText role="bodySm" color={G.meta} style={{ marginTop: 3, fontSize: 11 }}>
                    {e.person}
                  </ILText>
                  <ILText role="label" color={G.cta} style={{ marginTop: 3, fontSize: 12 }}>
                    {e.min}
                  </ILText>
                </View>
                <View
                  style={{
                    width: 36,
                    height: 36,
                    borderRadius: 18,
                    borderWidth: 1,
                    borderColor: G.line,
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <MaterialIcons name="play-arrow" size={18} color={G.ink} />
                </View>
              </Pressable>
            ))}
          </WhiteCard>
          <ILText
            role="bodySm"
            color={G.meta}
            align="center"
            style={{ marginTop: 12, fontSize: 12 }}
          >
            Also on Apple Podcasts, Amazon Music and iHeart
          </ILText>
        </View>
    </>
  );
}

function EventsPane({ city, setCity }) {
  return (
    <>
        <View style={{ marginTop: 28 }}>
          <SectionHead title="Events" accent="All events" />
          <ILText role="bodySm" color={G.meta} style={{ marginTop: 4, fontSize: 12 }}>
            In person and online · open to everyone
          </ILText>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginTop: 14 }}>
            <PillRow items={CITIES} value={city} onChange={setCity} />
          </ScrollView>

          <View style={{ marginTop: 14, borderRadius: 24, overflow: 'hidden' }}>
            <View style={{ minHeight: 300 }}>
              <Image source={HERO} style={fillAbs} resizeMode="cover" />
              <LinearGradient colors={['rgba(17,55,68,0.15)', 'rgba(10,32,40,0.94)']} style={fillAbs} />
              <View style={{ padding: 18, minHeight: 300, justifyContent: 'flex-end' }}>
                <View
                  style={{
                    alignSelf: 'flex-start',
                    backgroundColor: G.cta,
                    borderRadius: 999,
                    paddingHorizontal: 10,
                    paddingVertical: 5,
                    marginBottom: 12,
                  }}
                >
                  <ILText role="eyebrow" color="#FFFFFF" style={[af, { fontSize: 9 }]}>
                    Flagship · Walk to the Board
                  </ILText>
                </View>
                <ILText
                  role="title"
                  color="#FFFFFF"
                  style={{ fontFamily: IL_FONTS.display, fontSize: 26, lineHeight: 32 }}
                >
                  Bold Steps. Big Stories. Bigger Leaders.
                </ILText>
                <ILText
                  role="bodySm"
                  color="rgba(255,255,255,0.75)"
                  style={{ marginTop: 8, fontSize: 13, lineHeight: 19 }}
                >
                  India’s largest women’s leadership movement · Aug 2026 · 1,000+ women across 6 cities
                </ILText>
                <View style={{ flexDirection: 'row', marginTop: 16 }}>
                  {[
                    ['1,000+', 'women'],
                    ['6', 'cities'],
                    ['191', '₹1Cr+ earners'],
                  ].map((s) => (
                    <View
                      key={s[1]}
                      style={{
                        flex: 1,
                        marginRight: 8,
                        backgroundColor: 'rgba(255,255,255,0.08)',
                        borderRadius: 14,
                        paddingVertical: 10,
                        alignItems: 'center',
                      }}
                    >
                      <StatNum color="#FFFFFF" size={18}>
                        {s[0]}
                      </StatNum>
                      <ILText role="bodySm" color="rgba(255,255,255,0.65)" style={{ fontSize: 11 }}>
                        {s[1]}
                      </ILText>
                    </View>
                  ))}
                </View>
                <View style={{ flexDirection: 'row', marginTop: 14 }}>
                  <Pressable
                    style={{
                      flex: 1,
                      backgroundColor: G.cta,
                      borderRadius: 999,
                      paddingVertical: 13,
                      alignItems: 'center',
                      marginRight: 8,
                    }}
                  >
                    <ILText role="label" color="#FFFFFF">
                      Watch the recap
                    </ILText>
                  </Pressable>
                  <Pressable
                    style={{
                      paddingHorizontal: 18,
                      borderRadius: 999,
                      borderWidth: 1,
                      borderColor: 'rgba(255,255,255,0.5)',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    <ILText role="label" color="#FFFFFF">
                      Notify me
                    </ILText>
                  </Pressable>
                </View>
              </View>
            </View>
          </View>

          <ILText role="eyebrow" color={G.meta} style={[af, { marginTop: 18, fontSize: 10 }]}>
            Coming up
          </ILText>
          <EventRow
            stamp={['SEP', '27']}
            kicker="Chapter"
            title="Bengaluru Chapter meetup"
            meta="Sat 27 Sep · 6 PM · open to everyone"
            cta="RSVP"
          />
          <EventRow
            stamp={['WEEKLY', 'Tue']}
            kicker="Masterclass"
            title="Masterclass · live"
            meta="Tue 7 PM + Wed 6:30 PM · online"
            cta="Save seat"
          />
          <ILText role="eyebrow" color={G.meta} style={[af, { marginTop: 16, fontSize: 10 }]}>
            Past highlight
          </ILText>
          <EventRow
            stamp={['APR', '26']}
            kicker="Special"
            title="Winning Ways for Women with Indra Nooyi"
            meta="2025 · virtual · 117 women crossed ₹1 Cr"
            cta="Watch"
          />
        </View>
    </>
  );
}

function CsuitePane({ goWatch }) {
  return (
    <>
      <View style={{ marginTop: 28 }}>
        <SectionHead title="The C-suite experience" accent="See all" />
        <ILText role="bodySm" color={G.meta} style={{ marginTop: 4, fontSize: 12 }}>
          Learn from women at the top table
        </ILText>

        {CSUITE_HOME.map((c) => (
          <Pressable
            key={c.title}
            onPress={() => goWatch?.({ assetKey: c.assetKey, title: c.title, sub: c.who })}
            style={{ marginTop: 10 }}
          >
            <WhiteCard style={{ borderRadius: 20, overflow: 'hidden' }}>
              <View style={{ aspectRatio: 16 / 9, backgroundColor: G.dark }}>
                <CoverThumb source={c.img} play time={c.tag} />
              </View>
              <View style={{ padding: 14 }}>
                <ILText role="label" color={G.ink} style={{ fontSize: 14, lineHeight: 19 }}>
                  {c.title}
                </ILText>
                <ILText role="bodySm" color={G.meta} style={{ marginTop: 4, fontSize: 12 }}>
                  {c.who}
                </ILText>
              </View>
            </WhiteCard>
          </Pressable>
        ))}
      </View>
    </>
  );
}

function EventRow({ stamp, kicker, title, meta, cta }) {
  return (
    <WhiteCard
      style={{
        marginTop: 10,
        borderRadius: 20,
        padding: 14,
        flexDirection: 'row',
        alignItems: 'center',
      }}
    >
      <View
        style={{
          width: 52,
          borderRadius: 14,
          backgroundColor: G.pink,
          alignItems: 'center',
          paddingVertical: 8,
          marginRight: 12,
        }}
      >
        <ILText role="eyebrow" color={G.cta} style={[af, { fontSize: 8 }]}>
          {stamp[0]}
        </ILText>
        <ILText role="title" color={G.ink} style={{ fontFamily: IL_FONTS.display, fontSize: 16, lineHeight: 20 }}>
          {stamp[1]}
        </ILText>
      </View>
      <View style={{ flex: 1 }}>
        <ILText role="eyebrow" color={G.cta} style={[af, { fontSize: 9 }]}>
          {kicker}
        </ILText>
        <ILText role="label" color={G.ink} style={{ marginTop: 2, fontSize: 14 }}>
          {title}
        </ILText>
        <ILText role="bodySm" color={G.meta} style={{ marginTop: 2, fontSize: 12 }}>
          {meta}
        </ILText>
      </View>
      <View
        style={{
          borderWidth: 1,
          borderColor: G.cta,
          borderRadius: 999,
          paddingHorizontal: 12,
          paddingVertical: 7,
        }}
      >
        <ILText role="label" color={G.cta} style={{ fontSize: 12 }}>
          {cta}
        </ILText>
      </View>
    </WhiteCard>
  );
}

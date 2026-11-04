import React, { useEffect, useState } from 'react';
import { Pressable, ScrollView, View } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { MaterialIcons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { IL_FONTS } from '../../constants/ironLadyBrand';
import ILText from '../../components/il/ILText';
import { G, af } from '../../constants/guestTheme';
import { GuestBackBar, Page, StatNum, WhiteCard } from './GuestBits';
import { LIQUID_TAB_PAD } from '../../components/il/LiquidTabBar';
import { guestGreetingFirstName } from '../../services/appGuest';
import {
  dayState,
  doneCount,
  nextDay,
  opensLabel,
  startChallenge,
  useGuestChallenge,
} from '../../services/guestChallenge';
import { CHALLENGE_DAYS_CONTENT, CHALLENGE_LENGTH } from './challengeContent';

export default function GuestChallengeHubScreen({ navigation }) {
  const insets = useSafeAreaInsets();
  const { progress, ready, now } = useGuestChallenge();
  const [name, setName] = useState('');

  useEffect(() => {
    guestGreetingFirstName().then(setName).catch(() => {});
  }, []);

  const done = doneCount(progress);
  const finished = done >= CHALLENGE_LENGTH;
  const focusN = nextDay(progress, now) || CHALLENGE_LENGTH;
  const focus = CHALLENGE_DAYS_CONTENT[focusN - 1];
  const focusState = dayState(progress, focusN, now);

  const openDay = async (n) => {
    if (!progress.startedAt) await startChallenge();
    navigation.navigate('ChallengeDay', { day: n });
  };

  return (
    <Page>
      <StatusBar style="dark" />
      <View style={{ paddingTop: Math.max(insets.top, 8) }}>
        <GuestBackBar
          title="The 4-Day Challenge"
          sub={finished ? 'Complete' : `${done} of ${CHALLENGE_LENGTH} days done`}
          onBack={() => navigation.goBack()}
        />
      </View>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{
          paddingHorizontal: 20,
          paddingBottom: LIQUID_TAB_PAD + Math.max(insets.bottom, 8),
        }}
      >
        <ILText role="eyebrow" color={G.cta} style={[af, { fontSize: 11 }]}>
          {progress.startedAt ? `You’re in${name ? `, ${name}` : ''}.` : `Welcome${name ? `, ${name}` : ''}.`}
        </ILText>
        <ILText
          role="display"
          color={G.ink}
          style={{ marginTop: 8, fontFamily: IL_FONTS.display, fontSize: 30, lineHeight: 36, letterSpacing: -0.5 }}
        >
          Four days. Four principles. One Leadership Card.
        </ILText>
        <ILText role="bodySm" color={G.meta} style={{ marginTop: 8, fontSize: 13, lineHeight: 19 }}>
          From the Iron Lady Masterclass. About 15 minutes a day. A new day opens each morning, and
          every day stays open once it does.
        </ILText>

        {/* Progress: one segment per day — filled when done, so a skipped day shows as a gap. */}
        <View style={{ flexDirection: 'row', marginTop: 16 }}>
          {CHALLENGE_DAYS_CONTENT.map((d, i) => {
            const st = dayState(progress, d.n, now);
            return (
              <View
                key={d.n}
                style={{
                  flex: 1,
                  height: 4,
                  borderRadius: 2,
                  marginRight: i < CHALLENGE_LENGTH - 1 ? 6 : 0,
                  backgroundColor: G.cta,
                  opacity: st === 'done' ? 1 : st === 'open' ? 0.45 : 0.15,
                }}
              />
            );
          })}
        </View>

        {finished ? (
          <View style={{ marginTop: 18, backgroundColor: G.dark, borderRadius: 24, padding: 20 }}>
            <ILText role="eyebrow" color={G.pink} style={[af, { fontSize: 10 }]}>
              All four days done
            </ILText>
            <ILText
              role="title"
              color="#FFFFFF"
              style={{ marginTop: 10, fontFamily: IL_FONTS.display, fontSize: 24, lineHeight: 30 }}
            >
              Your Leadership Card is ready.
            </ILText>
            <Pressable
              onPress={() => navigation.navigate('ChallengeDone')}
              style={{
                marginTop: 16,
                backgroundColor: G.cta,
                borderRadius: 999,
                paddingVertical: 13,
                alignItems: 'center',
                flexDirection: 'row',
                justifyContent: 'center',
              }}
            >
              <ILText role="label" color="#FFFFFF">
                See my card
              </ILText>
              <MaterialIcons name="arrow-forward" size={16} color="#FFFFFF" style={{ marginLeft: 6 }} />
            </Pressable>
          </View>
        ) : (
          <View style={{ marginTop: 18, backgroundColor: G.dark, borderRadius: 24, padding: 20 }}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
              <View style={{ backgroundColor: G.cta, borderRadius: 999, paddingHorizontal: 10, paddingVertical: 4 }}>
                <ILText role="eyebrow" color="#FFFFFF" style={[af, { fontSize: 9 }]}>
                  Day {focusN} · {focusState === 'locked' ? 'Next' : 'Open now'}
                </ILText>
              </View>
              {focusState === 'locked' ? (
                <ILText role="bodySm" color="rgba(255,255,255,0.7)" style={{ fontSize: 12 }}>
                  {opensLabel(progress, focusN, now)}
                </ILText>
              ) : null}
            </View>
            <ILText
              role="title"
              color="#FFFFFF"
              style={{ marginTop: 14, fontFamily: IL_FONTS.display, fontSize: 24, lineHeight: 30 }}
            >
              {focus.title}
            </ILText>
            <ILText role="bodySm" color="rgba(255,255,255,0.72)" style={{ marginTop: 8, fontSize: 13, lineHeight: 19 }}>
              {focus.intro}
            </ILText>
            {focusState !== 'locked' && ready ? (
              <Pressable
                onPress={() => openDay(focusN)}
                style={{
                  marginTop: 16,
                  backgroundColor: G.cta,
                  borderRadius: 999,
                  paddingVertical: 13,
                  alignItems: 'center',
                  flexDirection: 'row',
                  justifyContent: 'center',
                }}
              >
                <ILText role="label" color="#FFFFFF">
                  {progress.startedAt ? `Start Day ${focusN}` : 'Start the challenge'}
                </ILText>
                <MaterialIcons name="arrow-forward" size={16} color="#FFFFFF" style={{ marginLeft: 6 }} />
              </Pressable>
            ) : null}
          </View>
        )}

        <ILText role="eyebrow" color={G.meta} style={[af, { marginTop: 22, fontSize: 10 }]}>
          Your four days
        </ILText>
        {CHALLENGE_DAYS_CONTENT.map((d) => {
          const st = dayState(progress, d.n, now);
          const canOpen = st !== 'locked' && progress.startedAt;
          return (
            <Pressable key={d.n} disabled={!canOpen} onPress={() => openDay(d.n)}>
              <WhiteCard
                style={{
                  marginTop: 10,
                  borderRadius: 18,
                  padding: 14,
                  flexDirection: 'row',
                  alignItems: 'center',
                  opacity: st === 'locked' ? 0.7 : 1,
                }}
              >
                <View
                  style={{
                    width: 32,
                    height: 32,
                    borderRadius: 16,
                    backgroundColor: st === 'done' ? G.ink : '#EDE9D8',
                    alignItems: 'center',
                    justifyContent: 'center',
                    marginRight: 12,
                  }}
                >
                  {st === 'done' ? (
                    <MaterialIcons name="check" size={16} color="#FFFFFF" />
                  ) : (
                    <StatNum size={14} color={G.ink}>
                      {d.n}
                    </StatNum>
                  )}
                </View>
                <View style={{ flex: 1 }}>
                  <ILText role="label" color={G.ink} style={{ fontSize: 14 }}>
                    {d.title}
                  </ILText>
                  <ILText role="bodySm" color={G.meta} style={{ fontSize: 12 }}>
                    {st === 'done' ? 'Done · tap to look again' : st === 'open' ? d.short : opensLabel(progress, d.n, now)}
                  </ILText>
                </View>
                <MaterialIcons
                  name={st === 'locked' ? 'lock-outline' : 'chevron-right'}
                  size={st === 'locked' ? 16 : 20}
                  color={G.meta}
                />
              </WhiteCard>
            </Pressable>
          );
        })}

        {!finished && done > 0 ? (
          <Pressable onPress={() => navigation.navigate('ChallengeDone')} style={{ marginTop: 16, alignSelf: 'center' }}>
            <ILText role="label" color={G.cta} style={{ fontSize: 13 }}>
              See my Leadership Card so far →
            </ILText>
          </Pressable>
        ) : null}
      </ScrollView>
    </Page>
  );
}

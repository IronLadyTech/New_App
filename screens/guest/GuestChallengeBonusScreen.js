import React from 'react';
import { Pressable, ScrollView, View } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { MaterialIcons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { IL_FONTS } from '../../constants/ironLadyBrand';
import ILText from '../../components/il/ILText';
import { G, af } from '../../constants/guestTheme';
import { GuestBackBar, Page, WhiteCard } from './GuestBits';
import { LIQUID_TAB_PAD } from '../../components/il/LiquidTabBar';
import { doneCount, opensLabel, useGuestChallenge } from '../../services/guestChallenge';
import { CHALLENGE_LENGTH, composeBrand, dayContent, formatWorth } from './challengeContent';

/** What she wrote today, in one line, for the "on your card" confirmation. */
function todaysLine(n, a = {}) {
  if (n === 1) return a.bhag;
  if (n === 2) return [formatWorth(a.years), a.hidden].filter(Boolean).join(' · ');
  if (n === 3) return composeBrand(a);
  return a.ask;
}

/** The reward for submitting a day: that day's bonus, and what comes next. */
export default function GuestChallengeBonusScreen({ navigation, route }) {
  const insets = useSafeAreaInsets();
  const n = Number(route?.params?.day) || 1;
  const day = dayContent(n);
  const { progress, now } = useGuestChallenge();
  const mine = todaysLine(n, progress.answers?.[n]);
  const all = doneCount(progress) >= CHALLENGE_LENGTH;
  const next = n < CHALLENGE_LENGTH ? dayContent(n + 1) : null;

  return (
    <Page>
      <StatusBar style="dark" />
      <View style={{ paddingTop: Math.max(insets.top, 8) }}>
        <GuestBackBar title={`Day ${n} · done`} sub="Bonus unlocked" onBack={() => navigation.goBack()} />
      </View>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{
          paddingHorizontal: 20,
          paddingBottom: LIQUID_TAB_PAD + Math.max(insets.bottom, 8),
        }}
      >
        {mine ? (
          <WhiteCard style={{ borderRadius: 22, padding: 16, flexDirection: 'row', alignItems: 'flex-start' }}>
            <View
              style={{
                width: 28,
                height: 28,
                borderRadius: 14,
                backgroundColor: G.dark,
                alignItems: 'center',
                justifyContent: 'center',
                marginRight: 12,
                marginTop: 2,
              }}
            >
              <MaterialIcons name="check" size={16} color="#FFFFFF" />
            </View>
            <View style={{ flex: 1 }}>
              <ILText role="label" color={G.ink} style={{ fontSize: 15 }}>
                {day.cardLabel} is on your card.
              </ILText>
              <ILText
                role="body"
                color={G.meta}
                style={{ marginTop: 6, fontFamily: IL_FONTS.displayItalic, fontSize: 15, lineHeight: 22 }}
              >
                “{mine}”
              </ILText>
            </View>
          </WhiteCard>
        ) : null}

        <ILText role="eyebrow" color={G.cta} style={[af, { marginTop: 22, fontSize: 10, letterSpacing: 1.1 }]}>
          Your bonus
        </ILText>
        <ILText
          role="display"
          color={G.ink}
          style={{ marginTop: 8, fontFamily: IL_FONTS.display, fontSize: 30, lineHeight: 36, letterSpacing: -0.5 }}
        >
          {day.bonus.title}
        </ILText>
        {day.bonus.lines.map((l) => (
          <ILText key={l} role="body" color={G.body} style={{ marginTop: 12, fontSize: 15, lineHeight: 23 }}>
            {l}
          </ILText>
        ))}

        {next && !all ? (
          <>
            <ILText role="eyebrow" color={G.cta} style={[af, { marginTop: 26, fontSize: 10, letterSpacing: 1.1 }]}>
              Day {next.n} · {opensLabel(progress, next.n, now)}
            </ILText>
            <ILText
              role="title"
              color={G.ink}
              style={{ marginTop: 8, fontFamily: IL_FONTS.display, fontSize: 24, lineHeight: 30 }}
            >
              {next.title}
            </ILText>
          </>
        ) : null}

        <Pressable
          onPress={() => (all ? navigation.replace('ChallengeDone') : navigation.navigate('ChallengeHub'))}
          style={{
            marginTop: 24,
            backgroundColor: all ? G.cta : G.dark,
            borderRadius: 999,
            paddingVertical: 15,
            alignItems: 'center',
          }}
        >
          <ILText role="label" color="#FFFFFF">
            {all ? 'See my Leadership Card' : 'Back to my challenge'}
          </ILText>
        </Pressable>
      </ScrollView>
    </Page>
  );
}

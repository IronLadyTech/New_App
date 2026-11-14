import React, { useEffect, useState } from 'react';
import { Image, ScrollView, Share, View } from 'react-native';
import Pressable from '../../components/il/Press';
import { StatusBar } from 'expo-status-bar';
import { MaterialIcons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { IL_FONTS } from '../../constants/ironLadyBrand';
import ILText from '../../components/il/ILText';
import { G, af } from '../../constants/guestTheme';
import { GuestBackBar, Page } from './GuestBits';
import { LIQUID_TAB_PAD } from '../../components/il/LiquidTabBar';
import { useGuestActions } from './useGuestActions';
import { guestGreetingFirstName } from '../../services/appGuest';
import { doneCount, useGuestChallenge } from '../../services/guestChallenge';
import { CHALLENGE_LENGTH, composeBrand, formatWorth } from './challengeContent';

const LOGO = require('../../assets/il/logo.jpg');

/** The four lines of her card, from what she wrote on each day (empty until done). */
function cardLines(answers = {}) {
  const d1 = answers[1] || {};
  const d2 = answers[2] || {};
  const d3 = answers[3] || {};
  const d4 = answers[4] || {};
  return [
    { k: 'BHAG', v: d1.bhag, day: 1 },
    { k: 'Market worth', v: formatWorth(d2.years), day: 2 },
    { k: 'Brand statement', v: composeBrand(d3), day: 3 },
    { k: 'The ask', v: d4.ask, day: 4 },
  ].map((l) => ({ ...l, v: String(l.v || '').trim() }));
}

export default function GuestChallengeDoneScreen({ navigation }) {
  const insets = useSafeAreaInsets();
  const { goProgram } = useGuestActions();
  const { progress } = useGuestChallenge();
  const [name, setName] = useState('');

  useEffect(() => {
    guestGreetingFirstName().then(setName).catch(() => {});
  }, []);

  const done = doneCount(progress);
  const complete = done >= CHALLENGE_LENGTH;
  const lines = cardLines(progress.answers);

  const share = () => {
    const body = lines
      .filter((l) => l.v)
      .map((l) => `${l.k}: ${l.v}`)
      .join('\n');
    Share.share({
      message: `My Iron Lady Leadership Card${name ? ` · ${name}` : ''}\n\n${body}`,
    }).catch(() => {});
  };

  return (
    <Page>
      <StatusBar style="dark" />
      <View style={{ paddingTop: Math.max(insets.top, 8) }}>
        <GuestBackBar
          title={complete ? 'Challenge complete' : 'Your Leadership Card'}
          sub={`${done} of ${CHALLENGE_LENGTH} days`}
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
        <ILText
          role="eyebrow"
          color={G.cta}
          style={[af, { marginTop: 8, fontSize: 13, textAlign: 'center', letterSpacing: 0 }]}
        >
          {complete ? 'Four days. Done.' : 'Filling in as you go'}
        </ILText>
        <ILText
          role="display"
          color={G.ink}
          style={{
            marginTop: 8,
            fontFamily: IL_FONTS.display,
            fontSize: 34,
            lineHeight: 40,
            letterSpacing: -0.6,
            textAlign: 'center',
          }}
        >
          {complete
            ? `Your Leadership Card is ready${name ? `, ${name}` : ''}.`
            : `${CHALLENGE_LENGTH - done} more day${CHALLENGE_LENGTH - done === 1 ? '' : 's'} to complete your card.`}
        </ILText>

        <View style={{ marginTop: 22, backgroundColor: G.dark, borderRadius: 28, padding: 20 }}>
          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
            <Image source={LOGO} style={{ width: 22, height: 22, borderRadius: 4, marginRight: 8 }} />
            <ILText role="label" color="#FFFFFF" style={{ fontSize: 13 }}>
              Leadership Card
            </ILText>
          </View>
          {name ? (
            <ILText
              role="title"
              color="#FFFFFF"
              style={{ marginTop: 18, fontFamily: IL_FONTS.display, fontSize: 28, lineHeight: 34 }}
            >
              {name}
            </ILText>
          ) : null}
          {lines.map((row, i) => (
            <View
              key={row.k}
              style={{
                marginTop: 16,
                paddingTop: i ? 16 : 0,
                borderTopWidth: i ? 1 : 0,
                borderTopColor: 'rgba(255,255,255,0.12)',
              }}
            >
              <ILText role="eyebrow" color={G.pink} style={[af, { fontSize: 10, letterSpacing: 1.1 }]}>
                {row.k}
              </ILText>
              <ILText
                role="body"
                color={row.v ? '#FFFFFF' : 'rgba(255,255,255,0.45)'}
                style={{ marginTop: 6, fontSize: 15, lineHeight: 22, fontStyle: row.v ? 'normal' : 'italic' }}
              >
                {row.v || `Day ${row.day}`}
              </ILText>
            </View>
          ))}
        </View>

        {done > 0 ? (
          <Pressable
            onPress={share}
            style={{
              marginTop: 14,
              backgroundColor: G.dark,
              borderRadius: 999,
              paddingVertical: 13,
              alignItems: 'center',
              flexDirection: 'row',
              justifyContent: 'center',
            }}
          >
            <MaterialIcons name="share" size={16} color="#FFFFFF" />
            <ILText role="label" color="#FFFFFF" style={{ marginLeft: 8 }}>
              Share my card
            </ILText>
          </Pressable>
        ) : null}

        {complete ? (
          <View style={{ marginTop: 16, backgroundColor: G.pink, borderRadius: 28, padding: 20 }}>
            <ILText role="eyebrow" color={G.cta} style={[af, { fontSize: 10, letterSpacing: 1.1 }]}>
              What’s next
            </ILText>
            <ILText
              role="display"
              color={G.ink}
              style={{ marginTop: 8, fontFamily: IL_FONTS.display, fontSize: 26, lineHeight: 32, letterSpacing: -0.4 }}
            >
              You worked through 4 principles. There are 27.
            </ILText>
            <ILText role="body" color={G.body} style={{ marginTop: 10, fontSize: 15, lineHeight: 22 }}>
              The Leadership Essentials Program (LEP) takes you through all 27, with a cohort of
              women at your level, mentors, and certification.
            </ILText>
            <Pressable
              onPress={() => goProgram('lep')}
              style={{
                marginTop: 16,
                backgroundColor: G.cta,
                borderRadius: 999,
                paddingVertical: 14,
                alignItems: 'center',
                flexDirection: 'row',
                justifyContent: 'center',
              }}
            >
              <ILText role="label" color="#FFFFFF">
                Explore LEP
              </ILText>
              <MaterialIcons name="arrow-forward" size={16} color="#FFFFFF" style={{ marginLeft: 6 }} />
            </Pressable>
          </View>
        ) : (
          <Pressable
            onPress={() => navigation.navigate('ChallengeHub')}
            style={{ marginTop: 14, borderRadius: 999, paddingVertical: 13, alignItems: 'center', borderWidth: 1, borderColor: G.line, backgroundColor: G.white }}
          >
            <ILText role="label" color={G.ink}>
              Back to my challenge
            </ILText>
          </Pressable>
        )}
      </ScrollView>
    </Page>
  );
}

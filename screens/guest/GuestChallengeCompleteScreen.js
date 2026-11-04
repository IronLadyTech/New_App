import React from 'react';
import { Pressable, View } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { MaterialIcons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { IL_FONTS } from '../../constants/ironLadyBrand';
import ILText from '../../components/il/ILText';
import { G } from '../../constants/guestTheme';
import { LIQUID_TAB_PAD } from '../../components/il/LiquidTabBar';
import { doneCount, opensLabel, useGuestChallenge } from '../../services/guestChallenge';
import { CHALLENGE_LENGTH, dayContent } from './challengeContent';

/** After she submits a day: a short moment, then her bonus. */
export default function GuestChallengeCompleteScreen({ navigation, route }) {
  const insets = useSafeAreaInsets();
  const n = Number(route?.params?.day) || 1;
  const { progress, now } = useGuestChallenge();
  const day = dayContent(n);
  const all = doneCount(progress) >= CHALLENGE_LENGTH;
  const nextN = n + 1;

  const line = all
    ? 'All four days are done. Your Leadership Card is complete.'
    : nextN <= CHALLENGE_LENGTH
      ? `${day.cardLabel} is on your Leadership Card. Day ${nextN}: ${opensLabel(progress, nextN, now).replace('Opens', 'opens')}.`
      : `${day.cardLabel} is on your Leadership Card.`;

  return (
    <View style={{ flex: 1, backgroundColor: G.dark }}>
      <StatusBar style="light" />
      <View
        style={{
          flex: 1,
          paddingTop: Math.max(insets.top, 16),
          paddingBottom: LIQUID_TAB_PAD + Math.max(insets.bottom, 8),
          paddingHorizontal: 28,
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <View style={{ width: 140, height: 140, alignItems: 'center', justifyContent: 'center' }}>
          <View
            pointerEvents="none"
            style={{
              position: 'absolute',
              width: 128,
              height: 128,
              borderRadius: 28,
              backgroundColor: 'rgba(237,29,36,0.28)',
              transform: [{ rotate: '45deg' }],
            }}
          />
          <View
            style={{
              width: 88,
              height: 88,
              borderRadius: 22,
              backgroundColor: G.cta,
              alignItems: 'center',
              justifyContent: 'center',
              transform: [{ rotate: '45deg' }],
            }}
          >
            <View style={{ transform: [{ rotate: '-45deg' }] }}>
              <MaterialIcons name="verified" size={34} color="#FFFFFF" />
            </View>
          </View>
        </View>

        <ILText
          role="display"
          color="#FFFFFF"
          style={{
            marginTop: 28,
            fontFamily: IL_FONTS.display,
            fontSize: 40,
            lineHeight: 46,
            letterSpacing: -0.8,
            textAlign: 'center',
          }}
        >
          Day {n}, done.
        </ILText>
        <ILText
          role="body"
          color="rgba(248,214,212,0.88)"
          style={{ marginTop: 14, fontSize: 16, lineHeight: 24, textAlign: 'center' }}
        >
          {line}
        </ILText>

        <Pressable
          onPress={() => navigation.replace('ChallengeBonus', { day: n })}
          style={{
            marginTop: 40,
            alignSelf: 'stretch',
            backgroundColor: G.cta,
            borderRadius: 999,
            paddingVertical: 16,
            alignItems: 'center',
            flexDirection: 'row',
            justifyContent: 'center',
          }}
        >
          <ILText role="label" color="#FFFFFF">
            See your bonus
          </ILText>
          <MaterialIcons name="arrow-forward" size={16} color="#FFFFFF" style={{ marginLeft: 6 }} />
        </Pressable>
      </View>
    </View>
  );
}

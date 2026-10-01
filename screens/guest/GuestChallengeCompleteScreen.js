import React from 'react';
import { Pressable, View } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { MaterialIcons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { IL_FONTS } from '../../constants/ironLadyBrand';
import ILText from '../../components/il/ILText';
import { G } from '../../constants/guestTheme';
import { LIQUID_TAB_PAD } from '../../components/il/LiquidTabBar';

const FALLBACK = 'By March 2028 I will run the India P&L, not report into it.';

export default function GuestChallengeCompleteScreen({ navigation, route }) {
  const insets = useSafeAreaInsets();
  const bhag = route?.params?.bhag || FALLBACK;

  const goBonus = () => navigation.replace('ChallengeBonus', { bhag });

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
          Day 1 — done.
        </ILText>
        <ILText
          role="body"
          color="rgba(248,214,212,0.88)"
          style={{ marginTop: 14, fontSize: 16, lineHeight: 24, textAlign: 'center' }}
        >
          Your BHAG is on your Leadership Card. Day 2 unlocks tomorrow at 7:00 PM.
        </ILText>

        <Pressable
          onPress={goBonus}
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

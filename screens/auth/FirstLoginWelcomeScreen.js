import React from 'react';
import { Image, Platform, Pressable, ScrollView, View } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialCommunityIcons, MaterialIcons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { IL_BRAND, IL_FONTS } from '../../constants/ironLadyBrand';
import ILText from '../../components/il/ILText';
import ILButton from '../../components/il/ILButton';
import { useAuth } from '../../context/AuthContext';

const GUIDE = require('../../assets/il/il-guide-face.jpg');
const DARK = '#102C32';
const CTA = '#ED1D24';
const ROSE = '#E8A8A0';
const RING_FROM = '#ED1D24';
const RING_VIA = '#FF9EA1';
const RING_TO = '#FF5C61';
const SEAL = '#FF9EA1';
const SEAL_DISC = '#113744';
const GLOW = 'rgba(235,193,102,0.35)';
const CHIP_INK = '#F3EDE4';

function Chip({ icon, label }) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={`${label}, edit`}
      style={{
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: 'rgba(255,255,255,0.08)',
        borderRadius: 16,
        paddingHorizontal: 14,
        paddingVertical: 11,
      }}
    >
      <MaterialIcons name={icon} size={15} color={ROSE} />
      <ILText
        role="label"
        color={CHIP_INK}
        style={{ marginLeft: 8, marginRight: 8, fontSize: 13, lineHeight: 16 }}
      >
        {label}
      </ILText>
      <MaterialIcons name="edit" size={13} color={ROSE} />
    </Pressable>
  );
}

export default function FirstLoginWelcomeScreen({
  navigation,
  route,
  onGoBatch,
  onDone: onDoneProp,
}) {
  const insets = useSafeAreaInsets();
  const { profile } = useAuth();
  const name =
    route?.params?.name ||
    profile?.displayName?.split(' ')[0] ||
    'Ananya';

  const goBatch = () => {
    if (typeof onGoBatch === 'function') {
      onGoBatch();
      return;
    }
    if (navigation) {
      navigation.navigate('ChooseBatchDate');
      return;
    }
    const fallback = onDoneProp || route?.params?.onDone;
    if (typeof fallback === 'function') fallback();
  };

  return (
    <View style={{ flex: 1, backgroundColor: DARK }}>
      <StatusBar style="light" />
      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{
          flexGrow: 1,
          paddingHorizontal: 28,
          paddingTop: Math.max(insets.top, 12) + 10,
          paddingBottom: Math.max(insets.bottom, 16) + 12,
          alignItems: 'center',
        }}
        showsVerticalScrollIndicator={false}
      >
          <View
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              borderWidth: 1,
              borderColor: 'rgba(232,168,160,0.55)',
              backgroundColor: 'rgba(232,168,160,0.10)',
              borderRadius: 999,
              paddingHorizontal: 14,
              paddingVertical: 7,
            }}
          >
            <MaterialIcons name="school" size={13} color={ROSE} />
            <ILText
              role="eyebrow"
              color={ROSE}
              style={{ marginLeft: 7, fontSize: 10, letterSpacing: 0.8 }}
            >
              Registered · Leadership Essentials program
            </ILText>
          </View>

          <ILText
            role="display"
            color={IL_BRAND.white}
            align="center"
            style={{
              marginTop: 22,
              fontSize: 34,
              lineHeight: 42,
              letterSpacing: -0.5,
            }}
          >
            {`Welcome to the Iron Lady\nArmy, ${name}.`}
          </ILText>

          <ILText
            align="center"
            color={ROSE}
            style={{
              marginTop: 10,
              fontFamily: IL_FONTS.displayItalic,
              fontSize: 17,
              lineHeight: 24,
            }}
          >
            Your journey has begun.
          </ILText>

          <View style={{ alignItems: 'center', marginTop: 28 }}>
            <View style={{ width: 118, height: 118, marginBottom: 6, overflow: 'visible' }}>
              <LinearGradient
                colors={[RING_FROM, RING_VIA, RING_TO]}
                start={{ x: 0, y: 1 }}
                end={{ x: 1, y: 0 }}
                style={{
                  width: 118,
                  height: 118,
                  borderRadius: 59,
                  padding: 3,
                  shadowColor: '#EBC166',
                  shadowOpacity: 0.55,
                  shadowRadius: 20,
                  shadowOffset: { width: 0, height: 0 },
                  ...(Platform.OS === 'web'
                    ? { boxShadow: `0 0 28px ${GLOW}` }
                    : null),
                }}
              >
                <Image
                  source={GUIDE}
                  resizeMode="cover"
                  style={{ width: 112, height: 112, borderRadius: 56 }}
                />
              </LinearGradient>
              <View
                pointerEvents="none"
                style={{
                  position: 'absolute',
                  width: 26,
                  height: 26,
                  right: 2,
                  bottom: 10,
                  borderRadius: 13,
                  backgroundColor: SEAL_DISC,
                  alignItems: 'center',
                  justifyContent: 'center',
                  shadowColor: '#000',
                  shadowOpacity: 0.25,
                  shadowRadius: 4,
                  shadowOffset: { width: 0, height: 1 },
                  elevation: 3,
                }}
              >
                <MaterialCommunityIcons name="check-decagram" size={16} color={SEAL} />
              </View>
            </View>
            <View
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                marginTop: 6,
              }}
            >
              <ILText role="label" color={IL_BRAND.white} style={{ fontSize: 14 }}>
                IL Guide
              </ILText>
              <View
                style={{
                  width: 5,
                  height: 5,
                  borderRadius: 3,
                  backgroundColor: 'rgba(232,168,160,0.55)',
                  marginLeft: 6,
                }}
              />
            </View>
          </View>

          <View
            style={{
              width: 14,
              height: 14,
              backgroundColor: IL_BRAND.white,
              transform: [{ rotate: '45deg' }],
              marginTop: 12,
              marginBottom: -8,
              zIndex: 1,
            }}
          />
          <View
            style={{
              alignSelf: 'stretch',
              backgroundColor: IL_BRAND.white,
              borderRadius: 26,
              paddingHorizontal: 22,
              paddingVertical: 20,
            }}
          >
            <ILText
              role="body"
              color={IL_BRAND.ink}
              align="center"
              style={{ fontSize: 16, lineHeight: 24 }}
            >
              {`Hi ${name}! I’m IL Guide, and I’ll walk with you every step. First, let’s lock in your batch date so your seat is yours.`}
            </ILText>
          </View>

          <View
            style={{
              alignSelf: 'stretch',
              alignItems: 'center',
              marginTop: 22,
              backgroundColor: 'rgba(255,255,255,0.06)',
              borderWidth: 1,
              borderColor: 'rgba(255,255,255,0.10)',
              borderRadius: 24,
              paddingHorizontal: 16,
              paddingTop: 16,
              paddingBottom: 14,
            }}
          >
            <View style={{ flexDirection: 'row', justifyContent: 'center' }}>
              <View style={{ marginRight: 10 }}>
                <Chip icon="place" label="Bengaluru" />
              </View>
              <Chip icon="work-outline" label="Technology" />
            </View>
            <View style={{ marginTop: 10 }}>
              <Chip icon="flag" label="B-HAG: CXO by 2028" />
            </View>
            <ILText
              role="bodySm"
              color="rgba(232,168,160,0.72)"
              align="center"
              style={{ marginTop: 12, fontSize: 13 }}
            >
              Pulled from your profile · Tap to adjust
            </ILText>
          </View>

          <ILButton
            label="Choose my batch date"
            onPress={goBatch}
            style={{
              alignSelf: 'stretch',
              backgroundColor: CTA,
              marginTop: 26,
            }}
          />

          <View
            style={{
              marginTop: 16,
              flexDirection: 'row',
              alignItems: 'center',
              backgroundColor: 'rgba(255,255,255,0.06)',
              borderRadius: 999,
              paddingHorizontal: 16,
              paddingVertical: 10,
            }}
          >
            <MaterialIcons name="info-outline" size={15} color={ROSE} />
            <ILText
              role="bodySm"
              color={ROSE}
              style={{ marginLeft: 8, fontSize: 12 }}
            >
              Pick a batch to open your dashboard and community
            </ILText>
          </View>

          <View
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              justifyContent: 'center',
              marginTop: 16,
            }}
          >
            <MaterialIcons name="lock" size={13} color="rgba(243,237,228,0.45)" />
            <ILText
              role="bodySm"
              color="rgba(243,237,228,0.55)"
              style={{ marginLeft: 6, fontSize: 12 }}
            >
              Your details stay private
            </ILText>
          </View>
        </ScrollView>
    </View>
  );
}

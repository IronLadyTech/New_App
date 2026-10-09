import React, { useState } from 'react';
import { Image, KeyboardAvoidingView, Platform, ScrollView, Text, TextInput, useWindowDimensions, View } from 'react-native';
import Pressable from '../../components/il/Press';
import { StatusBar } from 'expo-status-bar';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialIcons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { stashPhoneAuth } from '../../services/phoneAuthSession';
import { formatCallableError, resolvePhoneAccess } from '../../services/functions';
import { IL_BRAND, IL_FONTS, IL_SPACE } from '../../constants/ironLadyBrand';
import { ilShadow } from '../../components/il/ilShadow';
import ILText from '../../components/il/ILText';
import ILLogoMark from '../../components/il/ILLogoMark';
import { useKeyboardRoom } from '../../hooks/useKeyboardRoom';

const HERO = require('../../assets/il/suvarna-hero.jpg');
const TEAL = '#112B32';
const CREAM = '#F8F6E4';
const CTA = '#ED1D24';

function digitsOnly(value) {
  return String(value || '').replace(/\D/g, '').slice(0, 10);
}

export default function PhoneLoginScreen({ navigation }) {
  const insets = useSafeAreaInsets();
  const { width, height } = useWindowDimensions();
  const [local, setLocal] = useState('');
  const [checking, setChecking] = useState(false);
  const { extra: keyboardRoom, scrollProps } = useKeyboardRoom();
  const [error, setError] = useState('');

  const onContinue = async () => {
    if (local.length < 10) {
      setError('Enter your 10-digit mobile number.');
      return;
    }
    setError('');
    setChecking(true);
    try {
      const access = await resolvePhoneAccess(`+91${local}`);
      if (!access?.ok) {
        setError(access?.reason || 'Could not check this number.');
        return;
      }
      stashPhoneAuth({ demo: true, access }, `+91${local}`);
      navigation.navigate('VerifyOtp');
    } catch (err) {
      setError(formatCallableError(err, 'Could not check this number.'));
    } finally {
      setChecking(false);
    }
  };

  return (
    <View style={{ flex: 1, backgroundColor: TEAL }}>
      <StatusBar style="light" />

      <Image
        source={HERO}
        resizeMode="cover"
        pointerEvents="none"
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          width,
          height,
        }}
      />
      <View
        pointerEvents="none"
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(17,43,50,0.58)',
        }}
      />
      <LinearGradient
        colors={['rgba(17,43,50,0.94)', 'transparent']}
        locations={[0, 1]}
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          height: height * 0.24,
          pointerEvents: 'none',
        }}
      />
      <LinearGradient
        colors={['transparent', 'rgba(17,43,50,0.90)']}
        locations={[0, 1]}
        style={{
          position: 'absolute',
          bottom: 0,
          left: 0,
          right: 0,
          height: height * 0.30,
          pointerEvents: 'none',
        }}
      />
      <LinearGradient
        colors={['rgba(17,43,50,0.80)', 'transparent']}
        start={{ x: 0, y: 0.5 }}
        end={{ x: 1, y: 0.5 }}
        style={{
          position: 'absolute',
          top: 0,
          bottom: 0,
          left: 0,
          width: width * 0.30,
          pointerEvents: 'none',
        }}
      />
      <LinearGradient
        colors={['transparent', 'rgba(17,43,50,0.58)']}
        start={{ x: 0, y: 0.5 }}
        end={{ x: 1, y: 0.5 }}
        style={{
          position: 'absolute',
          top: 0,
          bottom: 0,
          right: 0,
          width: width * 0.18,
          pointerEvents: 'none',
        }}
      />

      <View
        style={{
          paddingTop: insets.top + 10,
          paddingBottom: 8,
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 2,
        }}
      >
        <ILLogoMark size={28} />
        <Text
          numberOfLines={1}
          style={{
            marginLeft: 10,
            color: '#FFFFFF',
            fontFamily: IL_FONTS.display,
            fontSize: 20,
            lineHeight: 26,
            ...(Platform.OS === 'android' ? { includeFontPadding: false } : null),
          }}
        >
          {'Iron\u00A0Lady'}
        </Text>
      </View>

      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView
          {...scrollProps}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{
            paddingHorizontal: 20,
            paddingTop: Math.max(Math.min(height * 0.08, 56), 16),
            paddingBottom: Math.max(insets.bottom, 20) + 16 + keyboardRoom,
            flexGrow: 1,
            justifyContent: 'flex-end',
          }}
        >
          <ILText
            role="display"
            color={IL_BRAND.white}
            style={{ fontSize: 28, lineHeight: 34, letterSpacing: -0.4, marginBottom: 10 }}
          >
            {'Where ambitious women\nbecome Top leaders.'}
          </ILText>
          <ILText role="body" color={IL_BRAND.coral} style={{ marginBottom: 22 }}>
            Million Women at the TOP
          </ILText>

          <View
            style={[
              {
                backgroundColor: CREAM,
                borderRadius: 32,
                paddingHorizontal: 22,
                paddingTop: 24,
                paddingBottom: 22,
              },
              ilShadow(2),
            ]}
          >
            <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 18 }}>
              <View
                style={{
                  width: 40,
                  height: 40,
                  borderRadius: 20,
                  backgroundColor: TEAL,
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <MaterialIcons name="assignment-ind" size={22} color="#FFFFFF" />
              </View>
              <View style={{ flex: 1, marginLeft: 12 }}>
                <ILText role="label">Start with your mobile number</ILText>
                <ILText role="bodySm" color={IL_BRAND.muted}>
                  We’ll take you to the right place
                </ILText>
              </View>
            </View>

            <ILText role="eyebrow" color={IL_BRAND.muted} style={{ marginBottom: 8 }}>
              Mobile number
            </ILText>
            <View
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                backgroundColor: IL_BRAND.white,
                borderRadius: IL_SPACE.pill,
                minHeight: 54,
                paddingHorizontal: 18,
                borderWidth: 1,
                borderTopColor: 'rgba(255,255,255,1)',
                borderLeftColor: 'rgba(255,255,255,0.9)',
                borderRightColor: 'rgba(20,26,44,0.06)',
                borderBottomColor: 'rgba(20,26,44,0.10)',
                ...Platform.select({
                  web: {
                    boxShadow:
                      '0 10px 22px rgba(20,26,44,0.12), 0 2px 4px rgba(20,26,44,0.06), inset 0 1px 0 rgba(255,255,255,0.95), inset 0 -3px 6px rgba(20,26,44,0.05)',
                  },
                  ios: {
                    shadowColor: '#141A2C',
                    shadowOffset: { width: 0, height: 8 },
                    shadowOpacity: 0.16,
                    shadowRadius: 12,
                  },
                  android: {
                    elevation: 6,
                  },
                }),
              }}
            >
              <ILText role="label" style={{ flexShrink: 0 }}>
                IN +91
              </ILText>
              <View
                style={{
                  width: 1,
                  height: 16,
                  backgroundColor: IL_BRAND.line,
                  marginHorizontal: 12,
                }}
              />
              <TextInput
                value={local}
                onChangeText={(t) => setLocal(digitsOnly(t))}
                keyboardType="phone-pad"
                autoComplete="tel"
                textContentType="telephoneNumber"
                placeholder="98050 01234"
                placeholderTextColor={IL_BRAND.dim}
                maxLength={10}
                underlineColorAndroid="transparent"
                selectionColor={CTA}
                style={{
                  flex: 1,
                  fontFamily: IL_FONTS.medium,
                  fontSize: 16,
                  color: IL_BRAND.ink,
                  paddingVertical: Platform.OS === 'ios' ? 14 : 10,
                  borderWidth: 0,
                  outlineWidth: 0,
                  outlineStyle: 'none',
                  ...(Platform.OS === 'android' ? { includeFontPadding: false } : null),
                }}
              />
            </View>

            {error ? (
              <ILText role="bodySm" color={CTA} style={{ marginTop: 10 }}>
                {error}
              </ILText>
            ) : null}

            <ILText role="bodySm" color={IL_BRAND.muted} align="center" style={{ marginTop: 16 }}>
              We’ll send a 6-digit code. No password.
            </ILText>
            <Text
              style={{
                marginTop: 8,
                fontFamily: IL_FONTS.regular,
                fontSize: 11,
                lineHeight: 16,
                color: IL_BRAND.muted,
                textAlign: 'center',
              }}
            >
              By continuing you agree to our{' '}
              <Text style={{ textDecorationLine: 'underline' }}>Terms</Text>
              {' & '}
              <Text style={{ textDecorationLine: 'underline' }}>Privacy Policy</Text>
            </Text>
            {__DEV__ ? (
              <Pressable
                onPress={() => navigation.navigate('ScreenLab')}
                style={{ marginTop: 18, alignItems: 'center', paddingVertical: 8 }}
              >
                <ILText role="bodySm" color={TEAL} style={{ textDecorationLine: 'underline' }}>
                  Screen lab · skip login
                </ILText>
              </Pressable>
            ) : null}
          </View>

          <Pressable
            onPress={onContinue}
            disabled={checking}
            accessibilityRole="button"
            accessibilityLabel="Continue"
            style={({ pressed }) => ({
              marginTop: 16,
              minHeight: 56,
              borderRadius: 999,
              backgroundColor: CTA,
              flexDirection: 'row',
              alignItems: 'center',
              justifyContent: 'center',
              opacity: pressed ? 0.92 : 1,
            })}
          >
            <Text
              style={{
                color: '#FFFFFF',
                fontFamily: IL_FONTS.semibold,
                fontSize: 16,
                ...(Platform.OS === 'android' ? { includeFontPadding: false } : null),
              }}
            >
              {checking ? 'Checking…' : 'Continue'}
            </Text>
            <MaterialIcons name="arrow-forward" size={18} color="#FFFFFF" style={{ marginLeft: 8 }} />
          </Pressable>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}

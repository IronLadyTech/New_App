import React, { useEffect, useRef, useState } from 'react';
import { Image, InteractionManager, KeyboardAvoidingView, Platform, ScrollView, Text, TextInput, useWindowDimensions, View } from 'react-native';
import Pressable from '../../components/il/Press';
import { StatusBar } from 'expo-status-bar';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialIcons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { stashPhoneAuth } from '../../services/phoneAuthSession';
import { formatCallableError, resolvePhoneAccess } from '../../services/functions';
import {
  USE_FIREBASE_PHONE_OTP,
  USE_WHATSAPP_OTP,
} from '../../constants/phoneOtp';
import { sendWhatsAppOtp } from '../../services/whatsappOtp';
import { sendFirebasePhoneOtp } from '../../services/firebasePhoneOtp';
import { firebaseConfig } from '../../services/firebase';
import { FirebaseRecaptchaVerifierModal } from 'expo-firebase-recaptcha';
import { IL_BRAND, IL_FONTS, IL_SPACE } from '../../constants/ironLadyBrand';
import { ilShadow } from '../../components/il/ilShadow';
import ILText from '../../components/il/ILText';
import ILButton from '../../components/il/ILButton';
import ILLogoMark from '../../components/il/ILLogoMark';
import { useKeyboardRoom } from '../../hooks/useKeyboardRoom';
import { useDevLaunchSplashPreview } from '../../context/DevLaunchSplashPreviewContext';
import { devToolsEnabled } from '../../utils/devToolsEnabled';
import Animated, {
  Easing,
  useAnimatedStyle,
  useReducedMotion,
  useSharedValue,
  withDelay,
  withTiming,
} from 'react-native-reanimated';
import { isLaunchRevealPending, onLaunchReveal } from '../../utils/launchReveal';

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

  // First screen after the launch splash: as the splash flies through the logo, the photo
  // settles and the header, headline and card rise in — one continuous shot. Coming back
  // to this screen later shows it at rest.
  const reducedMotion = useReducedMotion();
  const fromLaunch = useRef(isLaunchRevealPending() && !reducedMotion).current;
  const heroScale = useSharedValue(fromLaunch ? 1.12 : 1);
  const headerIn = useSharedValue(fromLaunch ? 0 : 1);
  const headIn = useSharedValue(fromLaunch ? 0 : 1);
  const cardIn = useSharedValue(fromLaunch ? 0 : 1);
  useEffect(() => {
    if (!fromLaunch) return undefined;
    return onLaunchReveal(() => {
      const ease = Easing.out(Easing.cubic);
      heroScale.value = withTiming(1, { duration: 1400, easing: ease });
      headerIn.value = withDelay(250, withTiming(1, { duration: 500, easing: ease }));
      headIn.value = withDelay(350, withTiming(1, { duration: 550, easing: ease }));
      cardIn.value = withDelay(500, withTiming(1, { duration: 600, easing: ease }));
    });
  }, []);
  const heroStyle = useAnimatedStyle(() => ({ transform: [{ scale: heroScale.value }] }));
  const headerStyle = useAnimatedStyle(() => ({
    opacity: headerIn.value,
    transform: [{ translateY: (1 - headerIn.value) * -10 }],
  }));
  const headStyle = useAnimatedStyle(() => ({
    opacity: headIn.value,
    transform: [{ translateY: (1 - headIn.value) * 24 }],
  }));
  const cardStyle = useAnimatedStyle(() => ({
    opacity: cardIn.value,
    transform: [{ translateY: (1 - cardIn.value) * 36 }],
  }));
  const [local, setLocal] = useState('');
  const [checking, setChecking] = useState(false);
  const { extra: keyboardRoom, scrollProps } = useKeyboardRoom();
  const [error, setError] = useState('');
  const [sending, setSending] = useState(false);
  const recaptchaVerifier = useRef(null);
  const { showLaunchSplash } = useDevLaunchSplashPreview();
  const [mountRecaptcha, setMountRecaptcha] = useState(false);

  useEffect(() => {
    if (!USE_FIREBASE_PHONE_OTP || Platform.OS === 'web') return undefined;
    const task = InteractionManager.runAfterInteractions(() => {
      setMountRecaptcha(true);
    });
    return () => task.cancel();
  }, []);

  const busy = checking || sending;

  const onContinue = async () => {
    if (busy) return;
    if (local.length < 10) {
      setError('Enter your 10-digit mobile number.');
      return;
    }
    setError('');
    const phone = `+91${local}`;
    setChecking(true);
    try {
      const access = await resolvePhoneAccess(phone);
      if (!access?.ok) {
        setError(access?.reason || 'Could not check this number.');
        return;
      }
      if (__DEV__ && access.cmsBatchId) {
        console.log('[login] CMS batch pinned:', access.cmsBatchId);
      }
      // Guests: no SMS — explore / MC tier only.
      if (access.guest) {
        stashPhoneAuth({ demo: true, access }, phone);
      } else if (USE_WHATSAPP_OTP) {
        setSending(true);
        try {
          await sendWhatsAppOtp(phone);
        } catch (e) {
          setError(e.message);
          return;
        } finally {
          setSending(false);
        }
        stashPhoneAuth({ whatsapp: true, access }, phone);
      } else if (USE_FIREBASE_PHONE_OTP) {
        if (!recaptchaVerifier.current) {
          setMountRecaptcha(true);
          setError('Preparing security check… wait a moment, then tap Continue again.');
          return;
        }
        setSending(true);
        try {
          const confirmation = await sendFirebasePhoneOtp(phone, recaptchaVerifier.current);
          stashPhoneAuth({ firebase: true, confirmation, access }, phone);
        } catch (e) {
          setError(e?.message || 'Could not send SMS. Try again.');
          return;
        } finally {
          setSending(false);
        }
      } else {
        stashPhoneAuth({ demo: true, access }, phone);
      }
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

      <Animated.View
        pointerEvents="none"
        style={[{ position: 'absolute', top: 0, left: 0, width, height }, heroStyle]}
      >
        <Image source={HERO} resizeMode="cover" style={{ width, height }} />
      </Animated.View>
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

      <Animated.View
        style={[
          {
            paddingTop: insets.top + 10,
            paddingBottom: 8,
            paddingHorizontal: 20,
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 2,
          },
          headerStyle,
        ]}
      >
        <ILLogoMark size={28} />
        <ILText role="wordmark" color="#FFFFFF" style={{ marginLeft: 10, flexShrink: 0 }}>
          Iron Lady
        </ILText>
      </Animated.View>

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
          <Animated.View style={headStyle}>
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
          </Animated.View>

          <Animated.View style={cardStyle}>

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
            {devToolsEnabled() ? (
              <>
                <Pressable
                  onPress={showLaunchSplash}
                  style={{ marginTop: 18, alignItems: 'center', paddingVertical: 8 }}
                >
                  <ILText role="bodySm" color={TEAL} style={{ textDecorationLine: 'underline' }}>
                    Preview launch splash
                  </ILText>
                </Pressable>
                <Pressable
                  onPress={() => navigation.navigate('ScreenLab')}
                  style={{ marginTop: 4, alignItems: 'center', paddingVertical: 8 }}
                >
                  <ILText role="bodySm" color={TEAL} style={{ textDecorationLine: 'underline' }}>
                    Screen lab · skip login
                  </ILText>
                </Pressable>
              </>
            ) : null}
          </View>

          <ILButton
            label={sending ? 'Sending code…' : checking ? 'Checking…' : 'Continue'}
            onPress={onContinue}
            disabled={busy}
            loading={false}
            style={{ marginTop: 16, opacity: busy ? 0.7 : 1 }}
          />
          </Animated.View>
        </ScrollView>
      </KeyboardAvoidingView>
      {mountRecaptcha && USE_FIREBASE_PHONE_OTP && Platform.OS !== 'web' ? (
        <FirebaseRecaptchaVerifierModal
          ref={recaptchaVerifier}
          firebaseConfig={firebaseConfig}
          attemptInvisibleVerification
        />
      ) : null}
    </View>
  );
}

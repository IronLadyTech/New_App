import React, { useCallback, useMemo, useRef, useState } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  View,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { MaterialIcons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { peekPhoneAuth } from '../../services/phoneAuthSession';
import {
  sendWhatsAppOtp,
  signInWithOtpToken,
  verifyWhatsAppOtp,
} from '../../services/whatsappOtp';
import { IL_BRAND } from '../../constants/ironLadyBrand';
import ILText from '../../components/il/ILText';
import { ilShadow } from '../../components/il/ilShadow';
import OtpDeck from '../../src/components/otp/OtpDeck';

const CTA = '#ED1D24';
const PAGE = '#FAF7F2';
const OTP_LENGTH = 6;

function randomCode() {
  return String(Math.floor(100000 + Math.random() * 900000));
}

function maskPhone(phone) {
  const digits = String(phone || '').replace(/\D/g, '');
  if (digits.length < 10) return phone || 'your mobile';
  const local = digits.slice(-10);
  return `+91 ${local.slice(0, 2)}xxx xx${local.slice(-3)}`;
}

function InfoRow({ icon, title, body }) {
  return (
    <View style={{ flexDirection: 'row', alignItems: 'flex-start', marginTop: 18 }}>
      <View
        style={{
          width: 36,
          height: 36,
          borderRadius: 18,
          backgroundColor: IL_BRAND.white,
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <MaterialIcons name={icon} size={16} color={IL_BRAND.muted} />
      </View>
      <View style={{ marginLeft: 12, flex: 1 }}>
        <ILText role="label">{title}</ILText>
        <ILText role="bodySm" color={IL_BRAND.muted} style={{ marginTop: 2 }}>
          {body}
        </ILText>
      </View>
    </View>
  );
}

export default function VerifyOtpScreen({ navigation, route }) {
  const insets = useSafeAreaInsets();
  const { confirmation, phone } = peekPhoneAuth();
  const live = !!confirmation?.whatsapp;
  const routePhone = route?.params?.phone;
  const masked = useMemo(() => maskPhone(routePhone || phone), [routePhone, phone]);
  const [expected, setExpected] = useState(randomCode);
  const [message, setMessage] = useState('');
  const tokenRef = useRef(null);

  const onVerify = useCallback(
    async (code) => {
      if (!live) return code === expected;
      setMessage('');
      try {
        tokenRef.current = await verifyWhatsAppOtp(phone, code);
        return true;
      } catch (e) {
        setMessage(e.message);
        return false;
      }
    },
    [live, expected, phone]
  );

  const onContinue = useCallback(async () => {
    if (!live) {
      navigation.replace('FirstLoginWelcome');
      return;
    }
    try {
      // Auth state flips to signed-in and AppNavigator swaps to the app.
      await signInWithOtpToken(tokenRef.current);
    } catch (e) {
      setMessage(e.message || 'Sign-in failed. Request a new code.');
    }
  }, [live, navigation]);

  const onResend = useCallback(async () => {
    if (!live) {
      setExpected(randomCode());
      return;
    }
    setMessage('');
    try {
      await sendWhatsAppOtp(phone);
      setMessage('New code sent on WhatsApp.');
    } catch (e) {
      setMessage(e.message);
    }
  }, [live, phone]);

  return (
    <View style={{ flex: 1, backgroundColor: PAGE }}>
      <StatusBar style="dark" />
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{
            paddingHorizontal: 16,
            paddingTop: Math.max(insets.top, 8) + 6,
            paddingBottom: Math.max(insets.bottom, 18) + 12,
          }}
        >
          <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 8 }}>
            <Pressable
              onPress={() => navigation.goBack()}
              accessibilityRole="button"
              accessibilityLabel="Back"
              hitSlop={10}
              style={{
                width: 36,
                height: 36,
                borderRadius: 18,
                backgroundColor: IL_BRAND.white,
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <MaterialIcons name="chevron-left" size={22} color={IL_BRAND.ink} />
            </Pressable>
            <View
              style={{
                flex: 1,
                flexDirection: 'row',
                alignItems: 'center',
                justifyContent: 'center',
                marginRight: 36,
              }}
            >
              <MaterialIcons name="verified-user" size={13} color={CTA} />
              <ILText role="eyebrow" color={IL_BRAND.muted} style={{ marginLeft: 6 }}>
                Secure sign-in
              </ILText>
            </View>
          </View>

          <View
            style={{
              width: 40,
              height: 3,
              backgroundColor: CTA,
              borderRadius: 2,
              marginTop: 22,
            }}
          />

          <ILText role="display" style={{ marginTop: 18, fontSize: 34, lineHeight: 40 }}>
            Enter your code
          </ILText>
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', alignItems: 'center', marginTop: 8 }}>
            <ILText role="body" color={IL_BRAND.muted}>
              Sent to {masked} ·{' '}
            </ILText>
            <Pressable onPress={() => navigation.goBack()}>
              <ILText role="label" color={CTA} style={{ textDecorationLine: 'underline' }}>
                Change
              </ILText>
            </Pressable>
          </View>
          {live ? (
            <ILText role="bodySm" color={IL_BRAND.muted} style={{ marginTop: 10 }}>
              Check WhatsApp for your 6-digit code.
            </ILText>
          ) : (
            <ILText role="label" color={IL_BRAND.ink} style={{ marginTop: 10, letterSpacing: 0.4 }}>
              Demo code · {expected}
            </ILText>
          )}

          <View
            style={[
              {
                marginTop: 28,
                backgroundColor: IL_BRAND.white,
                borderRadius: 32,
                paddingHorizontal: 10,
                paddingTop: 18,
                paddingBottom: 16,
              },
              ilShadow(1),
            ]}
          >
            <OtpDeck
              embedded
              length={OTP_LENGTH}
              phone={masked}
              theme="ivory"
              onVerify={onVerify}
              onContinue={onContinue}
              onResend={onResend}
            />
          </View>
          {message ? (
            <ILText role="bodySm" color={CTA} align="center" style={{ marginTop: 12 }}>
              {message}
            </ILText>
          ) : null}

          <View style={{ marginTop: 28 }}>
            <InfoRow
              icon="lock"
              title="End-to-end encrypted"
              body="Your details stay private to you"
            />
            <InfoRow
              icon="vpn-key"
              title="Support when you need it"
              body="Get access to support, guidance and materials, all in one place."
            />
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}

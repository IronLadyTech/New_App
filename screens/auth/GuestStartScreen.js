import React, { useState } from 'react';
import { Pressable, ScrollView, TextInput, View } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { MaterialIcons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { IL_FONTS } from '../../constants/ironLadyBrand';
import ILText from '../../components/il/ILText';
import ILLogoMark from '../../components/il/ILLogoMark';
import { useAuth } from '../../context/AuthContext';
import { peekPhoneAuth } from '../../services/phoneAuthSession';
import { G, af } from '../../constants/guestTheme';

function formatLocal(phone) {
  const digits = String(phone || '').replace(/\D/g, '');
  const local = digits.slice(-10);
  if (local.length < 10) return 'your number';
  return `${local.slice(0, 5)} ${local.slice(5)}`;
}

export default function GuestStartScreen({ navigation, route }) {
  const insets = useSafeAreaInsets();
  const [name, setName] = useState('');
  const [other, setOther] = useState('');
  const { enterGuest } = useAuth();
  const onGuest = route?.params?.onGuest || enterGuest;
  const onRetry = route?.params?.onRetry;
  const phone = route?.params?.phone || peekPhoneAuth()?.phone;
  const shown = formatLocal(phone);

  return (
    <View style={{ flex: 1, backgroundColor: G.page }}>
      <StatusBar style="dark" />
      <View
        style={{
          paddingTop: Math.max(insets.top, 8),
          paddingHorizontal: 20,
          paddingBottom: 12,
          flexDirection: 'row',
          alignItems: 'center',
        }}
      >
        <ILLogoMark size={32} />
        <ILText
          role="wordmark"
          color={G.ink}
          style={{ marginLeft: 10, fontFamily: IL_FONTS.display, fontSize: 14 }}
        >
          Iron Lady
        </ILText>
      </View>
      <ScrollView
        keyboardShouldPersistTaps="handled"
        contentContainerStyle={{
          paddingHorizontal: 20,
          paddingBottom: Math.max(insets.bottom, 16) + 24,
        }}
      >
        <ILText role="eyebrow" color={G.cta} style={[af, { fontSize: 11, letterSpacing: 1.4 }]}>
          Welcome
        </ILText>
        <ILText
          role="display"
          color={G.ink}
          style={{ marginTop: 8, fontFamily: IL_FONTS.display, fontSize: 32, lineHeight: 38 }}
        >
          Let’s get you started.
        </ILText>
        <ILText role="body" color={G.meta} style={{ marginTop: 10, fontSize: 15, lineHeight: 22 }}>
          <ILText role="label" color={G.ink}>
            {shown}
          </ILText>{' '}
          is verified. We couldn’t link it to a registration yet, so you’re in with free guest access — and your progress is saved to this number.
        </ILText>

        <View
          style={{
            marginTop: 20,
            backgroundColor: G.white,
            borderRadius: 20,
            borderWidth: 1,
            borderColor: G.line,
            padding: 16,
          }}
        >
          <ILText role="eyebrow" color={G.meta} style={[af, { fontSize: 10 }]}>
            What should we call you?
          </ILText>
          <TextInput
            value={name}
            onChangeText={setName}
            placeholder="First name (optional)"
            placeholderTextColor="#9A968C"
            style={{
              marginTop: 10,
              backgroundColor: '#F4F1E4',
              borderRadius: 14,
              minHeight: 48,
              paddingHorizontal: 14,
              fontFamily: IL_FONTS.regular,
              fontSize: 16,
              color: G.ink,
            }}
          />
          <ILText role="bodySm" color={G.meta} style={{ marginTop: 8, fontSize: 12 }}>
            So the app greets you by name. Optional.
          </ILText>
        </View>

        <View style={{ alignItems: 'center', marginVertical: 18 }}>
          <View
            style={{
              width: 44,
              height: 44,
              borderRadius: 22,
              backgroundColor: '#E4EDE8',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <MaterialIcons name="place" size={20} color={G.ink} />
          </View>
        </View>

        <View style={{ backgroundColor: G.dark, borderRadius: 22, padding: 20 }}>
          <ILText role="eyebrow" color={G.pink} style={[af, { fontSize: 10 }]}>
            Recommended
          </ILText>
          <ILText
            role="title"
            color="#FFFFFF"
            style={{ marginTop: 8, fontFamily: IL_FONTS.display, fontSize: 22, lineHeight: 28 }}
          >
            Continue as a guest
          </ILText>
          <ILText
            role="bodySm"
            color="rgba(255,255,255,0.7)"
            style={{ marginTop: 8, fontSize: 13, lineHeight: 19 }}
          >
            Browse Masterclass previews, community stories and free resources. Your number is saved, so your progress is too.
          </ILText>
          <Pressable
            onPress={() => (typeof onGuest === 'function' ? onGuest(name) : navigation.goBack())}
            style={({ pressed }) => ({
              marginTop: 16,
              backgroundColor: G.cta,
              borderRadius: 999,
              paddingVertical: 14,
              alignItems: 'center',
              flexDirection: 'row',
              justifyContent: 'center',
              opacity: pressed ? 0.92 : 1,
            })}
          >
            <ILText role="label" color="#FFFFFF">
              Continue as guest
            </ILText>
            <MaterialIcons name="arrow-forward" size={16} color="#FFFFFF" style={{ marginLeft: 6 }} />
          </Pressable>
        </View>

        <View
          style={{
            marginTop: 14,
            backgroundColor: G.white,
            borderRadius: 22,
            borderWidth: 1,
            borderColor: G.line,
            padding: 16,
          }}
        >
          <ILText role="eyebrow" color={G.meta} style={[af, { fontSize: 10 }]}>
            Registered with a different number?
          </ILText>
          <View
            style={{
              marginTop: 12,
              flexDirection: 'row',
              alignItems: 'center',
              borderWidth: 1,
              borderColor: G.line,
              borderRadius: 999,
              paddingHorizontal: 14,
              minHeight: 48,
            }}
          >
            <ILText role="label" color={G.ink} style={{ fontSize: 13 }}>
              IN +91
            </ILText>
            <View style={{ width: 1, height: 20, backgroundColor: G.line, marginHorizontal: 12 }} />
            <TextInput
              value={other}
              onChangeText={setOther}
              placeholder="Enter your number"
              placeholderTextColor="#9A968C"
              keyboardType="phone-pad"
              style={{
                flex: 1,
                fontFamily: IL_FONTS.regular,
                fontSize: 15,
                color: G.ink,
                paddingVertical: 10,
              }}
            />
          </View>
          <Pressable
            onPress={() =>
              typeof onRetry === 'function' ? onRetry() : navigation.navigate('PhoneLogin')
            }
            style={{
              marginTop: 12,
              borderWidth: 1,
              borderColor: G.ink,
              borderRadius: 999,
              paddingVertical: 13,
              alignItems: 'center',
            }}
          >
            <ILText role="label" color={G.ink}>
              Send code
            </ILText>
          </Pressable>
        </View>

        <Pressable
          style={{
            marginTop: 14,
            backgroundColor: G.white,
            borderRadius: 20,
            borderWidth: 1,
            borderColor: G.line,
            padding: 14,
            flexDirection: 'row',
            alignItems: 'center',
          }}
        >
          <View
            style={{
              width: 40,
              height: 40,
              borderRadius: 20,
              backgroundColor: '#E8EEF0',
              alignItems: 'center',
              justifyContent: 'center',
              marginRight: 12,
            }}
          >
            <MaterialIcons name="headset-mic" size={18} color={G.ink} />
          </View>
          <View style={{ flex: 1 }}>
            <ILText role="label" color={G.ink} style={{ fontSize: 14 }}>
              Ask our team to find it
            </ILText>
            <ILText role="bodySm" color={G.meta} style={{ fontSize: 12, marginTop: 2 }}>
              We’ll call you back within a day
            </ILText>
          </View>
          <MaterialIcons name="chevron-right" size={20} color={G.ink} />
        </Pressable>

        <View style={{ marginTop: 14, backgroundColor: G.dark, borderRadius: 22, padding: 20 }}>
          <ILText role="eyebrow" color={G.pink} style={[af, { fontSize: 10 }]}>
            Free · starts Monday
          </ILText>
          <ILText
            role="title"
            color="#FFFFFF"
            style={{ marginTop: 8, fontFamily: IL_FONTS.display, fontSize: 20, lineHeight: 26 }}
          >
            Try the 4-Day Challenge as a guest
          </ILText>
          <ILText
            role="bodySm"
            color="rgba(255,255,255,0.7)"
            style={{ marginTop: 6, fontSize: 13, lineHeight: 19 }}
          >
            15 minutes a day. No registration needed.
          </ILText>
        </View>
      </ScrollView>
    </View>
  );
}

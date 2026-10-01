import React from 'react';
import { Pressable, ScrollView, View } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { stashPhoneAuth } from '../../services/phoneAuthSession';
import { IL_FONTS } from '../../constants/ironLadyBrand';
import ILText from '../../components/il/ILText';
import { useAuth } from '../../context/AuthContext';

const PAGE = '#F7F6E4';
const INK = '#113744';
const CTA = '#ED1D24';

const JUMPS = [
  { label: 'Phone login', route: 'PhoneLogin' },
  {
    label: 'OTP',
    route: 'VerifyOtp',
    prep: () => stashPhoneAuth({ demo: true }, '+919805001234'),
  },
  { label: 'Welcome', route: 'FirstLoginWelcome' },
  { label: 'Choose batch', route: 'ChooseBatchDate' },
  { label: 'Seat held', route: 'SeatHeld' },
  { label: 'Journey picker', route: 'JourneyPicker' },
  { label: 'Guest start', route: 'GuestStart' },
  { label: 'Guest · Home', guest: true },
  { label: 'LEP · Registered home', lep: 'registered' },
  { label: 'LEP · Enrolled home', lep: 'enrolled' },
  { label: '100BM · Registered home', bm: 'registered' },
  { label: '100BM · Enrolled home', bm: 'enrolled' },
  { label: '100BM and MBW screens', preview: true },
];

export default function ScreenLab({ navigation }) {
  const insets = useSafeAreaInsets();
  const { enterGuest, enterJourneyPreview, enterPreview } = useAuth();

  return (
    <View style={{ flex: 1, backgroundColor: PAGE }}>
      <StatusBar style="dark" />
      <ScrollView
        contentContainerStyle={{
          paddingTop: Math.max(insets.top, 16) + 24,
          paddingHorizontal: 24,
          paddingBottom: Math.max(insets.bottom, 24) + 24,
        }}
      >
        <ILText
          role="eyebrow"
          color={CTA}
          style={{ fontSize: 10, letterSpacing: 1.6, marginBottom: 6 }}
        >
          Dev only
        </ILText>
        <ILText
          role="display"
          color={INK}
          style={{ fontFamily: IL_FONTS.display, fontSize: 28, lineHeight: 34 }}
        >
          Screen lab
        </ILText>
        <ILText
          role="bodySm"
          color="#4A463D"
          style={{ marginTop: 8, fontSize: 14, lineHeight: 20 }}
        >
          Jump to a screen without OTP. Keep Metro running — a save hot-reloads in a
          second. Do not restart with -c unless a native module changed.
        </ILText>

        <View style={{ marginTop: 24 }}>
          {JUMPS.map((item) => (
            <Pressable
              key={item.label}
              onPress={() => {
                if (item.guest) {
                  enterGuest();
                  return;
                }
                if (item.lep) {
                  enterJourneyPreview('lep', item.lep);
                  return;
                }
                if (item.bm) {
                  enterJourneyPreview('100bm', item.bm);
                  return;
                }
                if (item.preview) {
                  enterPreview();
                  return;
                }
                item.prep?.();
                navigation.navigate(item.route);
              }}
              style={({ pressed }) => ({
                marginTop: 10,
                backgroundColor: INK,
                borderRadius: 16,
                paddingVertical: 16,
                paddingHorizontal: 18,
                opacity: pressed ? 0.88 : 1,
              })}
            >
              <ILText role="label" color="#FFFFFF" style={{ fontSize: 15 }}>
                {item.label}
              </ILText>
            </Pressable>
          ))}
        </View>
      </ScrollView>
    </View>
  );
}

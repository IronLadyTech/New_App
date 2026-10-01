import React from 'react';
import { Pressable, ScrollView, View } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { MaterialIcons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { IL_FONTS } from '../../constants/ironLadyBrand';
import ILText from '../../components/il/ILText';
import { G, af } from '../../constants/guestTheme';
import { useAuth } from '../../context/AuthContext';
import { GuestBackBar } from '../guest/GuestBits';

export const JOURNEY_FLOWS = [
  {
    program: 'lep',
    state: 'registered',
    code: 'LEP',
    title: 'Leadership Essentials program',
    status: 'Registered participant',
    hint: 'Seat held · not yet enrolled',
    ready: true,
  },
  {
    program: 'lep',
    state: 'enrolled',
    code: 'LEP',
    title: 'Leadership Essentials program',
    status: 'Enrolled participant',
    hint: 'Paid · Day 1 readiness',
    ready: true,
  },
];

export default function JourneyPickerScreen({ navigation, route, onPick }) {
  const insets = useSafeAreaInsets();
  const { enterJourneyPreview } = useAuth();
  const name = route?.params?.name || 'Ananya';

  const choose = async (flow) => {
    await enterJourneyPreview(flow.program, flow.state);
    if (typeof onPick === 'function') onPick(flow);
  };

  return (
    <View style={{ flex: 1, backgroundColor: G.page }}>
      <StatusBar style="dark" />
      <View style={{ paddingTop: Math.max(insets.top, 8) }}>
        <GuestBackBar
          title="Continue to my journey"
          sub="Pick the participant flow"
          onBack={() => navigation?.goBack?.()}
        />
      </View>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{
          paddingHorizontal: 20,
          paddingBottom: Math.max(insets.bottom, 16) + 28,
        }}
      >
        <ILText role="eyebrow" color={G.cta} style={[af, { fontSize: 10, letterSpacing: 1.4 }]}>
          After seat held
        </ILText>
        <ILText
          role="display"
          color={G.ink}
          style={{ marginTop: 8, fontFamily: IL_FONTS.display, fontSize: 30, lineHeight: 36 }}
        >
          Which journey, {name}?
        </ILText>
        <ILText role="body" color={G.body} style={{ marginTop: 8, fontSize: 15, lineHeight: 22 }}>
          Open the LEP registered or enrolled participant home.
        </ILText>

        {['LEP'].map((code) => (
          <View key={code} style={{ marginTop: 22 }}>
            <ILText role="eyebrow" color={G.cta} style={[af, { fontSize: 10, letterSpacing: 1.4 }]}>
              {code}
            </ILText>
            {JOURNEY_FLOWS.filter((f) => f.code === code).map((flow) => (
              <Pressable
                key={`${flow.program}-${flow.state}`}
                onPress={() => choose(flow)}
                style={({ pressed }) => ({
                  marginTop: 10,
                  backgroundColor: G.white,
                  borderRadius: 20,
                  borderWidth: 1,
                  borderColor: G.line,
                  padding: 16,
                  flexDirection: 'row',
                  alignItems: 'center',
                  opacity: pressed ? 0.88 : 1,
                })}
              >
                <View
                  style={{
                    width: 44,
                    height: 44,
                    borderRadius: 14,
                    backgroundColor: flow.state === 'enrolled' ? G.dark : G.pink,
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <MaterialIcons
                    name={flow.state === 'enrolled' ? 'verified' : 'event-seat'}
                    size={20}
                    color={flow.state === 'enrolled' ? '#FFFFFF' : G.cta}
                  />
                </View>
                <View style={{ flex: 1, marginLeft: 12 }}>
                  <ILText role="label" color={G.ink}>
                    {flow.status}
                  </ILText>
                  <ILText role="bodySm" color={G.meta} style={{ marginTop: 3, fontSize: 12, lineHeight: 17 }}>
                    {flow.title}
                    {'\n'}
                    {flow.hint}
                  </ILText>
                </View>
                <MaterialIcons name="arrow-forward" size={18} color={G.ink} />
              </Pressable>
            ))}
          </View>
        ))}
      </ScrollView>
    </View>
  );
}

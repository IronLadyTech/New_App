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

const LEP_TITLE = 'Leadership Essentials program';
const BM_TITLE = '100 Board Members';
const MBW_TITLE = 'Master of Business Warfare';

export const JOURNEY_FLOWS = [
  { program: 'lep', state: 'registered', code: 'LEP', title: LEP_TITLE, status: 'Registered participant', hint: 'Seat held · not yet enrolled' },
  { program: 'lep', state: 'enrolled', code: 'LEP', title: LEP_TITLE, status: 'Enrolled participant', hint: 'Paid · Day 1 readiness' },
  { program: '100bm', state: 'registered', code: '100BM', title: BM_TITLE, status: 'Registered participant', hint: 'Seat held · pre-program tasks' },
  { program: '100bm', state: 'enrolled', code: '100BM', title: BM_TITLE, status: 'Enrolled participant', hint: 'Paid · phases and practice drills' },
  { program: 'mbw', state: 'registered', code: 'MBW', title: MBW_TITLE, status: 'Registered participant', hint: 'Preparation · 12 weeks before Q1' },
  { program: 'mbw', state: 'enrolled', code: 'MBW', title: MBW_TITLE, status: 'Enrolled participant', hint: 'Q1–Q4 · weekly deliverables' },
  { program: 'guest', state: 'guest', code: 'Guest', title: 'Browse as a guest', status: 'Guest', hint: 'Free 4-Day Challenge, programs and stories' },
];

const SECTIONS = ['LEP', '100BM', 'MBW', 'Guest'];

const ICON = {
  registered: { name: 'event-seat', bg: G.pink, fg: G.cta },
  enrolled: { name: 'verified', bg: G.dark, fg: '#FFFFFF' },
  guest: { name: 'explore', bg: G.mutedFill, fg: G.ink },
};

export default function JourneyPickerScreen({ navigation, route, onPick, authSteps, onAuthStep }) {
  const insets = useSafeAreaInsets();
  const { enterJourneyPreview, enterGuest, logout, user } = useAuth();
  const name = route?.params?.name || 'Ananya';

  const choose = async (flow) => {
    if (flow.program === 'guest') {
      // The guest app only shows when nobody is signed in.
      if (user && user.uid !== 'preview') await logout();
      await enterGuest(undefined, { demo: true });
    } else {
      await enterJourneyPreview(flow.program, flow.state);
    }
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
          Open any program as a registered or enrolled participant, or browse as a guest.
        </ILText>

        {authSteps?.length ? (
          <View style={{ marginTop: 22 }}>
            <ILText role="eyebrow" color={G.cta} style={[af, { fontSize: 10, letterSpacing: 1.4 }]}>
              Sign in
            </ILText>
            <View
              style={{
                marginTop: 10,
                backgroundColor: G.white,
                borderRadius: 20,
                borderWidth: 1,
                borderColor: G.line,
                overflow: 'hidden',
              }}
            >
              {authSteps.map((step, i) => (
                <Pressable
                  key={step.route}
                  onPress={() => onAuthStep?.(step)}
                  style={({ pressed }) => ({
                    paddingHorizontal: 16,
                    paddingVertical: 14,
                    flexDirection: 'row',
                    alignItems: 'center',
                    borderTopWidth: i ? 1 : 0,
                    borderTopColor: G.line,
                    backgroundColor: pressed ? G.mutedFill : G.white,
                  })}
                >
                  <View
                    style={{
                      width: 26,
                      height: 26,
                      borderRadius: 13,
                      backgroundColor: G.mutedFill,
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    <ILText role="label" color={G.ink} style={{ fontSize: 12 }}>
                      {i + 1}
                    </ILText>
                  </View>
                  <ILText role="label" color={G.ink} style={{ flex: 1, marginLeft: 12 }}>
                    {step.label}
                  </ILText>
                  <MaterialIcons name="arrow-forward" size={16} color={G.meta} />
                </Pressable>
              ))}
            </View>
          </View>
        ) : null}

        {SECTIONS.map((code) => (
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
                    backgroundColor: ICON[flow.state].bg,
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <MaterialIcons name={ICON[flow.state].name} size={20} color={ICON[flow.state].fg} />
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

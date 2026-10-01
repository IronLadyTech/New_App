import React, { useState } from 'react';
import { Modal, Pressable, View } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAuth } from '../../context/AuthContext';
import JourneyPickerScreen, { JOURNEY_FLOWS } from '../../screens/auth/JourneyPickerScreen';
import ILText from './ILText';
import { stashPhoneAuth } from '../../services/phoneAuthSession';

const NAVY = '#113744';
const CREAM = '#F5F2E8';

/** Sign-in screens, in the order a participant meets them, before any journey. */
export const AUTH_STEPS = [
  { kind: 'auth', route: 'PhoneLogin', label: 'Phone number' },
  { kind: 'auth', route: 'VerifyOtp', label: 'OTP' },
  { kind: 'auth', route: 'FirstLoginWelcome', label: 'Welcome' },
  { kind: 'auth', route: 'ChooseBatchDate', label: 'Batch date' },
  { kind: 'auth', route: 'SeatHeld', label: 'Seat held' },
  { kind: 'auth', route: 'JourneyPicker', label: 'Journey picker' },
];

const STEPS = [...AUTH_STEPS, ...JOURNEY_FLOWS.map((f) => ({ ...f, kind: 'flow' }))];

function flowLabel(step) {
  if (!step) return 'Demo';
  if (step.kind === 'auth') return `Sign in · ${step.label}`;
  if (step.program === 'guest') return 'Guest';
  return `${step.code} · ${step.state === 'enrolled' ? 'Enrolled' : 'Registered'}`;
}

/** The OTP screen expects a number waiting for a code; give it the demo one. */
function prepAuthStep(route) {
  if (route === 'VerifyOtp') stashPhoneAuth({ demo: true }, '+919805001234');
}

function Arrow({ name, onPress, label }) {
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={label}
      hitSlop={6}
      style={({ pressed }) => ({
        width: 34,
        height: 34,
        borderRadius: 17,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: pressed ? 'rgba(245,242,232,0.24)' : 'rgba(245,242,232,0.12)',
      })}
    >
      <MaterialIcons name={name} size={22} color={CREAM} />
    </Pressable>
  );
}

/**
 * Demo-only strip above the app: step to the previous / next participant flow, or open
 * the journey picker to jump to any of them. Hidden for real users.
 */
export default function DemoFlowBar({ route, navRef }) {
  const insets = useSafeAreaInsets();
  const { demo, journey, isGuest, enterJourneyPreview, enterGuest, enterAuthDemo } = useAuth();
  const [pickerOpen, setPickerOpen] = useState(false);
  const inSignIn = !journey && !isGuest;

  const found = STEPS.findIndex((s) =>
    inSignIn
      ? s.kind === 'auth' && s.route === route
      : s.kind === 'flow' &&
        (isGuest ? s.program === 'guest' : s.program === journey?.program && s.state === journey?.state)
  );
  // Other sign-in screens (old email login etc.) count as the start of the path.
  const index = found < 0 && inSignIn ? 0 : found;
  if (index < 0 || (isGuest && !demo)) return null;

  const open = (s) => {
    if (s.kind === 'auth') {
      prepAuthStep(s.route);
      if (inSignIn) navRef?.navigate(s.route);
      else enterAuthDemo(s.route);
      return;
    }
    if (s.program === 'guest') enterGuest(undefined, { demo: true });
    else enterJourneyPreview(s.program, s.state);
  };
  const step = (dir) => {
    const n = STEPS.length;
    open(STEPS[(index + dir + n) % n]);
  };

  return (
    <View style={{ backgroundColor: NAVY, paddingTop: insets.top, zIndex: 70 }}>
      <View
        style={{
          height: 48,
          paddingHorizontal: 10,
          flexDirection: 'row',
          alignItems: 'center',
        }}
      >
        <Arrow name="chevron-left" label="Previous flow" onPress={() => step(-1)} />
        <View style={{ flex: 1, alignItems: 'center' }}>
          <ILText role="label" color={CREAM} style={{ fontSize: 14, lineHeight: 18 }}>
            {flowLabel(STEPS[index])}
          </ILText>
          <ILText role="bodySm" color="rgba(245,242,232,0.6)" style={{ fontSize: 11, lineHeight: 14 }}>
            Demo step {index + 1} of {STEPS.length}
          </ILText>
        </View>
        <Arrow name="chevron-right" label="Next flow" onPress={() => step(1)} />
        <Pressable
          onPress={() => setPickerOpen(true)}
          accessibilityRole="button"
          accessibilityLabel="All flows"
          style={({ pressed }) => ({
            marginLeft: 8,
            height: 34,
            paddingHorizontal: 12,
            borderRadius: 17,
            flexDirection: 'row',
            alignItems: 'center',
            backgroundColor: pressed ? 'rgba(245,242,232,0.24)' : 'rgba(245,242,232,0.12)',
          })}
        >
          <MaterialIcons name="apps" size={16} color={CREAM} />
          <ILText role="label" color={CREAM} style={{ marginLeft: 6, fontSize: 12, lineHeight: 16 }}>
            All flows
          </ILText>
        </Pressable>
      </View>

      <Modal visible={pickerOpen} animationType="slide" onRequestClose={() => setPickerOpen(false)}>
        <JourneyPickerScreen
          navigation={{ goBack: () => setPickerOpen(false) }}
          onPick={() => setPickerOpen(false)}
          authSteps={AUTH_STEPS}
          onAuthStep={(s) => {
            setPickerOpen(false);
            open(s);
          }}
        />
      </Modal>
    </View>
  );
}

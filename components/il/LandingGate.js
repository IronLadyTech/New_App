import React from 'react';
import { View } from 'react-native';
import { useILGuideWhisper } from '../../hooks/useILGuideWhisper';
import { IL_GUIDE_SURFACES } from '../../constants/ilGuide';
import { getEnrolledPrograms } from '../../utils/programAccess';
import AccountFoundScreen from '../../screens/auth/AccountFoundScreen';
import FirstLoginWelcomeScreen from '../../screens/auth/FirstLoginWelcomeScreen';
import ChooseBatchDateScreen from '../../screens/auth/ChooseBatchDateScreen';
import SeatHeldScreen from '../../screens/auth/SeatHeldScreen';
import JourneyPickerScreen from '../../screens/auth/JourneyPickerScreen';

export default function LandingGate({ profile, forcedClosed }) {
  const { completeOnboard } = useILGuideWhisper(IL_GUIDE_SURFACES.ONBOARD);
  const [step, setStep] = React.useState('welcome');
  const [batch, setBatch] = React.useState(null);
  const [closed, setClosed] = React.useState(false);
  const leave = () => {
    setClosed(true);
    completeOnboard();
  };
  if (forcedClosed || closed || !profile || profile.ilGuideOnboarded) return null;

  const programs = getEnrolledPrograms(profile);
  const wrap = (node) => (
    <View
      style={{
        position: 'absolute',
        left: 0,
        right: 0,
        top: 0,
        bottom: 0,
        zIndex: 40,
        elevation: 50,
        backgroundColor: '#F7F6E4',
      }}
    >
      {node}
    </View>
  );
  if (programs.length >= 2) {
    return wrap(
      <AccountFoundScreen
        onDone={leave}
        route={{
          params: {
            phone: profile.phoneNumber,
            programs: programs.map((p, i) => ({
              id: p.id,
              title: p.title,
              status: i === 0 ? 'Enrolled · opens first' : 'Registered',
              meta: p.shortLabel,
              primary: i === 0,
            })),
          },
        }}
      />
    );
  }

  if (step === 'picker') {
    return wrap(
      <JourneyPickerScreen
        route={{ params: { name: profile?.displayName?.split(' ')[0] } }}
        onPick={leave}
      />
    );
  }

  if (step === 'held') {
    return wrap(
      <SeatHeldScreen
        route={{ params: { batch } }}
        onContinue={() => setStep('picker')}
      />
    );
  }

  if (step === 'batch') {
    return wrap(
      <ChooseBatchDateScreen
        onLock={(picked) => {
          setBatch(picked);
          setStep('held');
        }}
      />
    );
  }

  return wrap(<FirstLoginWelcomeScreen onGoBatch={() => setStep('batch')} />);
}

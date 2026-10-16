import React from 'react';
import { View } from 'react-native';
import { useILGuideWhisper } from '../../hooks/useILGuideWhisper';
import { IL_GUIDE_SURFACES } from '../../constants/ilGuide';
import {
  getEnrolledPrograms,
  needsLepBatchSelection,
  programPaymentStatus,
} from '../../utils/programAccess';
import { PAYMENT_STATUS } from '../../constants/programs';
import AccountFoundScreen from '../../screens/auth/AccountFoundScreen';
import FirstLoginWelcomeScreen from '../../screens/auth/FirstLoginWelcomeScreen';
import ChooseBatchDateScreen from '../../screens/auth/ChooseBatchDateScreen';
import SeatHeldScreen from '../../screens/auth/SeatHeldScreen';
import JourneyPickerScreen from '../../screens/auth/JourneyPickerScreen';
import { useProgramNav } from '../../context/ProgramNavContext';
import { useAuth } from '../../context/AuthContext';
import { updateUserProfile } from '../../services/firestore';

export default function LandingGate({ profile, forcedClosed }) {
  const { completeOnboard } = useILGuideWhisper(IL_GUIDE_SURFACES.ONBOARD);
  const { logout, user, patchProfile } = useAuth();
  const { setProgram } = useProgramNav();
  const [step, setStep] = React.useState('welcome');
  const [batch, setBatch] = React.useState(null);
  const [entryProgram, setEntryProgram] = React.useState(null);
  const [closed, setClosed] = React.useState(false);
  const leave = (programId) => {
    if (typeof programId === 'string') setProgram(programId);
    const stamp = new Date().toISOString();
    patchProfile({ welcomeCompletedAt: stamp });
    if (user?.uid && user.uid !== 'preview') {
      updateUserProfile(user.uid, { welcomeCompletedAt: stamp }).catch(() => {});
    }
    setClosed(true);
    completeOnboard();
  };
  if (forcedClosed || closed || !profile) return null;

  const programs = getEnrolledPrograms(profile)
    .map((program) => ({
      ...program,
      enrolled: programPaymentStatus(profile, program.id) === PAYMENT_STATUS.PAID,
    }))
    .sort((a, b) => Number(b.enrolled) - Number(a.enrolled));
  const primaryId = programs[0]?.id;
  // Welcome is separate from IL Guide whisper (`ilGuideOnboarded`).
  if (!programs.length || profile.welcomeCompletedAt) return null;
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
  if (programs.length >= 2 && step === 'welcome') {
    return wrap(
      <AccountFoundScreen
        onDone={(programId) => {
          const id = programId || primaryId;
          setEntryProgram(id);
          if (needsLepBatchSelection(profile)) setStep('batch');
          else leave(id);
        }}
        onBack={() => logout()}
        route={{
          params: {
            phone: profile.phoneNumber,
            programs: programs.map((p) => ({
              id: p.id,
              title: p.title,
              status: p.enrolled
                ? p.id === primaryId
                  ? 'Enrolled · opens first'
                  : 'Enrolled'
                : 'Registered',
              meta: p.shortLabel,
              primary: p.id === primaryId,
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
        onContinue={() => {
          if (entryProgram) leave(entryProgram);
          else setStep('picker');
        }}
      />
    );
  }

  if (step === 'batch') {
    if (!needsLepBatchSelection(profile)) {
      leave(primaryId || 'lep');
      return null;
    }
    return wrap(
      <ChooseBatchDateScreen
        onBack={() => setStep('welcome')}
        onLock={(picked) => {
          setBatch(picked);
          setStep('held');
        }}
      />
    );
  }

  const openBatchOrContinue = () => {
    if (needsLepBatchSelection(profile)) setStep('batch');
    else leave(primaryId || 'lep');
  };

  return wrap(
    <FirstLoginWelcomeScreen
      onGoBatch={openBatchOrContinue}
      onDone={() => leave(primaryId || 'lep')}
      onBack={() => logout()}
    />
  );
}

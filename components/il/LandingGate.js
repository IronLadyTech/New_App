import React from 'react';
import { View } from 'react-native';
import { useILGuideWhisper } from '../../hooks/useILGuideWhisper';
import { IL_GUIDE_SURFACES } from '../../constants/ilGuide';
import {
  learnerBatchLabel,
  learnerEnrollmentLabel,
  needsLepBatchSelection,
  programPaymentStatus,
  programsOnProfile,
} from '../../utils/programAccess';
import { PAYMENT_STATUS } from '../../constants/programs';
import AccountFoundScreen from '../../screens/auth/AccountFoundScreen';
import FirstLoginWelcomeScreen from '../../screens/auth/FirstLoginWelcomeScreen';
import ChooseBatchDateScreen from '../../screens/auth/ChooseBatchDateScreen';
import SeatHeldScreen from '../../screens/auth/SeatHeldScreen';
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

  const programs = programsOnProfile(profile)
    .map((program) => ({
      ...program,
      enrolled: programPaymentStatus(profile, program.id) === PAYMENT_STATUS.PAID,
    }))
    .sort((a, b) => Number(b.enrolled) - Number(a.enrolled));
  const primaryId = programs[0]?.id;

  const accountFoundParams = () => ({
    phone: profile.phoneNumber,
    programs: programs.map((p) => {
      const tier = learnerEnrollmentLabel(profile, p.id);
      const enrolled = tier === 'Enrolled' || p.enrolled;
      const batch = learnerBatchLabel(profile, p.id);
      let meta = p.shortLabel;
      if (enrolled && batch) meta = batch;
      else if (!enrolled && tier === 'Registered') {
        meta = 'Part payment received · batch details open soon';
      }
      return {
        id: p.id,
        title: p.title,
        status: enrolled
          ? p.id === primaryId
            ? 'Enrolled · opens first'
            : 'Enrolled'
          : 'Registered',
        meta,
        primary: p.id === primaryId,
      };
    }),
  });
  const needsBatch = needsLepBatchSelection(profile);

  // First login: welcome (+ batch if needed). Stay on batch until one is locked.
  if (!programs.length) return null;
  if (profile.welcomeCompletedAt && !needsBatch) return null;

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

  const openBatchOrContinue = () => {
    if (needsLepBatchSelection(profile)) setStep('batch');
    else leave(primaryId || 'lep');
  };

  // Welcome already done but batch still missing → batch picker only.
  const gateStep =
    profile.welcomeCompletedAt && needsBatch && step === 'welcome' ? 'batch' : step;

  const renderAccountFound = () =>
    wrap(
      <AccountFoundScreen
        onDone={(programId) => {
          const id = programId || primaryId;
          setEntryProgram(id);
          if (needsLepBatchSelection(profile)) setStep('batch');
          else leave(id);
        }}
        onBack={() => logout()}
        route={{ params: accountFoundParams() }}
      />
    );

  if (programs.length >= 2 && (gateStep === 'welcome' || gateStep === 'picker')) {
    return renderAccountFound();
  }

  if (gateStep === 'held') {
    return wrap(
      <SeatHeldScreen
        route={{ params: { batch } }}
        onContinue={() => {
          const target = entryProgram || primaryId || 'lep';
          if (programs.length >= 2 && !entryProgram) {
            setStep('welcome');
            return;
          }
          leave(target);
        }}
      />
    );
  }

  if (gateStep === 'batch') {
    if (!needsLepBatchSelection(profile)) {
      leave(primaryId || 'lep');
      return null;
    }
    return wrap(
      <ChooseBatchDateScreen
        onBack={() => {
          if (profile.welcomeCompletedAt) return;
          setStep('welcome');
        }}
        onLock={(picked) => {
          setBatch(picked);
          setStep('held');
        }}
      />
    );
  }

  return wrap(
    <FirstLoginWelcomeScreen
      onGoBatch={openBatchOrContinue}
      onDone={() => {
        if (needsLepBatchSelection(profile)) {
          setStep('batch');
          return;
        }
        leave(primaryId || 'lep');
      }}
      onBack={() => logout()}
    />
  );
}

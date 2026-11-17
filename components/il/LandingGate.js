import React from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { BackHandler, Platform, View } from 'react-native';
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

/** Runs `onLeave` once after it mounts: state changes and writes never happen during a render. */
function LeaveAfterRender({ onLeave }) {
  const done = React.useRef(false);
  React.useEffect(() => {
    if (done.current) return;
    done.current = true;
    onLeave();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  return null;
}

export default function LandingGate({ profile, forcedClosed }) {
  const { completeOnboard } = useILGuideWhisper(IL_GUIDE_SURFACES.ONBOARD);
  const { logout, user, patchProfile, profileFresh } = useAuth();
  // Finished on this phone for this account: never shown again, even if the server write of
  // welcomeCompletedAt was slow or failed.
  const doneKey = user?.uid ? `il_welcome_done_${user.uid}` : null;
  const [doneHere, setDoneHere] = React.useState(null); // null = still reading
  React.useEffect(() => {
    if (!doneKey) {
      setDoneHere(false);
      return;
    }
    AsyncStorage.getItem(doneKey)
      .then((v) => setDoneHere(v === '1'))
      .catch(() => setDoneHere(false));
  }, [doneKey]);
  const { setProgram } = useProgramNav();
  const [step, setStep] = React.useState('welcome');
  const [batch, setBatch] = React.useState(null);
  const [entryProgram, setEntryProgram] = React.useState(null);
  const [closed, setClosed] = React.useState(false);
  // The gate is an overlay, not a screen, so Android back would act on the hidden tabs.
  // Each step sets what back does; null lets the system handle it (leaves the app).
  const backRef = React.useRef(null);
  backRef.current = null;
  React.useEffect(() => {
    if (Platform.OS !== 'android') return undefined;
    const sub = BackHandler.addEventListener('hardwareBackPress', () => {
      if (!backRef.current) return false;
      backRef.current();
      return true;
    });
    return () => sub.remove();
    // Re-subscribe on each step: handlers run newest-first, so this stays ahead of React Navigation's.
  }, [step]);
  const leave = (programId) => {
    if (typeof programId === 'string') setProgram(programId);
    const stamp = new Date().toISOString();
    if (doneKey) AsyncStorage.setItem(doneKey, '1').catch(() => {});
    patchProfile({ welcomeCompletedAt: stamp });
    if (user?.uid && user.uid !== 'preview') {
      updateUserProfile(user.uid, { welcomeCompletedAt: stamp }).catch(() => {});
    }
    setClosed(true);
    completeOnboard();
  };
  if (forcedClosed || closed || !profile) return null;
  // Decide from the server's copy only — the phone's saved copy can be older than her last
  // welcome/batch steps, and opened them again on every launch.
  if (!profileFresh || doneHere === null) return null;

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
  const welcomeDone = Boolean(profile.welcomeCompletedAt) || doneHere;
  if (welcomeDone && !needsBatch) return null;

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
    welcomeDone && needsBatch && step === 'welcome' ? 'batch' : step;

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
    const continueFromHeld = () => {
      const target = entryProgram || primaryId || 'lep';
      if (programs.length >= 2 && !entryProgram) {
        setStep('welcome');
        return;
      }
      leave(target);
    };
    // The seat is already saved here; back dismisses the confirmation like Continue.
    backRef.current = continueFromHeld;
    return wrap(<SeatHeldScreen route={{ params: { batch } }} onContinue={continueFromHeld} />);
  }

  if (gateStep === 'batch') {
    // Batch already in place (e.g. set from Zoho): close the gate after this render, not inside it.
    if (!needsLepBatchSelection(profile)) return <LeaveAfterRender onLeave={() => leave(primaryId || 'lep')} />;
    // Back returns to welcome, like the on-screen arrow; with welcome done this is the first step.
    if (!welcomeDone) backRef.current = () => setStep('welcome');
    return wrap(
      <ChooseBatchDateScreen
        onBack={() => {
          if (welcomeDone) return;
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

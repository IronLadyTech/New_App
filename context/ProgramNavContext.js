import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { useNavigation } from '@react-navigation/native';
import { useAuth } from './AuthContext';
import { PAYMENT_STATUS } from '../constants/programs';
import { getEnrolledProgramIds, lockedProgramIds, programPaymentStatus } from '../utils/programAccess';

const ProgramNavContext = createContext(null);

export const PROGRAM_FILTERS = [
  { id: 'all', label: 'All' },
  { id: 'lep', label: 'LEP' },
  { id: '100bm', label: '100BM' },
  { id: 'mbw', label: 'MBW' },
];

export function deriveHomeProgram(profile) {
  if (!profile) return 'lep';
  if (profile.labProgram) return profile.labProgram;
  const ids = getEnrolledProgramIds(profile);
  const order = ['lep', '100bm', 'mbw'];
  const owned = order.filter((id) => ids.has(id));
  if (!owned.length) return 'lep';
  const lepPaid = ids.has('lep') && programPaymentStatus(profile, 'lep') === PAYMENT_STATUS.PAID;
  const bmRegistered =
    ids.has('100bm') && programPaymentStatus(profile, '100bm') === PAYMENT_STATUS.REGISTER;
  if (owned.length > 1 && lepPaid && bmRegistered) return 'all';
  const paid = owned.filter((id) => programPaymentStatus(profile, id) === PAYMENT_STATUS.PAID);
  return paid[0] || owned[0];
}

export function programStage(profile, programId) {
  if (profile?.labProgram === programId && (profile?.labState === 'enrolled' || profile?.labState === 'registered')) {
    return profile.labState;
  }
  if (programId !== '100bm' && programId !== 'mbw') return 'enrolled';
  return programPaymentStatus(profile, programId) === PAYMENT_STATUS.REGISTER
    ? 'registered'
    : 'enrolled';
}

export function ProgramNavProvider({ children }) {
  const { profile } = useAuth();
  const [picked, setPicked] = useState(false);
  const [program, setProgramState] = useState('lep');
  const [section, setSection] = useState('Journey');
  const [stageOverride, setStageOverride] = useState(null);

  // A new demo journey (picked after Seat held) starts from its own program and stage.
  const journey = `${profile?.labProgram || ''}:${profile?.labState || ''}`;
  useEffect(() => {
    const [prog] = journey.split(':');
    setPicked(false);
    setStageOverride(null);
    setSection('Journey');
    if (prog) setProgramState(prog);
  }, [journey]);

  const shown = picked ? program : deriveHomeProgram(profile);

  const setProgram = useCallback((id) => {
    if (lockedProgramIds(profile).has(id)) return;
    setPicked(true);
    setProgramState(id);
    setSection('Journey');
  }, [profile]);

  const value = useMemo(
    () => ({
      program: shown,
      section,
      setProgram,
      setSection,
      setStage: setStageOverride,
      stage: stageOverride || programStage(profile, shown),
    }),
    [shown, section, setProgram, stageOverride, profile]
  );

  return <ProgramNavContext.Provider value={value}>{children}</ProgramNavContext.Provider>;
}

export function useProgramNav() {
  const ctx = useContext(ProgramNavContext);
  if (!ctx) throw new Error('useProgramNav must be used within ProgramNavProvider');
  return ctx;
}

/** Null outside the signed-in app (guest and sign-in screens). */
export function useProgramNavMaybe() {
  return useContext(ProgramNavContext);
}

export function useProgramRoutes() {
  const navigation = useNavigation();
  const nav = useProgramNav();
  const { profile } = useAuth();

  const openMyProgram = useCallback(
    (programId, nextSection = 'Journey') => {
      if (programId && lockedProgramIds(profile).has(programId)) return;
      nav.setProgram(programId);
      nav.setSection(nextSection);
      navigation.navigate('MyProgram');
    },
    [nav, navigation, profile]
  );

  // Open the Learn tab itself: it shows the program's own Learn screen
  // (100BM Learn, LEP Learn…), not the old Moodle task list.
  const openLearn = useCallback(
    (programId) => {
      if (programId && lockedProgramIds(profile).has(programId)) return;
      if (programId && typeof programId === 'string' && programId !== nav.program) {
        nav.setProgram(programId);
      }
      navigation.navigate('Learn', { screen: 'LepLearn' });
    },
    [nav, navigation, profile]
  );

  const openPayment = useCallback(() => {
    navigation.navigate('Profile', { screen: 'PaymentEnrollment' });
  }, [navigation]);

  const openCertificates = useCallback(() => {
    navigation.navigate('Profile', { screen: 'Certificates' });
  }, [navigation]);

  const openEngage = useCallback(() => {
    navigation.navigate('Engage');
  }, [navigation]);

  return {
    ...nav,
    openMyProgram,
    openLearn,
    openPayment,
    openCertificates,
    openEngage,
  };
}

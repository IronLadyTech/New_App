import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { useNavigation } from '@react-navigation/native';
import { useAuth } from './AuthContext';
import { PAYMENT_STATUS, getProgramEntry } from '../constants/programs';
import { getEnrolledProgramIds, programPaymentStatus } from '../utils/programAccess';

const ProgramNavContext = createContext(null);

export const PROGRAM_FILTERS = [
  { id: 'all', label: 'All' },
  { id: 'lep', label: 'LEP' },
  { id: '100bm', label: '100BM' },
  { id: 'mbw', label: 'MBW' },
];

export function deriveHomeProgram(profile) {
  if (!profile) return 'lep';
  const ids = getEnrolledProgramIds(profile);
  const lepPaid = ids.has('lep') && programPaymentStatus(profile, 'lep') === PAYMENT_STATUS.PAID;
  const bmRegistered =
    ids.has('100bm') && programPaymentStatus(profile, '100bm') === PAYMENT_STATUS.REGISTER;
  if (lepPaid && bmRegistered) return 'all';
  if (ids.has('mbw') && !ids.has('lep')) return 'mbw';
  if (ids.has('100bm') && !ids.has('lep')) return '100bm';
  return 'lep';
}

export function programStage(profile, programId) {
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
    setPicked(false);
    setStageOverride(null);
    setSection('Journey');
  }, [journey]);

  const shown = picked ? program : deriveHomeProgram(profile);

  const setProgram = useCallback((id) => {
    setPicked(true);
    setProgramState(id);
  }, []);

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

export function useProgramRoutes() {
  const navigation = useNavigation();
  const nav = useProgramNav();

  const openMyProgram = useCallback(
    (programId, nextSection = 'Journey') => {
      nav.setProgram(programId);
      nav.setSection(nextSection);
      navigation.navigate('MyProgram');
    },
    [nav, navigation]
  );

  const openLearn = useCallback(
    (programId) => {
      const entry = getProgramEntry(programId);
      navigation.navigate('Learn', {
        screen: 'ProgramTasks',
        params: {
          programId,
          title: entry?.title || 'Program',
        },
      });
    },
    [navigation]
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

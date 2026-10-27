import React, { useEffect, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { View } from 'react-native';
import { LepAlumniHomeScreen, LepGraduationScreen } from './LepFlowScreens';
import { Page } from './LepBits';

const GRADUATION_SEEN_KEY = 'lep_graduation_celebrated_v1';

/**
 * Post-cohort Home: graduation celebration once, then alumni dashboard (design screens).
 */
export default function LepAlumniGate() {
  const [phase, setPhase] = useState('loading');

  useEffect(() => {
    let cancelled = false;
    AsyncStorage.getItem(GRADUATION_SEEN_KEY).then((v) => {
      if (!cancelled) setPhase(v === '1' ? 'alumni' : 'graduation');
    });
    return () => {
      cancelled = true;
    };
  }, []);

  const onCelebrated = () => {
    AsyncStorage.setItem(GRADUATION_SEEN_KEY, '1').catch(() => {});
    setPhase('alumni');
  };

  if (phase === 'loading') {
    return <Page><View style={{ flex: 1 }} /></Page>;
  }
  if (phase === 'graduation') {
    return <LepGraduationScreen onCelebrated={onCelebrated} />;
  }
  return <LepAlumniHomeScreen />;
}

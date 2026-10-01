import React, { useState } from 'react';
import { Pressable, ScrollView, View } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useAuth } from '../context/AuthContext';
import TabNavigator from './TabNavigator';
import LandingGate from '../components/il/LandingGate';
import { CoursesProvider } from '../context/CoursesContext';
import { EngagementProvider } from '../context/EngagementContext';
import { ProgramsProvider } from '../context/ProgramsContext';
import { ProgramNavProvider, useProgramNav } from '../context/ProgramNavContext';
import { getProgramEntry } from '../constants/programs';
import { usePushNotifications } from '../hooks/usePushNotifications';
import ILText from '../components/il/ILText';

export default function AuthenticatedApp() {
  const { profile } = useAuth();
  const [gateClosed, setGateClosed] = useState(false);
  usePushNotifications();

  return (
    <CoursesProvider>
      <ProgramsProvider>
        <EngagementProvider>
          <ProgramNavProvider>
            <View style={{ flex: 1 }}>
              <AppNavBar onJump={() => setGateClosed(true)} />
              <View style={{ flex: 1 }}>
                <TabNavigator />
                <LandingGate profile={profile} forcedClosed={gateClosed} />
              </View>
            </View>
          </ProgramNavProvider>
        </EngagementProvider>
      </ProgramsProvider>
    </CoursesProvider>
  );
}

function AppNavBar({ onJump }) {
  const navigation = useNavigation();
  const { program, setProgram, stage, setStage, setSection } = useProgramNav();
  const current = program === 'mbw' ? 'mbw' : '100bm';

  const open = (tab, programId, nextStage, section) => {
    onJump();
    const id = programId || current;
    setProgram(id);
    if (nextStage) setStage(nextStage);
    if (section) setSection(section);
    if (tab === 'Learn') {
      const entry = getProgramEntry(id);
      navigation.navigate('Learn', {
        screen: 'ProgramTasks',
        params: { programId: id, title: entry?.title || 'Program' },
      });
      return;
    }
    navigation.navigate(tab);
  };

  const chip = (label, on, onPress) => (
    <Pressable
      key={label}
      onPress={onPress}
      accessibilityRole="button"
      style={{
        marginRight: 6,
        borderRadius: 999,
        paddingHorizontal: 12,
        paddingVertical: 8,
        backgroundColor: on ? '#ED1D24' : 'rgba(255,255,255,0.14)',
      }}
    >
      <ILText role="label" color="#FFFFFF" style={{ fontSize: 13 }}>
        {label}
      </ILText>
    </Pressable>
  );

  return (
    <View style={{ backgroundColor: '#113744', paddingVertical: 8, paddingHorizontal: 12, zIndex: 60 }}>
      <ScrollView horizontal showsHorizontalScrollIndicator={false}>
        {chip('100BM', program === '100bm', () => open('Home', '100bm', stage === 'enrolled' ? 'enrolled' : 'registered'))}
        {chip('MBW', program === 'mbw', () => open('Home', 'mbw', stage === 'enrolled' ? 'enrolled' : 'registered'))}
        {chip('Registered', stage === 'registered', () => open('Home', current, 'registered'))}
        {chip('Enrolled', stage === 'enrolled', () => open('Home', current, 'enrolled'))}
        {chip('Home', false, () => open('Home', current))}
        {chip('Journey', false, () => open('MyProgram', current, stage, 'Journey'))}
        {chip('Sessions', false, () => open('MyProgram', current, stage, 'Sessions'))}
        {chip('Cohort', false, () => open('MyProgram', current, stage, 'Cohort'))}
        {chip('Learn', false, () => open('Learn', current))}
        {chip('Engage', false, () => open('Engage', current))}
        {chip('Profile', false, () => open('Profile', current))}
      </ScrollView>
    </View>
  );
}

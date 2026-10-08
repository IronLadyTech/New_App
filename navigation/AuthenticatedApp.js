import React from 'react';
import { View } from 'react-native';
import { useAuth } from '../context/AuthContext';
import TabNavigator from './TabNavigator';
import LandingGate from '../components/il/LandingGate';
import { CoursesProvider } from '../context/CoursesContext';
import { EngagementProvider } from '../context/EngagementContext';
import { ProgramsProvider } from '../context/ProgramsContext';
import { CourseDemoProvider } from '../context/CourseDemoContext';
import { ProgramNavProvider } from '../context/ProgramNavContext';
import { usePushNotifications } from '../hooks/usePushNotifications';

export default function AuthenticatedApp() {
  const { profile } = useAuth();
  usePushNotifications();

  return (
    <CoursesProvider>
      <ProgramsProvider>
        <CourseDemoProvider>
        <EngagementProvider>
          <ProgramNavProvider>
            <View style={{ flex: 1 }}>
              <TabNavigator />
              <LandingGate profile={profile} />
            </View>
          </ProgramNavProvider>
        </EngagementProvider>
        </CourseDemoProvider>
      </ProgramsProvider>
    </CoursesProvider>
  );
}

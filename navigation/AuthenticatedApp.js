import React from 'react';
import { useAuth } from '../context/AuthContext';
import TabNavigator from './TabNavigator';
import LandingGate from '../components/il/LandingGate';
import { CoursesProvider } from '../context/CoursesContext';
import { EngagementProvider } from '../context/EngagementContext';
import { ProgramsProvider } from '../context/ProgramsContext';
import { usePushNotifications } from '../hooks/usePushNotifications';

export default function AuthenticatedApp() {
  const { profile } = useAuth();
  usePushNotifications();

  return (
    <CoursesProvider>
      <ProgramsProvider>
        <EngagementProvider>
          <TabNavigator />
          <LandingGate profile={profile} />
        </EngagementProvider>
      </ProgramsProvider>
    </CoursesProvider>
  );
}

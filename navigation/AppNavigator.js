import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { useAuth } from '../context/AuthContext';
import AuthNavigator from './AuthNavigator';
import TabNavigator from './TabNavigator';
import LoadingState from '../components/LoadingState';
import ILGuideOnboardGate from '../components/ILGuideOnboardGate';
import { CoursesProvider } from '../context/CoursesContext';
import { EngagementProvider } from '../context/EngagementContext';
import { ProgramsProvider } from '../context/ProgramsContext';

function AuthenticatedApp() {
  const { profile } = useAuth();

  return (
    <CoursesProvider>
      <ProgramsProvider>
        <EngagementProvider>
          <ILGuideOnboardGate profile={profile} />
          <TabNavigator />
        </EngagementProvider>
      </ProgramsProvider>
    </CoursesProvider>
  );
}

export default function AppNavigator() {
  const { isAuthenticated, initializing } = useAuth();

  if (initializing) {
    return <LoadingState message="Checking session…" />;
  }

  return (
    <NavigationContainer>
      {isAuthenticated ? <AuthenticatedApp /> : <AuthNavigator />}
    </NavigationContainer>
  );
}

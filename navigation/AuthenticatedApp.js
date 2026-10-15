import React, { useEffect, useState } from 'react';
import { View } from 'react-native';
import { useAuth } from '../context/AuthContext';
import TabNavigator from './TabNavigator';
import LandingGate from '../components/il/LandingGate';
import LoadingState from '../components/LoadingState';
import { CoursesProvider } from '../context/CoursesContext';
import { EngagementProvider } from '../context/EngagementContext';
import { ProgramsProvider } from '../context/ProgramsContext';
import { CourseDemoProvider } from '../context/CourseDemoContext';
import { ProgramNavProvider } from '../context/ProgramNavContext';
import { usePushNotifications } from '../hooks/usePushNotifications';
import { useNotificationOpen } from '../hooks/useNotificationOpen';

export default function AuthenticatedApp() {
  const { profile, user } = useAuth();
  const [gaveUp, setGaveUp] = useState(false);
  usePushNotifications();
  useNotificationOpen();

  useEffect(() => {
    const timer = setTimeout(() => setGaveUp(true), 8000);
    return () => clearTimeout(timer);
  }, []);

  if (user && !profile && !gaveUp) {
    return <LoadingState message="Loading…" />;
  }

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

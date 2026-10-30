import React, { useEffect, useState } from 'react';
import { View } from 'react-native';
import { useAuth } from '../context/AuthContext';
import TabNavigator from './TabNavigator';
import LandingGate from '../components/il/LandingGate';
import StreakReminderSync from '../components/StreakReminderSync';
import LoadingState from '../components/LoadingState';
import { CoursesProvider } from '../context/CoursesContext';
import { EngagementProvider } from '../context/EngagementContext';
import { ProgramsProvider } from '../context/ProgramsContext';
import { CourseDemoProvider } from '../context/CourseDemoContext';
import { ProgramNavProvider } from '../context/ProgramNavContext';
import { usePushNotifications } from '../hooks/usePushNotifications';
import { useNotificationOpen } from '../hooks/useNotificationOpen';
import { useLocalEngagementNotifications } from '../hooks/useLocalEngagementNotifications';
import { useActivityTracking } from '../hooks/useActivityTracking';
import { prefetchArmyEvents } from '../hooks/useArmyEventCalendar';
import PerfHud from '../components/PerfHud';
import { setPerfUser } from '../utils/perfHud';

export default function AuthenticatedApp() {
  const { profile, user } = useAuth();
  const [gaveUp, setGaveUp] = useState(false);
  usePushNotifications();
  useLocalEngagementNotifications();
  useNotificationOpen();
  useActivityTracking();

  // Engage's events come from a Google Sheet: start that download now, not when she opens Engage.
  useEffect(() => {
    prefetchArmyEvents();
  }, []);

  // Tab-switch timings for the learner (testing aid, see utils/perfHud.js).
  useEffect(() => {
    setPerfUser(user?.uid && user.uid !== 'preview' ? user.uid : null);
  }, [user?.uid]);

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
              <StreakReminderSync />
              <PerfHud />
            </View>
          </ProgramNavProvider>
        </EngagementProvider>
        </CourseDemoProvider>
      </ProgramsProvider>
    </CoursesProvider>
  );
}

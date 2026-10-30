import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { useProgramNav } from '../context/ProgramNavContext';
import { useRenderProbe } from '../utils/perfHud';
import HomeScreen from '../screens/home/HomeScreen';
import LepHomeScreen from '../screens/lep/LepHomeScreen';
import NotificationsScreen from '../screens/notifications/NotificationsScreen';
import {
  LepAlumniHomeScreen,
  LepFirstMonthScreen,
  LepGraduationScreen,
  LepGuideChatScreen,
  LepMilestoneScreen,
  LepScheduleScreen,
  LepSessionCheckinScreen,
  LepTodayChecklistScreen,
} from '../screens/lep/LepFlowScreens';
import {
  LepAlumniCommunityScreen,
  LepAlumniGraduationFilmScreen,
} from '../screens/lep/LepAlumniExtraScreens';
import GuestProgramDetailScreen from '../screens/guest/GuestProgramDetailScreen';

const Stack = createNativeStackNavigator();

/** LEP keeps its own home; 100BM, MBW and two-program users get the program homes. */
function HomeRoot(props) {
  useRenderProbe('Home');
  const { program } = useProgramNav();
  return program === 'lep' ? <LepHomeScreen {...props} /> : <HomeScreen {...props} />;
}

export default function HomeStack() {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
        animation: 'slide_from_right',
        statusBarTranslucent: true,
        statusBarColor: 'transparent',
        statusBarStyle: 'dark',
      }}
    >
      <Stack.Screen name="LepHome" component={HomeRoot} options={{ statusBarStyle: 'light' }} />
      <Stack.Screen name="Schedule" component={LepScheduleScreen} />
      <Stack.Screen name="Notifications" component={NotificationsScreen} />
      <Stack.Screen
        name="GuideChat"
        component={LepGuideChatScreen}
        options={{ presentation: 'transparentModal', animation: 'fade' }}
      />
      <Stack.Screen name="TodayChecklist" component={LepTodayChecklistScreen} />
      <Stack.Screen
        name="RitualsDashboard"
        getComponent={() => require('../screens/lep/LepRitualsDashboardScreen').default}
      />
      <Stack.Screen name="SessionCheckin" component={LepSessionCheckinScreen} />
      <Stack.Screen name="Milestone" component={LepMilestoneScreen} />
      <Stack.Screen name="FirstMonth" component={LepFirstMonthScreen} />
      <Stack.Screen name="Graduation" component={LepGraduationScreen} />
      <Stack.Screen name="Alumni" component={LepAlumniHomeScreen} />
      <Stack.Screen name="AlumniGraduationFilm" component={LepAlumniGraduationFilmScreen} />
      <Stack.Screen name="AlumniCommunity" component={LepAlumniCommunityScreen} />
      <Stack.Screen name="ProgramDetail" component={GuestProgramDetailScreen} />
      <Stack.Screen
        name="Practice"
        getComponent={() => require('../screens/program/PracticeScreen').default}
      />
      <Stack.Screen
        name="Watch"
        getComponent={() => require('../screens/program/WatchScreen').default}
      />
      <Stack.Screen
        name="CourseTask"
        getComponent={() => require('../screens/program/CourseTaskScreen').default}
      />
      <Stack.Screen
        name="TaskDocument"
        getComponent={() => require('../screens/program/TaskDocumentScreen').default}
      />
      <Stack.Screen
        name="CoursePhase"
        getComponent={() => require('../screens/program/CoursePhaseScreen').default}
      />
    </Stack.Navigator>
  );
}

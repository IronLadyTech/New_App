import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { useProgramNav } from '../context/ProgramNavContext';
import HomeScreen from '../screens/home/HomeScreen';
import LepHomeScreen from '../screens/lep/LepHomeScreen';
import {
  LepAlumniHomeScreen,
  LepFirstMonthScreen,
  LepGraduationScreen,
  LepGuideChatScreen,
  LepMilestoneScreen,
  LepNotificationsScreen,
  LepScheduleScreen,
  LepSessionCheckinScreen,
  LepTodayChecklistScreen,
} from '../screens/lep/LepFlowScreens';

const Stack = createNativeStackNavigator();

/** LEP keeps its own home; 100BM, MBW and two-program users get the program homes. */
function HomeRoot(props) {
  const { program } = useProgramNav();
  return program === 'lep' ? <LepHomeScreen {...props} /> : <HomeScreen {...props} />;
}

export default function HomeStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false, animation: 'slide_from_right' }}>
      <Stack.Screen name="LepHome" component={HomeRoot} />
      <Stack.Screen name="Schedule" component={LepScheduleScreen} />
      <Stack.Screen name="Notifications" component={LepNotificationsScreen} />
      <Stack.Screen
        name="GuideChat"
        component={LepGuideChatScreen}
        options={{ presentation: 'transparentModal', animation: 'fade' }}
      />
      <Stack.Screen name="TodayChecklist" component={LepTodayChecklistScreen} />
      <Stack.Screen name="SessionCheckin" component={LepSessionCheckinScreen} />
      <Stack.Screen name="Milestone" component={LepMilestoneScreen} />
      <Stack.Screen name="FirstMonth" component={LepFirstMonthScreen} />
      <Stack.Screen name="Graduation" component={LepGraduationScreen} />
      <Stack.Screen name="Alumni" component={LepAlumniHomeScreen} />
    </Stack.Navigator>
  );
}

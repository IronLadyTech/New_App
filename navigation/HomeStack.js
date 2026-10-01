import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
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

export default function HomeStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false, animation: 'slide_from_right' }}>
      <Stack.Screen name="LepHome" component={LepHomeScreen} />
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

import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import LepMyProgramScreen from '../screens/lep/LepMyProgramScreen';
import {
  LepAssignmentScreen,
  LepPhaseDetailScreen,
  LepQuizScreen,
} from '../screens/lep/LepFlowScreens';

const Stack = createNativeStackNavigator();

export default function MyProgramStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false, animation: 'slide_from_right' }}>
      <Stack.Screen name="LepProgram" component={LepMyProgramScreen} />
      <Stack.Screen name="PhaseDetail" component={LepPhaseDetailScreen} />
      <Stack.Screen name="Assignment" component={LepAssignmentScreen} />
      <Stack.Screen name="Quiz" component={LepQuizScreen} />
    </Stack.Navigator>
  );
}

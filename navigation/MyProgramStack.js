import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { useProgramNav } from '../context/ProgramNavContext';
import MyProgramScreen from '../screens/program/MyProgramScreen';
import LepMyProgramScreen from '../screens/lep/LepMyProgramScreen';
import {
  LepAssignmentScreen,
  LepPhaseDetailScreen,
  LepQuizScreen,
} from '../screens/lep/LepFlowScreens';

const Stack = createNativeStackNavigator();

function MyProgramRoot(props) {
  const { program } = useProgramNav();
  return program === 'lep' ? <LepMyProgramScreen {...props} /> : <MyProgramScreen {...props} />;
}

export default function MyProgramStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false, animation: 'slide_from_right' }}>
      <Stack.Screen name="LepProgram" component={MyProgramRoot} />
      <Stack.Screen name="PhaseDetail" component={LepPhaseDetailScreen} />
      <Stack.Screen name="Assignment" component={LepAssignmentScreen} />
      <Stack.Screen name="Quiz" component={LepQuizScreen} />
    </Stack.Navigator>
  );
}

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
  return program === 'lep' ? (
    <LepMyProgramScreen {...props} />
  ) : (
    <MyProgramScreen {...props} />
  );
}

export default function MyProgramStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false, animation: 'slide_from_right' }}>
      <Stack.Screen name="LepProgram" component={MyProgramRoot} />
      <Stack.Screen name="PhaseDetail" component={LepPhaseDetailScreen} />
      <Stack.Screen
        name="CoursePhase"
        getComponent={() => require('../screens/program/CoursePhaseScreen').default}
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
        name="ManagerChat"
        getComponent={() => require('../screens/program/ManagerChatScreen').default}
      />
      <Stack.Screen name="Assignment" component={LepAssignmentScreen} />
      <Stack.Screen name="Quiz" component={LepQuizScreen} />
      <Stack.Screen
        name="Watch"
        getComponent={() => require('../screens/program/WatchScreen').default}
      />
    </Stack.Navigator>
  );
}

import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { useProgramNav } from '../context/ProgramNavContext';

const Stack = createNativeStackNavigator();

function LearnRoot(props) {
  const { program } = useProgramNav();
  const Screen =
    program === 'lep'
      ? require('../screens/lep/LepLearnScreen').default
      : program === '100bm'
        ? require('../screens/learn/BmLearnScreen').default
        : program === 'mbw'
          ? require('../screens/learn/MbwLearnScreen').default
          : require('../screens/learn/LearnLibrary').default;
  return <Screen {...props} />;
}

export default function LearnStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="LepLearn" component={LearnRoot} />
      <Stack.Screen
        name="Programs"
        getComponent={() => require('../screens/learn/LearnLibrary').default}
      />
      <Stack.Screen
        name="ProgramTasks"
        getComponent={() => require('../screens/learn/ProgramTasksScreen').default}
      />
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
        name="TaskSubmit"
        getComponent={() => require('../screens/learn/TaskSubmitScreen').default}
      />
      <Stack.Screen
        name="Catalog"
        getComponent={() => require('../screens/learn/CatalogScreen').default}
      />
      <Stack.Screen
        name="CourseDetail"
        getComponent={() => require('../screens/learn/CourseDetailScreen').default}
      />
      <Stack.Screen
        name="LessonPlayer"
        getComponent={() => require('../screens/learn/LessonPlayerScreen').default}
      />
      <Stack.Screen
        name="Watch"
        getComponent={() => require('../screens/program/WatchScreen').default}
      />
      <Stack.Screen
        name="Quiz"
        getComponent={() => require('../screens/learn/QuizScreen').default}
      />
    </Stack.Navigator>
  );
}

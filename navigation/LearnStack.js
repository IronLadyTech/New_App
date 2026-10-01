import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

const Stack = createNativeStackNavigator();

export default function LearnStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen
        name="Programs"
        getComponent={() => require('../screens/learn/LearnLibrary').default}
      />
      <Stack.Screen
        name="ProgramTasks"
        getComponent={() => require('../screens/learn/ProgramTasksScreen').default}
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
        name="Quiz"
        getComponent={() => require('../screens/learn/QuizScreen').default}
      />
    </Stack.Navigator>
  );
}

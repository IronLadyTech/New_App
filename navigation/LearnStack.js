import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import ProgramsScreen from '../screens/learn/ProgramsScreen';
import ProgramTasksScreen from '../screens/learn/ProgramTasksScreen';
import TaskSubmitScreen from '../screens/learn/TaskSubmitScreen';
import CatalogScreen from '../screens/learn/CatalogScreen';
import CourseDetailScreen from '../screens/learn/CourseDetailScreen';
import LessonPlayerScreen from '../screens/learn/LessonPlayerScreen';
import QuizScreen from '../screens/learn/QuizScreen';

const Stack = createNativeStackNavigator();

export default function LearnStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="Programs" component={ProgramsScreen} />
      <Stack.Screen name="ProgramTasks" component={ProgramTasksScreen} />
      <Stack.Screen name="TaskSubmit" component={TaskSubmitScreen} />
      {/* Legacy generic course screens (optional) */}
      <Stack.Screen name="Catalog" component={CatalogScreen} />
      <Stack.Screen name="CourseDetail" component={CourseDetailScreen} />
      <Stack.Screen name="LessonPlayer" component={LessonPlayerScreen} />
      <Stack.Screen name="Quiz" component={QuizScreen} />
    </Stack.Navigator>
  );
}

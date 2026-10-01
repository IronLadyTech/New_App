import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import ILTabBar from '../components/il/ILTabBar';

const Tab = createBottomTabNavigator();

export default function TabNavigator() {
  return (
    <Tab.Navigator
      tabBar={(props) => <ILTabBar {...props} />}
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          position: 'absolute',
          backgroundColor: 'transparent',
          borderTopWidth: 0,
          elevation: 0,
          shadowOpacity: 0,
        },
        safeAreaInsets: { bottom: 0 },
      }}
    >
      <Tab.Screen
        name="Home"
        getComponent={() => require('../screens/home/HomeScreen').default}
        options={{ tabBarLabel: 'Home' }}
      />
      <Tab.Screen
        name="MyProgram"
        getComponent={() => require('../screens/program/MyProgramScreen').default}
        options={{ tabBarLabel: 'My Program' }}
      />
      <Tab.Screen
        name="Learn"
        getComponent={() => require('./LearnStack').default}
        options={{ tabBarLabel: 'Learn' }}
      />
      <Tab.Screen
        name="Engage"
        getComponent={() => require('./EngageStack').default}
        options={{ tabBarLabel: 'Engage' }}
      />
      <Tab.Screen
        name="Profile"
        getComponent={() => require('./ProfileStack').default}
        options={{
          tabBarButton: () => null,
          tabBarItemStyle: { display: 'none' },
        }}
      />
    </Tab.Navigator>
  );
}

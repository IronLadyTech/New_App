import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import HomeScreen from '../screens/home/HomeScreen';
import LearnStack from './LearnStack';
import EngageStack from './EngageStack';
import ProfileStack from './ProfileStack';
import { COLORS } from '../constants';

const Tab = createBottomTabNavigator();

const ICONS = {
  Home: { focused: 'home', idle: 'home-outline' },
  Learn: { focused: 'book', idle: 'book-outline' },
  Engage: { focused: 'people', idle: 'people-outline' },
  Profile: { focused: 'person', idle: 'person-outline' },
};

export default function TabNavigator() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarActiveTintColor: COLORS.brand,
        tabBarInactiveTintColor: COLORS.muted,
        tabBarStyle: {
          backgroundColor: '#fff',
          borderTopColor: '#eceef2',
          height: 60,
          paddingBottom: 8,
          paddingTop: 6,
        },
        tabBarLabelStyle: {
          fontSize: 11,
          fontWeight: '600',
        },
        tabBarIcon: ({ focused, color, size }) => {
          const set = ICONS[route.name] || ICONS.Home;
          return (
            <Ionicons
              name={focused ? set.focused : set.idle}
              size={size}
              color={color}
            />
          );
        },
      })}
    >
      <Tab.Screen name="Home" component={HomeScreen} />
      <Tab.Screen name="Learn" component={LearnStack} />
      <Tab.Screen name="Engage" component={EngageStack} />
      <Tab.Screen name="Profile" component={ProfileStack} />
    </Tab.Navigator>
  );
}

import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import GuestHomeScreen from '../screens/guest/GuestHomeScreen';
import GuestProgramsScreen from '../screens/guest/GuestProgramsScreen';
import GuestEngageScreen from '../screens/guest/GuestEngageScreen';
import GuestProgramDetailScreen from '../screens/guest/GuestProgramDetailScreen';
import GuestChallengeHubScreen from '../screens/guest/GuestChallengeHubScreen';
import GuestTabBar from '../components/il/GuestTabBar';

const Tab = createBottomTabNavigator();
const Stack = createNativeStackNavigator();

function GuestTabs() {
  return (
    <Tab.Navigator
      tabBar={(props) => <GuestTabBar {...props} />}
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
      <Tab.Screen name="Home" component={GuestHomeScreen} options={{ tabBarLabel: 'Home' }} />
      <Tab.Screen
        name="Programs"
        component={GuestProgramsScreen}
        options={{ tabBarLabel: 'Programs' }}
      />
      <Tab.Screen name="Engage" component={GuestEngageScreen} options={{ tabBarLabel: 'Engage' }} />
    </Tab.Navigator>
  );
}

export default function GuestNavigator() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false, animation: 'slide_from_right' }}>
      <Stack.Screen name="GuestTabs" component={GuestTabs} />
      <Stack.Screen name="ProgramDetail" component={GuestProgramDetailScreen} />
      <Stack.Screen name="ChallengeHub" component={GuestChallengeHubScreen} />
    </Stack.Navigator>
  );
}

import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import GuestHomeScreen from '../screens/guest/GuestHomeScreen';
import GuestProgramsScreen from '../screens/guest/GuestProgramsScreen';
import GuestEngageScreen from '../screens/guest/GuestEngageScreen';
import GuestProgramDetailScreen from '../screens/guest/GuestProgramDetailScreen';
import GuestChallengeHubScreen from '../screens/guest/GuestChallengeHubScreen';
import GuestChallengeDayScreen from '../screens/guest/GuestChallengeDayScreen';
import GuestChallengeBonusScreen from '../screens/guest/GuestChallengeBonusScreen';
import GuestChallengeCompleteScreen from '../screens/guest/GuestChallengeCompleteScreen';
import GuestChallengeDoneScreen from '../screens/guest/GuestChallengeDoneScreen';
import GuestTabBar from '../components/il/GuestTabBar';

const Tab = createBottomTabNavigator();
const Stack = createNativeStackNavigator();

function GuestHomeStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false, animation: 'slide_from_right' }}>
      <Stack.Screen name="GuestHome" component={GuestHomeScreen} />
      <Stack.Screen name="ChallengeHub" component={GuestChallengeHubScreen} />
      <Stack.Screen name="ChallengeDay" component={GuestChallengeDayScreen} />
      <Stack.Screen name="ChallengeComplete" component={GuestChallengeCompleteScreen} />
      <Stack.Screen name="ChallengeBonus" component={GuestChallengeBonusScreen} />
      <Stack.Screen name="ChallengeDone" component={GuestChallengeDoneScreen} />
    </Stack.Navigator>
  );
}

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
      <Tab.Screen name="Home" component={GuestHomeStack} options={{ tabBarLabel: 'Home' }} />
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
    </Stack.Navigator>
  );
}

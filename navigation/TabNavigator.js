import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import ILTabBar from '../components/il/ILTabBar';

const Tab = createBottomTabNavigator();

// Module constants: new ones on every render made the tab bar and every tab re-render too.
const renderTabBar = (props) => <ILTabBar {...props} />;
const SCREEN_OPTIONS = {
  headerShown: false,
  // Hidden tabs stop re-rendering on every data change, so the tab she opens gets the
  // JS thread. (The old Android "dead tap" after a switch was fixed in react-native-screens 4.x.)
  freezeOnBlur: true,
  tabBarStyle: {
    position: 'absolute',
    backgroundColor: 'transparent',
    borderTopWidth: 0,
    elevation: 0,
    shadowOpacity: 0,
  },
  safeAreaInsets: { bottom: 0 },
};

export default function TabNavigator() {
  return (
    // Back returns to the tab she came from (e.g. Profile opened from "Complete your profile"
    // goes back to that task list), not always to Home.
    <Tab.Navigator tabBar={renderTabBar} screenOptions={SCREEN_OPTIONS} backBehavior="history">
      <Tab.Screen
        name="Home"
        getComponent={() => require('./HomeStack').default}
        options={{ tabBarLabel: 'Home' }}
      />
      <Tab.Screen
        name="MyProgram"
        getComponent={() => require('./MyProgramStack').default}
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

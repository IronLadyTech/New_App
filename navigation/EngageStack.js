import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

const Stack = createNativeStackNavigator();

export default function EngageStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen
        name="Feed"
        getComponent={() => require('../screens/engage/EngageHome').default}
      />
      <Stack.Screen
        name="PostDetail"
        getComponent={() => require('../screens/engage/PostDetailScreen').default}
      />
      <Stack.Screen
        name="CreatePost"
        getComponent={() => require('../screens/engage/CreatePostScreen').default}
      />
      <Stack.Screen
        name="Leaderboard"
        getComponent={() => require('../screens/engage/LeaderboardScreen').default}
      />
    </Stack.Navigator>
  );
}

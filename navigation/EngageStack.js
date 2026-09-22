import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import FeedScreen from '../screens/engage/FeedScreen';
import PostDetailScreen from '../screens/engage/PostDetailScreen';
import CreatePostScreen from '../screens/engage/CreatePostScreen';
import LeaderboardScreen from '../screens/engage/LeaderboardScreen';

const Stack = createNativeStackNavigator();

export default function EngageStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="Feed" component={FeedScreen} />
      <Stack.Screen name="PostDetail" component={PostDetailScreen} />
      <Stack.Screen name="CreatePost" component={CreatePostScreen} />
      <Stack.Screen name="Leaderboard" component={LeaderboardScreen} />
    </Stack.Navigator>
  );
}

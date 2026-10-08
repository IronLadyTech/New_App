import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { useProgramNav } from '../context/ProgramNavContext';
import EngageHome from '../screens/engage/EngageHome';
import LepEngageScreen from '../screens/lep/LepEngageScreen';
import { LepEventTicketScreen } from '../screens/lep/LepFlowScreens';

const Stack = createNativeStackNavigator();

function EngageRoot(props) {
  const { program } = useProgramNav();
  return program === 'lep' ? <LepEngageScreen {...props} /> : <EngageHome {...props} />;
}

export default function EngageStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="LepEngage" component={EngageRoot} />
      <Stack.Screen name="EventTicket" component={LepEventTicketScreen} />
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
      <Stack.Screen
        name="Watch"
        getComponent={() => require('../screens/program/WatchScreen').default}
      />
    </Stack.Navigator>
  );
}

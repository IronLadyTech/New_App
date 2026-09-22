import React from 'react';
import { FlatList, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useEngagement } from '../../context/EngagementContext';
import { useAuth } from '../../context/AuthContext';
import LoadingState from '../../components/LoadingState';
import EmptyState from '../../components/EmptyState';
import { COLORS } from '../../constants';

export default function LeaderboardScreen({ navigation }) {
  const { leaderboard, loading } = useEngagement();
  const { user } = useAuth();

  if (loading && leaderboard.length === 0) {
    return <LoadingState message="Loading leaderboard…" />;
  }

  return (
    <SafeAreaView className="flex-1 bg-ink-50" edges={['top']}>
      <View className="flex-row items-center px-4 py-3">
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={22} color={COLORS.ink} />
        </TouchableOpacity>
        <Text className="ml-3 text-xl font-bold text-ink-950">Leaderboard</Text>
      </View>

      <FlatList
        data={leaderboard}
        keyExtractor={(item) => item.id}
        contentContainerStyle={{ padding: 16, flexGrow: 1 }}
        ListEmptyComponent={
          <EmptyState
            icon="trophy-outline"
            title="No rankings yet"
            message="Earn points by completing lessons and posting."
          />
        }
        renderItem={({ item, index }) => {
          const isMe = item.id === user?.uid;
          const medal =
            index === 0 ? '🥇' : index === 1 ? '🥈' : index === 2 ? '🥉' : `${index + 1}`;
          return (
            <View
              className={`mb-2 flex-row items-center rounded-2xl border p-4 ${
                isMe
                  ? 'border-brand-300 bg-brand-50'
                  : 'border-ink-100 bg-white'
              }`}
            >
              <Text className="w-10 text-center text-lg">{medal}</Text>
              <View className="flex-1">
                <Text className="font-semibold text-ink-900">
                  {item.displayName || item.email || 'Learner'}
                  {isMe ? ' (you)' : ''}
                </Text>
                <Text className="text-xs capitalize text-ink-400">
                  {item.role || 'student'}
                </Text>
              </View>
              <Text className="text-base font-bold text-brand-700">
                {item.points || 0} pts
              </Text>
            </View>
          );
        }}
      />
    </SafeAreaView>
  );
}

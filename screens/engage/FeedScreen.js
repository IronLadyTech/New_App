import React from 'react';
import { FlatList, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useEngagement } from '../../context/EngagementContext';
import { useAuth } from '../../context/AuthContext';
import PostCard from '../../components/PostCard';
import LoadingState from '../../components/LoadingState';
import EmptyState from '../../components/EmptyState';
import ErrorState from '../../components/ErrorState';
import { COLORS } from '../../constants';
import ILGuideWhisper from '../../components/ILGuideWhisper';
import { useILGuideWhisper } from '../../hooks/useILGuideWhisper';
import { IL_GUIDE_SURFACES } from '../../constants/ilGuide';

export default function FeedScreen({ navigation }) {
  const { posts, loading, error, likePost } = useEngagement();
  const { user } = useAuth();
  const {
    whisper: ilWhisper,
    loading: ilLoading,
    hidden: ilHidden,
    dismiss: dismissILGuide,
  } = useILGuideWhisper(IL_GUIDE_SURFACES.COMMUNITY);

  if (loading && posts.length === 0) {
    return <LoadingState message="Loading community…" />;
  }

  if (error && posts.length === 0) {
    return <ErrorState message={error} />;
  }

  return (
    <SafeAreaView className="flex-1 bg-ink-50" edges={['top']}>
      <View className="flex-row items-center justify-between px-4 pb-2 pt-2">
        <View>
          <Text className="text-2xl font-bold text-ink-950">Engage</Text>
          <Text className="text-sm text-ink-500">Community feed · live sync</Text>
        </View>
        <View className="flex-row">
          <TouchableOpacity
            onPress={() => navigation.navigate('Leaderboard')}
            className="mr-2 h-10 w-10 items-center justify-center rounded-full bg-white border border-ink-100"
          >
            <Ionicons name="trophy-outline" size={20} color={COLORS.brand} />
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => navigation.navigate('CreatePost')}
            className="h-10 w-10 items-center justify-center rounded-full bg-brand-600"
          >
            <Ionicons name="add" size={24} color="#fff" />
          </TouchableOpacity>
        </View>
      </View>

      <View className="px-4">
        <ILGuideWhisper
          message={ilWhisper?.message}
          loading={ilLoading}
          hidden={ilHidden}
          onDismiss={dismissILGuide}
        />
      </View>

      <FlatList
        data={posts}
        keyExtractor={(item) => item.id}
        contentContainerStyle={{ padding: 16, paddingTop: 8, flexGrow: 1 }}
        ListEmptyComponent={
          <EmptyState
            icon="chatbubbles-outline"
            title="No posts yet"
            message="Be the first to start a discussion."
            actionLabel="Create post"
            onAction={() => navigation.navigate('CreatePost')}
          />
        }
        renderItem={({ item }) => (
          <PostCard
            post={item}
            currentUid={user?.uid}
            onLike={likePost}
            onPress={() =>
              navigation.navigate('PostDetail', { postId: item.id })
            }
          />
        )}
      />
    </SafeAreaView>
  );
}

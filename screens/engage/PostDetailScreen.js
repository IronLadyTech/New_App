import React, { useState } from 'react';
import {
  Alert,
  FlatList,
  KeyboardAvoidingView,
  Platform,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { usePostDetail } from '../../hooks/usePostDetail';
import { useEngagement } from '../../context/EngagementContext';
import { useAuth } from '../../context/AuthContext';
import LoadingState from '../../components/LoadingState';
import ErrorState from '../../components/ErrorState';
import EmptyState from '../../components/EmptyState';
import { COLORS } from '../../constants';

export default function PostDetailScreen({ route, navigation }) {
  const { postId } = route.params;
  const { post, comments, loading, error } = usePostDetail(postId);
  const { likePost, commentOnPost } = useEngagement();
  const { user } = useAuth();
  const [text, setText] = useState('');
  const [sending, setSending] = useState(false);

  const onSend = async () => {
    if (!text.trim()) return;
    setSending(true);
    try {
      await commentOnPost(postId, text.trim());
      setText('');
    } catch (e) {
      Alert.alert('Error', e.message);
    } finally {
      setSending(false);
    }
  };

  if (loading) return <LoadingState />;
  if (error) return <ErrorState message={error} />;
  if (!post) {
    return (
      <EmptyState
        title="Post removed"
        actionLabel="Back"
        onAction={() => navigation.goBack()}
      />
    );
  }

  const liked = (post.likeIds || []).includes(user?.uid);

  return (
    <SafeAreaView className="flex-1 bg-ink-50" edges={['top']}>
      <KeyboardAvoidingView
        className="flex-1"
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <View className="flex-row items-center px-4 py-3">
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Ionicons name="arrow-back" size={22} color={COLORS.ink} />
          </TouchableOpacity>
          <Text className="ml-3 text-lg font-semibold text-ink-900">Discussion</Text>
        </View>

        <FlatList
          data={comments}
          keyExtractor={(item) => item.id}
          contentContainerStyle={{ padding: 16, paddingBottom: 24 }}
          ListHeaderComponent={
            <View className="mb-4 rounded-2xl border border-ink-100 bg-white p-4">
              <Text className="text-xs text-ink-400">
                {post.authorName} · {post.likeCount || 0} likes ·{' '}
                {post.commentCount || 0} comments
              </Text>
              {post.title ? (
                <Text className="mt-2 text-xl font-bold text-ink-950">
                  {post.title}
                </Text>
              ) : null}
              <Text className="mt-2 text-base leading-6 text-ink-700">
                {post.content}
              </Text>
              <TouchableOpacity
                onPress={() => likePost(postId)}
                className="mt-4 flex-row items-center self-start"
              >
                <Ionicons
                  name={liked ? 'heart' : 'heart-outline'}
                  size={20}
                  color={liked ? '#dc2626' : COLORS.muted}
                />
                <Text className="ml-1.5 text-sm text-ink-600">
                  {liked ? 'Liked' : 'Like'}
                </Text>
              </TouchableOpacity>
              <Text className="mb-2 mt-5 text-sm font-semibold text-ink-800">
                Comments
              </Text>
            </View>
          }
          ListEmptyComponent={
            <Text className="px-2 text-sm text-ink-500">
              No comments yet — say something.
            </Text>
          }
          renderItem={({ item }) => (
            <View className="mb-2 rounded-xl border border-ink-100 bg-white p-3">
              <Text className="text-xs font-semibold text-ink-700">
                {item.authorName}
              </Text>
              <Text className="mt-1 text-sm text-ink-800">{item.content}</Text>
            </View>
          )}
        />

        <View className="flex-row items-end border-t border-ink-100 bg-white px-3 py-2">
          <TextInput
            className="mr-2 max-h-28 flex-1 rounded-xl border border-ink-200 bg-ink-50 px-3 py-2.5 text-base text-ink-900"
            placeholder="Write a comment…"
            placeholderTextColor={COLORS.muted}
            value={text}
            onChangeText={setText}
            multiline
          />
          <TouchableOpacity
            onPress={onSend}
            disabled={sending || !text.trim()}
            className="mb-0.5 rounded-xl bg-brand-600 px-4 py-2.5"
          >
            <Text className="font-semibold text-white">
              {sending ? '…' : 'Send'}
            </Text>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

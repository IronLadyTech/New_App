import React from 'react';
import { Text, TouchableOpacity, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '../constants';

function timeAgo(createdAt) {
  if (!createdAt?.toDate) return '';
  const ms = Date.now() - createdAt.toDate().getTime();
  const mins = Math.floor(ms / 60000);
  if (mins < 1) return 'just now';
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  return `${Math.floor(hrs / 24)}d ago`;
}

export default function PostCard({ post, currentUid, onPress, onLike }) {
  const liked = (post.likeIds || []).includes(currentUid);

  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.9}
      className="mb-3 rounded-2xl border border-ink-100 bg-white p-4"
    >
      <View className="mb-2 flex-row items-center">
        <View className="mr-2 h-9 w-9 items-center justify-center rounded-full bg-brand-100">
          <Text className="font-semibold text-brand-700">
            {(post.authorName || '?').charAt(0).toUpperCase()}
          </Text>
        </View>
        <View className="flex-1">
          <Text className="text-sm font-semibold text-ink-900">
            {post.authorName || 'Learner'}
          </Text>
          <Text className="text-xs text-ink-400">{timeAgo(post.createdAt)}</Text>
        </View>
      </View>

      {post.title ? (
        <Text className="mb-1 text-base font-semibold text-ink-900">{post.title}</Text>
      ) : null}
      <Text className="text-sm leading-5 text-ink-600" numberOfLines={4}>
        {post.content}
      </Text>

      <View className="mt-3 flex-row items-center">
        <TouchableOpacity
          onPress={(e) => {
            e?.stopPropagation?.();
            onLike?.(post.id);
          }}
          className="mr-5 flex-row items-center"
          hitSlop={8}
        >
          <Ionicons
            name={liked ? 'heart' : 'heart-outline'}
            size={18}
            color={liked ? '#dc2626' : COLORS.muted}
          />
          <Text className="ml-1 text-sm text-ink-500">{post.likeCount || 0}</Text>
        </TouchableOpacity>
        <View className="flex-row items-center">
          <Ionicons name="chatbubble-outline" size={17} color={COLORS.muted} />
          <Text className="ml-1 text-sm text-ink-500">{post.commentCount || 0}</Text>
        </View>
      </View>
    </TouchableOpacity>
  );
}

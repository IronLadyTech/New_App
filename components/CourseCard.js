import React from 'react';
import { Text, TouchableOpacity, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import ProgressBar from './ProgressBar';
import { COLORS } from '../constants';

export default function CourseCard({
  course,
  progress,
  enrolled,
  onPress,
}) {
  const percent = progress?.percentComplete ?? 0;

  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.85}
      className="mb-3 overflow-hidden rounded-2xl border border-ink-100 bg-white p-4"
    >
      <View className="mb-2 flex-row items-start justify-between">
        <View className="flex-1 pr-3">
          <Text className="text-base font-semibold text-ink-900" numberOfLines={2}>
            {course.title}
          </Text>
          <Text className="mt-1 text-xs text-ink-400">
            {course.instructorName || 'Instructor'} · {course.level || 'Beginner'}
          </Text>
        </View>
        <View className="rounded-lg bg-brand-50 px-2 py-1">
          <Text className="text-xs font-medium text-brand-700">
            {course.category || 'Course'}
          </Text>
        </View>
      </View>

      {course.description ? (
        <Text className="mb-3 text-sm leading-5 text-ink-500" numberOfLines={2}>
          {course.description}
        </Text>
      ) : null}

      {enrolled ? (
        <View>
          <View className="mb-1.5 flex-row items-center justify-between">
            <Text className="text-xs text-ink-500">Progress</Text>
            <Text className="text-xs font-semibold text-brand-700">{percent}%</Text>
          </View>
          <ProgressBar percent={percent} />
        </View>
      ) : (
        <View className="flex-row items-center">
          <Ionicons name="play-circle-outline" size={18} color={COLORS.brand} />
          <Text className="ml-1.5 text-sm font-medium text-brand-700">View course</Text>
        </View>
      )}
    </TouchableOpacity>
  );
}

import React, { useMemo, useState } from 'react';
import { FlatList, Text, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useCourses } from '../../context/CoursesContext';
import { useAuth } from '../../context/AuthContext';
import CourseCard from '../../components/CourseCard';
import LoadingState from '../../components/LoadingState';
import EmptyState from '../../components/EmptyState';
import ErrorState from '../../components/ErrorState';
import { COLORS } from '../../constants';

export default function CatalogScreen({ navigation }) {
  const { courses, progressByCourse, loading, error } = useCourses();
  const { profile } = useAuth();
  const [query, setQuery] = useState('');

  const enrolledIds = useMemo(() => {
    const ids = new Set(profile?.enrolledCourseIds || []);
    Object.keys(progressByCourse).forEach((id) => ids.add(id));
    return ids;
  }, [profile?.enrolledCourseIds, progressByCourse]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return courses;
    return courses.filter(
      (c) =>
        c.title?.toLowerCase().includes(q) ||
        c.description?.toLowerCase().includes(q) ||
        c.category?.toLowerCase().includes(q)
    );
  }, [courses, query]);

  if (loading && courses.length === 0) {
    return <LoadingState message="Loading catalog…" />;
  }

  if (error && courses.length === 0) {
    return <ErrorState message={error} />;
  }

  return (
    <SafeAreaView className="flex-1 bg-ink-50" edges={['top']}>
      <View className="px-4 pb-2 pt-2">
        <Text className="text-2xl font-bold text-ink-950">Learn</Text>
        <Text className="mt-1 text-sm text-ink-500">
          Browse courses — updates sync live from Firestore
        </Text>
        <TextInput
          className="mt-3 rounded-xl border border-ink-200 bg-white px-4 py-3 text-base text-ink-900"
          placeholder="Search courses…"
          placeholderTextColor={COLORS.muted}
          value={query}
          onChangeText={setQuery}
        />
      </View>

      <FlatList
        data={filtered}
        keyExtractor={(item) => item.id}
        contentContainerStyle={{ padding: 16, paddingTop: 8, flexGrow: 1 }}
        ListEmptyComponent={
          <EmptyState
            icon="book-outline"
            title="No courses found"
            message={
              query
                ? 'Try a different search.'
                : 'Add documents to the courses collection to populate this list.'
            }
          />
        }
        renderItem={({ item }) => (
          <CourseCard
            course={item}
            enrolled={enrolledIds.has(item.id)}
            progress={progressByCourse[item.id]}
            onPress={() =>
              navigation.navigate('CourseDetail', { courseId: item.id })
            }
          />
        )}
      />
    </SafeAreaView>
  );
}

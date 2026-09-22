import React, { useState } from 'react';
import {
  Alert,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useCourseDetail } from '../../hooks/useCourseDetail';
import { useCourses } from '../../context/CoursesContext';
import { useAuth } from '../../context/AuthContext';
import ProgressBar from '../../components/ProgressBar';
import LoadingState from '../../components/LoadingState';
import EmptyState from '../../components/EmptyState';
import ErrorState from '../../components/ErrorState';
import { COLORS } from '../../constants';

export default function CourseDetailScreen({ route, navigation }) {
  const { courseId } = route.params;
  const { course, lessons, loading, error } = useCourseDetail(courseId);
  const { progressByCourse, enroll } = useCourses();
  const { profile, isStaff } = useAuth();
  const [enrolling, setEnrolling] = useState(false);

  const progress = progressByCourse[courseId];
  const enrolled =
    profile?.enrolledCourseIds?.includes(courseId) || !!progress;
  const completed = new Set(progress?.completedLessonIds || []);

  const onEnroll = async () => {
    setEnrolling(true);
    try {
      await enroll(courseId);
      Alert.alert('Enrolled', 'You are now enrolled. Progress syncs live.');
    } catch (e) {
      Alert.alert('Could not enroll', e.message);
    } finally {
      setEnrolling(false);
    }
  };

  if (loading) return <LoadingState />;
  if (error) return <ErrorState message={error} />;
  if (!course) {
    return (
      <EmptyState
        title="Course not found"
        message="This course may have been removed."
        actionLabel="Back"
        onAction={() => navigation.goBack()}
      />
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-ink-50" edges={['top']}>
      <ScrollView contentContainerStyle={{ padding: 16, paddingBottom: 40 }}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          className="mb-3 flex-row items-center"
        >
          <Ionicons name="arrow-back" size={22} color={COLORS.ink} />
          <Text className="ml-1 text-sm text-ink-600">Catalog</Text>
        </TouchableOpacity>

        <Text className="text-2xl font-bold text-ink-950">{course.title}</Text>
        <Text className="mt-1 text-sm text-ink-500">
          {course.instructorName || 'Instructor'} · {course.level} ·{' '}
          {course.category}
        </Text>
        <Text className="mt-3 text-base leading-6 text-ink-600">
          {course.description || 'No description provided.'}
        </Text>

        {enrolled ? (
          <View className="mt-4 rounded-2xl border border-ink-100 bg-white p-4">
            <View className="mb-2 flex-row justify-between">
              <Text className="text-sm text-ink-500">Your progress</Text>
              <Text className="text-sm font-semibold text-brand-700">
                {progress?.percentComplete ?? 0}%
              </Text>
            </View>
            <ProgressBar percent={progress?.percentComplete ?? 0} height={10} />
          </View>
        ) : (
          <TouchableOpacity
            onPress={onEnroll}
            disabled={enrolling}
            className="mt-4 items-center rounded-xl bg-brand-600 py-4"
          >
            <Text className="font-semibold text-white">
              {enrolling ? 'Enrolling…' : 'Enroll in course'}
            </Text>
          </TouchableOpacity>
        )}

        {isStaff ? (
          <View className="mt-3 rounded-xl bg-brand-50 px-3 py-2">
            <Text className="text-xs text-brand-800">
              Teacher/Admin view — you can manage lessons in Firestore
              (lessons collection).
            </Text>
          </View>
        ) : null}

        <Text className="mb-3 mt-6 text-lg font-semibold text-ink-900">
          Lessons ({lessons.length})
        </Text>

        {lessons.length === 0 ? (
          <EmptyState
            icon="list-outline"
            title="No lessons yet"
            message="Add lesson documents with courseId matching this course."
          />
        ) : (
          lessons.map((lesson, index) => {
            const done = completed.has(lesson.id);
            const locked = !enrolled;
            return (
              <TouchableOpacity
                key={lesson.id}
                disabled={locked}
                onPress={() =>
                  navigation.navigate('LessonPlayer', {
                    courseId,
                    lessonId: lesson.id,
                    lessonTitle: lesson.title,
                  })
                }
                className={`mb-2 flex-row items-center rounded-2xl border border-ink-100 bg-white p-4 ${
                  locked ? 'opacity-50' : ''
                }`}
              >
                <View
                  className={`mr-3 h-9 w-9 items-center justify-center rounded-full ${
                    done ? 'bg-green-100' : 'bg-ink-100'
                  }`}
                >
                  <Text
                    className={`font-semibold ${
                      done ? 'text-green-700' : 'text-ink-600'
                    }`}
                  >
                    {done ? '✓' : index + 1}
                  </Text>
                </View>
                <View className="flex-1">
                  <Text className="font-medium text-ink-900">{lesson.title}</Text>
                  <Text className="mt-0.5 text-xs text-ink-400">
                    {lesson.durationMinutes
                      ? `${lesson.durationMinutes} min`
                      : 'Lesson'}
                    {lesson.quiz ? ' · Quiz' : ''}
                  </Text>
                </View>
                <Ionicons
                  name={locked ? 'lock-closed' : 'chevron-forward'}
                  size={18}
                  color={COLORS.muted}
                />
              </TouchableOpacity>
            );
          })
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

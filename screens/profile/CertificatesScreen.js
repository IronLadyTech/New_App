import React, { useMemo } from 'react';
import { FlatList, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useCourses } from '../../context/CoursesContext';
import EmptyState from '../../components/EmptyState';
import { BADGE_DEFS, COLORS } from '../../constants';
import { useAuth } from '../../context/AuthContext';

export default function CertificatesScreen({ navigation }) {
  const { enrolledCourses, progressByCourse } = useCourses();
  const { profile } = useAuth();

  const completed = useMemo(
    () =>
      enrolledCourses.filter(
        (c) => (progressByCourse[c.id]?.percentComplete || 0) >= 100
      ),
    [enrolledCourses, progressByCourse]
  );

  const badges = BADGE_DEFS.filter((b) => (profile?.points || 0) >= b.minPoints);

  return (
    <SafeAreaView className="flex-1 bg-ink-50" edges={['top']}>
      <View className="flex-row items-center px-4 py-3">
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={22} color={COLORS.ink} />
        </TouchableOpacity>
        <Text className="ml-3 text-xl font-bold text-ink-950">
          Certificates
        </Text>
      </View>

      <FlatList
        data={completed}
        keyExtractor={(item) => item.id}
        contentContainerStyle={{ padding: 16, flexGrow: 1 }}
        ListHeaderComponent={
          <View className="mb-4">
            <Text className="mb-2 text-sm font-semibold uppercase text-ink-400">
              Achievements
            </Text>
            <View className="mb-4 flex-row flex-wrap">
              {badges.length === 0 ? (
                <Text className="text-sm text-ink-500">No badges yet.</Text>
              ) : (
                badges.map((b) => (
                  <View
                    key={b.id}
                    className="mb-2 mr-2 rounded-xl border border-brand-200 bg-brand-50 px-3 py-2"
                  >
                    <Text className="text-sm font-semibold text-brand-800">
                      {b.label}
                    </Text>
                    <Text className="text-xs text-brand-600">
                      {b.minPoints}+ points
                    </Text>
                  </View>
                ))
              )}
            </View>
            <Text className="mb-2 text-sm font-semibold uppercase text-ink-400">
              Course certificates
            </Text>
          </View>
        }
        ListEmptyComponent={
          <EmptyState
            icon="ribbon-outline"
            title="No certificates yet"
            message="Finish a course (100% progress) to unlock a certificate card."
          />
        }
        renderItem={({ item }) => (
          <View className="mb-3 rounded-2xl border border-brand-200 bg-white p-5">
            <Text className="text-xs font-semibold uppercase tracking-wide text-brand-600">
              Certificate of completion
            </Text>
            <Text className="mt-2 text-lg font-bold text-ink-950">{item.title}</Text>
            <Text className="mt-1 text-sm text-ink-500">
              Awarded to {profile?.displayName || 'you'}
            </Text>
          </View>
        )}
      />
    </SafeAreaView>
  );
}

import React, { useMemo } from 'react';
import { ScrollView, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuth } from '../../context/AuthContext';
import { useCourses } from '../../context/CoursesContext';
import { usePrograms } from '../../context/ProgramsContext';
import WelcomeBanner from '../../components/WelcomeBanner';
import ProgressBar from '../../components/ProgressBar';
import LoadingState from '../../components/LoadingState';
import EmptyState from '../../components/EmptyState';
import ErrorState from '../../components/ErrorState';
import ILGuideWhisper from '../../components/ILGuideWhisper';
import { useILGuideWhisper } from '../../hooks/useILGuideWhisper';
import { IL_GUIDE_SURFACES } from '../../constants/ilGuide';

export default function HomeScreen({ navigation }) {
  const { profile, role } = useAuth();
  const { announcements, loading: coursesLoading, error } = useCourses();
  const {
    enrolledPrograms,
    progressByProgram,
    canOpen,
    loading: programsLoading,
  } = usePrograms();
  const {
    whisper: ilWhisper,
    loading: ilLoading,
    hidden: ilHidden,
    dismiss: dismissILGuide,
  } = useILGuideWhisper(IL_GUIDE_SURFACES.HOME);

  const overallProgress = useMemo(() => {
    if (!enrolledPrograms.length) return 0;
    const values = enrolledPrograms.map(
      (p) => progressByProgram[p.id]?.percent ?? 0
    );
    return Math.round(values.reduce((a, b) => a + b, 0) / values.length);
  }, [enrolledPrograms, progressByProgram]);

  if ((coursesLoading || programsLoading) && !enrolledPrograms.length) {
    return <LoadingState message="Loading your dashboard…" />;
  }

  if (error && !announcements.length && !enrolledPrograms.length) {
    return <ErrorState message={error} />;
  }

  return (
    <SafeAreaView className="flex-1 bg-ink-50" edges={['top']}>
      <ScrollView
        className="flex-1"
        contentContainerStyle={{ padding: 16, paddingBottom: 32 }}
        showsVerticalScrollIndicator={false}
      >
        <WelcomeBanner
          name={profile?.displayName || profile?.email}
          role={role}
        />

        <ILGuideWhisper
          message={ilWhisper?.message}
          loading={ilLoading}
          hidden={ilHidden}
          onDismiss={dismissILGuide}
        />

        <View className="mt-5 rounded-2xl border border-ink-100 bg-white p-4">
          <Text className="text-sm font-medium text-ink-500">
            Overall program progress
          </Text>
          <Text className="mt-1 text-3xl font-bold text-ink-950">
            {overallProgress}%
          </Text>
          <View className="mt-3">
            <ProgressBar percent={overallProgress} height={10} />
          </View>
          <Text className="mt-2 text-xs text-ink-400">
            {enrolledPrograms.length} program
            {enrolledPrograms.length === 1 ? '' : 's'} · synced with web LMS
          </Text>
        </View>

        <View className="mt-6 flex-row items-center justify-between">
          <Text className="text-lg font-semibold text-ink-900">My programs</Text>
          <TouchableOpacity onPress={() => navigation.navigate('Learn')}>
            <Text className="text-sm font-medium text-brand-700">Open Learn</Text>
          </TouchableOpacity>
        </View>

        {enrolledPrograms.length === 0 ? (
          <EmptyState
            icon="school-outline"
            title="No program enrollment yet"
            message="After Zoho enrollment/payment, use Profile → Refresh access. Tasks will appear here and on Learn."
          />
        ) : (
          enrolledPrograms.map((program) => {
            const progress = progressByProgram[program.id] || {
              percent: 0,
              done: 0,
              total: 0,
            };
            const open = canOpen(program.id);
            return (
              <TouchableOpacity
                key={program.id}
                disabled={!open}
                onPress={() =>
                  navigation.navigate('Learn', {
                    screen: 'ProgramTasks',
                    params: {
                      programId: program.id,
                      title: program.title,
                    },
                  })
                }
                className={`mb-3 rounded-2xl border border-ink-100 bg-white p-4 ${
                  open ? '' : 'opacity-55'
                }`}
              >
                <View className="mb-2 flex-row justify-between">
                  <Text className="font-semibold text-ink-900">
                    {program.shortLabel} — {program.title}
                  </Text>
                  <Text className="text-xs font-semibold text-brand-700">
                    {progress.percent}%
                  </Text>
                </View>
                <ProgressBar percent={progress.percent} />
                <Text className="mt-1.5 text-xs text-ink-400">
                  {progress.done}/{progress.total} tasks ·{' '}
                  {open ? 'Tap to continue' : 'Locked'}
                </Text>
              </TouchableOpacity>
            );
          })
        )}

        <Text className="mb-3 mt-4 text-lg font-semibold text-ink-900">
          Announcements
        </Text>
        {announcements.length === 0 ? (
          <View className="rounded-2xl border border-dashed border-ink-200 bg-white p-4">
            <Text className="text-sm text-ink-500">
              No announcements yet. CX publishes to the announcements collection.
            </Text>
          </View>
        ) : (
          announcements.map((a) => (
            <View
              key={a.id}
              className="mb-2 rounded-2xl border border-ink-100 bg-white p-4"
            >
              <Text className="font-semibold text-ink-900">{a.title}</Text>
              <Text className="mt-1 text-sm leading-5 text-ink-600">
                {a.body || a.message || a.content}
              </Text>
            </View>
          ))
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

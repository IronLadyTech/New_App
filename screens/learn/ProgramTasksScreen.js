import React, { useMemo } from 'react';
import { FlatList, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { usePrograms } from '../../context/ProgramsContext';
import ProgressBar from '../../components/ProgressBar';
import EmptyState from '../../components/EmptyState';
import { COLORS } from '../../constants';
import {
  statusLabel,
  isTaskDoneStatus,
  SUBMISSION_STATUS,
} from '../../constants/programs';
import { submissionsByTaskId } from '../../services/programs';

export default function ProgramTasksScreen({ route, navigation }) {
  const { programId, title } = route.params;
  const { tasksByProgram, subsByProgram, progressByProgram } = usePrograms();

  const tasks = tasksByProgram[programId] || [];
  const byTask = useMemo(
    () => submissionsByTaskId(subsByProgram[programId] || []),
    [subsByProgram, programId]
  );
  const progress = progressByProgram[programId] || { percent: 0, done: 0, total: 0 };

  return (
    <SafeAreaView className="flex-1 bg-ink-50" edges={['top']}>
      <View className="px-4 pb-2 pt-2">
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          className="mb-2 flex-row items-center"
        >
          <Ionicons name="arrow-back" size={22} color={COLORS.ink} />
          <Text className="ml-1 text-sm text-ink-600">Programs</Text>
        </TouchableOpacity>
        <Text className="text-xl font-bold text-ink-950">{title}</Text>
        <Text className="mt-1 text-sm text-ink-500">
          {progress.done} of {progress.total} completed · live sync with LMS
        </Text>
        <View className="mt-3">
          <ProgressBar percent={progress.percent} height={10} />
        </View>
      </View>

      <FlatList
        data={tasks}
        keyExtractor={(item) => item.id}
        contentContainerStyle={{ padding: 16, paddingTop: 8, flexGrow: 1 }}
        ListEmptyComponent={
          <EmptyState
            icon="list-outline"
            title="No tasks in Firestore yet"
            message={`Add documents to ${programId === 'mbw' ? 'mbw_tasks' : programId === 'lep' ? 'lep_tasks' : 'bm100_tasks'} or publish via CMS.`}
          />
        }
        renderItem={({ item, index }) => {
          const sub = byTask[item.id];
          const status = sub?.status;
          const done = isTaskDoneStatus(status);
          const needsAction =
            status === SUBMISSION_STATUS.NEEDS_IMPROVEMENT ||
            status === SUBMISSION_STATUS.REJECTED;

          return (
            <TouchableOpacity
              onPress={() =>
                navigation.navigate('TaskSubmit', {
                  programId,
                  taskId: item.id,
                  taskTitle: item.title,
                })
              }
              className="mb-2 flex-row items-center rounded-2xl border border-ink-100 bg-white p-4"
            >
              <View
                className={`mr-3 h-9 w-9 items-center justify-center rounded-full ${
                  done
                    ? 'bg-green-100'
                    : needsAction
                      ? 'bg-amber-100'
                      : 'bg-ink-100'
                }`}
              >
                <Text
                  className={`font-semibold ${
                    done
                      ? 'text-green-700'
                      : needsAction
                        ? 'text-amber-800'
                        : 'text-ink-600'
                  }`}
                >
                  {done ? '✓' : index + 1}
                </Text>
              </View>
              <View className="flex-1 pr-2">
                <Text className="font-medium text-ink-900" numberOfLines={2}>
                  {item.title}
                </Text>
                <Text className="mt-0.5 text-xs text-ink-400">
                  {item.type || 'task'} · {statusLabel(status)}
                </Text>
              </View>
              <Ionicons name="chevron-forward" size={18} color={COLORS.muted} />
            </TouchableOpacity>
          );
        }}
      />
    </SafeAreaView>
  );
}

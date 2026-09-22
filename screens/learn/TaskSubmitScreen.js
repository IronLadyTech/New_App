import React, { useEffect, useMemo, useState } from 'react';
import {
  Alert,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { VideoView, useVideoPlayer } from 'expo-video';
import { usePrograms } from '../../context/ProgramsContext';
import { fetchLessonAsset } from '../../services/functions';
import LoadingState from '../../components/LoadingState';
import EmptyState from '../../components/EmptyState';
import { COLORS } from '../../constants';
import {
  TASK_TYPES,
  SUBMISSION_STATUS,
  statusLabel,
  isTaskDoneStatus,
} from '../../constants/programs';

function LessonVideo({ uri }) {
  const player = useVideoPlayer(uri, (p) => {
    p.loop = false;
  });
  return (
    <VideoView
      style={{ width: '100%', height: 200, backgroundColor: '#000' }}
      player={player}
      allowsFullscreen
      contentFit="contain"
      nativeControls
    />
  );
}

export default function TaskSubmitScreen({ route, navigation }) {
  const { programId, taskId } = route.params;
  const { tasksByProgram, getTaskSubmission, submitTask } = usePrograms();

  const task = useMemo(
    () => (tasksByProgram[programId] || []).find((t) => t.id === taskId),
    [tasksByProgram, programId, taskId]
  );
  const submission = getTaskSubmission(programId, taskId);

  const [text, setText] = useState('');
  const [link, setLink] = useState('');
  const [videoUri, setVideoUri] = useState(null);
  const [assetReason, setAssetReason] = useState(null);
  const [saving, setSaving] = useState(false);
  const [loadingAsset, setLoadingAsset] = useState(false);

  useEffect(() => {
    setText(submission?.textValue || '');
    setLink(submission?.linkValue || '');
  }, [submission?.textValue, submission?.linkValue, taskId]);

  useEffect(() => {
    let mounted = true;
    (async () => {
      if (!task) return;
      const direct = task.videoUrl || task.youtubeUrl;
      if (direct) {
        setVideoUri(direct);
        return;
      }
      // Paid media via Cloud Function (same as web LMS)
      setLoadingAsset(true);
      const asset = await fetchLessonAsset(task.id);
      if (!mounted) return;
      setVideoUri(asset.url);
      setAssetReason(asset.reason);
      setLoadingAsset(false);
    })();
    return () => {
      mounted = false;
    };
  }, [task]);

  if (!task) {
    return (
      <SafeAreaView className="flex-1 bg-ink-50">
        <EmptyState
          title="Task not found"
          actionLabel="Back"
          onAction={() => navigation.goBack()}
        />
      </SafeAreaView>
    );
  }

  const done = isTaskDoneStatus(submission?.status);
  const type = task.type || TASK_TYPES.TEXT;

  const onSubmit = async (fields) => {
    setSaving(true);
    try {
      await submitTask(programId, task, fields);
      Alert.alert(
        'Submitted',
        'Saved to Firestore — this will show as submitted/completed on the web LMS too.'
      );
    } catch (e) {
      Alert.alert('Could not submit', e.message);
    } finally {
      setSaving(false);
    }
  };

  const onWatchComplete = () =>
    onSubmit({
      watchCompleted: true,
      watchProgress: 1,
    });

  return (
    <SafeAreaView className="flex-1 bg-ink-50" edges={['top']}>
      <ScrollView contentContainerStyle={{ padding: 16, paddingBottom: 40 }}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          className="mb-3 flex-row items-center"
        >
          <Ionicons name="arrow-back" size={22} color={COLORS.ink} />
          <Text className="ml-1 text-sm text-ink-600">Tasks</Text>
        </TouchableOpacity>

        <Text className="text-xl font-bold text-ink-950">{task.title}</Text>
        <Text className="mt-1 text-xs text-ink-400">
          {type} · {statusLabel(submission?.status)}
        </Text>

        {task.description || task.content ? (
          <Text className="mt-3 text-base leading-6 text-ink-700">
            {task.description || task.content}
          </Text>
        ) : null}

        {submission?.feedback ? (
          <View className="mt-3 rounded-xl border border-amber-200 bg-amber-50 p-3">
            <Text className="text-xs font-semibold text-amber-800">
              Facilitator feedback
            </Text>
            <Text className="mt-1 text-sm text-amber-900">{submission.feedback}</Text>
          </View>
        ) : null}

        {loadingAsset ? (
          <View className="mt-4 h-40 items-center justify-center">
            <LoadingState message="Loading media…" />
          </View>
        ) : videoUri ? (
          <View className="mt-4 overflow-hidden rounded-xl">
            <LessonVideo uri={videoUri} />
          </View>
        ) : assetReason ? (
          <View className="mt-4 rounded-xl bg-ink-100 p-3">
            <Text className="text-sm text-ink-600">{String(assetReason)}</Text>
          </View>
        ) : null}

        {/* Watch-only */}
        {type === TASK_TYPES.WATCH_ONLY && (
          <TouchableOpacity
            onPress={onWatchComplete}
            disabled={saving || done}
            className="mt-6 items-center rounded-xl bg-brand-600 py-4"
          >
            <Text className="font-semibold text-white">
              {done
                ? 'Already submitted'
                : saving
                  ? 'Saving…'
                  : 'Mark as watched / submit'}
            </Text>
          </TouchableOpacity>
        )}

        {/* Text */}
        {(type === TASK_TYPES.TEXT || !Object.values(TASK_TYPES).includes(type)) &&
          type !== TASK_TYPES.WATCH_ONLY &&
          type !== TASK_TYPES.LINK && (
            <View className="mt-5">
              <Text className="mb-1.5 text-sm font-medium text-ink-700">
                Your response
              </Text>
              <TextInput
                className="min-h-[140px] rounded-xl border border-ink-200 bg-white px-4 py-3 text-base text-ink-900"
                multiline
                textAlignVertical="top"
                value={text}
                onChangeText={setText}
                placeholder="Type your answer…"
                placeholderTextColor={COLORS.muted}
              />
              <TouchableOpacity
                onPress={() => onSubmit({ textValue: text.trim() })}
                disabled={saving || !text.trim()}
                className="mt-4 items-center rounded-xl bg-brand-600 py-4"
              >
                <Text className="font-semibold text-white">
                  {saving
                    ? 'Submitting…'
                    : done
                      ? 'Update submission'
                      : 'Submit task'}
                </Text>
              </TouchableOpacity>
            </View>
          )}

        {/* Link */}
        {type === TASK_TYPES.LINK && (
          <View className="mt-5">
            <Text className="mb-1.5 text-sm font-medium text-ink-700">
              Submission link
            </Text>
            <TextInput
              className="rounded-xl border border-ink-200 bg-white px-4 py-3.5 text-base text-ink-900"
              autoCapitalize="none"
              value={link}
              onChangeText={setLink}
              placeholder="https://…"
              placeholderTextColor={COLORS.muted}
            />
            <TouchableOpacity
              onPress={() => onSubmit({ linkValue: link.trim() })}
              disabled={saving || !link.trim()}
              className="mt-4 items-center rounded-xl bg-brand-600 py-4"
            >
              <Text className="font-semibold text-white">
                {saving ? 'Submitting…' : 'Submit link'}
              </Text>
            </TouchableOpacity>
          </View>
        )}

        {done && (
          <Text className="mt-4 text-center text-sm text-green-700">
            Status: {statusLabel(submission?.status)} — visible on web LMS
            {submission?.status === SUBMISSION_STATUS.COMPLETED
              ? ' as completed'
              : ' as submitted'}
            .
          </Text>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

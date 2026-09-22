import React, { useEffect, useState } from 'react';
import {
  Alert,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { VideoView, useVideoPlayer } from 'expo-video';
import { Ionicons } from '@expo/vector-icons';
import { getLesson, markLessonComplete } from '../../services/firestore';
import { fetchLessonAsset } from '../../services/functions';
import { useAuth } from '../../context/AuthContext';
import { useCourseDetail } from '../../hooks/useCourseDetail';
import LoadingState from '../../components/LoadingState';
import ErrorState from '../../components/ErrorState';

function LessonVideo({ uri }) {
  const player = useVideoPlayer(uri, (p) => {
    p.loop = false;
  });

  return (
    <VideoView
      style={{ width: '100%', height: 220, backgroundColor: '#000' }}
      player={player}
      allowsFullscreen
      allowsPictureInPicture
      contentFit="contain"
      nativeControls
    />
  );
}

export default function LessonPlayerScreen({ route, navigation }) {
  const { courseId, lessonId } = route.params;
  const { user } = useAuth();
  const { lessons } = useCourseDetail(courseId);
  const [lesson, setLesson] = useState(null);
  const [videoUri, setVideoUri] = useState(null);
  const [assetReason, setAssetReason] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const data = await getLesson(lessonId);
        if (!mounted) return;
        setLesson(data);

        // Prefer explicit videoUrl; otherwise ask Cloud Function (paid gate)
        if (data?.videoUrl) {
          setVideoUri(data.videoUrl);
        } else {
          const taskId = data?.taskId || lessonId;
          const asset = await fetchLessonAsset(taskId);
          if (!mounted) return;
          setVideoUri(asset.url);
          setAssetReason(asset.reason);
        }
      } catch (e) {
        if (mounted) setError(e.message);
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    return () => {
      mounted = false;
    };
  }, [lessonId]);

  const onComplete = async () => {
    if (!user?.uid) return;
    setSaving(true);
    try {
      await markLessonComplete(user.uid, courseId, lessonId, lessons.length || 1);
      Alert.alert('Saved', 'Lesson marked complete. Progress updated live.');
    } catch (e) {
      Alert.alert('Error', e.message);
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <LoadingState />;
  if (error) return <ErrorState message={error} />;
  if (!lesson) {
    return <ErrorState message="Lesson not found." />;
  }

  return (
    <SafeAreaView className="flex-1 bg-ink-950" edges={['top']}>
      <View className="flex-row items-center justify-between px-4 py-3">
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          className="flex-row items-center"
        >
          <Ionicons name="arrow-back" size={22} color="#fff" />
          <Text className="ml-2 text-sm text-white">Back</Text>
        </TouchableOpacity>
        {lesson.quiz ? (
          <TouchableOpacity
            onPress={() =>
              navigation.navigate('Quiz', {
                courseId,
                lessonId,
                quiz: lesson.quiz,
                lessonTitle: lesson.title,
              })
            }
          >
            <Text className="text-sm font-semibold text-brand-300">Take quiz</Text>
          </TouchableOpacity>
        ) : null}
      </View>

      {videoUri ? (
        <LessonVideo uri={videoUri} />
      ) : (
        <View className="h-48 items-center justify-center bg-ink-900 px-6">
          <Ionicons name="videocam-off-outline" size={40} color="#8593aa" />
          <Text className="mt-2 text-center text-sm text-ink-400">
            {assetReason
              ? String(assetReason)
              : 'No video URL set'}
          </Text>
        </View>
      )}

      <ScrollView
        className="flex-1 rounded-t-3xl bg-ink-50"
        contentContainerStyle={{ padding: 20, paddingBottom: 40 }}
      >
        <Text className="text-xl font-bold text-ink-950">{lesson.title}</Text>
        <Text className="mt-4 text-base leading-6 text-ink-700">
          {lesson.content || 'No written content for this lesson.'}
        </Text>

        <TouchableOpacity
          onPress={onComplete}
          disabled={saving}
          className="mt-8 items-center rounded-xl bg-brand-600 py-4"
        >
          <Text className="font-semibold text-white">
            {saving ? 'Saving…' : 'Mark as complete (+10 pts)'}
          </Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

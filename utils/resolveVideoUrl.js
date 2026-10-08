import { LESSON_VIDEOS, TASK_VIDEOS } from '../constants/lessonAssets';
import { fetchLessonAsset } from '../services/functions';

export function getAssetVideoUrl(assetKey) {
  if (!assetKey) return null;
  return LESSON_VIDEOS[assetKey] || null;
}

export function getTaskVideoUrl(taskId) {
  if (!taskId) return null;
  return TASK_VIDEOS[taskId] || LESSON_VIDEOS[taskId] || null;
}

export function getPracticeVideoUrl(practiceId, enrolled = true) {
  if (practiceId === 'lep-principles-video' && !enrolled) {
    return LESSON_VIDEOS['lep-principles-video-preview'] || LESSON_VIDEOS['lep-principles-video'];
  }
  return LESSON_VIDEOS[practiceId] || null;
}

/** Inline task field → registry → Cloud Function (paid gate). */
export async function resolveTaskVideoUrl(task) {
  if (!task) return null;
  const direct = task.videoUrl || task.youtubeUrl || getTaskVideoUrl(task.id);
  if (direct) return direct;
  const asset = await fetchLessonAsset(task.id);
  return asset?.url || null;
}

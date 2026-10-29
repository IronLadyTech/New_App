/**
 * Learner task uploads (file / video) — same Storage paths, limits and submission
 * fields as the web LMS (new_lms src/components/submissions/FileUpload.jsx and
 * VideoRecordOrUpload.jsx), so CX reviews app uploads in the screens they already use.
 *
 * Paths: {lep|bm100|mbw}/{uid}/{taskId}/{file|video}/{time}_{name} (see storage.rules).
 */
import * as DocumentPicker from 'expo-document-picker';
import * as ImagePicker from 'expo-image-picker';
import { getDownloadURL, ref, uploadBytesResumable } from 'firebase/storage';
import { storage } from './firebase';
import { PROGRAMS } from '../constants/programs';

export const MAX_DOCUMENT_BYTES = 15 * 1024 * 1024;
export const MAX_VIDEO_BYTES = 200 * 1024 * 1024;
export const MAX_VIDEO_SECONDS = 300;
/** No upload progress for this long counts as stalled. */
const UPLOAD_STALL_MS = 45000;

const STORAGE_FOLDER = { [PROGRAMS.LEP]: 'lep', [PROGRAMS.BM100]: 'bm100', [PROGRAMS.MBW]: 'mbw' };

const DOCUMENT_TYPES = [
  'application/pdf',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'image/*',
];

function mb(bytes) {
  return `${Math.round(bytes / (1024 * 1024))} MB`;
}

function pickError(message, code = 'invalid') {
  const error = new Error(message);
  error.code = code;
  return error;
}

/** A PDF, Word file or photo. Returns { uri, name, mimeType, size } or null when cancelled. */
export async function pickTaskDocument() {
  const result = await DocumentPicker.getDocumentAsync({
    type: DOCUMENT_TYPES,
    copyToCacheDirectory: true,
    multiple: false,
  });
  const asset = result.canceled ? null : result.assets?.[0];
  if (!asset?.uri) return null;
  if (asset.size && asset.size > MAX_DOCUMENT_BYTES) {
    throw pickError(`That file is over the ${mb(MAX_DOCUMENT_BYTES)} limit. Pick a smaller one.`);
  }
  return {
    uri: asset.uri,
    name: asset.name || 'document',
    mimeType: asset.mimeType || 'application/octet-stream',
    size: asset.size || null,
  };
}

/** Record with the camera (source 'camera') or pick from the gallery (source 'library'). */
export async function pickTaskVideo(source) {
  const permission =
    source === 'camera'
      ? await ImagePicker.requestCameraPermissionsAsync()
      : await ImagePicker.requestMediaLibraryPermissionsAsync();
  if (!permission.granted) {
    throw pickError(
      source === 'camera'
        ? 'Allow camera access in your phone settings to record your video.'
        : 'Allow access to your videos in your phone settings to pick one.',
      'permission'
    );
  }
  const options = { mediaTypes: ['videos'], videoMaxDuration: MAX_VIDEO_SECONDS, quality: 1 };
  const result =
    source === 'camera'
      ? await ImagePicker.launchCameraAsync(options)
      : await ImagePicker.launchImageLibraryAsync(options);
  const asset = result.canceled ? null : result.assets?.[0];
  if (!asset?.uri) return null;
  // duration is in milliseconds.
  if (asset.duration && asset.duration > (MAX_VIDEO_SECONDS + 5) * 1000) {
    throw pickError(`Keep your video under ${MAX_VIDEO_SECONDS / 60} minutes.`);
  }
  if (asset.fileSize && asset.fileSize > MAX_VIDEO_BYTES) {
    throw pickError(`That video is over the ${mb(MAX_VIDEO_BYTES)} limit. Record a shorter one.`);
  }
  const ext = (asset.mimeType || '').split('/')[1] || 'mp4';
  return {
    uri: asset.uri,
    name: asset.fileName || `recording-${Date.now()}.${ext}`,
    mimeType: asset.mimeType || 'video/mp4',
    size: asset.fileSize || null,
    durationSec: asset.duration ? Math.round(asset.duration / 1000) : null,
  };
}

/**
 * Upload a picked file and return the submission fields the web LMS reads.
 * kind: 'file' | 'video'. onProgress receives 0–100.
 */
export async function uploadTaskSubmission({ programId, userId, taskId, kind, picked, onProgress }) {
  const folder = STORAGE_FOLDER[programId];
  if (!folder) throw new Error('Uploads are not set up for this program.');
  if (!userId || !taskId || !picked?.uri) throw new Error('Nothing to upload.');

  const safeName = String(picked.name || kind).replace(/[^a-zA-Z0-9._-]/g, '_');
  const path = `${folder}/${userId}/${taskId}/${kind}/${Date.now()}_${safeName}`;
  // Show "Uploading 0%" at once: reading a large file into memory takes a moment.
  onProgress?.(0);
  const blob = await (await fetch(picked.uri)).blob();
  const limit = kind === 'video' ? MAX_VIDEO_BYTES : MAX_DOCUMENT_BYTES;
  if (blob.size > limit) {
    throw pickError(`That ${kind === 'video' ? 'video' : 'file'} is over the ${mb(limit)} limit.`);
  }

  const task = uploadBytesResumable(ref(storage, path), blob, { contentType: picked.mimeType });
  await new Promise((resolve, reject) => {
    // No byte moved for a while (weak signal, network switched): stop instead of hanging forever.
    let stall = null;
    const arm = () => {
      clearTimeout(stall);
      stall = setTimeout(() => {
        task.cancel();
        reject(pickError('The upload stopped — check your connection and submit again.', 'stalled'));
      }, UPLOAD_STALL_MS);
    };
    arm();
    task.on(
      'state_changed',
      (s) => {
        arm();
        if (s.totalBytes) onProgress?.(Math.round((s.bytesTransferred / s.totalBytes) * 100));
      },
      (err) => {
        clearTimeout(stall);
        reject(err);
      },
      () => {
        clearTimeout(stall);
        resolve();
      }
    );
  });
  const url = await getDownloadURL(task.snapshot.ref);

  const common = { fileName: picked.name, localFallback: false, storageSkipped: false, hasLocalRecording: false };
  return kind === 'video'
    ? { ...common, videoUrl: url, videoPath: path, fileType: picked.mimeType, durationSec: picked.durationSec || null }
    : { ...common, fileUrl: url, filePath: path, fileType: picked.mimeType };
}

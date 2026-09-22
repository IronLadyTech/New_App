import { ref, uploadBytes, getDownloadURL, deleteObject } from 'firebase/storage';
import { storage } from './firebase';

/**
 * Upload a local file URI (e.g. from ImagePicker) to Firebase Storage.
 * Returns the public download URL.
 */
export async function uploadFile(path, uri, contentType = 'image/jpeg') {
  const response = await fetch(uri);
  const blob = await response.blob();
  const storageRef = ref(storage, path);
  await uploadBytes(storageRef, blob, { contentType });
  return getDownloadURL(storageRef);
}

export async function uploadAvatar(uid, uri) {
  return uploadFile(`avatars/${uid}.jpg`, uri, 'image/jpeg');
}

export async function uploadCourseThumbnail(courseId, uri) {
  return uploadFile(`courses/${courseId}/thumbnail.jpg`, uri, 'image/jpeg');
}

export async function deleteFile(path) {
  await deleteObject(ref(storage, path));
}

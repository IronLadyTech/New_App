import { Platform } from 'react-native';
import { ref, uploadBytes, getDownloadURL, deleteObject } from 'firebase/storage';
import { storage } from './firebase';

/** content:// and some file:// URIs fail with fetch on Android — XHR still works. */
async function uriToBlob(uri) {
  if (Platform.OS === 'web') {
    return (await fetch(uri)).blob();
  }
  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    xhr.onload = () => resolve(xhr.response);
    xhr.onerror = () => reject(new TypeError('Could not read that file. Try again or pick another image.'));
    xhr.responseType = 'blob';
    xhr.open('GET', uri, true);
    xhr.send(null);
  });
}

/**
 * Upload a local file URI (e.g. from ImagePicker) to Firebase Storage.
 * Returns the public download URL.
 */
export async function uploadFile(path, uri, contentType = 'image/jpeg') {
  const blob = await uriToBlob(uri);
  const storageRef = ref(storage, path);
  await uploadBytes(storageRef, blob, { contentType });
  return getDownloadURL(storageRef);
}

export async function uploadAvatar(uid, uri) {
  return uploadFile(`avatars/${uid}/profile.jpg`, uri, 'image/jpeg');
}

export async function uploadCourseThumbnail(courseId, uri) {
  return uploadFile(`courses/${courseId}/thumbnail.jpg`, uri, 'image/jpeg');
}

export async function deleteFile(path) {
  await deleteObject(ref(storage, path));
}

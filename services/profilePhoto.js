import { Platform } from 'react-native';
import * as DocumentPicker from 'expo-document-picker';
import * as ImagePicker from 'expo-image-picker';
import { updateProfile } from 'firebase/auth';
import { auth } from './firebase';
import { updateUserProfile } from './firestore';
import { uploadAvatar } from './storage';

async function pickImageAsset() {
  const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
  if (!permission.granted) {
    const error = new Error('Allow photo access to set your profile picture.');
    error.code = 'permission';
    throw error;
  }
  const result = await ImagePicker.launchImageLibraryAsync({
    mediaTypes: ['images'],
    allowsEditing: Platform.OS === 'ios',
    aspect: [1, 1],
    quality: 0.85,
  });
  if (!result.canceled && result.assets?.[0]?.uri) {
    return result.assets[0].uri;
  }
  return null;
}

async function pickDocumentImage() {
  const result = await DocumentPicker.getDocumentAsync({
    type: ['image/*'],
    copyToCacheDirectory: true,
    multiple: false,
  });
  if (!result.canceled && result.assets?.[0]?.uri) {
    return result.assets[0].uri;
  }
  return null;
}

/** Pick a library photo, store it, and save the download URL on the learner. */
export async function pickAndSaveProfilePhoto(uid) {
  if (!uid) throw new Error('Sign in to add a photo.');
  let uri = await pickImageAsset();
  if (!uri) uri = await pickDocumentImage();
  if (!uri) return null;

  try {
    const photoURL = await uploadAvatar(uid, uri);
    await updateUserProfile(uid, { photoURL });
    if (auth.currentUser) await updateProfile(auth.currentUser, { photoURL });
    return photoURL;
  } catch (err) {
    const error = new Error(
      err?.message?.includes('storage') || err?.code === 'storage/unauthorized'
        ? 'Could not upload that photo. Try again in a moment.'
        : err?.message || 'Could not upload that photo. Try again.'
    );
    error.code = err?.code || 'upload';
    throw error;
  }
}
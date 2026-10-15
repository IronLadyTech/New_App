import * as ImagePicker from 'expo-image-picker';
import { updateProfile } from 'firebase/auth';
import { auth } from './firebase';
import { updateUserProfile } from './firestore';
import { uploadAvatar } from './storage';

/** Pick a library photo, store it, and save the download URL on the learner. */
export async function pickAndSaveProfilePhoto(uid) {
  if (!uid) throw new Error('Sign in to add a photo.');
  const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
  if (!permission.granted) {
    const error = new Error('Allow photo access to set your profile picture.');
    error.code = 'permission';
    throw error;
  }
  const result = await ImagePicker.launchImageLibraryAsync({
    mediaTypes: ['images'],
    allowsEditing: true,
    aspect: [1, 1],
    quality: 0.85,
  });
  if (result.canceled || !result.assets?.[0]?.uri) return null;
  const photoURL = await uploadAvatar(uid, result.assets[0].uri);
  await updateUserProfile(uid, { photoURL });
  if (auth.currentUser) await updateProfile(auth.currentUser, { photoURL });
  return photoURL;
}

import AsyncStorage from '@react-native-async-storage/async-storage';

function storageKey(userId, programId, taskId) {
  return `taskReadingAck:${userId}:${programId}:${taskId}`;
}

export async function getTaskReadingAck(userId, programId, taskId) {
  if (!userId || userId === 'preview' || !programId || !taskId) return false;
  const v = await AsyncStorage.getItem(storageKey(userId, programId, taskId));
  return v === '1';
}

export async function setTaskReadingAck(userId, programId, taskId) {
  if (!userId || userId === 'preview' || !programId || !taskId) return;
  await AsyncStorage.setItem(storageKey(userId, programId, taskId), '1');
}
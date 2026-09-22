import React, { useState } from 'react';
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
import { useAuth } from '../../context/AuthContext';
import { updateUserProfile } from '../../services/firestore';
import { COLORS } from '../../constants';

export default function SettingsScreen({ navigation }) {
  const { user, profile } = useAuth();
  const [displayName, setDisplayName] = useState(profile?.displayName || '');
  const [saving, setSaving] = useState(false);

  const onSave = async () => {
    if (!user?.uid) return;
    setSaving(true);
    try {
      await updateUserProfile(user.uid, { displayName: displayName.trim() });
      Alert.alert('Saved', 'Profile updated — changes sync live.');
      navigation.goBack();
    } catch (e) {
      Alert.alert('Error', e.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-ink-50" edges={['top']}>
      <View className="flex-row items-center px-4 py-3">
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={22} color={COLORS.ink} />
        </TouchableOpacity>
        <Text className="ml-3 text-xl font-bold text-ink-950">Settings</Text>
      </View>

      <ScrollView contentContainerStyle={{ padding: 16 }}>
        <Text className="mb-1.5 text-sm font-medium text-ink-700">
          Display name
        </Text>
        <TextInput
          className="rounded-xl border border-ink-200 bg-white px-4 py-3.5 text-base text-ink-900"
          value={displayName}
          onChangeText={setDisplayName}
          placeholderTextColor={COLORS.muted}
        />

        <Text className="mb-1.5 mt-4 text-sm font-medium text-ink-700">Email</Text>
        <View className="rounded-xl border border-ink-100 bg-ink-100 px-4 py-3.5">
          <Text className="text-base text-ink-500">{user?.email}</Text>
        </View>

        <Text className="mt-6 text-xs leading-5 text-ink-400">
          Role and sensitive fields are controlled by Firestore security rules.
          This client never bypasses server-side permissions.
        </Text>

        <TouchableOpacity
          onPress={onSave}
          disabled={saving}
          className="mt-6 items-center rounded-xl bg-brand-600 py-4"
        >
          <Text className="font-semibold text-white">
            {saving ? 'Saving…' : 'Save changes'}
          </Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

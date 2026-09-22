import React, { useState } from 'react';
import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useEngagement } from '../../context/EngagementContext';
import { COLORS } from '../../constants';

export default function CreatePostScreen({ navigation }) {
  const { publishPost } = useEngagement();
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [loading, setLoading] = useState(false);

  const onPublish = async () => {
    if (!content.trim()) {
      Alert.alert('Add content', 'Write something before posting.');
      return;
    }
    setLoading(true);
    try {
      const id = await publishPost({ title: title.trim(), content: content.trim() });
      navigation.replace('PostDetail', { postId: id });
    } catch (e) {
      Alert.alert('Could not post', e.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-ink-50" edges={['top']}>
      <KeyboardAvoidingView
        className="flex-1"
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <View className="flex-row items-center justify-between px-4 py-3">
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Ionicons name="close" size={26} color={COLORS.ink} />
          </TouchableOpacity>
          <Text className="text-lg font-semibold text-ink-900">New post</Text>
          <TouchableOpacity onPress={onPublish} disabled={loading}>
            <Text className="font-semibold text-brand-700">
              {loading ? '…' : 'Post'}
            </Text>
          </TouchableOpacity>
        </View>

        <ScrollView
          className="flex-1 px-4"
          keyboardShouldPersistTaps="handled"
        >
          <TextInput
            className="border-b border-ink-100 py-3 text-xl font-semibold text-ink-950"
            placeholder="Title (optional)"
            placeholderTextColor={COLORS.muted}
            value={title}
            onChangeText={setTitle}
          />
          <TextInput
            className="min-h-[160px] py-4 text-base leading-6 text-ink-800"
            placeholder="Share a question, tip, or win…"
            placeholderTextColor={COLORS.muted}
            value={content}
            onChangeText={setContent}
            multiline
            textAlignVertical="top"
          />
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

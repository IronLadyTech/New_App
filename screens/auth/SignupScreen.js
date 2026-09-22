import React, { useState } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { signUp } from '../../services/auth';
import { COLORS, ROLES } from '../../constants';
import { friendlyAuthError } from '../../utils/authErrors';

const ROLE_OPTIONS = [
  { value: ROLES.STUDENT, label: 'Student' },
  { value: ROLES.TEACHER, label: 'Teacher' },
];

export default function SignupScreen({ navigation }) {
  const [displayName, setDisplayName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState(ROLES.STUDENT);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const onSignup = async () => {
    if (!email.trim() || !password || password.length < 6) {
      setError('Use a valid email and password (min 6 characters).');
      return;
    }
    setLoading(true);
    setError('');
    try {
      await signUp({ email, password, displayName, role });
    } catch (e) {
      setError(friendlyAuthError(e));
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-ink-50">
      <KeyboardAvoidingView
        className="flex-1"
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView
          contentContainerStyle={{ flexGrow: 1, justifyContent: 'center' }}
          keyboardShouldPersistTaps="handled"
          className="px-6"
        >
          <Text className="text-3xl font-bold text-ink-950">Join LMS</Text>
          <Text className="mt-1 text-base text-ink-500">
            Create an account to get started
          </Text>

          <View className="mt-8">
            <Text className="mb-1.5 text-sm font-medium text-ink-700">
              Display name
            </Text>
            <TextInput
              className="rounded-xl border border-ink-200 bg-white px-4 py-3.5 text-base text-ink-900"
              value={displayName}
              onChangeText={setDisplayName}
              placeholder="Alex Rivera"
              placeholderTextColor={COLORS.muted}
            />

            <Text className="mb-1.5 mt-4 text-sm font-medium text-ink-700">Email</Text>
            <TextInput
              className="rounded-xl border border-ink-200 bg-white px-4 py-3.5 text-base text-ink-900"
              autoCapitalize="none"
              keyboardType="email-address"
              value={email}
              onChangeText={setEmail}
              placeholder="you@school.edu"
              placeholderTextColor={COLORS.muted}
            />

            <Text className="mb-1.5 mt-4 text-sm font-medium text-ink-700">
              Password
            </Text>
            <TextInput
              className="rounded-xl border border-ink-200 bg-white px-4 py-3.5 text-base text-ink-900"
              secureTextEntry
              value={password}
              onChangeText={setPassword}
              placeholder="Min 6 characters"
              placeholderTextColor={COLORS.muted}
            />

            <Text className="mb-2 mt-4 text-sm font-medium text-ink-700">I am a…</Text>
            <View className="flex-row">
              {ROLE_OPTIONS.map((opt) => {
                const active = role === opt.value;
                return (
                  <TouchableOpacity
                    key={opt.value}
                    onPress={() => setRole(opt.value)}
                    className={`mr-2 rounded-xl border px-4 py-2.5 ${
                      active
                        ? 'border-brand-600 bg-brand-50'
                        : 'border-ink-200 bg-white'
                    }`}
                  >
                    <Text
                      className={`text-sm font-medium ${
                        active ? 'text-brand-700' : 'text-ink-600'
                      }`}
                    >
                      {opt.label}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>

            {error ? (
              <Text className="mt-3 text-sm text-danger">{error}</Text>
            ) : null}

            <TouchableOpacity
              onPress={onSignup}
              disabled={loading}
              className="mt-5 items-center rounded-xl bg-brand-600 py-4"
              activeOpacity={0.85}
            >
              <Text className="text-base font-semibold text-white">
                {loading ? 'Creating account…' : 'Create account'}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => navigation.goBack()}
              className="mt-5 items-center"
            >
              <Text className="text-sm text-ink-600">
                Already have an account?{' '}
                <Text className="font-semibold text-brand-700">Sign in</Text>
              </Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

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
import { signIn, resetPassword } from '../../services/auth';
import { firebaseConfig } from '../../services/firebase';
import { COLORS } from '../../constants';
import { friendlyAuthError, isFirebaseConfigured } from '../../utils/authErrors';

export default function LoginScreen({ navigation }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const configured = isFirebaseConfigured(firebaseConfig);

  const onLogin = async () => {
    if (!configured) {
      setError(
        'Firebase is not connected yet. Paste your config into services/firebase.js, then restart Expo.'
      );
      return;
    }
    if (!email.trim() || !password) {
      setError('Email and password are required.');
      return;
    }
    setLoading(true);
    setError('');
    try {
      await signIn({ email, password });
    } catch (e) {
      setError(friendlyAuthError(e));
    } finally {
      setLoading(false);
    }
  };

  const onForgot = async () => {
    if (!email.trim()) {
      Alert.alert('Enter email', 'Type your email above, then tap Forgot password.');
      return;
    }
    try {
      await resetPassword(email);
      Alert.alert('Check your inbox', 'Password reset email sent.');
    } catch (e) {
      Alert.alert('Error', e.message);
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
          <Text className="text-3xl font-bold text-ink-950">LMS</Text>
          <Text className="mt-1 text-base text-ink-500">
            Sign in to continue learning
          </Text>

          {configured ? (
            <View className="mt-4 rounded-xl border border-green-200 bg-green-50 p-3">
              <Text className="text-xs font-semibold text-green-800">
                Connected to {firebaseConfig.projectId}
              </Text>
            </View>
          ) : (
            <View className="mt-4 rounded-xl border border-red-200 bg-red-50 p-3">
              <Text className="text-sm font-semibold text-red-700">
                Firebase not connected
              </Text>
              <Text className="mt-1 text-xs leading-5 text-red-600">
                Paste your config into services/firebase.js and restart Expo
                (npx expo start -c).
              </Text>
            </View>
          )}

          <View className="mt-8">
            <Text className="mb-1.5 text-sm font-medium text-ink-700">Email</Text>
            <TextInput
              className="rounded-xl border border-ink-200 bg-white px-4 py-3.5 text-base text-ink-900"
              autoCapitalize="none"
              keyboardType="email-address"
              autoComplete="email"
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
              placeholder="••••••••"
              placeholderTextColor={COLORS.muted}
            />

            <TouchableOpacity onPress={onForgot} className="mt-2 self-end">
              <Text className="text-sm text-brand-700">Forgot password?</Text>
            </TouchableOpacity>

            {error ? (
              <Text className="mt-3 text-sm text-danger">{error}</Text>
            ) : null}

            <TouchableOpacity
              onPress={onLogin}
              disabled={loading}
              className="mt-5 items-center rounded-xl bg-brand-600 py-4"
              activeOpacity={0.85}
            >
              <Text className="text-base font-semibold text-white">
                {loading ? 'Signing in…' : 'Sign in'}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => navigation.navigate('PhoneLogin')}
              className="mt-4 items-center rounded-xl border border-ink-200 bg-white py-3.5"
            >
              <Text className="text-sm font-semibold text-ink-800">
                Sign in with phone OTP
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => navigation.navigate('Signup')}
              className="mt-5 items-center"
            >
              <Text className="text-sm text-ink-600">
                New here?{' '}
                <Text className="font-semibold text-brand-700">Create account</Text>
              </Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

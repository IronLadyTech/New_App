import React, { useMemo, useState } from 'react';
import {
  Alert,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { saveQuizScore } from '../../services/firestore';
import { useAuth } from '../../context/AuthContext';
import EmptyState from '../../components/EmptyState';
import { COLORS } from '../../constants';

/**
 * Expected quiz shape on a lesson document:
 * {
 *   questions: [
 *     { id, prompt, options: string[], correctIndex: number }
 *   ]
 * }
 */
export default function QuizScreen({ route, navigation }) {
  const { courseId, lessonId, quiz, lessonTitle } = route.params;
  const { user } = useAuth();
  const questions = quiz?.questions || [];
  const [answers, setAnswers] = useState({});
  const [submitted, setSubmitted] = useState(false);
  const [saving, setSaving] = useState(false);

  const score = useMemo(() => {
    if (!questions.length) return 0;
    let correct = 0;
    questions.forEach((q) => {
      if (answers[q.id] === q.correctIndex) correct += 1;
    });
    return Math.round((correct / questions.length) * 100);
  }, [answers, questions]);

  const onSubmit = async () => {
    if (Object.keys(answers).length < questions.length) {
      Alert.alert('Incomplete', 'Answer every question before submitting.');
      return;
    }
    setSubmitted(true);
    if (!user?.uid) return;
    setSaving(true);
    try {
      await saveQuizScore(user.uid, courseId, lessonId, score);
    } catch (e) {
      Alert.alert('Could not save score', e.message);
    } finally {
      setSaving(false);
    }
  };

  if (!questions.length) {
    return (
      <SafeAreaView className="flex-1 bg-ink-50">
        <EmptyState
          title="No quiz configured"
          message="Add a quiz.questions array on this lesson document."
          actionLabel="Back"
          onAction={() => navigation.goBack()}
        />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-ink-50" edges={['top']}>
      <ScrollView contentContainerStyle={{ padding: 16, paddingBottom: 40 }}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          className="mb-3 flex-row items-center"
        >
          <Ionicons name="arrow-back" size={22} color={COLORS.ink} />
          <Text className="ml-1 text-sm text-ink-600">Lesson</Text>
        </TouchableOpacity>

        <Text className="text-2xl font-bold text-ink-950">Quiz</Text>
        <Text className="mt-1 text-sm text-ink-500">{lessonTitle}</Text>

        {questions.map((q, qi) => (
          <View
            key={q.id || qi}
            className="mt-5 rounded-2xl border border-ink-100 bg-white p-4"
          >
            <Text className="mb-3 text-base font-semibold text-ink-900">
              {qi + 1}. {q.prompt}
            </Text>
            {(q.options || []).map((opt, oi) => {
              const selected = answers[q.id] === oi;
              let border = 'border-ink-200';
              let bg = 'bg-white';
              if (submitted) {
                if (oi === q.correctIndex) {
                  border = 'border-green-500';
                  bg = 'bg-green-50';
                } else if (selected) {
                  border = 'border-red-400';
                  bg = 'bg-red-50';
                }
              } else if (selected) {
                border = 'border-brand-600';
                bg = 'bg-brand-50';
              }
              return (
                <TouchableOpacity
                  key={`${q.id}-${oi}`}
                  disabled={submitted}
                  onPress={() =>
                    setAnswers((prev) => ({ ...prev, [q.id]: oi }))
                  }
                  className={`mb-2 rounded-xl border px-3 py-3 ${border} ${bg}`}
                >
                  <Text className="text-sm text-ink-800">{opt}</Text>
                </TouchableOpacity>
              );
            })}
          </View>
        ))}

        {submitted ? (
          <View className="mt-6 items-center rounded-2xl bg-brand-700 p-5">
            <Text className="text-sm text-brand-100">Your score</Text>
            <Text className="text-4xl font-bold text-white">{score}%</Text>
            <Text className="mt-1 text-xs text-brand-100">
              {saving ? 'Saving to Firestore…' : 'Saved — syncs to progress live'}
            </Text>
          </View>
        ) : (
          <TouchableOpacity
            onPress={onSubmit}
            className="mt-6 items-center rounded-xl bg-brand-600 py-4"
          >
            <Text className="font-semibold text-white">Submit quiz</Text>
          </TouchableOpacity>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

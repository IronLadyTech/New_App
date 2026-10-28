import { useEffect, useState } from 'react';
import { AppState, Platform } from 'react-native';
import { useAuth } from '../context/AuthContext';
import { useLepPracticeStreak } from '../hooks/useLepPracticeStreak';
import { programsOnProfile } from '../utils/programAccess';
import { buildStreakReminders } from '../utils/streakReminderPlan';
import { syncStreakReminders } from '../services/localEngagementNotifications';

/**
 * Keeps this phone's week of streak reminders in step with her real streak — rebuilt when
 * she practises (the streak or "practised today" changes) and when the app comes back to
 * the front (the day may have changed). LEP learners only: the streak counts LEP practice.
 * Renders nothing; lives inside CourseDemoProvider (the streak's source).
 */
export default function StreakReminderSync() {
  const { profile, user, cmsPreview } = useAuth();
  const streak = useLepPracticeStreak();
  const [wake, setWake] = useState(0);

  useEffect(() => {
    const sub = AppState.addEventListener('change', (s) => s === 'active' && setWake((n) => n + 1));
    return () => sub.remove();
  }, []);

  const isLep = programsOnProfile(profile).some((p) => p.id === 'lep');
  const name = String(profile?.firstName || profile?.displayName || profile?.name || '').trim().split(/\s+/)[0];
  const key = `${user?.uid}|${isLep}|${streak.currentStreak}|${streak.todayActive}|${streak.today}|${name}|${wake}`;

  useEffect(() => {
    if (Platform.OS === 'web' || !user?.uid || user.uid === 'preview' || cmsPreview) return;
    const reminders = isLep
      ? buildStreakReminders({ streak: streak.currentStreak, todayActive: streak.todayActive, name })
      : null; // not an LEP learner: no streak to keep — clear any old reminders
    syncStreakReminders(reminders).catch(() => {});
  }, [key]);

  return null;
}

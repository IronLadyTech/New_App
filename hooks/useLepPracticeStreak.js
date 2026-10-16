import { useMemo } from 'react';
import { useCourseDemo } from '../context/CourseDemoContext';
import { todayIsoIST } from '../utils/lepDailyPractice';
import {
  computeLepStreakMetrics,
  ritualsDoneOnDay,
} from '../utils/lepPracticeStreak';

export function useLepPracticeStreak() {
  const demo = useCourseDemo();
  const today = todayIsoIST();

  return useMemo(() => {
    const metrics = computeLepStreakMetrics(demo.done, today);
    return {
      ...metrics,
      today,
      ritualsDoneToday: ritualsDoneOnDay(demo.isDoneOnDay, today),
      streakLabel:
        metrics.currentStreak > 0
          ? `${metrics.currentStreak}-day streak`
          : 'Start your streak',
      weekLabel: `This week · ${metrics.weekActiveDays} of ${metrics.weekTotal} active days`,
    };
  }, [demo.done, demo.isDoneOnDay, today]);
}

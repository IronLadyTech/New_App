import { useCallback, useMemo } from 'react';
import { useCourseDemo } from '../context/CourseDemoContext';
import { todayIsoIST } from '../utils/lepDailyPractice';
import { LEP_FIVE_RITUALS } from '../constants/lepFiveRituals';
import { practiceDailyKey } from '../constants/practice';
import { LEP_RITUALS_PRACTICE_ID } from '../utils/lepRitualsUnlock';
import { buildRitualsDashboardModel, lepRitualMarkKey, isRitualMarkedOnDay } from '../utils/lepRitualsTracker';

export function useLepFiveRitualsTracker(day1Iso) {
  const demo = useCourseDemo();
  const today = todayIsoIST();

  const model = useMemo(
    () =>
      buildRitualsDashboardModel({
        todayIso: today,
        day1Iso,
        isDoneOnDay: demo.isDoneOnDay,
      }),
    [today, day1Iso, demo.isDoneOnDay, demo.done]
  );

  const toggleRitual = useCallback(
    (ritualId, isoDate = today) => {
      const key = lepRitualMarkKey(ritualId, isoDate);
      if (demo.isDoneOnDay('lep', key)) return;
      demo.markDoneOnDay('lep', key);
      const allDone = LEP_FIVE_RITUALS.every((r) =>
        r.id === ritualId
          ? true
          : isRitualMarkedOnDay(demo.isDoneOnDay, r.id, isoDate)
      );
      if (allDone) {
        demo.markDoneOnDay('lep', practiceDailyKey(LEP_RITUALS_PRACTICE_ID, isoDate));
      }
    },
    [demo, today]
  );

  const unmarkRitual = useCallback(
    (ritualId, isoDate = today) => {
      const key = lepRitualMarkKey(ritualId, isoDate);
      if (!demo.isDoneOnDay('lep', key)) return;
      demo.clearDone('lep', key);
      demo.clearDone('lep', practiceDailyKey(LEP_RITUALS_PRACTICE_ID, isoDate));
    },
    [demo, today]
  );

  return { today, model, toggleRitual, unmarkRitual };
}

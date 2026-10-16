import { useMemo } from 'react';
import { useCourseDemo } from '../context/CourseDemoContext';
import { isPracticeItemDone } from '../constants/practice';
import {
  buildEnrolledDailyPractice,
  buildRegisteredDailyPractice,
  orientationIsoFromGroup,
  resolveLepDay1Iso,
  todayIsoIST,
} from '../utils/lepDailyPractice';

export function useEnrolledDailyPractice(group, cmsBatch) {
  const demo = useCourseDemo();
  const today = todayIsoIST();
  const anchor = orientationIsoFromGroup(group);
  const day1Iso = resolveLepDay1Iso({ cmsBatch, group });

  const items = useMemo(
    () => buildEnrolledDailyPractice(today, anchor, day1Iso),
    [today, anchor, day1Iso, group?.id]
  );

  return useMemo(
    () =>
      items.map((item) => ({
        ...item,
        done: isPracticeItemDone(item, today, demo.isDone, demo.isDoneOnDay),
      })),
    [items, today, demo.isDone, demo.isDoneOnDay, demo.done]
  );
}

export function useRegisteredDailyPractice(group, cmsBatch) {
  const demo = useCourseDemo();
  const today = todayIsoIST();
  const anchor = orientationIsoFromGroup(group);
  const day1Iso = resolveLepDay1Iso({ cmsBatch, group });

  const items = useMemo(
    () => buildRegisteredDailyPractice(today, anchor, day1Iso),
    [today, anchor, day1Iso, group?.id]
  );

  return useMemo(
    () =>
      items.map((item) => ({
        ...item,
        done: isPracticeItemDone(item, today, demo.isDone, demo.isDoneOnDay),
      })),
    [items, today, demo.isDone, demo.isDoneOnDay, demo.done]
  );
}

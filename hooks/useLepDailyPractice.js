import { useMemo } from 'react';
import { useCourseDemo } from '../context/CourseDemoContext';
import { usePrograms } from '../context/ProgramsContext';
import { isPracticeItemDone, practiceKey } from '../constants/practice';
import { isTaskDoneStatus } from '../constants/programs';
import {
  buildEnrolledDailyPractice,
  buildRegisteredDailyPractice,
  orientationIsoFromGroup,
  resolveLepDay1Iso,
  todayIsoIST,
} from '../utils/lepDailyPractice';

function usePracticeDoneChecker() {
  const demo = useCourseDemo();
  const { getTaskSubmission } = usePrograms();

  return useMemo(() => {
    const lmsDone = (programId, taskId) => {
      if (!taskId) return false;
      if (demo.isDone(programId, taskId)) return true;
      const sub = getTaskSubmission?.(programId, taskId);
      if (isTaskDoneStatus(sub?.status)) return true;
      // Practice keys sometimes stored as submissions too.
      const practiceSub = getTaskSubmission?.(programId, practiceKey(taskId));
      return isTaskDoneStatus(practiceSub?.status);
    };
    return {
      isDone: demo.isDone,
      isDoneOnDay: demo.isDoneOnDay,
      lmsDone,
      doneToken: demo.done,
    };
  }, [demo, getTaskSubmission]);
}

export function useEnrolledDailyPractice(group, cmsBatch) {
  const today = todayIsoIST();
  const anchor = orientationIsoFromGroup(group);
  const day1Iso = resolveLepDay1Iso({ cmsBatch, group });
  const { isDone, isDoneOnDay, lmsDone, doneToken } = usePracticeDoneChecker();

  const items = useMemo(
    () => buildEnrolledDailyPractice(today, anchor, day1Iso),
    [today, anchor, day1Iso, group?.id]
  );

  return useMemo(
    () =>
      items.map((item) => ({
        ...item,
        done: isPracticeItemDone(item, today, isDone, isDoneOnDay, lmsDone),
      })),
    [items, today, isDone, isDoneOnDay, lmsDone, doneToken]
  );
}

export function useRegisteredDailyPractice(group, cmsBatch) {
  const today = todayIsoIST();
  const anchor = orientationIsoFromGroup(group);
  const day1Iso = resolveLepDay1Iso({ cmsBatch, group });
  const { isDone, isDoneOnDay, lmsDone, doneToken } = usePracticeDoneChecker();

  const items = useMemo(
    () => buildRegisteredDailyPractice(today, anchor, day1Iso),
    [today, anchor, day1Iso, group?.id]
  );

  return useMemo(
    () =>
      items.map((item) => ({
        ...item,
        done: isPracticeItemDone(item, today, isDone, isDoneOnDay, lmsDone),
      })),
    [items, today, isDone, isDoneOnDay, lmsDone, doneToken]
  );
}

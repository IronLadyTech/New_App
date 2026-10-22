import { coursePhases, courseTasks } from '../constants/programCourseSlice';
import { isLepRitualsCourseTask, isLepRitualsUnlocked } from './lepRitualsUnlock';

/**
 * This week's focus = her first unfinished task of the current week, in journey
 * order. When it is done, the next one of that week takes its place. Once the whole
 * week is done the original suggestion stays (it then shows as done).
 */
export function resolveWeekFocus(items, { lmsDone, today, day1Iso }) {
  return items.map((item) => {
    if (!item.weekFocus) return item;
    const phase = coursePhases('lep').find((p) => p.id === item.weekFocus);
    const ritualsOpen = isLepRitualsUnlocked(today, day1Iso);
    const next = courseTasks('lep', item.weekFocus).find(
      (t) => (ritualsOpen || !isLepRitualsCourseTask(t.id)) && !lmsDone('lep', t.id)
    );
    if (!next) return item;
    return {
      programId: 'lep',
      id: `week-${next.id}`,
      title: next.title,
      meta: `${phase?.title || 'This week'} · next for this week`,
      taskId: next.id,
    };
  });
}

import { coursePhases, courseTasks } from '../constants/programCourseSlice';
import { TASK_TYPES } from '../constants/programs';
import { getTaskVideoUrl } from './resolveVideoUrl';
import { isLepRitualsCourseTask, isLepRitualsUnlocked } from './lepRitualsUnlock';

function displayTitleForWeekTask(task) {
  const hasVideo = !!getTaskVideoUrl(task.id);
  if (!hasVideo) return task.title;
  if (task.id === 'lep-day3-27-principles') return 'Watch the 27 Principles session';
  if (task.id === 'lep-day3-brand-roadmap') return 'Watch · Differentiated Brand & 0.5% Roadmap';
  if (/shameless/i.test(task.title)) return task.title;
  if (task.type === TASK_TYPES.CHECKLIST && !/^Watch/i.test(task.title)) {
    return `Watch · ${task.title}`;
  }
  return task.title;
}

function metaForWeekTask(task, phaseTitle) {
  const hasVideo = !!getTaskVideoUrl(task.id);
  const phase = phaseTitle || 'This week';
  if (hasVideo) return `Video · ${phase}`;
  return `${phase} · next for this week`;
}

/**
 * This week's focus = her first unfinished task of the current week, in journey
 * order. When it is done, the next one of that week takes its place. Once the whole
 * week is done the original suggestion stays (it then shows as done).
 */
export function resolveWeekFocus(items, { lmsDone, today, day1Iso }) {
  const hasDailyPrinciple = (items || []).some(
    (i) => !i.weekFocus && (i.practiceId === 'lep-principle' || /Revise Principle/i.test(String(i.title || '')))
  );
  const hasRitualsPractice = (items || []).some(
    (i) => !i.weekFocus && (i.practiceId === 'lep-rituals' || /5 Daily Rituals/i.test(String(i.title || '')))
  );

  return items.map((item) => {
    if (!item.weekFocus) return item;
    const phase = coursePhases('lep').find((p) => p.id === item.weekFocus);
    const ritualsOpen = isLepRitualsUnlocked(today, day1Iso);
    const tasks = courseTasks('lep', item.weekFocus);
    let next = null;
    for (const t of tasks) {
      if (hasDailyPrinciple && t.id === 'lep-day3-27-principles') continue;
      if (hasRitualsPractice && t.id === 'lep-day3-5-rituals') continue;
      if (!(ritualsOpen || !isLepRitualsCourseTask(t.id))) continue;
      if (lmsDone('lep', t.id)) continue;
      next = t;
      break;
    }
    if (!next) return item;
    return {
      programId: 'lep',
      id: `week-${next.id}`,
      title: displayTitleForWeekTask(next),
      meta: metaForWeekTask(next, phase?.title),
      taskId: next.id,
    };
  });
}

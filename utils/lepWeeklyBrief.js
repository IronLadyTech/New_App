import { coursePhases, courseTasks } from '../constants/programCourseSlice';
import { PROGRAMS } from '../constants/programs';
import { weekWeekdaysMonFri } from './lepPracticeStreak';
import { parseISODate } from './lepBatchSchedule';
import { LEP_RITUAL_WEEKLY_MARKS_MAX } from '../constants/lepFiveRituals';

function formatBriefDate(iso) {
  if (!iso) return '';
  const d = new Date(`${iso}T12:00:00`);
  return d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' });
}

/** Private Sunday-style summary for the progress screen. */
export function buildLepWeeklyBrief({
  todayIso,
  streak,
  ritualsUnlocked,
  weekMarks,
  lepProgress,
  taskIsDone,
}) {
  const weekdays = weekWeekdaysMonFri(todayIso);
  const weekStart = weekdays[0];
  const weekEnd = weekdays[4];
  const rangeLabel = `${formatBriefDate(weekStart)} – ${formatBriefDate(weekEnd)}`;

  const phases = coursePhases(PROGRAMS.LEP);
  const allTasks = [];
  phases.forEach((p) => courseTasks(PROGRAMS.LEP, p.id).forEach((t) => allTasks.push(t)));
  const doneTotal = allTasks.filter((t) => taskIsDone(PROGRAMS.LEP, t.id)).length;
  const nextTask = allTasks.find((t) => !taskIsDone(PROGRAMS.LEP, t.id));

  const isSunday = parseISODate(todayIso).getUTCDay() === 0;

  const lines = [
    {
      icon: 'local-fire-department',
      title: 'Weekly consistency',
      body: `${streak.weekActiveDays} of ${streak.weekTotal} active days this week (Mon–Fri).`,
    },
  ];

  if (ritualsUnlocked) {
    lines.push({
      icon: 'check-circle-outline',
      title: '5 Daily Rituals',
      body: `${weekMarks} of ${LEP_RITUAL_WEEKLY_MARKS_MAX} marks logged this week.`,
    });
  }

  lines.push({
    icon: 'school',
    title: 'LEP course',
    body: `${doneTotal} of ${allTasks.length} tasks complete · Phase ${lepProgress.phaseN} of ${lepProgress.totalPhases}.`,
  });

  if (nextTask) {
    lines.push({
      icon: 'arrow-forward',
      title: 'Next up',
      body: nextTask.title,
      taskId: nextTask.id,
    });
  }

  return {
    rangeLabel,
    isSunday,
    headline: isSunday ? 'Your week in review' : 'Preview · full brief on Sunday',
    sub: 'Only you see this summary.',
    lines,
    nextTask,
  };
}

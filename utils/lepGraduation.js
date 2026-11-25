import { useMemo } from 'react';
import { PROGRAMS } from '../constants/programs';
import { useCourseDemo } from '../context/CourseDemoContext';
import { usePrograms } from '../context/ProgramsContext';
import { makeTaskDoneChecker } from './taskDone';

/**
 * What an LEP learner must finish to graduate and collect her certificate.
 * From the programme sheet (LEP-Messages-Complete-v6, "Before Certification": Graduation
 * Preparations, 5 Daily Rituals quiz, 27 Principles quiz, Week 4
 * Challenge, Attendance), plus Practising the 5 Rituals and NSDC registration (needed for the
 * certificate paperwork). The weekly engagement forms were removed from the programme
 * (programme team, 25 Nov 2026). Change this list to change the rule everywhere.
 */
export const LEP_GRADUATION_REQUIRED = [
  { taskId: 'lep-day3-5-rituals', title: 'Practising the 5 Rituals' },
  { taskId: 'lep-quiz-5-rituals', title: '5 Daily Rituals quiz' },
  { taskId: 'lep-quiz-27-principles', title: '27 Principles quiz' },
  { taskId: 'lep-challenge-4', title: 'Challenge for Week 4' },
  { taskId: 'lep-day8-preparation', title: 'Graduation Preparations' },
  { taskId: 'lep-prep-nsdc', title: 'NSDC registration' },
  { taskId: 'lep-attendance', title: 'Attendance record' },
];

/** Graduation day = Day 1 + 28 (S8 Graduation & Certification). */
export const LEP_GRADUATION_DAY_OFFSET = 28;

/** Pure: the checklist from a done-checker `(programId, taskId) => boolean`. */
export function lepGraduationChecklist(isTaskDone) {
  const items = LEP_GRADUATION_REQUIRED.map((r) => ({ ...r, done: Boolean(isTaskDone(PROGRAMS.LEP, r.taskId)) }));
  const doneCount = items.filter((i) => i.done).length;
  return {
    items,
    missing: items.filter((i) => !i.done),
    doneCount,
    total: items.length,
    eligible: doneCount === items.length,
  };
}

/** Her live graduation checklist (task submissions + practice ticks). */
export function useLepGraduationChecklist() {
  const demo = useCourseDemo();
  const { getTaskSubmission } = usePrograms();
  return useMemo(
    () => lepGraduationChecklist(makeTaskDoneChecker({ isDone: demo.isDone, getTaskSubmission })),
    [demo.isDone, demo.done, getTaskSubmission]
  );
}

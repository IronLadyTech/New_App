/** Alumni monthly practice — classic LEP artefacts (not journey phase chips). */
const ALUMNI_MONTHLY_ROTATION = [
  {
    title: 'Shameless speech',
    blurb: 'Record or refresh your shameless pitch — one ask, no apology.',
    taskId: 'lep-day5-pitch',
  },
  {
    title: 'ERRC table',
    blurb: 'Update your ERRC for one live decision this week.',
    taskId: 'lep-day1-errc',
  },
  {
    title: '5 Daily Rituals',
    blurb: 'Replay the rituals quiz and lock one habit for the next 7 days.',
    taskId: 'lep-quiz-5-rituals',
  },
  {
    title: '27 Principles revision',
    blurb: 'Revisit the principles quiz — one principle, one behaviour change.',
    taskId: 'lep-quiz-27-principles',
  },
];

/** Day 1–7 within each week of the month (cycles for progress bar). */
export function alumniChallengeDayIndex(date = new Date()) {
  const day = date.getDate();
  return ((day - 1) % 7) + 1;
}

export function resolveAlumniMonthlyChallenge(date = new Date()) {
  const month = date.getMonth();
  const pick = ALUMNI_MONTHLY_ROTATION[month % ALUMNI_MONTHLY_ROTATION.length];
  return {
    title: pick.title,
    blurb: pick.blurb,
    taskId: pick.taskId,
    dayIndex: alumniChallengeDayIndex(date),
  };
}

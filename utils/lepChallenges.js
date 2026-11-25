import { addCalendarDays } from './lepBatchSchedule';
import { LEP_SESSION_TEMPLATE } from '../constants/lepSessionTemplate';

/**
 * Weekly challenges (coaches' messages, 25 Nov 2026). Each one starts the day after its session
 * and runs 7 days; the challenge task becomes her end-of-week summary from Day 7.
 * Daily entries live on one submission row per learner (lep_submissions `${uid}_lep-challenge-log`).
 */
export const LEP_CHALLENGE_LOG_TASK_ID = 'lep-challenge-log';
export const CHALLENGE_DAYS = 7;

export const LEP_CHALLENGES = [
  {
    key: 'c1',
    n: 1,
    taskId: 'lep-challenge-1',
    afterSession: 'S2',
    title: 'Week 1 Challenge: A-Game & Crucible',
    short: 'A-Game & Crucible',
    daily: [
      { id: 'agame', label: "Update today's A-Game table", kind: 'tick', openTaskId: 'lep-day1-agame-table' },
      { id: 'mirror', label: "Today's learning from your mirror work", kind: 'text', placeholder: 'One line from today’s mirror work' },
    ],
  },
  {
    key: 'c2',
    n: 2,
    taskId: 'lep-challenge-2',
    afterSession: 'S4',
    title: 'Week 2 Challenge: Build your brand',
    short: 'Build your brand',
    once: { id: 'profile', label: 'Your LinkedIn profile link', kind: 'link', placeholder: 'https://www.linkedin.com/in/…' },
    daily: [
      { id: 'post', label: "Today's LinkedIn post, article or share", kind: 'link', placeholder: 'Paste the post link (optional)' },
    ],
  },
  {
    key: 'c3',
    n: 3,
    taskId: 'lep-challenge-3',
    afterSession: 'S5',
    title: 'Week 3 Challenge: Shameless Pitch',
    short: 'Shameless Pitch',
    once: { id: 'real', label: 'One real pitch this week', kind: 'text', placeholder: 'Who did you pitch to, and what happened?' },
    daily: [
      { id: 'pitch', label: "Today's shameless pitch", kind: 'text', placeholder: 'Your pitch script, or the gist of your video' },
    ],
  },
];

export function lepChallengeByTaskId(taskId) {
  return LEP_CHALLENGES.find((c) => c.taskId === taskId) || null;
}

/** Today's date and minutes past midnight in India. */
export function nowIst(now = new Date()) {
  const t = new Date(now.getTime() + 330 * 60000);
  return { iso: t.toISOString().slice(0, 10), mins: t.getUTCHours() * 60 + t.getUTCMinutes() };
}

function toMins(hhmm) {
  const [h, m] = String(hhmm || '00:00').split(':').map(Number);
  return (h || 0) * 60 + (m || 0);
}

/** A day counts when every daily item has an entry. */
export function isChallengeDayDone(challenge, entry) {
  if (!entry) return false;
  return challenge.daily.every((d) => Boolean(entry[d.id]));
}

/**
 * Where she is in one challenge:
 *  before  — its session has not ended yet (nothing shows)
 *  soon    — session ended today; the challenge starts tomorrow
 *  daily   — Day 1–7
 *  after   — the 7 days are over (summary only)
 */
export function lepChallengeState(challenge, day1Iso, now = new Date()) {
  if (!challenge || !day1Iso) return null;
  const session = LEP_SESSION_TEMPLATE.find((s) => s.code === challenge.afterSession);
  if (!session) return null;
  const sessionIso = addCalendarDays(day1Iso, session.dayOffset);
  const startIso = addCalendarDays(sessionIso, 1);
  const days = Array.from({ length: CHALLENGE_DAYS }, (_, i) => addCalendarDays(startIso, i));
  const lastIso = days[CHALLENGE_DAYS - 1];
  const { iso: today, mins } = nowIst(now);

  let phase;
  if (today < sessionIso || (today === sessionIso && mins < toMins(session.endTime))) phase = 'before';
  else if (today === sessionIso) phase = 'soon';
  else if (today <= lastIso) phase = 'daily';
  else phase = 'after';

  return {
    challenge,
    phase,
    today,
    days,
    startIso,
    lastIso,
    sessionTitle: session.title,
    dayN: phase === 'daily' ? days.indexOf(today) + 1 : null,
    summaryOpen: today >= lastIso,
    // Home stops nudging for the summary two weeks after the challenge ends.
    summaryNudgeOver: today > addCalendarDays(lastIso, 14),
  };
}

/** Counts for her summary and the coaches' view. */
export function lepChallengeCounts(challenge, state, log) {
  const byDay = log?.days?.[challenge.key] || {};
  const days = state?.days || Object.keys(byDay).sort().slice(0, CHALLENGE_DAYS);
  const per = {};
  challenge.daily.forEach((d) => {
    per[d.id] = days.filter((iso) => Boolean(byDay[iso]?.[d.id])).length;
  });
  return {
    per,
    fullDays: days.filter((iso) => isChallengeDayDone(challenge, byDay[iso])).length,
    once: challenge.once ? log?.once?.[challenge.key]?.[challenge.once.id] || '' : '',
  };
}

export function formatChallengeDay(iso) {
  if (!iso) return '';
  const d = new Date(`${iso}T12:00:00`);
  return d.toLocaleDateString('en-IN', { weekday: 'short', day: 'numeric', month: 'short' });
}

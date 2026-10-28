/**
 * The week of streak reminders for one learner, from her real streak. Pure — scheduling lives
 * in services/localEngagementNotifications.js (syncStreakReminders).
 *
 * One reminder per evening (7 PM, phone time), each with its own words:
 *   tonight      — only if she has not practised yet today: what is on the line, or "start"
 *   tomorrow     — practised today: the streak at stake tomorrow (milestones get their own line);
 *                  not practised today and had a streak: a fresh-start line
 *   days 2–6     — she has not opened the app since: a gentle, different line each evening
 * then nothing — a learner who stays away is not nagged forever. Every time she opens the app
 * or practises, the plan is rebuilt, so a reminder never contradicts what she did.
 */

export const STREAK_REMINDER_HOUR = 19;
export const STREAK_REMINDER_DAYS = 7;

const MILESTONES = {
  3: 'Three days in a row — this is where habits start.',
  7: 'A full week of showing up. Finish it tonight.',
  14: 'Two weeks straight. This is who you are now.',
  21: 'Twenty-one days — the habit is yours.',
  28: 'Day 28. Finish the way you started.',
};

const COMEBACK = [
  ['Your practice is waiting', 'Ten minutes tonight puts you back on track.'],
  ['Show up, lead the room', 'Pick up where you left off — one practice tonight.'],
  ['Still with you', "Your 5 Rituals and today's practice are one tap away."],
  ['Small steps, every day', 'One practice tonight starts a new streak.'],
  ['We saved your seat', "Come back for ten minutes — that's all it takes."],
];

function atRisk(streak, name) {
  const next = streak + 1;
  if (MILESTONES[next]) {
    return { title: `Day ${next} is tonight 🏆`, body: MILESTONES[next] };
  }
  const who = name ? `${name}, one` : 'One';
  return { title: `${streak}-day streak on the line 🔥`, body: `${who} practice before midnight makes it Day ${next}.` };
}

function start(name) {
  return {
    title: 'Start your streak tonight',
    body: `${name ? `${name}, one` : 'One'} practice — about ten minutes. Day 1 begins with you.`,
  };
}

/**
 * @param {{ streak: number, todayActive: boolean, now?: Date, name?: string }} state
 *   streak — consecutive practice days ending today (if practised) or yesterday.
 * @returns {Array<{ key: string, at: Date, title: string, body: string }>}
 */
export function buildStreakReminders({ streak = 0, todayActive = false, now = new Date(), name = '' }) {
  const at = (days) =>
    new Date(now.getFullYear(), now.getMonth(), now.getDate() + days, STREAK_REMINDER_HOUR, 0, 0, 0);
  const out = [];

  // Tonight: only if there is still something to do, and 7 PM has not passed.
  if (!todayActive && at(0) > now) {
    out.push({ key: 'd0', at: at(0), ...(streak > 0 ? atRisk(streak, name) : start(name)) });
  }

  // Tomorrow: practised today → tomorrow's streak is at stake; missed today → a fresh start.
  if (todayActive) out.push({ key: 'd1', at: at(1), ...atRisk(streak, name) });
  else if (streak > 0) {
    out.push({ key: 'd1', at: at(1), title: 'Fresh start tonight', body: `Your ${streak}-day run ended. Day 1 is ten minutes away.` });
  } else out.push({ key: 'd1', at: at(1), ...start(name) });

  // Away since: one gentle line per evening, then stop.
  for (let d = 2; d < STREAK_REMINDER_DAYS; d += 1) {
    const [title, body] = COMEBACK[(d - 2) % COMEBACK.length];
    out.push({ key: `d${d}`, at: at(d), title, body });
  }
  return out;
}

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

// Voice for senior leaders (managers to CXOs, 15+ years): direct like a board brief, about
// stakes and identity rather than the app, respectful of her time, a peer and never a
// cheerleader. No emojis, no exclamation marks. Title up to 40, body up to 80 characters.
const MILESTONES = {
  3: 'Three days in a row. This is where most people stop.',
  7: 'Seven days of leading yourself first. Close the week tonight.',
  14: 'Two weeks straight. Your team would notice this discipline.',
  21: 'Day 21. This is no longer effort. It is who you are.',
  28: 'Day 28. Finish it the way you close a quarter.',
};

const COMEBACK = [
  ['Your seat is still yours', 'Ten minutes tonight and you are back in the 0.5% league.'],
  ['You make the hard calls at work', 'Make the easy one tonight: ten minutes of practice.'],
  ['The gap to your BHAG grows', 'Every day away widens it. Ten minutes tonight closes it.'],
  ['Still the leader you were', 'One practice tonight is all it takes to prove it.'],
  ['This is our last nudge', 'We will stop here. When you are ready, your practice is waiting.'],
];

function atRisk(streak, name) {
  if (!(streak > 0)) return start(name); // no run to protect yet
  const next = streak + 1;
  if (MILESTONES[next]) {
    return { title: `Day ${next} is tonight`, body: MILESTONES[next] };
  }
  return {
    title: `${streak} days strong. Keep the run alive.`,
    body: `${name ? `${name}, ten` : 'Ten'} minutes tonight makes it Day ${next}. Consistency is your edge.`,
  };
}

function start(name) {
  return {
    title: 'Your streak starts tonight',
    body: `${name ? `${name}, the` : 'The'} most senior thing you will do today: ten minutes on yourself.`,
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
    out.push({
      key: 'd1',
      at: at(1),
      title: 'Restart tonight',
      body: `Your ${streak}-day run ended. The best leaders restart fast. Day 1 takes ten minutes.`,
    });
  } else out.push({ key: 'd1', at: at(1), ...start(name) });

  // Away since: one gentle line per evening, then stop.
  for (let d = 2; d < STREAK_REMINDER_DAYS; d += 1) {
    const [title, body] = COMEBACK[(d - 2) % COMEBACK.length];
    out.push({ key: `d${d}`, at: at(d), title, body });
  }
  return out;
}

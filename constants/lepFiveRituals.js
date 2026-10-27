/**
 * LEP 5 Daily Rituals — tracker dashboard (1 mark each per day → 5/day, 35/week).
 * Copy matches constants/practice.js lep-rituals steps.
 */
export const LEP_FIVE_RITUALS = [
  { id: 'mirror', title: 'Mirror Work', short: 'Mirror' },
  { id: 'agame', title: 'A-Game', short: 'A-Game' },
  { id: 'request', title: 'Powerful Request', short: 'Request' },
  { id: 'gratitude', title: 'Gratitude', short: 'Thanks' },
  { id: 'bhag', title: 'B-HAG', short: 'B-HAG' },
];

/** Marks credited per ritual when ticked that IST day (5 rituals × 1 = 5/day, ×7 = 35/week). */
export const LEP_RITUAL_MARK_EACH = 1;

export const LEP_RITUAL_DAILY_MARKS_MAX = 5;

export const LEP_RITUAL_WEEKLY_MARKS_MAX = 35;

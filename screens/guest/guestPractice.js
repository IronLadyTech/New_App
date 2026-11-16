/**
 * Guest home practice: the question of the day and "Know your worth".
 *
 * Questions come from the CMS (Guest app → Daily questions, cms_guest kind 'daily_question');
 * until the team adds any, these built-in ones are used. Everyone sees the same question on the
 * same day, rotating through the list in order — so a question added at the end comes round in turn.
 */

/** Built-in questions (Iron Lady principles). Answers are spread across A–D on purpose. */
export const DAILY_QUESTIONS = [
  {
    id: 'projection',
    principle: 'Projection',
    question:
      'Your project saved the company ₹1.4 Cr. In the quarterly review, your manager presents it as the team’s win. What do you do?',
    options: [
      ['A', 'Stay quiet — good work speaks for itself.'],
      ['B', 'Thank him, then add one line: what you did and what it unlocks next.'],
      ['C', 'Email the leadership team later with the full details.'],
      ['D', 'Let it go this time and hope it’s noticed next quarter.'],
    ],
    answer: 'B',
    explain:
      'Projection, not performance. Men show 60% of the work as 100%; women do 99% and point at the 1% still pending. One clear line in the room — what you did and what it unlocks next — is shameless pitching done well.',
  },
  {
    id: 'shameless-pitch',
    principle: 'Shameless pitching',
    question: 'A senior role opens in your division. You are about 80% ready for it. What do you do?',
    options: [
      ['A', 'Wait until you are fully ready next year.'],
      ['B', 'Ask your manager whether you should apply.'],
      ['C', 'Pitch for it now: name the 80% you bring and how you will close the rest.'],
      ['D', 'Let HR come to you if they think you fit.'],
    ],
    answer: 'C',
    explain:
      'Women tend to apply only when they are 100% ready; others apply at 60%. Ask with what you have and a clear plan for the gap — that is shameless pitching.',
  },
  {
    id: 'negotiation',
    principle: 'The art of negotiation',
    question: 'You get an offer 15% above your current pay. What is your next move?',
    options: [
      ['A', 'Counter with your market number and the value you will create.'],
      ['B', 'Accept quickly — it is already a raise.'],
      ['C', 'Ask for a week, then accept as it is.'],
      ['D', 'Ask for extra leave instead of more pay.'],
    ],
    answer: 'A',
    explain:
      'You get what you negotiate, not what you deserve. Anchor on your market number (the 5x rule) and the value you will bring, not on your old salary.',
  },
  {
    id: 'maximise',
    principle: 'Maximise, not balance',
    question: 'Your family and a big project both need you this month. What is the Iron Lady way?',
    options: [
      ['A', 'Give each exactly half your time.'],
      ['B', 'Step back from the project this time.'],
      ['C', 'Push through and sleep less.'],
      ['D', 'Pick what matters most in each, and ask for help with the rest.'],
    ],
    answer: 'D',
    explain:
      '“Balance” usually means compromise. Maximise instead: decide the few things that move the needle in each part of your life, and get support for the rest — without apology.',
  },
  {
    id: 'bhag',
    principle: 'B-HAG',
    question: 'Which one is a B-HAG — a Big Hairy Audacious Goal?',
    options: [
      ['A', 'Get a good appraisal this year.'],
      ['B', 'Become the CXO of a listed company within five years.'],
      ['C', 'Get better at Excel.'],
      ['D', 'Keep my current job safe.'],
    ],
    answer: 'B',
    explain:
      'A B-HAG is big enough to scare you. That is the point — it pulls bigger decisions and bolder actions out of you every single day.',
  },
  {
    id: 'brand',
    principle: 'Differentiated brand',
    question: 'Your manager describes you as “very hardworking”. What is missing?',
    options: [
      ['A', 'Nothing — that is high praise.'],
      ['B', 'More visible overtime.'],
      ['C', 'A differentiated brand: the one strength people remember you for.'],
      ['D', 'A bigger job title.'],
    ],
    answer: 'C',
    explain:
      'Hard work is the baseline, not a brand. Be known for one strength that makes you indispensable — that is what gets you named in rooms you are not in.',
  },
  {
    id: 'win-without-fighting',
    principle: 'Win without fighting',
    question: 'A peer keeps taking credit for your ideas in meetings. What is the strongest move?',
    options: [
      ['A', 'Share your idea with the key people before the meeting.'],
      ['B', 'Confront them in front of everyone.'],
      ['C', 'Complain to HR.'],
      ['D', 'Ignore it — it will sort itself out.'],
    ],
    answer: 'A',
    explain:
      'Business war tactics: shape the outcome before the room meets. When the decision-makers already know it is yours, there is nothing left to fight over.',
  },
  {
    id: 'ask',
    principle: 'Ask for what you want',
    question: 'You would love to lead the new client account. Nobody has asked you. You…',
    options: [
      ['A', 'Wait to be picked.'],
      ['B', 'Drop hints in the team chat.'],
      ['C', 'Hope your results speak for you.'],
      ['D', 'Ask directly: say why you, and what you will deliver.'],
    ],
    answer: 'D',
    explain:
      'Principle 01 — ask for what you want. Opportunities go to the people who ask clearly, with a reason and a promise.',
  },
];

/** A CMS row (or a built-in question) in one shape. Returns null if it is not a usable question. */
export function normaliseQuestion(row) {
  if (!row) return null;
  if (Array.isArray(row.options) && row.options.length) {
    const options = row.options.filter((o) => o && o[0] && String(o[1] || '').trim());
    return options.length >= 2 && options.some((o) => o[0] === row.answer) ? { ...row, options } : null;
  }
  // CMS: title = question, optionA–D, answer, body = explanation, principle.
  const options = ['A', 'B', 'C', 'D']
    .map((k) => [k, String(row[`option${k}`] || '').trim()])
    .filter(([, t]) => t);
  const answer = String(row.answer || '').trim().toUpperCase();
  if (!String(row.title || '').trim() || options.length < 2 || !options.some(([k]) => k === answer)) return null;
  return {
    id: row.id,
    principle: String(row.principle || '').trim() || 'Iron Lady principle',
    question: String(row.title).trim(),
    options,
    answer,
    explain: String(row.body || '').trim(),
  };
}

/** Today's date in India (YYYY-MM-DD). */
export function todayIst(now = new Date()) {
  return new Date(now.getTime() + 330 * 60000).toISOString().slice(0, 10);
}

/** The same question for everyone on the same day, rotating through the list in order. */
export function questionForDay(list, isoDay) {
  const usable = (list || []).map(normaliseQuestion).filter(Boolean);
  if (!usable.length) return null;
  const days = Math.floor(Date.parse(`${isoDay}T00:00:00Z`) / 86400000);
  return usable[((days % usable.length) + usable.length) % usable.length];
}

/**
 * Know your worth: an Iron Lady salary range from her role and years of experience.
 * Built on the Masterclass 5x rule (market number = 5 × years, in lakh); the role sets where in
 * the 4x–6x band she sits. The programme team can change these numbers here.
 */
export const WORTH_ROLES = [
  { id: 'entry', label: 'Entry level', low: 3, high: 4.5 },
  { id: 'manager', label: 'Manager', low: 4, high: 5.5 },
  { id: 'senior', label: 'Senior manager', low: 4.5, high: 6 },
  { id: 'director', label: 'Director / Head', low: 5, high: 6.5 },
  { id: 'cxo', label: 'VP / CXO', low: 5.5, high: 7.5 },
];

/**
 * Her typed job title → a role level. Most senior match wins ("Senior Manager" is senior, not
 * manager). Unknown titles count as Manager, the middle of the scale.
 */
const ROLE_WORDS = [
  ['cxo', /\b(ceo|cfo|coo|cto|cio|cmo|chro|cxo|chief|founder|co-founder|managing director|md|president|vice president|vp|svp|evp|avp|partner|board)\b/i],
  ['director', /\b(director|head|gm|general manager|principal|country manager|business head)\b/i],
  ['senior', /\b(senior manager|sr\.? ?manager|associate director|lead manager|program manager|programme manager|senior lead)\b/i],
  ['manager', /\b(manager|team lead|tl|lead|supervisor|consultant|specialist|architect|pm|sde ?3|sse|senior)\b/i],
  ['entry', /\b(intern|trainee|fresher|graduate|junior|jr|executive|associate|analyst|assistant|coordinator|officer|engineer|developer|designer|entry|sde|swe|sde ?[12]|qa|ba|hr|tester|programmer|accountant|teacher)\b/i],
];

export function roleFromTitle(title) {
  const t = String(title || '').trim();
  if (!t) return null;
  const hit = ROLE_WORDS.find(([, re]) => re.test(t));
  return hit ? hit[0] : 'manager';
}

function lakhLabel(l) {
  if (l >= 100) {
    const cr = l / 100;
    return `₹${cr % 1 ? cr.toFixed(1) : cr} crore`;
  }
  return `₹${Math.round(l)} lakh`;
}

/** { low, high, lowLabel, highLabel, mid } in lakh a year, or null. */
export function worthRange(roleId, years) {
  const role = WORTH_ROLES.find((r) => r.id === roleId) || WORTH_ROLES[1];
  const y = Math.max(1, Math.min(40, Number(years) || 0));
  const low = Math.round(role.low * y);
  const high = Math.round(role.high * y);
  return { low, high, mid: 5 * y, lowLabel: lakhLabel(low), highLabel: lakhLabel(high), role };
}

/** Position (0–1) of an amount in lakh on the "know your worth" track, 0 → ₹2 crore. */
export function worthTrackPos(lakh) {
  return Math.sqrt(Math.max(0, Math.min(200, Number(lakh) || 0)) / 200);
}

/** Tick labels for that track. */
export const WORTH_TICKS = [
  { lakh: 10, label: '₹10L' },
  { lakh: 50, label: '₹50L' },
  { lakh: 100, label: '₹1Cr' },
  { lakh: 200, label: '₹2Cr' },
];

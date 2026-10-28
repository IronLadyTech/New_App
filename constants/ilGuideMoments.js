/** Vetted IL Guide moments — quotes + one-tap reflection (not LLM). */

export const IL_GUIDE_MOTIVATION_QUOTES = [
  {
    id: 'mq1',
    text: 'The task of the leader is to get their people from where they are to where they have not been.',
    author: 'Henry Kissinger',
  },
  {
    id: 'mq2',
    text: 'Leadership is the capacity to translate vision into reality.',
    author: 'Warren Bennis',
  },
  {
    id: 'mq3',
    text: 'The best way to predict the future is to create it.',
    author: 'Peter Drucker',
  },
  {
    id: 'mq4',
    text: 'You do not ask for a seat at the table. You command the room so they pull one up.',
    author: 'Iron Lady',
  },
  {
    id: 'mq5',
    text: 'Courage is not the absence of fear — it is action in spite of it.',
    author: 'Iron Lady',
  },
];

export const IL_GUIDE_REFLECTION_MCQS = [
  {
    id: 'mcq-bhag',
    prompt: 'What would move your B-HAG forward this week?',
    options: ['One hard conversation', 'Block deep-work time', 'Ask for feedback', 'Not today'],
  },
  {
    id: 'mcq-energy',
    prompt: 'Your leadership energy this week feels mostly…',
    options: ['Building momentum', 'Stretched thin', 'Ready to delegate', 'Regrouping'],
  },
  {
    id: 'mcq-engage',
    prompt: 'Who could you lift up in Engage today?',
    options: ['A batchmate', 'My CX', 'Someone new', 'Skip for now'],
  },
  {
    id: 'mcq-learn',
    prompt: 'Your next 15 minutes are best spent on…',
    options: ['Next program task', 'A principle video', 'Case study', 'Rest — by design'],
  },
];

export function formatIlGuideQuote({ text, author }) {
  const body = String(text || '').trim();
  const who = String(author || '').trim();
  if (!body) return '';
  return who ? `"${body}" — ${who}` : `"${body}"`;
}

function daySeed(key) {
  const s = String(key || 'il-guide');
  let h = 0;
  for (let i = 0; i < s.length; i += 1) {
    h = (h * 31 + s.charCodeAt(i)) | 0;
  }
  return Math.abs(h);
}

/** One quote or MCQ per surface per day (stable, not random every render). */
export function pickIlGuideMoment({ uid, surface }) {
  const seed = daySeed(`${surface}|${uid || 'guest'}|${new Date().toISOString().slice(0, 10)}`);
  const mcqEvery = 3;
  if (seed % mcqEvery === 0 && IL_GUIDE_REFLECTION_MCQS.length) {
    const mcq = IL_GUIDE_REFLECTION_MCQS[seed % IL_GUIDE_REFLECTION_MCQS.length];
    return { kind: 'mcq', mcq };
  }
  const q = IL_GUIDE_MOTIVATION_QUOTES[seed % IL_GUIDE_MOTIVATION_QUOTES.length];
  return { kind: 'quote', quote: formatIlGuideQuote(q) };
}

/**
 * LEP quizzes — the starting questions (approved 26 Nov 2026). The team edits them in the CMS
 * (Quizzes); the saved version in Firestore (cms_practice/{quizId}) replaces these.
 * `answer` is the index of the correct option.
 */

export const QUIZ_IDS = {
  RITUALS: 'quiz-lep-5-rituals',
  PRINCIPLES: 'quiz-lep-27-principles',
};

/** Which task opens which quiz. */
export const QUIZ_FOR_TASK = {
  'lep-quiz-5-rituals': QUIZ_IDS.RITUALS,
  'lep-quiz-27-principles': QUIZ_IDS.PRINCIPLES,
};

export const DEFAULT_PASS_PERCENT = 70;

export const DEFAULT_QUIZZES = {
  [QUIZ_IDS.RITUALS]: {
    title: '5 Daily Rituals — Quiz',
    passPercent: DEFAULT_PASS_PERCENT,
    questions: [
      {
        q: 'Which of these is NOT one of the 5 Daily Rituals?',
        options: ['Mirror Work', 'Gratitude', 'Checking emails first', 'B-HAG'],
        answer: 2,
        explain: 'The five are Mirror Work, A-Game, Powerful Request, Gratitude and B-HAG. Start the day on purpose, not on email.',
      },
      {
        q: 'How long does Mirror Work take?',
        options: ['About one minute', 'Ten minutes', 'Half an hour', 'As long as you like'],
        answer: 0,
        explain: 'Mirror Work is a one-minute ritual.',
      },
      {
        q: 'In the A-Game ritual, you…',
        options: ['name today’s one big thing', 'review last week', 'list every task', 'plan your month'],
        answer: 0,
        explain: 'A-Game: name today’s one big thing.',
      },
      {
        q: 'In the Powerful Request ritual, you…',
        options: ['decide the one ask you will make today', 'write a to-do list', 'ask your team for updates', 'send a request email'],
        answer: 0,
        explain: 'Powerful Request: decide the one ask you will make today.',
      },
      {
        q: 'How do you do the B-HAG ritual?',
        options: ['Say your Big Hairy Audacious Goal out loud', 'Write it in your diary', 'Think about it silently', 'Share it on LinkedIn'],
        answer: 0,
        explain: 'B-HAG: say your Big Hairy Audacious Goal out loud.',
      },
      {
        q: 'What do you use every morning in Mirror Work?',
        options: ['Your crucible statement', 'Your resume', 'Your ERRC table', 'Your pitch script'],
        answer: 0,
        explain: 'Your crucible statement is what you use every morning in the Mirror Exercise.',
      },
      {
        q: 'How many ritual marks can you earn in a week?',
        options: ['5', '7', '25', '35'],
        answer: 3,
        explain: 'One mark per ritual: 5 a day, 35 a week.',
      },
    ],
  },
  [QUIZ_IDS.PRINCIPLES]: {
    title: '27 Principles — Quiz',
    passPercent: DEFAULT_PASS_PERCENT,
    questions: [
      {
        q: 'B-HAG stands for…',
        options: ['Big Hairy Audacious Goal', 'Best Habits And Goals', 'Big High-Achieving Growth', 'Bold Habits, Actions, Goals'],
        answer: 0,
        explain: 'B-HAG is your Big Hairy Audacious Goal: big enough to scare you.',
      },
      {
        q: 'ERRC stands for…',
        options: ['Eliminate, Reduce, Raise, Create', 'Evaluate, Review, Repeat, Close', 'Energy, Rest, Reflect, Commit', 'Engage, Respond, Relate, Connect'],
        answer: 0,
        explain: 'Eliminate, Reduce, Raise, Create.',
      },
      {
        q: 'Why do ERRC on your week?',
        options: ['To free time from low-value work for your growth', 'To finish more meetings', 'To report to your manager', 'To plan holidays'],
        answer: 0,
        explain: 'ERRC frees time from low-value work and puts it into your growth.',
      },
      {
        q: 'Your A-Game is…',
        options: ['when you are at your best, and what pulls you out of it', 'your job description', 'a sports drill', 'a weekly report'],
        answer: 0,
        explain: 'Your A-Game: when you are at your best, and what pulls you out of it.',
      },
      {
        q: 'CoDeSeF is your…',
        options: ['step-by-step strategy toward your B-HAG', 'daily diary', 'LinkedIn plan', 'team chart'],
        answer: 0,
        explain: 'CoDeSeF is the step-by-step strategy toward your big goal.',
      },
      {
        q: 'A Shameless Pitch covers…',
        options: ['Need, Differentiation, Offer', 'Name, Date, Outcome', 'Problem, Price, Product', 'Past, Present, Future'],
        answer: 0,
        explain: 'Need, Differentiation, Offer.',
      },
      {
        q: 'The Day 1 Powerful Request assignment asks you to make 3 requests and…',
        options: ['get at least one NO', 'get three YESes', 'email them', 'avoid any NO'],
        answer: 0,
        explain: 'Make 3 powerful requests and get at least one NO: it shows you asked boldly.',
      },
      {
        q: 'Your Differentiated Brand statement should be…',
        options: [
          'one or two lines on who you serve, what you are known for and what makes you different',
          'a full-page bio',
          'your job title',
          'your list of degrees',
        ],
        answer: 0,
        explain: 'One or two lines: who you serve, what you are known for, what makes you different.',
      },
      {
        q: 'A Purpose Peg helps you…',
        options: ['stay aligned when pressure rises', 'track your expenses', 'plan meetings', 'grow followers'],
        answer: 0,
        explain: 'A Purpose Peg keeps you aligned when pressure rises.',
      },
      {
        q: 'Powerful Responding Techniques are about…',
        options: ['choosing a powerful response instead of reacting', 'answering emails faster', 'replying to every message', 'avoiding hard conversations'],
        answer: 0,
        explain: 'Reacting costs trust; responding builds power.',
      },
      {
        q: 'How many Guiding Stars are there?',
        options: ['5', '7', '9', '27'],
        answer: 2,
        explain: 'There are nine Guiding Stars, on the Guiding Stars poster.',
      },
      {
        q: 'Which is one of the Guiding Stars?',
        options: ['Winning Obsession', 'Perfect Planning', 'Avoiding Risk', 'Working Alone'],
        answer: 0,
        explain: 'Winning Obsession: I focus on winning at every stage of my life.',
      },
    ],
  },
};

/** A quiz the app can show: at least one question, each with 2+ options and a valid answer. */
export function cleanQuiz(raw, fallback) {
  const questions = (Array.isArray(raw?.questions) ? raw.questions : [])
    .map((x) => ({
      q: String(x?.q || '').trim(),
      options: (Array.isArray(x?.options) ? x.options : []).map((o) => String(o || '').trim()).filter(Boolean),
      answer: Number(x?.answer),
      explain: String(x?.explain || '').trim(),
    }))
    .filter((x) => x.q && x.options.length >= 2 && x.answer >= 0 && x.answer < x.options.length);
  if (!questions.length) return fallback;
  const pass = Number(raw?.passPercent);
  return {
    title: String(raw?.title || fallback?.title || 'Quiz'),
    passPercent: pass > 0 && pass <= 100 ? pass : DEFAULT_PASS_PERCENT,
    questions,
  };
}

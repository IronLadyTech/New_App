/**
 * LEP quizzes — the starting questions (rephrased as practice questions, 26 Nov 2026). The team edits them in the CMS
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
        q: 'This morning you did Mirror Work, A-Game and B-HAG. Which two rituals are still left?',
        options: ['Checking emails and planning meetings', 'Powerful Request and Gratitude', 'ERRC and CoDeSeF', 'Pitch practice and LinkedIn'],
        answer: 1,
        explain: 'The five are Mirror Work, A-Game, Powerful Request, Gratitude and B-HAG.',
      },
      {
        q: 'How much time do you give Mirror Work each morning?',
        options: ['Half an hour', 'About one minute', 'Ten minutes', 'Only on session days'],
        answer: 1,
        explain: 'Mirror Work is a one-minute ritual, every morning.',
      },
      {
        q: 'Standing at the mirror, what do you say to yourself?',
        options: ['Your to-do list for the day', 'Your resume summary', 'Your crucible statement', 'Your pitch script'],
        answer: 2,
        explain: 'Your crucible statement, from the Crucibles of Leadership task, is what you use in Mirror Work.',
      },
      {
        q: 'What do you name in your A-Game ritual?',
        options: ['Every task on your list', 'Last week’s wins', 'Your plan for the month', 'Today’s one big thing'],
        answer: 3,
        explain: 'A-Game: name today’s one big thing.',
      },
      {
        q: 'In your Powerful Request ritual, what do you decide?',
        options: ['Which emails to answer first', 'Who should update you today', 'The one ask you will make today', 'What to delegate this week'],
        answer: 2,
        explain: 'Powerful Request: decide the one ask you will make today.',
      },
      {
        q: 'How do you do your Gratitude and B-HAG rituals?',
        options: ['Say them out loud', 'Write them in a diary', 'Think about them silently', 'Post them on LinkedIn'],
        answer: 0,
        explain: 'Both are said out loud: what you are grateful for, and your Big Hairy Audacious Goal.',
      },
      {
        q: 'You did all five rituals every day this week. What is your week score?',
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
        q: 'How big should your B-HAG feel?',
        options: ['Safe and easy to reach', 'Big enough to scare you a little', 'The same as this year’s job targets', 'Whatever your manager sets'],
        answer: 1,
        explain: 'B-HAG is your Big Hairy Audacious Goal: big enough to scare you.',
      },
      {
        q: 'In your ERRC table, what goes under Create?',
        options: ['Work you stop doing', 'Work you do less of', 'Something new you will start with the time you freed', 'Work you do more of'],
        answer: 2,
        explain: 'Eliminate what you stop, Reduce what you do less, Raise what matters more, Create something new with the time you free.',
      },
      {
        q: 'A weekly status meeting adds little value to your goals. Where does it go in your ERRC table?',
        options: ['Raise', 'Create', 'Eliminate or Reduce', 'Leave it out of the table'],
        answer: 2,
        explain: 'Low-value work goes under Eliminate or Reduce, so the time goes into your growth.',
      },
      {
        q: 'Each evening in your A-Game Table, what do you note?',
        options: ['When you were at your best today, and what pulled you out of it', 'What you spent today', 'Which meetings you attended', 'Your team’s tasks for tomorrow'],
        answer: 0,
        explain: 'Your A-Game: when you are at your best, and what pulls you out of it.',
      },
      {
        q: 'You have your B-HAG. What do you build with CoDeSeF?',
        options: ['A LinkedIn post plan', 'Your step-by-step strategy toward it', 'A daily diary', 'Your team chart'],
        answer: 1,
        explain: 'CoDeSeF is the step-by-step strategy toward your big goal.',
      },
      {
        q: 'You are recording your Shameless Pitch. What three parts must it cover?',
        options: ['Name, Date, Outcome', 'Problem, Price, Product', 'Need, Differentiation, Offer', 'Past, Present, Future'],
        answer: 2,
        explain: 'Need, Differentiation, Offer.',
      },
      {
        q: 'You made three powerful requests and all three said yes. What does the Day 1 assignment ask next?',
        options: ['Nothing, you are done', 'Ask more boldly: you need at least one NO', 'Stop asking for a while', 'Ask the same people again'],
        answer: 1,
        explain: 'Make 3 powerful requests and get at least one NO: a NO shows you asked boldly.',
      },
      {
        q: 'Someone asks for your Differentiated Brand statement. What do you share?',
        options: [
          'Your full-page bio',
          'Your job title',
          'One or two lines on who you serve, what you are known for and what makes you different',
          'Your list of degrees',
        ],
        answer: 2,
        explain: 'One or two lines: who you serve, what you are known for, what makes you different.',
      },
      {
        q: 'Pressure is rising before a big decision. What keeps you aligned?',
        options: ['Your expense tracker', 'Your Purpose Peg', 'Your meeting calendar', 'Your follower count'],
        answer: 1,
        explain: 'A Purpose Peg keeps you aligned when pressure rises.',
      },
      {
        q: 'A colleague criticises your work in a meeting. What does Powerful Responding ask of you?',
        options: ['Reply at once and defend yourself', 'Stay silent and avoid the topic', 'Escalate it by email', 'Choose a powerful response instead of reacting'],
        answer: 3,
        explain: 'Reacting costs trust; responding builds power.',
      },
      {
        q: 'How many Guiding Stars are on your Guiding Stars poster?',
        options: ['5', '7', '9', '27'],
        answer: 2,
        explain: 'There are nine Guiding Stars.',
      },
      {
        q: '“I focus on winning at every stage of my life.” Which Guiding Star is this?',
        options: ['Perfect Planning', 'Winning Obsession', 'Avoiding Risk', 'Working Alone'],
        answer: 1,
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

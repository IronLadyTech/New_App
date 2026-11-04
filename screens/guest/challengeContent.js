/**
 * The 4-Day Challenge — the Iron Lady Masterclass turned into four short days in the app.
 * Source: "Iron Lady Masterclass — complete content map and 4-day app conversion" (draft).
 *
 * One principle and one task per day: goal → why you're invisible → how you become
 * visible → how you get paid and handle politics.
 *
 * Rules for this file:
 *  - No prices, discounts, scholarship or seat-blocking amounts anywhere (App Store 2.1).
 *  - No names, companies or quotes from the session notes until they are checked against
 *    the recordings and consent is given. Case studies stay unnamed.
 *  - videoUrl stays null until the clean video cuts exist (they must end before the
 *    community pitch in the Day 1 recording).
 */

export const CHALLENGE_LENGTH = 4;

export const CHALLENGE_DAYS_CONTENT = [
  {
    n: 1,
    title: 'BHAG and breakthrough actions',
    short: 'The goal big enough to scare you',
    cardLabel: 'Your BHAG',
    intro:
      'Every Iron Lady journey starts here: name the goal, then decide where your energy goes. Fifteen minutes, one task.',
    videoUrl: null,
    teach: [
      {
        h: 'Knowledge is not implementation',
        b: 'An interesting session that changes nothing is the most common outcome of learning. Leadership is practised, step by step. The more you practise, the more you get.',
      },
      {
        h: 'Your BHAG comes first',
        b: 'A Big Hairy Audacious Goal is the starting point, not an exercise. Your brand, your pitch and your negotiation all serve a goal you have already named.',
      },
      {
        h: 'Breakthrough actions',
        b: 'Instead of trying to do everything, put your time into the few activities that move your career most.',
      },
    ],
    task: 'bhag',
    bonus: {
      title: 'A big goal, reached',
      lines: [
        'The women who reach the top rarely had a better plan at the start. They had a named goal, and they kept choosing the two or three actions that moved it.',
        'Read your BHAG once more tonight. If saying it aloud feels comfortable, it is not big enough yet.',
      ],
    },
  },
  {
    n: 2,
    title: 'Projection and your worth',
    short: 'Why the work isn’t seen, and your number',
    cardLabel: 'Your worth',
    intro:
      'Most capable women don’t stall on performance. They stall on projection. Today: where the gap is, and what you are worth.',
    videoUrl: null,
    teach: [
      {
        h: 'The 3 Ps',
        b: 'Purpose: communicate through it. Performance: your core responsibilities. Projection: where the gap usually is.',
      },
      {
        h: '60 shown as 100, 99 shown as 1',
        b: 'Many men complete about 60% of the work and present it as 100%. Many women complete 99% and talk about the 1% still pending. Projection, not performance, is what gets you to the next level.',
      },
      {
        h: 'Know your worth',
        b: '“The market is down.” “Be grateful for your job.” “You don’t have an MBA.” Don’t let these set your number. When markets are hard, building capability is your advantage. Build a roadmap; transformation is not overnight.',
      },
    ],
    task: 'worth',
    bonus: {
      title: 'Turning hidden work into visible work',
      lines: [
        'The fastest projection win is usually one sentence to the right person: what you did, and what it unlocks next.',
        'Take the line you wrote today and find one place this week to say it out loud.',
      ],
    },
  },
  {
    n: 3,
    title: 'Your brand and a shameless pitch',
    short: 'A line people repeat about you',
    cardLabel: 'Your brand',
    intro:
      'Your brand is the image you create in other people’s minds. Today you write it in three parts, then say it as a pitch.',
    videoUrl: null,
    teach: [
      {
        h: 'A differentiated brand statement',
        b: 'Three parts: your differentiated strength (character plus strengths), one or two stories of accomplishment, and recognition (awards, rewards).',
      },
      {
        h: 'Speak only through strengths',
        b: 'Project your strengths. Don’t lead with what you are still working on.',
      },
      {
        h: 'Shameless pitching',
        b: 'Ask confidently and without apology for what you deserve. To make it land: speak to the other person’s need, differentiate yourself on two ideas, and make a visible offer.',
      },
    ],
    task: 'brand',
    bonus: {
      title: 'Maximise, don’t balance',
      lines: [
        'Careers that move fast are rarely balanced. They are built on doing a few things exceptionally, and making sure people know.',
        'Branding matters more than most people assume. Your statement is the start; repeating it is the work.',
      ],
    },
  },
  {
    n: 4,
    title: 'Negotiation and politics',
    short: 'Ask for what you deserve',
    cardLabel: 'Your ask',
    intro:
      'You only get what you negotiate for, not just what you deserve. Today: the ask you have been avoiding, and how to handle the politics around it.',
    videoUrl: null,
    teach: [
      {
        h: 'Negotiate, don’t just deserve',
        b: 'Deserving is assumed. The gap is the asking.',
      },
      {
        h: 'Dealing with politics',
        b: 'Smile and carry a gun. Show commitment to the organisation, and bring big ideas and strategic initiatives. Stop being a sitting duck, understand the other side, and deliver results through your strengths.',
      },
      {
        h: 'Three levels of winning',
        b: 'Win at any cost. Win at least cost. Win without fighting. Aim for the third.',
      },
    ],
    task: 'ask',
    bonus: {
      title: 'Resilience',
      lines: [
        'The women who reach senior roles through setbacks describe the same thing: focus on outcomes, keep working hard, and keep asking.',
        'Send your first three sentences this week. The first ask is the hardest one.',
      ],
    },
  },
];

/** Day 1 task: the five breakthrough actions from the Masterclass. */
export const BREAKTHROUGH_ACTIONS = [
  'Building your network',
  'Developing leadership skills',
  'Understanding the business',
  'Increasing market visibility',
  'Learning new capabilities',
];

/** Day 2: the 5x rule from the Masterclass — 5 × years of experience, in lakh. */
export function worthLakh(years) {
  const y = Number(years);
  if (!Number.isFinite(y) || y <= 0) return null;
  return Math.round(Math.min(y, 45) * 5);
}

export function formatWorth(years) {
  const l = worthLakh(years);
  if (l == null) return '';
  return l >= 100 ? `₹${(l / 100).toFixed(l % 100 ? 1 : 0)} crore` : `₹${l} lakh`;
}

/** Day 3: the three parts composed into one statement she can share. */
export function composeBrand({ strength, story, recognition } = {}) {
  const parts = [strength, story, recognition].map((s) => String(s || '').trim()).filter(Boolean);
  return parts.join(' ');
}

export function dayContent(n) {
  return CHALLENGE_DAYS_CONTENT.find((d) => d.n === Number(n)) || CHALLENGE_DAYS_CONTENT[0];
}

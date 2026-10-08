import {
  ERRC_M3U8,
  PRINCIPLES_FULL_M3U8,
  PRINCIPLES_PREVIEW_YT,
  RITUALS_M3U8,
  SHAMELESS_KEY_YT,
} from './lessonAssets';
import { PREWORK_THUMBS } from './preworkThumbs';

/**
 * Daily practice that is not a course task (revisions, rituals, rehearsals).
 * Course tasks open CourseTask; these open the Practice page and are ticked there.
 */
export const PRACTICE = {
  'bm-ambition': {
    programId: '100bm',
    kind: 'Daily revision',
    minutes: 1,
    title: 'Say your board ambition out loud once',
    why: 'A board seat you can say in one breath is a board seat people remember. Saying it out loud makes it yours.',
    steps: [
      'Stand up. Phone down.',
      'Say it in one sentence: the board you want, by when, and why you.',
      'Say it once more, slower. No “I hope”, no “maybe”.',
    ],
    note: 'Write the sentence you said',
  },
  'bm-guide-message': {
    programId: '100bm',
    kind: 'Video · 3 min',
    minutes: 3,
    title: 'Watch today’s message from IL Guide',
    why: 'Three minutes on what this week asks of you before Onboarding.',
    steps: [
      'Find a quiet three minutes.',
      'Watch today’s message from IL Guide in Learn.',
      'Note one line you will act on today.',
    ],
    note: 'The one line you will act on',
  },
  'bm-superpower': {
    programId: '100bm',
    kind: 'Daily revision',
    minutes: 2,
    title: 'Say your SuperPower Statement out loud — under 20 seconds',
    why: 'If it takes longer than 20 seconds, the room stops listening. Practice makes it land in one go.',
    steps: [
      'Open a timer for 20 seconds.',
      'Say your SuperPower Statement out loud.',
      'If you went over, cut one clause and say it again.',
    ],
    note: 'Your statement, as you said it',
  },
  'bm-ask': {
    programId: '100bm',
    kind: 'Get ready for Phase 2',
    minutes: 5,
    title: 'Rehearse your ask out loud, twice',
    why: 'Phase 2 rewards a rehearsed pitch, not a written one. Twice out loud beats ten times in your head.',
    steps: [
      'Pick one real ask you are avoiding making.',
      'Say it out loud: what you want, by when, and what it unlocks for them.',
      'Say it a second time without looking at notes.',
    ],
    note: 'The ask, in one line',
  },
  'bm-qa': {
    programId: '100bm',
    kind: 'Live session · Thu 7:00 PM IST',
    minutes: 60,
    title: 'Weekly Q&A',
    why: 'The women who bring a question get twice as much out of the hour.',
    steps: [
      'Write one question from this week’s Pitch & Strategy work.',
      'Add it to the cohort’s question queue before Thursday.',
      'Join on time — the first ten minutes set the agenda.',
    ],
    note: 'Your question for Thursday',
  },
  'mbw-mirror-work': {
    programId: 'mbw',
    kind: 'LEP ritual',
    minutes: 5,
    title: 'Mirror Work',
    why: 'The ritual from LEP that keeps your C-Suite voice steady before the day starts.',
    steps: [
      'Stand in front of a mirror. Shoulders back.',
      'Say your three strengths out loud, looking at yourself.',
      'Finish with today’s one powerful request.',
    ],
  },
  'mbw-errc': {
    programId: 'mbw',
    kind: 'Daily revision',
    minutes: 2,
    title: 'Revise ERRC: one thing to eliminate today',
    why: 'Eliminate, Reduce, Raise, Create — one small cut today frees an hour for C-Suite work.',
    steps: [
      'Look at today’s calendar.',
      'Pick one thing to Eliminate — a meeting, a task, a habit.',
      'Decide who gets it instead, or simply drop it.',
    ],
    note: 'What you eliminated',
  },
  'mbw-business-language': {
    programId: 'mbw',
    kind: 'Daily revision',
    minutes: 2,
    title: 'Say one accomplishment in business language',
    why: 'C-Suite leaders talk in outcomes: revenue, cost, risk, growth. Not effort.',
    steps: [
      'Pick one thing you did this month.',
      'Say it as: the business problem → what you did → the number it moved.',
      'Say it again in under 15 seconds.',
    ],
    note: 'Your accomplishment, in business language',
  },
  'lep-rituals': {
    programId: 'lep',
    kind: 'LEP ritual · 18 min',
    minutes: 18,
    title: '5 Daily Rituals — morning check',
    why: 'The five rituals are how Iron Ladies start the day on purpose, not on email.',
    videoUrl: RITUALS_M3U8,
    videoLabel: 'Watch the 5 Daily Rituals',
    thumb: PREWORK_THUMBS['lep-rituals'],
    steps: [
      'Mirror Work — one minute.',
      'A-Game — name today’s one big thing.',
      'Powerful Request — decide the one ask you will make today.',
      'Gratitude — say what you are grateful for out loud.',
      'B-HAG — say your Big Hairy Audacious Goal out loud.',
    ],
  },
  'lep-principle': {
    programId: 'lep',
    kind: 'Daily revision',
    minutes: 2,
    title: 'Revise Principle 3 from the 27 Principles',
    why: 'One principle a day, revised out loud, is how the 27 become reflexes.',
    steps: [
      'Open the 27 Principles in Learn and find Principle 3.',
      'Read it once, then say it in your own words.',
      'Name one place you will use it today.',
    ],
    note: 'Where you will use it today',
  },
  'lep-bhag': {
    programId: 'lep',
    kind: 'Foundation · 5 min',
    minutes: 5,
    title: 'Define your BHAG',
    why: 'Your Big Hairy Audacious Goal is the north star for every LEP conversation.',
    videoUrl: PRINCIPLES_PREVIEW_YT,
    videoLabel: 'Principle 01 · Ask for what you want',
    thumb: PREWORK_THUMBS['lep-principles-video'],
    steps: [
      'Watch the Principle 01 segment (or skip if you have seen it).',
      'Write your BHAG in one sentence — the goal big enough to scare you.',
      'Say it out loud once before you mark this done.',
    ],
    note: 'Your BHAG in one sentence',
    noteRequired: true,
  },
  'lep-principles-video': {
    programId: 'lep',
    kind: 'Pre-work · 14 min',
    minutes: 14,
    title: 'Watch the 27 Principles video',
    why: 'The mental models the whole program is built on.',
    videoUrl: PRINCIPLES_FULL_M3U8,
    videoUrlPreview: PRINCIPLES_PREVIEW_YT,
    videoLabel: 'Watch the 27 Principles',
    thumb: PREWORK_THUMBS['lep-principles-video'],
    steps: ['Find 14 quiet minutes.', 'Watch the 27 Principles video.', 'Note the one principle that hit hardest.'],
    note: 'The principle that hit hardest',
  },
  'lep-shameless': {
    programId: 'lep',
    kind: 'Pre-work · 22 min',
    minutes: 22,
    title: 'Watch The Shameless Speech',
    why: 'Before Day 1, see what shameless pitching looks like done well.',
    videoUrl: SHAMELESS_KEY_YT,
    videoLabel: 'Watch The Shameless Speech',
    thumb: PREWORK_THUMBS['lep-shameless'],
    steps: ['Find 22 quiet minutes.', 'Watch The Shameless Speech.', 'Write one line you will steal for your own pitch.'],
    note: 'The line you will steal',
  },
  'lep-get-ready': {
    programId: 'lep',
    kind: 'Checklist · 1 min',
    minutes: 1,
    title: 'Tick one item on your Get ready checklist',
    why: 'Day 1 goes further when the logistics are already done.',
    steps: [
      'Open your Get ready checklist on Home.',
      'Pick the smallest item left — calendar, setup, or Zoom.',
      'Do it now and tick it.',
    ],
  },
  'lep-power-pitch': {
    programId: 'lep',
    kind: 'Challenge · 15 min',
    minutes: 15,
    title: 'Power Pitch — say who you are in 30 seconds',
    why: 'Thirty seconds is all a room gives you. Practice until it fits.',
    audioRecord: true,
    audioLabel: 'Record your 30-second pitch',
    steps: [
      'Name: who you are, in one line.',
      'Proof: one result you are proud of, with a number.',
      'Purpose: where you are going next.',
      'Say all three in 30 seconds. Repeat until it fits.',
    ],
  },
};

export const practiceKey = (id) => `practice:${id}`;

/** A practice row is done if it was seeded done, or ticked as a course task / practice. */
export function isItemDone(item, isDone) {
  if (item.done) return true;
  if (item.taskId) return isDone(item.programId, item.taskId);
  if (item.practiceId) return isDone(item.programId, practiceKey(item.practiceId));
  return false;
}

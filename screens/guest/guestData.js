import { COVER } from '../lep/lepData';
import { COMMUNITY_ASSET_KEYS, CSUITE_ASSET_KEYS, PODCAST_ASSET_KEYS } from '../../constants/lessonAssets';

export const HERO = require('../../assets/il/suvarna-hero.jpg');
export const FACE = require('../../assets/il/suvarna-face.jpg');
export const MC_COVER = require('../../assets/il/mc-evenings.jpg');

export const PROGRAM_PATH = [
  { id: 'mc', code: 'MC', meta: '2 evenings', fill: '#ED1D24' },
  { id: 'lep', code: 'LEP', meta: '1 month', fill: '#C41E21' },
  { id: '100bm', code: '100BM', meta: '6 months', fill: '#113744' },
  { id: 'mbw', code: 'MBW', meta: '1 year', fill: '#3A4A4E' },
];

export const PROGRAM_CARDS = [
  {
    id: 'mc',
    num: '01',
    badge: 'START HERE',
    title: 'Masterclass (MC)',
    body: 'Two evenings, live — Tue 7:00 PM and Wed 6:30 PM · four of the 27 principles: BHAG, branding, shameless pitching, negotiation.',
    chips: ['2 evenings', '4 of 27 principles', 'Twice a week'],
    img: MC_COVER,
  },
  {
    id: 'lep',
    num: '02',
    badge: 'MOST CHOSEN',
    title: 'Leadership Essentials program (LEP)',
    body: 'An 11-step personal transformation sprint — from your first belief-shift to your certificate.',
    chips: ['1 month', 'Certification', 'Starts every Saturday'],
  },
  {
    id: '100bm',
    num: '03',
    badge: 'BOARD-READY',
    title: '100 Board Members (100BM)',
    body: 'A 6-month board-readiness journey — build the profile, pitch and presence a board expects.',
    chips: ['6 months', 'Online', 'Starts every month'],
  },
  {
    id: 'mbw',
    num: '04',
    badge: 'BY APPLICATION',
    title: 'Master of Business Warfare (MBW)',
    body: 'A 1-year strategy circle for women already leading — four powerful in-person sessions.',
    chips: ['1 year', '4 in-person sessions', '~5 batches a year'],
  },
];

export const DRILLS = [
  { id: 'pitch', title: 'Power Pitch', meta: '3 min · Pitch', tag: 'Pitch', icon: 'mic' },
  { id: 'mirror', title: 'Leadership Mirror', meta: '5 min · Presence', tag: 'Presence', icon: 'groups' },
  { id: 'silence', title: 'Own the Silence', meta: '4 min · Presence', tag: 'Presence', icon: 'volume-off' },
  { id: 'journal', title: 'Power Journal', meta: '7 min · Voice', tag: 'Voice', icon: 'edit' },
  { id: 'pose', title: 'Power Pose Reset', meta: '2 min · Presence', tag: 'Presence', icon: 'accessibility' },
];

export const DRILL_GUIDES = {
  pitch: {
    kicker: 'Pitching · 3 min',
    title: ['The 60-Second', 'Power Pitch'],
    tagline: 'Own your story. Speak it with authority.',
    steps: [
      {
        n: '01',
        t: 'Who you are',
        d: 'Say aloud: "I am [Name], [Title] at [Company]. I specialise in [expertise]." Stand tall. No apology in your voice.',
      },
      {
        n: '02',
        t: 'What you do differently',
        d: 'Say aloud: "What makes my approach different is [your unique method or result]." Be specific. Numbers win.',
      },
      {
        n: '03',
        t: 'The hook',
        d: 'End with: "Right now I am working on [project/goal] and it is [result/impact]." Make them want to ask more.',
      },
      {
        n: '04',
        t: 'The repeat drill',
        d: 'Say the full pitch three times — faster each round. The goal is fluency without thinking. Your confidence lives in your repetition.',
      },
    ],
    timer: { label: 'Practice timer', secs: 60, start: 'Start Timer' },
    done: 'Practice Complete',
  },
  mirror: {
    kicker: 'Self-Awareness · 5 min',
    title: ['The Leadership', 'Mirror'],
    tagline: 'Honest answers build powerful leaders.',
    steps: [
      {
        n: 'Q1',
        t: 'Where did you lead today?',
        d: 'Describe one moment today where you made a decision, influenced someone, or moved something forward. Write it down.',
        input: 'I led when I...',
      },
      {
        n: 'Q2',
        t: 'Where did you hold back?',
        d: 'One moment where you played small — stayed quiet, deferred, or apologised unnecessarily. Name it.',
        input: 'I held back when...',
      },
      {
        n: 'Q3',
        t: 'What will you do differently tomorrow?',
        d: 'One specific action. Not a goal — an action. Something you will actually do in the next 24 hours.',
        input: 'Tomorrow I will...',
      },
    ],
    done: 'Reflection Complete',
  },
  silence: {
    kicker: 'Communication · 4 min',
    title: ['Own the', 'Silence'],
    tagline: 'Whoever speaks first after a number, loses.',
    steps: [
      {
        n: '01',
        t: 'Set your number',
        d: 'Write the number you want — salary, fee, budget. Not the safe number. The real one.',
        input: 'My number is...',
      },
      {
        n: '02',
        t: 'Say it out loud',
        d: 'Speak it clearly. No hedging. No "I was thinking maybe around…". Just the number. Then — stop talking. Practice now.',
      },
      {
        n: '03',
        t: 'Hold the silence — 10 seconds',
        d: 'After you say your number, start the timer. Do not speak. Do not explain. Authority lives in stillness.',
      },
    ],
    timer: { label: 'Silence timer', secs: 10, start: 'Hold the Silence', hush: true },
    done: 'Practice Complete',
  },
  journal: {
    kicker: 'Reflection · 7 min',
    title: ['The Power', 'Journal'],
    tagline: 'Daily reflection is your competitive advantage.',
    steps: [
      {
        n: 'Win',
        t: 'One win today',
        d: 'Big or small. Own it. Women who track their wins get promoted faster — because they learn to articulate their value.',
        input: 'Today I won when...',
      },
      {
        n: 'Drop',
        t: 'One thing to leave behind',
        d: 'A habit, a thought pattern, a way of speaking. Name it — then consciously decide you are done with it.',
        input: 'I am dropping...',
      },
      {
        n: 'Next',
        t: 'One intention for tomorrow',
        d: 'One sentence. One action. Something that moves you forward — not a task, a leadership move.',
        input: 'Tomorrow I intend to...',
      },
    ],
    done: 'Journal Saved',
  },
  pose: {
    kicker: 'Confidence · 2 min',
    title: ['The Power', 'Pose Reset'],
    tagline: 'Claim your space before you enter the room.',
    steps: [
      {
        n: '01',
        t: 'Ground yourself',
        d: 'Stand with feet shoulder-width apart. Feel the floor. You are not a guest here. Take a slow, full breath in through your nose.',
      },
      {
        n: '02',
        t: 'Expand your space',
        d: 'Shoulders back. Chin level. Eyes forward. Place your hands on your hips or open your arms wide. Hold this for 60 seconds — your body is telling your brain who you are.',
      },
      {
        n: '03',
        t: 'Your power statement',
        d: 'Say aloud or in your mind: "I am prepared. I belong here. I lead." Say it three times. Believe the third one.',
      },
    ],
    timer: { label: 'Hold your pose', secs: 60, start: 'Start Hold', step: 1 },
    done: 'Ready. Go Lead.',
  },
};

export const REELS = ['Boardroom confidence', 'Negotiation', 'Strategy'];

export const PRINCIPLES_PREVIEW = [
  { n: '01', title: 'Own the Room Before You Speak' },
  { n: '02', title: 'Say No Without Explaining' },
];

export const TOPICS = [
  { title: 'Executive presence', icon: 'mic' },
  { title: 'Negotiation & pay', icon: 'emoji-events' },
  { title: 'Personal brand & LinkedIn', icon: 'share' },
  { title: 'Office politics', icon: 'groups' },
  { title: 'Career comeback', icon: 'east' },
  { title: 'Board readiness', icon: 'crop-square' },
  { title: 'Starting up', icon: 'check' },
  { title: 'Maximise, not balance', icon: 'schedule' },
];

const EPISODE_META = [
  {
    title: 'The One Notch Up: A Global CEO’s Blueprint for Leadership',
    person: 'Simon Newman · Co-Founder & Chairman, Iron Lady',
    min: '46 min',
    img: COVER.speaks06,
    featured: true,
  },
  {
    title: "The ‘Remote Factory Girl’ — who rules manufacturing boardrooms now",
    person: 'Priyanka Singla · manufacturing leader',
    min: '61 min',
    img: COVER.speaks05,
  },
  {
    title: 'From Invisible to Unstoppable | Inside the mind of a global technology leader',
    person: 'Charu Sharma · global technology leader',
    min: '44 min',
    img: COVER.speaks04c,
  },
  {
    title: '“My Work Will Speak for Me” — the biggest myth she broke after 21 years',
    person: 'Mohini Hanwate · Global Quality Lead',
    min: '36 min',
    img: COVER.speaks04m,
  },
  {
    title: 'From invisible legal head to global board member',
    person: 'Lakshmi Nayak · board member, global MNC',
    min: '72 min',
    img: COVER.speaks02,
  },
  {
    title: 'The 11×11 Mission: building a healthcare ecosystem',
    person: 'Pushpalatha · healthcare entrepreneur',
    min: '74 min',
    img: COVER.speaks01,
  },
];

export const EPISODES = EPISODE_META.map((ep, i) => ({
  ...ep,
  assetKey: PODCAST_ASSET_KEYS[i],
}));

const CSUITE_META = [
  { title: 'From chaos to cyber resilience', who: 'Priyanka Sunder · Cybersecurity', tag: 'C-suite', img: COVER.priyanka },
  { title: 'Pygmalion Effect in Management', who: 'Kamini Chawla · Leadership', tag: 'C-suite', img: COVER.kamini },
  { title: 'Print isn’t dying. It’s evolving.', who: 'Rekha Sharma · Media', tag: 'C-suite', img: COVER.rekha },
  { title: 'Technology isn’t a cost. It’s a growth multiplier.', who: 'Radhika Sharma · Technology', tag: 'C-suite', img: COVER.radhika },
  { title: 'What is your 20-mile march?', who: 'Suma Bhat · Product', tag: 'C-suite', img: COVER.suma },
  { title: 'Clarity is a business strategy', who: 'Varsha Fulzele · Delivery', tag: 'C-suite', img: COVER.varsha },
  { title: 'Stop jumping to solutions', who: 'Smriti Mishra · Product', tag: 'C-suite', img: COVER.smriti },
  { title: 'Turn people insight into impact', who: 'Meghna Makkar · HR', tag: 'C-suite', img: COVER.meghna },
  { title: 'Human API & program management', who: 'Divya Mona · Programs', tag: 'C-suite', img: COVER.divya },
  { title: 'AI accelerates. Governance protects.', who: 'Poornima George · AI', tag: 'C-suite', img: COVER.poornima },
];

export const CSUITE_HOME = CSUITE_META.map((item, i) => ({
  ...item,
  assetKey: CSUITE_ASSET_KEYS[i],
}));

const COMMUNITY_META = [
  {
    title: "75+ Iron Ladies who've reached the 1 crore income!",
    meta: '100BM and LEP',
    img: HERO,
  },
  {
    title: '26th April — Winning Ways for Women with Indra Nooyi',
    meta: '100BM and LEP',
    img: HERO,
  },
];

export const COMMUNITY_VIDEOS = COMMUNITY_META.map((item, i) => ({
  ...item,
  assetKey: COMMUNITY_ASSET_KEYS[i],
}));

export const WINS = [
  {
    icon: 'emoji-events',
    title: '75+ Iron Ladies who’ve reached the 1 crore income!',
    sub: 'Community video · Watch now',
  },
  { icon: 'east', title: 'Promoted to VP in 3 months', sub: 'Fintech · LEP batch of Mar 2026' },
  { icon: 'check', title: 'Closed a ₹62L enterprise deal', sub: 'SaaS sales · using the negotiation framework' },
  { icon: 'person', title: 'Raised a ₹2Cr seed round', sub: 'Founder · MBW alumna' },
];

export const HOME_SLIDES = [
  {
    kicker: 'Start here',
    program: 'Masterclass (MC)',
    title: 'Two evenings that change how you see your career.',
    body: 'Set your BHAG, find your market worth and learn to pitch without apology — 4 of the 27 principles, live.',
    chips: ['2 evenings · live', '4 of 27 principles'],
    cta: 'Explore Masterclass',
    id: 'mc',
    img: MC_COVER,
  },
  {
    kicker: 'Most chosen',
    program: 'Leadership Essentials (LEP)',
    title: '11 steps. One transformation.',
    body: 'Two full days, then four weeks of practice — from identity to execution, with a certificate.',
    chips: ['1 month', 'Certificate'],
    cta: 'Explore LEP',
    id: 'lep',
  },
  {
    kicker: 'Board-ready',
    program: '100 Board Members',
    title: 'Six months to a board-ready profile.',
    body: 'Weekly live Q&A. Brand, visibility, governance, negotiation — fully online.',
    chips: ['6 months', 'Online'],
    cta: 'Explore 100BM',
    id: '100bm',
  },
  {
    kicker: 'By application',
    program: 'Master of Business Warfare',
    title: 'A year with women who already lead.',
    body: 'Four in-person intensives. Enterprise influence and board-ready authority.',
    chips: ['1 year', 'Closed cohort'],
    cta: 'Explore MBW',
    id: 'mbw',
  },
];

export const STORIES = ['Promotion', 'Board seat', 'Comeback', 'Founder', 'Pay raise'];

export const CHALLENGE_DAYS = [
  { n: '1', t: 'Your BHAG', d: 'The goal big enough to scare you', on: true },
  { n: '2', t: 'Your worth', d: 'Projection and the 5x rule' },
  { n: '3', t: 'Your brand', d: 'A line people repeat about you' },
  { n: '4', t: 'Your ask', d: 'Negotiate for what you deserve' },
];

export const QOTD = [
  ['A', 'Stay quiet — good work speaks for itself.'],
  ['B', 'Thank him, then add one line: what you did and what it unlocks next.'],
  ['C', 'Email the leadership team later with the full details.'],
  ['D', 'Let it go this time and hope it’s noticed next quarter.'],
];

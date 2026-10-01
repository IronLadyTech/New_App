export const HERO = require('../../assets/il/suvarna-hero.jpg');
export const FACE = require('../../assets/il/suvarna-face.jpg');

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
  { title: 'Power Pitch', meta: '3 min · Pitch', tag: 'Pitch', icon: 'mic' },
  { title: 'Leadership Mirror', meta: '5 min · Presence', tag: 'Presence', icon: 'groups' },
  { title: 'Own the Silence', meta: '4 min · Presence', tag: 'Presence', icon: 'volume-off' },
  { title: 'Power Journal', meta: '7 min · Voice', tag: 'Voice', icon: 'edit' },
  { title: 'Power Pose Reset', meta: '2 min · Presence', tag: 'Presence', icon: 'accessibility' },
];

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

export const EPISODES = [
  {
    title: "The 'Remote Factory Girl' – who rules manufacturing boardrooms now",
    person: 'Priyanka Singla · manufacturing leader',
    min: '61 min',
  },
  {
    title: 'From Invisible to Unstoppable | Inside the mind of a global technology leader',
    person: 'Charu Sharma · global technology leader',
    min: '44 min',
  },
  {
    title: '“My Work Will Speak for Me” — the biggest myth she broke after 21 years',
    person: 'Mohini Hanwate · Global Quality Lead',
    min: '36 min',
  },
  {
    title: 'From invisible legal head to global board member',
    person: 'Lakshmi Nayak · board member, global MNC',
    min: '72 min',
  },
  {
    title: 'The 11×11 Mission: building a healthcare ecosystem',
    person: 'Pushpalatha · healthcare entrepreneur',
    min: '74 min',
  },
];

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

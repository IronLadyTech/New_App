export const FACE = require('../../assets/il/suvarna-face.jpg');
export const HERO = require('../../assets/il/suvarna-hero.jpg');

export const ROLES = ['Technology', 'Marketing', 'Finance', 'HR', 'Founder', 'Other'];

export const REG_PRACTICE = [
  { id: 'p1', title: 'Watch the 27 Principles video', meta: 'Pre-work · 14 min', done: true },
  { id: 'p2', title: 'Revise Principle 1 from the 27 Principles', meta: 'Daily revision · 2 min', done: true },
  {
    id: 'p3',
    title: 'Power Pitch — say who you are in 30 seconds',
    meta: 'Challenge · Day 1 of 3 · 15 min',
    done: false,
  },
  { id: 'p4', title: 'Watch today’s message from IL Guide', meta: 'Video · 3 min', done: false },
];

export const ENR_PRACTICE = [
  { id: 'e1', title: 'Daily ritual — morning principle', meta: 'Ritual · 8:00 AM · 5 min', done: true },
  { id: 'e2', title: 'Revise Principle 1 from the 27 Principles', meta: 'Daily revision · 2 min', done: true },
  { id: 'e3', title: 'Watch The Shameless Pitch', meta: 'Pre-work · 22 min', done: false },
  { id: 'e4', title: 'Open your Get ready checklist', meta: 'Checklist · 3 min', done: false },
];

export const DUE_WEEK = [
  { id: 'd1', title: 'Day 1 Assignment', meta: 'LEP · Assignment', due: 'Due Thu', icon: 'assignment' },
  { id: 'd2', title: 'Fill the CoDeSeF sheet', meta: 'LEP · Form', due: 'Due Fri', icon: 'edit-note' },
  { id: 'd3', title: 'SuperPower Statement', meta: '100BM · Practice drill', due: 'Due Sun', icon: 'my-location' },
];

export const PREWORK = [
  { n: '01', title: 'The 27 Principles', sub: 'Mental models for unflinching leadership', min: '14m', done: true },
  { n: '02', title: 'The 5 Rituals of Iron Ladies', sub: 'Daily energetic mastery', min: '18m', done: true },
  {
    n: '03',
    title: 'The Shameless Speech',
    sub: 'Unlearning boardroom modesty and anchoring in unapologetic authority.',
    min: '22 mins',
    done: false,
  },
];

export const GET_READY = [
  { title: 'Login to your program', done: true },
  { title: 'Test your webcam', done: true },
  { title: 'Check stable internet', done: true },
  { title: 'Keep an executive notebook ready', done: false },
  { title: 'Block calendar for both days', done: false },
];

export const PHASES = [
  {
    n: '01',
    title: 'Pre-Program Preparation',
    sub: 'VIA Survey · 3 photographs · CoDeSeF · NSDC',
    done: true,
  },
  { n: '02', title: 'Program Orientation', sub: 'Framework · Access Essentials · Schedule', done: true },
  { n: '03', title: 'Day 1 — Personal Transformation', sub: 'A-Game · Crucibles · ERRC Table', done: true },
  { n: '04', title: 'Day 2 — Strategies and Tactics', sub: 'CoDeSeF · Key Relationships · Purpose Peg', now: true },
  { n: '05', title: 'Week 1 — Differentiated brand', sub: '0.5% League Roadmap · brand statement' },
  { n: '06', title: 'Week 2 — Profile, resume, Shameless Pitch', sub: 'LinkedIn · resume · pitch it out loud' },
  { n: '07', title: 'Week 3 — Leadership habits', sub: 'Progress Q&A · daily rituals' },
  { n: '08', title: 'Week 4 — Certification week', sub: 'Final Evaluation · Graduation Feedback' },
  { n: '09', title: 'Final Evaluation', sub: '27 Principles Quiz · no timer' },
  { n: '10', title: 'Graduation Feedback', sub: 'Required for the certificate' },
  { n: '11', title: 'Certificate', sub: 'LEP Certification & the Iron Lady Alumni' },
];

export const PHASE_TASKS = [
  { id: 't1', title: 'CoDeSeF', kind: 'Reading', done: true },
  { id: 't2', title: 'Powerful Extreme Responding', kind: 'Video', done: true },
  { id: 't3', title: 'Maximise Key Relationships', kind: 'Reading · ~10 min', done: false },
  { id: 't4', title: 'Purpose Peg Table', kind: 'Form', done: false },
  { id: 't5', title: 'Day 2 Assignment', kind: 'Assignment · due Thu', done: false, task: 'assignment' },
];

export const SESSIONS_UP = [
  {
    id: 's1',
    mon: 'SEP',
    day: '21',
    title: 'Day 2 — Strategies and Tactics',
    meta: '9:00 AM – 7:00 PM IST · live on Zoom',
    cta: 'Join',
  },
  {
    id: 's2',
    mon: 'SEP',
    day: '23',
    title: 'Weekly Handholding Session',
    meta: 'Tue 7:00 PM · check-in afterwards',
    cta: 'Remind me',
  },
  {
    id: 's3',
    mon: 'SEP',
    day: '25',
    title: 'Community Circle',
    meta: 'Thu 8–9 PM · closed-door triad',
    cta: 'Add',
  },
  {
    id: 's4',
    mon: 'SEP',
    day: '27',
    title: 'Bengaluru chapter meetup',
    meta: 'In person · 10:00 AM',
    cta: 'RSVP',
  },
];

export const SESSIONS_DONE = [
  { title: 'Day 1 — Personal Transformation', meta: 'Sat 20 Sep · attended · recording ready' },
  { title: 'Program Orientation', meta: 'Fri 19 Sep · check-in saved' },
];

export const CIRCLE = ['YUKTI', 'DISHA', 'UDAAN', 'Visibility Platform'];

export const LEARN_CHIPS_REG = ['For you', 'Principles', 'Case studies', 'Events'];
export const LEARN_CHIPS_ENR = ['For you', 'Principles', 'Case studies', 'Events', 'Community stories'];

export const PRINCIPLES_OPEN = [
  { n: '01', title: 'Purpose', sub: 'Name the goal that scares you', state: 'Watched' },
  { n: '02', title: 'Being', sub: 'How you show up before you speak', state: 'Watched' },
  { n: '03', title: 'Declaration', sub: 'Say it so the room has to hear it', state: 'Start' },
  { n: '04', title: 'Trust', sub: 'The Anatomy of Boardroom Voice & Cadence', state: 'Resume' },
];

export const PRINCIPLES_LOCKED = [
  { n: '05', title: 'Visibility' },
  { n: '06', title: 'Network' },
  { n: '07', title: 'Negotiation' },
  { n: '08', title: 'Political savvy' },
];

export const LEARN_CONTINUE = [
  {
    tag: 'PRINCIPLE 04',
    title: 'The Anatomy of Boardroom Voice & Cadence',
    left: '8m left',
    pct: 65,
    cta: 'Resume →',
    open: true,
  },
  {
    tag: 'EXECUTIVE',
    title: 'Cybersecurity as a board function',
    left: '',
    pct: 0,
    cta: 'Unlocks upon enrollment',
    open: false,
  },
];

export const LEARN_FRESH = [
  { title: 'Architecting Sovereign Authority', meta: 'IL Guide · 16 mins · Open principle', open: true },
  { title: "The ‘Remote Factory Girl’", meta: '21 mins · Enrolled only', open: false },
  { title: 'From Invisible to Unstoppable', meta: '12 mins · Enrolled only', open: false },
];

export const LEARN_EVENT_REG = {
  kicker: 'PUNE CHAPTER MEETUP · LIVE',
  title: 'Breaking the Glass Ceiling into CXO',
  place: 'JW Marriott, Senapati Bapat Rd, Pune',
  when: 'Sat · 11:00 AM',
  who: '+2 attending',
};

export const LEARN_WHISPER =
  'You do not ask for a seat at the table. You command the room so they pull one up.';

export const LEARN_CITIES = ['Bengaluru', 'Pune', 'Mumbai', 'Delhi NCR'];
export const LEARN_CITIES_ENR = ['Bengaluru', 'Pune', 'Mumbai', 'Delhi NCR', 'Hyderabad'];

export const LEARN_CONTINUE_ENR = [
  {
    tag: 'PRINCIPLE 04',
    title: 'The Anatomy of Boardroom Voice & Cadence',
    left: '8m left',
    pct: 65,
    cta: 'Resume',
  },
  {
    tag: 'EXECUTIVE CASE',
    title: 'Unflinching Negotiation & Compensation',
    left: '',
    pct: 35,
    cta: 'Resume',
  },
];

export const LEARN_FRESH_ENR = [
  { title: 'Architecting Sovereign Alliance', meta: 'By IL Guide & Global Leadership', time: '16 mins', neu: true },
  { title: 'The 4 Invisible Rules of Mauritius', meta: 'Finance mastery for non-finance', time: '21 mins', neu: true },
  { title: 'Decisive Responses to Executive Pushback', meta: 'Scripted mental models for live rooms', time: '12 mins', neu: false },
];

export const LEARN_EVENT_ENR = {
  mon: 'OCT',
  day: '05',
  dow: 'SAT',
  title: 'Pune Chapter Meetup',
  sub: '“Breaking the Glass Ceiling into CXO”',
  place: 'JW Marriott, Senapati Bapat Rd',
  who: '+28 attending',
};

export const LEARN_WHISPER_ENR = 'Tell me your city and I’ll show you events near you.';

export const PRINCIPLES_FOUND_ENR = [
  { n: '01', title: 'Purpose', min: '14 min', state: 'DONE' },
  { n: '02', title: 'Being', min: '11 min', state: 'DONE' },
  { n: '03', title: 'The shameless speech', min: '22 min', state: 'DONE' },
  { n: '04', title: 'Build your board of advocates', min: '16 min', state: 'DONE' },
];

export const PRINCIPLES_INFLUENCE_ENR = [
  { n: '10', title: 'Negotiating from the seat you want', min: '18 min · in progress', state: 'Resume', hot: true },
  { n: '11', title: 'Turn visibility into sponsorship', min: '20 min', state: 'Start' },
  { n: '12', title: 'The unflinching no', min: '15 min', state: 'Start' },
];

export const PRINCIPLES_COMMAND_ENR = [
  { n: '19', title: 'Command the room', min: '19 min', state: 'Opens Day 2' },
  { n: '21', title: 'Choose the fight worth having', min: '16 min', state: 'Opens Day 2' },
];

export const CASES_MORE_ENR = [
  {
    tag: 'MEDIA',
    title: "Print Isn't Dying, It's Evolving From Volume To Value.",
    meta: 'Media & Publishing · Strategy shift',
    time: '26 mins',
  },
  {
    tag: 'LEADERSHIP',
    title: 'Pygmalion Effect in Management',
    meta: 'Team Leadership · A-game',
    time: '18 mins',
  },
];

export const EVENT_ROOMS_ENR = [
  { dow: 'THU', day: '18', title: 'Community Circle', meta: '8–9 PM · Closed-door triad', cta: 'Add', solid: true },
  { dow: 'THU', day: '25', title: 'Community Circle', meta: '8–9 PM · With cohort leaders', cta: 'Add' },
  { dow: 'SAT', day: '04', title: 'Batch group catch-up', meta: 'Your 48 batchmates · 11 AM', cta: 'Join' },
];

export const EVENT_NEAR_ENR = [
  { mon: 'SEP', day: '27', title: 'Bengaluru Chapter meetup', meta: 'Sat 27 Sep · 6 PM · Indiranagar', cta: 'RSVP' },
  { mon: 'APR', day: '19', title: 'Walk to the Board', meta: '7 cities · 6:30 PM · In person', cta: 'RSVP' },
];

export const STORIES_FUNC_ENR = [
  { title: 'Team lead to VP in 18 months', who: 'Meera R. · Fintech', time: '4:15' },
  { title: 'The meeting I stopped apologising in', who: 'Disha P. · Platform', time: '3:20' },
];

export const COHORT_WEEK = [
  { icon: 'campaign', title: '12 women shared their Shameless Pitch', meta: 'Week 2 task · add yours before Sunday' },
  { icon: 'graphic-eq', title: 'Day 1 attendance: 46 of 48', meta: 'Recordings are in Sessions' },
];

export const LEARN_CASES_LOCKED = [
  'Rewriting a stalled promotion cycle',
  'The 14-month CXO jump',
  'Board challenge in a family firm',
  'From invisible legal head to global board',
  'Pay negotiation after a career break',
  'The one-notch-up year',
  'Taking the factory floor to the board',
  'Founder to professional CEO',
];

export const LEARN_EVENTS_OPEN = [
  { title: 'Walk to the Board 2026', meta: 'Open to every member · Aug 2026' },
  { title: 'Bengaluru chapter meetup', meta: 'Sat 26 Sep · 10:00 AM · in person' },
  { title: 'Iron Lady Speaks live', meta: 'Online · open to every member' },
];

export const LEARN_EVENTS_LOCKED = [
  { title: 'Thursday Community Circle', meta: 'Cohort room · Thu 8–9 PM' },
  { title: 'Day 1 & Day 2', meta: 'LEP Batch 42 · locked until enrollment' },
  { title: 'Private batch group', meta: 'Opens when your seat is confirmed' },
];

export const PODCASTS = [
  {
    title: '“My Work Will Speak for Me” — The Biggest Myth She Broke',
    meta: 'Ep 3 · 28 min',
    featured: true,
  },
  { title: 'From Invisible Legal Head to Global Board', meta: 'Ep 2 · 22 min' },
  { title: 'The One Notch Up: A Global CEO’s Blueprint', meta: 'Ep 1 · 31 min' },
];

export const ENGAGE_EVENTS_REG = [
  { mon: 'APR', day: '26', title: 'Winning Ways for Women', meta: 'Live webinar · April 26' },
  { mon: 'SEP', day: '27', title: 'Bengaluru Chapter meetup', meta: 'Sat 27 September · 6 PM' },
];

export const ARMY_STORIES = [
  { title: 'Meera: Team Lead to VP in 18 months', meta: 'Fintech & Strategy', time: '4:15' },
  { title: 'What Changed After My First 30 Days', meta: 'Mindset & Voice', time: '3:40' },
];

export const CIRCLES_LOCKED = [
  { icon: 'groups', title: 'Your batch group', meta: 'Private cohort circle' },
  { icon: 'event', title: 'Thursday Community Circle', meta: 'Closed-door triads' },
];

export const QUIZ_Q = {
  n: 4,
  total: 10,
  q: 'Which Day 1 tool maps what you will Eliminate, Reduce, Raise and Create?',
  options: ['A-Game Table – Daily Ritual', 'ERRC Table', 'Purpose Peg Table', 'CoDeSeF sheet'],
  answer: 1,
};

export const SCHEDULE_DAYS = [
  { d: '21', w: 'MON' },
  { d: '22', w: 'TUE' },
  { d: '23', w: 'WED', on: true },
  { d: '24', w: 'THU' },
  { d: '25', w: 'FRI' },
  { d: '26', w: 'SAT' },
];

export const SCHEDULE_ITEMS = [
  {
    time: '6:30 PM',
    tag: 'LIVE · ONLINE · IN 2 H 14 M',
    title: 'Day 2 — Strategies and Tactics',
    meta: 'LEP Batch 42 · 3 hrs',
    live: true,
  },
  {
    time: '11:59 AM',
    tag: 'DEADLINE',
    title: 'Day 1 Assignment',
    meta: 'LEP · due 7:00 PM',
    day: 'THU 24',
  },
];

export const NOTICES = [
  {
    kind: 'attention',
    icon: 'assignment-late',
    title: 'Day 1 Assignment is due tomorrow',
    meta: 'LEP · submit before 11:59 AM Thu',
    action: 'Open assignment',
    go: 'Assignment',
    ago: '2h',
  },
  {
    kind: 'attention',
    icon: 'videocam',
    title: 'Day 2 starts in 2 hours',
    meta: 'Join link is live at 6:20 PM',
    action: 'Add to calendar',
    ago: '2h',
  },
  {
    kind: 'guide',
    icon: 'local-fire-department',
    title: 'Four active days this week',
    meta: 'One more and you close the week strong',
    ago: '8:00 AM',
  },
  {
    kind: 'guide',
    icon: 'chat-bubble-outline',
    title: 'Your facilitator left feedback',
    meta: 'On your Day 1 Assignment',
    ago: 'Yesterday',
  },
];

export const ROAD = [
  { title: 'Day 1 — Personal Transformation', sub: 'Live · Day 1 Assignment submitted', done: true },
  { title: 'Day 2 — Strategies and Tactics', sub: 'Live · Day 2 Assignment submitted', done: true },
  { title: 'Week 1 — Differentiated Brand Statement', sub: '0.5% League Roadmap · Engagement Form', done: true },
  { title: 'Week 2 — Profile, Resume, Shameless Pitch', sub: '3 of 7 done · this week', now: true },
  { title: 'Week 3 — Progress Review, Guiding Stars', sub: 'Weekly Handholding Session' },
  { title: 'Week 4 — Certification', sub: 'Attendance · 2 quizzes · Graduation Feedback' },
];

export const TODAY_ITEMS = [
  { title: 'A-Game Table — Daily Ritual', meta: 'Ritual · 5 min', done: true },
  { title: 'Daily revision (ERRC) · 7-day streak', meta: 'Revision · 8:00 AM', done: true },
  { title: 'Today’s message from IL Guide', meta: 'Video · 3 min', done: true },
  { title: 'Week 2 Engagement Form', meta: 'Form · 4 min', done: false },
  { title: 'Shameless Pitch practice', meta: 'Week task · 12 min', done: false },
  { title: 'Weekly Handholding Session', meta: 'Tonight · 8:00 PM', done: false },
];

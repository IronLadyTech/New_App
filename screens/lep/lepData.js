export const FACE = require('../../assets/il/suvarna-face.jpg');
export const HERO = require('../../assets/il/suvarna-hero.jpg');

export const COVER = {
  priyanka: require('../../assets/il/portraits/priyanka-sunder.png'),
  kamini: require('../../assets/il/portraits/kamini-chawla.png'),
  suma: require('../../assets/il/portraits/suma-bhat.png'),
  rekha: require('../../assets/il/portraits/rekha-sharma.png'),
  radhika: require('../../assets/il/portraits/radhika-sharma.png'),
  meghna: require('../../assets/il/portraits/meghna-makkar.png'),
  varsha: require('../../assets/il/portraits/varsha-fulzele.png'),
  smriti: require('../../assets/il/portraits/smriti-mishra.png'),
  divya: require('../../assets/il/portraits/divya-mona.png'),
  poornima: require('../../assets/il/portraits/poornima-george.png'),
  speaks01: require('../../assets/il/portraits/speaks-01-pushpa.jpg'),
  speaks02: require('../../assets/il/portraits/speaks-02-lakshmi.jpg'),
  speaks04c: require('../../assets/il/portraits/speaks-04-charu.jpg'),
  speaks04m: require('../../assets/il/portraits/speaks-04-mohini.jpg'),
  speaks05: require('../../assets/il/portraits/speaks-05-priyanka.jpg'),
  speaks06: require('../../assets/il/portraits/speaks-06-simon.jpg'),
};

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

/** Phase 01 tasks a registered (part-paid) participant sees; the first few are open. */
export const PRE_PROGRAM_TASKS = [
  { id: 'p1', title: 'VIA Survey', kind: 'Form · ~15 min', done: true },
  { id: 'p2', title: 'Upload 3 photographs', kind: 'Upload', done: false },
  { id: 'p3', title: 'CoDeSeF', kind: 'Reading', done: false },
  { id: 'p4', title: 'NSDC registration', kind: 'Form', done: false },
  { id: 'p5', title: 'Program Orientation video', kind: 'Video · Phase 02', done: false },
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
  { n: '01', title: 'Ask for what you want', min: '12 min', track: 'Foundation', state: 'Watched' },
  { n: '02', title: 'Own the room before you speak', min: '14 min', track: 'Foundation', state: 'Watched' },
  { n: '03', title: 'The shameless speech', min: '22 min', track: 'Foundation', state: 'Resume' },
  { n: '04', title: 'Build your board of advocates', min: '16 min', track: 'Foundation', state: 'Start' },
];

export const PRINCIPLES_LOCKED = [
  { n: '05', title: 'Negotiate from the seat you want', min: '18 min', track: 'Influence' },
  { n: '06', title: 'Turn visibility into sponsorship', min: '20 min', track: 'Influence' },
  { n: '07', title: 'The unflinching no', min: '15 min', track: 'Influence' },
  { n: '08', title: 'Read the room’s real agenda', min: '17 min', track: 'Influence' },
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
    tag: 'C-SUITE · PRIYANKA SUNDER',
    title: 'Cybersecurity as a board function',
    left: '',
    pct: 0,
    cta: 'Unlocks upon enrollment',
    open: false,
    img: COVER.priyanka,
  },
];

export const LEARN_FRESH = [
  { title: 'Architecting Sovereign Authority', meta: 'IL Guide · 16 mins · Open principle', open: true },
  {
    title: 'From Factory Floors to the Boardroom',
    meta: 'Priyanka Singla · 21 mins · Enrolled only',
    open: false,
    img: COVER.speaks05,
  },
  {
    title: 'From Invisible to Unstoppable',
    meta: 'Charu Sharma · 12 mins · Enrolled only',
    open: false,
    img: COVER.speaks04c,
  },
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
    tag: 'C-SUITE · TECHNOLOGY',
    title: 'From chaos to cyber resilience',
    who: 'Priyanka Sunder',
    left: '8m left',
    pct: 65,
    cta: 'Resume',
    img: COVER.priyanka,
  },
  {
    tag: 'C-SUITE · LEADERSHIP',
    title: 'Pygmalion Effect in Management',
    who: 'Kamini Chawla',
    left: '',
    pct: 35,
    cta: 'Resume',
    img: COVER.kamini,
  },
];

export const LEARN_FRESH_ENR = [
  { title: 'What is your 20-mile march?', meta: 'Suma Bhat · Product leader', time: '16 mins', neu: true, img: COVER.suma },
  { title: 'Clarity is a business strategy', meta: 'Varsha Fulzele · Delivery lead', time: '21 mins', neu: true, img: COVER.varsha },
  { title: 'Turn people insight into impact', meta: 'Meghna Makkar · HR & analytics', time: '12 mins', neu: false, img: COVER.meghna },
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
  { n: '01', title: 'Ask for what you want', min: '12 min', state: 'DONE' },
  { n: '02', title: 'Own the room before you speak', min: '14 min', state: 'DONE' },
  { n: '03', title: 'The shameless speech', min: '22 min', state: 'DONE' },
  { n: '04', title: 'Build your board of advocates', min: '16 min', state: 'DONE' },
];

export const PRINCIPLES_INFLUENCE_ENR = [
  { n: '10', title: 'Negotiate from the seat you want', min: '18 min · in progress', state: 'Resume', hot: true },
  { n: '11', title: 'Turn visibility into sponsorship', min: '20 min', state: 'Start' },
  { n: '12', title: 'The unflinching no', min: '15 min', state: 'Start' },
  { n: '13', title: 'Read the room’s real agenda', min: '17 min', state: 'Start' },
];

export const PRINCIPLES_COMMAND_ENR = [
  { n: '19', title: 'Speak to a board, not a boss', min: '21 min', state: 'Opens Day 2' },
  { n: '20', title: 'Carry a P&L like a mandate', min: '19 min', state: 'Opens Day 2' },
  { n: '21', title: 'Choose the fight worth having', min: '16 min', state: 'Opens Day 2' },
];

export const CASES_ENR = [
  {
    fn: 'Technology',
    tag: 'CYBER',
    title: 'From chaos to cyber resilience',
    who: 'Priyanka Sunder',
    time: '31 mins',
    img: COVER.priyanka,
    featured: true,
  },
  {
    fn: 'Technology',
    tag: 'TECH',
    title: "Technology isn’t a cost. It’s a growth multiplier.",
    who: 'Radhika Sharma',
    time: '24 mins',
    img: COVER.radhika,
  },
  {
    fn: 'Technology',
    tag: 'AI',
    title: 'AI accelerates innovation. Governance protects everything.',
    who: 'Poornima George',
    time: '22 mins',
    img: COVER.poornima,
  },
  {
    fn: 'Technology',
    tag: 'PRODUCT',
    title: 'What is your 20-mile march?',
    who: 'Suma Bhat',
    time: '18 mins',
    img: COVER.suma,
  },
  {
    fn: 'Finance',
    tag: 'DELIVERY',
    title: 'Clarity is not only a soft skill, it’s a business strategy',
    who: 'Varsha Fulzele',
    time: '20 mins',
    img: COVER.varsha,
    featured: true,
  },
  {
    fn: 'Finance',
    tag: 'PRODUCT',
    title: 'Stop jumping to solutions',
    who: 'Smriti Mishra',
    time: '19 mins',
    img: COVER.smriti,
  },
  {
    fn: 'Marketing',
    tag: 'MEDIA',
    title: "Print isn’t dying. It’s evolving from volume to value.",
    who: 'Rekha Sharma',
    time: '26 mins',
    img: COVER.rekha,
    featured: true,
  },
  {
    fn: 'Marketing',
    tag: 'LEADERSHIP',
    title: 'Pygmalion Effect in Management',
    who: 'Kamini Chawla',
    time: '18 mins',
    img: COVER.kamini,
  },
  {
    fn: 'Founder',
    tag: 'PEOPLE',
    title: 'Turn people insight into business impact',
    who: 'Meghna Makkar',
    time: '21 mins',
    img: COVER.meghna,
    featured: true,
  },
  {
    fn: 'Founder',
    tag: 'PROGRAMS',
    title: 'Human API & program management',
    who: 'Divya Mona',
    time: '17 mins',
    img: COVER.divya,
  },
];

export const CASES_MORE_ENR = CASES_ENR.filter((c) => !c.featured);

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
  {
    title: 'From Factory Floors to the Boardroom',
    who: 'Priyanka Singla · Manufacturing',
    time: '4:15',
    img: COVER.speaks05,
  },
  {
    title: 'The 11×11 Mission',
    who: 'Pushpalatha M.S · Healthcare',
    time: '3:20',
    img: COVER.speaks01,
  },
];

export const STORY_FEATURED_ENR = {
  title: 'From Invisible to Unstoppable',
  who: 'Charu Sharma · Global technology leader',
  time: '3:40',
  img: COVER.speaks04c,
};

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
  { mon: 'APR', day: '19', title: 'Walk to the Board', meta: '7 cities · 6:30 PM · In person' },
  { mon: 'SEP', day: '27', title: 'Bengaluru Chapter meetup', meta: 'Sat 27 Sep · 6 PM · Indiranagar' },
  { mon: 'OCT', day: '04', title: 'Iron Lady Speaks · live recording', meta: 'Sat 4 Oct · 11 AM · Zoom' },
];

export const LEARN_EVENTS_LOCKED = [
  { icon: 'groups', title: 'Thursday Community Circle', meta: 'Weekly · 8–9 PM · Closed-door triad' },
  { icon: 'event', title: 'Day 1 & Day 2', meta: 'Sat 20 – Sun 21 Sep · 9 AM–7 PM IST' },
  { icon: 'forum', title: 'Private batch group', meta: 'Your 48 batchmates' },
];

export const PODCASTS = [
  {
    title: 'The One Notch Up',
    who: 'Simon Newman',
    meta: 'Ep 6 · 31 min',
    img: COVER.speaks06,
    featured: true,
  },
  {
    title: 'From Factory Floors to the Boardroom',
    who: 'Priyanka Singla',
    meta: 'Ep 5 · 28 min',
    img: COVER.speaks05,
  },
  {
    title: 'From Invisible to Unstoppable',
    who: 'Charu Sharma',
    meta: 'Ep 4 · 22 min',
    img: COVER.speaks04c,
  },
  {
    title: 'The Strategic Side of Quality',
    who: 'Mohini Hanwate',
    meta: 'Ep 4 · 36 min',
    img: COVER.speaks04m,
  },
  {
    title: 'Two Caps, One Woman',
    who: 'Lakshmi S Nayak',
    meta: 'Ep 2 · 22 min',
    img: COVER.speaks02,
  },
  {
    title: 'The 11×11 Mission',
    who: 'Pushpalatha M.S',
    meta: 'Ep 1 · 31 min',
    img: COVER.speaks01,
  },
];

export const ENGAGE_EVENTS_REG = [
  { mon: 'APR', day: '26', title: 'Winning Ways for Women', meta: 'Live webinar · April 26' },
  { mon: 'SEP', day: '27', title: 'Bengaluru Chapter meetup', meta: 'Sat 27 September · 6 PM' },
];

export const ARMY_STORIES = [
  {
    title: 'From Factory Floors to the Boardroom',
    meta: 'Priyanka Singla · Manufacturing',
    time: '4:15',
    img: COVER.speaks05,
  },
  {
    title: 'From Invisible to Unstoppable',
    meta: 'Charu Sharma · Technology',
    time: '3:40',
    img: COVER.speaks04c,
  },
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

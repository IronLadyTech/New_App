/**
 * Demo notifications per audience. `go` says where a tap leads:
 * task (course task), payment, schedule, guide, ticket, today, learn, engage, myProgram,
 * and for guests: challenge, programs, signin.
 */
const LEP_REGISTERED = [
  {
    id: 'lep-r-codesef',
    kind: 'attention',
    icon: 'assignment-late',
    title: 'Fill the CoDeSeF Sheet before Thursday',
    meta: 'LEP · pre-program · 10 min',
    action: 'Open task',
    ago: '1h',
    go: { to: 'task', programId: 'lep', taskId: 'lep-prep-codesef-sheet' },
  },
  {
    id: 'lep-r-pay',
    kind: 'attention',
    icon: 'payments',
    title: 'Complete enrollment to unlock Day 1',
    meta: 'Your seat is held for the 20 Sep batch',
    action: 'Complete enrollment',
    ago: '3h',
    go: { to: 'payment' },
  },
  {
    id: 'lep-r-guide',
    kind: 'guide',
    icon: 'play-circle-outline',
    title: 'Today’s 3-minute message is ready',
    meta: 'IL Guide · before your first session',
    ago: '8:00 AM',
    go: { to: 'guide' },
  },
  {
    id: 'lep-r-event',
    kind: 'guide',
    icon: 'event',
    title: 'Iron Lady Speaks · live recording Sat',
    meta: 'Sat 4 Oct · 11 AM · Zoom',
    ago: 'Yesterday',
    go: { to: 'ticket' },
  },
];

const LEP_ENROLLED = [
  {
    id: 'lep-e-assign',
    kind: 'attention',
    icon: 'assignment-late',
    title: 'Day 1 Assignment is due tomorrow',
    meta: 'LEP · submit before 11:59 AM Thu',
    action: 'Open assignment',
    ago: '2h',
    go: { to: 'task', programId: 'lep', taskId: 'lep-day1-assignment' },
  },
  {
    id: 'lep-e-day2',
    kind: 'attention',
    icon: 'videocam',
    title: 'Day 2 starts in 2 hours',
    meta: 'Join link is live at 6:20 PM',
    action: 'See schedule',
    ago: '2h',
    go: { to: 'schedule' },
  },
  {
    id: 'lep-e-streak',
    kind: 'guide',
    icon: 'local-fire-department',
    title: 'Four active days this week',
    meta: 'One more and you close the week strong',
    ago: '8:00 AM',
    go: { to: 'today' },
  },
  {
    id: 'lep-e-feedback',
    kind: 'guide',
    icon: 'chat-bubble-outline',
    title: 'Your facilitator left feedback',
    meta: 'On your Day 1 Assignment',
    ago: 'Yesterday',
    go: { to: 'task', programId: 'lep', taskId: 'lep-day1-assignment' },
  },
];

const BM_REGISTERED = [
  {
    id: 'bm-r-balance',
    kind: 'attention',
    icon: 'payments',
    title: 'Pay the balance to unlock Phases 1–4',
    meta: '100BM · your seat is held',
    action: 'Pay balance',
    ago: '1h',
    go: { to: 'payment' },
  },
  {
    id: 'bm-r-story',
    kind: 'attention',
    icon: 'record-voice-over',
    title: 'Core Story Practice Session this week',
    meta: '100BM · Onboarding',
    action: 'Open task',
    ago: '4h',
    go: { to: 'task', programId: '100bm', taskId: 'bm100-wk1-4' },
  },
  {
    id: 'bm-r-milestones',
    kind: 'guide',
    icon: 'show-chart',
    title: 'Draft two milestones before Onboarding',
    meta: 'IL Guide · Milestone Table · 10 min',
    ago: '8:00 AM',
    go: { to: 'task', programId: '100bm', taskId: 'bm100-wk1-1' },
  },
  {
    id: 'bm-r-event',
    kind: 'guide',
    icon: 'event',
    title: 'Winning Ways for Women · live webinar',
    meta: 'Open to every member · RSVP',
    ago: 'Yesterday',
    go: { to: 'ticket' },
  },
];

const BM_ENROLLED = [
  {
    id: 'bm-e-pitch',
    kind: 'attention',
    icon: 'assignment-late',
    title: 'Post-Session on Pitch is due Thursday',
    meta: '100BM · Phase 2 · Pitch & Strategy',
    action: 'Open task',
    ago: '2h',
    go: { to: 'task', programId: '100bm', taskId: 'bm100-wk11' },
  },
  {
    id: 'bm-e-qa',
    kind: 'attention',
    icon: 'videocam',
    title: 'Weekly Q&A tonight · 7:00 PM IST',
    meta: 'Add a question before you join',
    action: 'See schedule',
    ago: '3h',
    go: { to: 'schedule' },
  },
  {
    id: 'bm-e-streak',
    kind: 'guide',
    icon: 'local-fire-department',
    title: 'Five-day streak on your SuperPower Statement',
    meta: 'IL Guide · say it once more today',
    ago: '8:00 AM',
    go: { to: 'myProgram' },
  },
  {
    id: 'bm-e-brand',
    kind: 'guide',
    icon: 'videocam',
    title: 'Your Imperfect Brand Video is next',
    meta: '100BM · practice drill · 15 min',
    ago: 'Yesterday',
    go: { to: 'task', programId: '100bm', taskId: 'bm100-wk2' },
  },
];

const MBW_REGISTERED = [
  {
    id: 'mbw-r-pay',
    kind: 'attention',
    icon: 'payments',
    title: 'Complete enrollment to unlock Quarters 1–4',
    meta: 'MBW · Preparation week 5 of 12',
    action: 'Complete enrollment',
    ago: '1h',
    go: { to: 'payment' },
  },
  {
    id: 'mbw-r-connects',
    kind: 'attention',
    icon: 'group-add',
    title: 'Send 5 connection requests this week',
    meta: 'MBW · LinkedIn % Connects',
    action: 'Open task',
    ago: '5h',
    go: { to: 'task', programId: 'mbw', taskId: 'mbw-linkedin-connects' },
  },
  {
    id: 'mbw-r-mirror',
    kind: 'guide',
    icon: 'self-improvement',
    title: 'Mirror Practice · five minutes today',
    meta: 'IL Guide · Preparation',
    ago: '8:00 AM',
    go: { to: 'task', programId: 'mbw', taskId: 'mbw-mirror' },
  },
  {
    id: 'mbw-r-event',
    kind: 'guide',
    icon: 'event',
    title: 'Bengaluru Chapter meetup · Sat 27 Sep',
    meta: 'Open to every member · RSVP',
    ago: 'Yesterday',
    go: { to: 'ticket' },
  },
];

const MBW_ENROLLED = [
  {
    id: 'mbw-e-story',
    kind: 'attention',
    icon: 'assignment-late',
    title: 'C-Suite Story is due Thursday',
    meta: 'MBW · Quarter 1',
    action: 'Open task',
    ago: '2h',
    go: { to: 'task', programId: 'mbw', taskId: 'q1-csuite-story' },
  },
  {
    id: 'mbw-e-posts',
    kind: 'attention',
    icon: 'edit-note',
    title: 'Two LinkedIn posts due Friday',
    meta: 'MBW · Quarter 1 · visibility',
    action: 'Open task',
    ago: '4h',
    go: { to: 'task', programId: 'mbw', taskId: 'q1-linkedin-posts' },
  },
  {
    id: 'mbw-e-streak',
    kind: 'guide',
    icon: 'local-fire-department',
    title: 'Six-day streak on Mirror Work',
    meta: 'IL Guide · keep it going tomorrow',
    ago: '8:00 AM',
    go: { to: 'myProgram' },
  },
  {
    id: 'mbw-e-circle',
    kind: 'guide',
    icon: 'groups',
    title: 'Community Circle · Thu 8–9 PM',
    meta: 'Closed-door triads with your Army',
    ago: 'Yesterday',
    go: { to: 'engage' },
  },
];

const GUEST = [
  {
    id: 'g-challenge',
    kind: 'attention',
    icon: 'local-fire-department',
    title: 'Today’s challenge is waiting',
    meta: 'Free 5-day challenge · 10 min',
    action: 'Open challenge',
    ago: '1h',
    go: { to: 'challenge' },
  },
  {
    id: 'g-programs',
    kind: 'guide',
    icon: 'school',
    title: 'October batches are filling up',
    meta: 'LEP · 100 Board Members · MBW',
    action: 'See programs',
    ago: '8:00 AM',
    go: { to: 'programs' },
  },
  {
    id: 'g-speaks',
    kind: 'guide',
    icon: 'podcasts',
    title: 'New Iron Lady Speaks episode',
    meta: 'Simon Newman · The One Notch Up',
    ago: 'Yesterday',
    go: { to: 'engage' },
  },
];

const SIGNUP = [
  {
    id: 's-finish',
    kind: 'attention',
    icon: 'how-to-reg',
    title: 'Finish setting up your account',
    meta: 'Pick your batch to hold your seat',
    action: 'Continue',
    ago: 'Now',
    go: { to: 'back' },
  },
  {
    id: 's-batch',
    kind: 'guide',
    icon: 'event-available',
    title: 'Seats are held for 48 hours',
    meta: 'Once you pick a date, the seat is yours',
    ago: 'Today',
    go: { to: 'back' },
  },
];

export function noticesFor({ audience, program, stage, lepEnrolled }) {
  if (audience === 'guest') return GUEST;
  if (audience === 'signup') return SIGNUP;
  const lep = lepEnrolled ? LEP_ENROLLED : LEP_REGISTERED;
  const bm = stage === 'registered' ? BM_REGISTERED : BM_ENROLLED;
  const mbw = stage === 'registered' ? MBW_REGISTERED : MBW_ENROLLED;
  if (program === '100bm') return bm;
  if (program === 'mbw') return mbw;
  if (program === 'all') {
    return [
      ...LEP_ENROLLED.filter((n) => n.kind === 'attention'),
      ...BM_REGISTERED.filter((n) => n.kind === 'attention'),
      ...LEP_ENROLLED.filter((n) => n.kind === 'guide').slice(0, 1),
      ...BM_REGISTERED.filter((n) => n.kind === 'guide').slice(0, 1),
    ];
  }
  return lep;
}

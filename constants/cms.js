/**
 * Admin CMS (web, /admin) — Firestore collections, field options and LEP defaults.
 * Notification events are rules relative to an anchor, never fixed clock times,
 * so a rescheduled session moves its reminders automatically.
 */

export const CMS = {
  EVENTS: 'cms_notificationEvents',
  CONTENT: 'cms_content',
  CONFIG: 'cms_config',
};

export const CMS_CONFIG_DOCS = {
  IL_GUIDE: 'ilGuide',
  NOTIFICATION_POLICY: 'notificationPolicy',
};

/** Roles that can open /admin. Only CMS_EDIT_ROLES can change anything. */
export const CMS_VIEW_ROLES = ['admin', 'superadmin', 'pl', 'cem'];
export const CMS_EDIT_ROLES = ['admin', 'superadmin', 'pl'];

export const ANCHORS = [
  { value: 'sessionStart', label: 'Session start', needsRef: 'session', usesOffset: true },
  { value: 'sessionEnd', label: 'Session end', needsRef: 'session', usesOffset: true },
  { value: 'taskOpen', label: 'Task opens', needsRef: 'task', usesTime: true, usesDayOffset: true },
  { value: 'taskDue', label: 'Task due', needsRef: 'task', usesTime: true, usesDayOffset: true },
  { value: 'day1', label: 'Program day (from Day 1)', usesTime: true, usesDayOffset: true },
  { value: 'daily', label: 'Every day in a range', usesTime: true },
  { value: 'weekly', label: 'Every week', usesTime: true, usesWeekday: true },
  { value: 'event', label: 'When something happens', usesTrigger: true },
];

export const TRIGGERS = [
  { value: 'enrolled', label: 'Participant enrolled' },
  { value: 'sessionAbsent', label: 'Absent from a session' },
  { value: 'mandatoryOverdue2d', label: 'Mandatory item overdue 2 days' },
  { value: 'ritualsInactive3d', label: 'Rituals not updated 3 days' },
  { value: 'taskSubmitted', label: 'Task submitted' },
  { value: 'sessionRescheduled', label: 'Session time changed' },
];

export const CONDITIONS = [
  { value: 'all', label: 'Everyone' },
  { value: 'attended', label: 'Only if attended' },
  { value: 'absent', label: 'Only if absent' },
  { value: 'incomplete', label: 'Only if task not done' },
  { value: 'prework', label: 'Only if pre-work incomplete' },
  { value: 'ritualsNotToday', label: 'Only if rituals not updated today' },
  { value: 'paymentPending', label: 'Only if payment pending' },
  { value: 'certified', label: 'Only if certified' },
];

export const RECIPIENTS = [
  { value: 'participant', label: 'Participant' },
  { value: 'cem', label: 'CEM' },
  { value: 'pl', label: 'PL' },
  { value: 'admin', label: 'Admin' },
  { value: 'sales', label: 'Sales' },
];

/** Higher priority wins when the daily cap is hit. */
export const PRIORITIES = [
  { value: 'session', label: 'Session (highest)' },
  { value: 'mandatory', label: 'Mandatory item' },
  { value: 'optional', label: 'Optional (lowest)' },
];

export const CHANNELS = [
  { value: 'push', label: 'App push' },
  { value: 'whatsapp', label: 'WhatsApp' },
  { value: 'email', label: 'Email' },
];

export const WEEKDAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

export const SESSIONS = [
  { value: '*', label: 'Every session' },
  { value: 'S0', label: 'S0 Orientation' },
  { value: 'S1', label: 'S1 Full Day — Day 1' },
  { value: 'S2', label: 'S2 Full Day — Day 2' },
  { value: 'S3', label: 'S3 Completion & Review' },
  { value: 'S4', label: 'S4 Differentiated Brand' },
  { value: 'S5', label: 'S5 Shameless Pitch' },
  { value: 'S6', label: 'S6 Progress Update Q/A' },
  { value: 'S7', label: 'S7 Leadership & Habits' },
  { value: 'S8', label: 'S8 Certification' },
  { value: 'FT', label: 'Fast Track (optional)' },
  { value: 'PTW', label: 'Prepare to Win (optional)' },
];

/** Placeholders the sender fills in. Shown as chips in the editor. */
export const TEMPLATE_VARS = [
  'name',
  'session',
  'time',
  'date',
  'joinLink',
  'task',
  'dueTime',
  'pendingTasks',
  'score',
  'batch',
];

export const CONTENT_TYPES = [
  { value: 'video', label: 'Video' },
  { value: 'pdf', label: 'PDF' },
  { value: 'image', label: 'Image' },
  { value: 'audio', label: 'Audio' },
  { value: 'link', label: 'Link' },
  { value: 'text', label: 'Text' },
];

export const PROGRAMS = ['LEP', '100BM', 'MBW', 'MC'];

export const DEFAULT_NOTIFICATION_POLICY = {
  timezone: 'Asia/Kolkata',
  quietStart: '21:30',
  quietEnd: '07:00',
  dailyCap: 3,
  capExempt: ['R-10m'],
};

function rule(code, name, fields) {
  return {
    code,
    name,
    program: 'LEP',
    recipients: ['participant'],
    condition: 'all',
    priority: 'optional',
    channels: { push: true, whatsapp: false, email: false },
    countsTowardCap: true,
    active: true,
    title: name,
    body: '',
    whatsappTemplate: '',
    contentIds: [],
    ...fields,
    anchor: { ref: '', offsetMinutes: 0, dayOffset: 0, time: '', weekday: 'Sat', trigger: '', ...fields.anchor },
  };
}

/** From LEP Program Journey v1.2 (sections 6, 7, 8, 10). "Load LEP defaults" writes these. */
export const LEP_DEFAULT_EVENTS = [
  // Session reminders (section 6)
  rule('R-24h', 'Session tomorrow', {
    anchor: { type: 'sessionStart', ref: '*', offsetMinutes: -1440 },
    priority: 'session',
    channels: { push: true, whatsapp: true, email: false },
    body: 'Tomorrow: {{session}} at {{time}} IST. {{task}}',
    notes:
      'Core sessions only (S0–S8). Optional FT/PTW use OPT-5PM / OPT-R-10m — no R-24h. Morning sessions (before 12 PM) send at 7:00 PM the evening before.',
  }),
  rule('R-1h', 'Session in 1 hour', {
    anchor: { type: 'sessionStart', ref: '*', offsetMinutes: -60 },
    priority: 'session',
    channels: { push: true, whatsapp: true, email: false },
    body: '{{session}} starts in 1 hour. Join: {{joinLink}}',
  }),
  rule('R-10m', 'Session in 10 minutes', {
    anchor: { type: 'sessionStart', ref: '*', offsetMinutes: -10 },
    priority: 'session',
    countsTowardCap: false,
    body: 'Starting in 10 minutes. Join: {{joinLink}}',
  }),
  rule('POST', 'Congratulations after session', {
    anchor: { type: 'sessionEnd', ref: '*', offsetMinutes: 30 },
    condition: 'attended',
    priority: 'session',
    body: 'Well done on {{session}}, {{name}}. Next: {{task}}',
  }),
  rule('CATCHUP', 'Missed session — catch up', {
    anchor: { type: 'sessionEnd', ref: '*', offsetMinutes: 30 },
    condition: 'absent',
    priority: 'session',
    body: 'We missed you at {{session}}. Watch the recording and catch up: {{task}}',
  }),
  rule('RESCHED', 'Session time changed', {
    anchor: { type: 'event', trigger: 'sessionRescheduled' },
    priority: 'session',
    countsTowardCap: false,
    channels: { push: true, whatsapp: true, email: false },
    body: '{{session}} has moved to {{date}}, {{time}} IST.',
  }),
  // Tasks (section 5)
  rule('TASK-OPEN', "Today's task", {
    anchor: { type: 'taskOpen', ref: '*', time: '10:00' },
    body: "Today's task: {{task}}",
  }),
  rule('TASK-DUE', 'Task due today', {
    anchor: { type: 'taskDue', ref: '*', time: '10:00' },
    condition: 'incomplete',
    body: '{{task}} is due today by {{dueTime}}.',
  }),
  rule('TASK-OVERDUE', 'Task overdue', {
    anchor: { type: 'taskDue', ref: '*', dayOffset: 1, time: '10:00' },
    condition: 'incomplete',
    body: 'Still pending: {{pendingTasks}} (was due {{dueTime}}).',
  }),
  rule('MAND-OVERDUE', 'Mandatory item overdue', {
    anchor: { type: 'taskDue', ref: '*', dayOffset: 1, time: '10:00' },
    condition: 'incomplete',
    priority: 'mandatory',
    channels: { push: true, whatsapp: true, email: false },
    body: '{{task}} is needed for your certificate. It was due {{dueTime}}.',
    notes: 'Applies to mandatory tasks only (T02, T03, T12, T20).',
  }),
  // Rituals and score (section 10)
  rule('RITUALS-AM', '5 Rituals daily nudge', {
    anchor: { type: 'daily', time: '07:00' },
    body: 'Good morning {{name}}. Tick today’s 5 Rituals.',
    notes: 'Week 1 Monday to Week 4 Saturday.',
  }),
  rule('RITUALS-PM', '5 Rituals evening nudge', {
    anchor: { type: 'daily', time: '20:30' },
    condition: 'ritualsNotToday',
    body: 'You haven’t ticked today’s rituals yet.',
  }),
  rule('SCORE', 'Weekly score', {
    anchor: { type: 'weekly', weekday: 'Sat', time: '12:00' },
    channels: { push: true, whatsapp: true, email: false },
    body: 'Your 5 Rituals score this week: {{score}}.',
  }),
  rule('WELCOME', 'Welcome on enrollment', {
    anchor: { type: 'event', trigger: 'enrolled' },
    priority: 'mandatory',
    channels: { push: true, whatsapp: true, email: true },
    body: 'Welcome to LEP, {{name}}. Start with your VIA Survey and B-HAG.',
  }),
  rule('PAY', 'Payment reminder', {
    anchor: { type: 'event', trigger: 'enrolled' },
    condition: 'paymentPending',
    priority: 'mandatory',
    body: 'Your balance payment is pending. Pay before {{dueTime}}.',
  }),
  // Optional Fast Track / Prepare to Win (LEP_FLOW v1.5) — no R-24h, no absentee chase
  rule('OPT-5PM', 'Optional session tonight (FT)', {
    anchor: { type: 'sessionStart', ref: 'FT', offsetMinutes: -120 },
    priority: 'optional',
    channels: { push: true, whatsapp: true, email: false },
    body: 'Tonight (optional): {{session}} at {{time}} IST. Join if you can: {{joinLink}}',
    notes:
      'Same-day heads-up for Fast Track. Duplicate in admin for PTW (ref PTW). No R-24h on optional sessions.',
  }),
  rule('OPT-5PM-PTW', 'Optional session tonight (PTW)', {
    anchor: { type: 'sessionStart', ref: 'PTW', offsetMinutes: -120 },
    priority: 'optional',
    channels: { push: true, whatsapp: true, email: false },
    body: 'Tonight (optional): {{session}} at {{time}} IST. Join if you can: {{joinLink}}',
    notes: 'Prepare to Win Fridays. Same-day only — no chase if they skip.',
  }),
  rule('OPT-R-10m', 'Optional session in 10 minutes (FT)', {
    anchor: { type: 'sessionStart', ref: 'FT', offsetMinutes: -10 },
    priority: 'optional',
    countsTowardCap: false,
    channels: { push: true, whatsapp: true, email: false },
    body: '{{session}} starts in 10 minutes (optional). Join: {{joinLink}}',
  }),
  rule('OPT-R-10m-PTW', 'Optional session in 10 minutes (PTW)', {
    anchor: { type: 'sessionStart', ref: 'PTW', offsetMinutes: -10 },
    priority: 'optional',
    countsTowardCap: false,
    channels: { push: true, whatsapp: true, email: false },
    body: '{{session}} starts in 10 minutes (optional). Join: {{joinLink}}',
  }),
  // Staff notifications (section 8)
  ...[
    ['C01', 'New participant added', { type: 'event', trigger: 'enrolled' }, ['cem']],
    ['C02', 'Pre-work status', { type: 'sessionStart', ref: 'S0', offsetMinutes: -1980 }, ['cem']],
    ['C03', 'Orientation attendance', { type: 'sessionEnd', ref: 'S0', offsetMinutes: 0 }, ['cem']],
    ['C04', 'Send poster template', { type: 'day1', dayOffset: -1, time: '10:00' }, ['cem']],
    ['C05', 'Payment pending list', { type: 'day1', dayOffset: -1, time: '10:00' }, ['cem', 'sales']],
    ['C06', 'B-HAG / VIA still missing', { type: 'day1', dayOffset: -1, time: '18:30' }, ['cem']],
    ['C07', 'Day 1 no-shows', { type: 'sessionStart', ref: 'S1', offsetMinutes: 30 }, ['cem']],
    ['C08', 'Day 2 no-shows', { type: 'sessionStart', ref: 'S2', offsetMinutes: 30 }, ['cem']],
    ['C09', 'CoDeSeF sheets generated', { type: 'day1', dayOffset: 1, time: '18:00' }, ['cem', 'pl']],
    ['C10', 'Week 0 attendance summary', { type: 'day1', dayOffset: 2, time: '09:00' }, ['cem']],
    ['C11', 'Daily batch digest', { type: 'daily', time: '09:00' }, ['cem']],
    ['C12', 'Day 1 tasks before Review', { type: 'sessionStart', ref: 'S3', offsetMinutes: -30 }, ['cem']],
    ['C13', 'Overdue escalation', { type: 'event', trigger: 'mandatoryOverdue2d' }, ['cem']],
    ['C14', 'Ritual inactivity', { type: 'event', trigger: 'ritualsInactive3d' }, ['cem']],
    [
      'C15',
      'Session absentee (core)',
      { type: 'sessionEnd', ref: '*', offsetMinutes: 30 },
      ['cem'],
      'Core sessions only. Optional FT/PTW use C24 — info only, no call.',
    ],
    ['C16', 'Weekly scoreboard summary', { type: 'weekly', weekday: 'Sat', time: '12:30' }, ['cem', 'pl']],
    ['C17', 'Brand statement pending', { type: 'day1', dayOffset: 9, time: '10:00' }, ['cem']],
    ['C18', 'Pitch scripts pending', { type: 'taskDue', ref: 'T20', time: '17:00' }, ['cem']],
    ['C19', 'Progress update pending', { type: 'sessionStart', ref: 'S6', offsetMinutes: -600 }, ['cem']],
    ['C20', 'Certification eligibility (draft)', { type: 'day1', dayOffset: 26, time: '10:00' }, ['cem', 'pl']],
    ['C21', 'Final eligibility + certificates', { type: 'day1', dayOffset: 28, time: '10:00' }, ['cem', 'pl', 'admin']],
    ['C22', 'Not certified follow-up', { type: 'sessionEnd', ref: 'S8', offsetMinutes: 30 }, ['cem']],
    ['C23', 'Payment escalation', { type: 'day1', dayOffset: 1, time: '10:00' }, ['sales']],
    [
      'C24',
      'Optional FT attendance (info only)',
      { type: 'sessionEnd', ref: 'FT', offsetMinutes: 30 },
      ['cem'],
      'No call, no chase. Recording stays in LMS. PDF v1.5 C24.',
    ],
    [
      'C24-PTW',
      'Optional PTW attendance (info only)',
      { type: 'sessionEnd', ref: 'PTW', offsetMinutes: 30 },
      ['cem'],
      'No call, no chase. Recording stays in LMS.',
    ],
  ].map(([code, name, anchor, recipients, notes]) =>
    rule(code, name, {
      anchor,
      recipients,
      condition: 'all',
      priority: 'mandatory',
      countsTowardCap: false,
      channels: { push: true, whatsapp: false, email: true },
      ...(notes ? { notes } : {}),
    })
  ),
];

export const DEFAULT_IL_GUIDE_CONFIG = {
  enabled: true,
  model: 'gpt-4o-mini',
  temperature: 0.7,
  maxSentences: 3,
  jobs: { onboard: true, nudge: true, recommend: true, event: true },
  surfaces: { onboard: true, home: true, learn: true, community: true },
  extraInstructions: '',
  curatorNames: 'Rajesh',
  programNotes: { LEP: '', '100BM': '', MBW: '', MC: '' },
  quotations: [
    {
      id: 'q1',
      text: 'The task of the leader is to get their people from where they are to where they have not been.',
      author: 'Henry Kissinger',
      active: true,
    },
    {
      id: 'q2',
      text: 'Leadership is the capacity to translate vision into reality.',
      author: 'Warren Bennis',
      active: true,
    },
    {
      id: 'q3',
      text: 'The best way to predict the future is to create it.',
      author: 'Peter Drucker',
      active: true,
    },
  ],
};

function fmtOffset(min) {
  const abs = Math.abs(min);
  const unit =
    abs % 1440 === 0 && abs >= 1440
      ? `${abs / 1440} day${abs / 1440 > 1 ? 's' : ''}`
      : abs % 60 === 0 && abs >= 60
        ? `${abs / 60} hour${abs / 60 > 1 ? 's' : ''}`
        : `${abs} min`;
  return `${unit} ${min < 0 ? 'before' : 'after'}`;
}

/** Plain-English "when does this fire" line for the list and editor. */
export function describeAnchor(anchor = {}) {
  const ref = anchor.ref && anchor.ref !== '*' ? anchor.ref : null;
  const at = anchor.time ? ` at ${anchor.time}` : '';
  const day = anchor.dayOffset
    ? `${Math.abs(anchor.dayOffset)} day${Math.abs(anchor.dayOffset) > 1 ? 's' : ''} ${anchor.dayOffset < 0 ? 'before' : 'after'} `
    : '';
  switch (anchor.type) {
    case 'sessionStart':
    case 'sessionEnd': {
      const edge = anchor.type === 'sessionStart' ? 'starts' : 'ends';
      const who = ref ? ref : 'each session';
      if (!anchor.offsetMinutes) return `When ${who} ${edge}`;
      return `${fmtOffset(anchor.offsetMinutes)} ${who} ${edge}`;
    }
    case 'taskOpen':
      return `${day ? `${day}` : 'On the day '}${ref || 'each task'} opens${at}`;
    case 'taskDue':
      return `${day ? `${day}` : 'On the day '}${ref || 'each task'} is due${at}`;
    case 'day1':
      return anchor.dayOffset
        ? `${day}Day 1${at}`
        : `On Day 1${at}`;
    case 'daily':
      return `Every day${at}`;
    case 'weekly':
      return `Every ${anchor.weekday || 'Sat'}${at}`;
    case 'event': {
      const t = TRIGGERS.find((x) => x.value === anchor.trigger);
      return t ? `When: ${t.label.toLowerCase()}` : 'On event';
    }
    default:
      return '—';
  }
}

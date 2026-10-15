/**
 * LEP live session template — Iron Lady LEP Program Journey v1.5 (9 Oct 2026).
 * All offsets are relative to Day 1 (Week 0 Saturday, 9:00 AM–7:00 PM IST).
 * Orientation is always Thursday (dayOffset -2) before that Saturday.
 *
 * Notification rules in cms.js anchor to session `code` (S0, S1, …, FT, PTW).
 */

export const LEP_TIMEZONE = 'Asia/Kolkata';

/** @typedef {'core'|'optional'} SessionKind */

/**
 * @type {Array<{
 *   code: string;
 *   title: string;
 *   kind: SessionKind;
 *   dayOffset: number;
 *   startTime: string;
 *   endTime: string;
 *   weekLabel: string;
 * }>}
 */
export const LEP_SESSION_TEMPLATE = [
  {
    code: 'S0',
    title: 'Orientation (B/W)',
    kind: 'core',
    dayOffset: -2,
    startTime: '19:00',
    endTime: '20:00',
    weekLabel: 'Pre-program',
  },
  {
    code: 'S1',
    title: 'Full Day Session — Day 1',
    kind: 'core',
    dayOffset: 0,
    startTime: '09:00',
    endTime: '19:00',
    weekLabel: 'Week 0',
  },
  {
    code: 'S2',
    title: 'Full Day Session — Day 2',
    kind: 'core',
    dayOffset: 1,
    startTime: '09:00',
    endTime: '19:00',
    weekLabel: 'Week 0',
  },
  {
    code: 'S3',
    title: 'Closure Session (Completion & Review)',
    kind: 'core',
    dayOffset: 3,
    startTime: '19:00',
    endTime: '20:30',
    weekLabel: 'Week 1',
  },
  {
    code: 'FT',
    title: 'Fast Track Session',
    kind: 'optional',
    dayOffset: 5,
    startTime: '19:00',
    endTime: '20:00',
    weekLabel: 'Week 1',
  },
  {
    code: 'PTW',
    title: 'Prepare to Win — Week 1',
    kind: 'optional',
    dayOffset: 6,
    startTime: '20:00',
    endTime: '21:00',
    weekLabel: 'Week 1',
    ptwWeek: 1,
  },
  {
    code: 'S4',
    title: 'Differentiated Brand',
    kind: 'core',
    dayOffset: 7,
    startTime: '09:00',
    endTime: '11:00',
    weekLabel: 'Week 1',
  },
  {
    code: 'S6',
    title: 'Progress Check',
    kind: 'core',
    dayOffset: 11,
    startTime: '19:00',
    endTime: '20:30',
    weekLabel: 'Week 2',
  },
  {
    code: 'PTW2',
    title: 'Prepare to Win — Week 2',
    kind: 'optional',
    dayOffset: 13,
    startTime: '20:00',
    endTime: '21:00',
    weekLabel: 'Week 2',
    ptwWeek: 2,
    notifyRef: 'PTW',
  },
  {
    code: 'S5',
    title: 'Shameless Pitch',
    kind: 'core',
    dayOffset: 14,
    startTime: '18:30',
    endTime: '20:30',
    weekLabel: 'Week 2',
  },
  {
    code: 'PTW3',
    title: 'Prepare to Win — Week 3',
    kind: 'optional',
    dayOffset: 20,
    startTime: '20:00',
    endTime: '21:00',
    weekLabel: 'Week 3',
    ptwWeek: 3,
    notifyRef: 'PTW',
  },
  {
    code: 'S7',
    title: 'Leadership Habits',
    kind: 'core',
    dayOffset: 21,
    startTime: '09:00',
    endTime: '11:00',
    weekLabel: 'Week 3',
  },
  {
    code: 'PTW4',
    title: 'Prepare to Win — Week 4',
    kind: 'optional',
    dayOffset: 27,
    startTime: '20:00',
    endTime: '21:00',
    weekLabel: 'Week 4',
    ptwWeek: 4,
    notifyRef: 'PTW',
  },
  {
    code: 'S8',
    title: 'Graduation (Certification)',
    kind: 'core',
    dayOffset: 28,
    startTime: '19:30',
    endTime: '20:30',
    weekLabel: 'Week 4',
  },
];

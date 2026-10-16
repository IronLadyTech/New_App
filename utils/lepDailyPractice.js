import { formatDateIST, orientationFromDay1Saturday, parseISODate } from './lepBatchSchedule';
import { inferLepDay1FromZohoRaw } from './lepDeskBatchDate';
import {
  isLepRitualsUnlocked,
  LEP_RITUALS_PRACTICE_ID,
  resolveLepDay1Iso,
} from './lepRitualsUnlock';

export function todayIsoIST() {
  return formatDateIST(new Date());
}

function dayIndexFromAnchor(todayIso, anchorIso) {
  const t = parseISODate(todayIso);
  const a = anchorIso ? parseISODate(anchorIso) : t;
  return Math.max(0, Math.floor((t - a) / 86400000));
}

export function principleNumberForDay(todayIso, anchorIso) {
  return (dayIndexFromAnchor(todayIso, anchorIso) % 27) + 1;
}

export function orientationIsoFromGroup(group) {
  const day1 = inferLepDay1FromZohoRaw(group?.zohoRawBatch);
  return day1 ? orientationFromDay1Saturday(day1) : null;
}

const ENROLLED_ROTATE_POOL = [
  {
    practiceId: 'lep-shameless',
    title: 'Watch The Shameless Speech',
    meta: 'Pre-work · 22 min',
  },
  {
    practiceId: 'lep-get-ready',
    title: 'Tick one item on your Get ready checklist',
    meta: 'Checklist · 1 min',
  },
  {
    taskId: 'lep-day1-errc',
    title: 'Fill the ERRC Table',
    meta: 'Day 1 framework · 10 min',
  },
];

const REGISTERED_ROTATE_POOL = [
  {
    practiceId: 'lep-principles-video',
    title: 'Watch the 27 Principles video',
    meta: 'Pre-work · 14 min',
  },
  {
    practiceId: 'lep-power-pitch',
    title: 'Power Pitch — say who you are in 30 seconds',
    meta: 'Challenge · 15 min',
  },
  {
    taskId: 'lep-day1-beliefs',
    title: 'A-Game Self Awareness — Beliefs',
    meta: 'Pre-read · 5 min',
  },
];

function pickRotating(pool, todayIso, anchorIso, count) {
  const start = dayIndexFromAnchor(todayIso, anchorIso);
  const out = [];
  for (let i = 0; i < count; i += 1) {
    const row = pool[(start + i) % pool.length];
    out.push({
      ...row,
      id: `rot-${start}-${i}`,
      programId: 'lep',
    });
  }
  return out;
}

function ritualsPracticeRow() {
  return {
    id: 'daily-rituals',
    title: '5 Daily Rituals — morning check',
    meta: 'Ritual · 18 min',
    programId: 'lep',
    practiceId: LEP_RITUALS_PRACTICE_ID,
    dailyReset: true,
  };
}

/** Enrolled home — 5 Rituals after Week 0 Day 2; principle + 2 rotating slots (IST). */
export function buildEnrolledDailyPractice(todayIso, anchorIso, day1Iso) {
  const n = principleNumberForDay(todayIso, anchorIso);
  const ritualsUnlocked = isLepRitualsUnlocked(todayIso, day1Iso);
  return [
    ...(ritualsUnlocked ? [ritualsPracticeRow()] : []),
    {
      id: `daily-principle-${n}`,
      title: `Revise Principle ${n} from the 27 Principles`,
      meta: 'Daily revision · 2 min',
      programId: 'lep',
      practiceId: 'lep-principle',
      principleN: n,
      dailyReset: true,
    },
    ...pickRotating(ENROLLED_ROTATE_POOL, todayIso, anchorIso, 2),
  ];
}

/** Registered (part-paid) — 5 Rituals after Week 0 Day 2 + 3 rotating items (no principle row). */
export function buildRegisteredDailyPractice(todayIso, anchorIso, day1Iso) {
  const ritualsUnlocked = isLepRitualsUnlocked(todayIso, day1Iso);
  return [
    ...(ritualsUnlocked ? [ritualsPracticeRow()] : []),
    ...pickRotating(REGISTERED_ROTATE_POOL, todayIso, anchorIso, 3),
  ];
}

export { resolveLepDay1Iso };

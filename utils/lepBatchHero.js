import { getProgramEntry } from '../constants/programs';
import { learnerBatchId, normalizeProgramId } from './programAccess';

const WEEKDAYS = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
const WEEKDAYS_SHORT = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
const MONTH_INDEX = Object.fromEntries(MONTHS.map((name, i) => [name.toLowerCase(), i]));

function splitList(value) {
  return String(value || '')
    .split(',')
    .map((part) => part.trim())
    .filter(Boolean);
}

function validDate(year, month, day) {
  const date = new Date(year, month - 1, day);
  if (date.getFullYear() !== year || date.getMonth() !== month - 1 || date.getDate() !== day) {
    return null;
  }
  return { year, month, day };
}

function parseOneDate(raw) {
  const value = String(raw || '').trim();
  const dmy = /^(\d{1,2})\/(\d{1,2})\/(\d{4})$/.exec(value);
  if (dmy) return validDate(Number(dmy[3]), Number(dmy[2]), Number(dmy[1]));

  const iso = /^(\d{4})-(\d{2})-(\d{2})/.exec(value);
  if (iso) return validDate(Number(iso[1]), Number(iso[2]), Number(iso[3]));

  const named = /(\d{1,2})\s+(Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)[a-z]*\s+(\d{4})/i.exec(value);
  if (named) {
    return validDate(Number(named[3]), MONTH_INDEX[named[2].toLowerCase()] + 1, Number(named[1]));
  }
  return null;
}

/** First date in a Zoho batch string: "20/09/2026 - 21/09/2026" or "LEP · 20 Sep 2026". */
export function parseBatchStart(raw) {
  const value = String(raw || '').trim();
  if (!value || value === 'default' || value === '#batch') return null;
  const [start] = value.split(/\s+[–—-]\s+/);
  return parseOneDate(start) || parseOneDate(value);
}

function istToday(now) {
  const parts = new Intl.DateTimeFormat('en-US', {
    timeZone: 'Asia/Kolkata',
    year: 'numeric',
    month: 'numeric',
    day: 'numeric',
  }).formatToParts(now);
  const pick = (type) => Number(parts.find((part) => part.type === type)?.value);
  return { year: pick('year'), month: pick('month'), day: pick('day') };
}

function daysUntil(start, now) {
  const today = istToday(now);
  const from = Date.UTC(today.year, today.month - 1, today.day);
  const to = Date.UTC(start.year, start.month - 1, start.day);
  return Math.round((to - from) / 86400000);
}

function formatWhen(start) {
  const date = new Date(start.year, start.month - 1, start.day);
  return `${WEEKDAYS_SHORT[date.getDay()]} ${start.day} ${MONTHS[start.month - 1]}`;
}

function weekdayName(start) {
  const date = new Date(start.year, start.month - 1, start.day);
  return WEEKDAYS[date.getDay()];
}

function formatClock(raw) {
  const value = String(raw || '').trim();
  if (!value) return null;
  const clock = /^(\d{1,2}):(\d{2})(?::\d{2})?\s*(am|pm)?$/i.exec(value);
  if (!clock) {
    return /ist/i.test(value) ? value : `${value} IST`;
  }
  let hour = Number(clock[1]);
  const minute = clock[2];
  let suffix = clock[3] ? clock[3].toUpperCase() : null;
  if (!suffix) {
    suffix = hour >= 12 ? 'PM' : 'AM';
    hour = hour % 12 || 12;
  }
  return `${hour}:${minute} ${suffix} IST`;
}

function firstFilled(...values) {
  return values.find((value) => value != null && String(value).trim() !== '') ?? null;
}

function positiveCount(...values) {
  for (const value of values) {
    const count = Number(value);
    if (Number.isFinite(count) && count > 0) return Math.round(count);
  }
  return null;
}

function batchRawForProgram(profile, programId) {
  const access = profile?.programAccess?.[programId] || {};
  const direct = firstFilled(access.zohoRawBatch, access.batchName, access.batch);
  if (direct) return direct;

  const batches = splitList(profile?.batchName || profile?.batch);
  if (batches.length === 1) return batches[0];

  const programs = splitList(profile?.programs);
  if (batches.length > 1 && programs.length === batches.length) {
    const index = programs.findIndex((name) => normalizeProgramId(name) === programId);
    if (index >= 0) return batches[index];
  }
  return null;
}

function realBatchId(profile, programId) {
  const id = learnerBatchId(profile, programId);
  return id && id !== 'default' ? id : null;
}

/**
 * Enrolled LEP hero from the Zoho-synced profile and, when readable, the batch group.
 * Missing fields are left null so the screen can drop that line.
 */
export function buildLepEnrolledHero(profile, group, now = new Date()) {
  const programId = normalizeProgramId(group?.program) || 'lep';
  const entry = getProgramEntry(programId);
  const access = profile?.programAccess?.[programId] || profile?.programAccess?.lep || {};

  const batchRaw = batchRawForProgram(profile, programId);
  const start = [group?.zohoRawBatch, group?.rawBatch, group?.name, batchRaw]
    .map(parseBatchStart)
    .find(Boolean) || null;
  const days = start ? daysUntil(start, now) : null;
  const time = formatClock(
    firstFilled(
      access.startTime,
      access.batchStartTime,
      access.sessionTime,
      group?.startTime,
      group?.time,
      group?.sessionTime
    )
  );
  const women = positiveCount(
    access.womenCount,
    access.memberCount,
    access.batchSize,
    group?.memberIds?.length
  );

  let launchChip = null;
  if (days === 0) launchChip = 'Launches today';
  else if (days > 0) launchChip = `${days} ${days === 1 ? 'day' : 'days'} to launch`;

  let subline = null;
  if (women && days != null && days >= 0) {
    const noun = women === 1 ? 'woman starts' : 'women start';
    const when = days === 0 ? ' today' : days === 1 ? ' tomorrow' : ` this ${weekdayName(start)}`;
    subline = `You’re in this batch. ${women} ${noun} together${when}.`;
  } else if (women) {
    const noun = women === 1 ? 'woman is' : 'women are';
    subline = `You’re in this batch. ${women} ${noun} in it.`;
  } else if (start || realBatchId(profile, programId) || batchRaw) {
    subline = 'You’re in this batch.';
  }

  const whenLabel = start ? [formatWhen(start), time].filter(Boolean).join(' · ') : null;

  return {
    programChip: entry ? `Enrolled · ${entry.shortLabel}` : null,
    launchChip,
    subline,
    whenLabel,
    showConfirmed: Boolean(whenLabel),
  };
}

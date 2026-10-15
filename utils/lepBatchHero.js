import { getProgramEntry } from '../constants/programs';
import { learnerBatchLabel, learnerEnrollmentLabel, normalizeProgramId } from './programAccess';

const WEEKDAYS_SHORT = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
const MONTH_INDEX = Object.fromEntries(MONTHS.map((name, i) => [name.toLowerCase(), i]));

function validDate(year, month, day) {
  const date = new Date(year, month - 1, day);
  if (date.getFullYear() !== year || date.getMonth() !== month - 1 || date.getDate() !== day) {
    return null;
  }
  return { year, month, day };
}

function parseOneDate(raw) {
  const value = String(raw || '').trim();
  const dmy = /^(\d{1,2})\/(\d{1,2})\/(\d{2}|\d{4})$/.exec(value);
  if (dmy) {
    const year = dmy[3].length === 2 ? 2000 + Number(dmy[3]) : Number(dmy[3]);
    return validDate(year, Number(dmy[2]), Number(dmy[1]));
  }

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

function splitRange(raw) {
  const value = String(raw || '').trim();
  if (!value) return [null, null];
  const parts = value.split(/\s+[–—-]\s+/);
  if (parts.length >= 2) {
    return [parseOneDate(parts[0]) || parseOneDate(value), parseOneDate(parts[1])];
  }
  const one = parseOneDate(value);
  return one ? [one, null] : [null, null];
}

function formatRange(start, end) {
  if (!start) return null;
  const startDate = new Date(start.year, start.month - 1, start.day);
  const startWd = WEEKDAYS_SHORT[startDate.getDay()];
  if (!end) return `${startWd} ${start.day} ${MONTHS[start.month - 1]}, ${start.year}`;
  const endDate = new Date(end.year, end.month - 1, end.day);
  const endWd = WEEKDAYS_SHORT[endDate.getDay()];
  if (start.year === end.year && start.month === end.month) {
    return `${startWd} ${start.day} – ${endWd} ${end.day} ${MONTHS[start.month - 1]}, ${start.year}`;
  }
  if (start.year === end.year) {
    return `${startWd} ${start.day} ${MONTHS[start.month - 1]} – ${endWd} ${end.day} ${MONTHS[end.month - 1]}, ${start.year}`;
  }
  return `${startWd} ${start.day} ${MONTHS[start.month - 1]} ${start.year} – ${endWd} ${end.day} ${MONTHS[end.month - 1]} ${end.year}`;
}

function batchRawForProgram(profile, programId) {
  return learnerBatchLabel(profile, programId);
}

function dateStamp(date) {
  if (!date) return null;
  return new Date(date.year, date.month - 1, date.day).getTime();
}

/** current, upcoming, earlier, or unset — from that program's Batch field only. */
export function programBatchPhase(profile, programId, now = new Date()) {
  const [start, end] = splitRange(learnerBatchLabel(profile, programId));
  const startMs = dateStamp(start);
  if (startMs == null) return 'unset';
  const endMs = dateStamp(end) ?? startMs;
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
  if (today < startMs) return 'upcoming';
  if (today > endMs) return 'earlier';
  return 'current';
}

/**
 * The earliest enrolled batch stays on top until it ends.
 * The next enrolled program then moves up. Registered programs stay below.
 */
export function sortProgramsByCurrentBatch(profile, programs, now = new Date()) {
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
  const span = (program) => {
    const [start, end] = splitRange(learnerBatchLabel(profile, program.id));
    const startMs = dateStamp(start);
    const endMs = dateStamp(end) ?? startMs;
    return { program, startMs, endMs };
  };
  const enrolled = [];
  const rest = [];
  for (const program of programs) {
    if (learnerEnrollmentLabel(profile, program.id) === 'Enrolled') enrolled.push(span(program));
    else rest.push(span(program));
  }
  const byStart = (a, b) => (a.startMs ?? Number.MAX_SAFE_INTEGER) - (b.startMs ?? Number.MAX_SAFE_INTEGER);
  const stillOpen = (row) => row.startMs != null && today <= row.endMs;
  const place = (rows) => [
    ...rows.filter(stillOpen).sort(byStart),
    ...rows.filter((row) => row.startMs != null && !stillOpen(row)).sort(byStart),
    ...rows.filter((row) => row.startMs == null),
  ];
  return [...place(enrolled), ...place(rest)].map((row) => row.program);
}

/**
 * Enrolled LEP hero from the Zoho-synced profile and, when readable, the batch group.
 * Missing fields are left null so the screen can drop that line.
 */
const BATCH_EYEBROW = {
  lep: 'MY BATCH',
  '100bm': 'MY 100BM COHORT',
  mbw: 'MY MBW YEAR',
};

/**
 * Profile batch card for one program. Uses that program's Zoho batch only.
 * Missing dates and times stay null so the screen does not show another program's batch.
 */
export function buildProgramBatchCard(profile, programId, group) {
  const pid = normalizeProgramId(programId) || 'lep';
  const access = profile?.programAccess?.[pid] || {};
  const raw = batchRawForProgram(profile, pid);
  const label = raw ? String(raw).trim() : null;
  const named = label && !parseBatchStart(label) ? label : null;
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
  const endTime = formatClock(firstFilled(access.endTime, access.batchEndTime, group?.endTime));
  let body = null;
  if (time && endTime && endTime !== time) {
    body = `${time.replace(/ IST$/, '')} – ${endTime}`;
  } else if (time) {
    body = time;
  }

  return {
    eyebrow: named || BATCH_EYEBROW[pid] || 'MY BATCH',
    heading: label,
    body,
    confirmed: Boolean(label),
  };
}

export function buildLepEnrolledHero(profile, group, now = new Date()) {
  const programId = 'lep';
  const entry = getProgramEntry(programId);
  const access = profile?.programAccess?.lep || {};

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
  let launchChip = null;
  if (days === 0) launchChip = 'Launches today';
  else if (days > 0) launchChip = `${days} ${days === 1 ? 'day' : 'days'} to launch`;

  const subline = 'This is your turn to lead out loud.';

  const whenLabel = start ? [formatWhen(start), time].filter(Boolean).join(' · ') : null;

  return {
    programChip: entry ? `Enrolled · ${entry.shortLabel}` : null,
    launchChip,
    subline,
    whenLabel,
    showConfirmed: Boolean(whenLabel),
  };
}

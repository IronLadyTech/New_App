import {
  addCalendarDays,
  day1FromOrientationThursday,
  parseISODate,
} from './lepBatchSchedule';

const MONTHS = {
  jan: 1,
  january: 1,
  feb: 2,
  february: 2,
  mar: 3,
  march: 3,
  apr: 4,
  april: 4,
  may: 5,
  jun: 6,
  june: 6,
  jul: 7,
  july: 7,
  aug: 8,
  august: 8,
  sep: 9,
  sept: 9,
  september: 9,
  oct: 10,
  october: 10,
  nov: 11,
  november: 11,
  dec: 12,
  december: 12,
};

const DESK_NAME_RE = /(\d{1,2})(?:st|nd|rd|th)?\s+([A-Za-z]+)\s+batch/i;
const ZOHO_RANGE_START = /^(\d{1,2})\/(\d{1,2})\/(\d{4})\s*-/;

function pad2(n) {
  return String(n).padStart(2, '0');
}

function toIso(y, m, d) {
  return `${y}-${pad2(m)}-${pad2(d)}`;
}

function yearFromGroup(group) {
  const raw = group?.zohoSyncedAt || group?.createdAt || group?.updatedAt;
  if (raw?.toDate) return raw.toDate().getFullYear();
  if (raw instanceof Date) return raw.getFullYear();
  if (typeof raw === 'string' || typeof raw === 'number') {
    const y = new Date(raw).getFullYear();
    if (!Number.isNaN(y)) return y;
  }
  return new Date().getFullYear();
}

/** Saturday on or after a calendar date (YYYY-MM-DD). */
function saturdayOnOrAfter(iso) {
  const d = parseISODate(iso);
  const dow = d.getUTCDay();
  const add = dow === 6 ? 0 : (6 - dow + 7) % 7;
  return add ? addCalendarDays(iso, add) : iso;
}

function day1FromZohoRaw(raw) {
  const m = ZOHO_RANGE_START.exec(String(raw || '').trim());
  if (!m) return null;
  const iso = toIso(Number(m[3]), Number(m[2]), Number(m[1]));
  const d = parseISODate(iso);
  const dow = d.getUTCDay();
  if (dow === 4) return day1FromOrientationThursday(iso);
  if (dow === 6) return iso;
  return saturdayOnOrAfter(iso);
}

function day1FromDeskName(name, year) {
  const m = DESK_NAME_RE.exec(String(name || ''));
  if (!m) return null;
  const day = Number(m[1]);
  const mon = MONTHS[String(m[2]).toLowerCase()];
  if (!mon || !day) return null;
  let iso = toIso(year, mon, day);
  const dow = parseISODate(iso).getUTCDay();
  if (dow !== 6) iso = saturdayOnOrAfter(iso);
  return iso;
}

/** Day 1 Saturday from Zoho `LEP_Batch` range string. */
export function inferLepDay1FromZohoRaw(raw) {
  return day1FromZohoRaw(raw);
}

/** Best-effort Day 1 Saturday for a web LMS `groups` row. */
export function inferLepDay1FromGroup(group) {
  const fromZoho = day1FromZohoRaw(group?.zohoRawBatch);
  if (fromZoho) return fromZoho;
  const label = String(group?.name || '').replace(/^LEP\s*·\s*/i, '').trim();
  const y = yearFromGroup(group);
  return day1FromDeskName(label, y) || day1FromDeskName(label, y - 1) || day1FromDeskName(label, y + 1);
}

export function cmsBatchNameFromGroup(group) {
  const name = String(group?.name || '').trim();
  if (DESK_NAME_RE.test(name)) return name;
  const fromZoho = formatZohoLepBatchLabel(group?.zohoRawBatch);
  if (fromZoho) return fromZoho;
  const stripped = name.replace(/^LEP\s*·\s*/i, '').trim();
  return stripped || name || 'LEP batch';
}

const MONTH_SHORT = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

function ordinalDay(n) {
  const v = n % 100;
  if (v >= 11 && v <= 13) return `${n}th`;
  const suffix = { 1: 'st', 2: 'nd', 3: 'rd' }[n % 10] || 'th';
  return `${n}${suffix}`;
}

/** Delivery Desk label from Zoho `LEP_Batch` (start DMY in range). */
export function formatZohoLepBatchLabel(raw) {
  const m = ZOHO_RANGE_START.exec(String(raw || '').trim());
  if (!m) return '';
  const day = Number(m[1]);
  const mon = Number(m[2]);
  if (!day || mon < 1 || mon > 12) return '';
  return `${ordinalDay(day)} ${MONTH_SHORT[mon - 1]} batch`;
}

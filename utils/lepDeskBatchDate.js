import {
  addCalendarDays,
  day1FromOrientationThursday,
  parseISODate,
} from './lepBatchSchedule';
import { learnerProgramDates } from './programAccess';

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

function toDmy(iso) {
  const [y, m, d] = String(iso || '').split('-').map(Number);
  if (!y || !m || !d) return '';
  return `${pad2(d)}/${pad2(m)}/${y}`;
}

/** Same calendar day next month (14/10 → 14/11). */
export function addOneCalendarMonth(iso) {
  const [y, m, d] = String(iso || '').split('-').map(Number);
  if (!y || !m || !d) return '';
  const next = new Date(y, m - 1 + 1, d);
  // Clamp overflow (e.g. 31 Jan → last day of Feb)
  if (next.getDate() !== d) {
    next.setDate(0);
  }
  return toIso(next.getFullYear(), next.getMonth() + 1, next.getDate());
}

/**
 * Zoho Leads `LEP_Batch` from Day 1 Saturday → same date one month later,
 * the way CX names batches in Zoho.
 * e.g. Sat 24–Sun 25 Oct → `24/10/2026 - 24/11/2026`
 */
export function zohoLepBatchKeyFromDay1(day1Iso) {
  const day1 = String(day1Iso || '').slice(0, 10);
  if (!/^\d{4}-\d{2}-\d{2}$/.test(day1)) return '';
  const end = addOneCalendarMonth(day1);
  if (!end) return '';
  return `${toDmy(day1)} - ${toDmy(end)}`;
}

/**
 * One LEP batch date-range line for Profile (Your batches + Enrollment Status).
 * Prefer live Zoho, then in-app pick, then CMS batch / Day 1.
 */
export function resolveLepBatchDateLine({ profile, cmsBatch, zohoLive } = {}) {
  const lep = profile?.programAccess?.lep || {};
  const zohoDates = learnerProgramDates(profile, 'lep');
  const startDmy = toDmy(zohoDates.start);
  const endDmy = toDmy(zohoDates.end);
  const fromStartEnd =
    startDmy && endDmy
      ? `${startDmy} - ${endDmy}`
      : zohoDates.start
        ? zohoLepBatchKeyFromDay1(zohoDates.start)
        : '';
  const candidates = [
    zohoLive,
    lep.zohoRawBatch,
    lep.zohoBatchKey,
    cmsBatch?.zohoBatchKey,
    fromStartEnd,
    lep.day1Date ? zohoLepBatchKeyFromDay1(lep.day1Date) : '',
    cmsBatch?.day1Date ? zohoLepBatchKeyFromDay1(cmsBatch.day1Date) : '',
  ]
    .map((v) => String(v || '').trim())
    .filter(Boolean);
  const dateLine = candidates.find((v) => /^\d{1,2}\/\d{1,2}\/\d{2,4}\s*[-–—]\s*\d{1,2}\/\d{1,2}\/\d{2,4}$/.test(v)) || '';
  const live = String(zohoLive || '').trim();
  return {
    dateLine,
    fromZoho: Boolean(dateLine && live && dateLine === live),
    awaitingZoho: Boolean(dateLine && !(live && dateLine === live)),
  };
}

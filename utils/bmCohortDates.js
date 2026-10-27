/** 100BM programme length — keep in sync with LMS accessTiers PROGRAM_LENGTH_MONTHS.100bm (6). */

function parseIso(iso) {
  const [y, m, d] = String(iso || '').slice(0, 10).split('-').map(Number);
  if (!y || !m || !d) return null;
  return new Date(y, m - 1, d, 12, 0, 0);
}

function toIso(d) {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

export function addCalendarMonths(iso, months) {
  const d = parseIso(iso);
  if (!d || !months) return '';
  const day = d.getDate();
  d.setMonth(d.getMonth() + months);
  if (d.getDate() !== day) d.setDate(0);
  return toIso(d);
}

export function bmCohortEndFromStart(startIso) {
  return addCalendarMonths(startIso, 6);
}

function isoToDmy(iso) {
  const [y, m, d] = String(iso || '').slice(0, 10).split('-');
  if (!y || !m || !d) return '';
  return `${d}/${m}/${y}`;
}

export function bmZohoBatchKeyFromStart(startIso) {
  const start = String(startIso || '').slice(0, 10);
  const end = bmCohortEndFromStart(start);
  const a = isoToDmy(start);
  const b = isoToDmy(end);
  return a && b ? `${a} - ${b}` : '';
}

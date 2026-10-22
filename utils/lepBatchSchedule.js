import { LEP_SESSION_TEMPLATE, LEP_TIMEZONE } from '../constants/lepSessionTemplate';

/** YYYY-MM-DD in Asia/Kolkata from a Date (calendar parts, no UTC drift). */
export function formatDateIST(d) {
  const parts = new Intl.DateTimeFormat('en-CA', {
    timeZone: LEP_TIMEZONE,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).formatToParts(d);
  const y = parts.find((p) => p.type === 'year').value;
  const m = parts.find((p) => p.type === 'month').value;
  const day = parts.find((p) => p.type === 'day').value;
  return `${y}-${m}-${day}`;
}

export function parseISODate(dateStr) {
  const [y, m, d] = String(dateStr).split('-').map(Number);
  return new Date(Date.UTC(y, m - 1, d, 12, 0, 0));
}

export function addCalendarDays(dateStr, days) {
  const d = parseISODate(dateStr);
  d.setUTCDate(d.getUTCDate() + days);
  return formatDateIST(d);
}

/** Thursday orientation → Saturday Day 1 (PDF: Orientation Thu, Day 1 Sat). */
export function day1FromOrientationThursday(orientationDate) {
  return addCalendarDays(orientationDate, 2);
}

export function orientationFromDay1Saturday(day1Date) {
  return addCalendarDays(day1Date, -2);
}

/** @param {string} dateStr YYYY-MM-DD @param {string} timeStr HH:mm */
export function toISTIso(dateStr, timeStr) {
  const [hh, mm] = timeStr.split(':').map((x) => parseInt(x, 10));
  const [y, m, d] = dateStr.split('-').map((x) => parseInt(x, 10));
  const utcMs = Date.UTC(y, m - 1, d, hh - 5, mm - 30, 0);
  return new Date(utcMs).toISOString();
}

/**
 * Build concrete sessions for a batch from Day 1 (Saturday) or Orientation (Thursday).
 * @param {{ anchor: 'orientation'|'day1', date: string, joinLinks?: Record<string,string> }} opts
 */
export function buildLepBatchSessions(opts) {
  const day1 =
    opts.anchor === 'orientation' ? day1FromOrientationThursday(opts.date) : opts.date;
  const orientation =
    opts.anchor === 'day1' ? orientationFromDay1Saturday(opts.date) : opts.date;

  return LEP_SESSION_TEMPLATE.map((t) => {
    const sessionDate = addCalendarDays(day1, t.dayOffset);
    const joinLink = opts.joinLinks?.[t.code] || opts.joinLinks?.[t.notifyRef || t.code] || '';
    return {
      code: t.code,
      title: t.title,
      kind: t.kind,
      weekLabel: t.weekLabel,
      dayOffset: t.dayOffset,
      date: sessionDate,
      startTime: t.startTime,
      endTime: t.endTime,
      startAt: toISTIso(sessionDate, t.startTime),
      endAt: toISTIso(sessionDate, t.endTime),
      joinLink,
      notifyRef: t.notifyRef || t.code,
    };
  });
}

export function describeBatchAnchor(batch) {
  if (!batch?.day1Date) return '';
  return `Day 1 (Sat): ${batch.day1Date} · Orientation (Thu): ${batch.orientationDate || orientationFromDay1Saturday(batch.day1Date)}`;
}

/**
 * Keep what CX changed when the schedule is rebuilt from Day 1:
 *   custom    — CX moved the date or changed the time: keep their date/time
 *   cancelled — CX cancelled this session: keep it cancelled
 *   extra     — a session CX added (code not in the standard schedule): keep it
 * Zoom links and title edits are kept too.
 */
export function mergeCustomSessions(built, previous = []) {
  const prevByCode = Object.fromEntries((previous || []).filter((s) => s?.code).map((s) => [s.code, s]));
  const builtCodes = new Set(built.map((s) => s.code));
  const merged = built.map((row) => {
    const prev = prevByCode[row.code];
    if (!prev) return row;
    const out = {
      ...row,
      title: prev.title || row.title,
      joinLink: prev.joinLink || row.joinLink || '',
      ...(prev.cancelled ? { cancelled: true } : {}),
    };
    if (prev.custom && prev.date) {
      const startTime = prev.startTime || row.startTime;
      const endTime = prev.endTime || row.endTime;
      Object.assign(out, {
        custom: true,
        date: prev.date,
        startTime,
        endTime,
        startAt: toISTIso(prev.date, startTime),
        endAt: toISTIso(prev.date, endTime),
      });
    }
    return out;
  });
  const extras = (previous || []).filter((s) => s?.code && s.extra && !builtCodes.has(s.code));
  return [...merged, ...extras].sort((a, b) => String(a.startAt || '').localeCompare(String(b.startAt || '')));
}

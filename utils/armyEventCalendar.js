import { ARMY_EVENT_MONTHS } from '../constants/armyEventCalendar';

const MONTH_INDEX = {
  january: 0,
  jan: 0,
  february: 1,
  feb: 1,
  march: 2,
  mar: 2,
  april: 3,
  apr: 3,
  may: 4,
  june: 5,
  jun: 5,
  july: 6,
  jul: 6,
  august: 7,
  aug: 7,
  september: 8,
  sept: 8,
  sep: 8,
  october: 9,
  oct: 9,
  november: 10,
  nov: 10,
  december: 11,
  dec: 11,
};

const DOW = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const MON = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

function istTodayIso(now = new Date()) {
  return new Intl.DateTimeFormat('en-CA', {
    timeZone: 'Asia/Kolkata',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).format(now);
}

function pad2(n) {
  return String(n).padStart(2, '0');
}

function isoFromParts(year, monthIndex, day) {
  return `${year}-${pad2(monthIndex + 1)}-${pad2(day)}`;
}

/** Minimal CSV parser that respects quoted cells (incl. newlines). */
export function parseCsv(text) {
  const rows = [];
  let row = [];
  let cell = '';
  let inQuotes = false;
  const src = String(text || '').replace(/^\uFEFF/, '');
  for (let i = 0; i < src.length; i += 1) {
    const ch = src[i];
    const next = src[i + 1];
    if (inQuotes) {
      if (ch === '"' && next === '"') {
        cell += '"';
        i += 1;
      } else if (ch === '"') {
        inQuotes = false;
      } else {
        cell += ch;
      }
      continue;
    }
    if (ch === '"') {
      inQuotes = true;
      continue;
    }
    if (ch === ',') {
      row.push(cell);
      cell = '';
      continue;
    }
    if (ch === '\n' || (ch === '\r' && next === '\n')) {
      row.push(cell);
      cell = '';
      if (row.some((c) => String(c).trim())) rows.push(row);
      row = [];
      if (ch === '\r') i += 1;
      continue;
    }
    if (ch === '\r') {
      row.push(cell);
      cell = '';
      if (row.some((c) => String(c).trim())) rows.push(row);
      row = [];
      continue;
    }
    cell += ch;
  }
  row.push(cell);
  if (row.some((c) => String(c).trim())) rows.push(row);
  return rows;
}

function cleanTitle(raw) {
  return String(raw || '')
    .replace(/\s+/g, ' ')
    .replace(/^[-–—·]+\s*/, '')
    .replace(/\bjourney\b/gi, 'Journey')
    .replace(/\bjouney\b/gi, 'Journey') // sheet typo
    .replace(/\bc-?\s*suite\b/gi, 'C-Suite')
    .trim();
}

function titleCaseWords(text) {
  return String(text || '')
    .split(' ')
    .filter(Boolean)
    .map((w) => {
      if (/^C-Suite$/i.test(w)) return 'C-Suite';
      if (w.length <= 2 && !/^[a-z]+$/i.test(w)) return w;
      if (w.length <= 2) return w.toLowerCase();
      return w[0].toUpperCase() + w.slice(1).toLowerCase();
    })
    .join(' ');
}

/** Pull speaker / guest from "(Parul)", "by Suvarna", "Guest : Rekha", trailing name. */
function extractSpeaker(blob) {
  const text = String(blob || '');
  const guest = /Guest\s*:\s*([A-Za-z][A-Za-z .'-]{1,40})/i.exec(text);
  if (guest) return cleanTitle(guest[1]).replace(/\s+sir$/i, '').replace(/\s+mam$/i, '');
  const by = /\bby\s+([A-Za-z][A-Za-z .'-]{1,40})/i.exec(text);
  if (by) return cleanTitle(by[1]).replace(/\s+sir$/i, '').replace(/\s+mam$/i, '');
  // Closed or unclosed paren — sheet often has "(parul " without ")"
  const paren = /\(\s*([^)\n]{2,40})\s*\)?/.exec(text);
  if (paren) {
    const inside = cleanTitle(paren[1]).replace(/^online\s*/i, '').trim();
    if (inside && !/^(online|offline|re\s*run)$/i.test(inside)) return titleCaseWords(inside);
  }
  return '';
}

function detectMode(text) {
  const t = String(text || '').toLowerCase();
  if (/\boffline\b|\bin[- ]?person\b|\bchapter\b/.test(t)) return 'offline';
  if (/\bonline\b|\bre\s*run\b|\bvirtual\b|\bzoom\b/.test(t)) return 'online';
  return 'online';
}

function detectCity(text) {
  const t = String(text || '');
  const hit =
    /\b(bengaluru|bangalore|blore|mumbai|delhi|hyderabad|pune|chennai|kolkata)\b/i.exec(t);
  if (!hit) return '';
  const key = hit[1].toLowerCase();
  if (key === 'blore' || key === 'bangalore') return 'Bengaluru';
  return key.charAt(0).toUpperCase() + key.slice(1);
}

function detectTime(text) {
  const t = String(text || '');
  const range = /(\d{1,2})\s*[-–]\s*(\d{1,2})\s*(am|pm)/i.exec(t);
  if (range) {
    const startH = Number(range[1]);
    const endH = Number(range[2]);
    const ap = range[3].toUpperCase();
    return {
      timeLabel: `${startH}–${endH} ${ap}`,
      startHour24: ap === 'PM' && startH < 12 ? startH + 12 : startH % 12,
    };
  }
  const single = /(\d{1,2})(?::(\d{2}))?\s*(am|pm)/i.exec(t);
  if (single) {
    let h = Number(single[1]);
    const m = single[2] || '00';
    const ap = single[3].toUpperCase();
    if (ap === 'PM' && h < 12) h += 12;
    if (ap === 'AM' && h === 12) h = 0;
    return { timeLabel: `${Number(single[1])}:${m} ${ap}`, startHour24: h };
  }
  return { timeLabel: '8:00 PM', startHour24: 20 };
}

/**
 * Split a month cell into individual event blobs (by day mentions).
 */
function splitCellEvents(cell) {
  const raw = String(cell || '').trim();
  if (!raw) return [];
  const parts = raw.split(/\n+/).map((p) => p.trim()).filter(Boolean);
  const out = [];
  let buf = '';
  parts.forEach((line) => {
    if (/\b\d{1,2}(?:st|nd|rd|th)\b/i.test(line) && buf) {
      out.push(buf);
      buf = line;
    } else {
      buf = buf ? `${buf} ${line}` : line;
    }
  });
  if (buf) out.push(buf);

  // Also split same-line "17th … 18th …"
  const expanded = [];
  out.forEach((blob) => {
    const dayHits = [...blob.matchAll(/\b(\d{1,2})(?:st|nd|rd|th)\b/gi)];
    if (dayHits.length <= 1) {
      expanded.push(blob);
      return;
    }
    dayHits.forEach((match, idx) => {
      const start = match.index;
      const end = idx + 1 < dayHits.length ? dayHits[idx + 1].index : blob.length;
      const slice = blob.slice(start, end).trim();
      if (slice) expanded.push(slice);
    });
  });
  return expanded;
}

function monthKeyFromCell(cell) {
  const key = String(cell || '')
    .trim()
    .toLowerCase()
    .replace(/\./g, '');
  if (!key) return null;
  if (MONTH_INDEX[key] != null) return key;
  // Sheet uses "Oct" / "Nov" / "Dec" — match abbrev ↔ full month either direction
  const hit = ARMY_EVENT_MONTHS.find(
    (m) => key === m || key.startsWith(m) || (key.length >= 3 && m.startsWith(key))
  );
  return hit || null;
}

/** Spotlight events the product should feature (BHAG / mega global). */
function detectHighlight(blob) {
  const t = String(blob || '').toLowerCase();
  if (/\bbhag\b/.test(t) || /winning\s*2027/.test(t) || /plan\s+your\s+bhag/.test(t)) {
    return { highlight: true, highlightKind: 'bhag' };
  }
  if (
    /grand\s*event/.test(t) ||
    /mega\s*global/.test(t) ||
    (/200\s*\+/.test(t) && /1\s*cr/.test(t))
  ) {
    return { highlight: true, highlightKind: 'mega' };
  }
  return { highlight: false, highlightKind: '' };
}

function polishHighlightTitle(blob, speaker) {
  const { highlightKind } = detectHighlight(blob);
  if (highlightKind === 'bhag') {
    return speaker ? `Plan Your BHAG for 2027 · ${speaker}` : 'Plan Your BHAG for 2027';
  }
  if (highlightKind === 'mega') {
    return 'Mega Global Event · 200+ reaching ₹1 Cr';
  }
  return null;
}

/**
 * Parse Army calendar CSV rows → normalized event objects.
 * @param {string} csvText
 * @param {Date} [now]
 * @param {{ forceYear?: number }} [options] — year-specific Event Planner tabs
 */
export function parseArmyEventsCsv(csvText, now = new Date(), options = {}) {
  const todayIso = istTodayIso(now);
  const todayYear = Number(todayIso.slice(0, 4));
  const todayMonth = Number(todayIso.slice(5, 7)) - 1; // 0-based
  const forceYear = Number(options.forceYear) || null;
  const rows = parseCsv(csvText);
  const events = [];

  rows.forEach((row) => {
    const monthKey = monthKeyFromCell(row[0]);
    if (!monthKey) return;
    const monthIndex = MONTH_INDEX[monthKey];
    let year = forceYear || todayYear;
    // Only roll when the tab is not year-locked (legacy single-sheet mode)
    if (!forceYear && monthIndex < todayMonth) year = todayYear + 1;

    row.slice(1).forEach((cell) => {
      splitCellEvents(cell).forEach((blob) => {
        const dayMatch = /\b(\d{1,2})(?:st|nd|rd|th)\b/i.exec(blob);
        if (!dayMatch) return;
        const day = Number(dayMatch[1]);
        if (!(day >= 1 && day <= 31)) return;
        const dateIso = isoFromParts(year, monthIndex, day);
        const mode = detectMode(blob);
        const city = detectCity(blob);
        const { timeLabel, startHour24 } = detectTime(blob);
        const speaker = extractSpeaker(blob);
        const { highlight, highlightKind } = detectHighlight(blob);
        let title = cleanTitle(
          blob
            .replace(/\b\d{1,2}(?:st|nd|rd|th)\b/gi, ' ')
            .replace(
              /\b(jan|feb|mar|apr|may|jun|jul|aug|sep|sept|oct|nov|dec)[a-z]*\b/gi,
              ' '
            )
            .replace(/\b(saturday|sunday|monday|tuesday|wednesday|thursday|friday|sat|sun)\b/gi, ' ')
            .replace(/\b(online|offline|re\s*run)\b/gi, ' ')
            .replace(/\b(time\s*[-–:]?\s*)?\d{1,2}\s*([-–]\s*\d{1,2})?\s*(am|pm)\b/gi, ' ')
            .replace(/\([^)]*\)?/g, ' ') // strip (Parul) / broken "(parul "
            .replace(/\bby\s+[A-Za-z][A-Za-z .'-]{1,40}/gi, ' ')
            .replace(/Guest\s*:\s*[^\n]+/gi, ' ')
            .replace(/\bjourney\b/gi, 'Journey')
            .replace(/\bjouney\b/gi, 'Journey')
            .replace(/\s+/g, ' ')
            .trim()
        );
        if (!title || title.length < 3) {
          title = mode === 'offline' ? 'Chapter meetup' : 'C-Suite Journey';
        }
        title = titleCaseWords(title);
        // Prefer clean series name when sheet text is mostly the speaker
        if (speaker && /^C-Suite$/i.test(title)) title = 'C-Suite Journey';
        const polished = polishHighlightTitle(blob, speaker);
        const displayTitle = polished || (speaker ? `${title} · ${speaker}` : title);

        const d = new Date(year, monthIndex, day);
        // Prefer weekday written in the sheet (year-roll can shift Sat→Sun)
        const dowFromSheet = (() => {
          const m =
            /\b(saturday|sunday|monday|tuesday|wednesday|thursday|friday|sat|sun|mon|tue|wed|thu|fri)\b/i.exec(
              blob
            );
          if (!m) return null;
          const map = {
            saturday: 'Sat',
            sat: 'Sat',
            sunday: 'Sun',
            sun: 'Sun',
            monday: 'Mon',
            mon: 'Mon',
            tuesday: 'Tue',
            tue: 'Tue',
            wednesday: 'Wed',
            wed: 'Wed',
            thursday: 'Thu',
            thu: 'Thu',
            friday: 'Fri',
            fri: 'Fri',
          };
          return map[m[1].toLowerCase()] || null;
        })();
        const whenLabel = `${dowFromSheet || DOW[d.getDay()]} ${day} ${MON[monthIndex]} · ${timeLabel}`;
        const placeBit =
          mode === 'offline'
            ? city
              ? `${city} chapter`
              : 'In person'
            : 'Online';
        events.push({
          id: `army-${dateIso}-${mode}-${displayTitle.slice(0, 28).replace(/\s+/g, '-')}`,
          dateIso,
          title: displayTitle,
          seriesTitle: title,
          speaker,
          mode,
          city,
          timeLabel,
          startHour24,
          sourceText: cleanTitle(blob),
          whenLabel,
          highlight,
          highlightKind,
          year,
          eyebrow:
            dateIso === todayIso
              ? 'TODAY'
              : highlight
                ? 'SPOTLIGHT'
                : mode === 'offline'
                  ? city
                    ? `${city.toUpperCase()} · IN PERSON`
                    : 'IN PERSON'
                  : 'LIVE · ONLINE',
          meta: speaker ? `${speaker} · ${placeBit} · ${timeLabel}` : `${placeBit} · ${timeLabel}`,
        });
      });
    });
  });

  // Dedupe by date+title
  const seen = new Set();
  return events
    .filter((ev) => {
      const key = `${ev.dateIso}|${ev.title}|${ev.mode}`;
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    })
    .sort((a, b) => String(a.dateIso).localeCompare(String(b.dateIso)));
}

/** Merge multiple year tabs; later sheets win on same date+title. */
export function mergeArmyEventLists(lists) {
  const byKey = new Map();
  (lists || []).flat().forEach((ev) => {
    if (!ev) return;
    const key = `${ev.dateIso}|${ev.title}|${ev.mode}`;
    byKey.set(key, ev);
  });
  return [...byKey.values()].sort((a, b) => String(a.dateIso).localeCompare(String(b.dateIso)));
}

function futureArmyEventsSorted(events, fromIso) {
  const start = fromIso || istTodayIso();
  return (events || [])
    .filter((ev) => ev.dateIso >= start)
    .sort((a, b) => String(a.dateIso).localeCompare(String(b.dateIso)));
}

export function upcomingArmyEvents(events, { fromIso, limit = 12 } = {}) {
  return futureArmyEventsSorted(events, fromIso).slice(0, limit);
}

/** Learn tab: never drop spotlight rows when the plain date cap would skip them. */
export function upcomingArmyEventsForLearn(events, { fromIso, limit = 28 } = {}) {
  const future = futureArmyEventsSorted(events, fromIso);
  const highlights = future.filter((ev) => ev.highlight);
  const rest = future.filter((ev) => !ev.highlight);
  const seen = new Set();
  const out = [];
  for (const ev of [...highlights, ...rest]) {
    const key = ev.id || `${ev.dateIso}|${ev.title}|${ev.mode}`;
    if (seen.has(key)) continue;
    seen.add(key);
    out.push(ev);
    if (out.length >= limit) break;
  }
  return out;
}

export function nextArmyEvent(events, { mode, fromIso, highlightOnly = false } = {}) {
  const list = upcomingArmyEvents(events, { fromIso, limit: 60 });
  const scoped = highlightOnly ? list.filter((ev) => ev.highlight) : list;
  if (!mode) return scoped[0] || null;
  return scoped.find((ev) => ev.mode === mode) || null;
}

export function upcomingHighlightEvents(events, { fromIso, limit = 4 } = {}) {
  return upcomingArmyEvents(events, { fromIso, limit: 40 })
    .filter((ev) => ev.highlight)
    .slice(0, limit);
}

/** "Live · Online" / "In person" for a card corner — '' when the eyebrow already says it. */
export function armyEventModeLabel(event) {
  const label = event?.mode === 'offline' ? 'In person' : 'Live · Online';
  const eyebrow = String(event?.eyebrow || '').toUpperCase();
  return eyebrow.includes('ONLINE') || eyebrow.includes('IN PERSON') ? '' : label;
}

export function armyEventCalendarUrl(event) {
  if (!event?.dateIso) return '';
  const compact = event.dateIso.replace(/-/g, '');
  const hh = String(event.startHour24 ?? 20).padStart(2, '0');
  const start = `${compact}T${hh}0000`;
  const endH = String(((event.startHour24 ?? 20) + 1) % 24).padStart(2, '0');
  const end = `${compact}T${endH}0000`;
  const text = encodeURIComponent(event.title || 'Iron Lady event');
  const details = encodeURIComponent(event.sourceText || event.meta || 'Iron Lady Army');
  return `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${text}&dates=${start}/${end}&details=${details}&ctz=Asia%2FKolkata`;
}

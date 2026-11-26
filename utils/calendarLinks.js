/** Google Calendar links (pure; no phone APIs). */

const pad = (n) => String(n).padStart(2, '0');

/**
 * Google's dates= value for a start in India time. Adds the duration with real date maths, so an
 * event at 11 PM for 2 hours ends the next day (it used to end "1 AM the same day", which Google
 * rejects).
 */
export function calendarDates(dateIso, hour, minute = 0, durationMins = 60) {
  const [y, m, d] = String(dateIso).split('-').map(Number);
  if (!y || !m || !d) return '';
  const start = new Date(Date.UTC(y, m - 1, d, hour, minute));
  const end = new Date(start.getTime() + Math.max(15, durationMins) * 60000);
  const fmt = (t) =>
    `${t.getUTCFullYear()}${pad(t.getUTCMonth() + 1)}${pad(t.getUTCDate())}T${pad(t.getUTCHours())}${pad(t.getUTCMinutes())}00`;
  return `${fmt(start)}/${fmt(end)}`;
}

/** All-day value: the date to the next day. */
export function calendarAllDay(dateIso) {
  const [y, m, d] = String(dateIso).split('-').map(Number);
  if (!y || !m || !d) return '';
  const next = new Date(Date.UTC(y, m - 1, d + 1));
  return `${y}${pad(m)}${pad(d)}/${next.getUTCFullYear()}${pad(next.getUTCMonth() + 1)}${pad(next.getUTCDate())}`;
}

export function googleCalendarUrl({ title, dates, details, location }) {
  if (!dates) return '';
  const q = [
    'action=TEMPLATE',
    `text=${encodeURIComponent(title || 'Iron Lady')}`,
    `dates=${dates}`,
    details ? `details=${encodeURIComponent(details)}` : '',
    location ? `location=${encodeURIComponent(location)}` : '',
    'ctz=Asia%2FKolkata',
  ].filter(Boolean);
  return `https://calendar.google.com/calendar/render?${q.join('&')}`;
}

/** Same event → same key, wherever the button is: its title and start. */
export function calendarKeyFromUrl(url) {
  const u = String(url || '');
  const text = (/[?&]text=([^&]*)/.exec(u) || [])[1] || '';
  const start = ((/[?&]dates=([^&/]*)/.exec(u) || [])[1] || '').slice(0, 8);
  return text || start ? `${decodeURIComponent(text).toLowerCase()}|${start}` : '';
}


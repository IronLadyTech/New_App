import { Linking, Platform } from 'react-native';
import { requireOptionalNativeModule } from 'expo';

/**
 * The phone's own calendar (APK 1.2.0+, expo-calendar). The app writes the event itself, so it
 * knows it was added (no "did you save it?" question) and it shows even when Google sync is off.
 * On an older APK the native module is missing: everything here reports "not available" and the
 * caller falls back to the Google Calendar link.
 */

const native = Platform.OS === 'android' ? requireOptionalNativeModule('ExpoCalendar') : null;
// Loaded only when the native module exists, so an older APK never touches it.
const Cal = native ? require('expo-calendar/legacy') : null;

export const deviceCalendarAvailable = Boolean(Cal);

const IST_OFFSET_MIN = 330;

/** "20261128T090000" (India time) or "...Z" (UTC) or "20261128" (all day) → Date. */
function parseGoogleTime(v) {
  const m = /^(\d{4})(\d{2})(\d{2})(?:T(\d{2})(\d{2})(\d{2})(Z?))?$/.exec(String(v || ''));
  if (!m) return null;
  const [, y, mo, d, h, mi, s, z] = m;
  if (h == null) return { date: new Date(Number(y), Number(mo) - 1, Number(d)), allDay: true };
  const utc = Date.UTC(Number(y), Number(mo) - 1, Number(d), Number(h), Number(mi), Number(s));
  return { date: new Date(z ? utc : utc - IST_OFFSET_MIN * 60000), allDay: false };
}

function param(url, key) {
  const v = (new RegExp(`[?&]${key}=([^&]*)`).exec(String(url || '')) || [])[1];
  if (v == null) return '';
  try {
    return decodeURIComponent(v.replace(/\+/g, ' '));
  } catch {
    return v;
  }
}

/** The event inside one of our Google Calendar links. */
export function eventFromCalendarUrl(url) {
  const [a, b] = param(url, 'dates').split('/');
  const start = parseGoogleTime(a);
  const end = parseGoogleTime(b);
  if (!start || !end) return null;
  return {
    title: param(url, 'text') || 'Iron Lady',
    startDate: start.date,
    endDate: end.date,
    allDay: start.allDay,
    notes: param(url, 'details') || undefined,
    location: param(url, 'location') || undefined,
  };
}

function pickCalendar(calendars) {
  const writable = calendars.filter((c) => c.allowsModifications && c.isVisible !== false);
  const google = (c) => /google/i.test(`${c.source?.type || ''} ${c.ownerAccount || ''}`);
  return (
    writable.find((c) => c.isPrimary && google(c)) ||
    writable.find((c) => google(c) && /@/.test(c.ownerAccount || '') && c.ownerAccount === c.name) ||
    writable.find((c) => c.isPrimary) ||
    writable.find(google) ||
    writable[0] ||
    null
  );
}

/**
 * Adds the event to her phone calendar. Returns its id, or null when it could not (no APK
 * support, permission refused, no writable calendar) so the caller can use the link instead.
 */
export async function addEventToDevice(event) {
  if (!Cal || !event) return null;
  try {
    const perm = await Cal.requestCalendarPermissionsAsync();
    if (perm?.status !== 'granted') return null;
    const calendar = pickCalendar(await Cal.getCalendarsAsync(Cal.EntityTypes.EVENT));
    if (!calendar) return null;
    const id = await Cal.createEventAsync(calendar.id, {
      title: event.title,
      startDate: event.startDate,
      endDate: event.endDate,
      allDay: event.allDay,
      notes: event.notes,
      location: event.location,
      timeZone: 'Asia/Kolkata',
      alarms: event.allDay ? [] : [{ relativeOffset: -30 }],
    });
    return id ? String(id) : null;
  } catch {
    return null;
  }
}

/**
 * Is the event still in her calendar? true / false, or null when the app cannot tell (no APK
 * support or no permission yet) — then nothing changes.
 */
export async function deviceEventExists(id) {
  if (!Cal || !id) return null;
  try {
    const perm = await Cal.getCalendarPermissionsAsync();
    if (perm?.status !== 'granted') return null;
    const ev = await Cal.getEventAsync(String(id));
    return Boolean(ev && ev.id);
  } catch (e) {
    // Not found → deleted. Anything else → unknown.
    // Android: EventNotFoundException "Event with id … could not be found" (deleted events too).
    return /could not be found|NOT_FOUND/i.test(`${e?.code || ''} ${e?.message || ''}`) ? false : null;
  }
}

/** Opens the event in her calendar app. */
export function openDeviceEvent(id) {
  if (!id) return Promise.resolve(false);
  return Linking.openURL(`content://com.android.calendar/events/${id}`)
    .then(() => true)
    .catch(() => false);
}

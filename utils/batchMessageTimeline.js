import { describeAnchor } from '../constants/cms';

const CORE_SESSION_CODES = new Set(['S0', 'S1', 'S2', 'S3', 'S4', 'S5', 'S6', 'S7', 'S8']);

function parseMs(iso) {
  if (!iso) return null;
  const t = Date.parse(iso);
  return Number.isFinite(t) ? t : null;
}

function sessionsForRef(batch, ref) {
  const sessions = batch?.sessions || [];
  if (!ref || ref === '*') {
    return sessions.filter((s) => CORE_SESSION_CODES.has(s.code));
  }
  if (ref === 'FT') return sessions.filter((s) => s.code === 'FT');
  if (ref === 'PTW') {
    return sessions.filter((s) => s.code === 'PTW' || s.notifyRef === 'PTW' || String(s.code).startsWith('PTW'));
  }
  return sessions.filter((s) => s.code === ref || s.notifyRef === ref);
}

/** @returns {'upcoming'|'active'|'expired'|'ongoing'} */
export function messageStatusForBatch(event, batch, nowMs = Date.now()) {
  if (!batch?.day1Date) return 'upcoming';
  const anchor = event.anchor || {};
  const type = anchor.type;

  if (batch.status !== 'live' && batch.automationEnabled !== true) {
    if (type === 'event' && anchor.trigger === 'enrolled') return 'upcoming';
  }

  if (type === 'event') {
    return batch.status === 'live' || batch.automationEnabled ? 'ongoing' : 'upcoming';
  }

  if (type === 'daily' || type === 'weekly' || type === 'day1' || type === 'taskOpen' || type === 'taskDue') {
    const start = parseMs(batch.sessions?.[0]?.startAt) || parseMs(`${batch.day1Date}T03:30:00.000Z`);
    const end = parseMs(batch.sessions?.[batch.sessions.length - 1]?.endAt) || start + 35 * 86400000;
    if (nowMs < start - 7 * 86400000) return 'upcoming';
    if (nowMs > end + 2 * 86400000) return 'expired';
    return 'active';
  }

  if (type === 'sessionStart' || type === 'sessionEnd') {
    const targets = sessionsForRef(batch, anchor.ref);
    if (!targets.length) return 'upcoming';
    const offset = (anchor.offsetMinutes || 0) * 60 * 1000;
    let anyActive = false;
    let anyUpcoming = false;
    for (const s of targets) {
      const edge = type === 'sessionStart' ? parseMs(s.startAt) : parseMs(s.endAt);
      if (!edge) continue;
      const fire = edge + offset;
      const expire = parseMs(s.endAt) + 36 * 3600000;
      if (nowMs < fire - 86400000) anyUpcoming = true;
      else if (nowMs <= expire) anyActive = true;
    }
    if (anyActive) return 'active';
    if (anyUpcoming) return 'upcoming';
    return 'expired';
  }

  return 'active';
}

export function sectionForEvent(event) {
  const anchor = event.anchor || {};
  const ref = anchor.ref;
  if (anchor.type === 'event') return { id: 'enrollment', title: 'Enrollment & payment' };
  if (ref === 'S0') return { id: 'S0', title: 'Orientation (S0)' };
  if (ref === 'S1') return { id: 'S1', title: 'Day 1 — Full day (S1)' };
  if (ref === 'S2') return { id: 'S2', title: 'Day 2 — Full day (S2)' };
  if (ref === 'FT') return { id: 'FT', title: 'Fast Track (optional)' };
  if (ref === 'PTW') return { id: 'PTW', title: 'Prepare to Win (optional)' };
  if (anchor.type === 'sessionStart' || anchor.type === 'sessionEnd') {
    if (!ref || ref === '*') return { id: 'sessions-core', title: 'All core sessions' };
  }
  if (anchor.type === 'daily' || anchor.type === 'weekly') {
    return { id: 'rituals-score', title: 'Rituals & weekly score' };
  }
  if (anchor.type === 'taskOpen' || anchor.type === 'taskDue') {
    return { id: 'tasks', title: 'Task reminders' };
  }
  if (anchor.type === 'day1') return { id: 'program-days', title: 'Program calendar (Day 1 offsets)' };
  const recipients = event.recipients || ['participant'];
  if (recipients.includes('cem') || recipients.includes('pl') || recipients.includes('sales')) {
    return { id: 'staff', title: 'Staff alerts (CEM / PL)' };
  }
  return { id: 'other', title: 'Other' };
}

const SECTION_ORDER = [
  'enrollment',
  'S0',
  'S1',
  'S2',
  'sessions-core',
  'FT',
  'PTW',
  'tasks',
  'rituals-score',
  'program-days',
  'staff',
  'other',
];

/**
 * @param {object} batch
 * @param {Array} events from Firestore or LEP_DEFAULT_EVENTS shape
 */
export function buildBatchMessageTimeline(batch, events, nowMs = Date.now()) {
  const participant = (events || []).filter((e) => {
    const r = e.recipients || ['participant'];
    return r.includes('participant') && e.active !== false;
  });
  const staff = (events || []).filter((e) => {
    const r = e.recipients || [];
    return !r.includes('participant') && e.active !== false;
  });

  const mapSection = (list) => {
    const byId = {};
    list.forEach((ev) => {
      const sec = sectionForEvent(ev);
      if (!byId[sec.id]) byId[sec.id] = { ...sec, items: [] };
      byId[sec.id].items.push({
        ...ev,
        whenLabel: describeAnchor(ev.anchor),
        status: messageStatusForBatch(ev, batch, nowMs),
      });
    });
    return SECTION_ORDER.filter((id) => byId[id]).map((id) => byId[id]);
  };

  return {
    learner: mapSection(participant),
    staff: mapSection(staff),
  };
}

export function statusLabel(status) {
  switch (status) {
    case 'upcoming':
      return 'Upcoming';
    case 'active':
      return 'Active now';
    case 'expired':
      return 'Expired';
    case 'ongoing':
      return 'On enroll';
    default:
      return status;
  }
}

export function statusTone(status) {
  switch (status) {
    case 'active':
    case 'ongoing':
      return 'ok';
    case 'expired':
      return 'neutral';
    case 'upcoming':
      return 'neutral';
    default:
      return 'neutral';
  }
}

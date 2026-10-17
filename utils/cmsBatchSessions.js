import { splitBatchSessions } from './eventVisibility';
import { buildLepBatchSessions } from './lepBatchSchedule';

function sessionAsCalendarEvent(session, batch) {
  if (!session?.date || !session?.title) return null;
  const detail = [session.weekLabel, session.code].filter(Boolean).join(' · ');
  return {
    id: `cms-${batch?.id || 'batch'}-${session.code}`,
    date: session.date,
    time: session.startTime || '',
    endTime: session.endTime || '',
    title: session.title,
    description: detail,
    linkUrl: session.joinLink || '',
    meetingUrl: session.joinLink || '',
    batchId: batch?.id || '',
    batchName: batch?.name || '',
    code: session.code || '',
    kind: session.kind || 'core',
  };
}

function collectJoinLinks(batch) {
  const joinLinks = {};
  const saved = Array.isArray(batch?.sessions) ? batch.sessions : [];
  saved.forEach((s) => {
    if (s?.code && s?.joinLink) joinLinks[s.code] = String(s.joinLink).trim();
  });
  if (batch?.joinLinks && typeof batch.joinLinks === 'object') {
    Object.entries(batch.joinLinks).forEach(([code, url]) => {
      if (url && !joinLinks[code]) joinLinks[code] = String(url).trim();
    });
  }
  return joinLinks;
}

/**
 * LEP schedule source of truth:
 * - Which day + what time → LEP_SESSION_TEMPLATE (fixed journey times)
 * - Which calendar Saturday is Day 1 → CMS day1Date / orientationDate (or caller day1)
 * - Zoom / rare overrides → CMS sessions only when staff set them
 */
export function resolveCmsBatchSessions(batch, { day1Iso = '' } = {}) {
  const day1 = String(batch?.day1Date || day1Iso || '').slice(0, 10);
  const orientation = batch?.orientationDate ? String(batch.orientationDate).slice(0, 10) : '';
  if (!day1 && !orientation) {
    return (Array.isArray(batch?.sessions) ? batch.sessions : []).filter((s) => s?.date && s?.title);
  }

  const joinLinks = collectJoinLinks(batch);
  const built = buildLepBatchSessions({
    anchor: day1 ? 'day1' : 'orientation',
    date: day1 || orientation,
    joinLinks,
  });

  const savedByCode = Object.fromEntries(
    (Array.isArray(batch?.sessions) ? batch.sessions : [])
      .filter((s) => s?.code)
      .map((s) => [s.code, s])
  );

  return built.map((row) => {
    const cms = savedByCode[row.code];
    // Template keeps title + clock. CMS only patches join link (and optional reschedule).
    const overrideTime = Boolean(cms?.startTime && cms.startTime !== row.startTime);
    const overrideEnd = Boolean(cms?.endTime && cms.endTime !== row.endTime);
    const overrideTitle = Boolean(cms?.title && cms.title !== row.title);
    return {
      ...row,
      title: overrideTitle ? String(cms.title).trim() : row.title,
      startTime: overrideTime ? cms.startTime : row.startTime,
      endTime: overrideEnd ? cms.endTime : row.endTime,
      joinLink: String(cms?.joinLink || row.joinLink || '').trim(),
    };
  });
}

/** Core + optional sessions from template + CMS anchor → calendar cards. */
export function splitCmsBatchSessions(batch, { now = new Date(), coreOnly = false, day1Iso = '' } = {}) {
  const resolved = resolveCmsBatchSessions(batch, { day1Iso });
  if (!resolved.length) {
    return { upcoming: [], done: [] };
  }
  const sessions = resolved.filter((s) => !coreOnly || !s.kind || s.kind === 'core');
  // Stamp a stable batch id/name on every row so splitBatchSessions does not
  // drop template-built sessions when the CMS doc id is missing.
  const batchId = String(batch?.id || 'lep-template').trim() || 'lep-template';
  const batchName = String(batch?.name || 'LEP').trim() || 'LEP';
  const stamped = { ...(batch || {}), id: batchId, name: batchName };
  const events = sessions.map((s) => sessionAsCalendarEvent(s, stamped)).filter(Boolean);
  return splitBatchSessions(events, { batchId, batchName, now });
}

/** Nearest upcoming core session (for IL Guide + home). */
export function nextCmsBatchSession(batch, now = new Date(), opts = {}) {
  const { upcoming } = splitCmsBatchSessions(batch, { now, coreOnly: true, ...opts });
  return upcoming[0] || null;
}

/** Next raw session row for the enrolled home card. */
export function nextRawCmsSession(batch, now = new Date(), opts = {}) {
  const today = new Intl.DateTimeFormat('en-CA', {
    timeZone: 'Asia/Kolkata',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).format(now);
  return (
    resolveCmsBatchSessions(batch, opts)
      .filter((s) => s?.date && s?.title && String(s.date).slice(0, 10) >= today)
      .filter((s) => !s.kind || s.kind === 'core')
      .sort((a, b) =>
        `${String(a.date).slice(0, 10)} ${a.startTime || ''}`.localeCompare(
          `${String(b.date).slice(0, 10)} ${b.startTime || ''}`
        )
      )[0] || null
  );
}

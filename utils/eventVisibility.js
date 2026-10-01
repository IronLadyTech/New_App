/** Which calendar events a learner sees — mirrors web LMS. */

export function isGlobalEvent(event) {
  if (!event) return false;
  if (event.audience === 'batch' && event.batchId) return false;
  return !event.batchId || event.audience === 'all' || !event.audience;
}

export function isBatchEvent(event, batchId) {
  return Boolean(batchId && event?.batchId === batchId);
}

export function filterEventsForLearner(events, { batchId } = {}) {
  return (events || []).filter(
    (ev) => isGlobalEvent(ev) || isBatchEvent(ev, batchId)
  );
}

export function resolveVisibleEvents(events, { batchId } = {}) {
  return filterEventsForLearner(events, { batchId: batchId || '' });
}

export function formatEventWhen(event) {
  if (!event?.date) return '';
  const parts = [event.date];
  if (event.time) parts.push(event.time);
  return parts.join(' · ');
}

export function upcomingEvents(events, limit = 5) {
  const today = new Date().toISOString().slice(0, 10);
  return [...(events || [])]
    .filter((e) => e.date && e.date >= today)
    .sort((a, b) => {
      const da = `${a.date} ${a.time || ''}`;
      const db = `${b.date} ${b.time || ''}`;
      return da.localeCompare(db);
    })
    .slice(0, limit);
}

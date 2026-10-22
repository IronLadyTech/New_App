import { inferLepDay1FromGroup } from './lepDeskBatchDate';

/**
 * The web LMS batch (groups doc) a CMS batch belongs to, when there is exactly one
 * sure match: the same Zoho batch value, or for LEP the same Day 1 Saturday.
 * Returns null when nothing or more than one could be it — then CX picks by hand.
 */
export function matchLmsGroup(batch, groups, takenIds = new Set()) {
  const free = (groups || []).filter((g) => !takenIds.has(g.id));
  const key = String(batch?.zohoBatchKey || '').trim();
  if (key) {
    const byKey = free.filter((g) => String(g.zohoRawBatch || '').trim() === key);
    if (byKey.length === 1) return byKey[0];
  }
  const day1 = String(batch?.day1Date || '').slice(0, 10);
  if (day1 && String(batch?.program || 'LEP').toUpperCase() === 'LEP') {
    const byDay = free.filter((g) => inferLepDay1FromGroup(g) === day1);
    if (byDay.length === 1) return byDay[0];
  }
  return null;
}

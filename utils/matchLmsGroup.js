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

/**
 * Every web LMS batch (groups doc) of an LEP CMS batch's Day 1, largest first. Zoho sync
 * makes more than one group for the same dates ("24/10/2026 - 24/11/2026" and
 * "24 Oct 2026 – 24 Nov 2026"); the cohort sits in one, a few learners in the other, so a
 * CMS batch takes all of them: the largest as lmsGroupId, the rest in lmsGroupIds.
 * Groups already on another CMS batch (takenIds) are never taken twice.
 */
export function matchLmsGroups(batch, groups, takenIds = new Set()) {
  const day1 = String(batch?.day1Date || '').slice(0, 10);
  if (!day1 || String(batch?.program || 'LEP').toUpperCase() !== 'LEP') {
    const one = matchLmsGroup(batch, groups, takenIds);
    return one ? [one] : [];
  }
  return (groups || [])
    .filter((g) => !takenIds.has(g.id) && inferLepDay1FromGroup(g) === day1)
    .sort((a, b) => (b.memberCount || 0) - (a.memberCount || 0));
}

/** All group ids a CMS batch covers: lmsGroupId plus lmsGroupIds. */
export function batchGroupIds(batch) {
  const ids = [batch?.lmsGroupId, ...(Array.isArray(batch?.lmsGroupIds) ? batch.lmsGroupIds : [])]
    .map((x) => String(x || '').trim())
    .filter(Boolean);
  return [...new Set(ids)];
}

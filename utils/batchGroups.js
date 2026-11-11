/**
 * Groups inside one batch (Group 1, 2, 3 of ~15), each with its own Zoom room for every
 * session. Same rules as the server (LMS functions/batchGroups.js):
 *
 *   cms_batches.groups = [{ id: 'G1', name: 'Group 1', joinLink, links: { S1: '…' } }]
 *   users.programAccess.lep.group = { batchId, id }
 */

export function batchGroupsOf(batch) {
  return Array.isArray(batch?.groups) ? batch.groups.filter((g) => g && g.id) : [];
}

/** Her group id in this batch, or '' (a group from another batch does not count). */
export function learnerGroupId(profile, batch) {
  const g = profile?.programAccess?.lep?.group;
  if (!g || !g.id || String(g.batchId || '') !== String(batch?.id || '')) return '';
  return batchGroupsOf(batch).some((x) => x.id === g.id) ? g.id : '';
}

/** The link for a group and session: a session-only link, else the group's link, else ''. */
export function groupJoinLink(batch, groupId, sessionCode) {
  const g = batchGroupsOf(batch).find((x) => x.id === groupId);
  if (!g) return '';
  const own = g.links && sessionCode ? String(g.links[sessionCode] || '').trim() : '';
  return own || String(g.joinLink || '').trim();
}

/** Her batch, carrying her group, so every session she sees uses her group's room. */
export function withLearnerGroup(batch, profile) {
  if (!batch) return batch;
  const id = learnerGroupId(profile, batch);
  if (!id) return batch;
  const g = batchGroupsOf(batch).find((x) => x.id === id);
  return { ...batch, myGroupId: id, myGroupName: g?.name || '' };
}

/**
 * Admin labels for `cms_batches` — align with LEP Delivery Desk / Zoho cohort names.
 */

export function formatBatchPickerLabel(batch) {
  const name = String(batch?.name || 'Batch').trim();
  const day1 = String(batch?.day1Date || '').trim();
  const status = batch?.status === 'live' ? 'LIVE' : 'DRAFT';
  if (!day1) return `${name} · ${status}`;
  const year = day1.slice(0, 4);
  return `${name} · ${year} · ${status}`;
}

/** Web LMS `groups` doc id pattern (see new_lms zohoBatchSync.batchDocId). */
export function suggestLmsGroupId({ program = 'LEP', zohoBatchKey }) {
  const raw = String(zohoBatchKey || '').trim();
  if (!raw) return '';
  const map = { LEP: 'lep', '100BM': '100bm', MBW: 'mbw' };
  const prog = map[program] || String(program || 'lep').toLowerCase();
  const slug = raw
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
  return slug ? `zoho_${prog}_${slug}` : '';
}

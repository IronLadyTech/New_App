import { formatZohoLepBatchLabel, inferLepDay1FromZohoRaw } from './lepDeskBatchDate';
import { learnerBatchId, learnerBatchLabel } from './programAccess';

function norm(s) {
  return String(s || '').trim().replace(/\s+/g, ' ');
}

function normZoho(s) {
  return norm(s).toLowerCase();
}

function programMatches(batch, programId) {
  const want = String(programId || 'lep').toUpperCase();
  const got = String(batch?.program || 'LEP').toUpperCase();
  return got === want;
}

/**
 * Pick the `cms_batches` row for this learner (LEP first).
 * Match order: cms doc id → lmsGroupId → zohoBatchKey → batch name → inferred Day 1.
 */
export function resolveLearnerCmsBatch(batches, { profile, programId = 'lep' } = {}) {
  if (!profile || !batches?.length) return null;

  const rows = batches.filter((b) => programMatches(b, programId));
  if (!rows.length) return null;

  const access = profile?.programAccess?.[programId] || profile?.programAccess?.lep || null;
  const batchId = learnerBatchId(profile, programId);
  const batchLabel = learnerBatchLabel(profile, programId);

  const cmsFromAccess = norm(access?.cmsBatchId);
  if (cmsFromAccess) {
    const hit = rows.find((b) => b.id === cmsFromAccess);
    if (hit) return hit;
  }

  const cmsFromProfile = norm(profile?.cmsBatchId);
  if (cmsFromProfile) {
    const hit = rows.find((b) => b.id === cmsFromProfile);
    if (hit) return hit;
  }

  if (batchId && batchId !== 'default') {
    const byDocId = rows.find((b) => b.id === batchId);
    if (byDocId) return byDocId;
    const byLms = rows.find((b) => norm(b.lmsGroupId) === batchId);
    if (byLms) return byLms;
  }

  const labelLooksZoho = /\d{1,2}\/\d{1,2}\/\d{4}/.test(String(batchLabel || ''));
  const zohoRaw =
    norm(access?.zohoRawBatch) ||
    norm(access?.zohoBatchKey) ||
    (labelLooksZoho ? norm(batchLabel) : '');

  if (zohoRaw) {
    const z = normZoho(zohoRaw);
    const byZoho = rows.find((b) => normZoho(b.zohoBatchKey) === z);
    if (byZoho) return byZoho;
  }

  if (batchLabel) {
    const label = norm(batchLabel);
    const byName = rows.find((b) => norm(b.name) === label);
    if (byName) return byName;
    const desk = formatZohoLepBatchLabel(batchLabel);
    if (desk) {
      const byDesk = rows.find((b) => norm(b.name) === norm(desk));
      if (byDesk) return byDesk;
    }
  }

  const inferSource = zohoRaw || access?.zohoRawBatch || batchLabel;
  const day1 = inferLepDay1FromZohoRaw(inferSource);
  if (day1) {
    const matches = rows.filter((b) => b.day1Date === day1);
    if (matches.length === 1) return matches[0];
    if (matches.length > 1 && zohoRaw) {
      const z = normZoho(zohoRaw);
      const tight = matches.find((b) => normZoho(b.zohoBatchKey) === z);
      if (tight) return tight;
    }
  }

  return null;
}

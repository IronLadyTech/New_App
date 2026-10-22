import { formatZohoLepBatchLabel, inferLepDay1FromZohoRaw } from './lepDeskBatchDate';
import { learnerBatchId, learnerBatchLabel, learnerProgramDates } from './programAccess';

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
  // Zoho LEP Start Date is Day 1 itself — the fallback when the batch text is missing.
  const day1 = inferLepDay1FromZohoRaw(inferSource) || learnerProgramDates(profile, programId).start;
  if (day1) {
    const matches = rows.filter((b) => String(b.day1Date || '').slice(0, 10) === day1);
    if (matches.length === 1) return matches[0];
    if (matches.length > 1) {
      // Same dates = same cohort. Prefer the exact Zoho batch, then the one linked to
      // its learners, then the one CX changed last.
      const z = normZoho(zohoRaw);
      return (
        (z && matches.find((b) => normZoho(b.zohoBatchKey) === z)) ||
        matches.find((b) => norm(b.lmsGroupId)) ||
        [...matches].sort((a, b) => stamp(b.updatedAt) - stamp(a.updatedAt))[0]
      );
    }
  }

  return null;
}

function stamp(v) {
  if (!v) return 0;
  if (typeof v.toMillis === 'function') return v.toMillis();
  if (typeof v.seconds === 'number') return v.seconds * 1000;
  return Date.parse(v) || 0;
}

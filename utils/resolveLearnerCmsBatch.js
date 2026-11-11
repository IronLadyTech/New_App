import { formatZohoLepBatchLabel, inferLepDay1FromZohoRaw } from './lepDeskBatchDate';
import { learnerBatchId, learnerBatchLabel, learnerProgramDates } from './programAccess';
import { CMS_QA_BATCH_ID } from '../constants/cms';

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

  const all = batches.filter((b) => programMatches(b, programId));
  // Two batches with the same Day 1, one linked to its learners and one empty (a duplicate
  // made from the other Zoho batch style): the empty one never wins. Otherwise its exact Zoho
  // text matched first and learners saw a batch with no groups and no Zoom links.
  const linked = (b) => Boolean(norm(b.lmsGroupId) || (Array.isArray(b.lmsGroupIds) && b.lmsGroupIds.length));
  const day = (b) => String(b.day1Date || '').slice(0, 10);
  const rows = all.filter((b) => linked(b) || !all.some((o) => o !== b && linked(o) && day(o) && day(o) === day(b)));
  if (!rows.length) return null;

  const access = profile?.programAccess?.[programId] || profile?.programAccess?.lep || null;
  const batchId = learnerBatchId(profile, programId);
  const batchLabel = learnerBatchLabel(profile, programId);

  // After a reschedule her own Day 1 changes first (Zoho LEP start date, or her pick in the
  // app); ids pinned earlier can still point at the old batch. A pinned batch of another
  // Day 1 is stale, so it is passed over and the match by date below finds the new one.
  const ownDay1 = programId === 'lep' ? String(access?.day1Date || '').slice(0, 10) : '';
  const current = (b) => !b || !ownDay1 || !b.day1Date || String(b.day1Date).slice(0, 10) === ownDay1;

  const cmsFromAccess = norm(access?.cmsBatchId);
  if (cmsFromAccess) {
    const hit = rows.find((b) => b.id === cmsFromAccess);
    if (hit && current(hit)) return hit;
  }

  const cmsFromProfile = norm(profile?.cmsBatchId);
  if (cmsFromProfile) {
    const hit = rows.find((b) => b.id === cmsFromProfile);
    if (hit && current(hit)) return hit;
  }

  if (batchId && batchId !== 'default') {
    const byDocId = rows.find((b) => b.id === batchId);
    if (byDocId && current(byDocId)) return byDocId;
    // A CMS batch can cover several LMS groups (lmsGroupIds).
    const byLms = rows.find(
      (b) => norm(b.lmsGroupId) === batchId || (Array.isArray(b.lmsGroupIds) && b.lmsGroupIds.includes(batchId))
    );
    if (byLms && current(byLms)) return byLms;
  }

  const labelLooksZoho = /\d{1,2}\/\d{1,2}\/\d{4}/.test(String(batchLabel || ''));
  const zohoRaw =
    norm(access?.zohoRawBatch) ||
    norm(access?.zohoBatchKey) ||
    (labelLooksZoho ? norm(batchLabel) : '');

  if (zohoRaw) {
    const z = normZoho(zohoRaw);
    const byZoho = rows.find((b) => normZoho(b.zohoBatchKey) === z);
    if (byZoho && current(byZoho)) return byZoho;
  }

  if (batchLabel) {
    const label = norm(batchLabel);
    const byName = rows.find((b) => norm(b.name) === label);
    if (byName && current(byName)) return byName;
    const desk = formatZohoLepBatchLabel(batchLabel);
    if (desk) {
      const byDesk = rows.find((b) => norm(b.name) === norm(desk));
      if (byDesk && current(byDesk)) return byDesk;
    }
  }

  const inferSource = zohoRaw || access?.zohoRawBatch || batchLabel;
  // Zoho LEP Start Date is Day 1 itself — the fallback when the batch text is missing.
  const day1 =
    ownDay1 || inferLepDay1FromZohoRaw(inferSource) || learnerProgramDates(profile, programId).start;
  if (day1) {
    const sameDay = rows.filter((b) => String(b.day1Date || '').slice(0, 10) === day1);
    // The CMS QA test batch shares a real Day 1 (17 Oct): a real learner matched by date
    // gets the real batch. (Test accounts pinned to it are matched by id above.)
    const real = sameDay.filter((b) => b.id !== CMS_QA_BATCH_ID);
    const matches = real.length ? real : sameDay;
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

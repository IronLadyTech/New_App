import { readWelcomeFields } from './programAccess';

/** Fields to push from the learner profile → Zoho Lead (welcome + batch). */
export function welcomeFieldsPayloadFromProfile(profile) {
  if (!profile) return {};
  const welcome = readWelcomeFields(profile);
  const lep = profile?.programAccess?.lep || {};
  const payload = {};
  if (welcome.city) payload.city = welcome.city;
  if (welcome.domain) payload.domain = welcome.domain;
  if (welcome.bhag) payload.bhag = welcome.bhag;
  const salary = String(profile?.salaryRange || profile?.zohoLead?.Annual_Income || '').trim();
  if (salary) payload.salaryRange = salary;
  const chapter = String(profile?.chapters || profile?.zohoLead?.Chapters || '').trim();
  if (chapter) payload.chapters = chapter;
  const day1 = String(lep.day1Date || '').slice(0, 10);
  if (/^\d{4}-\d{2}-\d{2}$/.test(day1)) {
    payload.day1Date = day1;
  } else {
    const batch =
      String(lep.zohoBatchKey || lep.zohoRawBatch || profile?.zohoLead?.LEP_Batch || '').trim();
    if (batch) payload.lepBatch = batch;
  }
  const cmsBatchId = String(lep.cmsBatchId || profile?.cmsBatchId || '').trim();
  if (cmsBatchId) payload.cmsBatchId = cmsBatchId;
  return payload;
}

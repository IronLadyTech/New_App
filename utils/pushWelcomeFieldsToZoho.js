import { readWelcomeFields } from './programAccess';

/** Fields to push from the learner profile → Zoho Lead (welcome + batch). */
export function welcomeFieldsPayloadFromProfile(profile) {
  if (!profile) return {};
  const welcome = readWelcomeFields(profile);
  const payload = {};
  if (welcome.city) payload.city = welcome.city;
  if (welcome.domain) payload.domain = welcome.domain;
  if (welcome.bhag) payload.bhag = welcome.bhag;
  const salary = String(profile?.salaryRange || profile?.zohoLead?.Annual_Income || '').trim();
  if (salary) payload.salaryRange = salary;
  const chapter = String(profile?.chapters || profile?.zohoLead?.Chapters || '').trim();
  if (chapter) payload.chapters = chapter;
  // Never the batch. Zoho owns it; the app writes it only when she changes her batch herself
  // (utils/lockLepBatch.js). Re-sending the copy on this phone overwrote CX's change in Zoho
  // seconds after they made it (Sunitha, 16 Nov: 14 Nov → back to 21 Nov when she opened Profile).
  return payload;
}

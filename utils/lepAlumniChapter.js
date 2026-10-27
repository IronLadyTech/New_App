import { isValidAlumniGeoChapter } from '../constants/lepAlumniGeoChapters';

function leadChapters(source) {
  const z = source?.zohoLead;
  if (!z || typeof z !== 'object') return '';
  const raw = z.Chapters ?? z.chapters ?? z.Chapter ?? '';
  return String(raw || '').trim();
}

export function readAlumniGeoChapter(source) {
  if (!source || typeof source !== 'object') return '';
  const direct = String(source.chapters || '').trim();
  if (isValidAlumniGeoChapter(direct)) return direct;
  const fromLead = leadChapters(source);
  if (isValidAlumniGeoChapter(fromLead)) return fromLead;
  return '';
}

export function alumniChapterProfilePatch(profile, chapter) {
  const value = String(chapter || '').trim();
  if (!isValidAlumniGeoChapter(value)) return null;
  return {
    chapters: value,
    zohoLead: {
      ...(profile?.zohoLead || {}),
      Chapters: value,
      id: profile?.zohoLeadId || profile?.leadId || profile?.zohoLead?.id || null,
    },
  };
}

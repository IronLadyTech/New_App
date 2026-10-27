/** Zoho Lead picklist `Chapters` — alumni / community geography (one-time). */
export const LEP_ALUMNI_GEO_CHAPTERS = [
  'Bangalore',
  'Chennai',
  'Delhi',
  'East Zone( Kolkata)',
  'Hyderabad',
  'Mumbai',
  'Pune',
];

export function isValidAlumniGeoChapter(value) {
  const v = String(value || '').trim();
  return LEP_ALUMNI_GEO_CHAPTERS.includes(v);
}

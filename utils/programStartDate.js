/**
 * Cohort start date (YYYY-MM-DD) from a Zoho batch value, when the value says it:
 *   "12/09/2026 - 12/03/2027"   (IL_Users / Leads range)
 *   "12 Sep 2026 – 12 Mar 2027" (Leads cohort label)
 * A month-only value ("Sep 2026") does not say which day — CX sets the date instead.
 */
const MONTHS = { jan: 1, feb: 2, mar: 3, apr: 4, may: 5, jun: 6, jul: 7, aug: 8, sep: 9, sept: 9, oct: 10, nov: 11, dec: 12 };

const pad = (n) => String(n).padStart(2, '0');

export function inferProgramStartFromZohoRaw(raw) {
  const value = String(raw || '').trim();
  if (!value) return null;
  const dmy = /^(\d{1,2})\/(\d{1,2})\/(\d{4})/.exec(value);
  if (dmy) return `${dmy[3]}-${pad(dmy[2])}-${pad(dmy[1])}`;
  const words = /^(\d{1,2})\s+([A-Za-z]{3,9})\.?\s+(\d{4})/.exec(value);
  if (words) {
    const m = MONTHS[words[2].slice(0, 4).toLowerCase()] || MONTHS[words[2].slice(0, 3).toLowerCase()];
    if (m) return `${words[3]}-${pad(m)}-${pad(words[1])}`;
  }
  return null;
}

/** Iron Lady Army / community event calendar (Google Sheet). */
const SPREADSHEET_ID = '1PkFLp6j3XPVhtuE9kwhvjAmjIQcNOsXJ1KuamkJbp8w';

function csvUrl(gid) {
  return `https://docs.google.com/spreadsheets/d/${SPREADSHEET_ID}/export?format=csv&gid=${gid}`;
}

/** Year-specific Event Planner tabs (same workbook the team edits). */
/** Where CX edit events — the app reads the CSV export of these tabs. */
export const ARMY_EVENTS_SHEET_EDIT_URL = `https://docs.google.com/spreadsheets/d/${SPREADSHEET_ID}/edit`;

export const ARMY_EVENTS_SHEETS = [
  { year: 2026, gid: '7358671', name: 'Event Planner 2026', csvUrl: csvUrl('7358671') },
  { year: 2027, gid: '2046982350', name: 'Event Planner 2027', csvUrl: csvUrl('2046982350') },
];

/** @deprecated use ARMY_EVENTS_SHEETS — kept for older imports */
export const ARMY_EVENTS_SHEET = {
  spreadsheetId: SPREADSHEET_ID,
  gid: ARMY_EVENTS_SHEETS[0].gid,
  csvUrl: ARMY_EVENTS_SHEETS[0].csvUrl,
};

export const ARMY_EVENT_MONTHS = [
  'january',
  'february',
  'march',
  'april',
  'may',
  'june',
  'july',
  'august',
  'aug',
  'september',
  'sept',
  'october',
  'oct',
  'november',
  'nov',
  'december',
  'dec',
];

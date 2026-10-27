import { PROGRAMS } from '../constants/programs';
import { learnerBatchLabel } from './programAccess';
import { formatZohoLepBatchLabel } from './lepDeskBatchDate';

/** Display label for alumni chip, e.g. "24 Oct batch" or raw Zoho range. */
export function lepAlumniBatchShort(profile) {
  const raw = learnerBatchLabel(profile, PROGRAMS.LEP);
  if (!raw) return 'Your cohort';
  const friendly = formatZohoLepBatchLabel(raw);
  return friendly || String(raw).trim();
}

export const LEP_ALUMNI_SESSIONS_BANNER =
  'Your LEP cohort has graduated. This is your batch archive — rewatch recordings when available. Live Join and add-to-calendar are turned off.';

export const LEP_ALUMNI_JOURNEY_BANNER =
  'You completed LEP with this batch. Reopen any task to refresh your work — alumni practice, not certificate requirements.';

export const LEP_ALUMNI_SCHEDULE_SUB_SUFFIX = ' · batch archive';

export function lepTimeGreeting(now = new Date()) {
  const parts = new Intl.DateTimeFormat('en-US', {
    timeZone: 'Asia/Kolkata',
    hour: 'numeric',
    hour12: false,
  }).formatToParts(now);
  const hour = Number(parts.find((p) => p.type === 'hour')?.value ?? 12);
  if (hour < 12) return 'Good morning';
  if (hour < 17) return 'Good afternoon';
  return 'Good evening';
}

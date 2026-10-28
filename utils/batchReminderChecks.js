/**
 * "Ready for reminders" checks for one batch (CMS → Batches), from the batch's own data.
 * Pure — used by screens/admin/batchHub/ReminderChecklist.js.
 */
const CORE = new Set(['S0', 'S1', 'S2', 'S3', 'S4', 'S5', 'S6', 'S7', 'S8']);

function isoDay(v) {
  const s = String(v || '').slice(0, 10);
  return /^\d{4}-\d{2}-\d{2}$/.test(s) ? s : null;
}

function niceDay(iso) {
  const d = new Date(`${iso}T00:00:00Z`);
  return d.toLocaleDateString('en-IN', { weekday: 'short', day: 'numeric', month: 'short', timeZone: 'UTC' });
}

/** Where the batch stands: 'on' | 'paused' (was on, CX paused) | 'off' (never started). */
export function reminderState(batch) {
  if (batch?.status === 'live' && batch?.automationEnabled === true) return 'on';
  if (batch?.status === 'live') return 'paused';
  return 'off';
}

/** The checks, worked out from the batch itself. `ready` = the ones that must pass to start. */
export function batchReminderChecks(batch, { isLep, learnerCount, todayIso }) {
  const day1 = isoDay(batch?.day1Date) || isoDay(batch?.startDate);
  const sessions = (batch?.sessions || []).filter((s) => !s.cancelled && (!isLep || CORE.has(s.code)));
  const upcoming = sessions.filter((s) => (isoDay(s.date) || '') >= todayIso);
  const withZoom = upcoming.filter((s) => String(s.joinLink || '').trim());
  const saturday = day1 && new Date(`${day1}T00:00:00Z`).getUTCDay() === 6;

  const checks = [
    {
      key: 'dates',
      required: true,
      state: !day1 ? 'bad' : isLep && !saturday ? 'warn' : 'ok',
      text: !day1
        ? 'Dates not set'
        : isLep && !saturday
          ? `Day 1 is ${niceDay(day1)} — LEP Day 1 is normally a Saturday`
          : `Dates set · Day 1 ${niceDay(day1)}`,
      fix: 'setup',
      fixLabel: 'Set dates',
    },
  ];
  if (isLep) {
    checks.push(
      {
        key: 'sessions',
        required: true,
        state: sessions.length ? 'ok' : 'bad',
        text: sessions.length ? `${sessions.length} sessions on the calendar` : 'No sessions yet — make the schedule from the dates',
        fix: 'setup',
        fixLabel: 'Make schedule',
      },
      {
        key: 'zoom',
        required: false,
        state: !sessions.length ? 'todo' : !upcoming.length ? 'ok' : withZoom.length === upcoming.length ? 'ok' : 'warn',
        text: !sessions.length
          ? 'Zoom links — add them once the schedule is made'
          : !upcoming.length
            ? 'Zoom links · no sessions left'
          : withZoom.length === upcoming.length
            ? `Zoom links on all ${upcoming.length} coming sessions`
            : `Zoom links on ${withZoom.length} of ${upcoming.length} coming sessions — the rest say “join from the app”`,
        fix: 'calendar',
        fixLabel: 'Add Zoom links',
      }
    );
  }
  checks.push({
    key: 'linked',
    required: true,
    state: batch?.lmsGroupId ? 'ok' : 'bad',
    text: batch?.lmsGroupId
      ? `Linked to its learners${learnerCount != null ? ` · ${learnerCount} learners` : ''}`
      : 'Not linked to its learners — pick its Zoho batch in the red box below',
  });
  const ready = checks.filter((c) => c.required).every((c) => c.state !== 'bad');
  return { checks, ready };
}

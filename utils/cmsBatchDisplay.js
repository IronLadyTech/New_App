import { addCalendarDays } from './lepBatchSchedule';
import { zohoLepBatchKeyFromDay1 } from './lepDeskBatchDate';

const DOW = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const MON = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

function parseLocal(isoDate) {
  const [y, m, d] = String(isoDate).split('-').map(Number);
  return new Date(y, m - 1, d);
}

function fmtDay(d) {
  return `${DOW[d.getDay()]} ${d.getDate()} ${MON[d.getMonth()]}`;
}

const HOURS = 'Two full days · 9:00 AM – 7:00 PM IST';
const SLOT = '9:00 AM – 7:00 PM IST';

/** Map Firestore `cms_batches` doc → Choose batch screen card. */
export function cmsBatchToSignupCard(batch) {
  const day1 = parseLocal(batch.day1Date);
  const day2 = parseLocal(addCalendarDays(batch.day1Date, 1));
  const grad = parseLocal(addCalendarDays(batch.day1Date, 28));
  return {
    id: batch.id,
    cmsBatchId: batch.id,
    title: `${fmtDay(day1)} – ${fmtDay(day2)}`,
    hours: HOURS,
    weeks: batch.weeksLabel || `Then weekly sessions until ${fmtDay(grad)}`,
    day1: `${fmtDay(day1)} · ${SLOT}`,
    day2: `${fmtDay(day2)} · ${SLOT}`,
    filling: batch.filling === true,
    name: batch.name,
    orientationDate: batch.orientationDate,
    day1Date: batch.day1Date,
    zohoBatchKey: batch.zohoBatchKey || zohoLepBatchKeyFromDay1(batch.day1Date),
  };
}

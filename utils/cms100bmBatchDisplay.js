import { inferProgramStartFromZohoRaw } from './programStartDate';
import { bmCohortEndFromStart, bmZohoBatchKeyFromStart } from './bmCohortDates';

const DOW = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const MON = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

function parseLocal(isoDate) {
  const [y, m, d] = String(isoDate).split('-').map(Number);
  return new Date(y, m - 1, d);
}

function fmtDay(d) {
  return `${DOW[d.getDay()]} ${d.getDate()} ${MON[d.getMonth()]} ${d.getFullYear()}`;
}

/** Map Firestore `cms_batches` (100BM) → cohort confirm card. */
export function cms100bmBatchToCard(batch) {
  const startDate =
    String(batch.startDate || '').slice(0, 10) ||
    inferProgramStartFromZohoRaw(batch.zohoBatchKey || batch.zohoRawBatch || batch.name);
  if (!startDate) return null;
  const endDate = bmCohortEndFromStart(startDate);
  const start = parseLocal(startDate);
  const end = parseLocal(endDate);
  const zohoBatchKey =
    String(batch.zohoBatchKey || batch.zohoRawBatch || '').trim() ||
    bmZohoBatchKeyFromStart(startDate);
  return {
    id: batch.id,
    cmsBatchId: batch.id,
    startDate,
    endDate,
    zohoBatchKey,
    title: batch.name || `${fmtDay(start)} cohort`,
    subtitle: `6 months · through ${fmtDay(end)}`,
    filling: batch.filling === true,
  };
}

import { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { CMS } from '../constants/cms';
import { fetchPublishedCmsList } from '../services/cms';
import { inAudience } from '../utils/learnerSegment';

// Practice items by their practiceId ("cms-<doc id>"), so the Practice screen can open
// one from any entry point without fetching again.
const practiceById = new Map();

export function cmsPracticeItem(practiceId) {
  return practiceById.get(practiceId) || null;
}

/** Items CX published for this learner: her program, her batch or the whole program, her audience. */
function forLearner(rows, { profile, batch, programId }) {
  return rows.filter(
    (r) =>
      r.published !== false &&
      (!r.batchId || r.batchId === batch?.id) &&
      inAudience(r.audience, profile, batch, programId)
  );
}

function useCmsList(collectionName, programId, cmsBatch) {
  const { profile } = useAuth();
  const [rows, setRows] = useState([]);
  useEffect(() => {
    let alive = true;
    fetchPublishedCmsList(collectionName, programId)
      .then((list) => alive && setRows(list))
      .catch(() => alive && setRows([]));
    return () => {
      alive = false;
    };
  }, [collectionName, programId, cmsBatch?.id]);
  return forLearner(rows, { profile, batch: cmsBatch, programId });
}

/** Engage posts (events, announcements, videos, highlights) for the signed-in learner. */
export function useCmsEngagePosts(programId, cmsBatch) {
  return useCmsList(CMS.ENGAGE, programId, cmsBatch);
}

function onToday(item, todayIso) {
  if (item.from && todayIso < String(item.from).slice(0, 10)) return false;
  if (item.to && todayIso > String(item.to).slice(0, 10)) return false;
  if (item.days === 'weekdays') {
    const wd = new Date(`${todayIso}T12:00:00`).getDay();
    if (wd === 0 || wd === 6) return false;
  }
  return true;
}

/**
 * Today's CMS practice items as daily practice rows. Each resets daily, like the
 * built-in rituals, and opens the Practice screen with its steps and video.
 */
export function useCmsPracticeRows(programId, cmsBatch, todayIso) {
  const items = useCmsList(CMS.PRACTICE, programId, cmsBatch);
  return items
    .filter((item) => onToday(item, todayIso))
    .map((item) => {
      const practiceId = `cms-${item.id}`;
      practiceById.set(practiceId, item);
      return {
        programId,
        id: practiceId,
        title: item.title,
        meta: item.how || 'Daily practice',
        practiceId,
        dailyReset: true,
      };
    });
}

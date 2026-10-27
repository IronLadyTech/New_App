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

/**
 * Session recordings CX added for this batch (CMS → Sessions & recordings), as
 * { [sessionCode]: { url, title } } — the newest one wins when a link was replaced.
 */
export function useCmsSessionRecordings(programId, cmsBatch) {
  const [rows, setRows] = useState([]);
  useEffect(() => {
    let alive = true;
    if (!cmsBatch?.id) {
      setRows([]);
      return undefined;
    }
    // The CMS saves recordings under 'LEP' / '100BM' / 'MBW'.
    const program = { lep: 'LEP', '100bm': '100BM', mbw: 'MBW' }[programId] || programId;
    fetchPublishedCmsList(CMS.CONTENT, program)
      .then((list) => alive && setRows(list))
      .catch(() => alive && setRows([]));
    return () => {
      alive = false;
    };
  }, [programId, cmsBatch?.id]);
  const out = {};
  rows
    .filter((r) => r.library === 'session' && r.sessionCode && r.url && r.batchId === cmsBatch?.id)
    .sort((a, b) => stampMs(a.createdAt) - stampMs(b.createdAt))
    .forEach((r) => {
      out[r.sessionCode] = { url: r.url, title: r.title || 'Session recording' };
    });
  return out;
}

function stampMs(v) {
  if (!v) return 0;
  if (typeof v.toMillis === 'function') return v.toMillis();
  if (typeof v.seconds === 'number') return v.seconds * 1000;
  return Date.parse(v) || 0;
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

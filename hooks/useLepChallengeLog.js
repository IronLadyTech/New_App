import { useCallback, useMemo, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { usePrograms } from '../context/ProgramsContext';
import { saveProgramSubmission } from '../services/programs';
import { learnerBatchId } from '../utils/programAccess';
import { LEP_CHALLENGE_LOG_TASK_ID } from '../utils/lepChallenges';

function mergeNested(server = {}, local = {}) {
  const out = { ...server };
  Object.keys(local).forEach((k) => {
    out[k] = { ...(server[k] || {}) };
    Object.keys(local[k]).forEach((d) => {
      const s = server[k]?.[d];
      const l = local[k][d];
      out[k][d] = s && typeof s === 'object' && l && typeof l === 'object' ? { ...s, ...l } : l;
    });
  });
  return out;
}

/**
 * Her daily challenge entries, saved online so coaches see them in Batch Hub.
 * Shown at once on the phone, then confirmed by the live submission row.
 */
export function useLepChallengeLog() {
  const { user, profile } = useAuth();
  const { getTaskSubmission } = usePrograms();
  const sub = getTaskSubmission('lep', LEP_CHALLENGE_LOG_TASK_ID);
  const [local, setLocal] = useState({ days: {}, once: {} });

  const log = useMemo(
    () => ({
      days: mergeNested(sub?.challengeDays || {}, local.days),
      once: mergeNested(sub?.challengeOnce || {}, local.once),
    }),
    [sub, local]
  );

  const write = useCallback(
    async (payload) => {
      if (!user?.uid || user.uid === 'preview') return;
      await saveProgramSubmission({
        programId: 'lep',
        userId: user.uid,
        taskId: LEP_CHALLENGE_LOG_TASK_ID,
        payload: { type: 'log', status: 'unlocked', ...payload },
        batchId: learnerBatchId(profile, 'lep'),
        previousSubmission: sub,
      });
    },
    [user?.uid, profile, sub]
  );

  /** Save one day's item, e.g. saveDay('c1', '2026-11-26', { mirror: 'text' }). */
  const saveDay = useCallback(
    (key, iso, patch) => {
      setLocal((l) => ({ ...l, days: mergeNested(l.days, { [key]: { [iso]: patch } }) }));
      return write({ challengeDays: { [key]: { [iso]: patch } } });
    },
    [write]
  );

  /** Save a once-a-week item, e.g. saveOnce('c2', 'profile', 'https://…'). */
  const saveOnce = useCallback(
    (key, id, value) => {
      setLocal((l) => ({ ...l, once: mergeNested(l.once, { [key]: { [id]: value } }) }));
      return write({ challengeOnce: { [key]: { [id]: value } } });
    },
    [write]
  );

  return { log, saveDay, saveOnce };
}

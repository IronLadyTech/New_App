import { useEffect, useMemo, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { subscribeToBatches } from '../services/cms';
import { resolveLearnerCmsBatch } from '../utils/resolveLearnerCmsBatch';

/**
 * Live `cms_batches` doc for the signed-in learner’s LEP cohort (if resolvable).
 */
export function useLearnerCmsBatch(programId = 'lep') {
  const { user, profile } = useAuth();
  // Real profiles are `{ id, ...userDoc }` and often carry no `uid` field — use the
  // signed-in account, so the batch (and CX's calendar changes) always loads.
  const uid = user?.uid || profile?.uid || profile?.id || null;
  const [batches, setBatches] = useState([]);
  const [error, setError] = useState(false);

  useEffect(() => {
    if (!uid || !profile) {
      setBatches([]);
      setError(false);
      return undefined;
    }
    return subscribeToBatches(
      (rows) => {
        setBatches(rows);
        setError(false);
      },
      (err) => {
        setBatches([]);
        setError(err?.code || true);
      }
    );
  }, [uid, Boolean(profile)]);

  const batch = useMemo(
    () => resolveLearnerCmsBatch(batches, { profile, programId }),
    [batches, profile, programId]
  );

  useEffect(() => {
    if (!__DEV__ || !uid) return;
    const lep = profile?.programAccess?.[programId] || {};
    const s0 = (batch?.sessions || []).find((s) => s.code === 'S0');
    console.log('[cmsBatch]', JSON.stringify({
      readError: error,
      batchesRead: batches.length,
      matched: batch ? `${batch.id} · ${batch.name} · day1 ${batch.day1Date}` : null,
      orientation: s0 ? `${s0.date} ${s0.startTime}${s0.custom ? ' (moved by CX)' : ''}` : null,
      learner: {
        batchId: lep.batchId || null,
        cmsBatchId: lep.cmsBatchId || profile?.cmsBatchId || null,
        zohoRawBatch: lep.zohoRawBatch || null,
        leadBatch: profile?.LEP_Batch || null,
        leadStart: profile?.LEP_Reg_Date || null,
      },
    }));
  }, [uid, error, batches.length, batch, profile, programId]);

  return { batch, batches, loading: Boolean(uid) && !batches.length && !error, error };
}

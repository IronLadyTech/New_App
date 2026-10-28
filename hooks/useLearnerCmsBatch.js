import { useEffect, useMemo, useState, useSyncExternalStore } from 'react';
import { useAuth } from '../context/AuthContext';
import { subscribeToBatches } from '../services/cms';
import { resolveLearnerCmsBatch } from '../utils/resolveLearnerCmsBatch';

/** One Firestore listener for all mounted screens — avoids duplicate subs + re-render storms. */
let sharedBatches = [];
let sharedError = false;
let sharedVersion = 0;
let sharedUnsub = null;
const sharedListeners = new Set();

function emitShared() {
  sharedVersion += 1;
  sharedListeners.forEach((fn) => fn());
}

function startSharedSubscription() {
  if (sharedUnsub) return;
  sharedUnsub = subscribeToBatches(
    (rows) => {
      sharedBatches = rows;
      sharedError = false;
      emitShared();
    },
    (err) => {
      sharedBatches = [];
      sharedError = err?.code || true;
      emitShared();
    }
  );
}

function stopSharedSubscriptionIfIdle() {
  if (sharedListeners.size > 0 || !sharedUnsub) return;
  sharedUnsub();
  sharedUnsub = null;
}

function subscribeShared(onStoreChange) {
  sharedListeners.add(onStoreChange);
  startSharedSubscription();
  return () => {
    sharedListeners.delete(onStoreChange);
    stopSharedSubscriptionIfIdle();
  };
}

function getSharedSnapshot() {
  return sharedVersion;
}

function useSharedBatchRows(active) {
  useSyncExternalStore(subscribeShared, getSharedSnapshot, () => 0);
  if (!active) {
    return { batches: [], error: false, loading: false };
  }
  return {
    batches: sharedBatches,
    error: sharedError,
    loading: sharedVersion === 0 && !sharedError,
  };
}

/**
 * Live `cms_batches` doc for the signed-in learner’s LEP cohort (if resolvable).
 */
export function useLearnerCmsBatch(programId = 'lep') {
  const { user, profile } = useAuth();
  const uid = user?.uid || profile?.uid || profile?.id || null;
  const active = Boolean(uid && profile);

  const { batches, error, loading } = useSharedBatchRows(active);

  const batch = useMemo(
    () => (active ? resolveLearnerCmsBatch(batches, { profile, programId }) : null),
    [active, batches, profile, programId]
  );

  const batchKey = batch?.id || '';
  const profileKey = profile?.id || profile?.uid || uid || '';

  useEffect(() => {
    if (!__DEV__ || !active) return;
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
  }, [active, error, batches.length, batchKey, profileKey, programId]);

  return { batch, batches, loading: active && loading, error };
}

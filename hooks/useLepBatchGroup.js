import { useEffect, useState } from 'react';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../services/firebase';
import { learnerBatchId } from '../utils/programAccess';

/** Firestore `groups/{batchId}` for the signed-in LEP learner (roster size, Zoho range, optional WA link). */
export function useLepBatchGroup(profile, programId = 'lep') {
  const batchId = learnerBatchId(profile, programId);
  const id = batchId && batchId !== 'default' && /^[A-Za-z0-9_-]+$/.test(batchId) ? batchId : null;
  const [group, setGroup] = useState(null);

  useEffect(() => {
    if (!id) {
      setGroup(null);
      return undefined;
    }
    let cancelled = false;
    getDoc(doc(db, 'groups', id))
      .then((snap) => {
        if (!cancelled) setGroup(snap.exists() ? { id: snap.id, ...snap.data() } : null);
      })
      .catch(() => {
        if (!cancelled) setGroup(null);
      });
    return () => {
      cancelled = true;
    };
  }, [id]);

  return group;
}

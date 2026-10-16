import { useEffect, useMemo, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { subscribeToBatches } from '../services/cms';
import { resolveLearnerCmsBatch } from '../utils/resolveLearnerCmsBatch';

/**
 * Live `cms_batches` doc for the signed-in learner’s LEP cohort (if resolvable).
 */
export function useLearnerCmsBatch(programId = 'lep') {
  const { profile } = useAuth();
  const [batches, setBatches] = useState([]);
  const [error, setError] = useState(false);

  useEffect(() => {
    if (!profile?.uid) {
      setBatches([]);
      setError(false);
      return undefined;
    }
    return subscribeToBatches(
      (rows) => {
        setBatches(rows);
        setError(false);
      },
      () => {
        setBatches([]);
        setError(true);
      }
    );
  }, [profile?.uid]);

  const batch = useMemo(
    () => resolveLearnerCmsBatch(batches, { profile, programId }),
    [batches, profile, programId]
  );

  return { batch, batches, loading: Boolean(profile?.uid) && !batches.length && !error, error };
}

import { useMemo } from 'react';
import { useLearnerCmsBatch } from './useLearnerCmsBatch';
import { phaseFlowFromBatch } from '../utils/phaseUnlock';
import { lepFlowContextFromBatch } from '../utils/lepFlowGates';
import { todayIsoIST } from '../utils/lepDailyPractice';
import { useAuth } from '../context/AuthContext';
import { resolveLepDay1Iso } from '../utils/lepEnrolledCohortPhase';

/** Dates + CX overrides from the learner's batch, for isPhaseOpen / currentPhaseId. */
export function useProgramPhaseFlow(programId) {
  const { batch } = useLearnerCmsBatch(programId);
  const { profile } = useAuth();
  const today = todayIsoIST();
  const ownDay1 = programId === 'lep' ? resolveLepDay1Iso(profile, batch) : null;
  return useMemo(
    () =>
      programId === 'lep'
        ? { ...lepFlowContextFromBatch({ cmsBatch: batch, day1Iso: ownDay1 }), todayIso: today }
        : phaseFlowFromBatch(programId, batch, today),
    [programId, batch, today, ownDay1]
  );
}

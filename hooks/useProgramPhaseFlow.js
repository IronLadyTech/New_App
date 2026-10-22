import { useMemo } from 'react';
import { useLearnerCmsBatch } from './useLearnerCmsBatch';
import { phaseFlowFromBatch } from '../utils/phaseUnlock';
import { lepFlowContextFromBatch } from '../utils/lepFlowGates';
import { todayIsoIST } from '../utils/lepDailyPractice';

/** Dates + CX overrides from the learner's batch, for isPhaseOpen / currentPhaseId. */
export function useProgramPhaseFlow(programId) {
  const { batch } = useLearnerCmsBatch(programId);
  const today = todayIsoIST();
  return useMemo(
    () =>
      programId === 'lep'
        ? { ...lepFlowContextFromBatch({ cmsBatch: batch }), todayIso: today }
        : phaseFlowFromBatch(programId, batch, today),
    [programId, batch, today]
  );
}

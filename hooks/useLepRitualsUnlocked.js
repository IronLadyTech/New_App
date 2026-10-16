import { useMemo } from 'react';
import { todayIsoIST } from '../utils/lepDailyPractice';
import { isLepRitualsUnlocked, lepRitualsUnlockIso, resolveLepDay1Iso } from '../utils/lepRitualsUnlock';

export function useLepRitualsUnlocked({ cmsBatch, group, zohoRawBatch } = {}) {
  const today = todayIsoIST();
  const day1Iso = useMemo(
    () => resolveLepDay1Iso({ cmsBatch, group, zohoRawBatch }),
    [cmsBatch?.day1Date, group?.zohoRawBatch, zohoRawBatch]
  );
  const unlockIso = useMemo(() => lepRitualsUnlockIso(day1Iso), [day1Iso]);
  const unlocked = useMemo(() => isLepRitualsUnlocked(today, day1Iso), [today, day1Iso]);
  return { unlocked, day1Iso, unlockIso };
}

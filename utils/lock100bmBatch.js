import { Alert } from 'react-native';
import { updateUserProfile } from '../services/firestore';
import { BATCH_ZOHO_SAVE_TIMEOUT_MS, confirm100bmCohort } from '../services/functions';
import { batchZohoFeedback } from './participantSyncMessage';
import { bmZohoBatchKeyFromStart, bmCohortEndFromStart } from './bmCohortDates';

/**
 * After 100BM balance payment: persist cohort start on profile + Zoho Lead (payment + BM_Batch).
 */
export async function lock100bmBatchChoice({ user, profile, patchProfile, picked, silent = false }) {
  const startDate =
    String(picked?.startDate || '').slice(0, 10) ||
    (String(picked?.id || '').match(/(\d{4}-\d{2}-\d{2})/) || [])[1] ||
    '';
  if (!startDate) return null;

  const cmsBatchId = picked?.cmsBatchId || picked?.id || null;
  const endDate = String(picked?.endDate || '').slice(0, 10) || bmCohortEndFromStart(startDate);
  const zohoBatchKey =
    String(picked?.zohoBatchKey || '').trim() || bmZohoBatchKeyFromStart(startDate);
  const batchName =
    String(picked?.title || picked?.name || '').trim() || zohoBatchKey;

  let zoho = null;
  if (!user?.uid || user.uid === 'preview') {
    return { startDate, endDate, cmsBatchId, zohoBatchKey, batchName, zoho: null };
  }

  try {
    zoho = await confirm100bmCohort(
      {
        startDate,
        ...(cmsBatchId ? { cmsBatchId } : {}),
        batchName,
      },
      { timeoutMs: BATCH_ZOHO_SAVE_TIMEOUT_MS }
    );
    if (!zoho?.ok) {
      throw new Error(zoho?.reason || 'Could not confirm your cohort');
    }
  } catch (err) {
    if (!silent) {
      Alert.alert('Cohort not saved', err?.message || 'Try again in a moment.');
    }
    throw err;
  }

  const bm = profile?.programAccess?.['100bm'] || {};
  const confirmedStart = zoho.startDate || startDate;
  const confirmedEnd = zoho.endDate || endDate;
  const confirmedBatch = zoho.zohoBatchKey || zohoBatchKey;
  const next = {
    programAccess: {
      ...(profile?.programAccess || {}),
      '100bm': {
        ...bm,
        startDate: confirmedStart,
        endDate: confirmedEnd,
        zohoBatchKey: confirmedBatch,
        zohoRawBatch: confirmedBatch,
        batchName,
        ...(cmsBatchId ? { cmsBatchId, batchId: cmsBatchId } : {}),
        cohortConfirmedAt: new Date().toISOString(),
      },
    },
    zohoLead: {
      ...(profile?.zohoLead || {}),
      ...(confirmedBatch ? { BM_Batch: confirmedBatch } : {}),
      ...(confirmedStart ? { BM_Reg_Date1: confirmedStart } : {}),
      ...(confirmedEnd ? { BM_End_Date: confirmedEnd } : {}),
      id: profile?.zohoLeadId || profile?.leadId || profile?.zohoLead?.id || null,
    },
  };

  patchProfile?.(next);
  try {
    await updateUserProfile(user.uid, next);
  } catch (err) {
    if (__DEV__) console.warn('[lock100bmBatch] Firestore', err?.message || err);
  }

  if (zoho?.zohoLeadId) {
    const leadPatch = {
      zohoLeadId: zoho.zohoLeadId,
      zohoLead: { ...(next.zohoLead || {}), id: zoho.zohoLeadId },
    };
    patchProfile?.(leadPatch);
    await updateUserProfile(user.uid, leadPatch).catch(() => {});
  }

  if (!silent) {
    const { message, showAlert } = batchZohoFeedback(zoho);
    if (showAlert && message) Alert.alert('Cohort confirmed', message);
  }

  return {
    startDate: confirmedStart,
    endDate: confirmedEnd,
    cmsBatchId,
    zohoBatchKey: confirmedBatch,
    batchName,
    zoho,
  };
}

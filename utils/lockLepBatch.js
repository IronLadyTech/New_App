import { Alert } from 'react-native';
import { updateUserProfile } from '../services/firestore';
import { BATCH_ZOHO_SAVE_TIMEOUT_MS, saveWelcomeProfileFields } from '../services/functions';
import { batchZohoFeedback } from './participantSyncMessage';
import {
  formatZohoLepBatchLabel,
  lepZohoCohortEndFromDay1,
  lepZohoCohortStartFromDay1,
  zohoLepBatchKeyFromDay1,
} from './lepDeskBatchDate';
import { orientationFromDay1Saturday } from './lepBatchSchedule';

/**
 * Persist batch choice on the app profile and push Zoho `LEP_Batch`
 * (Day 1 Sat → +1 month, e.g. `24/10/2026 - 24/11/2026`).
 */
export async function lockLepBatchChoice({ user, profile, patchProfile, picked, silent = false }) {
  const day1Date =
    String(picked?.day1Date || '').slice(0, 10) ||
    (String(picked?.id || '').match(/(\d{4}-\d{2}-\d{2})/) || [])[1] ||
    '';
  if (!day1Date) return null;

  const cmsBatchId = picked?.cmsBatchId || (picked?.id && picked?.day1Date ? picked.id : null) || null;
  const zohoBatchKey =
    String(picked?.zohoBatchKey || '').trim() || zohoLepBatchKeyFromDay1(day1Date);
  const batchName =
    formatZohoLepBatchLabel(zohoBatchKey) ||
    String(picked?.name || picked?.title || '').trim() ||
    zohoBatchKey;
  const orientationDate =
    String(picked?.orientationDate || '').slice(0, 10) || orientationFromDay1Saturday(day1Date);
  const zohoCohortStart = lepZohoCohortStartFromDay1(day1Date);
  const zohoCohortEnd = lepZohoCohortEndFromDay1(day1Date);

  const lep = profile?.programAccess?.lep || {};
  const next = {
    cmsBatchId: cmsBatchId || profile?.cmsBatchId || undefined,
    programAccess: {
      ...(profile?.programAccess || {}),
      lep: {
        ...lep,
        ...(cmsBatchId ? { cmsBatchId, batchId: cmsBatchId } : {}),
        zohoBatchKey,
        zohoRawBatch: zohoBatchKey,
        batchName,
        day1Date,
        orientationDate,
        ...(zohoCohortStart ? { zohoCohortStart } : {}),
        ...(zohoCohortEnd ? { endDate: zohoCohortEnd } : {}),
      },
    },
    zohoLead: {
      ...(profile?.zohoLead || {}),
      ...(zohoBatchKey ? { LEP_Batch: zohoBatchKey } : {}),
      ...(zohoCohortStart ? { LEP_Reg_Date: zohoCohortStart } : {}),
      ...(zohoCohortEnd ? { LEP_End_Date: zohoCohortEnd } : {}),
      id: profile?.zohoLeadId || profile?.leadId || profile?.zohoLead?.id || null,
    },
  };

  patchProfile?.(next);

  let zoho = null;
  if (user?.uid && user.uid !== 'preview') {
    try {
      await updateUserProfile(user.uid, next);
    } catch (err) {
      if (__DEV__) console.warn('[lockLepBatch] Firestore', err?.message || err);
    }
    try {
      zoho = await saveWelcomeProfileFields(
        {
          day1Date,
          ...(cmsBatchId ? { cmsBatchId } : {}),
        },
        { timeoutMs: BATCH_ZOHO_SAVE_TIMEOUT_MS }
      );
      if (__DEV__) {
        console.warn('[lockLepBatch] Zoho', zoho?.zoho ? 'ok' : zoho?.reasonCode || 'pending', zohoBatchKey);
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
        if (showAlert && message) Alert.alert('Batch saved', message);
      }
    } catch (err) {
      if (!silent) {
        const { message, showAlert } = batchZohoFeedback(null, err);
        if (showAlert && message) Alert.alert('Batch saved', message);
      }
      zoho = { ok: false, zoho: false, reason: err?.message };
    }
  }

  return { day1Date, cmsBatchId, zohoBatchKey, batchName, zoho };
}

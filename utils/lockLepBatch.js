import { Alert } from 'react-native';
import { updateUserProfile } from '../services/firestore';
import { formatCallableError, updateMyWelcomeProfile } from '../services/functions';
import {
  formatZohoLepBatchLabel,
  zohoLepBatchKeyFromDay1,
} from './lepDeskBatchDate';
import { orientationFromDay1Saturday } from './lepBatchSchedule';

/**
 * Persist batch choice on the app profile and push Zoho `LEP_Batch`
 * (Wed before Day 1 Sat → +1 month).
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
      },
    },
  };

  patchProfile?.(next);

  let zoho = null;
  if (user?.uid && user.uid !== 'preview') {
    await updateUserProfile(user.uid, next).catch(() => {});
    try {
      // Server matches Lead by email, phone, or zohoLeadId — lepBatch → Zoho LEP_Batch.
      zoho = await updateMyWelcomeProfile({
        lepBatch: zohoBatchKey,
        day1Date,
        ...(cmsBatchId ? { cmsBatchId } : {}),
      });
      if (zoho?.zohoLeadId) {
        patchProfile?.({ zohoLeadId: zoho.zohoLeadId });
        await updateUserProfile(user.uid, { zohoLeadId: zoho.zohoLeadId }).catch(() => {});
      }
      if (zoho?.zoho === true && !silent) {
        // Quiet success — profile + Zoho both updated.
      } else if (zoho && zoho.zoho === false && !silent) {
        Alert.alert(
          'Not synced to Zoho',
          [
            'Your batch is saved in the app only.',
            'Zoho LEP_Batch was NOT updated.',
            zoho.reason ? `\n${zoho.reason}` : '',
            '\nTap Change batch date and try again, or check the Lead phone/email matches this login.',
          ].join('\n')
        );
      }
    } catch (err) {
      if (!silent) {
        Alert.alert(
          'Not synced to Zoho',
          [
            'Your batch is saved in the app only.',
            'Zoho LEP_Batch was NOT updated.',
            `\n${formatCallableError(err, 'Could not reach Zoho. Try again in a moment.')}`,
          ].join('\n')
        );
      }
      zoho = { ok: false, zoho: false, reason: err?.message };
    }
  }

  return { day1Date, cmsBatchId, zohoBatchKey, batchName, zoho };
}

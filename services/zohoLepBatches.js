/**
 * Zoho Leads → unique LEP_Batch values (same source as LEP Delivery Desk).
 * Requires deployed Cloud Function `cmsListLepBatchesFromZoho` on lmsironlady.
 */
import { httpsCallable } from 'firebase/functions';
import { functions } from './firebase';

export async function fetchZohoLepBatchKeys() {
  const { data } = await httpsCallable(functions, 'cmsListLepBatchesFromZoho')({});
  if (!data?.ok) {
    throw new Error(data?.reason || 'Could not load batches from Zoho.');
  }
  return Array.isArray(data.batches) ? data.batches : [];
}

/**
 * Admin CMS data: notification events, content library, config docs.
 * Writes are allowed only for CMS_EDIT_ROLES by Firestore / Storage rules.
 */
import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  getDoc,
  getDocs,
  onSnapshot,
  orderBy,
  query,
  serverTimestamp,
  setDoc,
  writeBatch,
} from 'firebase/firestore';
import { deleteObject, getDownloadURL, ref, uploadBytesResumable } from 'firebase/storage';
import { auth, db, storage } from './firebase';
import { CMS, CMS_QA_BATCH_ID } from '../constants/cms';
import {
  cmsBatchNameFromGroup,
  formatZohoLepBatchLabel,
  inferLepDay1FromGroup,
  inferLepDay1FromZohoRaw,
} from '../utils/lepDeskBatchDate';
import { buildLepBatchSessions, orientationFromDay1Saturday } from '../utils/lepBatchSchedule';

function stamp() {
  return { updatedAt: serverTimestamp(), updatedBy: auth.currentUser?.email || auth.currentUser?.uid || null };
}

// ---------- Notification events ----------

export function subscribeToEvents(onData, onError) {
  const q = query(collection(db, CMS.EVENTS), orderBy('code'));
  return onSnapshot(
    q,
    (snap) => onData(snap.docs.map((d) => ({ id: d.id, ...d.data() }))),
    onError
  );
}

export async function saveEvent(event) {
  const { id, ...data } = event;
  if (id) {
    await setDoc(doc(db, CMS.EVENTS, id), { ...data, ...stamp() }, { merge: true });
    return id;
  }
  const created = await addDoc(collection(db, CMS.EVENTS), {
    ...data,
    ...stamp(),
    createdAt: serverTimestamp(),
  });
  return created.id;
}

export function deleteEvent(id) {
  return deleteDoc(doc(db, CMS.EVENTS, id));
}

/** Writes defaults keyed by code; skips codes that already exist so edits are kept. */
export async function seedEvents(defaults, existingCodes = []) {
  const have = new Set(existingCodes);
  const batch = writeBatch(db);
  let added = 0;
  defaults.forEach((e) => {
    if (have.has(e.code)) return;
    const id = `${e.program || 'ALL'}_${e.code}`.replace(/[^A-Za-z0-9_-]/g, '_');
    batch.set(doc(db, CMS.EVENTS, id), { ...e, ...stamp(), createdAt: serverTimestamp() });
    added += 1;
  });
  if (added) await batch.commit();
  return added;
}

// ---------- Config docs (ilGuide, notificationPolicy) ----------

export function subscribeToConfig(name, onData, onError) {
  return onSnapshot(
    doc(db, CMS.CONFIG, name),
    (snap) => onData(snap.exists() ? snap.data() : null),
    onError
  );
}

export async function getConfig(name) {
  const snap = await getDoc(doc(db, CMS.CONFIG, name));
  return snap.exists() ? snap.data() : null;
}

export function saveConfig(name, data) {
  return setDoc(doc(db, CMS.CONFIG, name), { ...data, ...stamp() }, { merge: true });
}

// ---------- Content library ----------

export function subscribeToContent(onData, onError) {
  const q = query(collection(db, CMS.CONTENT), orderBy('createdAt', 'desc'));
  return onSnapshot(
    q,
    (snap) => onData(snap.docs.map((d) => ({ id: d.id, ...d.data() }))),
    onError
  );
}

const CMS_PROGRAM_FOR_APP = { lep: 'LEP', '100bm': '100BM', mbw: 'MBW' };

/** Excel / CEM codes and app task slugs that refer to the same learner task. */
const CMS_TASK_MATCH_KEYS = {
  'lep-orientation-schedule': ['lep-orientation-schedule', 't12'],
};

function matchKeysForAppTask(taskId) {
  const slug = String(taskId || '').trim().toLowerCase();
  if (!slug) return new Set();
  const extra = CMS_TASK_MATCH_KEYS[slug] || [];
  return new Set([slug, ...extra.map((k) => String(k).toLowerCase())]);
}

function linkedTaskIdsFromRow(row) {
  const raw = row?.linkedTaskIds;
  if (Array.isArray(raw)) return raw.map((x) => String(x).trim()).filter(Boolean);
  if (typeof raw === 'string') {
    return raw
      .split(',')
      .map((s) => s.trim())
      .filter(Boolean);
  }
  return [];
}

function cmsRowIsLive(row) {
  return row?.published !== false;
}

/** Published CMS files linked to a learner task (linkedTaskIds = T12 or lep-orientation-schedule). */
export async function fetchPublishedCmsForTask(programId, taskId) {
  const wantKeys = matchKeysForAppTask(taskId);
  if (!wantKeys.size) return [];

  const cmsProgram = CMS_PROGRAM_FOR_APP[programId] || String(programId || '').toUpperCase();
  // No published filter in the query — rules return live rows only; includes legacy docs without `published`.
  const snap = await getDocs(collection(db, CMS.CONTENT));

  return snap.docs
    .map((d) => ({ id: d.id, ...d.data() }))
    .filter((row) => {
      if (!cmsRowIsLive(row)) return false;
      if (row.program !== 'ALL' && row.program !== cmsProgram) return false;
      const ids = linkedTaskIdsFromRow(row).map((x) => x.toLowerCase());
      return ids.some((id) => wantKeys.has(id));
    });
}

function typeFromMime(mime = '') {
  if (mime.startsWith('video/')) return 'video';
  if (mime.startsWith('image/')) return 'image';
  if (mime.startsWith('audio/')) return 'audio';
  if (mime === 'application/pdf') return 'pdf';
  return 'file';
}

/**
 * Upload a browser File to Storage under cms/{program}/ and create its content doc.
 * onProgress receives 0–1.
 */
export function uploadContentFile(file, meta, onProgress) {
  const safe = file.name.replace(/[^A-Za-z0-9._-]/g, '_');
  const path = `cms/${meta.program || 'ALL'}/${Date.now()}_${safe}`;
  const task = uploadBytesResumable(ref(storage, path), file, { contentType: file.type });
  return new Promise((resolve, reject) => {
    task.on(
      'state_changed',
      (s) => onProgress?.(s.totalBytes ? s.bytesTransferred / s.totalBytes : 0),
      reject,
      async () => {
        try {
          const url = await getDownloadURL(task.snapshot.ref);
          const created = await addDoc(collection(db, CMS.CONTENT), {
            title: meta.title || file.name,
            type: meta.type || typeFromMime(file.type),
            program: meta.program || 'ALL',
            library: meta.library || 'task',
            assetKey: meta.assetKey || '',
            batchId: meta.batchId || null,
            sessionCode: meta.sessionCode || '',
            tags: meta.tags || [],
            linkedTaskIds: meta.linkedTaskIds || [],
            description: meta.description || '',
            url,
            storagePath: path,
            mimeType: file.type,
            size: file.size,
            published: true,
            ...stamp(),
            createdAt: serverTimestamp(),
          });
          resolve(created.id);
        } catch (e) {
          reject(e);
        }
      }
    );
  });
}

/** Links and text blocks — no file. */
export async function addContentEntry(meta) {
  const created = await addDoc(collection(db, CMS.CONTENT), {
    title: meta.title,
    type: meta.type,
    program: meta.program || 'ALL',
    library: meta.library || 'task',
    assetKey: meta.assetKey || '',
    batchId: meta.batchId || null,
    sessionCode: meta.sessionCode || '',
    tags: meta.tags || [],
    linkedTaskIds: meta.linkedTaskIds || [],
    description: meta.description || '',
    url: meta.url || '',
    body: meta.body || '',
    published: true,
    ...stamp(),
    createdAt: serverTimestamp(),
  });
  return created.id;
}

export function updateContent(id, data) {
  return setDoc(doc(db, CMS.CONTENT, id), { ...data, ...stamp() }, { merge: true });
}

// ---------- LEP batch calendars (session dates per batch) ----------

function sortBatches(rows) {
  return [...rows].sort((a, b) => String(b.day1Date || '').localeCompare(String(a.day1Date || '')));
}

/** Full collection listen — avoids missing docs without `day1Date` (orderBy would exclude them). */
export function subscribeToBatches(onData, onError) {
  return onSnapshot(
    collection(db, CMS.BATCHES),
    (snap) => onData(sortBatches(snap.docs.map((d) => ({ id: d.id, ...d.data() })))),
    onError
  );
}

export async function saveBatch(batch) {
  const { id, ...data } = batch;
  const payload = {
    ...data,
    program: data.program || 'LEP',
    openForEnrollment: data.openForEnrollment !== false,
    ...stamp(),
  };
  if (data.status !== undefined) payload.status = data.status || 'draft';
  if (data.automationEnabled !== undefined) payload.automationEnabled = data.automationEnabled === true;
  if (id) {
    await setDoc(doc(db, CMS.BATCHES, id), payload, { merge: true });
    return id;
  }
  const created = await addDoc(collection(db, CMS.BATCHES), {
    ...payload,
    createdAt: serverTimestamp(),
  });
  return created.id;
}

export function deleteBatch(id) {
  return deleteDoc(doc(db, CMS.BATCHES, id));
}

/**
 * Live LEP batch + phone seat for app QA (no CRM). Staff only (Firestore rules).
 * @param {string} phoneLocal10 — 10-digit Indian mobile (no +91)
 */
export async function ensureCmsQaTestPack(phoneLocal10, displayName = 'CMS QA') {
  const phone10 = String(phoneLocal10 || '').replace(/\D/g, '').slice(-10);
  if (phone10.length !== 10) {
    throw new Error('Enter a 10-digit mobile number (e.g. 8309882198).');
  }

  const day1Date = '2026-10-17';
  const orientationDate = '2026-10-15';
  const sessions = buildLepBatchSessions({
    anchor: 'day1',
    date: day1Date,
    joinLinks: { S0: 'https://zoom.us/j/cms-qa-orientation', S1: 'https://zoom.us/j/cms-qa-day1' },
  });

  await setDoc(
    doc(db, CMS.BATCHES, CMS_QA_BATCH_ID),
    {
      name: 'CMS QA · Oct 2026 (no CRM)',
      program: 'LEP',
      orientationDate,
      day1Date,
      timezone: 'Asia/Kolkata',
      sessions,
      weeksLabel: 'One-month LEP journey · v1.5 schedule',
      notes: 'CMS-only test cohort. Not synced from Zoho or web LMS groups.',
      zohoBatchKey: '',
      lmsGroupId: '',
      openForEnrollment: true,
      filling: true,
      status: 'live',
      automationEnabled: true,
      ...stamp(),
      createdAt: serverTimestamp(),
    },
    { merge: true }
  );

  await setDoc(
    doc(db, CMS.PHONE_ENROLLMENTS, phone10),
    {
      cmsBatchId: CMS_QA_BATCH_ID,
      paymentStatus: 'register',
      displayName,
      active: true,
      email: `cmsqa+${phone10}@ironlady.test`,
      ...stamp(),
    },
    { merge: true }
  );

  return { batchId: CMS_QA_BATCH_ID, phone10 };
}

/** Create `cms_batches` rows for LEP web LMS groups not already linked by `lmsGroupId`. */
export async function importCmsBatchesFromLmsGroups(groups, existingBatches = []) {
  const linkedLms = new Set(
    existingBatches.map((b) => String(b.lmsGroupId || '').trim()).filter(Boolean)
  );
  const linkedZoho = new Set(
    existingBatches.map((b) => String(b.zohoBatchKey || '').trim()).filter(Boolean)
  );
  let added = 0;
  let skipped = 0;
  for (const g of groups) {
    if (linkedLms.has(g.id)) {
      skipped += 1;
      continue;
    }
    const zohoKey = String(g.zohoRawBatch || '').trim();
    if (zohoKey && linkedZoho.has(zohoKey)) {
      skipped += 1;
      continue;
    }
    const day1Date = inferLepDay1FromGroup(g);
    if (!day1Date) {
      skipped += 1;
      continue;
    }
    const orientationDate = orientationFromDay1Saturday(day1Date);
    const sessions = buildLepBatchSessions({
      anchor: 'day1',
      date: day1Date,
      joinLinks: {},
    });
    await saveBatch({
      name: cmsBatchNameFromGroup(g),
      program: 'LEP',
      orientationDate,
      day1Date,
      timezone: 'Asia/Kolkata',
      sessions,
      notes: 'Imported from web LMS groups',
      lmsGroupId: g.id,
      zohoBatchKey: g.zohoRawBatch || '',
      openForEnrollment: false,
      filling: false,
      status: 'draft',
      automationEnabled: false,
    });
    linkedLms.add(g.id);
    if (zohoKey) linkedZoho.add(zohoKey);
    added += 1;
  }
  return { added, skipped };
}

/** Upsert `cms_batches` from Zoho `LEP_Batch` strings (Delivery Desk picklist values). */
export async function importCmsBatchesFromZohoBatchKeys(keys, existingBatches = []) {
  const linkedZoho = new Set(
    existingBatches.map((b) => String(b.zohoBatchKey || '').trim()).filter(Boolean)
  );
  let added = 0;
  let skipped = 0;
  for (const raw of keys) {
    const zohoBatchKey = String(raw || '').trim();
    if (!zohoBatchKey || zohoBatchKey.includes('$')) {
      skipped += 1;
      continue;
    }
    if (linkedZoho.has(zohoBatchKey)) {
      skipped += 1;
      continue;
    }
    const day1Date = inferLepDay1FromZohoRaw(zohoBatchKey);
    if (!day1Date) {
      skipped += 1;
      continue;
    }
    const orientationDate = orientationFromDay1Saturday(day1Date);
    const sessions = buildLepBatchSessions({
      anchor: 'day1',
      date: day1Date,
      joinLinks: {},
    });
    await saveBatch({
      name: formatZohoLepBatchLabel(zohoBatchKey) || zohoBatchKey,
      program: 'LEP',
      orientationDate,
      day1Date,
      timezone: 'Asia/Kolkata',
      sessions,
      notes: 'Imported from Zoho LEP_Batch',
      zohoBatchKey,
      lmsGroupId: '',
      openForEnrollment: false,
      filling: false,
      status: 'draft',
      automationEnabled: false,
    });
    linkedZoho.add(zohoBatchKey);
    added += 1;
  }
  return { added, skipped };
}

export async function deleteContent(item) {
  if (item.storagePath) {
    try {
      await deleteObject(ref(storage, item.storagePath));
    } catch {
      // already gone — still remove the doc
    }
  }
  await deleteDoc(doc(db, CMS.CONTENT, item.id));
}

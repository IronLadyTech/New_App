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
import { CMS } from '../constants/cms';

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

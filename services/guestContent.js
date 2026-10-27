/**
 * Guest app content edited in the CMS (cms_guest). Each row has a `kind`
 * (GUEST_KINDS), an `order`, and `published`. Guests read published rows only.
 */
import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  getDocs,
  onSnapshot,
  query,
  serverTimestamp,
  setDoc,
  where,
  writeBatch,
} from 'firebase/firestore';
import { auth, db } from './firebase';
import { CMS, GUEST_KINDS } from '../constants/cms';
import { MC_RECORDINGS } from '../constants/masterclassRecordings';
import { HOME_SLIDES } from '../screens/guest/guestData';

const byOrder = (a, b) => (a.order ?? 0) - (b.order ?? 0);

function stamp() {
  return { updatedAt: serverTimestamp(), updatedBy: auth.currentUser?.email || '' };
}

/** Guests: published rows of one kind, in order. Rules allow this query signed out. */
export async function fetchGuestItems(kind) {
  const snap = await getDocs(
    query(collection(db, CMS.GUEST), where('kind', '==', kind), where('published', '==', true))
  );
  return snap.docs.map((d) => ({ id: d.id, ...d.data() })).sort(byOrder);
}

/** Staff: every row of one kind (hidden ones too), live. */
export function subscribeToGuestItems(kind, onData, onError) {
  return onSnapshot(
    query(collection(db, CMS.GUEST), where('kind', '==', kind)),
    (snap) => onData(snap.docs.map((d) => ({ id: d.id, ...d.data() })).sort(byOrder)),
    onError
  );
}

export async function saveGuestItem(item) {
  const { id, ...data } = item;
  if (id) {
    await setDoc(doc(db, CMS.GUEST, id), { ...data, ...stamp() }, { merge: true });
    return id;
  }
  const created = await addDoc(collection(db, CMS.GUEST), {
    published: true,
    ...data,
    ...stamp(),
    createdAt: serverTimestamp(),
  });
  return created.id;
}

export function removeGuestItem(id) {
  return deleteDoc(doc(db, CMS.GUEST, id));
}

/** Swap two rows' order (move up / down in the CMS list). */
export async function swapGuestOrder(a, b) {
  const batch = writeBatch(db);
  batch.update(doc(db, CMS.GUEST, a.id), { order: b.order ?? 0, ...stamp() });
  batch.update(doc(db, CMS.GUEST, b.id), { order: a.order ?? 0, ...stamp() });
  await batch.commit();
}

/** What the app shows today, as CMS rows — "Start from what's in the app". */
export function guestDefaults(kind) {
  if (kind === GUEST_KINDS.MC_RECORDING) {
    return MC_RECORDINGS.map((r, i) => ({
      kind,
      order: i,
      title: `Day ${r.day} recording`,
      url: r.videoUrl,
      body: 'Plays here in the app',
    }));
  }
  if (kind === GUEST_KINDS.HOME_SLIDE) {
    return HOME_SLIDES.map((s, i) => ({
      kind,
      order: i,
      kicker: s.kicker,
      program: s.program,
      title: s.title,
      body: s.body,
      chips: s.chips || [],
      cta: s.cta,
      target: s.id,
      url: '',
      imageUrl: '',
    }));
  }
  return [];
}

export async function seedGuestItems(kind) {
  const batch = writeBatch(db);
  guestDefaults(kind).forEach((row) => {
    batch.set(doc(collection(db, CMS.GUEST)), { ...row, published: true, ...stamp(), createdAt: serverTimestamp() });
  });
  await batch.commit();
}

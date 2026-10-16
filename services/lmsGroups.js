import { collection, getDocs, query, where } from 'firebase/firestore';
import { db } from './firebase';

/** LEP cohorts on web LMS (`groups` collection). Staff read per Firestore rules. */
export async function fetchLepGroups() {
  try {
    const snap = await getDocs(query(collection(db, 'groups'), where('program', '==', 'lep')));
    const rows = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
    if (rows.length) return rows;
  } catch {
    // fall through — legacy groups may omit program
  }
  const all = await getDocs(collection(db, 'groups'));
  return all.docs
    .map((d) => ({ id: d.id, ...d.data() }))
    .filter((g) => {
      const p = String(g.program || '').toLowerCase();
      if (p === 'lep') return true;
      const name = String(g.name || '').toLowerCase();
      return name.includes('batch') || name.startsWith('lep');
    });
}

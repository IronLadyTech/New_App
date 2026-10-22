/**
 * Learner activity for the CX batch dashboard: app opens, practice ticks, video
 * progress and Zoom join taps.
 *
 * Writes go to app_activity/{uid} and its days/ and videos/ subcollections —
 * never to users/{uid}, which the whole app listens to, so tracking cannot
 * re-render or disturb any existing flow. Every call is fire-and-forget: a
 * failed write is dropped silently and never blocks the learner.
 */
import { Platform } from 'react-native';
import Constants from 'expo-constants';
import { arrayUnion, doc, getDoc, increment, serverTimestamp, setDoc } from 'firebase/firestore';
import { db } from './firebase';
import { todayIsoIST } from '../utils/lepDailyPractice';

const COLLECTION = 'app_activity';
const OPEN_THROTTLE_MS = 10 * 60 * 1000;

// Set by useActivityTracking. Off for guests, previews and demo journeys.
let ctx = { uid: null, batchIds: {} };
let lastOpenAt = 0;
let firstSeenChecked = null;

/** batchIds: { lep: '<lms group id>', '100bm': ... } from programAccess — what the scheduler joins on. */
export function setActivityContext({ uid, batchIds } = {}) {
  if (uid !== ctx.uid) {
    lastOpenAt = 0;
    firstSeenChecked = null;
  }
  ctx = { uid: uid || null, batchIds: batchIds || {} };
}

function stampFor(uid) {
  return { uid, batchIds: ctx.batchIds, updatedAt: serverTimestamp() };
}

function write(path, data) {
  return setDoc(doc(db, ...path), data, { merge: true }).catch(() => {});
}

function dayPath(uid, day) {
  return [COLLECTION, uid, 'days', day];
}

/** Firestore ids cannot contain "/" and must stay short; uris become a stable hash. */
function safeKey(key) {
  const raw = String(key || '').trim();
  if (!raw) return '';
  if (/^[A-Za-z0-9_.:-]{1,120}$/.test(raw)) return raw;
  let h = 0;
  for (let i = 0; i < raw.length; i += 1) h = (h * 31 + raw.charCodeAt(i)) | 0;
  return `u_${(h >>> 0).toString(36)}`;
}

/** Called when the app comes to the foreground. At most one write pair per 10 minutes. */
export async function recordAppOpen() {
  const { uid } = ctx;
  if (!uid) return;
  const now = Date.now();
  if (now - lastOpenAt < OPEN_THROTTLE_MS) return;
  lastOpenAt = now;

  const day = todayIsoIST();
  const summary = {
    ...stampFor(uid),
    platform: Platform.OS,
    appVersion: Constants.expoConfig?.version || null,
    lastActiveAt: serverTimestamp(),
    lastActiveDay: day,
  };
  if (firstSeenChecked !== uid) {
    firstSeenChecked = uid;
    try {
      const snap = await getDoc(doc(db, COLLECTION, uid));
      if (!snap.exists() || !snap.data()?.firstSeenAt) summary.firstSeenAt = serverTimestamp();
    } catch {
      // offline — try again next session
      firstSeenChecked = null;
    }
  }
  write([COLLECTION, uid], summary);
  write(dayPath(uid, day), { ...stampFor(uid), day, opens: increment(1), lastAt: serverTimestamp() });
}

/** A practice item, ritual or task ticked done in the app (CourseDemoContext.markDone). */
export function recordPracticeDone(programId, key) {
  const { uid } = ctx;
  if (!uid || !key) return;
  const day = todayIsoIST();
  write(dayPath(uid, day), {
    ...stampFor(uid),
    day,
    practice: arrayUnion(`${programId}:${key}`),
    lastAt: serverTimestamp(),
  });
  write([COLLECTION, uid], { ...stampFor(uid), lastPracticeDay: day });
}

/**
 * Video progress. Milestones are stored as a map so writes only ever add —
 * rewatching the start never lowers what was reached.
 */
export function recordVideoProgress(videoKey, { milestones = [], completed = false, durationSec = null } = {}) {
  const { uid } = ctx;
  const id = safeKey(videoKey);
  if (!uid || !id || (!milestones.length && !completed)) return;
  const day = todayIsoIST();
  const reached = Object.fromEntries(milestones.map((m) => [String(m), true]));
  write([COLLECTION, uid, 'videos', id], {
    ...stampFor(uid),
    videoKey: String(videoKey).slice(0, 300),
    milestones: reached,
    ...(completed ? { completed: true } : {}),
    ...(durationSec ? { durationSec } : {}),
    lastWatchedAt: serverTimestamp(),
    lastWatchedDay: day,
  });
  write(dayPath(uid, day), { ...stampFor(uid), day, videos: arrayUnion(id), lastAt: serverTimestamp() });
}

/** Learner tapped Join on a live session (Zoom). Attendance proxy until Zoom reports are wired. */
export function recordSessionJoin(sessionCode) {
  const { uid } = ctx;
  if (!uid) return;
  const day = todayIsoIST();
  write(dayPath(uid, day), {
    ...stampFor(uid),
    day,
    joins: arrayUnion(String(sessionCode || 'session')),
    lastAt: serverTimestamp(),
  });
}

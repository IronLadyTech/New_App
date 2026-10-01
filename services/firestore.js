import {
  collection,
  doc,
  getDoc,
  getDocs,
  addDoc,
  setDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  limit,
  onSnapshot,
  serverTimestamp,
  arrayUnion,
  arrayRemove,
  increment,
  writeBatch,
} from 'firebase/firestore';
import { db } from './firebase';

// ─── Users ──────────────────────────────────────────────────────────────────

export function subscribeToUser(uid, onData, onError) {
  return onSnapshot(
    doc(db, 'users', uid),
    (snap) => {
      if (!snap.exists()) {
        onData(null);
        return;
      }
      onData({ id: snap.id, ...snap.data() });
    },
    onError
  );
}

export async function updateUserProfile(uid, data) {
  await updateDoc(doc(db, 'users', uid), {
    ...data,
    updatedAt: serverTimestamp(),
  });
}

export async function enrollInCourse(uid, courseId) {
  const batch = writeBatch(db);
  batch.update(doc(db, 'users', uid), {
    enrolledCourseIds: arrayUnion(courseId),
    updatedAt: serverTimestamp(),
  });
  batch.set(
    doc(db, 'progress', `${uid}_${courseId}`),
    {
      userId: uid,
      courseId,
      completedLessonIds: [],
      quizScores: {},
      percentComplete: 0,
      lastAccessedAt: serverTimestamp(),
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    },
    { merge: true }
  );
  await batch.commit();
}

// ─── Courses ────────────────────────────────────────────────────────────────

export function subscribeToCourses(onData, onError) {
  const q = query(collection(db, 'courses'), orderBy('createdAt', 'desc'));
  return onSnapshot(
    q,
    (snap) => {
      onData(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
    },
    onError
  );
}

export function subscribeToCourse(courseId, onData, onError) {
  return onSnapshot(
    doc(db, 'courses', courseId),
    (snap) => {
      if (!snap.exists()) {
        onData(null);
        return;
      }
      onData({ id: snap.id, ...snap.data() });
    },
    onError
  );
}

export async function createCourse(data) {
  const ref = await addDoc(collection(db, 'courses'), {
    title: data.title,
    description: data.description || '',
    instructorId: data.instructorId,
    instructorName: data.instructorName || '',
    thumbnailUrl: data.thumbnailUrl || null,
    category: data.category || 'General',
    level: data.level || 'Beginner',
    moduleCount: 0,
    enrolledCount: 0,
    published: data.published ?? true,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });
  return ref.id;
}

// ─── Lessons ────────────────────────────────────────────────────────────────

export function subscribeToLessons(courseId, onData, onError) {
  const q = query(
    collection(db, 'lessons'),
    where('courseId', '==', courseId),
    orderBy('order', 'asc')
  );
  return onSnapshot(
    q,
    (snap) => {
      onData(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
    },
    onError
  );
}

export async function getLesson(lessonId) {
  const snap = await getDoc(doc(db, 'lessons', lessonId));
  if (!snap.exists()) return null;
  return { id: snap.id, ...snap.data() };
}

export async function createLesson(data) {
  const ref = await addDoc(collection(db, 'lessons'), {
    courseId: data.courseId,
    title: data.title,
    content: data.content || '',
    videoUrl: data.videoUrl || null,
    order: data.order ?? 0,
    durationMinutes: data.durationMinutes ?? 0,
    quiz: data.quiz || null,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });
  return ref.id;
}

// ─── Progress ───────────────────────────────────────────────────────────────

export function subscribeToUserProgress(uid, onData, onError) {
  const q = query(collection(db, 'progress'), where('userId', '==', uid));
  return onSnapshot(
    q,
    (snap) => {
      onData(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
    },
    onError
  );
}

export function subscribeToCourseProgress(uid, courseId, onData, onError) {
  return onSnapshot(
    doc(db, 'progress', `${uid}_${courseId}`),
    (snap) => {
      if (!snap.exists()) {
        onData(null);
        return;
      }
      onData({ id: snap.id, ...snap.data() });
    },
    onError
  );
}

export async function markLessonComplete(uid, courseId, lessonId, totalLessons) {
  const progressRef = doc(db, 'progress', `${uid}_${courseId}`);
  const snap = await getDoc(progressRef);
  const existing = snap.exists() ? snap.data() : { completedLessonIds: [] };
  const completed = new Set(existing.completedLessonIds || []);
  completed.add(lessonId);
  const completedIds = Array.from(completed);
  const percent =
    totalLessons > 0 ? Math.round((completedIds.length / totalLessons) * 100) : 0;

  await setDoc(
    progressRef,
    {
      userId: uid,
      courseId,
      completedLessonIds: completedIds,
      percentComplete: percent,
      lastAccessedAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
      createdAt: existing.createdAt || serverTimestamp(),
    },
    { merge: true }
  );

  // Award points for completion
  await updateDoc(doc(db, 'users', uid), {
    points: increment(10),
    updatedAt: serverTimestamp(),
  });

  return { completedIds, percent };
}

export async function saveQuizScore(uid, courseId, lessonId, score) {
  const progressRef = doc(db, 'progress', `${uid}_${courseId}`);
  await setDoc(
    progressRef,
    {
      userId: uid,
      courseId,
      quizScores: { [lessonId]: score },
      lastAccessedAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    },
    { merge: true }
  );
  await updateDoc(doc(db, 'users', uid), {
    points: increment(Math.max(5, Math.round(score / 10))),
    updatedAt: serverTimestamp(),
  });
}

// ─── Announcements ──────────────────────────────────────────────────────────

export function subscribeToAnnouncements(onData, onError) {
  const q = query(
    collection(db, 'announcements'),
    orderBy('createdAt', 'desc'),
    limit(20)
  );
  return onSnapshot(
    q,
    (snap) => {
      onData(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
    },
    onError
  );
}

// ─── Events (shared with web LMS `events` collection) ───────────────────────

export function subscribeToEvents(onData, onError) {
  const q = query(collection(db, 'events'), orderBy('date', 'asc'), limit(60));
  return onSnapshot(
    q,
    (snap) => {
      onData(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
    },
    (err) => {
      // Fallback when composite index is missing — load unsorted and sort client-side
      if (err?.code === 'failed-precondition') {
        return onSnapshot(
          collection(db, 'events'),
          (snap) => {
            const rows = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
            rows.sort((a, b) => {
              const da = `${a.date || ''} ${a.time || ''}`;
              const db_ = `${b.date || ''} ${b.time || ''}`;
              return da.localeCompare(db_);
            });
            onData(rows.slice(0, 60));
          },
          onError
        );
      }
      onError?.(err);
    }
  );
}

export async function saveFcmToken(uid, token) {
  if (!uid || !token) return;
  await updateDoc(doc(db, 'users', uid), {
    fcmToken: token,
    fcmTokenUpdatedAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });
}

export async function clearFcmToken(uid) {
  if (!uid) return;
  await updateDoc(doc(db, 'users', uid), {
    fcmToken: null,
    updatedAt: serverTimestamp(),
  });
}

// ─── Engagement / Posts ─────────────────────────────────────────────────────

export function subscribeToPosts(onData, onError) {
  const q = query(collection(db, 'posts'), orderBy('createdAt', 'desc'), limit(50));
  return onSnapshot(
    q,
    (snap) => {
      onData(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
    },
    onError
  );
}

export function subscribeToPost(postId, onData, onError) {
  return onSnapshot(
    doc(db, 'posts', postId),
    (snap) => {
      if (!snap.exists()) {
        onData(null);
        return;
      }
      onData({ id: snap.id, ...snap.data() });
    },
    onError
  );
}

export function subscribeToComments(postId, onData, onError) {
  const q = query(
    collection(db, 'posts', postId, 'comments'),
    orderBy('createdAt', 'asc')
  );
  return onSnapshot(
    q,
    (snap) => {
      onData(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
    },
    onError
  );
}

export async function createPost({ authorId, authorName, authorPhoto, content, title }) {
  const ref = await addDoc(collection(db, 'posts'), {
    authorId,
    authorName: authorName || 'Learner',
    authorPhoto: authorPhoto || null,
    title: title || '',
    content,
    likeIds: [],
    likeCount: 0,
    commentCount: 0,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });
  await updateDoc(doc(db, 'users', authorId), {
    points: increment(5),
    updatedAt: serverTimestamp(),
  });
  return ref.id;
}

export async function toggleLike(postId, uid) {
  const ref = doc(db, 'posts', postId);
  const snap = await getDoc(ref);
  if (!snap.exists()) return;
  const liked = (snap.data().likeIds || []).includes(uid);
  await updateDoc(ref, {
    likeIds: liked ? arrayRemove(uid) : arrayUnion(uid),
    likeCount: increment(liked ? -1 : 1),
    updatedAt: serverTimestamp(),
  });
}

export async function addComment(postId, { authorId, authorName, content }) {
  await addDoc(collection(db, 'posts', postId, 'comments'), {
    authorId,
    authorName: authorName || 'Learner',
    content,
    createdAt: serverTimestamp(),
  });
  await updateDoc(doc(db, 'posts', postId), {
    commentCount: increment(1),
    updatedAt: serverTimestamp(),
  });
}

export async function deletePost(postId) {
  await deleteDoc(doc(db, 'posts', postId));
}

// ─── Leaderboard ────────────────────────────────────────────────────────────

export function subscribeToLeaderboard(onData, onError) {
  const q = query(collection(db, 'users'), orderBy('points', 'desc'), limit(20));
  return onSnapshot(
    q,
    (snap) => {
      onData(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
    },
    onError
  );
}

// ─── Payment orders / receipts ──────────────────────────────────────────────

function receiptNumber() {
  const d = new Date();
  const ymd = d.toISOString().slice(0, 10).replace(/-/g, '');
  const rand = Math.random().toString(36).slice(2, 6).toUpperCase();
  return `IL-${ymd}-${rand}`;
}

export async function savePaymentOrder(payload) {
  const transactionId = payload.transactionId || `pending_${Date.now()}`;
  const ref = doc(db, 'payment_orders', transactionId);
  const existing = await getDoc(ref);
  if (existing.exists()) {
    return { id: existing.id, ...existing.data() };
  }

  const record = {
    uid: payload.uid,
    transactionId,
    razorpayOrderId: payload.razorpayOrderId || null,
    receiptNumber: receiptNumber(),
    status: 'paid',
    gateway: 'razorpay',
    currency: payload.currency || 'INR',
    amountPaise: payload.amountPaise,
    amountRupees: (payload.amountPaise || 0) / 100,
    programId: payload.programId || null,
    programTitle: payload.programTitle || '',
    description: payload.description || 'Programme balance',
    payerName: payload.payerName || '',
    payerEmail: payload.payerEmail || '',
    payerPhone: payload.payerPhone || '',
    paidAt: serverTimestamp(),
    createdAt: serverTimestamp(),
  };
  await setDoc(ref, record);
  return { id: ref.id, ...record };
}

export function subscribeToMyOrders(uid, onData, onError) {
  const mapped = (snap) => {
    const rows = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
    rows.sort((a, b) => {
      const ta = a.createdAt?.toMillis?.() || 0;
      const tb = b.createdAt?.toMillis?.() || 0;
      return tb - ta;
    });
    onData(rows);
  };
  const q = query(
    collection(db, 'payment_orders'),
    where('uid', '==', uid),
    limit(50)
  );
  return onSnapshot(q, mapped, onError);
}

export async function getPaymentOrder(orderId) {
  const snap = await getDoc(doc(db, 'payment_orders', orderId));
  if (!snap.exists()) return null;
  return { id: snap.id, ...snap.data() };
}

// Re-export helpers useful to callers
export { getDocs, getDoc, collection, query, where };

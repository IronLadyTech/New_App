import { doc, getDoc, setDoc, serverTimestamp } from 'firebase/firestore';
import { auth, db } from './firebase';
import { CMS } from '../constants/cms';
import { DEFAULT_QUIZZES, cleanQuiz } from '../constants/lepQuizzes';

/**
 * Quizzes live in cms_practice/{quizId} (program 'quiz', so they never show up in a practice
 * list). Learners can read a published one; the CMS team edits it. Until the team saves one,
 * the app's starting questions are used.
 */

export async function loadQuiz(quizId) {
  const fallback = DEFAULT_QUIZZES[quizId] || null;
  try {
    const snap = await getDoc(doc(db, CMS.PRACTICE, quizId));
    if (snap.exists() && snap.data()?.published !== false) return cleanQuiz(snap.data(), fallback);
  } catch {
    /* offline or not saved yet: the starting questions */
  }
  return fallback;
}

/** Staff: the saved version, or null when the team has not edited this quiz yet. */
export async function loadSavedQuiz(quizId) {
  const snap = await getDoc(doc(db, CMS.PRACTICE, quizId));
  return snap.exists() ? snap.data() : null;
}

export function saveQuiz(quizId, quiz) {
  return setDoc(
    doc(db, CMS.PRACTICE, quizId),
    {
      program: 'quiz',
      kind: 'quiz',
      published: true,
      title: quiz.title,
      passPercent: quiz.passPercent,
      questions: quiz.questions,
      updatedAt: serverTimestamp(),
      updatedBy: auth.currentUser?.email || auth.currentUser?.uid || null,
    },
    { merge: true }
  );
}

/**
 * Optional helper — call from a temporary admin screen or Node script
 * after pasting your Firebase config. Creates one demo course + lesson + announcement.
 *
 * Usage (from a logged-in teacher account, e.g. React Native Debugger):
 *   import { seedDemoData } from './services/seed';
 *   await seedDemoData({ instructorId, instructorName });
 */
import { addDoc, collection, serverTimestamp } from 'firebase/firestore';
import { db } from './firebase';

export async function seedDemoData({ instructorId, instructorName = 'Demo Instructor' }) {
  const courseRef = await addDoc(collection(db, 'courses'), {
    title: 'Getting Started with LMS',
    description:
      'A short demo course to verify live Firestore sync, enrollment, and progress.',
    instructorId,
    instructorName,
    thumbnailUrl: null,
    category: 'Orientation',
    level: 'Beginner',
    moduleCount: 1,
    enrolledCount: 0,
    published: true,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });

  await addDoc(collection(db, 'lessons'), {
    courseId: courseRef.id,
    title: 'Welcome lesson',
    content:
      'This lesson is seeded for demo purposes. Mark it complete to see progress sync live on Home and Profile.',
    videoUrl: null,
    order: 1,
    durationMinutes: 5,
    quiz: {
      questions: [
        {
          id: 'q1',
          prompt: 'Where does live UI sync come from?',
          options: [
            'Manual pull-to-refresh only',
            'Firestore onSnapshot listeners',
            'Local Redux only',
          ],
          correctIndex: 1,
        },
      ],
    },
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });

  await addDoc(collection(db, 'announcements'), {
    title: 'Welcome to the LMS',
    body: 'Courses, progress, and community posts update in real time.',
    createdAt: serverTimestamp(),
  });

  return courseRef.id;
}

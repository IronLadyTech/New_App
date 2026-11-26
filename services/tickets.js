import {
  collection,
  doc,
  getDocs,
  query,
  setDoc,
  updateDoc,
  where,
  serverTimestamp,
} from 'firebase/firestore';
import { db } from './firebase';

/**
 * Support tickets — the same `tickets` collection and shape as the LMS (new_lms
 * src/services/ticketService.js), so the Iron Lady team answers app tickets in the LMS
 * Tickets page alongside the rest.
 */
const TICKETS = 'tickets';

export const TICKET_CATEGORIES = [
  { value: 'course', label: 'Programme or task' },
  { value: 'login', label: 'Login' },
  { value: 'payment', label: 'Payment' },
  { value: 'other', label: 'Something else' },
];

export function ticketStatusLabel(status) {
  if (status === 'resolved') return 'Resolved';
  if (status === 'assigned') return 'With the team';
  return 'Open';
}

export async function addTicketMessage(ticketId, { senderId, senderName, text }) {
  const ref = doc(collection(db, TICKETS, ticketId, 'messages'));
  await setDoc(ref, {
    senderId,
    senderName: senderName || 'Learner',
    senderRole: 'user',
    text,
    createdAt: serverTimestamp(),
  });
  // Moves the ticket up in the team's list; not allowed once resolved (the message still lands).
  await updateDoc(doc(db, TICKETS, ticketId), { updatedAt: serverTimestamp() }).catch(() => {});
  return ref.id;
}

/**
 * Raise a ticket. Her mobile and batch go at the end of the first message, so the team can find
 * her even when she has no email on file.
 */
export async function createTicket({ uid, email, name, phone, batch, category, subject, message }) {
  const ref = doc(collection(db, TICKETS));
  await setDoc(ref, {
    userId: uid,
    userEmail: email || '',
    userDisplayName: name || 'Learner',
    userPhone: phone || '',
    category,
    subject,
    source: 'app',
    status: 'open',
    assignedTo: null,
    assignedToName: null,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
    resolvedAt: null,
  });
  const context = [phone ? `Mobile: ${phone}` : '', batch ? `Batch: ${batch}` : ''].filter(Boolean).join(' · ');
  const text = [String(message || '').trim(), context ? `\n— ${context} (raised from the app)` : ''].join('');
  if (text.trim()) await addTicketMessage(ref.id, { senderId: uid, senderName: name, text });
  return ref.id;
}

function sortByTime(list, key, desc) {
  return list.sort((a, b) => {
    const d = (a[key]?.toMillis?.() ?? 0) - (b[key]?.toMillis?.() ?? 0);
    return desc ? -d : d;
  });
}

export async function getMyTickets(uid) {
  const snap = await getDocs(query(collection(db, TICKETS), where('userId', '==', uid)));
  return sortByTime(snap.docs.map((d) => ({ id: d.id, ...d.data() })), 'updatedAt', true);
}

export async function getTicketMessages(ticketId) {
  const snap = await getDocs(collection(db, TICKETS, ticketId, 'messages'));
  return sortByTime(snap.docs.map((d) => ({ id: d.id, ...d.data() })), 'createdAt', false);
}

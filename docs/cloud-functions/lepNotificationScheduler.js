/**
 * LEP batch notification scheduler (v1 — session reminders only).
 *
 * Deploy on lmsironlady (D:\LMS\new_lms\functions):
 *
 *   const { onSchedule } = require('firebase-functions/v2/scheduler');
 *   const { runLepNotificationScheduler } = require('./lepNotificationScheduler');
 *   exports.lepNotificationScheduler = onSchedule(
 *     { schedule: 'every 15 minutes', timeZone: 'Asia/Kolkata', region: 'us-central1' },
 *     runLepNotificationScheduler
 *   );
 *
 * Requires: cms_batches (live + automationEnabled), cms_notificationEvents,
 * users.programAccess.lep.batchId = batch.lmsGroupId, cms_notification_sends dedupe.
 */
const { getFirestore, FieldValue } = require('firebase-admin/firestore');
const { deliverCmsEventToUser } = require('./lepNotificationDeliver');
const { sessionAnchorFires } = require('./lepNotificationAnchors');

const WINDOW_MS = 15 * 60 * 1000;

async function loadLiveBatches(db) {
  const snap = await db.collection('cms_batches').where('status', '==', 'live').get();
  return snap.docs
    .map((d) => ({ id: d.id, ...d.data() }))
    .filter((b) => b.automationEnabled === true && Array.isArray(b.sessions) && b.sessions.length);
}

async function loadParticipantEvents(db) {
  const snap = await db.collection('cms_notificationEvents').get();
  return snap.docs
    .map((d) => ({ id: d.id, ...d.data() }))
    .filter((e) => {
      const r = e.recipients || ['participant'];
      return r.includes('participant') && e.active !== false;
    });
}

async function alreadySent(db, dedupeKey) {
  const ref = db.collection('cms_notification_sends').doc(dedupeKey.replace(/\//g, '_'));
  const snap = await ref.get();
  return snap.exists;
}

async function markSent(db, dedupeKey, meta) {
  const ref = db.collection('cms_notification_sends').doc(dedupeKey.replace(/\//g, '_'));
  await ref.set({ ...meta, createdAt: FieldValue.serverTimestamp() });
}

async function participantsForBatch(db, batch) {
  const groupId = String(batch.lmsGroupId || '').trim();
  if (!groupId) return [];

  const snap = await db
    .collection('users')
    .where('programAccess.lep.batchId', '==', groupId)
    .limit(500)
    .get();

  return snap.docs.map((d) => d.id);
}

async function runLepNotificationScheduler() {
  const db = getFirestore();
  const now = Date.now();
  const windowStartMs = now - WINDOW_MS;
  const windowEndMs = now;

  const batches = await loadLiveBatches(db);
  const events = await loadParticipantEvents(db);
  const sessionEvents = events.filter(
    (e) => e.anchor?.type === 'sessionStart' || e.anchor?.type === 'sessionEnd'
  );

  let delivered = 0;
  let skipped = 0;

  for (const batch of batches) {
    const uids = await participantsForBatch(db, batch);
    if (!uids.length) continue;

    for (const event of sessionEvents) {
      const fires = sessionAnchorFires(batch, event, windowStartMs, windowEndMs);
      for (const fire of fires) {
        if (await alreadySent(db, fire.dedupeKey)) {
          skipped += 1;
          continue;
        }
        for (const uid of uids) {
          const profile = await db.collection('users').doc(uid).get();
          const name =
            profile.exists &&
            (profile.data().displayName || profile.data().firstName || profile.data().name);
          const vars = { ...fire.vars, name: name ? String(name).split(' ')[0] : 'there' };
          await deliverCmsEventToUser(db, uid, fire.event, vars, {
            go: { to: 'schedule' },
          });
          delivered += 1;
        }
        await markSent(db, fire.dedupeKey, {
          batchId: batch.id,
          eventCode: event.code,
          sessionCode: fire.session.code,
          fireAtMs: fire.fireAtMs,
          recipientCount: uids.length,
        });
      }
    }
  }

  console.log('lepNotificationScheduler', { delivered, skipped, batches: batches.length });
  return { delivered, skipped };
}

module.exports = { runLepNotificationScheduler };

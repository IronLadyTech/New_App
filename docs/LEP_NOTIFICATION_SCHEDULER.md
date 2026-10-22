# LEP notification scheduler (v1)

## What it does

Every **15 minutes** (IST), for each **`cms_batches`** row that is **`live`** with **`automationEnabled: true`**:

1. Loads **`cms_notificationEvents`** aimed at participants.
2. For **session start/end** anchors (R-24h, R-1h, R-10m, POST, …), computes fire times from that batch’s **`sessions[]`** (`startAt` / `endAt` + `offsetMinutes`).
3. Finds learners where **`programAccess.lep.batchId`** equals the batch’s **`lmsGroupId`**.
4. Delivers **in-app + push** (same as test send) and records **`cms_notification_sends/{dedupeKey}`** so repeats are skipped.

## Deploy (web LMS Firebase project)

Copy from this repo into `D:\LMS\new_lms\functions\`:

- `lepNotificationDeliver.js`
- `lepNotificationAnchors.js`
- `lepNotificationScheduler.js`
- Update `sendParticipantNotificationTest.js` to call `deliverCmsEventToUser` from `lepNotificationDeliver.js` (optional dedupe).

Register in `index.js`:

```js
const { onSchedule } = require('firebase-functions/v2/scheduler');
const { runLepNotificationScheduler } = require('./lepNotificationScheduler');

exports.lepNotificationScheduler = onSchedule(
  { schedule: 'every 15 minutes', timeZone: 'Asia/Kolkata', region: 'us-central1' },
  async () => runLepNotificationScheduler()
);
```

Deploy:

```powershell
$env:FUNCTIONS_DISCOVERY_TIMEOUT = "60"
firebase deploy --only functions:lepNotificationScheduler
```

## Staff checklist before automations fire

1. Batch **Setup** → dates, **Generate schedule**, Zoom **`joinLink`** on sessions.
2. **`lmsGroupId`** on the batch matches web LMS **`groups`** doc id.
3. **Go live** on the batch.
4. Learners synced with **`programAccess.lep.batchId`** = that group id (Zoho refresh / enroll).
5. Program templates loaded in **`cms_notificationEvents`** (Load LEP defaults in CMS).

## Not in v1

- TASK-OPEN / TASK-DUE / daily rituals (need task calendar + completion state).
- WhatsApp / email channels (push + in-app only).
- Users matched only by Zoho string without **`lmsGroupId`** (add index + query later).
- Daily cap / priority queue (architecture doc).

## Firestore

`cms_notification_sends` is written only by Admin SDK (no client rules required). Optional rule: deny all client access.

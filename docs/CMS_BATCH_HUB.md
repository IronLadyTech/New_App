# Staff CMS — LEP batch hub (redesign)

Staff URL: `https://lmsironlady-app.web.app/admin#hub`

## Sidebar

| Section | Purpose |
|---------|---------|
| **LEP batch** | Select cohort → Messages, Content, Practice, Setup |
| **Program templates** | Global message rules & copy (WELCOME, R-24h, …) |
| **IL Guide coach** | Once for whole app |

Legacy hashes `#batches`, `#content`, `#notifications` redirect to hub or templates.

## Batch hub tabs

1. **Messages** — Learner rules grouped (orientation, Day 1, tasks, rituals). Status: Upcoming / Active / Expired. Expired → confirm to override.
2. **Content** — Session recordings, journey tasks by phase (CX-style), podcast & C-Suite Learn URLs (`library` on `cms_content`).
3. **Practice** — Preview of home practice rows (app wiring next).
4. **Setup** — Dates, generate v1.5 schedule, Zoom links, signup flags.

**Go live** sets `status: live` and `automationEnabled: true` on `cms_batches`.

Learners (signed in) can read **live** batches from Firestore. The app resolves their cohort via `useLearnerCmsBatch` (Zoho key, LMS group id, or cms doc id) for **Due this week**, **My Program → Sessions**, **Schedule**, and IL Guide **next session** hints.

Automated session reminders: see [LEP_NOTIFICATION_SCHEDULER.md](./LEP_NOTIFICATION_SCHEDULER.md).

## Firestore

- `cms_batches` — dates, sessions, `status`, `automationEnabled`, optional `zohoBatchKey`, `lmsGroupId` (tie to Delivery Desk / web LMS `groups`)
- `cms_phone_enrollments/{10-digit}` — CMS-only QA seats (no Zoho). Staff: **LEP batch** → **Create / refresh QA batch + phone**. `resolvePhoneAccess` provisions LEP registered + `cmsBatchId`.

## LEP Delivery Desk (Zoho) vs this CMS

The [Delivery Desk](https://claude.ai/artifact/Uw7C54Qg5UEUEQvdRDZqMp) does **not** read `cms_batches`. It loads **Zoho Leads** (`LEP_Batch` = `dd/mm/yyyy - dd/mm/yyyy`, plus welcome call / WA / payment fields), merged into an hourly **snapshot** on Claude’s side. Live “Refresh from Zoho” only works inside Claude’s app, not in a plain iframe.

| Layer | Role |
|-------|------|
| **Zoho `LEP_Batch` on Leads** | Ops truth for Desk (who’s in which cohort, paid, WC, WA) |
| **`cms_batches`** | App staff hub: calendar, Zoom, message timeline, Go live |
| **Web LMS `groups`** | Learner CX / tasks (optional `lmsGroupId` link) |

To feed **this** CMS from Zoho (not only embed the Desk), use your own **Zoho OAuth** on `lmsironlady` (Cloud Function cron): same Leads field list, quarter windows on `LEP_Registration_Date`, page ≤200, dedupe by phone/email — then either publish a snapshot doc or upsert `cms_batches` using `zohoBatchKey` = raw `LEP_Batch` and name = friendly label (e.g. `27th Dec batch`). Reuse patterns in `D:\LMS\new_lms\functions\zoho*.js` where IL_Users/Batch already sync to LMS.
- `cms_content` — optional `library`, `assetKey`, `batchId`, `sessionCode`
- `cms_notificationEvents` — templates (unchanged)

## Parity with web CX

Web LMS batch page: [CX batch example](https://lmsironlady.web.app/cx/batches/zoho_100bm_12-09-2026-12-03-2027) — modules, tasks, recordings. Mobile CMS mirrors that structure under **Content** + **Messages** per `cms_batches` cohort.

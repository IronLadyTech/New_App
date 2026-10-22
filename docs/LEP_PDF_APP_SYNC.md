# LEP_Flow.pdf ↔ mobile app sync

Canonical journey: **LEP Program Journey v1.5** / `docs/LEP_FLOW.pdf`.

This table is the source of truth for **what should match** and **what still does not**.

## Week 0 — intensive

| PDF step | PDF behaviour | App (after sync work) | Status |
|----------|---------------|------------------------|--------|
| Pre-program | CoDeSeF, NSDC, VIA; **no 5 Rituals** | Pre-work list drops rituals until unlock; due week from `buildLepDueWeek` | **Synced** (needs batch `day1Date`) |
| S0 Orientation (Thu) | Explains journey; rituals named at high level in session, not in app spoilers | Orientation tasks; no rituals video | **Mostly synced** |
| S1 Day 1 (Sat) | Personal transformation tasks | Phase `day-1` opens on `day1Date` | **Synced** (calendar) |
| S2 Day 2 (Sun) | Strategies; **rituals revealed for Monday** | Phase `day-2` on `day1+1`; rituals still hidden until Mon | **Synced** |
| Monday Week 1 | Daily rituals tracker + optional apply tasks | Rituals + phases `week-1`+ from `day1+2` | **Synced** (calendar) |

## Common gaps (still out of sync)

| Area | PDF | App today | Notes |
|------|-----|-----------|--------|
| **Enrolled = all phases open** | Phases unlock over the month | Was: entire course visible on enroll. Now: **LEP uses `lepFlowGates` when `day1Date` is known** | Fixed in code; requires CMS batch on learner |
| **No batch date** | CEM assigns batch early | Rituals hidden; only pre-program + orientation phases | Fail-closed until `cms_batches.day1Date` |
| **Push / WhatsApp** | Ritual nudges only after unlock | `constants/cms.js` rules exist; **scheduler does not check unlock** | Deploy change in `new_lms/functions` |
| **Learn tab mock** | N/A | `LearnLibrary.js` static row “5 Daily Rituals” (non-LEP stack / demo) | Low priority |
| **Screen lab / demos** | N/A | `lepData.js` `REG_PRACTICE` still lists rituals for static previews | Lab only |
| **IL Guide cloud** | Same as app gates | Server prompt may still mention rituals unless context includes `ritualsUnlocked` | Check `docs/cloud-functions/ilGuideWhisper.js` |
| **Phase offsets vs task-level PDF** | Some optional tasks tied to session end times | App uses **calendar day**, not 6:30 PM unlock | Acceptable v1; refine later |

## Code map

| Concern | Module |
|---------|--------|
| 5 Rituals hidden until Mon after intensive | `utils/lepRitualsUnlock.js`, `hooks/useLepRitualsUnlocked.js` |
| Phase calendar | `utils/lepFlowGates.js` |
| `isPhaseOpen` / `currentPhaseId` for LEP | `constants/programCourseSlice.js` + `lepFlow` context |
| Home / Engage pre-work | `filterLepPrework` on `LepHomeScreen`, `LepEngageScreen` |
| Practice + course tasks | `PracticeScreen`, `CourseTaskScreen`, `CoursePhaseScreen` |
| Batch dates | `cms_batches.day1Date`, `utils/lepBatchSchedule.js` |

## QA check (example batch Day 1 = 2026-10-17)

| Date | Expect |
|------|--------|
| 2026-10-16 (Thu) | No 5 Rituals anywhere in app; orientation phase OK |
| 2026-10-17–18 (Sat–Sun) | Day 1 / Day 2 phases; still **no** rituals |
| 2026-10-20 (Mon) | Rituals video, tracker, and related course tasks appear |

Reload app after CMS batch changes (`npx expo start -c` from `app-new`).

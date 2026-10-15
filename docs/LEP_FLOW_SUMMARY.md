# Iron Lady LEP — program flow (v1.5)

Source: **LEP Program Journey v1.5** (9 Oct 2026). Canonical PDF copy: `docs/LEP_FLOW.pdf` (add from Downloads if missing).

## Weekly rhythm (every batch)

| When | What | Default time (IST) |
|------|------|---------------------|
| **Thursday** (week of kickoff) | Orientation (S0) | 7:00–8:00 PM |
| **Saturday** (Day 1) | Full day live (S1) | **9:00 AM–7:00 PM** |
| **Sunday** (Day 2) | Full day live (S2) | **9:00 AM–7:00 PM** |

CEM sets **one orientation Thursday** per batch in CMS → **Batch calendar**. The app derives Day 1 Saturday (+2 days) and builds the rest of the journey from **Day 1**.

## Session list (codes used in CMS messages)

Offsets are **calendar days from Day 1 Saturday**.

| Code | Session | Week | Offset from Day 1 | Time (IST) |
|------|---------|------|-------------------|------------|
| S0 | Orientation (B/W) | Pre | −2 (Thu) | 19:00–20:00 |
| S1 | Full Day — Day 1 | Week 0 | 0 (Sat) | 09:00–19:00 |
| S2 | Full Day — Day 2 | Week 0 | 1 (Sun) | 09:00–19:00 |
| S3 | Closure (Completion & Review) | Week 1 | 3 | 19:00–20:30 |
| FT | Fast Track (optional) | Week 1 | 5 | 19:00–20:00 |
| PTW | Prepare to Win — Week 1 (optional) | Week 1 | 6 | 20:00–21:00 |
| S4 | Differentiated Brand | Week 1 | 7 | 09:00–11:00 |
| S6 | Progress Check | Week 2 | 11 | 19:00–20:30 |
| PTW2 | Prepare to Win — Week 2 (optional) | Week 2 | 13 | 20:00–21:00 |
| S5 | Shameless Pitch | Week 2 | 14 | 18:30–20:30 |
| PTW3 | Prepare to Win — Week 3 (optional) | Week 3 | 20 | 20:00–21:00 |
| S7 | Leadership Habits | Week 3 | 21 | 09:00–11:00 |
| PTW4 | Prepare to Win — Week 4 (optional) | Week 4 | 27 | 20:00–21:00 |
| S8 | Graduation (Certification) | Week 4 | 28 | 19:30–20:30 |

PTW2–PTW4 use notification anchor **PTW** in message rules (same as PTW week 1).

## CMS implementation

1. **Staff CMS** (`/admin` → **Batch calendar**): Firestore collection `cms_batches`.
   - Fields: `name`, `program` (LEP), `orientationDate`, `day1Date`, `timezone`, `sessions[]` (code, title, date, start/end, `joinLink`, `startAt`/`endAt` ISO).
2. **Messages to learners**: rules reference session **codes** (not fixed dates). When the notification scheduler is deployed, it will resolve times from the learner’s batch.
3. **Batch materials**: files still attach to **task codes** in the journey (unchanged).

## Code references

- Template: `constants/lepSessionTemplate.js`
- Date builder: `utils/lepBatchSchedule.js`
- Admin UI: `screens/admin/BatchCalendarAdmin.js`

# IL Guide’s Whisper — how it works (operators & product)

IL Guide is the **in-app mentor**. A **whisper** is one short message on a screen — **not a chat**. Learners dismiss it; it does not keep a thread.

---

## 1. What IL Guide is for (five jobs)

| Job | Purpose | Typical message |
|-----|---------|-----------------|
| **onboard** | First visit welcome | Name, program, “open Learn and start” |
| **nudge** | Progress + motivation | % complete, next task, approved quotation |
| **recommend** | Learn tab | “Start with …” — next **LMS task** title |
| **event** | Calendar / announcement | Upcoming session or cohort event |

Rules baked into code and cloud: **no invented dates**, **no invented quotes** (quotes come from CMS or fixed list).

---

## 2. Where learners see it today

| Screen | LEP | 100BM / MBW |
|--------|-----|-------------|
| **Home** | **Dynamic** IL Guide (cloud → API → local rules) | Mostly **static** copy on program Home cards |
| **Learn** | **Dynamic** `ILGuideWhisperLep` (+ city chips) | Programs screen dynamic card |
| **Engage / Community** | **Dynamic** `ILGuideWhisperLep` (+ industry chips) | **Dynamic** on Feed (when signed in) |
| **First-login wizard** | Welcome / batch flow (LandingGate); sets `ilGuideOnboarded` on profile | Same pattern |

**Admin toggle “IL Guide is on”** only affects screens wired to `useILGuideWhisper` (mainly **Home** for LEP).

---

## 3. End-to-end flow (one whisper)

```text
Learner opens Home (signed in, not guest/staff)
        │
        ▼
useILGuideWhisper('home')
        │
        ▼
buildILGuideContext()  ← profile, programs, payment, progress %, next LMS task, events
        │
        ▼
Read cms_config/ilGuide  ← enabled? surface on? job on? quotations?
        │
        ├── off → no card
        │
        ▼
Try ilGuideWhisper (Firebase callable)
        │
        ├── fail → Try EXPO_PUBLIC_IL_GUIDE_API_URL (optional FastAPI)
        │
        ├── fail → localWhisper() in app (rules + CMS quotes)
        │
        ▼
Skip if same message id as last time on this surface (device cache)
Skip if learner dismissed this id
        │
        ▼
Show ILGuideWhisper card · Dismiss stores id in AsyncStorage
```

---

## 4. How task recommendation works (production)

IL Guide uses **My Program journey tasks** first (`programCourseSlice` + completion flags from `CourseDemoContext` / submissions), then falls back to **web LMS Firestore tasks** if needed.

1. **Primary program** = LEP if enrolled, else first enrolled program.
2. **Journey progress %** = done open-phase tasks ÷ total open-phase tasks (respects registered vs enrolled phase locks).
3. **Next task** = first incomplete journey task in phase order (e.g. VIA → CoDeSeF → Program Schedule).
4. **LMS progress** is merged: `progressPercent = max(journey%, lms%)`.
5. **Learn** job: *Curated with your facilitators: start with "[title]"…* + **Open next task** deep link.
6. **Home** job: percent + next title, or quotation, or upcoming event.

Cloud callable `ilGuideWhisper` receives the same `context` object; deploy from `docs/cloud-functions/ilGuideWhisper.js` into `new_lms/functions`.

---

## 5. What context is sent (participant packet)

Built in `utils/ilGuideContext.js` and sent to cloud/API:

- `participantId` (Firebase uid)
- `surface`: onboard | home | learn | community
- `firstLogin` (onboard surface only)
- `name`, `location` (city), `domain` / job title
- `batchId` from profile (`batchName` / `batchId` / `programAccess.lep.*`)
- `programs[]` with payment status and progress per program
- `primaryProgram`, `nextTask` { id, title, type }, `progressPercent`
- `upcomingEvent` from calendar or first announcement

Missing fields are **omitted**, not guessed.

---

## 6. CMS admin (how to turn IL Guide on/off)

**URL:** LEP CMS → **IL Guide** (`/admin#ilguide`)

Stored in Firestore: `cms_config/ilGuide`

| Setting | Effect |
|---------|--------|
| **IL Guide is on** | Master switch — off hides dynamic whispers |
| **Jobs** | Enable/disable onboard, nudge, recommend, event |
| **Surfaces** | first-login, Home, Learn, Community |
| **Quotations** | Approved quotes for nudges (active flag per quote) |
| **Creativity / max sentences** | Used when cloud or API generates text |

App caches config ~**1 minute**.

---

## 7. Who does **not** get dynamic whispers

- Guests
- Staff roles (admin, moderator, PL, CEM in app)
- Demo journey bar **without** Firebase sign-in (no uid → hook exits early)

---

## 8. Phone login, profile, batch (e.g. +91 8309882198)

1. **Phone login** → `resolvePhoneAccess` (Zoho) → OTP / custom token → Firebase user.
2. After login, **`refreshMyAccess`** pulls program, payment, **batch** from Zoho into `users/{uid}` (and `programAccess`).
3. **Profile** screen shows **Program & batch** per program; tap **Just paid? Refresh access** to re-sync.
4. If **LEP** shows but **Batch · not set in Zoho yet**:
   - CEM must set **Batch** (and program) on the **Lead / IL User** in Zoho.
   - Learner taps **Refresh access** again.
5. **`resolvePhoneAccess` / `updateMyWelcomeProfile`** must be **deployed** on Cloud Functions (`D:\LMS\new_lms\functions`) for production phone path.

Batch is used for: calendar event filtering, submission `batchId`, IL Guide context — not for choosing My Program phase.

---

## 9. How to “start” IL Guide for a pilot

1. **CMS:** IL Guide **on**; enable **Home** (+ Learn/Community when those screens use dynamic hook).
2. **Cloud:** Deploy `ilGuideWhisper` callable; optional deploy `il-guide-api` + set `EXPO_PUBLIC_IL_GUIDE_API_URL`.
3. **Data:** Ensure learners have Firestore profile with `program` / `programAccess` and **batch** from Zoho.
4. **LMS tasks:** Populate Firestore program tasks so **next task** and **%** are meaningful.
5. **Test:** Real phone login (not demo bar only) → **Home** → see whisper → dismiss → new id on next logic cycle.

---

## 10. Use-case cheat sheet (CEM)

| Situation | Expected whisper behaviour |
|-----------|----------------------------|
| New LEP registrant, first open | Onboard-style welcome if onboard job + surface on; else Home nudge |
| Mid-program, incomplete LMS tasks | Home: “X% … Next up: [task title]” |
| All LMS tasks done | Home: nudge to Engage / completion message |
| Upcoming batch event in calendar | Home may use **event** job if enabled |
| Learn tab (LEP today) | Static copy unless wired to dynamic hook |
| IL Guide off in CMS | No dynamic card |
| Learner dismisses message | Same message id hidden until rotation picks another |

---

## 11. Not the same as notification CMS

**Notification events** (`cms_notificationEvents`) are for **scheduled / triggered comms** (push, WA, email) — separate send engine.

**IL Guide whisper** is **in-app only** when the learner opens a screen.

---

## 12. Production go-live checklist

1. **CMS** — `admin#ilguide`: IL Guide **on**; enable Home, Learn, Community (+ onboard if needed).
2. **Cloud Functions** (copy `docs/cloud-functions/ilGuideWhisper.js` → `new_lms/functions`, export in `index.js`):
   - `firebase deploy --only functions:ilGuideWhisper`
   - Also deploy: `resolvePhoneAccess`, `refreshMyAccess`, `updateMyWelcomeProfile` (phone login + batch on profile).
3. **App** — reload; sign in with **real mobile** (not demo bar only).
4. **Verify** — Home / Learn / Engage show whisper; **Open next task** opens My Program task; dismiss works.
5. **Optional** — host `il-guide-api` and set `EXPO_PUBLIC_IL_GUIDE_API_URL` for LLM layer between cloud and local fallback.

---

## 13. Files (developers)

| Area | Path |
|------|------|
| Hook | `hooks/useILGuideWhisper.js` |
| Fetch pipeline | `services/ilGuide.js` |
| Context | `utils/ilGuideContext.js` |
| UI card | `components/ILGuideWhisper.js` |
| Admin | `screens/admin/ILGuideAdmin.js` |
| Callable client | `services/functions.js` → `ilGuideWhisper` |
| Optional API | `il-guide-api/` |

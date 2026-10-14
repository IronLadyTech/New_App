# LEP Program Journey — App auto vs CEM human actions

Source: **LEP_FLOW.pdf v1.5** (9 Oct 2026).  
CMS codes match `constants/cms.js` → Load LEP defaults (unless noted).

**Rule of thumb**
- **App automates** = system sends push / WhatsApp / email (or staff *inbox alert*).
- **CEM does** = call, personal WhatsApp, poster send, or mark done in LMS after human action.

Sending engine is not live yet; this is the target split.

---

## A. App automates — participant messages

| Code / slot | When | Message intent | Only if | Channels (proposed) |
|-------------|------|----------------|---------|---------------------|
| WELCOME | On enrollment | Welcome; open VIA + B-HAG (+ info form link) | All | Push, WA, email |
| PAY | On enrollment | Balance payment pending | Payment pending | Push, WA |
| PRE-WED-AM | Wed 10:00 AM (pre-Orient) | VIA + B-HAG due today 8 PM | Incomplete | Push, WA |
| R-24h (S0) | Wed 7:00 PM | Orientation tomorrow | All (+ nudge if pre-work incomplete) | Push, WA |
| PRE-THU-AM | Thu 10:00 AM | VIA / B-HAG overdue — complete today | Incomplete | Push, WA |
| R-1h / R-10m | Before each core session | Join link | All | Push, WA (R-10m free of daily cap) |
| POST | 30 min after core session | Congrats + next task | Attended | Push, WA |
| CATCHUP | 30 min after / Mon after W0 | Missed session — recording + catch-up | Absent | Push, WA |
| OPT-5PM | Same day 5:00 PM | Fast Track / PTW tonight (optional) | All | Push, WA |
| OPT-R-10m | 10 min before FT / PTW | Starting soon + join | All | Push, WA |
| RITUALS-AM | 7:00 AM daily W1 Mon–W4 Sat | Tick 5 Rituals | All | Push |
| RITUALS-PM | 8:30 PM | Rituals not updated today | Not updated today | Push |
| TASK-OPEN / TASK-DUE | 10:00 AM | Today’s task / due today | Incomplete where needed | Push, WA |
| TASK-OVERDUE | Next day 10:00 AM | Pending task names | Incomplete | Push, WA |
| MAND-OVERDUE | After due (mandatory only) | VIA / B-HAG / Pitch needed for certificate | T02, T03, T12, T20 incomplete | Push, WA |
| SCORE | Sat 12:00 PM W1–W4 | Weekly rituals score | All | Push, WA |
| RESCHED | Session time changed | New date/time | Affected | Push, WA |

**Engine rules (auto)**  
- Daily cap ≤ 3 (R-10m does not count).  
- Quiet hours 9:30 PM – 7:00 AM.  
- Skip if done.  
- Red / “Needs attention” only for the **3 mandatory** items.  
- Optional sessions: **no** R-24h, **no** absentee chase.

---

## B. App automates — staff alerts (to CEM / PL / Sales / Admin)

These are **inbox / email digests**. They tell CEM what to do; they are **not** participant WhatsApps.

| Code | When | Recipients | Alert (auto) | What CEM must do next (human) |
|------|------|------------|--------------|-------------------------------|
| C01 | On enrollment | CEM | New participant + payment status | **Call within 24h** to welcome |
| C02 | Wed 10:00 AM (day before Orient) | CEM | Pre-work status sheet (red = not done) | **Call** anyone with 2+ items pending |
| C03 | After Orientation | CEM | Attended / absent list | **Call absentees** next morning; share recording |
| C04 | Fri 10:00 AM (before Day 1) | CEM | Reminder: send poster template | **Manually send** poster + quotation; mark done in LMS |
| C05 | Fri 10:00 AM | CEM + Sales | Payment pending list | **Call** before 6 PM |
| C06 | Wed evening (pre-Orient) | CEM | B-HAG / VIA still missing | **Call** each before Orientation |
| C07 | Sat Day 1 +30 min | CEM | Day 1 no-shows | **Call now** |
| C08 | Sun Day 2 +30 min | CEM | Day 2 no-shows | **Call now** |
| C09 | Sun ~6:00 PM (after Day 2) | CEM + PL | CoDeSeF sheets generated; missing B-HAG in red | Check / follow missing B-HAG |
| C10 | Mon 9:00 AM (after W0) | CEM | S1/S2 attendance + catch-up list | Follow catch-up list |
| C11 | Daily 9:00 AM W1–W4 | CEM | Batch digest (overdue mandatory, rituals 2+ days, at-risk) | Triage; no one-message-per-person from system |
| C12 | Before S3 Review | CEM | Day 1 tasks T08–T12 status (red) | Nudge incomplete before Review |
| C13 | Mandatory overdue 2 days | CEM | Participant + task + due date | **Personal call**; log outcome in LMS |
| C14 | Rituals idle 3 days | CEM | Participant + last update | **WhatsApp check-in** (human) |
| C15 | 30 min after each **core** session | CEM | Absentee | Share recording; **call if 2 sessions missed** |
| C16 | Sat 12:30 PM W1–W4 | CEM + PL | Weekly scoreboard (avg, top/bottom 5, not-updated) | Review; optional follow-up |
| C17 | Brand due window | CEM | T17 pending (optional) | Soft follow-up only |
| C18 | Pitch deadline | CEM | T20 pending | Follow mandatory pitch |
| C19 | Before Progress Check | CEM | T21 pending | Follow before S6 |
| C20 | ~Thu before Graduation | CEM + PL | Draft certification eligibility (red) | **Call at-risk** |
| C21 | Graduation day morning | CEM + PL + Admin | Final eligibility | Admin generates certificates |
| C22 | After Graduation | CEM | Not certified + grace | Follow pending items |
| C23 | After Day 1 (Sun) | Sales | Attended Day 1 but payment pending | Sales escalate |
| C24* | After Fast Track / PTW ends | CEM | Optional attendance (info only) | **No call**, no chase; recording in LMS |

\*C24 (+ C24-PTW, OPT-5PM, OPT-R-10m) are in `constants/cms.js` LEP defaults — click **Load LEP defaults** in `/admin` to seed.

---

## C. CEM always does by hand (never fully automated)

| # | Action |
|---|--------|
| 1 | Welcome call within 24 hours |
| 2 | Calls for pre-work gaps, no-shows, overdue mandatory, certification at-risk |
| 3 | Send **poster template** with quotation to the batch |
| 4 | Personal **WhatsApp** for ritual inactivity (after C14 alert) |
| 5 | Share recording + judgment calls when 2+ core sessions missed |
| 6 | Payment chase calls (with Sales) |
| 7 | Review / return tasks; correct attendance; edit session times/links for the batch |
| 8 | Mark manual LMS tasks done (e.g. poster sent) |

---

## D. Quick matrix

| Type | App | CEM |
|------|-----|-----|
| Session R-24h / R-1h / R-10m | Sends | — |
| Optional FT / PTW heads-up | Sends | Sees C24 only |
| Rituals + weekly score | Sends | Sees C11 / C16 |
| Mandatory overdue | Sends to participant + C13 to CEM | Calls |
| Poster | Reminds CEM (C04) | **Sends poster** |
| Welcome / payment / digest | Auto alert | Calls where listed |

---

## E. Mandatory items (for red + C13)

Only these drive red status / certificate block (unless PL decides otherwise):

1. **T03** VIA Survey  
2. **T02 + T12** B-HAG form and B-HAG in CoDeSeF  
3. **T20** Shameless Pitch statement  

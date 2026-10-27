# Phone login — Lead sync, email fallback, MC recordings

## Server (`resolvePhoneAccess` on lmsironlady)

1. Normalize phone → look up **IL_Users** by mobile.
2. Always load **Lead** by phone (`Mobile` / `Phone`) and `parseLeadEntitlements`.
3. **Email** (login must not stop on IL_Users alone):
   - IL_Users `Email`
   - IL_Users `Username` if it looks like an email
   - Lead `Email` / parsed entitlements
4. **No IL_Users** but Lead exists:
   - **MC Enrolled / Registered / Completed** (and no LEP/100BM/MBW seat) → Firebase user + `programAccess.mc.recordingsUnlocked`
   - LEP/100BM/MBW register or paid → provision from Lead + IL sync
   - Else → `guest: true`, `tier: explore`
5. **IL_Users** found → sign in as today, merge Lead entitlements, set MC flags when Lead status is MC*.

Deploy: `firebase deploy --only functions:resolvePhoneAccess` from `new_lms/functions`.

## App — MC recordings

Constants: `constants/masterclassRecordings.js` (Day 1 / Day 2 YouTube URLs).

**MC-only signed-in** (`isMcOnlyProfile`): `McLeadNavigator` (home + Watch) instead of full tabs.

## Guest tracking (today)

| Mode | Firebase | Storage / profile |
|------|----------|-------------------|
| **Explore guest** | No user | `AsyncStorage` `il_guest_mode=1`, optional `il_guest_name` |
| **MC / program** | Custom token sign-in | `users/{uid}` with `phoneNumber`, `zohoLeadId`, `programAccess` |
| **Demo** | Preview or demo flags | `il_demo`, lab journey keys |

Guest challenge progress uses guest AsyncStorage keys; signed-in MC uses Firestore `users` + activity hooks when authenticated.

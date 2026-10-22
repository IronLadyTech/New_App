# `cmsListLepBatchesFromZoho`

Staff CMS calls this to list every unique Zoho Leads **`LEP_Batch`** value (same source as LEP Delivery Desk).

**Implementation:** `D:\LMS\new_lms\functions\zohoLeadsCohort.js` → `listUniqueLepBatchValues`, exported as `cmsListLepBatchesFromZoho` in `functions/index.js`.

**Deploy (from LMS repo):**

```powershell
cd D:\LMS\new_lms\functions
$env:FUNCTIONS_DISCOVERY_TIMEOUT = "60"
firebase deploy --only functions:cmsListLepBatchesFromZoho --project lmsironlady
```

If deploy fails with *“User code failed to load… Timeout after 10000”*, the CLI’s code-discovery step ran out of time while loading the large `index.js` bundle (common on Windows). Raising `FUNCTIONS_DISCOVERY_TIMEOUT` to `60` (seconds) and retrying usually fixes it — not a syntax error in your function.

Then in the app CMS: **Import from Zoho (Delivery Desk)**.

Optional env overrides: `ZOHO_LEAD_LEP_BATCH_FIELD`, `ZOHO_LEAD_LEP_REG_DATE_FIELD`.

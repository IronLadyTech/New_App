/**
 * READ-ONLY report: which learner accounts were probably used for testing on a staff phone.
 * Writes nothing to Firebase.
 *
 *   node scripts/find-test-accounts.js                       (uses your `firebase login`)
 *   node scripts/find-test-accounts.js --names "lalitha,rajesh"   also every account whose
 *                                                             name or email contains one of these
 *
 * Clues:
 *   1. Same push token on several accounts — a token belongs to one phone, so those
 *      accounts were all signed in on the same (test) phone.
 *   2. Linked to the CMS QA test batch (lep-cms-qa-oct2026).
 * For each flagged account it lists what testing may have left: welcome done, batch,
 * submissions, inbox. Output: console + test-accounts-report.csv in this folder.
 */
const path = require('path');
const os = require('os');
const fs = require('fs');
const { execSync } = require('child_process');

const PROJECT = 'lmsironlady';
const BASE = `https://firestore.googleapis.com/v1/projects/${PROJECT}/databases/(default)/documents`;
const QA_BATCH = 'lep-cms-qa-oct2026';
const STAFF = new Set(['admin', 'superadmin', 'pl', 'cem', 'moderator']);

function val(v) {
  if (!v) return null;
  if ('stringValue' in v) return v.stringValue;
  if ('booleanValue' in v) return v.booleanValue;
  if ('integerValue' in v) return Number(v.integerValue);
  if ('doubleValue' in v) return v.doubleValue;
  if ('timestampValue' in v) return v.timestampValue;
  if ('nullValue' in v) return null;
  if ('arrayValue' in v) return (v.arrayValue.values || []).map(val);
  if ('mapValue' in v) return Object.fromEntries(Object.entries(v.mapValue.fields || {}).map(([k, x]) => [k, val(x)]));
  return null;
}
const fields = (doc) => Object.fromEntries(Object.entries(doc.fields || {}).map(([k, x]) => [k, val(x)]));

async function token() {
  const root = execSync('npm root -g').toString().trim();
  const G = path.join(root, 'firebase-tools');
  const cfg = JSON.parse(fs.readFileSync(path.join(os.homedir(), '.config/configstore/firebase-tools.json'), 'utf8'));
  const auth = require(path.join(G, 'lib/auth'));
  const scopes = require(path.join(G, 'lib/scopes'));
  return (await auth.getAccessToken(cfg.tokens.refresh_token, [scopes.CLOUD_PLATFORM])).access_token;
}

async function main() {
  const H = { Authorization: `Bearer ${await token()}` };
  const get = async (url) => (await fetch(url, { headers: H })).json();
  const runQuery = async (body) =>
    (await fetch(`${BASE}:runQuery`, { method: 'POST', headers: H, body: JSON.stringify(body) })).json();

  // All users (paged).
  const users = [];
  let pageToken = '';
  do {
    const r = await get(`${BASE}/users?pageSize=300${pageToken ? `&pageToken=${pageToken}` : ''}`);
    if (r.error) throw new Error(r.error.message);
    (r.documents || []).forEach((d) => users.push({ uid: d.name.split('/').pop(), ...fields(d) }));
    pageToken = r.nextPageToken || '';
  } while (pageToken);

  // Clue 1: push tokens shared by more than one account.
  const byToken = new Map();
  for (const u of users) {
    if (!u.fcmToken) continue;
    if (!byToken.has(u.fcmToken)) byToken.set(u.fcmToken, []);
    byToken.get(u.fcmToken).push(u);
  }
  const phoneOf = new Map();
  let phoneNo = 0;
  for (const group of byToken.values()) {
    if (group.length < 2) continue;
    phoneNo += 1;
    group.forEach((u) => phoneOf.set(u.uid, { phone: `Phone ${phoneNo}`, shared: group.length }));
  }

  // Clue 3: names the tester remembers (any part of the name or email, any case).
  const argAt = process.argv.indexOf('--names');
  const names = argAt > -1 ? String(process.argv[argAt + 1] || '').split(',').map((x) => x.trim().toLowerCase()).filter(Boolean) : [];
  const nameHit = (u) => {
    const hay = [u.displayName, u.firstName, u.lastName, u.name, u.email].filter(Boolean).join(' ').toLowerCase();
    return names.find((n) => n.split(/\s+/).every((w) => hay.includes(w))) || '';
  };

  const flagged = users.filter((u) => {
    const lep = u.programAccess?.lep || {};
    return phoneOf.has(u.uid) || u.cmsBatchId === QA_BATCH || lep.cmsBatchId === QA_BATCH || lep.batchId === QA_BATCH || nameHit(u);
  });

  const rows = [];
  for (const u of flagged) {
    const lep = u.programAccess?.lep || {};
    const subs = await runQuery({
      structuredQuery: {
        from: [{ collectionId: 'lep_submissions' }],
        where: { fieldFilter: { field: { fieldPath: 'userId' }, op: 'EQUAL', value: { stringValue: u.uid } } },
      },
    });
    const subList = (Array.isArray(subs) ? subs : []).filter((x) => x.document).map((x) => fields(x.document));
    const inbox = await get(`${BASE}/users/${u.uid}/notifications?pageSize=300`);
    const p = phoneOf.get(u.uid);
    rows.push({
      uid: u.uid,
      name: u.displayName || u.firstName || u.name || '',
      phone: u.phoneNumber || u.phone || '',
      email: u.email || '',
      role: u.role || '',
      staff: STAFF.has(u.role) ? 'yes' : '',
      why: [
        nameHit(u) ? `name matches "${nameHit(u)}"` : '',
        p ? `${p.phone} (shared by ${p.shared} accounts)` : '',
        (u.cmsBatchId === QA_BATCH || lep.cmsBatchId === QA_BATCH || lep.batchId === QA_BATCH) ? 'on CMS QA test batch' : '',
      ]
        .filter(Boolean)
        .join('; '),
      welcomeDone: u.welcomeCompletedAt || '',
      batch: lep.batchName || lep.zohoRawBatch || '',
      batchId: lep.batchId || lep.cmsBatchId || u.cmsBatchId || '',
      payment: lep.paymentStatus || '',
      submissions: subList.length,
      firstSubmission: subList.map((s) => s.createdAt || s.submittedAt || '').filter(Boolean).sort()[0] || '',
      lastSubmission: subList.map((s) => s.updatedAt || s.submittedAt || '').filter(Boolean).sort().pop() || '',
      inbox: (inbox.documents || []).length,
      tokenUpdated: u.fcmTokenUpdatedAt || '',
    });
  }

  rows.sort((a, b) => a.why.localeCompare(b.why));
  console.log(`\nUsers read: ${users.length}. Phones shared by several accounts: ${phoneNo}. Accounts flagged: ${rows.length}.\n`);
  for (const r of rows) {
    console.log(`${r.name || '(no name)'} · ${r.phone || r.email} ${r.staff ? '· STAFF' : ''}`);
    console.log(`   why: ${r.why}`);
    console.log(`   welcome done: ${r.welcomeDone || 'no'} · batch: ${r.batch || '—'} · ${r.submissions} submissions · ${r.inbox} in inbox`);
  }
  const cols = Object.keys(rows[0] || { uid: '' });
  const csv = [cols.join(','), ...rows.map((r) => cols.map((c) => `"${String(r[c] ?? '').replace(/"/g, '""')}"`).join(','))].join('\n');
  const out = path.join(__dirname, 'test-accounts-report.csv');
  fs.writeFileSync(out, csv);
  console.log(`\nSaved: ${out}`);
}

main().catch((e) => {
  console.error('Failed:', e.message);
  process.exit(1);
});

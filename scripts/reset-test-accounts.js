/**
 * Reset the agreed TEST accounts so they start the app from the beginning.
 *
 *   node scripts/reset-test-accounts.js            report only — writes nothing
 *   node scripts/reset-test-accounts.js --apply    backup first, then reset
 *
 * Only the accounts in TARGETS are ever touched, found by email (and role where an email has
 * two accounts). Anything that does not match exactly aborts the run. Every document it
 * changes or deletes is saved to a JSON backup (outside the repo) before anything is written.
 * Never touched: Zoho, real learners, staff roles, payment records (marked `test: true` only).
 */
const path = require('path');
const os = require('os');
const fs = require('fs');
const { execSync } = require('child_process');

const APPLY = process.argv.includes('--apply');
const BACKUP_DIR = process.env.RESET_BACKUP_DIR || path.join(os.tmpdir(), 'ironlady-reset-backups');
const BASE = 'projects/lmsironlady/databases/(default)/documents';
const API = `https://firestore.googleapis.com/v1/${BASE}`;

/** The final, agreed list. `role` picks one account when an email has two. */
const TARGETS = [
  { email: 'yaswanthgrandhi2580@gmail.com', role: 'admin', welcome: true, batch: true, submissions: true, inbox: true, token: true },
  { email: 'test_user_app@gmail.com', welcome: true, batch: true, unpay: ['100bm'], token: true },
  { email: 'test_demo123@gmail.com', welcome: true, batch: true, token: true },
  { email: 'test_demo@gmail.com', welcome: true, batch: true, token: true },
  { email: 'yash345@gmail.com', welcome: true, batch: true, token: true },
  { email: 'yaswanthgrandhi47@gmail.com', role: 'moderator', submissions: true, token: true },
  { email: 'rajesh@gmail.com', welcome: true, batch: true, unpay: ['lep'], token: true },
  { email: 'kumar21happysole@gmail.com', token: true },
];

/** Fields the app writes when a batch is picked (utils/lockLepBatch.js). */
const LEP_BATCH_FIELDS = ['batchId', 'cmsBatchId', 'zohoBatchKey', 'zohoRawBatch', 'batchName', 'day1Date', 'orientationDate', 'endDate', 'zohoCohortStart'];

const val = (v) => {
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
};
const plain = (doc) => Object.fromEntries(Object.entries(doc.fields || {}).map(([k, x]) => [k, val(x)]));
const fp = (...parts) => parts.map((p) => (/^[A-Za-z_][A-Za-z0-9_]*$/.test(p) ? p : `\`${p}\``)).join('.');

async function token() {
  const G = path.join(execSync('npm root -g').toString().trim(), 'firebase-tools');
  const cfg = JSON.parse(fs.readFileSync(path.join(os.homedir(), '.config/configstore/firebase-tools.json'), 'utf8'));
  const auth = require(path.join(G, 'lib/auth'));
  const scopes = require(path.join(G, 'lib/scopes'));
  return (await auth.getAccessToken(cfg.tokens.refresh_token, [scopes.CLOUD_PLATFORM])).access_token;
}

async function main() {
  const H = { Authorization: `Bearer ${await token()}`, 'Content-Type': 'application/json' };
  const query = async (collectionId, field, value, parent = '') => {
    const r = await (
      await fetch(`${API}${parent}:runQuery`, {
        method: 'POST',
        headers: H,
        body: JSON.stringify({ structuredQuery: { from: [{ collectionId }], where: { fieldFilter: { field: { fieldPath: field }, op: 'EQUAL', value: { stringValue: value } } } } }),
      })
    ).json();
    return (Array.isArray(r) ? r : []).filter((x) => x.document).map((x) => x.document);
  };
  const list = async (rel) => {
    const out = [];
    let t = '';
    do {
      const r = await (await fetch(`${API}/${rel}?pageSize=300${t ? `&pageToken=${t}` : ''}`, { headers: H })).json();
      (r.documents || []).forEach((d) => out.push(d));
      t = r.nextPageToken || '';
    } while (t);
    return out;
  };

  const writes = [];
  const backup = [];
  const report = [];

  for (const t of TARGETS) {
    let users = await query('users', 'email', t.email);
    if (t.role) users = users.filter((d) => plain(d).role === t.role);
    if (users.length !== 1) throw new Error(`${t.email}${t.role ? ` (${t.role})` : ''}: expected 1 account, found ${users.length} — nothing written.`);
    const userDoc = users[0];
    const u = plain(userDoc);
    const uid = userDoc.name.split('/').pop();
    backup.push(userDoc);
    const lines = [];
    const mask = [];
    const fields = {};

    if (t.welcome && u.welcomeCompletedAt) {
      mask.push('welcomeCompletedAt');
      lines.push(`clear welcome mark (${String(u.welcomeCompletedAt).slice(0, 10)})`);
    }
    if (t.batch) {
      const lep = u.programAccess?.lep || {};
      const had = LEP_BATCH_FIELDS.filter((f) => lep[f] != null && lep[f] !== '');
      had.forEach((f) => mask.push(fp('programAccess', 'lep', f)));
      if (u.cmsBatchId) mask.push('cmsBatchId');
      ['LEP_Batch', 'LEP_Reg_Date', 'LEP_End_Date'].forEach((f) => u.zohoLead?.[f] && mask.push(fp('zohoLead', f)));
      if (had.length || u.cmsBatchId) lines.push(`clear batch link (${lep.batchName || lep.zohoRawBatch || u.cmsBatchId})`);
    }
    for (const pid of t.unpay || []) {
      const a = u.programAccess?.[pid] || {};
      if (a.paymentStatus === 'paid' && a.razorpayPaymentId) {
        mask.push(fp('programAccess', pid, 'paymentStatus'));
        fields.programAccess = fields.programAccess || { mapValue: { fields: {} } };
        fields.programAccess.mapValue.fields[pid] = { mapValue: { fields: { paymentStatus: { stringValue: 'register' } } } };
        ['razorpayPaymentId', 'razorpayOrderId', 'fullPaidAt'].forEach((f) => a[f] != null && mask.push(fp('programAccess', pid, f)));
        lines.push(`${pid}: paid → registered (₹1 test payment ${a.razorpayPaymentId})`);
      }
    }
    if (t.token && u.fcmToken) {
      mask.push('fcmToken');
      lines.push('clear push token');
    }
    if (mask.length) writes.push({ update: { name: `${BASE}/users/${uid}`, fields }, updateMask: { fieldPaths: mask } });

    if (t.token) {
      const devices = await list(`users/${uid}/devices`);
      devices.forEach((d) => (backup.push(d), writes.push({ delete: d.name })));
      if (devices.length) lines.push(`remove ${devices.length} phone entr${devices.length > 1 ? 'ies' : 'y'}`);
    }
    if (t.submissions) {
      const subs = await query('lep_submissions', 'userId', uid);
      subs.forEach((d) => (backup.push(d), writes.push({ delete: d.name })));
      if (subs.length) lines.push(`delete ${subs.length} test submissions`);
    }
    if (t.inbox) {
      const inbox = await list(`users/${uid}/notifications`);
      inbox.forEach((d) => (backup.push(d), writes.push({ delete: d.name })));
      if (inbox.length) lines.push(`clear ${inbox.length} inbox messages`);
    }
    // Payment records stay as the money trail — only marked as test.
    for (const col of ['razorpay_orders', 'razorpay_payments']) {
      for (const d of await query(col, 'uid', uid)) {
        if (plain(d).test === true) continue;
        backup.push(d);
        writes.push({ update: { name: d.name, fields: { test: { booleanValue: true } } }, updateMask: { fieldPaths: ['test'] } });
        lines.push(`mark ${col.replace('razorpay_', 'Razorpay ').replace(/s$/, '')} ${d.name.split('/').pop()} as test (kept)`);
      }
    }
    report.push({ who: `${u.displayName || u.name || '(no name)'} · ${t.email}${t.role ? ` · ${t.role}` : ''}`, lines });
  }

  console.log(APPLY ? '\nAPPLYING reset:\n' : '\nREPORT ONLY — nothing written. Re-run with --apply to reset.\n');
  report.forEach((r) => {
    console.log(r.who);
    (r.lines.length ? r.lines : ['nothing to reset']).forEach((l) => console.log(`   • ${l}`));
  });
  console.log(`\n${writes.length} database writes for ${TARGETS.length} accounts.`);
  if (!APPLY) return;

  fs.mkdirSync(BACKUP_DIR, { recursive: true });
  const file = path.join(BACKUP_DIR, `reset-backup-${new Date().toISOString().replace(/[:.]/g, '-')}.json`);
  fs.writeFileSync(file, JSON.stringify(backup, null, 2));
  console.log(`Backup of ${backup.length} documents: ${file}`);

  for (let i = 0; i < writes.length; i += 400) {
    const r = await (await fetch(`${API.replace('/documents', '/documents')}:commit`, { method: 'POST', headers: H, body: JSON.stringify({ writes: writes.slice(i, i + 400) }) })).json();
    if (r.error) throw new Error(`Commit failed: ${r.error.message} (backup kept at ${file})`);
  }
  console.log('Done.');
}

main().catch((e) => {
  console.error('Stopped:', e.message);
  process.exit(1);
});

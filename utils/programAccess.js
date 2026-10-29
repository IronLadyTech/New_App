import {
  PROGRAM_JOURNEY,
  PAYMENT_STATUS,
  getProgramEntry,
} from '../constants/programs';

function asList(value) {
  return Array.isArray(value) ? value : [];
}

/** Match Zoho / Firestore program names (same rules as web LMS accessTiers). */
export function normalizeProgramId(value) {
  const v = String(value || '').toLowerCase().trim();
  if (!v) return null;
  if (
    ['mbw', 'master of business warfare', 'business warfare'].includes(v) ||
    v.includes('business warfare')
  ) {
    return 'mbw';
  }
  if (
    ['lep', 'leadership essentials program', 'leadership essentials'].includes(v) ||
    v.includes('leadership essentials')
  ) {
    return 'lep';
  }
  if (
    [
      '100bm',
      '100 bm',
      '100bm program',
      '100 board members program',
      '100 board members',
      '100 business minds',
    ].includes(v) ||
    /100\s*bm/.test(v) ||
    v.includes('100 board')
  ) {
    return '100bm';
  }
  const entry = getProgramEntry(v);
  return entry?.id || null;
}

/** programs may be an array, a comma string, or nested values from Zoho. */
function expandProgramValues(value) {
  if (value == null || value === '') return [];
  if (Array.isArray(value)) {
    return value.flatMap((item) => expandProgramValues(item));
  }
  return String(value)
    .split(',')
    .map((part) => part.trim())
    .filter(Boolean);
}

function paymentTier(status) {
  const n = normalizePaymentStatus(status);
  if (n === PAYMENT_STATUS.PAID) return 2;
  if (n === PAYMENT_STATUS.REGISTER) return 1;
  return 0;
}

/** Keep the stronger payment tier when Firestore/Zoho sync lags behind Razorpay. */
export function mergeProgramAccessPreservingPayment(prevAccess = {}, incomingAccess = {}) {
  const keys = new Set([
    ...Object.keys(prevAccess || {}),
    ...Object.keys(incomingAccess || {}),
  ]);
  const out = { ...(prevAccess || {}) };
  keys.forEach((pid) => {
    const prev = prevAccess?.[pid] || {};
    const inc = incomingAccess?.[pid] || {};
    const merged = { ...prev, ...inc };
    if (paymentTier(prev.paymentStatus) > paymentTier(inc.paymentStatus)) {
      merged.paymentStatus = prev.paymentStatus;
      if (prev.fullPaidAt) merged.fullPaidAt = prev.fullPaidAt;
      if (prev.razorpayPaymentId) merged.razorpayPaymentId = prev.razorpayPaymentId;
      if (prev.razorpayOrderId) merged.razorpayOrderId = prev.razorpayOrderId;
    }
    out[pid] = merged;
  });
  return out;
}

function normalizePaymentStatus(value) {
  const v = (value || '').toString().toLowerCase().trim();
  if (['paid', 'full', 'complete', 'full_payment', 'paid_full'].includes(v)) {
    return PAYMENT_STATUS.PAID;
  }
  if (
    ['register', 'registration', 'reg', 'partial', 'registration_fee', 'completed'].includes(
      v
    )
  ) {
    return PAYMENT_STATUS.REGISTER;
  }
  if (
    [
      'unpaid',
      'not paid',
      'pending',
      'none',
      '',
      'failed',
      'declined',
      'rejected',
      'cancelled',
      'canceled',
      'refunded',
      'expired',
    ].includes(v)
  ) {
    return PAYMENT_STATUS.UNPAID;
  }
  return v || PAYMENT_STATUS.UNPAID;
}

/** Programs the learner is enrolled in (Zoho + Firestore profile fields). */
export function getEnrolledProgramIds(profile) {
  const ids = new Set();
  if (!profile) return ids;

  const primaryId = normalizeProgramId(profile.program);
  if (primaryId) ids.add(primaryId);

  expandProgramValues(profile.programs).forEach((value) => {
    const id = normalizeProgramId(value);
    if (id) ids.add(id);
  });

  // A programAccess key counts only when that program has its own paid or registered tier.
  // An empty key must not inherit another program's payment.
  Object.entries(profile.programAccess || {}).forEach(([programId, access]) => {
    const id = normalizeProgramId(programId);
    if (!id || !access?.paymentStatus) return;
    if (normalizePaymentStatus(access.paymentStatus) === PAYMENT_STATUS.UNPAID) return;
    ids.add(id);
  });

  expandProgramValues(readLeadField(profile, ['Enrolled_Courses', 'enrolledCourses'])).forEach((value) => {
    const id = normalizeProgramId(value);
    if (id) ids.add(id);
  });

  String(readLeadField(profile, ['Products Purchased', 'Products_Purchased']) || '')
    .split(',')
    .map((part) => part.trim())
    .filter((part) => part && !/^mc$/i.test(part) && !/\bft\b/i.test(part))
    .forEach((value) => {
      const id = normalizeProgramId(value);
      if (id) ids.add(id);
    });

  for (const id of ['lep', '100bm', 'mbw']) {
    if (zohoProgramLive(profile, id)) ids.add(id);
  }

  return ids;
}

export function getEnrolledPrograms(profile) {
  const ids = getEnrolledProgramIds(profile);
  return PROGRAM_JOURNEY.filter((p) => ids.has(p.id));
}

/** Enrolled programs, plus any program that has its own Zoho batch field. */
export function programsOnProfile(profile) {
  const ids = getEnrolledProgramIds(profile);
  for (const id of ['lep', '100bm', 'mbw']) {
    if (learnerBatchLabel(profile, id)) ids.add(id);
  }
  return PROGRAM_JOURNEY.filter((p) => ids.has(p.id));
}

export function canAccessProgram(programIdOrCode, profile) {
  const entry = getProgramEntry(programIdOrCode);
  if (!entry || !profile) return false;
  return getEnrolledProgramIds(profile).has(entry.id);
}

/** Programs on this account. Everything else stays visible but locked. */
export function lockedProgramIds(profile) {
  const ids = getEnrolledProgramIds(profile);
  const lab = normalizeProgramId(profile?.labProgram);
  if (lab) ids.add(lab);
  const locked = new Set(['lep', '100bm', 'mbw'].filter((id) => !ids.has(id)));
  if (!(ids.has('lep') && ids.has('100bm'))) locked.add('all');
  return locked;
}

function namedOnProfile(profile, programId) {
  const id = normalizeProgramId(programId);
  if (!id || !profile) return false;
  if (normalizeProgramId(profile.program) === id) return true;
  return expandProgramValues(profile.programs).some((value) => normalizeProgramId(value) === id);
}

function paymentFromZohoLead(profile, programId) {
  const zoho = zohoPaymentDetail(profile, programId);
  const raw = String(zoho.status || '').toLowerCase();
  if (!raw) return null;
  if (/full|paid\s*in\s*full|complete|100\s*%|fully/i.test(raw)) return PAYMENT_STATUS.PAID;
  if (/register|registration|partial|part|balance|due|pending/i.test(raw)) return PAYMENT_STATUS.REGISTER;
  return null;
}

export function programPaymentStatus(profile, programId) {
  const id = normalizeProgramId(programId);
  const perProgram = id ? profile?.programAccess?.[id]?.paymentStatus : null;
  let tier = perProgram
    ? normalizePaymentStatus(perProgram)
    : namedOnProfile(profile, id)
      ? normalizePaymentStatus(profile?.paymentStatus)
      : PAYMENT_STATUS.UNPAID;
  const fromZoho = paymentFromZohoLead(profile, id);
  // Zoho balance-due must not show as fully enrolled in the app.
  if (tier === PAYMENT_STATUS.PAID && fromZoho === PAYMENT_STATUS.REGISTER) {
    tier = PAYMENT_STATUS.REGISTER;
  }
  if (tier === PAYMENT_STATUS.UNPAID && fromZoho) tier = fromZoho;
  return tier;
}

/** Enrolled + not unpaid → can open tasks (matches web canOpenProgramTasks). */
export function canOpenProgramTasks(programIdOrCode, profile) {
  const entry = getProgramEntry(programIdOrCode);
  if (!entry) return false;
  if (!canAccessProgram(entry.id, profile)) return false;
  return programPaymentStatus(profile, entry.id) !== PAYMENT_STATUS.UNPAID;
}

function primaryProgramId(profile) {
  const ids = getEnrolledProgramIds(profile);
  if (ids.has('lep')) return 'lep';
  const first = [...ids][0];
  return first || normalizeProgramId(profile?.program) || null;
}

function cleanBatchId(value) {
  const id = String(value || '').trim();
  if (!id || id === 'default' || id === '#batch') return null;
  return id;
}

function cleanBatchLabel(value) {
  const name = String(value || '').trim();
  if (!name || name === 'default' || name === '#batch') return null;
  return name;
}

/** Zoho batch date range like `14/10/2026 - 14/11/2026` (not a free-text name). */
export function isZohoBatchDateRange(value) {
  const text = String(value || '').trim();
  if (!text) return false;
  return /^\d{1,2}\/\d{1,2}\/\d{2,4}\s*[-–—]\s*\d{1,2}\/\d{1,2}\/\d{2,4}$/.test(text);
}

function leadKey(value) {
  return String(value || '').toLowerCase().replace(/[^a-z0-9]/g, '');
}

/**
 * Zoho Leads API names (primary), plus display labels as fallbacks.
 * LEP_Reg_Date label in CRM is "LEP Start Date". BM_Reg_Date1 is 100BM start.
 * LEP_Registration_Date / BM_Registration_Date are payment registration dates (paidOn).
 */
const ZOHO_LEAD_FIELDS = {
  lep: {
    batch: ['LEP_Batch', 'LEP Batch'],
    start: ['LEP_Reg_Date', 'LEP Start Date'],
    end: ['LEP_End_Date', 'LEP End Date'],
    status: ['LEP_Status', 'LEP Status'],
    active: ['LEP_Active_Status', 'LEP Active Status'],
    amount: [
      'LEP_Full_Amount',
      'LEP Enrollment Amount',
      'LEP_Payment_Amount',
      'LEP Payment Amount',
    ],
    txn: [
      'LEP_Enrollment_Transaction_Id',
      'LEP Enrollment Transaction Id',
      'LEP_Registration_Transaction_Id',
      'LEP Registration Transaction Id',
    ],
    paidOn: ['LEP_Registration_Date', 'LEP Registration Date'],
    payStatus: [
      'LEP_Registration_Payment_Status',
      'LEP_Payment_Status',
      'LEP Payment Status',
    ],
  },
  '100bm': {
    batch: ['BM_Batch', '100 BM Batch', '100BM Batch', '100_BM_Batch', '100BM_Batch'],
    start: ['BM_Reg_Date1', '100 BM Start Date', '100BM Start Date'],
    end: ['BM_End_Date', '100 BM End Date', '100BM End Date'],
    status: ['BM_Status', '100BM Status', '100 BM Status', '100_BM_Status'],
    active: ['BM_Active_Status', '100 BM Active Status', '100BM Active Status', '100_BM_Active_Status'],
    amount: ['BM_Payment_Amount', '100 BM Payment Amount', '100BM Payment Amount', '100_BM_Payment_Amount'],
    txn: [
      'BM_Payment_Transaction_ID',
      '100 BM Registration Payment Transaction ID',
      '100_BM_Registration_Payment_Transaction_ID',
    ],
    paidOn: [
      'BM_Registration_Date',
      '100 BM Registration Date',
      '100BM Registration Date',
      '100_BM_Registration_Date',
    ],
    payStatus: [
      'BM_Payment_Status',
      '100 BM Payment Status',
      '100BM Payment Status',
      '100_BM_Payment_Status',
    ],
  },
  mbw: {
    batch: ['MBW_Batch', 'MBW Batch'],
    start: ['MBW_Reg_Date', 'MBW Start Date', 'MBW_Start_Date'],
    end: ['MBW_End_Date', 'MBW End Date'],
    status: ['MBW_Status', 'MBW Status'],
    active: ['MBW_Active_Status', 'MBW Active Status'],
    amount: ['MBW_Payment_Amount', 'MBW Payment Amount'],
    txn: [
      'MBW_Enrollment_Payment_Transaction_ID',
      'MBW Registration Payment Transaction ID',
      'MBW_Registration_Payment_Transaction_ID',
    ],
    paidOn: ['MBW_Registration_Date', 'MBW Registration Date'],
    payStatus: ['MBW_Payment_Status', 'MBW Payment Status'],
  },
};

const BHAG_FIELDS = [
  'Month_B_HAG',
  'B-HAG (Next 3 month)',
  'B_HAG_Next_3_month',
  'BHAG_Next_3_month',
  'bhag',
  'bHag',
  'threeMonthGoal',
];

const LIVE_STATUS = /^(ongoing|enrolled|active|undergoing|yes)$/i;

function leadBags(profile) {
  if (!profile || typeof profile !== 'object') return [];
  const bags = [profile];
  for (const value of Object.values(profile)) {
    if (!value || typeof value !== 'object' || Array.isArray(value)) continue;
    bags.push(value);
    for (const nested of Object.values(value)) {
      if (nested && typeof nested === 'object' && !Array.isArray(nested)) bags.push(nested);
    }
  }
  return bags;
}

function leadScalar(value) {
  if (value == null) return '';
  if (typeof value === 'number' || typeof value === 'boolean') return String(value).trim();
  if (typeof value === 'string') return value.trim();
  if (typeof value !== 'object') return '';
  if (typeof value.toDate === 'function') {
    try {
      const date = value.toDate();
      if (date instanceof Date && !Number.isNaN(date.getTime())) {
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        return `${date.getFullYear()}-${month}-${day}`;
      }
    } catch {
      return '';
    }
  }
  if (Array.isArray(value)) return value.map(leadScalar).find(Boolean) || '';
  const picked = value.name ?? value.display_value ?? value.displayValue ?? value.id;
  if (picked == null || typeof picked === 'object') return '';
  return String(picked).trim();
}

function usableLeadText(value) {
  const text = leadScalar(value);
  if (!text) return '';
  const v = text.toLowerCase().replace(/\s+/g, ' ');
  if (
    v.includes('check with the learner') ||
    v.includes('please check') ||
    ['n/a', 'na', 'none', 'nil', '-', '--', 'tbd', 'unknown'].includes(v)
  ) {
    return '';
  }
  return text;
}

function readLeadField(profile, names) {
  const want = new Set(names.map(leadKey));
  for (const bag of leadBags(profile)) {
    for (const [key, value] of Object.entries(bag)) {
      if (!want.has(leadKey(key))) continue;
      const text = leadScalar(value);
      if (text && text !== 'default' && text !== '#batch') return text;
    }
  }
  return null;
}

/** True when a Zoho field key exists on the lead snapshot (even if the value is blank). */
function leadFieldKeyPresent(profile, names) {
  const want = new Set(names.map(leadKey));
  for (const bag of leadBags(profile)) {
    for (const key of Object.keys(bag)) {
      if (want.has(leadKey(key))) return true;
    }
  }
  return false;
}

function zohoProgramLive(profile, programId) {
  const spec = ZOHO_LEAD_FIELDS[normalizeProgramId(programId)];
  if (!spec) return false;
  const status = readLeadField(profile, spec.status);
  const active = readLeadField(profile, spec.active);
  return LIVE_STATUS.test(status || '') || LIVE_STATUS.test(active || '');
}

function acceptedBhag(value) {
  const text = usableLeadText(value);
  if (!text || /^(yes|no|done|completed)$/i.test(text)) return '';
  return text;
}

/** Zoho Leads "B-HAG (Next 3 month)", plus any other lead field whose name contains B-HAG. */
export function learnerBhagText(profile) {
  const direct = acceptedBhag(readLeadField(profile, BHAG_FIELDS));
  if (direct) return direct;
  for (const bag of leadBags(profile)) {
    for (const [key, value] of Object.entries(bag)) {
      if (!leadKey(key).includes('bhag')) continue;
      const text = acceptedBhag(value);
      if (text) return text;
    }
  }
  const fromMirror = acceptedBhag(profile?.zohoLead?.Month_B_HAG || profile?.zohoLead?.LMS_BHAG);
  if (fromMirror) return fromMirror;
  // App-saved goal before Zoho catch-up (welcome / profile).
  return acceptedBhag(profile?.bhag) || '';
}

const DOMAIN_LEAD_FIELDS = [
  'Industry/Field of Work',
  'Industry_Field_of_Work',
  'Industry',
  'Field of Work',
  'Field_of_Work',
];

/**
 * Field of work / domain from profile + Zoho lead.
 * Used so welcome/profile/Zoho all suppress the “pick your field” IL Guide prompt.
 */
export function learnerDomainText(profile) {
  if (!profile || typeof profile !== 'object') return '';
  const fromApp = usableLeadText(
    profile.domain ||
      profile.leadershipRole ||
      profile.fieldOfWork ||
      profile.workDomain ||
      profile.industry ||
      profile.roleTitle ||
      profile.jobTitle ||
      profile.zohoLead?.Industry_Field_of_Work ||
      profile.zohoLead?.Industry ||
      profile.zohoLead?.LMS_Domain ||
      profile.Industry_Field_of_Work ||
      profile['Industry/Field of Work']
  );
  if (fromApp) return fromApp;
  return usableLeadText(readLeadField(profile, DOMAIN_LEAD_FIELDS)) || '';
}

/** City / location for welcome + profile (Zoho + app-saved). */
export function learnerCityText(profile) {
  if (!profile || typeof profile !== 'object') return '';
  return (
    usableLeadText(
      profile.city ||
        profile.City ||
        profile.location ||
        profile.currentCity ||
        profile.zohoLead?.City ||
        readLeadField(profile, ['City', 'Location', 'Current_City', 'Current City'])
    ) || ''
  );
}

/** Welcome screen: city, field of work, 3-month goal. */
export function readWelcomeFields(source) {
  if (!source || typeof source !== 'object') {
    return { city: '', domain: '', bhag: '' };
  }
  return {
    city: learnerCityText(source),
    domain: learnerDomainText(source),
    bhag: learnerBhagText(source),
  };
}

/** Keep learner-edited welcome fields when Firestore snapshots omit them. */
export function mergeWelcomeProfilePreserving(prev, incoming) {
  const next = readWelcomeFields(incoming);
  const keep = readWelcomeFields(prev);
  const city = next.city || keep.city;
  const domain = next.domain || keep.domain;
  const bhag = next.bhag || keep.bhag;
  return {
    city,
    domain,
    bhag,
    leadershipRole:
      usableLeadText(incoming?.leadershipRole) ||
      usableLeadText(prev?.leadershipRole) ||
      domain,
  };
}

const ENROLLMENT_DETAIL_FIELDS = ['Program Enrollment Details', 'Program_Enrollment_Details'];
const REGISTRATION_DETAIL_FIELDS = ['Program Registration Details', 'Program_Registration_Details'];

function programIdsInFieldValue(value) {
  const ids = new Set();
  const chunks = Array.isArray(value) ? value : [value];
  chunks.forEach((chunk) => {
    String(leadScalar(chunk) || '')
      .split(/[,;\n]+/)
      .forEach((part) => {
        const id = normalizeProgramId(part);
        if (id) ids.add(id);
      });
  });
  return ids;
}

function programIdsFromFields(profile, names) {
  const ids = new Set();
  const want = new Set(names.map(leadKey));
  for (const bag of leadBags(profile)) {
    for (const [key, value] of Object.entries(bag)) {
      if (!want.has(leadKey(key))) continue;
      programIdsInFieldValue(value).forEach((id) => ids.add(id));
    }
  }
  return ids;
}

/**
 * Per program: Contacts or Program Enrollment Details = Enrolled.
 * IL Registration or Program Registration Details = Registered.
 * Enrollment wins when a program is in both. Payment is the backup
 * when those module fields are not on the profile.
 */
export function learnerEnrollmentLabel(profile, programId) {
  const pid = normalizeProgramId(programId);
  if (!pid || !getEnrolledProgramIds(profile).has(pid)) return 'Locked';

  const pay = programPaymentStatus(profile, pid);
  if (pay === PAYMENT_STATUS.PAID) return 'Enrolled';
  if (pay === PAYMENT_STATUS.REGISTER) return 'Registered';

  const enrolled = programIdsFromFields(profile, ENROLLMENT_DETAIL_FIELDS);
  const registered = programIdsFromFields(profile, REGISTRATION_DETAIL_FIELDS);
  if (enrolled.has(pid)) return 'Enrolled';
  if (registered.has(pid)) return 'Registered';
  return 'Locked';
}

/** Zoho Leads status, e.g. LEP Status "Ongoing" or MBW Status "Enrolled". */
export function learnerProgramStatus(profile, programId) {
  const spec = ZOHO_LEAD_FIELDS[normalizeProgramId(programId)];
  if (!spec) return null;
  return readLeadField(profile, spec.status) || readLeadField(profile, spec.active);
}

/** Normalize Zoho date values to YYYY-MM-DD when possible. */
function toIsoDate(value) {
  const text = leadScalar(value);
  if (!text) return '';
  const iso = /^(\d{4})-(\d{2})-(\d{2})/.exec(text);
  if (iso) return `${iso[1]}-${iso[2]}-${iso[3]}`;
  const dmy = /^(\d{1,2})\/(\d{1,2})\/(\d{4})$/.exec(text);
  if (dmy) {
    return `${dmy[3]}-${String(dmy[2]).padStart(2, '0')}-${String(dmy[1]).padStart(2, '0')}`;
  }
  return '';
}

/**
 * Program start / end from Zoho:
 * LEP → LEP_Reg_Date (start) + LEP_End_Date
 * 100BM → BM_Reg_Date1 + BM_End_Date
 */
export function learnerProgramDates(profile, programId) {
  const spec = ZOHO_LEAD_FIELDS[normalizeProgramId(programId)];
  if (!spec) return { start: '', end: '' };
  return {
    start: toIsoDate(readLeadField(profile, spec.start)),
    end: toIsoDate(readLeadField(profile, spec.end)),
  };
}

/** Name, role, city, and experience from the Zoho lead. Empty staff notes are dropped. */
export function learnerLeadDetails(profile) {
  const experience = usableLeadText(
    profile?.experience ||
      profile?.zohoLead?.Total_Years_Of_Experience ||
      readLeadField(profile, [
        'Total Years Of Experience.',
        'Total Years Of Experience',
        'Total_Years_Of_Experience',
        'Years_of_Experience',
        'Experience',
        'experience',
      ])
  );
  const experienceLabel = experience
    ? /\byears?\b/i.test(experience)
      ? experience
      : `${experience.replace(/\s*years?$/i, '')} years`
    : '';
  return {
    name: usableLeadText(readLeadField(profile, ['Full_Name', 'Full Name', 'Lead Name', 'displayName'])),
    city: usableLeadText(readLeadField(profile, ['City', 'city'])),
    designation: usableLeadText(
      readLeadField(profile, ['Designation/Title', 'Designation', 'Designation_Title'])
    ),
    industry: usableLeadText(
      readLeadField(profile, ['Industry/Field of Work', 'Industry_Field_of_Work', 'Industry'])
    ),
    experience: experienceLabel,
  };
}

/** Zoho payment line for one program: amount, status, transaction, registration date. */
export function zohoPaymentDetail(profile, programId) {
  const spec = ZOHO_LEAD_FIELDS[normalizeProgramId(programId)];
  if (!spec) return { amount: null, status: '', txn: '', paidOn: '' };
  return {
    amount: zohoRegistrationAmount(profile, programId),
    status: usableLeadText(readLeadField(profile, spec.payStatus || [])),
    txn: usableLeadText(readLeadField(profile, spec.txn || [])),
    paidOn: usableLeadText(readLeadField(profile, spec.paidOn || [])),
  };
}

/** The registration payment's own reference — not the balance one, which shares the `txn` list above. */
const REGISTRATION_TXN_FIELDS = {
  lep: ['LEP_Registration_Transaction_Id', 'LEP Registration Transaction Id'],
};

/** Zoho Leads registration transaction id, or null when Zoho does not have it. */
export function zohoRegistrationTxn(profile, programId) {
  const names = REGISTRATION_TXN_FIELDS[normalizeProgramId(programId)];
  return names ? usableLeadText(readLeadField(profile, names)) || null : null;
}

/** Zoho Leads registration amount, e.g. LEP Payment Amount 2999. */
export function zohoRegistrationAmount(profile, programId) {
  const spec = ZOHO_LEAD_FIELDS[normalizeProgramId(programId)];
  if (!spec) return null;
  const raw = readLeadField(profile, spec.amount);
  if (!raw) return null;
  const amount = Number(String(raw).replace(/[^0-9.]/g, ''));
  return Number.isFinite(amount) && amount > 0 ? amount : null;
}

function zohoBatchRange(profile, programId) {
  const spec = ZOHO_LEAD_FIELDS[normalizeProgramId(programId)];
  if (!spec) return null;
  return cleanBatchLabel(readLeadField(profile, spec.batch));
}

/** Live Zoho Leads batch field only (e.g. LEP_Batch). Empty when Zoho has no date. */
export function zohoLeadBatchLabel(profile, programId) {
  return zohoBatchRange(profile, programId);
}

/** True when this profile already carries a Zoho lead snapshot (refreshMyAccess ran). */
function hasZohoLeadSnapshot(profile) {
  if (!profile || typeof profile !== 'object') return false;
  if (profile.zohoLeadId || profile.leadId || profile.zohoId) return true;
  for (const spec of Object.values(ZOHO_LEAD_FIELDS)) {
    if (readLeadField(profile, spec.status) || readLeadField(profile, spec.active)) return true;
    // Blank LEP_Batch / BM_Batch still counts — Zoho was read; do not show stale dates.
    if (leadFieldKeyPresent(profile, spec.batch)) return true;
  }
  const nested = profile.zoho || profile.lead || profile.zohoLead;
  return Boolean(nested && typeof nested === 'object');
}

function looksLikeRecordId(value) {
  return /^\d{10,}$/.test(String(value || '').trim());
}

function namedBatch(profile, pid, access) {
  // Prefer live Zoho Lead batch field. When Zoho was synced and batch is empty,
  // never fall back to a stale Firestore/CMS date range.
  const fromLead = zohoBatchRange(profile, pid);
  if (fromLead) return fromLead;

  const fromZohoCopy =
    cleanBatchLabel(access?.zohoRawBatch) || cleanBatchLabel(access?.zohoBatchKey);
  if (fromZohoCopy && isZohoBatchDateRange(fromZohoCopy)) return fromZohoCopy;
  if (hasZohoLeadSnapshot(profile)) return null;

  const fromAccess = cleanBatchLabel(access?.batch);
  const id = cleanBatchId(access?.batchId);
  const accessBatch =
    fromAccess && ((id && fromAccess === id) || looksLikeRecordId(fromAccess)) ? null : fromAccess;
  if (accessBatch && isZohoBatchDateRange(accessBatch)) return accessBatch;

  // Desk-style names only when they came from Zoho range formatting — not CMS QA labels.
  const named = cleanBatchLabel(access?.batchName);
  if (named && isZohoBatchDateRange(named)) return named;
  return null;
}

/** Zoho writes each program's batch on programAccess[programId]. */
function batchAccess(profile, programId) {
  const pid = normalizeProgramId(programId) || primaryProgramId(profile);
  return { pid, access: pid ? profile?.programAccess?.[pid] || null : null };
}

function mayUseTopLevelBatch(profile, pid, programId) {
  if (!programId) return true;
  return !pid || pid === primaryProgramId(profile);
}

/** Batch id for submissions and calendar filtering (Zoho → Firestore via refreshMyAccess). */
export function learnerBatchId(profile, programId) {
  const { pid, access } = batchAccess(profile, programId);
  const own = cleanBatchId(access?.batchId) || cleanBatchId(access?.batch);
  if (own) return own;
  if (!mayUseTopLevelBatch(profile, pid, programId)) return 'default';
  return cleanBatchId(profile?.batchId) || cleanBatchId(profile?.batch) || 'default';
}

/** That program's Leads Batch field only. LEP Batch, 100 BM Batch, or MBW Batch. */
export function learnerBatchLabel(profile, programId) {
  const { pid, access } = batchAccess(profile, programId);
  return namedBatch(profile, pid, access);
}

/** CRM, Firestore, or app signup already tied this learner to an LEP cohort. */
export function lepBatchIsAssigned(profile) {
  if (!profile) return false;
  const access = profile?.programAccess?.lep || {};
  if (String(access.cmsBatchId || profile.cmsBatchId || '').trim()) return true;
  if (cleanBatchLabel(access.zohoRawBatch) || cleanBatchLabel(access.zohoBatchKey)) return true;
  const label = learnerBatchLabel(profile, 'lep');
  if (label) return true;
  const name = cleanBatchLabel(access.batchName) || cleanBatchLabel(access.batch);
  if (name) return true;
  // Zoho LEP_Reg_Date (= LEP Start Date) means a cohort start is already set.
  if (learnerProgramDates(profile, 'lep').start) return true;
  const id = learnerBatchId(profile, 'lep');
  return Boolean(id && id !== 'default');
}

/**
 * LEP Registered vs Enrolled (same as web LMS):
 * - Registered: `programAccess.lep.paymentStatus` → register (or legacy paymentStatus)
 * - Enrolled: paymentStatus → paid (full programme fee)
 * Home UI: `isLepEnrolled(profile)` in utils/lepState.js → EnrolledHome vs RegisteredHome.
 */
export function isLepRegistered(profile) {
  return programPaymentStatus(profile, 'lep') === PAYMENT_STATUS.REGISTER;
}

export function isLepEnrolledPayment(profile) {
  return programPaymentStatus(profile, 'lep') === PAYMENT_STATUS.PAID;
}

/** Onboarding batch picker — only when LEP is active and Zoho has no batch yet. */
export function needsLepBatchSelection(profile) {
  if (!profile || lepBatchIsAssigned(profile)) return false;
  const pay = programPaymentStatus(profile, 'lep');
  return pay === PAYMENT_STATUS.REGISTER || pay === PAYMENT_STATUS.PAID;
}

export function bmCohortIsAssigned(profile) {
  const access = profile?.programAccess?.['100bm'] || {};
  if (String(access.cohortConfirmedAt || '').trim()) return true;
  if (String(access.startDate || '').trim() && String(access.endDate || '').trim()) return true;
  if (cleanBatchLabel(access.zohoRawBatch) || cleanBatchLabel(access.zohoBatchKey)) return true;
  if (learnerProgramDates(profile, '100bm').start) return true;
  return false;
}

/** After 100BM balance payment — cohort start must be confirmed before Zoho blueprint fields. */
export function needs100bmCohortConfirm(profile) {
  if (!profile || bmCohortIsAssigned(profile)) return false;
  return programPaymentStatus(profile, '100bm') === PAYMENT_STATUS.PAID;
}

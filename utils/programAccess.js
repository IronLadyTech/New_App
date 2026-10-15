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

  // Zoho writes per-program tiers here; always treat as enrolled (payment gates tasks).
  Object.keys(profile.programAccess || {}).forEach((programId) => {
    const id = normalizeProgramId(programId);
    if (id) ids.add(id);
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

export function programPaymentStatus(profile, programId) {
  const perProgram = profile?.programAccess?.[programId]?.paymentStatus;
  if (perProgram) return normalizePaymentStatus(perProgram);
  return normalizePaymentStatus(profile?.paymentStatus);
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

function leadKey(value) {
  return String(value || '').toLowerCase().replace(/[^a-z0-9]/g, '');
}

/** Zoho Leads labels, and the same names with underscores. */
const ZOHO_LEAD_FIELDS = {
  lep: {
    batch: ['LEP Batch', 'LEP_Batch'],
    start: ['LEP Start Date', 'LEP_Start_Date', 'LEP_Reg_Date'],
    end: ['LEP End Date', 'LEP_End_Date'],
    status: ['LEP Status', 'LEP_Status'],
    active: ['LEP Active Status', 'LEP_Active_Status'],
    amount: ['LEP Payment Amount', 'LEP_Payment_Amount'],
    txn: ['LEP Registration Transaction Id', 'LEP_Registration_Transaction_Id'],
    paidOn: ['LEP Registration Date', 'LEP_Registration_Date'],
    payStatus: ['LEP Payment Status', 'LEP_Payment_Status'],
  },
  '100bm': {
    batch: ['100 BM Batch', '100BM Batch', '100_BM_Batch', '100BM_Batch', 'BM_Batch'],
    start: ['100 BM Start Date', '100_BM_Start_Date', '100BM Start Date', 'BM_Reg_Date1'],
    end: ['100 BM End Date', '100_BM_End_Date', '100BM End Date', 'BM_End_Date'],
    status: ['100BM Status', '100 BM Status', '100_BM_Status'],
    active: ['100 BM Active Status', '100BM Active Status', '100_BM_Active_Status'],
    amount: ['100 BM Payment Amount', '100BM Payment Amount', '100_BM_Payment_Amount'],
    txn: ['100 BM Registration Payment Transaction ID', '100_BM_Registration_Payment_Transaction_ID'],
    paidOn: ['100 BM Registration Date', '100BM Registration Date', '100_BM_Registration_Date'],
    payStatus: ['100 BM Payment Status', '100BM Payment Status', '100_BM_Payment_Status'],
  },
  mbw: {
    batch: ['MBW Batch', 'MBW_Batch'],
    start: ['MBW Start Date', 'MBW_Start_Date', 'MBW_Reg_Date'],
    end: ['MBW End Date', 'MBW_End_Date'],
    status: ['MBW Status', 'MBW_Status'],
    active: ['MBW Active Status', 'MBW_Active_Status'],
    amount: ['MBW Payment Amount', 'MBW_Payment_Amount'],
    txn: ['MBW Registration Payment Transaction ID', 'MBW_Registration_Payment_Transaction_ID'],
    paidOn: ['MBW Registration Date', 'MBW_Registration_Date'],
    payStatus: ['MBW Payment Status', 'MBW_Payment_Status'],
  },
};

const BHAG_FIELDS = [
  'B-HAG (Next 3 month)',
  'B_HAG_Next_3_month',
  'BHAG_Next_3_month',
  'Month_B_HAG',
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
  return '';
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
  const enrolled = programIdsFromFields(profile, ENROLLMENT_DETAIL_FIELDS);
  const registered = programIdsFromFields(profile, REGISTRATION_DETAIL_FIELDS);
  if (enrolled.size || registered.size) {
    return pid && enrolled.has(pid) ? 'Enrolled' : 'Registered';
  }

  const perProgram = pid ? profile?.programAccess?.[pid]?.paymentStatus : null;
  const pay = perProgram ? normalizePaymentStatus(perProgram) : programPaymentStatus(profile, programId);
  return pay === PAYMENT_STATUS.PAID ? 'Enrolled' : 'Registered';
}

/** Zoho Leads status, e.g. LEP Status "Ongoing" or MBW Status "Enrolled". */
export function learnerProgramStatus(profile, programId) {
  const spec = ZOHO_LEAD_FIELDS[normalizeProgramId(programId)];
  if (!spec) return null;
  return readLeadField(profile, spec.status) || readLeadField(profile, spec.active);
}

/** Name, role, city, and experience from the Zoho lead. Empty staff notes are dropped. */
export function learnerLeadDetails(profile) {
  const experience = usableLeadText(
    readLeadField(profile, [
      'Total Years Of Experience.',
      'Total Years Of Experience',
      'Total_Years_Of_Experience',
      'Years_of_Experience',
      'Experience',
      'experience',
    ])
  );
  return {
    name: usableLeadText(readLeadField(profile, ['Full_Name', 'Full Name', 'Lead Name', 'displayName'])),
    city: usableLeadText(readLeadField(profile, ['City', 'city'])),
    designation: usableLeadText(
      readLeadField(profile, ['Designation/Title', 'Designation', 'Designation_Title'])
    ),
    industry: usableLeadText(
      readLeadField(profile, ['Industry/Field of Work', 'Industry_Field_of_Work', 'Industry'])
    ),
    experience: experience ? `${experience.replace(/\s*years?$/i, '')} years` : '',
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

function looksLikeRecordId(value) {
  return /^\d{10,}$/.test(String(value || '').trim());
}

function namedBatch(profile, pid, access) {
  const fromAccess = cleanBatchLabel(access?.batch);
  const id = cleanBatchId(access?.batchId);
  const accessBatch =
    fromAccess && ((id && fromAccess === id) || looksLikeRecordId(fromAccess)) ? null : fromAccess;
  return (
    zohoBatchRange(profile, pid) ||
    cleanBatchLabel(access?.zohoRawBatch) ||
    cleanBatchLabel(access?.batchName) ||
    accessBatch
  );
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

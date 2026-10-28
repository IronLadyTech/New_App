import { PAYMENT_STATUS, getProgramEntry, REGISTRATION_FEE } from '../constants/programs';
import { resolveCmsBatchSessions } from './cmsBatchSessions';
import { lepFirstName, lepFullName } from './lepState';
import { buildLepBatchSessions } from './lepBatchSchedule';
import { formatLepDay } from './registeredHomeData';
import { getEnrolledPrograms, learnerProgramDates, programPaymentStatus } from './programAccess';

function formatTimeRangeIst(startTime, endTime) {
  const fmt = (hhmm) => {
    const [h, m] = String(hhmm || '0:0').split(':').map((x) => parseInt(x, 10) || 0);
    const am = h < 12;
    const hour = h % 12 || 12;
    return `${hour}:${String(m).padStart(2, '0')} ${am ? 'AM' : 'PM'}`;
  };
  return `${fmt(startTime)} – ${fmt(endTime)} IST`;
}

function resolveDay1Iso(profile, cmsBatch, pickedBatch) {
  const access = profile?.programAccess?.lep || {};
  const zoho = learnerProgramDates(profile, 'lep');
  return (
    cmsBatch?.day1Date ||
    access.day1Date ||
    pickedBatch?.day1Date ||
    zoho.start ||
    ''
  )
    .toString()
    .slice(0, 10);
}

function sessionToEnrollmentRow(session, dayLabel) {
  const day = formatLepDay(session.date);
  const time = formatTimeRangeIst(session.startTime, session.endTime);
  return {
    dayLabel,
    title: day ? `${day} · ${time}` : time,
    subtitle: 'Full day, live on Zoom',
    dateIso: session.date,
    startTime: session.startTime,
    endTime: session.endTime,
  };
}

/** Day 1 / Day 2 lines for seat-held + payment screens (CMS → profile → picked batch). */
export function buildEnrollmentBatchSessions(profile, { cmsBatch, pickedBatch, events = [] } = {}) {
  const day1Iso = resolveDay1Iso(profile, cmsBatch, pickedBatch);

  if (cmsBatch && (cmsBatch.day1Date || cmsBatch.orientationDate || day1Iso)) {
    const resolved = resolveCmsBatchSessions(cmsBatch, { day1Iso });
    const s1 = resolved.find((s) => s.code === 'S1');
    const s2 = resolved.find((s) => s.code === 'S2');
    if (s1 && s2) {
      return [sessionToEnrollmentRow(s1, 'DAY 1'), sessionToEnrollmentRow(s2, 'DAY 2')];
    }
  }

  if (day1Iso) {
    const built = buildLepBatchSessions({ anchor: 'day1', date: day1Iso });
    const s1 = built.find((s) => s.code === 'S1');
    const s2 = built.find((s) => s.code === 'S2');
    if (s1 && s2) {
      return [sessionToEnrollmentRow(s1, 'DAY 1'), sessionToEnrollmentRow(s2, 'DAY 2')];
    }
  }

  if (pickedBatch?.day1 && pickedBatch?.day2) {
    return [
      { dayLabel: 'DAY 1', title: pickedBatch.day1, subtitle: 'Full day, live on Zoom' },
      { dayLabel: 'DAY 2', title: pickedBatch.day2, subtitle: 'Full day, live on Zoom' },
    ];
  }

  const fromEvents = buildBatchSessionsFromEvents(events);
  if (fromEvents?.length) return fromEvents;

  return [
    {
      dayLabel: 'DAY 1',
      title: 'Batch dates appear after you choose Day 1',
      subtitle: 'Full day, live on Zoom',
      placeholder: true,
    },
    {
      dayLabel: 'DAY 2',
      title: 'Day 2 follows your Saturday batch',
      subtitle: 'Full day, live on Zoom',
      placeholder: true,
    },
  ];
}

function batchHeadingLabel(profile, cmsBatch, pickedBatch) {
  const name =
    cmsBatch?.name ||
    pickedBatch?.name ||
    pickedBatch?.title ||
    profile?.programAccess?.lep?.batchName ||
    '';
  return name ? `Your batch · ${name}` : 'Your batch';
}

function formatInr(amount) {
  if (amount == null || Number.isNaN(Number(amount))) return null;
  return `₹ ${Number(amount).toLocaleString('en-IN')}`;
}

function formatShortDate(value) {
  if (!value) return null;
  const d =
    value?.toDate?.() ||
    (typeof value === 'string' || typeof value === 'number' ? new Date(value) : null);
  if (!d || Number.isNaN(d.getTime())) return null;
  return d.toLocaleDateString('en-GB', { day: 'numeric', month: 'short' }).toUpperCase();
}

function addDays(date, days) {
  const d = new Date(date);
  d.setDate(d.getDate() + days);
  return d;
}

function payerContact(profile, user) {
  return {
    name: lepFullName(profile) || user?.displayName || '',
    email: profile?.email || user?.email || '',
    phone: profile?.phoneNumber || profile?.phone || user?.phoneNumber || '',
  };
}

/** Programme that still owes the balance payment (LEP before 100BM in journey order). */
export function programIdNeedingBalancePayment(profile) {
  const enrolled = getEnrolledPrograms(profile);
  const owing = enrolled.filter(
    (p) => programPaymentStatus(profile, p.id) === PAYMENT_STATUS.REGISTER
  );
  if (owing.length) return owing[0].id;
  const unpaid = enrolled.find(
    (p) => programPaymentStatus(profile, p.id) !== PAYMENT_STATUS.PAID
  );
  return unpaid?.id || enrolled[0]?.id || 'lep';
}

function pickProgram(profile, programId) {
  const enrolled = getEnrolledPrograms(profile);
  if (programId) {
    const match = enrolled.find((p) => p.id === programId) || getProgramEntry(programId);
    if (match) return match;
  }
  const owingId = programIdNeedingBalancePayment(profile);
  return enrolled.find((p) => p.id === owingId) || getProgramEntry(owingId) || getProgramEntry('lep');
}

function accessRow(profile, programId) {
  return profile?.programAccess?.[programId] || {};
}

/**
 * View model for the payment enrollment screen (matches CX mockup).
 * Amounts/dates come from profile.programAccess when Zoho sync writes them.
 */
export function buildPaymentEnrollmentView(
  profile,
  user,
  { programId, events = [], cmsBatch, pickedBatch } = {}
) {
  const program = pickProgram(profile, programId);
  const pid = program?.id || 'lep';
  const access = accessRow(profile, pid);
  const payStatus = programPaymentStatus(profile, pid);

  const registrationFee =
    access.registrationFee ??
    access.registrationAmount ??
    profile?.registrationFee ??
    REGISTRATION_FEE[pid] ??
    REGISTRATION_FEE.lep;
  // Until Zoho writes real balance, show ₹1 test amount (matches server default).
  const programBalance =
    access.programBalance ??
    access.balanceDue ??
    access.balanceAmount ??
    1;
  const registrationPaidAt =
    access.registrationPaidAt ?? access.paidAt ?? profile?.registrationPaidAt ?? null;
  const balanceDueDate =
    access.balanceDueDate ?? access.dueDate ?? profile?.balanceDueDate ?? null;
  const txnLast4 =
    access.txnLast4 ?? access.transactionLast4 ?? profile?.paymentTxnLast4 ?? '4471';

  const regPaidLabel = formatShortDate(registrationPaidAt);
  const dueLabel =
    formatShortDate(balanceDueDate) ||
    (registrationPaidAt ? formatShortDate(addDays(registrationPaidAt, 7)) : null);

  const paidPortion = registrationFee || 0;
  const totalKnown =
    programBalance != null ? paidPortion + Number(programBalance) : paidPortion * 4;
  const progressPercent =
    totalKnown > 0 ? Math.min(100, Math.round((paidPortion / totalKnown) * 100)) : 25;

  const statusLine =
    payStatus === PAYMENT_STATUS.PAID
      ? 'ENROLLED · FULL PAYMENT RECEIVED'
      : payStatus === PAYMENT_STATUS.REGISTER
        ? 'REGISTERED · PART PAYMENT RECEIVED'
        : 'REGISTERED · PAYMENT PENDING';

  const greetingName = lepFirstName(profile);
  const headline =
    payStatus === PAYMENT_STATUS.PAID
      ? `You're all set, ${greetingName}.`
      : `Your seat is held, ${greetingName}.`;

  const subline =
    payStatus === PAYMENT_STATUS.PAID
      ? 'Your enrolment is confirmed. Continue to your program journey.'
      : dueLabel
        ? `One step left: complete your enrolment by ${dueLabel} to confirm your place in the batch.`
        : 'One step left: complete your enrolment to confirm your place in the batch.';

  const batchSessions = buildEnrollmentBatchSessions(profile, { cmsBatch, pickedBatch, events });

  const paymentUrl =
    access.paymentUrl ?? profile?.paymentUrl ?? profile?.paymentLink ?? null;

  const balanceDetailNote = dueLabel
    ? `Due by ${dueLabel} · pay via Razorpay`
    : 'Pay via Razorpay';

  return {
    programId: pid,
    programTitle: program?.title || 'Leadership Essentials Program',
    programLabel: (program?.title || 'LEADERSHIP ESSENTIALS PROGRAM').toUpperCase(),
    payStatus,
    statusLine,
    headline,
    subline,
    registrationFee,
    registrationFeeLabel: formatInr(registrationFee) || formatInr(REGISTRATION_FEE.lep),
    programBalance,
    programBalanceLabel: formatInr(programBalance) || '₹ 1',
    registrationPaidLabel: regPaidLabel || '—',
    balanceDueLabel: dueLabel || '—',
    txnLast4: String(txnLast4).slice(-4),
    balanceNote: access.balanceNote || balanceDetailNote,
    progressPercent,
    showPayButton: payStatus !== PAYMENT_STATUS.PAID,
    balanceDue: payStatus === PAYMENT_STATUS.REGISTER,
    batchSessions,
    batchHeading: batchHeadingLabel(profile, cmsBatch, pickedBatch),
    paymentUrl,
    supportPhone: profile?.supportPhone || access.supportPhone || null,
    payer: payerContact(profile, user),
  };
}

export { payerContact };

/** Programme balance counted as paid only after Razorpay capture (payment id on profile). */
export function programmeBalancePaid(profile, programId = 'lep') {
  const access = accessRow(profile, programId);
  const paymentId = access.razorpayPaymentId || profile?.razorpayPaymentId;
  return programPaymentStatus(profile, programId) === PAYMENT_STATUS.PAID && !!paymentId;
}

/** Local registration-fee receipt so Profile / Orders can show it without a Firestore uid. */
export function registrationFeeOrder(profile, user) {
  const vm = buildPaymentEnrollmentView(profile, user);
  const paidAt = profile?.programAccess?.[vm.programId]?.registrationPaidAt
    || profile?.registrationPaidAt
    || new Date('2026-09-12T10:00:00+05:30');
  return {
    id: 'registration-fee',
    amountRupees: vm.registrationFee,
    programTitle: vm.programTitle,
    programId: vm.programId,
    description: `${vm.programTitle} — registration fee`,
    transactionId: `ILREG${vm.txnLast4}`,
    receiptNumber: `IL-REG-${vm.txnLast4}`,
    paidAt,
    payerName: lepFullName(profile) || user?.displayName || '',
    payerEmail: profile?.email || user?.email || '',
    payerPhone: profile?.phoneNumber || profile?.phone || user?.phoneNumber || '',
    currency: 'INR',
    uid: user?.uid || 'preview',
  };
}

/** The ₹1 Razorpay test charge the learner already paid. */
export function razorpayOneRupeeOrder(profile, user) {
  const access = profile?.programAccess?.lep || {};
  const paymentId = access.razorpayPaymentId || profile?.razorpayPaymentId || null;
  const orderId = access.razorpayOrderId || profile?.razorpayOrderId || null;
  const paidAt = access.fullPaidAt || access.paidAt || profile?.fullPaidAt || new Date();
  return {
    id: paymentId || 'razorpay-1-rupee',
    amountRupees: 1,
    amountPaise: 100,
    programTitle: 'Leadership Essentials Program',
    programId: 'lep',
    description: 'Leadership Essentials Program — programme balance',
    transactionId: paymentId || 'Razorpay ₹1',
    razorpayOrderId: orderId,
    receiptNumber: paymentId || 'IL-RZP-1',
    paidAt,
    gateway: 'razorpay',
    currency: 'INR',
    payerName: lepFullName(profile) || user?.displayName || '',
    payerEmail: profile?.email || user?.email || '',
    payerPhone: profile?.phoneNumber || profile?.phone || user?.phoneNumber || '',
    uid: user?.uid || 'preview',
  };
}

function buildBatchSessionsFromEvents(events) {
  const upcoming = (events || [])
    .filter((e) => e.date)
    .sort((a, b) => `${a.date} ${a.time}`.localeCompare(`${b.date} ${b.time}`))
    .slice(0, 4);
  if (!upcoming.length) return null;
  return upcoming.map((ev, i) => ({
    dayLabel: `DAY ${i + 1}`,
    title: [ev.date, ev.time].filter(Boolean).join(' · '),
    subtitle: ev.description?.slice(0, 60) || 'Full day, live on Zoom',
    linkUrl: ev.linkUrl || ev.meetingUrl,
  }));
}

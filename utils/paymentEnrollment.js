import { PAYMENT_STATUS, getProgramEntry, REGISTRATION_FEE } from '../constants/programs';
import { getEnrolledPrograms, programPaymentStatus } from './programAccess';

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

function firstName(profile, user) {
  const raw =
    profile?.displayName || user?.displayName || profile?.email?.split('@')[0] || 'there';
  return String(raw).split(' ')[0];
}

function pickProgram(profile, programId) {
  const enrolled = getEnrolledPrograms(profile);
  if (programId) {
    const match = enrolled.find((p) => p.id === programId) || getProgramEntry(programId);
    if (match) return match;
  }
  const registerProgram = enrolled.find(
    (p) => programPaymentStatus(profile, p.id) === PAYMENT_STATUS.REGISTER
  );
  return registerProgram || enrolled[0] || getProgramEntry('lep');
}

function accessRow(profile, programId) {
  return profile?.programAccess?.[programId] || {};
}

/**
 * View model for the payment enrollment screen (matches CX mockup).
 * Amounts/dates come from profile.programAccess when Zoho sync writes them.
 */
export function buildPaymentEnrollmentView(profile, user, { programId, events = [] } = {}) {
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

  const regPaidLabel = formatShortDate(registrationPaidAt) || '12 SEP';
  const dueLabel =
    formatShortDate(balanceDueDate) ||
    formatShortDate(addDays(registrationPaidAt || new Date(), 7)) ||
    '19 SEP';

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

  const headline =
    payStatus === PAYMENT_STATUS.PAID
      ? `You're all set, ${firstName(profile, user)}.`
      : `Your seat is held, ${firstName(profile, user)}.`;

  const subline =
    payStatus === PAYMENT_STATUS.PAID
      ? 'Your enrolment is confirmed. Continue to your program journey.'
      : `One step left: complete your enrolment by ${dueLabel} to confirm your place in the batch.`;

  const batchSessions =
    access.batchSessions ||
    profile?.batchSessions ||
    buildBatchSessionsFromEvents(events) ||
    defaultBatchSessions();

  const paymentUrl =
    access.paymentUrl ?? profile?.paymentUrl ?? profile?.paymentLink ?? null;

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
    registrationPaidLabel: regPaidLabel,
    balanceDueLabel: dueLabel,
    txnLast4: String(txnLast4).slice(-4),
    balanceNote: access.balanceNote || '7 days from registration',
    progressPercent,
    showPayButton: payStatus !== PAYMENT_STATUS.PAID,
    balanceDue: payStatus === PAYMENT_STATUS.REGISTER,
    batchSessions,
    paymentUrl,
    supportPhone: profile?.supportPhone || access.supportPhone || null,
  };
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
    payerName: profile?.displayName || user?.displayName || 'Ananya Rao',
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
    payerName: profile?.displayName || user?.displayName || '',
    payerEmail: profile?.email || user?.email || '',
    payerPhone: profile?.phoneNumber || profile?.phone || user?.phoneNumber || '',
    uid: user?.uid || 'preview',
  };
}

function defaultBatchSessions() {
  return [
    {
      dayLabel: 'DAY 1',
      title: 'Sat 20 Sep · 9:00 AM – 7:00 PM IST',
      subtitle: 'Full day, live on Zoom',
    },
    {
      dayLabel: 'DAY 2',
      title: 'Sun 21 Sep · 9:00 AM – 7:00 PM IST',
      subtitle: 'Full day, live on Zoom',
    },
  ];
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

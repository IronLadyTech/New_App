import AsyncStorage from '@react-native-async-storage/async-storage';

const KEY = 'il_payment_receipts';

function toMs(value) {
  if (!value) return 0;
  if (typeof value === 'number') return value;
  if (typeof value?.toMillis === 'function') return value.toMillis();
  const d = value?.toDate?.() || new Date(value);
  const ms = d?.getTime?.();
  return Number.isNaN(ms) ? 0 : ms;
}

export function serializeReceipt(row) {
  if (!row) return null;
  const paidAtMs = toMs(row.paidAtMs || row.paidAt || row.createdAt);
  return {
    ...row,
    id: row.id || row.transactionId,
    paidAt: row.paidAt?.toDate?.()?.toISOString?.() || row.paidAt || (paidAtMs ? new Date(paidAtMs).toISOString() : null),
    createdAt: row.createdAt?.toDate?.()?.toISOString?.() || row.createdAt || (paidAtMs ? new Date(paidAtMs).toISOString() : null),
    paidAtMs,
  };
}

export async function loadCachedReceipts() {
  try {
    const raw = await AsyncStorage.getItem(KEY);
    const rows = raw ? JSON.parse(raw) : [];
    return Array.isArray(rows) ? rows.map(serializeReceipt).filter(Boolean) : [];
  } catch {
    return [];
  }
}

export function receiptsFromAccount(profile) {
  const access = profile?.programAccess || {};
  return Object.entries(access)
    .filter(([, row]) => row?.razorpayPaymentId || row?.razorpayOrderId)
    .map(([programId, row]) =>
      serializeReceipt({
        id: row.razorpayPaymentId || row.razorpayOrderId,
        transactionId: row.razorpayPaymentId || row.razorpayOrderId,
        razorpayOrderId: row.razorpayOrderId || null,
        receiptNumber: row.razorpayPaymentId || row.razorpayOrderId,
        status: 'paid',
        gateway: 'razorpay',
        currency: 'INR',
        amountPaise: row.amountPaise,
        amountRupees:
          row.amountRupees ??
          (row.amountPaise != null ? row.amountPaise / 100 : 1),
        programId,
        programTitle: row.programTitle || 'Leadership Essentials Program',
        description: 'Programme balance',
        payerName: profile?.displayName || '',
        payerPhone: profile?.phoneNumber || profile?.phone || '',
        paidAt: row.fullPaidAt || row.paidAt,
      })
    );
}

export async function cacheReceipts(rows) {
  const incoming = (rows || []).map(serializeReceipt).filter(Boolean);
  const prev = await loadCachedReceipts();
  const map = new Map();
  [...prev, ...incoming].forEach((row) => {
    map.set(String(row.id || row.transactionId), row);
  });
  const next = [...map.values()].sort((a, b) => (b.paidAtMs || 0) - (a.paidAtMs || 0));
  await AsyncStorage.setItem(KEY, JSON.stringify(next));
  return next;
}

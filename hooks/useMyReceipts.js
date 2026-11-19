import { useEffect, useMemo, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { subscribeToMyOrders, subscribeToMyRazorpayPayments } from '../services/firestore';
import { PAYMENT_STATUS } from '../constants/programs';
import { programPaymentStatus } from '../utils/programAccess';
import {
  cacheReceipts,
  loadCachedReceipts,
  receiptsFromAccount,
  serializeReceipt,
} from '../services/receiptStore';

function mergeRows(...lists) {
  const map = new Map();
  lists.flat().forEach((row) => {
    const item = serializeReceipt(row);
    if (!item?.id && !item?.transactionId) return;
    map.set(String(item.transactionId || item.id), item);
  });
  return [...map.values()].sort((a, b) => (b.paidAtMs || 0) - (a.paidAtMs || 0));
}

export function useMyReceipts() {
  const { user, accountProfile, profile } = useAuth();
  const [remote, setRemote] = useState([]);
  const [cached, setCached] = useState([]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);
  const liveProfile = accountProfile || profile;
  const fromProfile = useMemo(() => receiptsFromAccount(liveProfile), [liveProfile]);
  // Money: receipts come only from real payment records (payment_orders / razorpay_payments).
  // A receipt built on the phone always said ₹ 1, whatever she had actually paid.

  useEffect(() => {
    let active = true;
    loadCachedReceipts().then((rows) => {
      if (active) {
        setCached(rows);
        setLoading(false);
      }
    });
    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    if (!user?.uid) return undefined;
    let alive = true;
    const apply = (rows) => {
      if (!alive) return;
      setRemote((prev) => mergeRows(prev, rows));
      cacheReceipts(rows).then((merged) => {
        if (alive) setCached(merged);
      });
      setLoading(false);
    };

    const unsubOrders = subscribeToMyOrders(user.uid, apply, (err) => {
      if (alive) setError(err.message);
    });
    const unsubPay = subscribeToMyRazorpayPayments(user.uid, apply, (err) => {
      if (alive) setError(err.message);
    });

    return () => {
      alive = false;
      unsubOrders();
      unsubPay();
    };
  }, [user?.uid]);

  const orders = mergeRows(cached, remote, fromProfile);
  const latest =
    orders.find((row) => {
      const programId = row.programId || 'lep';
      if (programPaymentStatus(liveProfile, programId) !== PAYMENT_STATUS.PAID) return false;
      const payId =
        row.razorpayPaymentId ||
        (row.transactionId && !String(row.transactionId).startsWith('order_')
          ? row.transactionId
          : null);
      if (!payId || payId === 'registration-fee') return false;
      if (row.status === 'failed' || row.status === 'refunded') return false;
      return true;
    }) || null;

  return {
    orders,
    latest,
    error,
    loading,
    signedIn: !!user?.uid,
    phone: user?.phoneNumber || liveProfile?.phoneNumber || liveProfile?.phone || '',
  };
}

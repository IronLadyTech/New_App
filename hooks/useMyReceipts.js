import { useEffect, useMemo, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { subscribeToMyOrders, subscribeToMyRazorpayPayments } from '../services/firestore';
import { razorpayOneRupeeOrder } from '../utils/paymentEnrollment';
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
  return [...map.values()].sort((a, b) => {
    const aOne = Number(a.amountRupees) === 1 ? 1 : 0;
    const bOne = Number(b.amountRupees) === 1 ? 1 : 0;
    if (aOne !== bOne) return bOne - aOne;
    return (b.paidAtMs || 0) - (a.paidAtMs || 0);
  });
}

export function useMyReceipts() {
  const { user, accountProfile, profile } = useAuth();
  const [remote, setRemote] = useState([]);
  const [cached, setCached] = useState([]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);
  const liveProfile = accountProfile || profile;
  const fromProfile = useMemo(() => receiptsFromAccount(liveProfile), [liveProfile]);
  const oneRupee = useMemo(
    () => serializeReceipt(razorpayOneRupeeOrder(liveProfile, user)),
    [liveProfile, user]
  );

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

  const orders = mergeRows(oneRupee ? [oneRupee] : [], cached, remote, fromProfile);
  const razorpay = orders.find((row) => Number(row.amountRupees) === 1) || oneRupee || orders[0] || null;

  return {
    orders,
    latest: razorpay,
    error,
    loading,
    signedIn: !!user?.uid,
    phone: user?.phoneNumber || liveProfile?.phoneNumber || liveProfile?.phone || '',
  };
}

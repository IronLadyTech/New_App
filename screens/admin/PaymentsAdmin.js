/**
 * App payments — every balance paid in the app, and whether it reached Zoho.
 * For CX: nothing paid in the app should go unnoticed. Each row shows the learner, the amount,
 * live or TEST, and the Zoho result (Lead Status changed + Note). Anything not done can be sent
 * again. Razorpay itself is checked every night for payments the app never confirmed.
 */
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { ScrollView, View } from 'react-native';
import { checkRazorpayNow, listAppPayments, retryPaymentZoho } from '../../services/cms';
import { A, Btn, Card, H, Input, Notice, Row, T } from './adminUi';
import { Pill, Segmented } from './batchHub/cmsBits';

const PROGRAM = { lep: 'LEP', '100bm': '100BM', mbw: 'MBW' };

const ZOHO = {
  done: { label: 'Zoho updated', tone: 'ok' },
  retrying: { label: 'Retrying', tone: 'warn' },
  attention: { label: 'Needs attention', tone: 'miss' },
  waiting: { label: 'Not sent yet', tone: 'muted' },
};

const FILTERS = [
  { value: 'all', label: 'All' },
  { value: 'todo', label: 'Not in Zoho yet' },
  { value: 'live', label: 'Live only' },
  { value: 'test', label: 'TEST only' },
];

const SOURCE = {
  app: 'Confirmed by the app',
  webhook: 'Confirmed by Razorpay',
  'razorpay-check': 'Found by the nightly Razorpay check',
};

function when(t) {
  if (!t) return '—';
  return new Date(t).toLocaleString('en-IN', { day: 'numeric', month: 'short', hour: 'numeric', minute: '2-digit' });
}

function zohoLine(p) {
  if (p.zoho === 'done') return p.zohoTo ? `Lead Status ${p.zohoFrom || '—'} → ${p.zohoTo}, Note added` : `Lead Status already ${p.zohoFrom || '—'}, Note added`;
  if (p.zoho === 'retrying') return `Tried ${p.zohoTries || 1}×: ${p.zohoError}. Tried again every 30 minutes.`;
  if (p.zoho === 'attention') return `Failed 10×: ${p.zohoError}. Check her Lead in Zoho (email and mobile), then send again.`;
  return 'Paid before the Zoho update existed. Send it if Zoho should show it.';
}

export default function PaymentsAdmin() {
  const [data, setData] = useState(null);
  const [error, setError] = useState(null);
  const [msg, setMsg] = useState(null);
  const [filter, setFilter] = useState('all');
  const [q, setQ] = useState('');
  const [busy, setBusy] = useState('');

  const load = useCallback(() => {
    setError(null);
    return listAppPayments()
      .then(setData)
      .catch((e) => setError(e?.message || 'Could not load payments.'));
  }, []);
  useEffect(() => {
    load();
  }, [load]);

  const rows = data?.payments || [];
  const counts = useMemo(
    () => ({
      all: rows.length,
      live: rows.filter((p) => !p.test).length,
      todo: rows.filter((p) => p.zoho !== 'done').length,
      attention: rows.filter((p) => p.zoho === 'attention').length,
      recovered: rows.filter((p) => p.source === 'razorpay-check').length,
    }),
    [rows]
  );
  const shown = useMemo(() => {
    const term = q.trim().toLowerCase();
    return rows.filter((p) => {
      if (filter === 'todo' && p.zoho === 'done') return false;
      if (filter === 'live' && p.test) return false;
      if (filter === 'test' && !p.test) return false;
      if (term && !`${p.name} ${p.phone} ${p.paymentId} ${p.orderId}`.toLowerCase().includes(term)) return false;
      return true;
    });
  }, [rows, filter, q]);

  const send = async (p) => {
    setBusy(p.paymentId);
    setMsg(null);
    try {
      const r = await retryPaymentZoho(p.paymentId);
      setMsg(
        r?.ok
          ? { tone: 'ok', text: `${p.name}: Zoho updated${r.to ? ` (${r.from || '—'} → ${r.to})` : ''}.` }
          : { tone: 'error', text: `${p.name}: still not in Zoho — ${r?.reason || 'try again later'}.` }
      );
      await load();
    } catch (e) {
      setMsg({ tone: 'error', text: e?.message || 'Could not reach the server.' });
    } finally {
      setBusy('');
    }
  };

  const checkNow = async () => {
    setBusy('check');
    setMsg(null);
    try {
      const r = await checkRazorpayNow();
      setMsg({
        tone: r?.errors?.length ? 'error' : 'ok',
        text: r?.errors?.length
          ? `Razorpay could not be read: ${r.errors.join(' · ')}`
          : r?.recovered
            ? `Found ${r.recovered} payment(s) the app had missed. They are recorded, unlocked and sent to Zoho.`
            : `Razorpay checked: all ${r?.ours || 0} app payment(s) of the last 2 days are recorded.`,
      });
      await load();
    } catch (e) {
      setMsg({ tone: 'error', text: e?.message || 'Could not check Razorpay.' });
    } finally {
      setBusy('');
    }
  };

  const last = data?.lastCheck;

  return (
    <ScrollView style={{ flex: 1 }} contentContainerStyle={{ padding: 24 }}>
      <H style={{ marginBottom: 4 }}>App payments</H>
      <T color={A.muted} style={{ marginBottom: 14, maxWidth: 820 }}>
        Every balance paid in the app. When a payment comes in, her programme opens and Zoho is updated: Lead Status moves
        from Enrolled to Started and a Note records the amount and Razorpay ids. If Zoho fails, it is tried again every 30
        minutes. Every night Razorpay is checked for payments the app never confirmed (e.g. the app closed while paying).
      </T>

      {error ? <Notice tone="error">{error}</Notice> : null}
      {msg ? <Notice tone={msg.tone}>{msg.text}</Notice> : null}

      <Row gap={10} style={{ flexWrap: 'wrap', marginBottom: 12 }}>
        {[
          [counts.all, 'Payments'],
          [counts.live, 'Live (real money)'],
          [counts.todo, 'Not in Zoho yet'],
          [counts.attention, 'Need attention'],
          [counts.recovered, 'Found by Razorpay check'],
        ].map(([n, label]) => (
          <Card key={label} style={{ flex: 1, minWidth: 140, padding: 12 }}>
            <T size={22} weight="bold" color={label === 'Need attention' && n ? A.red : A.ink}>
              {data ? n : '–'}
            </T>
            <T size={12} color={A.muted}>
              {label}
            </T>
          </Card>
        ))}
      </Row>

      <Card style={{ padding: 12, marginBottom: 12 }}>
        <Row gap={12} style={{ alignItems: 'center', justifyContent: 'space-between' }}>
          <View style={{ flex: 1, minWidth: 260 }}>
            <T size={13} weight="semibold">
              Razorpay check
            </T>
            <T size={12} color={A.muted}>
              {last
                ? `Last run ${when(last.at)}: ${last.ours} app payment(s) in Razorpay, ${last.recovered} missed and recovered${last.errors?.length ? ` · could not read: ${last.errors.join(' · ')}` : ''}.`
                : 'Runs every night at 2:30 AM. Not run yet.'}
            </T>
          </View>
          <Btn label="Check Razorpay now" kind="ghost" small loading={busy === 'check'} onPress={checkNow} />
        </Row>
      </Card>

      <Card style={{ padding: 12, marginBottom: 12 }}>
        <Row gap={12} style={{ alignItems: 'center' }}>
          <Segmented options={FILTERS} value={filter} onChange={setFilter} />
          <View style={{ flex: 1, minWidth: 200 }}>
            <Input value={q} onChangeText={setQ} placeholder="Search name, last 4 digits or Razorpay id" />
          </View>
          <Btn label="Refresh" kind="ghost" small onPress={load} />
        </Row>
      </Card>

      {data === null && !error ? <T color={A.muted}>Loading payments…</T> : null}
      {data && !shown.length ? <T color={A.muted}>No payments match.</T> : null}

      {shown.map((p) => (
        <Card key={p.paymentId} style={{ padding: 14, marginBottom: 8 }}>
          <Row gap={12} style={{ alignItems: 'flex-start', justifyContent: 'space-between' }}>
            <View style={{ flex: 1, minWidth: 260 }}>
              <Row gap={8} style={{ alignItems: 'center' }}>
                <T weight="bold">{p.name}</T>
                {p.phone ? (
                  <T size={12} color={A.muted}>
                    …{p.phone}
                  </T>
                ) : null}
              </Row>
              <Row gap={0} style={{ alignItems: 'center' }}>
                <Pill label={`${PROGRAM[p.programId] || p.programId || '—'} · ₹${p.amount.toLocaleString('en-IN')}`} tone="neutral" />
                <Pill label={p.test ? 'TEST (no money)' : 'Live'} tone={p.test ? 'lock' : 'ok'} />
                <Pill label={ZOHO[p.zoho].label} tone={ZOHO[p.zoho].tone} />
              </Row>
              <T size={12} color={p.zoho === 'attention' ? A.red : A.muted} style={{ marginTop: 6 }}>
                {zohoLine(p)}
              </T>
              <T size={11} color={A.muted} style={{ marginTop: 4 }}>
                {when(p.at)} · {SOURCE[p.source] || p.source || '—'} · {p.paymentId}
                {p.leadId ? ` · Lead ${p.leadId}` : ''}
              </T>
            </View>
            {p.zoho !== 'done' ? (
              <Btn label="Send to Zoho again" small loading={busy === p.paymentId} onPress={() => send(p)} />
            ) : null}
          </Row>
        </Card>
      ))}
    </ScrollView>
  );
}

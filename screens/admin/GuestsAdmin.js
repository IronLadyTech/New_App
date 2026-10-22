/**
 * App guests — people who signed in with a number that has no program seat.
 * For CX and sales follow-up: who they are, how active, how far in the free
 * challenge, Masterclass or not, and numbers that need a CX check in Zoho.
 */
import React, { useEffect, useMemo, useState } from 'react';
import { Linking, Platform, ScrollView, View } from 'react-native';
import { collection, limit, onSnapshot, orderBy, query } from 'firebase/firestore';
import { db } from '../../services/firebase';
import { A, Btn, Card, H, Input, Notice, Row, T } from './adminUi';
import { Pill, Segmented } from './batchHub/cmsBits';

const FILTERS = [
  { value: 'all', label: 'All' },
  { value: 'mc', label: 'Masterclass' },
  { value: 'explore', label: 'Explore' },
  { value: 'cx', label: 'Needs CX check' },
  { value: 'quiet', label: 'Not seen 3+ days' },
  { value: 'new', label: 'New this week' },
];

function ms(v) {
  if (!v) return 0;
  if (typeof v.toMillis === 'function') return v.toMillis();
  if (typeof v.seconds === 'number') return v.seconds * 1000;
  return Date.parse(v) || 0;
}

function ago(v) {
  const t = ms(v);
  if (!t) return '—';
  const days = Math.floor((Date.now() - t) / 86400000);
  if (days <= 0) return 'today';
  if (days === 1) return 'yesterday';
  return `${days} days ago`;
}

function open(url) {
  if (Platform.OS === 'web') window.open(url, '_blank', 'noopener');
  else Linking.openURL(url).catch(() => {});
}

export default function GuestsAdmin() {
  const [rows, setRows] = useState(null);
  const [error, setError] = useState(null);
  const [filter, setFilter] = useState('all');
  const [q, setQ] = useState('');

  useEffect(
    () =>
      onSnapshot(
        query(collection(db, 'app_guests'), orderBy('lastSeenAt', 'desc'), limit(1000)),
        (snap) => setRows(snap.docs.map((d) => ({ id: d.id, ...d.data() }))),
        (e) => setError(e?.message || 'Could not load guests.')
      ),
    []
  );

  const counts = useMemo(() => {
    const list = rows || [];
    const week = Date.now() - 7 * 86400000;
    return {
      all: list.length,
      mc: list.filter((g) => g.tier === 'mc').length,
      cx: list.filter((g) => g.needsCx).length,
      newWeek: list.filter((g) => ms(g.firstSeenAt) > week).length,
      challengeDone: list.filter((g) => g.challengeDoneAt).length,
      leadsCreated: list.filter((g) => g.leadCreatedByApp).length,
    };
  }, [rows]);

  const shown = useMemo(() => {
    const term = q.trim().toLowerCase();
    const quiet = Date.now() - 3 * 86400000;
    const week = Date.now() - 7 * 86400000;
    return (rows || []).filter((g) => {
      if (filter === 'mc' && g.tier !== 'mc') return false;
      if (filter === 'explore' && g.tier === 'mc') return false;
      if (filter === 'cx' && !g.needsCx) return false;
      if (filter === 'quiet' && ms(g.lastSeenAt) > quiet) return false;
      if (filter === 'new' && ms(g.firstSeenAt) < week) return false;
      if (term && !`${g.name || ''} ${g.phone || ''}`.toLowerCase().includes(term)) return false;
      return true;
    });
  }, [rows, filter, q]);

  const exportCsv = () => {
    if (Platform.OS !== 'web') return;
    const head = ['Name', 'Phone', 'Type', 'Lead status', 'First seen', 'Last seen', 'Visits', 'Challenge day', 'Challenge done', 'Needs CX check'];
    const lines = shown.map((g) =>
      [g.name || '', g.phone, g.tier === 'mc' ? 'Masterclass' : 'Explore', g.leadStatus || '', new Date(ms(g.firstSeenAt)).toISOString().slice(0, 10), new Date(ms(g.lastSeenAt)).toISOString().slice(0, 10), g.visits || 0, g.challengeDay || 0, g.challengeDoneAt ? 'Yes' : '', g.needsCx || '']
        .map((v) => `"${String(v).replace(/"/g, '""')}"`)
        .join(',')
    );
    const blob = new Blob([[head.join(','), ...lines].join('\n')], { type: 'text/csv' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = `app-guests-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
  };

  return (
    <ScrollView style={{ flex: 1 }} contentContainerStyle={{ padding: 24 }}>
      <H style={{ marginBottom: 4 }}>App guests</H>
      <T color={A.muted} style={{ marginBottom: 14, maxWidth: 780 }}>
        People who signed in with a number that has no program seat. Masterclass guests (MC Enrolled / MC Completed)
        also see their recordings. New numbers are added to Zoho as a Lead (source “Online - IronLady App”). Guests get a
        daily evening reminder in the app until they finish the 4-day challenge.
      </T>

      {error ? <Notice tone="error">{error}</Notice> : null}

      <Row gap={10} style={{ flexWrap: 'wrap', marginBottom: 12 }}>
        {[
          [counts.all, 'Guests'],
          [counts.newWeek, 'New this week'],
          [counts.mc, 'Masterclass'],
          [counts.challengeDone, 'Finished the challenge'],
          [counts.leadsCreated, 'New Zoho Leads'],
          [counts.cx, 'Need a CX check'],
        ].map(([n, label]) => (
          <Card key={label} style={{ flex: 1, minWidth: 140, padding: 12 }}>
            <T size={22} weight="bold">{rows ? n : '–'}</T>
            <T size={12} color={A.muted}>{label}</T>
          </Card>
        ))}
      </Row>

      <Card style={{ padding: 12, marginBottom: 12 }}>
        <Row gap={12} style={{ flexWrap: 'wrap', alignItems: 'center' }}>
          <Segmented options={FILTERS} value={filter} onChange={setFilter} />
          <View style={{ flex: 1, minWidth: 200 }}>
            <Input value={q} onChangeText={setQ} placeholder="Search name or phone" />
          </View>
          <Btn label="Download CSV" kind="ghost" small onPress={exportCsv} />
        </Row>
      </Card>

      {rows === null ? <T color={A.muted}>Loading guests…</T> : null}
      {rows && !shown.length ? <T color={A.muted}>No guests match.</T> : null}
      {shown.map((g) => {
        const digits = String(g.phone || '').replace(/\D/g, '');
        const hello = encodeURIComponent(
          `Hi${g.name ? ` ${String(g.name).split(' ')[0]}` : ''}, this is the Iron Lady team. Thank you for joining the app! How can we help you take your next step?`
        );
        return (
          <Card key={g.id} style={{ marginBottom: 8, padding: 12 }}>
            <Row gap={10} style={{ alignItems: 'center', flexWrap: 'wrap' }}>
              <View style={{ flex: 1.4, minWidth: 180 }}>
                <T size={14} weight="semibold">{g.name || 'Name not given yet'}</T>
                <T size={12} color={A.muted}>{g.phone}</T>
              </View>
              <View style={{ flex: 1.6, minWidth: 220 }}>
                <Row gap={0} style={{ flexWrap: 'wrap' }}>
                  <Pill label={g.tier === 'mc' ? 'Masterclass' : 'Explore'} tone={g.tier === 'mc' ? 'warn' : 'neutral'} />
                  <Pill label={g.leadStatus ? `Zoho: ${g.leadStatus}` : g.inZoho ? 'In Zoho' : 'Not in Zoho yet'} tone="muted" />
                  {g.challengeDoneAt ? <Pill label="Challenge done" tone="ok" /> : g.challengeDay ? <Pill label={`Challenge day ${g.challengeDay}`} tone="ok" /> : null}
                </Row>
              </View>
              <View style={{ flex: 1, minWidth: 140 }}>
                <T size={12}>Last seen {ago(g.lastSeenAt)}</T>
                <T size={11} color={A.muted}>Joined {ago(g.firstSeenAt)} · {g.visits || 1} visits</T>
              </View>
              <Row gap={6}>
                {digits ? <Btn label="WhatsApp" kind="ghost" small onPress={() => open(`https://wa.me/${digits}?text=${hello}`)} /> : null}
                {digits ? <Btn label="Call" kind="ghost" small onPress={() => open(`tel:+${digits}`)} /> : null}
              </Row>
            </Row>
            {g.needsCx ? (
              <T size={12} color={A.danger} style={{ marginTop: 8 }}>⚠ {g.needsCx}</T>
            ) : null}
          </Card>
        );
      })}
    </ScrollView>
  );
}

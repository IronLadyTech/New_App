/**
 * App analytics — how learners use the app, per program or per batch, in plain words.
 * Numbers come from the cmsAppAnalytics function (activity the app records), so CX
 * sees counts and first names only.
 */
import React, { useEffect, useMemo, useState } from 'react';
import { ScrollView, View } from 'react-native';
import { httpsCallable } from 'firebase/functions';
import { functions } from '../../services/firebase';
import { subscribeToBatches } from '../../services/cms';
import { formatBatchPickerLabel } from '../../utils/cmsBatchLabel';
import { A, Btn, Card, H, Notice, Row, Select, T } from './adminUi';

const PROGRAMS = [
  { value: 'lep', label: 'LEP · Leadership Essentials', cms: 'LEP' },
  { value: '100bm', label: '100BM · 100 Board Members', cms: '100BM' },
  { value: 'mbw', label: 'MBW · Master of Business Warfare', cms: 'MBW' },
];

function Stat({ value, label, hint }) {
  return (
    <Card style={{ flex: 1, minWidth: 150, padding: 14 }}>
      <T size={26} weight="bold">{value}</T>
      <T size={13} weight="semibold">{label}</T>
      {hint ? <T size={11} color={A.muted}>{hint}</T> : null}
    </Card>
  );
}

function pct(n, d) {
  return d ? `${Math.round((n / d) * 100)}%` : '–';
}

function dayLabel(iso) {
  const d = new Date(`${iso}T12:00:00`);
  return d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' });
}

/** 14 little bars: learners active each day. */
function Trend({ trend }) {
  const max = Math.max(1, ...trend.map((t) => t.active));
  return (
    <Card style={{ padding: 14, marginBottom: 12 }}>
      <T size={14} weight="semibold" style={{ marginBottom: 10 }}>Learners active each day (last 14 days)</T>
      <Row gap={6} style={{ alignItems: 'flex-end', height: 120 }}>
        {trend.map((t) => (
          <View key={t.day} style={{ flex: 1, alignItems: 'center' }}>
            <T size={10} color={A.muted}>{t.active || ''}</T>
            <View style={{ width: '70%', height: Math.max(3, (t.active / max) * 90), backgroundColor: A.red, borderRadius: 4 }} />
          </View>
        ))}
      </Row>
      <Row gap={6} style={{ marginTop: 4 }}>
        {trend.map((t, i) => (
          <T key={t.day} size={9} color={A.muted} style={{ flex: 1, textAlign: 'center' }}>
            {i % 2 === 0 ? dayLabel(t.day) : ''}
          </T>
        ))}
      </Row>
    </Card>
  );
}

/** The analytics body for one program, optionally one batch. Used here and in the batch Dashboard tab. */
export function AppAnalyticsView({ program, batchId }) {
  const [data, setData] = useState(null);
  const [error, setError] = useState(null);
  const [tick, setTick] = useState(0);

  useEffect(() => {
    let alive = true;
    setData(null);
    setError(null);
    httpsCallable(functions, 'cmsAppAnalytics')({ program, batchId: batchId || '' })
      .then(({ data: d }) => alive && setData(d))
      .catch((e) => alive && setError(e?.message || 'Could not load analytics.'));
    return () => {
      alive = false;
    };
  }, [program, batchId, tick]);

  if (error) return <Notice tone="error">{error}</Notice>;
  if (!data) return <T color={A.muted}>Loading app analytics…</T>;

  const t = data.totals;
  if (!t.learners) {
    return <Notice tone="neutral">No learners linked to {batchId ? 'this batch' : 'this program’s batches'} yet. They appear after the Zoho sync links them.</Notice>;
  }
  const noActivity = !t.openedApp;

  return (
    <View>
      {noActivity ? (
        <Notice tone="neutral">
          No app activity recorded yet. Activity is counted from the app update that includes tracking — once learners
          have it, these numbers fill in day by day.
        </Notice>
      ) : null}
      <Row gap={10} style={{ flexWrap: 'wrap', marginBottom: 10 }}>
        <Stat value={t.learners} label="Learners" hint={batchId ? 'in this batch' : 'in all batches'} />
        <Stat value={t.openedApp} label="Opened the app" hint={`${pct(t.openedApp, t.learners)} · ${t.notOpened} not yet`} />
        <Stat value={t.activeToday} label="Active today" />
        <Stat value={t.active7d} label="Active this week" hint={pct(t.active7d, t.learners)} />
      </Row>
      <Row gap={10} style={{ flexWrap: 'wrap', marginBottom: 12 }}>
        <Stat value={t.practicing7d} label="Practised this week" hint={`${t.avgPracticeDays7} practice days per learner`} />
        <Stat value={t.videosFinished} label="Videos finished" hint={`${t.videosStarted} started`} />
        <Stat value={t.joins7d} label="Joined live sessions" hint="Join taps this week" />
        <Stat value={t.away5plus} label="Away 5+ days" hint="opened before, not lately" />
      </Row>

      <Trend trend={data.trend} />

      {!batchId && data.perBatch.length > 1 ? (
        <Card style={{ padding: 14, marginBottom: 12 }}>
          <T size={14} weight="semibold" style={{ marginBottom: 8 }}>By batch</T>
          {data.perBatch.map((b) => (
            <Row key={b.batchId} gap={10} style={{ borderTopWidth: 1, borderTopColor: A.line, paddingVertical: 8 }}>
              <T size={13} style={{ flex: 2 }}>{b.name}</T>
              <T size={12} style={{ flex: 1 }}>{b.learners} learners</T>
              <T size={12} style={{ flex: 1 }}>{pct(b.openedApp, b.learners)} opened</T>
              <T size={12} style={{ flex: 1 }}>{pct(b.active7d, b.learners)} active this week</T>
              <T size={12} style={{ flex: 1 }}>{pct(b.practicing7d, b.learners)} practised</T>
            </Row>
          ))}
        </Card>
      ) : null}

      <Card style={{ padding: 14 }}>
        <Row gap={10} style={{ alignItems: 'center', marginBottom: 8 }}>
          <T size={14} weight="semibold" style={{ flex: 1 }}>Needs a call ({data.attentionTotal})</T>
          <Btn label="Refresh" kind="ghost" small onPress={() => setTick((n) => n + 1)} />
        </Row>
        {data.attention.length ? null : <T color={A.muted}>Everyone has been active in the last few days.</T>}
        {data.attention.map((p, i) => (
          <Row key={`${p.name}-${i}`} gap={10} style={{ borderTopWidth: 1, borderTopColor: A.line, paddingVertical: 8, flexWrap: 'wrap' }}>
            <T size={13} weight="semibold" style={{ flex: 1, minWidth: 100 }}>{p.name}</T>
            <T size={12} color={p.status.startsWith('Has not') ? A.danger : '#9A5B00'} style={{ flex: 1.4, minWidth: 140 }}>{p.status}</T>
            <T size={12} color={A.muted} style={{ flex: 1, minWidth: 90 }}>{[p.payment, p.late ? 'Late joiner' : ''].filter(Boolean).join(' · ')}</T>
            {!batchId ? <T size={12} color={A.muted} style={{ flex: 1.4, minWidth: 140 }}>{p.batch}</T> : null}
          </Row>
        ))}
        {data.attentionTotal > data.attention.length ? (
          <T size={11} color={A.muted} style={{ marginTop: 6 }}>Showing the first {data.attention.length}.</T>
        ) : null}
      </Card>
    </View>
  );
}

export default function AnalyticsAdmin() {
  const [program, setProgram] = useState('lep');
  const [batchId, setBatchId] = useState('');
  const [batches, setBatches] = useState([]);

  useEffect(() => subscribeToBatches(setBatches, () => setBatches([])), []);
  const cmsProgram = PROGRAMS.find((p) => p.value === program)?.cms;
  const programBatches = useMemo(
    () => batches.filter((b) => String(b.program || 'LEP').toUpperCase() === cmsProgram && b.lmsGroupId),
    [batches, cmsProgram]
  );

  return (
    <ScrollView style={{ flex: 1 }} contentContainerStyle={{ padding: 24 }}>
      <H style={{ marginBottom: 4 }}>App analytics</H>
      <T color={A.muted} style={{ marginBottom: 14, maxWidth: 760 }}>
        How learners use the Iron Lady app: who has opened it, who is active, practice, videos and live sessions.
      </T>
      <Card style={{ marginBottom: 14, padding: 14 }}>
        <Row gap={16} style={{ flexWrap: 'wrap' }}>
          <View style={{ minWidth: 240 }}>
            <T size={11} weight="bold" color={A.muted} style={{ marginBottom: 6, textTransform: 'uppercase', letterSpacing: 0.6 }}>Program</T>
            <Select value={program} onChange={(v) => { setProgram(v); setBatchId(''); }} options={PROGRAMS.map(({ value, label }) => ({ value, label }))} />
          </View>
          <View style={{ minWidth: 280, flex: 1 }}>
            <T size={11} weight="bold" color={A.muted} style={{ marginBottom: 6, textTransform: 'uppercase', letterSpacing: 0.6 }}>Batch</T>
            <Select
              value={batchId}
              onChange={setBatchId}
              options={[{ value: '', label: 'All batches' }, ...programBatches.map((b) => ({ value: b.id, label: formatBatchPickerLabel(b) }))]}
            />
          </View>
        </Row>
      </Card>
      <AppAnalyticsView program={program} batchId={batchId} />
    </ScrollView>
  );
}

import React, { useEffect, useState } from 'react';
import { View } from 'react-native';
import Pressable from '../../../components/il/Press';
import { fetchZohoSyncStatus, runZohoSyncNow } from '../../../services/cms';
import { A, Btn, Row, T } from '../adminUi';

function toMs(v) {
  if (!v) return null;
  if (typeof v === 'string') return Date.parse(v);
  if (typeof v.seconds === 'number') return v.seconds * 1000;
  if (typeof v._seconds === 'number') return v._seconds * 1000;
  return null;
}

function whenWords(v) {
  const ms = toMs(v);
  if (!ms) return '';
  const d = new Date(ms);
  const time = d.toLocaleTimeString('en-IN', { timeZone: 'Asia/Kolkata', hour: 'numeric', minute: '2-digit' }).toUpperCase();
  const today = new Date().toLocaleDateString('en-CA', { timeZone: 'Asia/Kolkata' });
  const day = d.toLocaleDateString('en-CA', { timeZone: 'Asia/Kolkata' });
  if (day === today) return `today ${time}`;
  return `${d.toLocaleDateString('en-IN', { timeZone: 'Asia/Kolkata', weekday: 'short', day: 'numeric', month: 'short' })}, ${time}`;
}

/** One plain sentence about the last Zoho sync, for someone who has never heard of an API. */
function summary(s) {
  if (!s) return { tone: 'muted', text: 'Not synced from Zoho yet. The first sync runs tonight at 2:00 AM.' };
  if (s.state === 'running') return { tone: 'muted', text: `Syncing from Zoho now (started ${whenWords(s.startedAt)})…` };
  if (s.state === 'skipped') return { tone: 'warn', text: `Last sync ${whenWords(s.finishedAt)} was skipped: ${s.message}` };
  if (s.state === 'failed') return { tone: 'error', text: `Last sync ${whenWords(s.finishedAt)} did not finish: ${s.message}` };
  const parts = [
    `${s.batches} batches up to date`,
    s.newBatches ? `${s.newBatches} new` : null,
    `${s.learnersLinked} learners linked`,
    s.learnersMoved ? `${s.learnersMoved} moved to their new batch` : null,
    s.learnersWithoutLogin ? `${s.learnersWithoutLogin} will appear when they first sign in to the app` : null,
  ].filter(Boolean);
  return { tone: 'ok', text: `Synced from Zoho ${whenWords(s.finishedAt)} · ${parts.join(' · ')}.` };
}

/**
 * Where batches come from, in plain words: last Zoho sync, what it found, a
 * "Sync now" button (server allows it at most once an hour), and how it works.
 */
export default function ZohoSyncBar({ onSynced }) {
  const [status, setStatus] = useState(undefined);
  const [busy, setBusy] = useState(false);
  const [note, setNote] = useState(null);
  const [open, setOpen] = useState(false);

  const load = () =>
    fetchZohoSyncStatus()
      .then(setStatus)
      .catch(() => setStatus(null));

  useEffect(() => {
    load();
  }, []);

  const syncNow = async () => {
    setBusy(true);
    setNote(null);
    try {
      const res = await runZohoSyncNow();
      if (res?.ok === false && res?.message && !res?.state) setNote(res.message);
      await load();
      onSynced?.();
    } catch (e) {
      setNote(e?.message || 'Could not start the sync. Try again later.');
    } finally {
      setBusy(false);
    }
  };

  const s = summary(status);
  const color = { ok: A.ok, warn: '#9A5B00', error: A.danger, muted: A.muted }[s.tone];
  const bg = { ok: '#E3F4EA', warn: '#FFF3DC', error: '#FCE8E8', muted: '#F1F0EA' }[s.tone];

  return (
    <View style={{ backgroundColor: bg, borderRadius: 12, padding: 12, marginBottom: 14 }}>
      <Row gap={10} style={{ alignItems: 'center', flexWrap: 'wrap' }}>
        <T size={13} color={color} style={{ flex: 1, minWidth: 260 }}>
          {status === undefined ? 'Checking the last Zoho sync…' : s.text}
        </T>
        <Btn label={busy ? 'Syncing… (a minute or two)' : 'Sync now'} kind="ghost" small loading={busy} onPress={syncNow} />
      </Row>
      {note ? <T size={12} color={A.ink} style={{ marginTop: 6 }}>{note}</T> : null}
      <Pressable onPress={() => setOpen((v) => !v)} style={{ marginTop: 6 }}>
        <T size={12} weight="semibold" color={A.navy}>{open ? '▼' : '▶'} How syncing works</T>
      </Pressable>
      {open ? (
        <View style={{ marginTop: 6 }}>
          {[
            'Batches and learners come from Zoho. You never type them in.',
            'Every night at 2:00 AM the CMS reads Zoho once and updates every LEP, 100BM and MBW batch.',
            'Zoho allows a limited number of reads per day. Learner logins come first, so if the day is busy the sync waits until the next night — nothing breaks.',
            '“Sync now” is for a batch that started today. It works once an hour.',
            'When someone changes a learner’s batch in Zoho, she moves to the new batch straight away (and the nightly sync double-checks).',
            'A learner who is in Zoho but has never signed in to the app is counted when she first signs in.',
            'The sync only reads Zoho. It never changes anything in Zoho.',
          ].map((line) => (
            <T key={line} size={12} color={A.ink} style={{ marginTop: 3 }}>• {line}</T>
          ))}
        </View>
      ) : null}
    </View>
  );
}

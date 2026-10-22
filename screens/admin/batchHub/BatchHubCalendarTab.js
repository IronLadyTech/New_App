import React, { useEffect, useMemo, useState } from 'react';
import { View } from 'react-native';
import Pressable from '../../../components/il/Press';
import { saveBatchFields, scheduleBatchMessage } from '../../../services/cms';
import { resolveCmsBatchSessions } from '../../../utils/cmsBatchSessions';
import { buildLepBatchSessions, toISTIso } from '../../../utils/lepBatchSchedule';
import { A, Btn, Card, Input, Notice, Row, T } from '../adminUi';
import { DateInput, FieldLabel, Pill } from './cmsBits';

function niceDay(iso) {
  const d = iso ? new Date(`${String(iso).slice(0, 10)}T12:00:00`) : null;
  return d && !Number.isNaN(d.getTime()) ? d.toLocaleDateString('en-IN', { weekday: 'short', day: 'numeric', month: 'short' }) : '';
}

function niceTime(hhmm) {
  const [h, m] = String(hhmm || '').split(':').map(Number);
  if (Number.isNaN(h)) return hhmm || '';
  const d = new Date(Date.UTC(2000, 0, 1, h, m || 0));
  return d.toLocaleTimeString('en-IN', { timeZone: 'UTC', hour: 'numeric', minute: '2-digit' }).toUpperCase();
}

function TimeInput({ value, onChange }) {
  if (typeof document === 'undefined') return null;
  return React.createElement('input', {
    type: 'time',
    value: value || '',
    onChange: (e) => onChange(e.target.value),
    style: { padding: 8, borderRadius: 8, border: `1px solid ${A.line}`, fontSize: 14, background: '#fff' },
  });
}

/** The batch's sessions as stored: standard schedule + CX changes, cancelled ones included. */
function allSessions(batch, isLep) {
  const saved = Array.isArray(batch?.sessions) ? batch.sessions : [];
  if (!isLep || !batch?.day1Date) return [...saved].sort((a, b) => String(a.startAt || '').localeCompare(String(b.startAt || '')));
  const shown = resolveCmsBatchSessions(batch);
  const cancelled = saved.filter((s) => s.cancelled);
  return [...shown, ...cancelled].sort((a, b) => String(a.startAt || '').localeCompare(String(b.startAt || '')));
}

/**
 * The batch calendar: every session with its date, time and Zoom link. A change
 * here reaches the app straight away and the web LMS calendar within seconds.
 */
export default function BatchHubCalendarTab({ batch, programId, canEdit }) {
  const isLep = programId === 'lep';
  const sessions = useMemo(() => allSessions(batch, isLep), [batch, isLep]);
  const standard = useMemo(
    () => (isLep && batch?.day1Date ? Object.fromEntries(buildLepBatchSessions({ anchor: 'day1', date: batch.day1Date }).map((s) => [s.code, s])) : {}),
    [isLep, batch?.day1Date]
  );
  const [editing, setEditing] = useState(null);
  const [draft, setDraft] = useState({});
  const [tell, setTell] = useState(true);
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState(null);
  const [adding, setAdding] = useState(false);

  useEffect(() => {
    setEditing(null);
    setAdding(false);
  }, [batch?.id]);

  if (!batch?.id) return <Notice tone="neutral">Pick a batch at the top to see its calendar.</Notice>;

  const writeSessions = async (next, notice) => {
    setBusy(true);
    setMsg(null);
    try {
      await saveBatchFields(batch.id, { sessions: next });
      if (notice && tell) {
        await scheduleBatchMessage({
          batchId: batch.id,
          program: batch.program,
          audience: 'all',
          sendAt: new Date().toISOString(),
          title: notice.title,
          body: notice.body,
        });
      }
      setMsg({ tone: 'ok', text: `Saved. The app shows it now; the web LMS calendar updates within a minute.${notice && tell ? ' Learners are being told.' : ''}` });
      setEditing(null);
      setAdding(false);
    } catch (e) {
      setMsg({ tone: 'error', text: e?.message || 'Could not save. Try again.' });
    } finally {
      setBusy(false);
    }
  };

  const startEdit = (s) => {
    setEditing(s.code);
    setAdding(false);
    setDraft({ date: String(s.date || '').slice(0, 10), startTime: s.startTime || '', endTime: s.endTime || '', joinLink: s.joinLink || '', title: s.title || '' });
  };

  const saveRow = (s) => {
    if (!draft.date || !draft.startTime || !draft.endTime) {
      setMsg({ tone: 'error', text: 'Pick the date, start and end time.' });
      return;
    }
    const moved = draft.date !== String(s.date || '').slice(0, 10) || draft.startTime !== s.startTime || draft.endTime !== s.endTime;
    const next = sessions.map((row) =>
      row.code !== s.code
        ? row
        : {
            ...row,
            title: draft.title || row.title,
            joinLink: draft.joinLink.trim(),
            ...(moved || row.custom
              ? {
                  custom: true,
                  date: draft.date,
                  startTime: draft.startTime,
                  endTime: draft.endTime,
                  startAt: toISTIso(draft.date, draft.startTime),
                  endAt: toISTIso(draft.date, draft.endTime),
                }
              : {}),
          }
    );
    const notice = moved
      ? { title: `${draft.title || s.title} has moved`, body: `${draft.title || s.title} is now on ${niceDay(draft.date)} at ${niceTime(draft.startTime)} IST.` }
      : null;
    writeSessions(next, notice);
  };

  const backToStandard = (s) => {
    const std = standard[s.code];
    if (!std) return;
    const next = sessions.map((row) => (row.code === s.code ? { ...std, title: row.title || std.title, joinLink: row.joinLink || '' } : row));
    writeSessions(next, tell ? { title: `${s.title} — back to its usual time`, body: `${s.title} is on ${niceDay(std.date)} at ${niceTime(std.startTime)} IST.` } : null);
  };

  const setCancelled = (s, cancelled) => {
    const next = s.extra && cancelled
      ? sessions.filter((row) => row.code !== s.code)
      : sessions.map((row) => (row.code === s.code ? { ...row, cancelled: cancelled || undefined } : row));
    writeSessions(next, cancelled ? { title: `${s.title} is cancelled`, body: `${s.title} on ${niceDay(s.date)} will not take place. We will share the next step soon.` } : null);
  };

  const addSession = () => {
    if (!draft.title?.trim() || !draft.date || !draft.startTime || !draft.endTime) {
      setMsg({ tone: 'error', text: 'Give the session a name, date, start and end time.' });
      return;
    }
    const row = {
      code: `X${Date.now().toString(36).toUpperCase()}`,
      title: draft.title.trim(),
      kind: 'core',
      extra: true,
      custom: true,
      date: draft.date,
      startTime: draft.startTime,
      endTime: draft.endTime,
      startAt: toISTIso(draft.date, draft.startTime),
      endAt: toISTIso(draft.date, draft.endTime),
      joinLink: (draft.joinLink || '').trim(),
    };
    writeSessions([...sessions, row], {
      title: `New session: ${row.title}`,
      body: `${row.title} is on ${niceDay(row.date)} at ${niceTime(row.startTime)} IST.`,
    });
  };

  const editor = (onSave, saveLabel) => (
    <View style={{ marginTop: 10, backgroundColor: '#FFFEF8', borderRadius: 12, padding: 12, borderWidth: 1, borderColor: A.line }}>
      <Row gap={12} style={{ flexWrap: 'wrap', alignItems: 'flex-end' }}>
        <View style={{ minWidth: 220, flex: 1 }}>
          <FieldLabel>Session name</FieldLabel>
          <Input value={draft.title} onChangeText={(v) => setDraft((d) => ({ ...d, title: v }))} placeholder="e.g. Extra Q&A" />
        </View>
        <View style={{ width: 170 }}>
          <FieldLabel>Date</FieldLabel>
          <DateInput value={draft.date} onChange={(v) => setDraft((d) => ({ ...d, date: v }))} />
        </View>
        <View>
          <FieldLabel>Starts</FieldLabel>
          <TimeInput value={draft.startTime} onChange={(v) => setDraft((d) => ({ ...d, startTime: v }))} />
        </View>
        <View>
          <FieldLabel>Ends</FieldLabel>
          <TimeInput value={draft.endTime} onChange={(v) => setDraft((d) => ({ ...d, endTime: v }))} />
        </View>
      </Row>
      <View style={{ marginTop: 10 }}>
        <FieldLabel>Zoom link</FieldLabel>
        <Input value={draft.joinLink} onChangeText={(v) => setDraft((d) => ({ ...d, joinLink: v }))} placeholder="https://zoom.us/j/…" autoCapitalize="none" />
      </View>
      <Row gap={8} style={{ marginTop: 10, alignItems: 'center', flexWrap: 'wrap' }}>
        <Btn label={saveLabel} small loading={busy} onPress={onSave} />
        <Btn label="Cancel" kind="ghost" small onPress={() => { setEditing(null); setAdding(false); }} />
      </Row>
    </View>
  );

  return (
    <View>
      {msg ? <Notice tone={msg.tone}>{msg.text}</Notice> : null}
      <Notice tone="neutral">
        {isLep
          ? 'The standard LEP schedule, worked out from Day 1. Move a session, change a time or Zoom link, or add one — the app shows it at once and the web LMS calendar follows.'
          : 'Add this batch’s live sessions. The app and the web LMS calendar show them.'}
        {batch.lmsGroupId ? '' : ' (Link this batch to its learners first so the web LMS calendar can receive it.)'}
      </Notice>

      {canEdit ? (
        <Row gap={10} style={{ marginBottom: 12, alignItems: 'center', flexWrap: 'wrap' }}>
          <Btn
            label="+ Add a session"
            small
            onPress={() => {
              setAdding(true);
              setEditing(null);
              setDraft({ title: '', date: '', startTime: '19:00', endTime: '20:00', joinLink: '' });
            }}
          />
          <Pressable onPress={() => setTell((v) => !v)}>
            <T size={13} color={A.ink}>{tell ? '☑' : '☐'} Tell learners when I move, add or cancel a session</T>
          </Pressable>
        </Row>
      ) : null}
      {adding ? <Card style={{ marginBottom: 10, padding: 12 }}>{editor(addSession, 'Add session')}</Card> : null}

      {sessions.length ? null : <T color={A.muted}>No sessions yet.</T>}
      {sessions.map((s) => (
        <Card key={s.code} style={{ marginBottom: 8, padding: 12, opacity: s.cancelled ? 0.5 : 1 }}>
          <Row gap={10} style={{ alignItems: 'center', flexWrap: 'wrap' }}>
            <View style={{ width: 120 }}>
              <T size={13} weight="bold">{niceDay(s.date)}</T>
              <T size={12} color={A.muted}>{niceTime(s.startTime)}–{niceTime(s.endTime)}</T>
            </View>
            <View style={{ flex: 1, minWidth: 200 }}>
              <T size={14} weight="semibold">{s.title}</T>
              <T size={12} color={s.joinLink ? A.muted : A.danger}>{s.joinLink ? 'Zoom link added' : 'No Zoom link yet'}</T>
            </View>
            {s.cancelled ? <Pill label="Cancelled" tone="miss" /> : s.extra ? <Pill label="Added by CX" tone="neutral" /> : s.custom ? <Pill label="Moved by CX" tone="warn" /> : <Pill label="Standard" tone="muted" />}
            {canEdit ? (
              <Row gap={6}>
                {!s.cancelled ? <Btn label="Change" kind="ghost" small onPress={() => startEdit(s)} /> : null}
                {s.custom && !s.extra && standard[s.code] ? <Btn label="Back to standard" kind="ghost" small onPress={() => backToStandard(s)} /> : null}
                <Btn label={s.cancelled ? 'Restore' : s.extra ? 'Remove' : 'Cancel session'} kind="ghost" small onPress={() => setCancelled(s, !s.cancelled)} />
              </Row>
            ) : null}
          </Row>
          {editing === s.code ? editor(() => saveRow(s), 'Save') : null}
        </Card>
      ))}
    </View>
  );
}

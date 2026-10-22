import React, { useEffect, useMemo, useState } from 'react';
import { View } from 'react-native';
import Pressable from '../../../components/il/Press';
import { CMS } from '../../../constants/cms';
import { removeCmsListItem, saveCmsListItem, subscribeToPracticeItems, uploadCmsFile } from '../../../services/cms';
import { buildEnrolledDailyPractice, buildRegisteredDailyPractice, todayIsoIST } from '../../../utils/lepDailyPractice';
import { A, Btn, Card, Field, Input, Notice, Row, T } from '../adminUi';
import { AddBox, AudiencePicker, DateInput, FieldLabel, Pill, Segmented, audienceLabel, audienceMatches } from './cmsBits';

const EMPTY = { title: '', how: '', days: 'daily', from: '', to: '', videoUrl: '', scope: 'batch', audience: 'all' };

function dayLabel(iso) {
  if (!iso) return '';
  const d = new Date(`${String(iso).slice(0, 10)}T12:00:00`);
  return Number.isNaN(d.getTime()) ? '' : d.toLocaleDateString('en-IN', { weekday: 'short', day: 'numeric', month: 'short' });
}

function describeDays(item) {
  const which = item.days === 'weekdays' ? 'Weekdays' : 'Every day';
  const from = dayLabel(item.from);
  const to = dayLabel(item.to);
  if (from && to) return `${which} · ${from} – ${to}`;
  if (from) return `${which} · from ${from}`;
  if (to) return `${which} · until ${to}`;
  return which;
}

/** Daily practice CX adds: what she ticks on her Practice list, on which days, for whom. */
export default function BatchHubPracticeTab({ batch, programId = 'lep', learner = 'all', canEdit, canManage }) {
  const [items, setItems] = useState([]);
  const [draft, setDraft] = useState(EMPTY);
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState(null);
  const [showBuiltIn, setShowBuiltIn] = useState(false);

  useEffect(() => subscribeToPracticeItems(programId, setItems, () => setItems([])), [programId]);

  const shown = useMemo(
    () => items.filter((p) => (!p.batchId || p.batchId === batch?.id) && audienceMatches(p.audience, learner)),
    [items, batch?.id, learner]
  );
  const set = (patch) => setDraft((d) => ({ ...d, ...patch }));

  const uploadVideo = () => {
    if (typeof document === 'undefined') return;
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'video/*';
    input.onchange = async () => {
      const file = input.files?.[0];
      if (!file) return;
      setBusy(true);
      try {
        const { url } = await uploadCmsFile(file, programId);
        set({ videoUrl: url });
        setMsg({ tone: 'ok', text: `${file.name} uploaded.` });
      } catch (e) {
        setMsg({ tone: 'error', text: e?.message || 'Upload failed. Try again.' });
      } finally {
        setBusy(false);
      }
    };
    input.click();
  };

  const save = async () => {
    if (!draft.title.trim()) {
      setMsg({ tone: 'error', text: 'Give the practice a name first.' });
      return;
    }
    if (draft.scope === 'batch' && !batch?.id) {
      setMsg({ tone: 'error', text: 'Pick a batch at the top, or choose “Whole program”.' });
      return;
    }
    if (draft.from && draft.to && draft.to < draft.from) {
      setMsg({ tone: 'error', text: 'The end date is before the start date.' });
      return;
    }
    setBusy(true);
    setMsg(null);
    try {
      await saveCmsListItem(CMS.PRACTICE, {
        id: draft.id,
        program: programId,
        batchId: draft.scope === 'batch' ? batch.id : null,
        title: draft.title.trim(),
        how: draft.how.trim(),
        days: draft.days,
        from: draft.from || '',
        to: draft.to || '',
        videoUrl: draft.videoUrl.trim(),
        audience: draft.audience,
        published: true,
      });
      setDraft(EMPTY);
      setMsg({ tone: 'ok', text: draft.id ? 'Updated.' : 'Added — it shows on her Practice list on those days.' });
    } catch (e) {
      setMsg({ tone: 'error', text: e?.message || 'Could not save. Try again.' });
    } finally {
      setBusy(false);
    }
  };

  const today = todayIsoIST();
  const anchor = batch?.orientationDate || null;
  const builtIn = useMemo(
    () => (learner === 'register' ? buildRegisteredDailyPractice : buildEnrolledDailyPractice)(today, anchor, batch?.day1Date),
    [today, anchor, batch?.day1Date, learner]
  );

  return (
    <View>
      {msg ? <Notice tone={msg.tone}>{msg.text}</Notice> : null}
      <Notice tone="neutral">Daily practice is what she ticks each day. Add an item, choose the days and who gets it.</Notice>

      {canEdit ? (
        <AddBox title={draft.id ? 'Edit practice item' : '+ Add a practice item'}>
          <Row gap={12} style={{ flexWrap: 'wrap' }}>
            <View style={{ flex: 1, minWidth: 220 }}>
              <Field label="Name">
                <Input value={draft.title} onChangeText={(v) => set({ title: v })} placeholder="e.g. Gratitude note" />
              </Field>
            </View>
            <View style={{ flex: 1, minWidth: 220 }}>
              <Field label="What she does">
                <Input value={draft.how} onChangeText={(v) => set({ how: v })} placeholder="e.g. Write one line about today" />
              </Field>
            </View>
          </Row>
          <Row gap={12} style={{ flexWrap: 'wrap', alignItems: 'flex-start' }}>
            <View style={{ minWidth: 200 }}>
              <FieldLabel>Which days</FieldLabel>
              <Segmented options={[{ value: 'daily', label: 'Every day' }, { value: 'weekdays', label: 'Weekdays' }]} value={draft.days} onChange={(v) => set({ days: v })} />
            </View>
            <View style={{ minWidth: 160 }}>
              <FieldLabel>From</FieldLabel>
              <DateInput value={draft.from} onChange={(v) => set({ from: v })} />
            </View>
            <View style={{ minWidth: 160 }}>
              <FieldLabel>Until</FieldLabel>
              <DateInput value={draft.to} onChange={(v) => set({ to: v })} />
            </View>
          </Row>
          <View style={{ marginTop: 12 }}>
            <Field label="How-to video (optional)" hint="Plays inside the app. Learners are never sent to YouTube.">
              <Row gap={8}>
                <View style={{ flex: 1 }}>
                  <Input value={draft.videoUrl} onChangeText={(v) => set({ videoUrl: v })} placeholder="Paste a YouTube link…" autoCapitalize="none" />
                </View>
                <Btn label="…or upload" kind="ghost" small loading={busy} onPress={uploadVideo} />
              </Row>
            </Field>
          </View>
          <Row gap={16} style={{ flexWrap: 'wrap' }}>
            <View>
              <FieldLabel>For</FieldLabel>
              <Segmented options={[{ value: 'batch', label: 'This batch' }, { value: 'program', label: 'Whole program' }]} value={draft.scope} onChange={(v) => set({ scope: v })} />
            </View>
            <View>
              <FieldLabel>Who gets it</FieldLabel>
              <AudiencePicker value={draft.audience} onChange={(v) => set({ audience: v })} />
            </View>
          </Row>
          <Row gap={8} style={{ marginTop: 14 }}>
            <Btn label={draft.id ? 'Save changes' : 'Add'} onPress={save} loading={busy} />
            {draft.id ? <Btn label="Cancel edit" kind="ghost" onPress={() => setDraft(EMPTY)} /> : null}
          </Row>
        </AddBox>
      ) : null}

      <FieldLabel>Practice you added</FieldLabel>
      {shown.length ? null : <T color={A.muted} style={{ marginBottom: 12 }}>Nothing added for this batch yet.</T>}
      {shown.map((p) => (
        <Card key={p.id} style={{ marginBottom: 8, padding: 12, opacity: p.published === false ? 0.55 : 1 }}>
          <Row gap={10} style={{ alignItems: 'flex-start', flexWrap: 'wrap' }}>
            <View style={{ flex: 1, minWidth: 200 }}>
              <T size={14} weight="semibold">{p.title}</T>
              <T size={12} color={A.muted}>{[p.how, describeDays(p)].filter(Boolean).join(' · ')}</T>
            </View>
            {p.videoUrl ? <Pill label="▶ Video" tone="ok" /> : null}
            <Pill label={`${p.batchId ? 'This batch' : 'Whole program'} · ${audienceLabel(p.audience)}`} />
            {canEdit ? (
              <Row gap={6}>
                <Btn label="Edit" kind="ghost" small onPress={() => setDraft({ ...EMPTY, ...p, scope: p.batchId ? 'batch' : 'program', audience: p.audience || 'all' })} />
                <Btn label={p.published === false ? 'Show' : 'Hide'} kind="ghost" small onPress={() => saveCmsListItem(CMS.PRACTICE, { id: p.id, published: p.published === false })} />
                <Btn
                  label="Remove"
                  kind="danger"
                  small
                  onPress={() => {
                    if (typeof window === 'undefined' || window.confirm(`Remove “${p.title}” from practice?`)) removeCmsListItem(CMS.PRACTICE, p.id);
                  }}
                />
              </Row>
            ) : null}
          </Row>
        </Card>
      ))}

      {programId === 'lep' ? (
        <View style={{ marginTop: 16 }}>
          <Pressable onPress={() => setShowBuiltIn((v) => !v)}>
            <T size={13} weight="semibold" color={A.navy}>
              {showBuiltIn ? '▼' : '▶'} Built-in practice today ({builtIn.length}) — part of the LEP journey{canManage ? '' : ', cannot be changed here'}
            </T>
          </Pressable>
          {showBuiltIn
            ? builtIn.map((row) => (
                <Card key={row.id} style={{ marginTop: 6, padding: 10 }}>
                  <T size={13} weight="semibold">{row.title}</T>
                  <T size={11} color={A.muted}>{row.meta}{row.dailyReset ? ' · every day' : ''}</T>
                </Card>
              ))
            : null}
        </View>
      ) : null}
    </View>
  );
}

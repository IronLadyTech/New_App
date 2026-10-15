import React, { useEffect, useMemo, useState } from 'react';
import { ScrollView, View } from 'react-native';
import { LEP_TIMEZONE } from '../../constants/lepSessionTemplate';
import { deleteBatch, saveBatch, subscribeToBatches } from '../../services/cms';
import {
  buildLepBatchSessions,
  day1FromOrientationThursday,
  describeBatchAnchor,
  orientationFromDay1Saturday,
} from '../../utils/lepBatchSchedule';
import { A, Btn, Card, Field, H, Input, Notice, Row, Select, T } from './adminUi';
import { CemHelpCard } from './AdminSectionGuide';

function emptyDraft() {
  return {
    id: null,
    name: '',
    program: 'LEP',
    anchor: 'orientation',
    anchorDate: '',
    orientationDate: '',
    day1Date: '',
    timezone: LEP_TIMEZONE,
    sessions: [],
    notes: '',
    openForEnrollment: true,
    filling: false,
  };
}

function syncAnchorDates(draft) {
  if (!draft.anchorDate) return draft;
  if (draft.anchor === 'orientation') {
    return {
      ...draft,
      orientationDate: draft.anchorDate,
      day1Date: day1FromOrientationThursday(draft.anchorDate),
    };
  }
  return {
    ...draft,
    day1Date: draft.anchorDate,
    orientationDate: orientationFromDay1Saturday(draft.anchorDate),
  };
}

export default function BatchCalendarAdmin({ canEdit }) {
  const [batches, setBatches] = useState([]);
  const [draft, setDraft] = useState(emptyDraft());
  const [msg, setMsg] = useState(null);
  const [busy, setBusy] = useState(false);

  useEffect(() => subscribeToBatches(setBatches, (e) => setMsg({ tone: 'error', text: e.message })), []);

  const selected = useMemo(() => batches.find((b) => b.id === draft.id), [batches, draft.id]);

  const loadBatch = (b) => {
    if (!b) {
      setDraft(emptyDraft());
      return;
    }
    setDraft({
      id: b.id,
      name: b.name || '',
      program: b.program || 'LEP',
      anchor: b.orientationDate && b.day1Date ? 'orientation' : 'day1',
      anchorDate: b.orientationDate || b.day1Date || '',
      orientationDate: b.orientationDate || '',
      day1Date: b.day1Date || '',
      timezone: b.timezone || LEP_TIMEZONE,
      sessions: b.sessions || [],
      notes: b.notes || '',
      openForEnrollment: b.openForEnrollment !== false,
      filling: b.filling === true,
    });
  };

  const generateSessions = () => {
    const synced = syncAnchorDates(draft);
    if (!synced.anchorDate) {
      setMsg({ tone: 'error', text: 'Pick an orientation Thursday (or Day 1 Saturday) first.' });
      return;
    }
    const links = {};
    (draft.sessions || []).forEach((s) => {
      if (s.joinLink) links[s.code] = s.joinLink;
    });
    const sessions = buildLepBatchSessions({
      anchor: synced.anchor,
      date: synced.anchorDate,
      joinLinks: links,
    });
    setDraft({ ...synced, sessions });
    setMsg({ tone: 'ok', text: `Generated ${sessions.length} sessions (LEP v1.5 template).` });
  };

  const updateSession = (code, patch) => {
    setDraft((d) => ({
      ...d,
      sessions: (d.sessions || []).map((s) => (s.code === code ? { ...s, ...patch } : s)),
    }));
  };

  const save = async () => {
    setBusy(true);
    setMsg(null);
    try {
      const synced = syncAnchorDates(draft);
      if (!synced.name?.trim()) throw new Error('Batch name is required.');
      if (!synced.day1Date) throw new Error('Set orientation or Day 1 date.');
      if (!synced.sessions?.length) throw new Error('Click “Generate schedule” first.');
      const id = await saveBatch({
        id: synced.id,
        name: synced.name.trim(),
        program: synced.program,
        orientationDate: synced.orientationDate,
        day1Date: synced.day1Date,
        timezone: synced.timezone,
        sessions: synced.sessions,
        notes: synced.notes || '',
        openForEnrollment: synced.openForEnrollment !== false,
        filling: synced.filling === true,
      });
      setDraft((d) => ({ ...d, id }));
      setMsg({ tone: 'ok', text: 'Batch calendar saved. Notification rules use session codes (S0, S1, …).' });
    } catch (e) {
      setMsg({ tone: 'error', text: e.message });
    } finally {
      setBusy(false);
    }
  };

  const remove = async () => {
    if (!draft.id || !canEdit) return;
    setBusy(true);
    try {
      await deleteBatch(draft.id);
      setDraft(emptyDraft());
      setMsg({ tone: 'ok', text: 'Batch removed.' });
    } catch (e) {
      setMsg({ tone: 'error', text: e.message });
    } finally {
      setBusy(false);
    }
  };

  return (
    <ScrollView style={{ flex: 1 }} contentContainerStyle={{ padding: 28 }}>
      <H style={{ marginBottom: 6 }}>Batch calendar</H>
      <T color={A.muted} style={{ marginBottom: 12, maxWidth: 760 }}>
        LEP v1.5: each batch has <T weight="semibold">Thursday orientation</T>, then that week’s{' '}
        <T weight="semibold">Saturday & Sunday 9:00 AM–7:00 PM</T> (Day 1 & Day 2), plus all core and optional
        sessions. Reminder messages in “Messages to learners” fire relative to these session times.
      </T>
      <CemHelpCard sectionKey="batches" />
      {msg ? <Notice tone={msg.tone}>{msg.text}</Notice> : null}

      <Row style={{ marginTop: 16, marginBottom: 12 }} gap={8}>
        <View style={{ minWidth: 220 }}>
          <Select
            value={draft.id || 'new'}
            onChange={(v) => loadBatch(v === 'new' ? null : batches.find((b) => b.id === v))}
            options={[
              { value: 'new', label: '+ New batch' },
              ...batches.map((b) => ({
                value: b.id,
                label: `${b.name || 'Batch'} · Day 1 ${b.day1Date || '?'}`,
              })),
            ]}
          />
        </View>
        {canEdit ? (
          <Btn label="New batch" kind="ghost" onPress={() => loadBatch(null)} />
        ) : null}
      </Row>

      <Card style={{ marginBottom: 20 }}>
        <Field label="Batch name">
          <Input
            value={draft.name}
            onChangeText={(v) => setDraft((d) => ({ ...d, name: v }))}
            placeholder="e.g. LEP Oct 2026 — Cohort A"
            editable={canEdit}
          />
        </Field>
        <Row gap={12}>
          <View style={{ flex: 1 }}>
            <Field label="Anchor date type">
              <Select
                value={draft.anchor}
                onChange={(v) => setDraft((d) => syncAnchorDates({ ...d, anchor: v }))}
                options={[
                  { value: 'orientation', label: 'Orientation Thursday (recommended)' },
                  { value: 'day1', label: 'Day 1 Saturday' },
                ]}
                disabled={!canEdit}
              />
            </Field>
          </View>
          <View style={{ flex: 1 }}>
            <Field label={draft.anchor === 'orientation' ? 'Orientation Thursday' : 'Day 1 Saturday'}>
              {typeof document !== 'undefined' ? (
                <input
                  type="date"
                  value={draft.anchorDate}
                  onChange={(e) =>
                    setDraft((d) => syncAnchorDates({ ...d, anchorDate: e.target.value }))
                  }
                  disabled={!canEdit}
                  style={{
                    width: '100%',
                    padding: 10,
                    borderRadius: 8,
                    border: `1px solid ${A.line}`,
                    fontSize: 14,
                  }}
                />
              ) : (
                <Input
                  value={draft.anchorDate}
                  onChangeText={(v) => setDraft((d) => syncAnchorDates({ ...d, anchorDate: v }))}
                  placeholder="YYYY-MM-DD"
                  editable={canEdit}
                />
              )}
            </Field>
          </View>
        </Row>
        {draft.day1Date ? (
          <T size={13} color={A.muted} style={{ marginBottom: 12 }}>
            {describeBatchAnchor(draft)} · {LEP_TIMEZONE}
          </T>
        ) : null}
        {canEdit ? (
          <Row gap={8} style={{ marginBottom: 12, flexWrap: 'wrap' }}>
            <Btn
              label={draft.openForEnrollment !== false ? '✓ On signup list' : 'Hidden from signup'}
              kind="ghost"
              small
              onPress={() =>
                setDraft((d) => ({ ...d, openForEnrollment: d.openForEnrollment === false }))
              }
            />
            <Btn
              label={draft.filling ? '✓ Filling fast' : 'Filling fast (off)'}
              kind="ghost"
              small
              onPress={() => setDraft((d) => ({ ...d, filling: !d.filling }))}
            />
          </Row>
        ) : null}
        {canEdit ? (
          <Row gap={8}>
            <Btn label="Generate LEP v1.5 schedule" onPress={generateSessions} />
            <Btn label="Save batch" onPress={save} loading={busy} />
            {draft.id ? <Btn label="Delete" kind="ghost" onPress={remove} loading={busy} /> : null}
          </Row>
        ) : null}
      </Card>

      {(draft.sessions || []).length ? (
        <View>
          <T weight="semibold" size={13} style={{ marginBottom: 10 }}>
            Sessions ({draft.sessions.length})
          </T>
          {draft.sessions.map((s) => (
            <Card key={s.code} style={{ marginBottom: 10, paddingVertical: 12 }}>
              <Row style={{ justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <View style={{ flex: 1 }}>
                  <T weight="semibold" size={14}>
                    {s.code} · {s.title}
                  </T>
                  <T size={12} color={A.muted}>
                    {s.weekLabel} · {s.kind === 'optional' ? 'Optional' : 'Core'} · {s.date} · {s.startTime}–
                    {s.endTime} IST
                  </T>
                </View>
              </Row>
              {canEdit ? (
                <Field label="Zoom / join link" style={{ marginTop: 10, marginBottom: 0 }}>
                  <Input
                    value={s.joinLink || ''}
                    onChangeText={(v) => updateSession(s.code, { joinLink: v })}
                    placeholder="https://zoom.us/j/..."
                    autoCapitalize="none"
                  />
                </Field>
              ) : s.joinLink ? (
                <T size={12} color={A.muted} style={{ marginTop: 8 }}>{s.joinLink}</T>
              ) : null}
            </Card>
          ))}
        </View>
      ) : selected?.sessions?.length ? (
        <T color={A.muted}>Select the batch above to view sessions.</T>
      ) : null}
    </ScrollView>
  );
}

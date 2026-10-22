import React, { useEffect, useMemo, useState } from 'react';
import { ScrollView, View } from 'react-native';
import Pressable from '../../components/il/Press';
import { LEP_TIMEZONE } from '../../constants/lepSessionTemplate';
import { deleteBatch, saveBatch, subscribeToBatches } from '../../services/cms';
import { formatBatchPickerLabel, suggestLmsGroupId } from '../../utils/cmsBatchLabel';
import {
  buildLepBatchSessions,
  day1FromOrientationThursday,
  describeBatchAnchor,
  mergeCustomSessions,
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
    status: 'draft',
    automationEnabled: false,
    zohoBatchKey: '',
    lmsGroupId: '',
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

export default function BatchCalendarAdmin({ canEdit, canDelete = canEdit, embed, hubBatchId, onHubBatchChange }) {
  const [batches, setBatches] = useState([]);
  const [draft, setDraft] = useState(emptyDraft());
  const [msg, setMsg] = useState(null);
  const [busy, setBusy] = useState(false);
  const [showIds, setShowIds] = useState(false);

  useEffect(() => subscribeToBatches(setBatches, (e) => setMsg({ tone: 'error', text: e.message })), []);

  useEffect(() => {
    if (!embed || !hubBatchId) return;
    const b = batches.find((x) => x.id === hubBatchId);
    if (b && draft.id !== b.id) loadBatch(b);
  }, [embed, hubBatchId, batches]);

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
      status: b.status || 'draft',
      automationEnabled: b.automationEnabled === true,
      zohoBatchKey: b.zohoBatchKey || '',
      lmsGroupId: b.lmsGroupId || '',
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

  const setAnchorDate = (value) => {
    setDraft((d) => {
      const synced = syncAnchorDates({ ...d, anchorDate: value });
      if (!synced.anchorDate) return synced;
      const links = {};
      (d.sessions || []).forEach((x) => {
        if (x.joinLink) links[x.code] = x.joinLink;
      });
      return {
        ...synced,
        sessions: mergeCustomSessions(
          buildLepBatchSessions({ anchor: synced.anchor, date: synced.anchorDate, joinLinks: links }),
          d.sessions
        ),
      };
    });
  };

  const linkAutomatically = () =>
    setDraft((d) => ({
      ...d,
      lmsGroupId: suggestLmsGroupId({ program: d.program, zohoBatchKey: d.zohoBatchKey || d.name }) || d.lmsGroupId,
    }));

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
      // Rebuild session dates from the current Day 1 / Orientation so Home stays in sync
      // when CMS dates change. Keep Zoom links (and any title/time edits) from the draft.
      const links = {};
      (synced.sessions || []).forEach((s) => {
        if (s?.code && s?.joinLink) links[s.code] = s.joinLink;
      });
      const sessions = mergeCustomSessions(
        buildLepBatchSessions({
          anchor: synced.anchor || 'day1',
          date: synced.anchorDate || synced.day1Date,
          joinLinks: links,
        }),
        synced.sessions
      );
      if (!sessions.length) throw new Error('Could not build the LEP session schedule.');
      const id = await saveBatch({
        id: synced.id,
        name: synced.name.trim(),
        program: synced.program,
        orientationDate: synced.orientationDate,
        day1Date: synced.day1Date,
        timezone: synced.timezone,
        sessions,
        notes: synced.notes || '',
        openForEnrollment: synced.openForEnrollment !== false,
        filling: synced.filling === true,
        status: synced.status,
        automationEnabled: synced.automationEnabled,
        zohoBatchKey: synced.zohoBatchKey?.trim() || '',
        lmsGroupId: synced.lmsGroupId?.trim() || '',
      });
      setDraft((d) => ({ ...d, id, sessions, ...synced }));
      onHubBatchChange?.(id);
      setMsg({
        tone: 'ok',
        text: 'Batch saved. Home uses the fixed LEP session times; CMS Day 1 + Zoom links apply when you change them.',
      });
    } catch (e) {
      setMsg({ tone: 'error', text: e.message });
    } finally {
      setBusy(false);
    }
  };

  const remove = async () => {
    if (!draft.id || !canDelete) return;
    if (
      typeof window !== 'undefined' &&
      !window.confirm(
        `Delete batch "${draft.name || draft.id}"?\n\nIts session dates, Zoom links and reminders stop for every learner in it. This cannot be undone.`
      )
    ) {
      return;
    }
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

  const body = (
    <>
      {!embed ? (
        <>
          <H style={{ marginBottom: 6 }}>Batch calendar</H>
          <T color={A.muted} style={{ marginBottom: 12, maxWidth: 760 }}>
            Session days and times are fixed in the LEP journey (e.g. Orientation Thu 7:00 PM, Day 1–2 Sat–Sun
            9:00 AM–7:00 PM). Set this batch’s <T weight="semibold">Day 1 / Orientation date</T> and Zoom links
            here only when they need to change for that cohort.
          </T>
          <CemHelpCard sectionKey="batches" />
        </>
      ) : (
        <Row style={{ justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
          <T weight="semibold" size={13}>Dates & Zoom</T>
          {canEdit ? <Btn label="New batch" kind="ghost" small onPress={() => loadBatch(null)} /> : null}
        </Row>
      )}
      {msg ? <Notice tone={msg.tone}>{msg.text}</Notice> : null}

      {!embed ? (
        <Row style={{ marginTop: 16, marginBottom: 12 }} gap={8}>
          <View style={{ minWidth: 220 }}>
            <Select
              value={draft.id || 'new'}
              onChange={(v) => loadBatch(v === 'new' ? null : batches.find((b) => b.id === v))}
              options={[
                { value: 'new', label: '+ New batch' },
                ...batches.map((b) => ({
                  value: b.id,
                  label: formatBatchPickerLabel(b),
                })),
              ]}
            />
          </View>
          {canEdit ? (
            <Btn label="New batch" kind="ghost" onPress={() => loadBatch(null)} />
          ) : null}
        </Row>
      ) : null}

      <Card style={{ marginBottom: 20 }}>
        <Field label="Batch name">
          <Input
            value={draft.name}
            onChangeText={(v) => setDraft((d) => ({ ...d, name: v }))}
            placeholder="e.g. LEP · Orientation Thu 29 Oct"
            editable={canEdit}
          />
        </Field>
        {draft.lmsGroupId ? (
          <Notice tone="ok">Linked to its learners — reminders and the dashboard can reach this batch.</Notice>
        ) : (
          <Notice tone="error">
            Not linked to its learners yet, so reminders cannot reach them.
            {canEdit ? ' Press “Link automatically”, then Save.' : ''}
          </Notice>
        )}
        {canEdit && !draft.lmsGroupId && (draft.zohoBatchKey || draft.name) ? (
          <Btn label="Link automatically" small onPress={linkAutomatically} style={{ marginBottom: 12, alignSelf: 'flex-start' }} />
        ) : null}
        <Pressable onPress={() => setShowIds((v) => !v)} style={{ marginBottom: 12 }}>
          <T size={12} color={A.muted}>{showIds ? '▼' : '▶'} Advanced: system links (only if support asks)</T>
        </Pressable>
        {showIds ? (
        <>
        <Row gap={12}>
          <View style={{ flex: 1 }}>
            <Field label="Zoho Batch key (optional)">
              <Input
                value={draft.zohoBatchKey}
                onChangeText={(v) => setDraft((d) => ({ ...d, zohoBatchKey: v }))}
                placeholder="Zoho LEP_Batch, e.g. 27/12/2025 - 28/12/2025"
                editable={canEdit}
                autoCapitalize="none"
              />
            </Field>
          </View>
          <View style={{ flex: 1 }}>
            <Field label="Web LMS group id (optional)">
              <Input
                value={draft.lmsGroupId}
                onChangeText={(v) => setDraft((d) => ({ ...d, lmsGroupId: v }))}
                placeholder="e.g. zoho_lep_01-08-2026-..."
                editable={canEdit}
                autoCapitalize="none"
              />
            </Field>
          </View>
        </Row>
        {canEdit && (draft.zohoBatchKey || draft.name) ? (
          <Btn
            label="Suggest LMS group id from Zoho key"
            kind="ghost"
            small
            onPress={() =>
              setDraft((d) => ({
                ...d,
                lmsGroupId:
                  suggestLmsGroupId({
                    program: d.program,
                    zohoBatchKey: d.zohoBatchKey || d.name,
                  }) || d.lmsGroupId,
              }))
            }
            style={{ marginBottom: 12 }}
          />
        ) : null}
        <Field label="Date the schedule starts from">
          <Select
            value={draft.anchor}
            onChange={(v) => setDraft((d) => syncAnchorDates({ ...d, anchor: v }))}
            options={[
              { value: 'orientation', label: 'Orientation Thursday (usual)' },
              { value: 'day1', label: 'Day 1 Saturday' },
            ]}
            disabled={!canEdit}
          />
        </Field>
        </>
        ) : null}
        <Row gap={12}>
          <View style={{ flex: 1 }}>
            <Field label={draft.anchor === 'orientation' ? 'Orientation Thursday' : 'Day 1 Saturday'}>
              {typeof document !== 'undefined' ? (
                <input
                  type="date"
                  value={draft.anchorDate}
                  onChange={(e) => setAnchorDate(e.target.value)}
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
                  onChangeText={setAnchorDate}
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
              label={draft.openForEnrollment !== false ? '✓ New learners can pick this batch' : 'New learners cannot pick this batch'}
              kind="ghost"
              small
              onPress={() =>
                setDraft((d) => ({ ...d, openForEnrollment: d.openForEnrollment === false }))
              }
            />
            <Btn
              label={draft.filling ? '✓ Shows “Filling fast”' : '“Filling fast” badge off'}
              kind="ghost"
              small
              onPress={() => setDraft((d) => ({ ...d, filling: !d.filling }))}
            />
          </Row>
        ) : null}
        {canEdit ? (
          <Row gap={8}>
            <Btn label="Save batch" onPress={save} loading={busy} />
            {draft.id && canDelete ? <Btn label="Delete" kind="ghost" onPress={remove} loading={busy} /> : null}
          </Row>
        ) : null}
      </Card>

      {(draft.sessions || []).length ? (
        <View>
          <T weight="semibold" size={13} style={{ marginBottom: 4 }}>
            Sessions ({draft.sessions.length})
          </T>
          <T size={12} color={A.muted} style={{ marginBottom: 10 }}>
            Dates come from the Orientation date. Add each Zoom link, then Save.
          </T>
          {draft.sessions.map((s) => (
            <Card key={s.code} style={{ marginBottom: 10, paddingVertical: 12 }}>
              <Row style={{ justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <View style={{ flex: 1 }}>
                  <T weight="semibold" size={14}>
                    {s.title}
                    {s.kind === 'optional' ? <T size={12} color={A.muted}> · optional</T> : null}
                  </T>
                  <T size={12} color={A.muted}>
                    {s.date
                      ? new Date(`${s.date}T12:00:00`).toLocaleDateString('en-IN', { weekday: 'short', day: 'numeric', month: 'short' })
                      : ''}{' '}
                    · {s.startTime}–{s.endTime} IST · <T size={11} color="#A3A7B1">{s.code}</T>
                  </T>
                </View>
              </Row>
              {canEdit ? (
                <Field label="Zoom link" style={{ marginTop: 10, marginBottom: 0 }}>
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
    </>
  );

  if (embed) {
    return <View style={{ padding: 16 }}>{body}</View>;
  }
  return (
    <ScrollView style={{ flex: 1 }} contentContainerStyle={{ padding: 28 }}>
      {body}
    </ScrollView>
  );
}

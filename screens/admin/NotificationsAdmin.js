import React, { useEffect, useMemo, useState } from 'react';
import { ScrollView, View } from 'react-native';
import Pressable from '../../components/il/Press';
import {
  ANCHORS,
  CHANNELS,
  CMS_CONFIG_DOCS,
  CONDITIONS,
  DEFAULT_NOTIFICATION_POLICY,
  LEP_DEFAULT_EVENTS,
  PRIORITIES,
  PROGRAMS,
  RECIPIENTS,
  SESSIONS,
  TEMPLATE_VARS,
  TRIGGERS,
  WEEKDAYS,
  describeAnchor,
} from '../../constants/cms';
import {
  deleteEvent,
  saveConfig,
  saveEvent,
  seedEvents,
  subscribeToConfig,
  subscribeToContent,
  subscribeToEvents,
} from '../../services/cms';
import { formatCallableError, sendParticipantNotificationTest } from '../../services/functions';
import { A, Btn, Card, Chip, Col, Field, H, Input, Notice, Row, Select, T, Toggle } from './adminUi';
import { CemHelpCard } from './AdminSectionGuide';

const BLANK = {
  code: '',
  name: '',
  program: 'LEP',
  recipients: ['participant'],
  anchor: { type: 'sessionStart', ref: '*', offsetMinutes: -60, dayOffset: 0, time: '', weekday: 'Sat', trigger: '' },
  condition: 'all',
  priority: 'optional',
  channels: { push: true, whatsapp: false, email: false },
  countsTowardCap: true,
  active: true,
  title: '',
  body: '',
  whatsappTemplate: '',
  contentIds: [],
  notes: '',
};

function isStaff(e) {
  return !(e.recipients || []).includes('participant');
}

export default function NotificationsAdmin({ canEdit }) {
  const [events, setEvents] = useState([]);
  const [content, setContent] = useState([]);
  const [policy, setPolicy] = useState(DEFAULT_NOTIFICATION_POLICY);
  const [selected, setSelected] = useState(null);
  const [tab, setTab] = useState('participant');
  const [search, setSearch] = useState('');
  const [msg, setMsg] = useState(null);
  const [busy, setBusy] = useState(false);

  useEffect(() => subscribeToEvents(setEvents, (e) => setMsg({ tone: 'error', text: e.message })), []);
  useEffect(() => subscribeToContent(setContent, () => {}), []);
  useEffect(
    () =>
      subscribeToConfig(CMS_CONFIG_DOCS.NOTIFICATION_POLICY, (d) =>
        setPolicy({ ...DEFAULT_NOTIFICATION_POLICY, ...(d || {}) })
      ),
    []
  );

  const shown = useMemo(() => {
    const s = search.trim().toLowerCase();
    return events
      .filter((e) => (tab === 'staff' ? isStaff(e) : !isStaff(e)))
      .filter((e) => !s || `${e.code} ${e.name} ${e.body}`.toLowerCase().includes(s));
  }, [events, tab, search]);

  const seed = async () => {
    setBusy(true);
    try {
      const n = await seedEvents(LEP_DEFAULT_EVENTS, events.map((e) => e.code));
      setMsg({ tone: 'ok', text: n ? `Added ${n} LEP events from the v1.2 journey.` : 'All LEP defaults are already here.' });
    } catch (e) {
      setMsg({ tone: 'error', text: e.message });
    } finally {
      setBusy(false);
    }
  };

  return (
    <View style={{ flex: 1, flexDirection: 'row' }}>
      <ScrollView style={{ flex: 1 }} contentContainerStyle={{ padding: 28 }}>
        <Row style={{ alignItems: 'center', justifyContent: 'space-between', marginBottom: 6 }}>
          <H>Program templates</H>
          {canEdit ? (
            <Row gap={8}>
              <Btn label="Load LEP defaults" kind="ghost" onPress={seed} loading={busy} />
              <Btn label="New message" onPress={() => setSelected({ ...BLANK })} />
            </Row>
          ) : null}
        </Row>
        <T color={A.muted} style={{ marginBottom: 12, maxWidth: 720 }}>
          Phone push (outside the app) and the in-app bell. Timing follows batch sessions and tasks — not one fixed
          calendar date for everyone.
        </T>
        <CemHelpCard sectionKey="notifications" />
        {msg ? <Notice tone={msg.tone}>{msg.text}</Notice> : null}

        {canEdit ? (
          <SendTestCard
            events={events.filter((e) => !isStaff(e))}
            onResult={(t, tone = 'ok') => setMsg({ tone, text: t })}
          />
        ) : null}

        <PolicyCard policy={policy} canEdit={canEdit} onSaved={(t) => setMsg({ tone: 'ok', text: t })} />

        <T weight="semibold" size={13} style={{ marginTop: 22, marginBottom: 10 }}>
          Message list
        </T>
        <Row style={{ alignItems: 'center', marginBottom: 12 }} gap={8}>
          {[
            ['participant', `Learners (${events.filter((e) => !isStaff(e)).length})`],
            ['staff', `CEM / PL alerts (${events.filter(isStaff).length})`],
          ].map(([key, label]) => (
            <Btn key={key} small label={label} kind={tab === key ? 'dark' : 'ghost'} onPress={() => setTab(key)} />
          ))}
          <View style={{ flex: 1, minWidth: 200, maxWidth: 320, marginLeft: 'auto' }}>
            <Input value={search} onChangeText={setSearch} placeholder="Search code, name or message" />
          </View>
        </Row>

        {shown.length === 0 ? (
          <Card>
            <T color={A.muted}>
              {events.length ? 'Nothing matches.' : 'No events yet. Click “Load LEP defaults” to start from the PDF.'}
            </T>
          </Card>
        ) : (
          <Card style={{ padding: 0 }}>
            {shown.map((e, i) => (
              <Pressable
                key={e.id}
                onPress={() => setSelected(e)}
                style={({ pressed }) => ({
                  flexDirection: 'row',
                  alignItems: 'center',
                  paddingHorizontal: 18,
                  paddingVertical: 12,
                  borderTopWidth: i ? 1 : 0,
                  borderTopColor: A.line,
                  backgroundColor: selected?.id === e.id ? '#FBF8F2' : pressed ? '#FAFAF8' : '#fff',
                  opacity: e.active === false ? 0.5 : 1,
                })}
              >
                <View style={{ width: 120 }}>
                  <T weight="bold" size={13}>
                    {e.code}
                  </T>
                </View>
                <View style={{ flex: 1 }}>
                  <T weight="semibold">{e.name}</T>
                  <T size={12} color={A.muted}>
                    {describeAnchor(e.anchor)}
                    {e.condition && e.condition !== 'all'
                      ? ` · ${CONDITIONS.find((c) => c.value === e.condition)?.label.toLowerCase()}`
                      : ''}
                  </T>
                </View>
                <Row gap={0} style={{ width: 260, justifyContent: 'flex-end' }}>
                  {e.priority === 'mandatory' ? <Chip label="Mandatory" tone="red" /> : null}
                  {e.priority === 'session' ? <Chip label="Session" tone="navy" /> : null}
                  {CHANNELS.filter((c) => e.channels?.[c.value]).map((c) => (
                    <Chip key={c.value} label={c.label} />
                  ))}
                  {e.active === false ? <Chip label="Off" /> : null}
                </Row>
              </Pressable>
            ))}
          </Card>
        )}
      </ScrollView>

      {selected ? (
        <EventEditor
          key={selected.id || 'new'}
          initial={selected}
          content={content}
          canEdit={canEdit}
          onClose={() => setSelected(null)}
          onSaved={(text) => {
            setMsg({ tone: 'ok', text });
            setSelected(null);
          }}
          onError={(text) => setMsg({ tone: 'error', text })}
        />
      ) : null}
    </View>
  );
}

function SendTestCard({ events, onResult }) {
  const [targetUid, setTargetUid] = useState('');
  const [eventCode, setEventCode] = useState('');
  const [sending, setSending] = useState(false);

  const eventOptions = [
    { value: '', label: 'Pick CMS event (optional)…' },
    ...events
      .filter((e) => e.code)
      .map((e) => ({ value: e.code, label: `${e.code} — ${e.name || e.title || 'Event'}` })),
  ];

  const send = async () => {
    const uid = targetUid.trim();
    if (!uid) {
      onResult('Enter the learner Firebase UID (users doc id).', 'error');
      return;
    }
    setSending(true);
    try {
      const res = await sendParticipantNotificationTest({
        targetUid: uid,
        eventCode: eventCode.trim() || undefined,
      });
      const pushNote = res?.push?.sent
        ? 'Push delivered.'
        : res?.push?.reason === 'no_fcm_token'
          ? 'In-app row created; no FCM token on that user (use a dev build on device).'
          : `In-app row created; push: ${res?.push?.reason || 'skipped'}.`;
      onResult(`Test sent (${res?.eventCode || 'TEST'}). ${pushNote}`);
    } catch (e) {
      onResult(formatCallableError(e, 'Send failed. Deploy sendParticipantNotificationTest first.'), 'error');
    } finally {
      setSending(false);
    }
  };

  return (
    <Card style={{ marginTop: 16 }}>
      <T weight="bold" style={{ marginBottom: 6 }}>
        Try before go-live
      </T>
      <T size={13} color={A.muted} style={{ marginBottom: 14, maxWidth: 720 }}>
        Sends one message to one learner — phone tray (real app/APK, not Expo Go) and the in-app bell. Use the Firebase
        user ID below (not Zoho Lead ID, not mobile number).
      </T>
      <Row>
        <Col min={280}>
          <Field
            label="Firebase user ID (UID)"
            hint="Firestore → users → open their row → copy Document ID (e.g. Kx7abc…). Same person may exist in Zoho separately."
          >
            <Input value={targetUid} onChangeText={setTargetUid} placeholder="Firebase users document ID" autoCapitalize="none" />
          </Field>
        </Col>
        <Col min={280}>
          <Field label="Which message?" hint="Pick from your list below.">
            <Select value={eventCode} onChange={setEventCode} options={eventOptions} />
          </Field>
        </Col>
      </Row>
      <Btn label="Send test now" kind="dark" onPress={send} loading={sending} style={{ alignSelf: 'flex-start' }} />
    </Card>
  );
}

function PolicyCard({ policy, canEdit, onSaved }) {
  const [draft, setDraft] = useState(policy);
  useEffect(() => setDraft(policy), [policy]);
  const dirty = JSON.stringify(draft) !== JSON.stringify(policy);
  const set = (k) => (v) => setDraft((d) => ({ ...d, [k]: v }));

  return (
    <Card>
      <T weight="bold" style={{ marginBottom: 4 }}>
        Sending rules (all messages)
      </T>
      <T size={12} color={A.muted} style={{ marginBottom: 12 }}>
        Quiet hours and daily limit — apply when automatic sending is turned on.
      </T>
      <Row>
        <Col min={140}>
          <Field label="Quiet from">
            <Input value={draft.quietStart} onChangeText={set('quietStart')} placeholder="21:30" editable={canEdit} />
          </Field>
        </Col>
        <Col min={140}>
          <Field label="Quiet until">
            <Input value={draft.quietEnd} onChangeText={set('quietEnd')} placeholder="07:00" editable={canEdit} />
          </Field>
        </Col>
        <Col min={140}>
          <Field label="Max per day" hint="Events marked “not counted” are exempt.">
            <Input
              value={draft.dailyCap}
              onChangeText={(v) => set('dailyCap')(Number(v.replace(/\D/g, '')) || 0)}
              editable={canEdit}
            />
          </Field>
        </Col>
        <Col min={180}>
          <Field label="Timezone">
            <Input value={draft.timezone} onChangeText={set('timezone')} editable={canEdit} />
          </Field>
        </Col>
      </Row>
      {canEdit && dirty ? (
        <Btn
          label="Save sending rules"
          kind="dark"
          style={{ alignSelf: 'flex-start' }}
          onPress={async () => {
            await saveConfig('notificationPolicy', draft);
            onSaved('Sending rules saved.');
          }}
        />
      ) : null}
    </Card>
  );
}

function EventEditor({ initial, content, canEdit, onClose, onSaved, onError }) {
  const [e, setE] = useState(() => ({
    ...initial,
    anchor: { ...initial.anchor },
    channels: { ...initial.channels },
    recipients: [...(initial.recipients || [])],
    contentIds: [...(initial.contentIds || [])],
  }));
  const [saving, setSaving] = useState(false);
  const set = (k) => (v) => setE((x) => ({ ...x, [k]: v }));
  const setAnchor = (k) => (v) => setE((x) => ({ ...x, anchor: { ...x.anchor, [k]: v } }));
  const anchorDef = ANCHORS.find((a) => a.value === e.anchor.type) || ANCHORS[0];
  const ro = !canEdit;

  const toggleIn = (key, value) =>
    setE((x) => {
      const list = new Set(x[key]);
      list.has(value) ? list.delete(value) : list.add(value);
      return { ...x, [key]: [...list] };
    });

  const save = async () => {
    if (!e.code.trim() || !e.name.trim()) {
      onError('Code and name are required.');
      return;
    }
    if (!e.recipients.length) {
      onError('Pick at least one recipient.');
      return;
    }
    setSaving(true);
    try {
      await saveEvent({ ...e, code: e.code.trim() });
      onSaved(`Saved ${e.code}.`);
    } catch (err) {
      onError(err.message);
    } finally {
      setSaving(false);
    }
  };

  const remove = async () => {
    // eslint-disable-next-line no-alert
    if (!window.confirm(`Delete ${e.code}? This cannot be undone.`)) return;
    try {
      await deleteEvent(e.id);
      onSaved(`Deleted ${e.code}.`);
    } catch (err) {
      onError(err.message);
    }
  };

  const linked = content.filter((c) => e.contentIds.includes(c.id));
  const linkable = content.filter((c) => !e.contentIds.includes(c.id));

  return (
    <View style={{ width: 460, borderLeftWidth: 1, borderLeftColor: A.line, backgroundColor: '#fff' }}>
      <Row style={{ alignItems: 'center', justifyContent: 'space-between', padding: 18, borderBottomWidth: 1, borderBottomColor: A.line }}>
        <T weight="bold" size={16}>
          {initial.id ? `Edit ${initial.code}` : 'New event'}
        </T>
        <Btn small kind="ghost" label="Close" onPress={onClose} />
      </Row>
      <ScrollView contentContainerStyle={{ padding: 18 }}>
        <Row>
          <Col min={110} flex={0.6}>
            <Field label="Code">
              <Input value={e.code} onChangeText={set('code')} placeholder="R-1h" editable={!ro} />
            </Field>
          </Col>
          <Col min={160}>
            <Field label="Name">
              <Input value={e.name} onChangeText={set('name')} placeholder="Session in 1 hour" editable={!ro} />
            </Field>
          </Col>
        </Row>

        <Row>
          <Col min={120}>
            <Field label="Program">
              <Select
                value={e.program}
                onChange={set('program')}
                disabled={ro}
                options={[{ value: 'ALL', label: 'All programs' }, ...PROGRAMS.map((p) => ({ value: p, label: p }))]}
              />
            </Field>
          </Col>
          <Col min={150}>
            <Field label="Priority">
              <Select value={e.priority} onChange={set('priority')} options={PRIORITIES} disabled={ro} />
            </Field>
          </Col>
        </Row>

        <Field label="Send to">
          <Row gap={0}>
            {RECIPIENTS.map((r) => (
              <Toggle
                key={r.value}
                label={r.label}
                value={e.recipients.includes(r.value)}
                onChange={() => toggleIn('recipients', r.value)}
                disabled={ro}
              />
            ))}
          </Row>
        </Field>

        <Card style={{ backgroundColor: '#FBF8F2', marginBottom: 14 }}>
          <T weight="bold" style={{ marginBottom: 10 }}>
            When
          </T>
          <Field label="Relative to">
            <Select value={e.anchor.type} onChange={setAnchor('type')} options={ANCHORS} disabled={ro} />
          </Field>
          {anchorDef.needsRef === 'session' ? (
            <Field label="Session">
              <Select value={e.anchor.ref || '*'} onChange={setAnchor('ref')} options={SESSIONS} disabled={ro} />
            </Field>
          ) : null}
          {anchorDef.needsRef === 'task' ? (
            <Field label="Task" hint="Task ID like T12, or * for every task.">
              <Input value={e.anchor.ref} onChangeText={setAnchor('ref')} placeholder="*" editable={!ro} />
            </Field>
          ) : null}
          {anchorDef.usesOffset ? (
            <Field label="Offset (minutes)" hint="Negative = before. −1440 is one day before, −60 one hour.">
              <Input
                value={e.anchor.offsetMinutes}
                onChangeText={(v) => setAnchor('offsetMinutes')(Number(v.replace(/[^\d-]/g, '')) || 0)}
                editable={!ro}
              />
            </Field>
          ) : null}
          <Row>
            {anchorDef.usesDayOffset ? (
              <Col min={120}>
                <Field label="Day offset">
                  <Input
                    value={e.anchor.dayOffset}
                    onChangeText={(v) => setAnchor('dayOffset')(Number(v.replace(/[^\d-]/g, '')) || 0)}
                    editable={!ro}
                  />
                </Field>
              </Col>
            ) : null}
            {anchorDef.usesWeekday ? (
              <Col min={120}>
                <Field label="Weekday">
                  <Select
                    value={e.anchor.weekday}
                    onChange={setAnchor('weekday')}
                    options={WEEKDAYS.map((d) => ({ value: d, label: d }))}
                    disabled={ro}
                  />
                </Field>
              </Col>
            ) : null}
            {anchorDef.usesTime ? (
              <Col min={120}>
                <Field label="Time (IST)">
                  <Input value={e.anchor.time} onChangeText={setAnchor('time')} placeholder="10:00" editable={!ro} />
                </Field>
              </Col>
            ) : null}
          </Row>
          {anchorDef.usesTrigger ? (
            <Field label="Trigger">
              <Select
                value={e.anchor.trigger}
                onChange={setAnchor('trigger')}
                options={[{ value: '', label: 'Choose…' }, ...TRIGGERS]}
                disabled={ro}
              />
            </Field>
          ) : null}
          <T size={13} color={A.navy} weight="semibold">
            {describeAnchor(e.anchor)}
          </T>
        </Card>

        <Field label="Only send if">
          <Select value={e.condition} onChange={set('condition')} options={CONDITIONS} disabled={ro} />
        </Field>

        <Field label="Channels">
          <Row gap={0}>
            {CHANNELS.map((c) => (
              <Toggle
                key={c.value}
                label={c.label}
                value={!!e.channels[c.value]}
                onChange={(v) => setE((x) => ({ ...x, channels: { ...x.channels, [c.value]: v } }))}
                disabled={ro}
              />
            ))}
          </Row>
        </Field>

        <Field label="Title">
          <Input value={e.title} onChangeText={set('title')} editable={!ro} />
        </Field>
        <Field label="Message">
          <Input value={e.body} onChangeText={set('body')} multiline rows={4} editable={!ro} />
        </Field>
        <Row gap={0} style={{ marginTop: -6, marginBottom: 14 }}>
          {TEMPLATE_VARS.map((v) => (
            <Chip key={v} label={`{{${v}}}`} onPress={ro ? undefined : () => set('body')(`${e.body}{{${v}}}`)} />
          ))}
        </Row>
        {e.channels.whatsapp ? (
          <Field
            label="WhatsApp template name"
            hint="Must match a template approved in WhatsApp Manager. Variables are filled in the order they appear in the message."
          >
            <Input value={e.whatsappTemplate} onChangeText={set('whatsappTemplate')} placeholder="session_reminder" editable={!ro} />
          </Field>
        ) : null}

        <Field label="Attached content" hint="Sent as links with the message (recording, slides, worksheet).">
          <Row gap={0}>
            {linked.map((c) => (
              <Chip key={c.id} label={`${c.title} ✕`} tone="navy" onPress={ro ? undefined : () => toggleIn('contentIds', c.id)} />
            ))}
            {!linked.length ? (
              <T size={13} color={A.muted}>
                None
              </T>
            ) : null}
          </Row>
          {!ro && linkable.length ? (
            <View style={{ marginTop: 8 }}>
              <Select
                value=""
                onChange={(id) => id && toggleIn('contentIds', id)}
                options={[
                  { value: '', label: 'Attach from content library…' },
                  ...linkable.map((c) => ({ value: c.id, label: `${c.title} (${c.type})` })),
                ]}
              />
            </View>
          ) : null}
        </Field>

        <Row gap={0}>
          <Toggle label="Active" value={e.active !== false} onChange={set('active')} disabled={ro} />
          <Toggle
            label="Counts toward daily cap"
            value={e.countsTowardCap !== false}
            onChange={set('countsTowardCap')}
            disabled={ro}
          />
        </Row>
        <Field label="Notes" style={{ marginTop: 8 }}>
          <Input value={e.notes} onChangeText={set('notes')} multiline rows={2} editable={!ro} />
        </Field>

        {canEdit ? (
          <Row style={{ marginTop: 6 }} gap={8}>
            <Btn label="Save" onPress={save} loading={saving} />
            {initial.id ? <Btn label="Delete" kind="danger" onPress={remove} /> : null}
          </Row>
        ) : (
          <Notice>View only — PL or Admin can edit events.</Notice>
        )}
      </ScrollView>
    </View>
  );
}

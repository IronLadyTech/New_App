import React, { useEffect, useState } from 'react';
import { Platform, ScrollView, View } from 'react-native';
import { GUEST_KINDS, GUEST_SLIDE_TARGETS } from '../../constants/cms';
import { ARMY_EVENTS_SHEET_EDIT_URL } from '../../constants/armyEventCalendar';
import { uploadCmsFile } from '../../services/cms';
import {
  guestDefaults,
  removeGuestItem,
  saveGuestItem,
  seedGuestItems,
  subscribeToGuestItems,
  swapGuestOrder,
} from '../../services/guestContent';
import { A, Btn, Card, Field, H, Input, Notice, Row, Select, T } from './adminUi';
import { AddBox, Pill, Segmented } from './batchHub/cmsBits';
import AppPreview from './AppPreview';

const TABS = [
  { value: GUEST_KINDS.MC_RECORDING, label: 'Masterclass recordings' },
  { value: GUEST_KINDS.HOME_SLIDE, label: 'Home slides' },
  { value: 'events', label: 'Events' },
];

const EMPTY = {
  [GUEST_KINDS.MC_RECORDING]: { title: '', url: '', body: '' },
  [GUEST_KINDS.HOME_SLIDE]: { kicker: '', program: '', title: '', body: '', chips: '', cta: '', target: 'mc', url: '', imageUrl: '' },
};

function pickFile(accept, onFile) {
  if (typeof document === 'undefined') return;
  const input = document.createElement('input');
  input.type = 'file';
  input.accept = accept;
  input.onchange = () => input.files?.[0] && onFile(input.files[0]);
  input.click();
}

/**
 * Guest app content CX can change without a new app release: Masterclass recordings
 * and the home slides (cms_guest), plus a pointer to the events sheet. The phone on the
 * right is the real guest app and reloads after every save.
 */
export default function GuestContentAdmin({ canEdit }) {
  const [tab, setTab] = useState(GUEST_KINDS.MC_RECORDING);
  const [rows, setRows] = useState([]);
  const [draft, setDraft] = useState(EMPTY[GUEST_KINDS.MC_RECORDING]);
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState(null);
  const [savedAt, setSavedAt] = useState(0);

  const kind = tab === 'events' ? null : tab;
  useEffect(() => {
    setMsg(null);
    if (!kind) return undefined;
    setDraft(EMPTY[kind]);
    return subscribeToGuestItems(kind, setRows, (e) => setMsg({ tone: 'error', text: e?.message || 'Could not load.' }));
  }, [kind]);

  const set = (patch) => setDraft((d) => ({ ...d, ...patch }));
  const saved = (text) => {
    setMsg({ tone: 'ok', text });
    setSavedAt(Date.now());
  };
  const run = async (fn, okText) => {
    setBusy(true);
    setMsg(null);
    try {
      await fn();
      saved(okText);
    } catch (e) {
      setMsg({ tone: 'error', text: e?.message || 'Not saved. Try again.' });
    } finally {
      setBusy(false);
    }
  };

  const save = () => {
    if (!draft.title.trim()) return setMsg({ tone: 'error', text: 'Give it a title first.' });
    if (kind === GUEST_KINDS.MC_RECORDING && !draft.url.trim()) {
      return setMsg({ tone: 'error', text: 'Paste the recording link (YouTube, Zoom or Drive).' });
    }
    if (kind === GUEST_KINDS.HOME_SLIDE && draft.target === 'link' && !draft.url.trim()) {
      return setMsg({ tone: 'error', text: 'Paste the link the button should open.' });
    }
    const chips =
      kind === GUEST_KINDS.HOME_SLIDE
        ? String(draft.chips || '').split(',').map((c) => c.trim()).filter(Boolean)
        : undefined;
    const order = draft.id ? draft.order : rows.length ? Math.max(...rows.map((r) => r.order ?? 0)) + 1 : 0;
    return run(async () => {
      await saveGuestItem({
        ...draft,
        kind,
        order,
        title: draft.title.trim(),
        url: String(draft.url || '').trim(),
        ...(chips ? { chips } : {}),
      });
      setDraft(EMPTY[kind]);
    }, draft.id ? 'Saved — the phone shows it now.' : 'Added — guests see it now.');
  };

  const edit = (r) =>
    setDraft({ ...EMPTY[kind], ...r, chips: Array.isArray(r.chips) ? r.chips.join(', ') : r.chips || '' });

  const move = (i, dir) => {
    const other = rows[i + dir];
    if (other) run(() => swapGuestOrder(rows[i], other), 'Order saved.');
  };

  const builtIn = kind ? guestDefaults(kind) : [];

  return (
    <ScrollView contentContainerStyle={{ padding: 24 }}>
      <H>Guest app</H>
      <T size={13} color={A.muted} style={{ marginTop: 4, marginBottom: 14, maxWidth: 640 }}>
        What women see before they join a program. Changes show in the app straight away — no new app version needed.
      </T>
      <Segmented options={TABS} value={tab} onChange={setTab} />

      <Row gap={24} style={{ marginTop: 16, alignItems: 'flex-start' }}>
        <View style={{ flex: 1, minWidth: 360 }}>
          {msg ? <Notice tone={msg.tone}>{msg.text}</Notice> : null}

          {tab === 'events' ? (
            <Card style={{ padding: 16 }}>
              <T size={15} weight="bold">Events come from the Army event sheet</T>
              <T size={13} color={A.muted} style={{ marginTop: 6, lineHeight: 19 }}>
                Guests see the next online events and the in-person ones in the city they pick, on Engage → Events. It is
                the same sheet enrolled learners' events come from, so add or change an event there and both apps update
                within 15 minutes.
              </T>
              {Platform.OS === 'web' ? (
                <Btn
                  label="Open the event sheet ↗"
                  small
                  style={{ marginTop: 12, alignSelf: 'flex-start' }}
                  onPress={() => window.open(ARMY_EVENTS_SHEET_EDIT_URL, '_blank', 'noopener')}
                />
              ) : null}
            </Card>
          ) : (
            <>
              {!rows.length ? (
                <Notice tone="neutral">
                  {`The app is showing its ${builtIn.length} built-in ${tab === GUEST_KINDS.HOME_SLIDE ? 'slides' : 'recordings'}.`}
                  {canEdit ? ' Start from those to edit them, or add your own — once you add any, the app shows only yours.' : ''}
                </Notice>
              ) : null}
              {canEdit && !rows.length ? (
                <Btn
                  label="Start from what's in the app"
                  kind="ghost"
                  small
                  loading={busy}
                  style={{ alignSelf: 'flex-start', marginBottom: 12 }}
                  onPress={() => run(() => seedGuestItems(kind), 'Copied in — edit them below.')}
                />
              ) : null}

              {canEdit ? (
                <AddBox title={draft.id ? 'Edit' : tab === GUEST_KINDS.HOME_SLIDE ? 'New home slide' : 'New recording'}>
                  {kind === GUEST_KINDS.MC_RECORDING ? (
                    <>
                      <Field label="Title" hint="Shown on the button, e.g. “Day 1 recording”">
                        <Input value={draft.title} onChangeText={(v) => set({ title: v })} placeholder="Day 1 recording" />
                      </Field>
                      <Field label="Recording link" hint="YouTube, Zoom or Drive — it plays inside the app">
                        <Input value={draft.url} onChangeText={(v) => set({ url: v })} placeholder="https://youtu.be/…" autoCapitalize="none" />
                      </Field>
                      <Field label="Small line under it (optional)">
                        <Input value={draft.body} onChangeText={(v) => set({ body: v })} placeholder="Plays here in the app" />
                      </Field>
                    </>
                  ) : (
                    <>
                      <Row gap={12} style={{ flexWrap: 'wrap' }}>
                        <Field label="Small label on top" style={{ flex: 1, minWidth: 160 }}>
                          <Input value={draft.kicker} onChangeText={(v) => set({ kicker: v })} placeholder="Start here" />
                        </Field>
                        <Field label="Program name" style={{ flex: 1, minWidth: 160 }}>
                          <Input value={draft.program} onChangeText={(v) => set({ program: v })} placeholder="Masterclass (MC)" />
                        </Field>
                      </Row>
                      <Field label="Headline">
                        <Input value={draft.title} onChangeText={(v) => set({ title: v })} placeholder="Two evenings that change how you see your career." />
                      </Field>
                      <Field label="Text">
                        <Input value={draft.body} onChangeText={(v) => set({ body: v })} multiline rows={3} />
                      </Field>
                      <Field label="Tags" hint="Separate with commas, e.g. 2 evenings · live, 4 of 27 principles">
                        <Input value={draft.chips} onChangeText={(v) => set({ chips: v })} />
                      </Field>
                      <Row gap={12} style={{ flexWrap: 'wrap' }}>
                        <Field label="Button text" style={{ flex: 1, minWidth: 160 }}>
                          <Input value={draft.cta} onChangeText={(v) => set({ cta: v })} placeholder="Explore Masterclass" />
                        </Field>
                        <Field label="Button opens" style={{ flex: 1, minWidth: 200 }}>
                          <Select value={draft.target} onChange={(v) => set({ target: v })} options={GUEST_SLIDE_TARGETS} />
                        </Field>
                      </Row>
                      {draft.target === 'link' ? (
                        <Field label="Link">
                          <Input value={draft.url} onChangeText={(v) => set({ url: v })} placeholder="https://…" autoCapitalize="none" />
                        </Field>
                      ) : null}
                      <Row gap={8} style={{ alignItems: 'center', marginBottom: 10 }}>
                        <Btn
                          label={draft.imageUrl ? 'Change photo' : 'Upload a photo (optional)'}
                          kind="ghost"
                          small
                          loading={busy}
                          onPress={() =>
                            pickFile('image/*', (file) =>
                              run(async () => {
                                const { url } = await uploadCmsFile(file, 'GUEST');
                                set({ imageUrl: url });
                              }, `${file.name} uploaded — press Save to use it.`)
                            )
                          }
                        />
                        {draft.imageUrl ? <Btn label="Remove photo" kind="ghost" small onPress={() => set({ imageUrl: '' })} /> : null}
                      </Row>
                    </>
                  )}
                  <Row gap={8}>
                    <Btn label={draft.id ? 'Save changes' : 'Add'} onPress={save} loading={busy} />
                    {draft.id ? <Btn label="Cancel edit" kind="ghost" onPress={() => setDraft(EMPTY[kind])} /> : null}
                  </Row>
                </AddBox>
              ) : null}

              {rows.map((r, i) => (
                <Card key={r.id} style={{ marginBottom: 8, padding: 12, opacity: r.published === false ? 0.55 : 1 }}>
                  <Row gap={8} style={{ alignItems: 'center', flexWrap: 'wrap' }}>
                    <T size={12} color={A.muted}>{i + 1}.</T>
                    <View style={{ flex: 1, minWidth: 200 }}>
                      <T size={14} weight="semibold">{r.title}</T>
                      <T size={12} color={A.muted} numberOfLines={1}>
                        {kind === GUEST_KINDS.HOME_SLIDE
                          ? `${r.program || ''} · button: ${r.cta || '—'} → ${GUEST_SLIDE_TARGETS.find((t) => t.value === r.target)?.label || r.target}`
                          : r.url}
                      </T>
                    </View>
                    {r.published === false ? <Pill label="Hidden" tone="lock" /> : <Pill label="Live" tone="ok" />}
                    {canEdit ? (
                      <>
                        <Btn label="↑" kind="ghost" small disabled={i === 0} onPress={() => move(i, -1)} />
                        <Btn label="↓" kind="ghost" small disabled={i === rows.length - 1} onPress={() => move(i, 1)} />
                        <Btn label="Edit" kind="ghost" small onPress={() => edit(r)} />
                        <Btn
                          label={r.published === false ? 'Show' : 'Hide'}
                          kind="ghost"
                          small
                          onPress={() =>
                            run(
                              () => saveGuestItem({ id: r.id, published: r.published === false }),
                              r.published === false ? 'Showing it again.' : 'Hidden from guests.'
                            )
                          }
                        />
                        <Btn
                          label="Remove"
                          kind="ghost"
                          small
                          onPress={() => {
                            if (typeof window === 'undefined' || window.confirm(`Remove “${r.title}”?`)) {
                              run(() => removeGuestItem(r.id), 'Removed.');
                            }
                          }}
                        />
                      </>
                    ) : null}
                  </Row>
                </Card>
              ))}
            </>
          )}
        </View>

        <AppPreview
          guestTier={tab === GUEST_KINDS.MC_RECORDING ? 'mc' : 'explore'}
          focus={tab === 'events' ? { to: 'engage' } : null}
          version={`${tab}|${savedAt}`}
        />
      </Row>
    </ScrollView>
  );
}

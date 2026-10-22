import React, { useEffect, useMemo, useState } from 'react';
import { View } from 'react-native';
import Pressable from '../../../components/il/Press';
import { CMS } from '../../../constants/cms';
import { csuiteCatalog, podcastCatalog } from '../../../constants/learnMediaCatalog';
import {
  addContentEntry,
  removeCmsListItem,
  saveCmsListItem,
  subscribeToEngagePosts,
  uploadCmsFile,
} from '../../../services/cms';
import { A, Btn, Card, Field, Input, Notice, Row, T } from '../adminUi';
import { AddBox, AudiencePicker, DateInput, FieldLabel, Pill, Segmented, audienceLabel, audienceMatches, istLabel, toLocalInput } from './cmsBits';

const KINDS = [
  { value: 'event', label: 'Event', hint: 'Meetup, webinar, chapter event' },
  { value: 'announcement', label: 'Announcement', hint: 'News for the batch' },
  { value: 'video', label: 'Video', hint: 'Talk or story — plays in the app' },
  { value: 'highlight', label: 'Highlight', hint: 'A learner win, a photo' },
];

const EMPTY = { kind: 'event', title: '', body: '', when: '', place: '', link: '', videoUrl: '', imageUrl: '', scope: 'batch', audience: 'all' };

function pickFile(accept, onFile) {
  if (typeof document === 'undefined') return;
  const input = document.createElement('input');
  input.type = 'file';
  input.accept = accept;
  input.onchange = () => input.files?.[0] && onFile(input.files[0]);
  input.click();
}

/**
 * What learners see on Engage: events, announcements, videos and highlights,
 * for this batch or the whole program, for all learners or one kind.
 */
export default function BatchHubEngageTab({ batch, programId, learner = 'all', contentItems, canEdit }) {
  const [posts, setPosts] = useState([]);
  const [draft, setDraft] = useState(EMPTY);
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState(null);

  useEffect(() => subscribeToEngagePosts(programId, setPosts, () => setPosts([])), [programId]);

  const shown = useMemo(
    () =>
      posts.filter(
        (p) => (!p.batchId || p.batchId === batch?.id) && audienceMatches(p.audience, learner)
      ),
    [posts, batch?.id, learner]
  );

  const set = (patch) => setDraft((d) => ({ ...d, ...patch }));

  const upload = (accept, field) =>
    pickFile(accept, async (file) => {
      setBusy(true);
      setMsg(null);
      try {
        const { url } = await uploadCmsFile(file, programId);
        set({ [field]: url });
        setMsg({ tone: 'ok', text: `${file.name} uploaded.` });
      } catch (e) {
        setMsg({ tone: 'error', text: e?.message || 'Upload failed. Try again.' });
      } finally {
        setBusy(false);
      }
    });

  const post = async () => {
    if (!draft.title.trim()) {
      setMsg({ tone: 'error', text: 'Give it a title first.' });
      return;
    }
    if (draft.kind === 'video' && !draft.videoUrl.trim()) {
      setMsg({ tone: 'error', text: 'Paste a video link or upload a video.' });
      return;
    }
    if (draft.scope === 'batch' && !batch?.id) {
      setMsg({ tone: 'error', text: 'Pick a batch at the top, or choose “Whole program”.' });
      return;
    }
    setBusy(true);
    setMsg(null);
    try {
      await saveCmsListItem(CMS.ENGAGE, {
        id: draft.id,
        program: programId,
        batchId: draft.scope === 'batch' ? batch.id : null,
        kind: draft.kind,
        title: draft.title.trim(),
        body: draft.body.trim(),
        when: draft.when ? new Date(draft.when).toISOString() : '',
        place: draft.place.trim(),
        link: draft.link.trim(),
        videoUrl: draft.videoUrl.trim(),
        imageUrl: draft.imageUrl.trim(),
        audience: draft.audience,
        published: true,
      });
      setDraft({ ...EMPTY, kind: draft.kind });
      setMsg({ tone: 'ok', text: draft.id ? 'Updated — it shows on Engage now.' : 'Posted — it is on her Engage tab now.' });
    } catch (e) {
      setMsg({ tone: 'error', text: e?.message || 'Could not post it. Try again.' });
    } finally {
      setBusy(false);
    }
  };

  const edit = (p) =>
    setDraft({
      ...EMPTY,
      ...p,
      when: toLocalInput(p.when),
      scope: p.batchId ? 'batch' : 'program',
      audience: p.audience || 'all',
    });

  return (
    <View>
      {msg ? <Notice tone={msg.tone}>{msg.text}</Notice> : null}

      {canEdit ? (
        <>
          <Row gap={8} style={{ flexWrap: 'wrap', marginBottom: 12 }}>
            {KINDS.map((k) => (
              <Pressable key={k.value} onPress={() => set({ kind: k.value })} style={{ flex: 1, minWidth: 150 }}>
                <View
                  style={{
                    borderWidth: draft.kind === k.value ? 2 : 1,
                    borderColor: draft.kind === k.value ? A.red : A.line,
                    backgroundColor: '#fff',
                    borderRadius: 14,
                    padding: 12,
                  }}
                >
                  <T size={14} weight="bold">+ {k.label}</T>
                  <T size={12} color={A.muted}>{k.hint}</T>
                </View>
              </Pressable>
            ))}
          </Row>

          <AddBox title={`${draft.id ? 'Edit' : 'New'} ${KINDS.find((k) => k.value === draft.kind).label.toLowerCase()}`}>
            <Field label="Title">
              <Input value={draft.title} onChangeText={(v) => set({ title: v })} placeholder="What should she read first?" />
            </Field>
            {draft.kind === 'event' ? (
              <Row gap={12} style={{ flexWrap: 'wrap' }}>
                <View style={{ flex: 1, minWidth: 200 }}>
                  <FieldLabel>Date and time</FieldLabel>
                  <DateInput value={draft.when} onChange={(v) => set({ when: v })} withTime />
                </View>
                <View style={{ flex: 1, minWidth: 220 }}>
                  <Field label="Place or join link">
                    <Input value={draft.place || draft.link} onChangeText={(v) => (/^https?:/i.test(v) ? set({ link: v, place: '' }) : set({ place: v, link: '' }))} placeholder="Indiranagar, Bengaluru — or a Zoom link" autoCapitalize="none" />
                  </Field>
                </View>
              </Row>
            ) : null}
            {draft.kind === 'video' ? (
              <Field label="Video" hint="Plays inside the app. Learners are never sent to YouTube.">
                <Row gap={8}>
                  <View style={{ flex: 1 }}>
                    <Input value={draft.videoUrl} onChangeText={(v) => set({ videoUrl: v })} placeholder="Paste a YouTube link…" autoCapitalize="none" />
                  </View>
                  <Btn label="…or upload a video" kind="ghost" small loading={busy} onPress={() => upload('video/*', 'videoUrl')} />
                </Row>
              </Field>
            ) : null}
            {draft.kind === 'highlight' ? (
              <Field label="Photo (optional)">
                <Row gap={8} style={{ alignItems: 'center' }}>
                  <Btn label={draft.imageUrl ? 'Change photo' : 'Upload a photo'} kind="ghost" small loading={busy} onPress={() => upload('image/*', 'imageUrl')} />
                  {draft.imageUrl ? <T size={12} color={A.ok}>✓ Photo added</T> : null}
                </Row>
              </Field>
            ) : null}
            <Field label="Details">
              <Input value={draft.body} onChangeText={(v) => set({ body: v })} multiline rows={3} placeholder="A short note" />
            </Field>
            <Row gap={16} style={{ flexWrap: 'wrap' }}>
              <View>
                <FieldLabel>Show in</FieldLabel>
                <Segmented options={[{ value: 'batch', label: 'This batch' }, { value: 'program', label: 'Whole program' }]} value={draft.scope} onChange={(v) => set({ scope: v })} />
              </View>
              <View>
                <FieldLabel>Who sees it</FieldLabel>
                <AudiencePicker value={draft.audience} onChange={(v) => set({ audience: v })} />
              </View>
            </Row>
            <Row gap={8} style={{ marginTop: 14 }}>
              <Btn label={draft.id ? 'Save changes' : 'Post'} onPress={post} loading={busy} />
              {draft.id ? <Btn label="Cancel edit" kind="ghost" onPress={() => setDraft({ ...EMPTY, kind: draft.kind })} /> : null}
            </Row>
          </AddBox>
        </>
      ) : null}

      <FieldLabel>On Engage now</FieldLabel>
      {shown.length ? null : <T color={A.muted} style={{ marginBottom: 12 }}>Nothing posted for this batch yet.</T>}
      {shown.map((p) => (
        <Card key={p.id} style={{ marginBottom: 8, padding: 12, opacity: p.published === false ? 0.55 : 1 }}>
          <Row gap={10} style={{ alignItems: 'flex-start', flexWrap: 'wrap' }}>
            <Pill label={KINDS.find((k) => k.value === p.kind)?.label || 'Post'} tone="muted" />
            <View style={{ flex: 1, minWidth: 200 }}>
              <T size={14} weight="semibold">{p.title}</T>
              <T size={12} color={A.muted}>
                {[p.when ? istLabel(p.when) : '', p.place, p.videoUrl ? 'Video · plays in the app' : '', p.imageUrl ? 'With photo' : ''].filter(Boolean).join(' · ')}
              </T>
            </View>
            <Pill label={`${p.batchId ? 'This batch' : 'Whole program'} · ${audienceLabel(p.audience)}`} />
            {canEdit ? (
              <Row gap={6}>
                <Btn label="Edit" kind="ghost" small onPress={() => edit(p)} />
                <Btn
                  label={p.published === false ? 'Show' : 'Hide'}
                  kind="ghost"
                  small
                  onPress={() => saveCmsListItem(CMS.ENGAGE, { id: p.id, published: p.published === false })}
                />
                <Btn
                  label="Remove"
                  kind="danger"
                  small
                  onPress={() => {
                    if (typeof window === 'undefined' || window.confirm(`Remove “${p.title}” from Engage?`)) removeCmsListItem(CMS.ENGAGE, p.id);
                  }}
                />
              </Row>
            ) : null}
          </Row>
        </Card>
      ))}

      <VideoShelves contentItems={contentItems} canEdit={canEdit} />
    </View>
  );
}

/** Program-wide C-Suite and podcast shelves on Learn (existing CMS links). */
function VideoShelves({ contentItems, canEdit }) {
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [url, setUrl] = useState('');
  const [busy, setBusy] = useState(false);
  const shelves = [
    ['C-Suite videos', 'csuite', csuiteCatalog()],
    ['Podcasts', 'podcast', podcastCatalog()],
  ];
  const rowFor = (library, assetKey) =>
    (contentItems || []).find((c) => c.library === library && c.assetKey === assetKey && c.published !== false);

  const save = async (library, item) => {
    if (!url.trim()) return;
    setBusy(true);
    try {
      await addContentEntry({ title: item.title, type: 'link', program: 'LEP', library, assetKey: item.assetKey, batchId: null, url: url.trim(), linkedTaskIds: [], tags: [library] });
      setEditing(null);
      setUrl('');
    } finally {
      setBusy(false);
    }
  };

  return (
    <View style={{ marginTop: 18 }}>
      <Pressable onPress={() => setOpen((v) => !v)}>
        <T size={13} weight="semibold" color={A.navy}>{open ? '▼' : '▶'} Learn video shelves (C-Suite talks, podcasts) — whole program</T>
      </Pressable>
      {open
        ? shelves.map(([heading, library, items]) => (
            <View key={library} style={{ marginTop: 10 }}>
              <FieldLabel>{heading}</FieldLabel>
              {items.map((item) => {
                const row = rowFor(library, item.assetKey);
                const isEditing = editing === `${library}:${item.assetKey}`;
                return (
                  <Card key={item.assetKey} style={{ marginBottom: 6, padding: 10 }}>
                    <Row gap={8} style={{ alignItems: 'center' }}>
                      <View style={{ flex: 1 }}>
                        <T size={13} weight="semibold">{item.title}</T>
                        <T size={11} color={A.muted}>{row?.url ? 'Your video link is set' : 'Using the built-in video'}</T>
                      </View>
                      {canEdit ? <Btn label="Change video" kind="ghost" small onPress={() => { setEditing(`${library}:${item.assetKey}`); setUrl(row?.url || ''); }} /> : null}
                    </Row>
                    {isEditing ? (
                      <Row gap={8} style={{ marginTop: 8 }}>
                        <View style={{ flex: 1 }}>
                          <Input value={url} onChangeText={setUrl} placeholder="YouTube or video link" autoCapitalize="none" />
                        </View>
                        <Btn label="Save" small loading={busy} onPress={() => save(library, item)} />
                      </Row>
                    ) : null}
                  </Card>
                );
              })}
            </View>
          ))
        : null}
    </View>
  );
}

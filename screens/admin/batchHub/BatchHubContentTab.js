import React, { useMemo, useState } from 'react';
import { View } from 'react-native';
import Pressable from '../../../components/il/Press';
import { PROGRAMS } from '../../../constants/programs';
import { csuiteCatalog, podcastCatalog } from '../../../constants/learnMediaCatalog';
import { coursePhases, courseTasks } from '../../../constants/programCourseSlice';
import { addContentEntry, uploadContentFile } from '../../../services/cms';
import { A, Btn, Card, Field, Input, Notice, T } from '../adminUi';

function contentForTask(items, taskId, batchId) {
  return (items || []).filter((c) => {
    const tasks = c.linkedTaskIds || [];
    if (!tasks.some((t) => String(t).toLowerCase() === taskId.toLowerCase())) return false;
    if (c.batchId && batchId && c.batchId !== batchId) return false;
    if (c.batchId && !batchId) return false;
    return c.published !== false;
  });
}

function contentForMedia(items, library, assetKey) {
  return (items || []).find(
    (c) => c.library === library && c.assetKey === assetKey && c.published !== false
  );
}

export default function BatchHubContentTab({ batch, contentItems, canEdit, onRefresh }) {
  const [openPhase, setOpenPhase] = useState('pre-program');
  const [openMedia, setOpenMedia] = useState(null);
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState(null);

  const phases = useMemo(() => coursePhases(PROGRAMS.LEP), []);
  const podcasts = useMemo(() => podcastCatalog(), []);
  const csuites = useMemo(() => csuiteCatalog(), []);

  if (!batch?.id) {
    return <Notice tone="neutral">Pick a batch to attach session recordings and task files.</Notice>;
  }

  const quickLink = async (library, assetKey, title, url) => {
    if (!url?.trim()) return;
    setBusy(true);
    setMsg(null);
    try {
      await addContentEntry({
        title,
        type: 'link',
        program: 'LEP',
        library,
        assetKey,
        batchId: null,
        url: url.trim(),
        linkedTaskIds: [],
        tags: [library],
      });
      setMsg({ tone: 'ok', text: `Saved ${title}` });
      onRefresh?.();
      setOpenMedia(null);
    } catch (e) {
      setMsg({ tone: 'error', text: e.message });
    } finally {
      setBusy(false);
    }
  };

  return (
    <View>
      {msg ? <Notice tone={msg.tone}>{msg.text}</Notice> : null}

      <T weight="bold" size={14} style={{ marginBottom: 8 }}>Session links & recordings</T>
      <T size={12} color={A.muted} style={{ marginBottom: 10 }}>
        Zoom comes from Setup. Paste recording links per session (like CX batch recordings).
      </T>
      {(batch.sessions || []).map((s) => (
        <Card key={s.code} style={{ marginBottom: 8, padding: 12 }}>
          <T weight="semibold" size={13}>{s.code} · {s.title}</T>
          <T size={12} color={A.muted}>{s.date} · {s.startTime}–{s.endTime} IST</T>
          {s.joinLink ? (
            <T size={11} color={A.muted} style={{ marginTop: 4 }}>Zoom: {s.joinLink}</T>
          ) : (
            <T size={11} color={A.danger} style={{ marginTop: 4 }}>No Zoom link — add under Setup</T>
          )}
          <SessionRecordingRow
            batchId={batch.id}
            sessionCode={s.code}
            sessionTitle={s.title}
            contentItems={contentItems}
            canEdit={canEdit}
            onRefresh={onRefresh}
          />
        </Card>
      ))}

      <T weight="bold" size={14} style={{ marginTop: 22, marginBottom: 8 }}>Journey tasks (by phase)</T>
      {phases.map((phase) => {
        const tasks = courseTasks(PROGRAMS.LEP, phase.id);
        if (!tasks.length) return null;
        const open = openPhase === phase.id;
        return (
          <Card key={phase.id} style={{ marginBottom: 8, padding: 0, overflow: 'hidden' }}>
            <Pressable
              onPress={() => setOpenPhase(open ? '' : phase.id)}
              style={{ padding: 12, flexDirection: 'row', justifyContent: 'space-between' }}
            >
              <T weight="semibold" size={13}>{phase.title}</T>
              <T size={12} color={A.muted}>{tasks.length} tasks {open ? '▼' : '▶'}</T>
            </Pressable>
            {open ? (
              <View style={{ paddingHorizontal: 12, paddingBottom: 12 }}>
                {tasks.map((task) => {
                  const files = contentForTask(contentItems, task.id, batch.id);
                  const global = contentForTask(contentItems, task.id, null);
                  return (
                    <View key={task.id} style={{ borderTopWidth: 1, borderTopColor: A.line, paddingVertical: 10 }}>
                      <T size={13} weight="semibold">{task.title}</T>
                      <T size={11} color={A.muted}>{task.id} · {task.kind}</T>
                      {(files.length ? files : global).length ? (
                        (files.length ? files : global).map((f) => (
                          <T key={f.id} size={11} color={A.ok} style={{ marginTop: 4 }}>
                            ✓ {f.title} {f.batchId ? '(this batch)' : '(all batches)'}
                          </T>
                        ))
                      ) : (
                        <T size={11} color={A.muted} style={{ marginTop: 4 }}>No file yet</T>
                      )}
                      {canEdit ? (
                        <TaskUploadInline
                          taskId={task.id}
                          taskTitle={task.title}
                          batchId={batch.id}
                          onDone={onRefresh}
                        />
                      ) : null}
                    </View>
                  );
                })}
              </View>
            ) : null}
          </Card>
        );
      })}

      <T weight="bold" size={14} style={{ marginTop: 22, marginBottom: 8 }}>Podcast library (Learn)</T>
      <T size={12} color={A.muted} style={{ marginBottom: 8 }}>Program-wide. CMS URL overrides the bundled video in the app.</T>
      {podcasts.map((p) => {
        const row = contentForMedia(contentItems, 'podcast', p.assetKey);
        return (
          <MediaRow
            key={p.assetKey}
            meta={p}
            row={row}
            open={openMedia === p.assetKey}
            onToggle={() => setOpenMedia(openMedia === p.assetKey ? null : p.assetKey)}
            canEdit={canEdit}
            busy={busy}
            onSave={(url) => quickLink('podcast', p.assetKey, p.title, url)}
          />
        );
      })}

      <T weight="bold" size={14} style={{ marginTop: 22, marginBottom: 8 }}>C-Suite videos (Learn)</T>
      {csuites.map((p) => {
        const row = contentForMedia(contentItems, 'csuite', p.assetKey);
        return (
          <MediaRow
            key={p.assetKey}
            meta={p}
            row={row}
            open={openMedia === p.assetKey}
            onToggle={() => setOpenMedia(openMedia === p.assetKey ? null : p.assetKey)}
            canEdit={canEdit}
            busy={busy}
            onSave={(url) => quickLink('csuite', p.assetKey, p.title, url)}
          />
        );
      })}
    </View>
  );
}

function MediaRow({ meta, row, open, onToggle, canEdit, busy, onSave }) {
  const [url, setUrl] = useState(row?.url || '');
  return (
    <Card style={{ marginBottom: 6, padding: 10 }}>
      <Pressable onPress={onToggle}>
        <T size={13} weight="semibold">{meta.title}</T>
        <T size={11} color={A.muted}>{meta.assetKey} {row?.url ? '· CMS link set' : '· app default'}</T>
      </Pressable>
      {open && canEdit ? (
        <View style={{ marginTop: 8 }}>
          <Field label="YouTube or video URL">
            <Input value={url} onChangeText={setUrl} placeholder="https://..." autoCapitalize="none" />
          </Field>
          <Btn label="Save link" small loading={busy} onPress={() => onSave(url)} />
        </View>
      ) : null}
    </Card>
  );
}

function SessionRecordingRow({ batchId, sessionCode, sessionTitle, contentItems, canEdit, onRefresh }) {
  const [url, setUrl] = useState('');
  const [busy, setBusy] = useState(false);
  const existing = (contentItems || []).find(
    (c) => c.library === 'session' && c.sessionCode === sessionCode && c.batchId === batchId
  );
  return (
    <View style={{ marginTop: 8 }}>
      {existing ? (
        <T size={11} color={A.ok}>Recording: {existing.title || existing.url}</T>
      ) : null}
      {canEdit ? (
        <>
          <Input
            value={url}
            onChangeText={setUrl}
            placeholder="Recording URL"
            autoCapitalize="none"
            style={{ marginTop: 6 }}
          />
          <Btn
            label="Save recording link"
            small
            loading={busy}
            onPress={async () => {
              if (!url.trim()) return;
              setBusy(true);
              try {
                await addContentEntry({
                  title: `${sessionCode} recording`,
                  type: 'link',
                  program: 'LEP',
                  library: 'session',
                  sessionCode,
                  batchId,
                  url: url.trim(),
                  linkedTaskIds: [],
                  tags: ['recording', sessionCode],
                });
                setUrl('');
                onRefresh?.();
              } finally {
                setBusy(false);
              }
            }}
          />
        </>
      ) : null}
    </View>
  );
}

function TaskUploadInline({ taskId, taskTitle, batchId, onDone }) {
  const [busy, setBusy] = useState(false);
  const pick = () => {
    if (typeof document === 'undefined') return;
    const input = document.createElement('input');
    input.type = 'file';
    input.onchange = async () => {
      const file = input.files?.[0];
      if (!file) return;
      setBusy(true);
      try {
        await uploadContentFile(file, {
          title: file.name,
          program: 'LEP',
          type: 'file',
          library: 'task',
          batchId,
          linkedTaskIds: [taskId],
          tags: [taskId],
        });
        onDone?.();
      } catch (e) {
        alert(e.message);
      } finally {
        setBusy(false);
      }
    };
    input.click();
  };
  return (
    <Btn label={busy ? 'Uploading…' : 'Upload for this batch'} kind="ghost" small onPress={pick} disabled={busy} />
  );
}

import React, { useEffect, useMemo, useRef, useState } from 'react';
import { ScrollView, View } from 'react-native';
import { CONTENT_TYPES, PROGRAMS } from '../../constants/cms';
import {
  addContentEntry,
  deleteContent,
  subscribeToContent,
  updateContent,
  uploadContentFile,
} from '../../services/cms';
import { A, Btn, Card, Chip, Col, Field, H, Input, Notice, Row, Select, T, Toggle } from './adminUi';
import { CemHelpCard } from './AdminSectionGuide';

const MAX_MB = 500;

function fmtSize(bytes) {
  if (!bytes) return '';
  if (bytes > 1e9) return `${(bytes / 1e9).toFixed(1)} GB`;
  if (bytes > 1e6) return `${(bytes / 1e6).toFixed(1)} MB`;
  return `${Math.round(bytes / 1e3)} KB`;
}

function splitList(v) {
  return String(v || '')
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean);
}

/** T03-style codes stay uppercase; app slugs like lep-orientation-schedule stay lowercase. */
function normalizeLinkedTaskId(raw) {
  const s = String(raw || '').trim();
  if (!s) return '';
  if (/^T\d+$/i.test(s)) return s.toUpperCase();
  return s.toLowerCase();
}

export default function ContentAdmin({ canEdit }) {
  const [items, setItems] = useState([]);
  const [program, setProgram] = useState('ALL');
  const [type, setType] = useState('all');
  const [search, setSearch] = useState('');
  const [msg, setMsg] = useState(null);

  useEffect(() => subscribeToContent(setItems, (e) => setMsg({ tone: 'error', text: e.message })), []);

  const shown = useMemo(() => {
    const s = search.trim().toLowerCase();
    return items.filter(
      (c) =>
        (program === 'ALL' || c.program === program || c.program === 'ALL') &&
        (type === 'all' || c.type === type) &&
        (!s || `${c.title} ${(c.tags || []).join(' ')} ${(c.linkedTaskIds || []).join(' ')}`.toLowerCase().includes(s))
    );
  }, [items, program, type, search]);

  return (
    <ScrollView style={{ flex: 1 }} contentContainerStyle={{ padding: 28 }}>
      <H style={{ marginBottom: 6 }}>Batch materials</H>
      <T color={A.muted} style={{ marginBottom: 12, maxWidth: 720 }}>
        What learners tap inside My Program — schedule PDFs, recordings, slides, worksheets.
      </T>
      <CemHelpCard sectionKey="content" />
      {msg ? <Notice tone={msg.tone}>{msg.text}</Notice> : null}

      {canEdit ? (
        <>
          <T weight="semibold" size={13} style={{ marginTop: 8, marginBottom: 10 }}>
            Add new material
          </T>
          <UploadCard onDone={(text, tone = 'ok') => setMsg({ tone, text })} />
        </>
      ) : null}

      <T weight="semibold" size={13} style={{ marginTop: 22, marginBottom: 10 }}>
        Library ({shown.length})
      </T>
      <Row style={{ alignItems: 'center', marginBottom: 12 }} gap={8}>
        <View style={{ width: 160 }}>
          <Select
            value={program}
            onChange={setProgram}
            options={[{ value: 'ALL', label: 'All programs' }, ...PROGRAMS.map((p) => ({ value: p, label: p }))]}
          />
        </View>
        <View style={{ width: 160 }}>
          <Select value={type} onChange={setType} options={[{ value: 'all', label: 'All types' }, ...CONTENT_TYPES]} />
        </View>
        <View style={{ flex: 1, minWidth: 200, maxWidth: 320 }}>
          <Input value={search} onChangeText={setSearch} placeholder="Search title, tag or task ID" />
        </View>
      </Row>

      {shown.length === 0 ? (
        <Card>
          <T color={A.muted}>{items.length ? 'Nothing matches.' : 'No content yet. Upload your first file above.'}</T>
        </Card>
      ) : (
        <Card style={{ padding: 0 }}>
          {shown.map((c, i) => (
            <ContentRow key={c.id} item={c} first={i === 0} canEdit={canEdit} onMsg={setMsg} />
          ))}
        </Card>
      )}
    </ScrollView>
  );
}

function UploadCard({ onDone }) {
  const inputRef = useRef(null);
  const [mode, setMode] = useState('file');
  const [file, setFile] = useState(null);
  const [meta, setMeta] = useState({ title: '', program: 'LEP', type: 'link', tags: '', tasks: '', url: '', body: '', description: '' });
  const [progress, setProgress] = useState(null);
  const set = (k) => (v) => setMeta((m) => ({ ...m, [k]: v }));

  const reset = () => {
    setFile(null);
    setProgress(null);
    setMeta((m) => ({ ...m, title: '', tags: '', tasks: '', url: '', body: '', description: '' }));
    if (inputRef.current) inputRef.current.value = '';
  };

  const submit = async () => {
    const common = {
      title: meta.title.trim(),
      program: meta.program,
      tags: splitList(meta.tags),
      linkedTaskIds: splitList(meta.tasks).map(normalizeLinkedTaskId),
      description: meta.description.trim(),
    };
    try {
      if (mode === 'file') {
        if (!file) return onDone('Choose a file first.', 'error');
        if (file.size > MAX_MB * 1e6) return onDone(`Files over ${MAX_MB} MB are not allowed.`, 'error');
        setProgress(0);
        await uploadContentFile(file, common, setProgress);
        onDone(`Uploaded ${common.title || file.name}.`);
      } else {
        if (!common.title) return onDone('Give it a title.', 'error');
        if (meta.type === 'link' && !/^https?:\/\//.test(meta.url.trim())) {
          return onDone('Links must start with http:// or https://', 'error');
        }
        await addContentEntry({ ...common, type: meta.type, url: meta.url.trim(), body: meta.body });
        onDone(`Added ${common.title}.`);
      }
      reset();
    } catch (e) {
      setProgress(null);
      onDone(e.message, 'error');
    }
  };

  return (
    <Card>
      <Row style={{ marginBottom: 14 }} gap={8}>
        <Btn small label="Upload file" kind={mode === 'file' ? 'dark' : 'ghost'} onPress={() => setMode('file')} />
        <Btn small label="Add link or text" kind={mode === 'entry' ? 'dark' : 'ghost'} onPress={() => setMode('entry')} />
      </Row>

      {mode === 'file' ? (
        <Field label="File" hint={`Video, PDF, image or audio. Up to ${MAX_MB} MB.`}>
          {React.createElement('input', {
            ref: inputRef,
            type: 'file',
            accept: 'video/*,audio/*,image/*,application/pdf',
            onChange: (ev) => {
              const f = ev.target.files?.[0] || null;
              setFile(f);
              if (f && !meta.title) set('title')(f.name.replace(/\.[^.]+$/, ''));
            },
            style: { fontSize: 14 },
          })}
        </Field>
      ) : (
        <Row>
          <Col min={140} flex={0.5}>
            <Field label="Type">
              <Select
                value={meta.type}
                onChange={set('type')}
                options={CONTENT_TYPES.filter((t) => t.value === 'link' || t.value === 'text')}
              />
            </Field>
          </Col>
          <Col min={240}>
            {meta.type === 'link' ? (
              <Field label="URL" hint="YouTube/Vimeo/Zoom recording, Google Drive, form…">
                <Input value={meta.url} onChangeText={set('url')} placeholder="https://" />
              </Field>
            ) : (
              <Field label="Text">
                <Input value={meta.body} onChangeText={set('body')} multiline rows={4} />
              </Field>
            )}
          </Col>
        </Row>
      )}

      <Row>
        <Col min={220}>
          <Field label="Title">
            <Input value={meta.title} onChangeText={set('title')} placeholder="Day 1 recording" />
          </Field>
        </Col>
        <Col min={120} flex={0.5}>
          <Field label="Program">
            <Select
              value={meta.program}
              onChange={set('program')}
              options={[{ value: 'ALL', label: 'All' }, ...PROGRAMS.map((p) => ({ value: p, label: p }))]}
            />
          </Field>
        </Col>
      </Row>
      <Row>
        <Col min={180}>
          <Field label="Task IDs" hint="Comma-separated: T12 or lep-orientation-schedule (app task id)">
            <Input value={meta.tasks} onChangeText={set('tasks')} />
          </Field>
        </Col>
        <Col min={180}>
          <Field label="Tags" hint="Comma-separated, e.g. recording, week1">
            <Input value={meta.tags} onChangeText={set('tags')} />
          </Field>
        </Col>
      </Row>
      <Field label="Description (optional)">
        <Input value={meta.description} onChangeText={set('description')} />
      </Field>

      <Row style={{ alignItems: 'center' }}>
        <Btn label={mode === 'file' ? 'Upload' : 'Add'} onPress={submit} loading={progress != null} />
        {progress != null ? (
          <View style={{ flex: 1, maxWidth: 300, height: 8, borderRadius: 4, backgroundColor: A.chip, overflow: 'hidden' }}>
            <View style={{ width: `${Math.round(progress * 100)}%`, height: '100%', backgroundColor: A.ok }} />
          </View>
        ) : null}
        {progress != null ? <T size={13}>{Math.round(progress * 100)}%</T> : null}
      </Row>
    </Card>
  );
}

function ContentRow({ item, first, canEdit, onMsg }) {
  const [editing, setEditing] = useState(false);
  const [title, setTitle] = useState(item.title);
  const [tasks, setTasks] = useState((item.linkedTaskIds || []).join(', '));

  const save = async () => {
    await updateContent(item.id, {
      title: title.trim() || item.title,
      linkedTaskIds: splitList(tasks).map(normalizeLinkedTaskId),
    });
    setEditing(false);
    onMsg({ tone: 'ok', text: 'Saved.' });
  };

  const remove = async () => {
    // eslint-disable-next-line no-alert
    if (!window.confirm(`Delete “${item.title}”? The file is removed from storage too.`)) return;
    try {
      await deleteContent(item);
      onMsg({ tone: 'ok', text: `Deleted ${item.title}.` });
    } catch (e) {
      onMsg({ tone: 'error', text: e.message });
    }
  };

  return (
    <View style={{ paddingHorizontal: 18, paddingVertical: 12, borderTopWidth: first ? 0 : 1, borderTopColor: A.line }}>
      <Row style={{ alignItems: 'center' }}>
        <View style={{ width: 70 }}>
          <Chip label={item.type} tone="navy" />
        </View>
        <View style={{ flex: 1, minWidth: 200 }}>
          {editing ? (
            <Input value={title} onChangeText={setTitle} />
          ) : (
            <T weight="semibold">{item.title}</T>
          )}
          <T size={12} color={A.muted}>
            {[item.program, fmtSize(item.size), item.updatedBy].filter(Boolean).join(' · ')}
          </T>
        </View>
        <View style={{ width: 220 }}>
          {editing ? (
            <Input value={tasks} onChangeText={setTasks} placeholder="lep-orientation-schedule" />
          ) : (
            <Row gap={0}>
              {(item.linkedTaskIds || []).map((t) => (
                <Chip key={t} label={t} />
              ))}
              {(item.tags || []).map((t) => (
                <Chip key={t} label={`#${t}`} />
              ))}
            </Row>
          )}
        </View>
        <Row gap={6}>
          <Toggle
            label="Live"
            value={item.published !== false}
            onChange={(v) => canEdit && updateContent(item.id, { published: v })}
            disabled={!canEdit}
          />
          {item.url ? <Btn small kind="ghost" label="Open" onPress={() => window.open(item.url, '_blank', 'noopener')} /> : null}
          {canEdit && !editing ? <Btn small kind="ghost" label="Edit" onPress={() => setEditing(true)} /> : null}
          {canEdit && editing ? <Btn small kind="dark" label="Save" onPress={save} /> : null}
          {canEdit ? <Btn small kind="danger" label="Delete" onPress={remove} /> : null}
        </Row>
      </Row>
    </View>
  );
}

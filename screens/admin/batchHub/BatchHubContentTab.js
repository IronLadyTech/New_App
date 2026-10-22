import React, { useMemo, useState } from 'react';
import { View } from 'react-native';
import Pressable from '../../../components/il/Press';
import { PROGRAMS } from '../../../constants/programs';
import { coursePhases, courseTasks } from '../../../constants/programCourseSlice';
import { addContentEntry, uploadContentFile } from '../../../services/cms';
import { A, Btn, Card, Input, Notice, Row, T } from '../adminUi';

/** Live sessions a part-paid (registered) LEP learner can attend. */
const REGISTERED_SESSION_CODES = new Set(['S0', 'S1', 'S2']);

const CMS_PROGRAM = { [PROGRAMS.LEP]: 'LEP', [PROGRAMS.BM100]: '100BM', [PROGRAMS.MBW]: 'MBW' };

function contentForTask(items, taskId, batchId) {
  return (items || []).filter((c) => {
    const tasks = c.linkedTaskIds || [];
    if (!tasks.some((t) => String(t).toLowerCase() === taskId.toLowerCase())) return false;
    if (c.batchId && batchId && c.batchId !== batchId) return false;
    if (c.batchId && !batchId) return false;
    return c.published !== false;
  });
}

function recordingFor(items, batchId, sessionCode) {
  return (items || []).find(
    (c) => c.library === 'session' && c.sessionCode === sessionCode && c.batchId === batchId
  );
}

/** A recording is due once the session has ended (endAt is an IST ISO time). */
function sessionHeld(s) {
  const end = s?.endAt ? new Date(s.endAt) : null;
  return Boolean(end && !Number.isNaN(end.getTime()) && end < new Date());
}

function dayParts(iso) {
  const d = iso ? new Date(`${String(iso).slice(0, 10)}T12:00:00`) : null;
  if (!d || Number.isNaN(d.getTime())) return { wd: '', day: '', mon: '' };
  return {
    wd: d.toLocaleDateString('en-IN', { weekday: 'short' }),
    day: String(d.getDate()),
    mon: d.toLocaleDateString('en-IN', { month: 'short' }),
  };
}

function StatusChip({ tone, label }) {
  const colors = {
    ok: ['#E3F4EA', A.ok],
    miss: ['#FDECEC', A.red],
    wait: ['#F1F0EA', A.muted],
    lock: ['#EEF0F3', '#8A8F98'],
  }[tone];
  return (
    <View style={{ backgroundColor: colors[0], borderRadius: 999, paddingHorizontal: 9, paddingVertical: 3, marginRight: 6, marginTop: 6 }}>
      <T size={11} weight="semibold" color={colors[1]}>{label}</T>
    </View>
  );
}

/**
 * Sessions & content for one batch, seen as one kind of learner.
 * `learner` is 'register' | 'paid' | 'late' — part-paid hides what she cannot open yet.
 */
export default function BatchHubContentTab({ batch, programId = PROGRAMS.LEP, learner = 'paid', contentItems, canEdit, onRefresh }) {
  const [openPhase, setOpenPhase] = useState(null);
  const partPaid = learner === 'register';
  const phases = useMemo(() => coursePhases(programId), [programId]);
  const cmsProgram = CMS_PROGRAM[programId] || 'LEP';
  const sessions = programId === PROGRAMS.LEP ? batch?.sessions || [] : [];

  if (!batch?.id) {
    return <Notice tone="neutral">Pick a batch at the top to add its recordings and files.</Notice>;
  }

  const sessionLocked = (s) => partPaid && !REGISTERED_SESSION_CODES.has(s.code);
  const missing = sessions.filter((s) => sessionHeld(s) && !sessionLocked(s) && !recordingFor(contentItems, batch.id, s.code));

  return (
    <View>
      {sessions.length ? (
        missing.length ? (
          <Notice tone="error">
            {missing.length} held session{missing.length > 1 ? 's are' : ' is'} missing a recording. Paste a Zoom, Drive or
            YouTube link — learners always watch inside the app.
          </Notice>
        ) : (
          <Notice tone="ok">Every held session has its recording.</Notice>
        )
      ) : null}
      {partPaid ? (
        <Notice tone="neutral">
          Showing what a part-paid learner can open. Greyed items unlock when she completes her enrollment.
        </Notice>
      ) : null}
      {learner === 'late' ? (
        <Notice tone="neutral">
          Showing a late joiner. Recordings of sessions held before she joined are her catch-up path — keep them filled.
        </Notice>
      ) : null}

      {sessions.length ? (
        <>
          <T weight="bold" size={14} style={{ marginBottom: 8, marginTop: 4 }}>Live sessions</T>
          {sessions.map((s) => {
            const locked = sessionLocked(s);
            const rec = recordingFor(contentItems, batch.id, s.code);
            const held = sessionHeld(s);
            const when = dayParts(s.date);
            return (
              <Card key={s.code} style={{ marginBottom: 8, padding: 14, opacity: locked ? 0.55 : 1 }}>
                <Row gap={12} style={{ alignItems: 'flex-start' }}>
                  <View style={{ width: 62, alignItems: 'center', backgroundColor: '#F7F6E4', borderRadius: 12, paddingVertical: 6 }}>
                    <T size={10} color={A.muted}>{when.wd}</T>
                    <T size={18} weight="bold">{when.day}</T>
                    <T size={10} color={A.muted}>{when.mon}</T>
                  </View>
                  <View style={{ flex: 1 }}>
                    <T weight="semibold" size={14}>{s.title}</T>
                    <T size={12} color={A.muted}>
                      {s.startTime}–{s.endTime} IST · <T size={11} color="#A3A7B1">{s.code}</T>
                    </T>
                    <Row gap={0} style={{ flexWrap: 'wrap' }}>
                      {locked ? (
                        <StatusChip tone="lock" label="🔒 Full paid only" />
                      ) : (
                        <>
                          <StatusChip
                            tone={rec ? 'ok' : held ? 'miss' : 'wait'}
                            label={rec ? '✓ Recording' : held ? '✕ Recording missing' : 'Recording · after the session'}
                          />
                          <StatusChip tone={s.joinLink ? 'ok' : 'miss'} label={s.joinLink ? '✓ Zoom link' : '✕ No Zoom link (Batch setup)'} />
                        </>
                      )}
                    </Row>
                    {!locked && canEdit ? (
                      <SessionRecordingRow
                        batchId={batch.id}
                        cmsProgram={cmsProgram}
                        sessionCode={s.code}
                        sessionTitle={s.title}
                        existing={rec}
                        onRefresh={onRefresh}
                      />
                    ) : null}
                  </View>
                </Row>
              </Card>
            );
          })}
        </>
      ) : programId !== PROGRAMS.LEP ? (
        <Notice tone="neutral">Live session dates for this program are not in the CMS calendar yet. Task files below work now.</Notice>
      ) : null}

      <T weight="bold" size={14} style={{ marginTop: 22, marginBottom: 8 }}>Journey tasks</T>
      {phases.map((phase) => {
        const tasks = courseTasks(programId, phase.id);
        if (!tasks.length) return null;
        const locked = partPaid && !phase.openRegistered;
        const open = openPhase === phase.id;
        return (
          <Card key={phase.id} style={{ marginBottom: 8, padding: 0, overflow: 'hidden', opacity: locked ? 0.55 : 1 }}>
            <Pressable
              onPress={() => setOpenPhase(open ? null : phase.id)}
              style={{ padding: 12, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}
            >
              <T weight="semibold" size={13}>{phase.title}</T>
              <T size={12} color={A.muted}>
                {locked ? '🔒 Full paid only · ' : ''}{tasks.length} tasks {open ? '▼' : '▶'}
              </T>
            </Pressable>
            {open ? (
              <View style={{ paddingHorizontal: 12, paddingBottom: 12 }}>
                {tasks.map((task) => {
                  const own = contentForTask(contentItems, task.id, batch.id);
                  const shared = contentForTask(contentItems, task.id, null);
                  const files = own.length ? own : shared;
                  return (
                    <View key={task.id} style={{ borderTopWidth: 1, borderTopColor: A.line, paddingVertical: 10 }}>
                      <T size={13} weight="semibold">{task.title}</T>
                      {files.length ? (
                        files.map((f) => (
                          <T key={f.id} size={11} color={A.ok} style={{ marginTop: 4 }}>
                            ✓ {f.title} {f.batchId ? '(this batch)' : '(all batches)'}
                          </T>
                        ))
                      ) : (
                        <T size={11} color={A.muted} style={{ marginTop: 4 }}>No file yet</T>
                      )}
                      {canEdit ? (
                        <TaskUploadInline taskId={task.id} cmsProgram={cmsProgram} batchId={batch.id} onDone={onRefresh} />
                      ) : null}
                    </View>
                  );
                })}
              </View>
            ) : null}
          </Card>
        );
      })}
    </View>
  );
}

function SessionRecordingRow({ batchId, cmsProgram, sessionCode, sessionTitle, existing, onRefresh }) {
  const [url, setUrl] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState(null);
  return (
    <View style={{ marginTop: 10 }}>
      {existing ? (
        <T size={11} color={A.ok}>Recording: {existing.title || existing.url}</T>
      ) : null}
      {error ? (
        <T size={11} color={A.danger} style={{ marginTop: 4 }}>Not saved: {error}</T>
      ) : null}
      <Row gap={8} style={{ marginTop: 6 }}>
        <View style={{ flex: 1 }}>
          <Input
            value={url}
            onChangeText={setUrl}
            placeholder={existing ? 'Paste a new link to replace it' : 'Paste recording link (Zoom, Drive, YouTube)'}
            autoCapitalize="none"
          />
        </View>
        <Btn
          label={existing ? 'Replace' : 'Add recording'}
          small
          loading={busy}
          onPress={async () => {
            if (!url.trim()) return;
            setBusy(true);
            setError(null);
            try {
              await addContentEntry({
                title: `${sessionTitle || sessionCode} recording`,
                type: 'link',
                program: cmsProgram,
                library: 'session',
                sessionCode,
                batchId,
                url: url.trim(),
                linkedTaskIds: [],
                tags: ['recording', sessionCode],
              });
              setUrl('');
              onRefresh?.();
            } catch (e) {
              setError(e?.message || 'Could not save the link. Try again.');
            } finally {
              setBusy(false);
            }
          }}
        />
      </Row>
    </View>
  );
}

function TaskUploadInline({ taskId, cmsProgram, batchId, onDone }) {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState(null);
  const pick = () => {
    if (typeof document === 'undefined') return;
    const input = document.createElement('input');
    input.type = 'file';
    input.onchange = async () => {
      const file = input.files?.[0];
      if (!file) return;
      setBusy(true);
      setError(null);
      try {
        await uploadContentFile(file, {
          title: file.name,
          program: cmsProgram,
          type: 'file',
          library: 'task',
          batchId,
          linkedTaskIds: [taskId],
          tags: [taskId],
        });
        onDone?.();
      } catch (e) {
        setError(e?.message || 'Upload failed. Try again.');
      } finally {
        setBusy(false);
      }
    };
    input.click();
  };
  return (
    <View style={{ marginTop: 6, alignItems: 'flex-start' }}>
      <Btn label={busy ? 'Uploading…' : 'Upload for this batch'} kind="ghost" small onPress={pick} disabled={busy} />
      {error ? <T size={11} color={A.danger} style={{ marginTop: 4 }}>{error}</T> : null}
    </View>
  );
}

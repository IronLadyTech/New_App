import React, { useEffect, useMemo, useState } from 'react';
import { View } from 'react-native';
import Pressable from '../../../components/il/Press';
import { auth } from '../../../services/firebase';
import { cancelBatchMessage, scheduleBatchMessage, subscribeToBatchMessages } from '../../../services/cms';
import { formatCallableError, sendParticipantNotificationTest } from '../../../services/functions';
import { buildBatchMessagePlan } from '../../../utils/batchMessagePlan';
import { A, Btn, Card, Input, Notice, Row, T } from '../adminUi';
import { AddBox, AudiencePicker, DateInput, FieldLabel, Pill, Segmented, audienceLabel, audienceMatches, istLabel } from './cmsBits';

/** "When" for each automatic reminder, said the way CX would say it. */
function whenWords(row) {
  if (row.code === 'R-24h') return 'Evening before';
  if (row.code === 'R-1h') return '1 hour before';
  if (row.code === 'R-10m' || row.code === 'OPT-R-10m' || row.code === 'OPT-R-10m-PTW') return '10 minutes before';
  if (row.code === 'OPT-5PM' || row.code === 'OPT-5PM-PTW') return 'Same day, 2 hours before';
  return row.title;
}

/**
 * Messages for one batch: CX's own messages first, then the automatic reminders
 * grouped under each session. Plain words, real India times, no codes.
 */
export default function BatchHubMessagesTab({ batch, events, learner = 'all', canEdit }) {
  const [mine, setMine] = useState([]);
  const [audience, setAudience] = useState(learner);
  const [when, setWhen] = useState('now');
  const [at, setAt] = useState('');
  const [title, setTitle] = useState('');
  const [body, setBody] = useState('');
  const [busy, setBusy] = useState(false);
  const [testing, setTesting] = useState(null);
  const [msg, setMsg] = useState(null);

  useEffect(() => setAudience(learner), [learner]);
  useEffect(() => subscribeToBatchMessages(batch?.id, setMine, () => setMine([])), [batch?.id]);

  // Automatic reminders as one learner of the chosen kind sees them ('all' = full paid, the widest set).
  const plan = useMemo(
    () => buildBatchMessagePlan(batch, events, { learner: learner === 'register' ? 'register' : 'paid' }),
    [batch, events, learner]
  );

  const bySession = useMemo(() => {
    const groups = new Map();
    plan.days.forEach((d) =>
      d.items.forEach((row) => {
        if (row.held) return;
        const key = row.sessionTitle || row.title;
        if (!groups.has(key)) groups.set(key, { title: key, rows: [] });
        groups.get(key).rows.push({ ...row, day: d.day });
      })
    );
    return [...groups.values()];
  }, [plan]);
  const heldCount = plan.days.reduce((n, d) => n + d.items.filter((r) => r.held).length, 0);

  if (!batch?.id) return <Notice tone="neutral">Pick a batch at the top to see its messages.</Notice>;

  const test = async (key, t, b) => {
    const uid = auth.currentUser?.uid;
    if (!uid) return;
    setTesting(key);
    setMsg(null);
    try {
      // No eventCode: the text is already final, and an unknown code would be rejected.
      await sendParticipantNotificationTest({ targetUid: uid, title: t, body: b, go: { to: 'home' } });
      setMsg({ tone: 'ok', text: 'Test sent to your own account. Open the Iron Lady app on your phone to see it.' });
    } catch (e) {
      setMsg({ tone: 'error', text: formatCallableError(e, 'Could not send the test.') });
    } finally {
      setTesting(null);
    }
  };

  const schedule = async () => {
    if (!title.trim() || !body.trim()) {
      setMsg({ tone: 'error', text: 'Add a heading and a message first.' });
      return;
    }
    const sendAt = when === 'now' ? new Date().toISOString() : at ? new Date(at).toISOString() : '';
    if (!sendAt) {
      setMsg({ tone: 'error', text: 'Pick the date and time to send it.' });
      return;
    }
    setBusy(true);
    setMsg(null);
    try {
      await scheduleBatchMessage({ batchId: batch.id, program: batch.program, audience, sendAt, title, body });
      setTitle('');
      setBody('');
      setAt('');
      setMsg({
        tone: 'ok',
        text: when === 'now' ? 'Scheduled — it goes out within 15 minutes.' : `Scheduled for ${istLabel(sendAt)}.`,
      });
    } catch (e) {
      setMsg({ tone: 'error', text: e?.message || 'Could not schedule it. Try again.' });
    } finally {
      setBusy(false);
    }
  };

  const shownMine = mine.filter((m) => m.status !== 'cancelled' && audienceMatches(m.audience, learner));

  return (
    <View>
      {msg ? <Notice tone={msg.tone}>{msg.text}</Notice> : null}

      {canEdit ? (
        <AddBox title="+ Send a message to this batch">
          <FieldLabel>Who gets it</FieldLabel>
          <AudiencePicker value={audience} onChange={setAudience} />
          <Row gap={12} style={{ marginTop: 12, flexWrap: 'wrap', alignItems: 'flex-start' }}>
            <View style={{ minWidth: 200 }}>
              <FieldLabel>When</FieldLabel>
              <Segmented options={[{ value: 'now', label: 'Now' }, { value: 'later', label: 'Pick a time' }]} value={when} onChange={setWhen} />
              {when === 'later' ? <View style={{ marginTop: 8 }}><DateInput value={at} onChange={setAt} withTime /></View> : null}
            </View>
            <View style={{ flex: 1, minWidth: 240 }}>
              <FieldLabel>Heading</FieldLabel>
              <Input value={title} onChangeText={setTitle} placeholder="e.g. Day 2 starts at 9 sharp" />
            </View>
          </Row>
          <View style={{ marginTop: 12 }}>
            <FieldLabel>Message</FieldLabel>
            <Input value={body} onChangeText={setBody} multiline rows={3} placeholder="Write it the way you would say it to her." />
            <T size={11} color={A.muted} style={{ marginTop: 4 }}>{'Tip: {{name}} becomes her first name.'}</T>
          </View>
          <Row gap={8} style={{ marginTop: 12, flexWrap: 'wrap', alignItems: 'center' }}>
            <Btn label="Schedule" onPress={schedule} loading={busy} />
            <Btn label="Send test to my phone" kind="ghost" loading={testing === 'new'} onPress={() => test('new', title || 'Test', body || 'Test message')} />
            <T size={12} color={A.muted}>Goes to the app as a notification.</T>
          </Row>
        </AddBox>
      ) : null}

      {shownMine.length ? (
        <>
          <FieldLabel>Messages you added</FieldLabel>
          {shownMine.map((m) => (
            <Card key={m.id} style={{ marginBottom: 8, padding: 14 }}>
              <Row gap={10} style={{ alignItems: 'flex-start' }}>
                <View style={{ flex: 1 }}>
                  <T size={14} weight="semibold">{m.title}</T>
                  <T size={12} color={A.muted}>{istLabel(m.sendAt)}</T>
                </View>
                <Pill label={audienceLabel(m.audience)} />
                <Pill
                  label={m.status === 'sent' ? `Sent to ${m.recipientCount ?? 0}` : m.status === 'scheduled' ? 'Scheduled' : m.status === 'sending' ? 'Sending…' : 'Not sent'}
                  tone={m.status === 'sent' ? 'ok' : m.status === 'scheduled' ? 'neutral' : 'warn'}
                />
              </Row>
              <View style={{ backgroundColor: '#F7F6E4', borderRadius: 12, padding: 10, marginTop: 8 }}>
                <T size={13}>{m.body}</T>
              </View>
              {canEdit && m.status === 'scheduled' ? (
                <Row gap={8} style={{ marginTop: 8 }}>
                  <Btn label="Cancel" kind="ghost" small onPress={() => cancelBatchMessage(m.id)} />
                </Row>
              ) : null}
            </Card>
          ))}
        </>
      ) : null}

      <View style={{ marginTop: 16 }}>
        <FieldLabel>Automatic session reminders</FieldLabel>
      </View>
      {plan.blocker ? (
        <Notice tone="error">{plan.blocker}</Notice>
      ) : (
        <Notice tone="ok">Automatic reminders are on — each session below sends its reminders by itself.</Notice>
      )}
      {bySession.length ? null : <T color={A.muted}>No session reminders for this batch.</T>}
      {bySession.map((g) => (
        <Card key={g.title} style={{ marginBottom: 10, padding: 14 }}>
          <Row gap={10} style={{ alignItems: 'center', marginBottom: 4 }}>
            <T size={14} weight="semibold" style={{ flex: 1 }}>{g.title}</T>
            <Pill label={plan.automatic ? `${g.rows.length} reminders · automatic` : 'Off'} tone={plan.automatic ? 'ok' : 'muted'} />
          </Row>
          {g.rows.map((row) => (
            <Row key={row.key} gap={10} style={{ alignItems: 'flex-start', borderTopWidth: 1, borderTopColor: A.line, paddingTop: 10, marginTop: 8, opacity: row.past ? 0.55 : 1 }}>
              <View style={{ width: 150 }}>
                <T size={13} weight="bold">{whenWords(row)}</T>
                <T size={12} color={A.muted}>{row.day} · {row.time}{row.past ? ' · sent' : ''}</T>
              </View>
              <View style={{ flex: 1, backgroundColor: '#F7F6E4', borderRadius: 12, padding: 10 }}>
                <T size={13}>{row.body}</T>
              </View>
              {!row.past ? (
                <Btn label="Test" kind="ghost" small loading={testing === row.key} onPress={() => test(row.key, row.title, row.body)} />
              ) : null}
            </Row>
          ))}
        </Card>
      ))}

      <Details title={`Messages that wait for attendance data (${heldCount}) · and ${plan.other.length} not automatic yet`}>
        <T size={12} color={A.muted} style={{ marginBottom: 8 }}>
          “Well done” after a session and “We missed you” only go to the right people once attendance comes from Zoom.
          Until then they stay off, so no one is told she was absent when she was there. Daily rituals, task and welcome
          messages are planned but not sent automatically yet — use “Send a message” above for now.
        </T>
        {plan.other.map((o) => (
          <Card key={o.key} style={{ marginBottom: 6, padding: 12 }}>
            <T size={13} weight="semibold">{o.title}</T>
            <T size={12} color={A.muted}>{o.when} · {o.audience}</T>
          </Card>
        ))}
      </Details>
    </View>
  );
}

function Details({ title, children }) {
  const [open, setOpen] = useState(false);
  return (
    <View style={{ marginTop: 14 }}>
      <Pressable onPress={() => setOpen((v) => !v)}>
        <T size={13} weight="semibold" color={A.navy}>{open ? '▼' : '▶'} {title}</T>
      </Pressable>
      {open ? <View style={{ marginTop: 8 }}>{children}</View> : null}
    </View>
  );
}

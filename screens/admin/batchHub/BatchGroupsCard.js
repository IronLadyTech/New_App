import React, { useEffect, useMemo, useState } from 'react';
import { View } from 'react-native';
import { checkBatchWithZoho, fetchBatchLearnerCounts, saveBatchFields, splitBatchIntoGroups } from '../../../services/cms';
import { batchGroupsOf } from '../../../utils/batchGroups';
import { A, Btn, Card, Input, Notice, Row, T } from '../adminUi';

/**
 * Groups and Zoom rooms for one batch, as three steps the CEM team can follow top to bottom:
 *   1. Check the learners against Zoho (counts and names that differ, with what to do)
 *   2. Split into groups (Group 1, 2, 3 of about 15)
 *   3. Paste one Zoom link per group (optional: a different link for one session)
 * New learners from Zoho, and learners who reschedule into this batch, are added and put in
 * the smallest group by the server within the hour; nobody has to do that by hand.
 */

const OK = '#1F7A4D';

function Step({ n, title, done, hint, children }) {
  return (
    <View style={{ borderTopWidth: 1, borderTopColor: A.line, paddingVertical: 14 }}>
      <Row gap={10} style={{ alignItems: 'center', marginBottom: 4 }}>
        <View
          style={{
            width: 24,
            height: 24,
            borderRadius: 12,
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: done ? OK : A.navy,
          }}
        >
          <T size={12} weight="bold" color="#fff">
            {done ? '✓' : n}
          </T>
        </View>
        <T weight="bold">{title}</T>
        <T size={12} color={done ? OK : A.muted}>
          {done ? 'Done' : 'To do'}
        </T>
      </Row>
      <T size={13} color={A.muted} style={{ marginBottom: 10, marginLeft: 34, maxWidth: 720 }}>
        {hint}
      </T>
      <View style={{ marginLeft: 34 }}>{children}</View>
    </View>
  );
}

function NameList({ title, rows }) {
  if (!rows?.length) return null;
  return (
    <View style={{ marginTop: 10 }}>
      <T size={13} weight="semibold" style={{ marginBottom: 4 }}>
        {title} ({rows.length})
      </T>
      {rows.map((r, i) => (
        <View key={`${r.name}-${i}`} style={{ paddingVertical: 5, borderBottomWidth: 1, borderBottomColor: A.line }}>
          <T size={13} weight="semibold">
            {r.name}
            {r.status ? <T size={12} color={A.muted}>{`  ·  ${r.status}`}</T> : null}
          </T>
          <T size={12} color={A.muted}>
            {r.why}
          </T>
        </View>
      ))}
    </View>
  );
}

export default function BatchGroupsCard({ batch, sessions, canEdit }) {
  const groups = useMemo(() => batchGroupsOf(batch), [batch]);
  const [size, setSize] = useState('15');
  const [draft, setDraft] = useState({});
  const [counts, setCounts] = useState(null);
  const [check, setCheck] = useState(null);
  const [busy, setBusy] = useState('');
  const [msg, setMsg] = useState(null);
  const [openGroup, setOpenGroup] = useState('');

  useEffect(() => {
    setDraft(Object.fromEntries(groups.map((g) => [g.id, { joinLink: g.joinLink || '', links: { ...(g.links || {}) } }])));
  }, [groups]);

  const loadCounts = () =>
    fetchBatchLearnerCounts(batch.id)
      .then((r) => setCounts(r || null))
      .catch(() => setCounts(null));
  useEffect(() => {
    setCheck(null);
    setMsg(null);
    if (batch?.id) loadCounts();
  }, [batch?.id, groups.length]);

  const runCheck = async () => {
    setBusy('check');
    setMsg(null);
    try {
      setCheck(await checkBatchWithZoho(batch.id));
    } catch (e) {
      setMsg({ tone: 'error', text: `Could not read Zoho: ${e?.message || 'try again in a minute.'}` });
    } finally {
      setBusy('');
    }
  };

  const split = async () => {
    setBusy('split');
    setMsg(null);
    try {
      const data = await splitBatchIntoGroups(batch.id, Number(size) || 15);
      const text = (data?.groups || []).map((g) => `${g.name}: ${g.learners}`).join(' · ');
      setMsg({ tone: 'ok', text: `Split done. ${text}. Next: paste each group’s Zoom link in step 3.` });
      loadCounts();
    } catch (e) {
      setMsg({ tone: 'error', text: e?.message || 'Could not split the batch. Try again.' });
    } finally {
      setBusy('');
    }
  };

  const save = async () => {
    setBusy('save');
    setMsg(null);
    try {
      const next = groups.map((g) => {
        const d = draft[g.id] || {};
        const links = Object.fromEntries(
          Object.entries(d.links || {})
            .map(([k, v]) => [k, String(v || '').trim()])
            .filter(([, v]) => v)
        );
        return { ...g, joinLink: String(d.joinLink || '').trim(), links };
      });
      await saveBatchFields(batch.id, { groups: next });
      setMsg({ tone: 'ok', text: 'Links saved. Every learner now gets her group’s link in the app and in reminders.' });
    } catch (e) {
      setMsg({ tone: 'error', text: e?.message || 'Could not save the links. Try again.' });
    } finally {
      setBusy('');
    }
  };

  const setLink = (gid, value) => setDraft((d) => ({ ...d, [gid]: { ...(d[gid] || {}), joinLink: value } }));
  const setSessionLink = (gid, code, value) =>
    setDraft((d) => ({ ...d, [gid]: { ...(d[gid] || {}), links: { ...((d[gid] || {}).links || {}), [code]: value } } }));

  const linked = Boolean(counts?.linked);
  const learnersInApp = counts?.counts?.all ?? null;
  const gc = counts?.groupCounts || null;
  const savedLinks = groups.filter((g) => String(g.joinLink || '').trim()).length;
  const checkDone = Boolean(check && !check.onlyZoho?.length && !check.onlyApp?.length);
  const splitDone = groups.length > 0 && !(gc?.none > 0);
  const linksDone = groups.length > 0 && savedLinks === groups.length;
  const doneCount = [checkDone, splitDone, linksDone].filter(Boolean).length;

  if (!linked && counts) {
    return (
      <Card style={{ marginBottom: 16 }}>
        <T weight="bold">Groups and Zoom rooms</T>
        <Notice tone="neutral">
          This batch is not linked to its learners yet. It links itself within the hour once Zoho has learners for this
          Day 1. Then come back here.
        </Notice>
      </Card>
    );
  }

  return (
    <Card style={{ marginBottom: 16 }}>
      <Row gap={10} style={{ alignItems: 'baseline', justifyContent: 'space-between' }}>
        <T weight="bold" size={16}>
          Groups and Zoom rooms
        </T>
        <T size={13} weight="semibold" color={doneCount === 3 ? OK : A.navy}>
          {doneCount === 3 ? 'Ready: all 3 steps done' : `${doneCount} of 3 steps done`}
        </T>
      </Row>
      <T size={13} color={A.muted} style={{ marginTop: 4, marginBottom: 10, maxWidth: 760 }}>
        {learnersInApp != null ? `${learnersInApp} learners in this batch. ` : ''}Each learner sees her own group’s Zoom
        link on the Join button and in every reminder, for every session. New learners from Zoho and learners who move
        into this batch are added and placed in a group automatically within the hour.
      </T>
      {msg ? <Notice tone={msg.tone}>{msg.text}</Notice> : null}

      <Step
        n={1}
        title="Check the learners against Zoho"
        done={checkDone}
        hint="Compares this batch with Zoho’s LEP Batch for the same Day 1. Fix any name listed below in Zoho; the app follows within the hour."
      >
        <Row gap={10} style={{ alignItems: 'center' }}>
          <Btn label={check ? 'Check again' : 'Check against Zoho'} kind="dark" small loading={busy === 'check'} onPress={runCheck} />
          {check ? (
            <T size={13} weight="semibold" color={checkDone ? OK : A.danger}>
              {`Zoho ${check.zohoCount} · App ${check.appCount} · Matched ${check.matched}`}
              {checkDone ? '  ✓ All match' : ''}
            </T>
          ) : null}
        </Row>
        {check ? (
          <>
            <NameList title="In Zoho, missing in the app" rows={check.onlyZoho} />
            <NameList title="In the app, not in Zoho for this date" rows={check.onlyApp} />
          </>
        ) : null}
      </Step>

      <Step
        n={2}
        title="Split into groups"
        done={splitDone}
        hint={
          groups.length
            ? 'Groups are set. Splitting again re-shares everyone evenly and keeps the links.'
            : 'Choose how many learners per group. 45 learners at 15 each make Group 1, 2 and 3.'
        }
      >
        {canEdit ? (
          <Row gap={10} style={{ alignItems: 'center' }}>
            <T size={13}>Learners per group</T>
            <Input
              nativeID="group-size"
              value={size}
              onChangeText={(v) => setSize(v.replace(/\D/g, '').slice(0, 3))}
              keyboardType="number-pad"
              style={{ width: 70 }}
            />
            <Btn
              label={groups.length ? 'Split again' : 'Split into groups'}
              kind={groups.length ? 'ghost' : 'dark'}
              small
              loading={busy === 'split'}
              onPress={split}
            />
          </Row>
        ) : null}
        {groups.length ? (
          <T size={13} style={{ marginTop: 8 }}>
            {groups.map((g) => `${g.name}: ${gc && gc[g.id] != null ? gc[g.id] : '…'}`).join('   ·   ')}
            {gc?.none ? `   ·   Not placed yet: ${gc.none} (placed automatically within minutes)` : ''}
          </T>
        ) : null}
      </Step>

      <Step
        n={3}
        title="Paste one Zoom link per group"
        done={linksDone}
        hint="One link per group is used for every session, Orientation and the full days included. Use “Different link for one session” only when a session has its own room."
      >
        {!groups.length ? (
          <T size={13} color={A.muted}>
            Split the batch first (step 2).
          </T>
        ) : (
          <>
            {groups.map((g) => (
              <View key={g.id} style={{ marginBottom: 10 }}>
                <Row gap={10} style={{ alignItems: 'center' }}>
                  <T weight="semibold" style={{ width: 80 }}>
                    {g.name}
                  </T>
                  <Input
                    nativeID={`group-link-${g.id}`}
                    value={draft[g.id]?.joinLink || ''}
                    onChangeText={(v) => setLink(g.id, v)}
                    placeholder="https://zoom.us/j/…"
                    editable={canEdit}
                    style={{ flex: 1, minWidth: 240 }}
                  />
                  <Btn
                    label={openGroup === g.id ? 'Hide' : 'Different link for one session'}
                    kind="ghost"
                    small
                    onPress={() => setOpenGroup(openGroup === g.id ? '' : g.id)}
                  />
                </Row>
                {openGroup === g.id ? (
                  <View style={{ marginTop: 8, paddingLeft: 90 }}>
                    {(sessions || []).map((s) => (
                      <Row key={s.code} gap={10} style={{ alignItems: 'center', marginBottom: 6 }}>
                        <T size={13} style={{ width: 210 }}>
                          {s.title}
                        </T>
                        <Input
                          nativeID={`group-link-${g.id}-${s.code}`}
                          value={draft[g.id]?.links?.[s.code] || ''}
                          onChangeText={(v) => setSessionLink(g.id, s.code, v)}
                          placeholder="Empty = the group link"
                          editable={canEdit}
                          style={{ flex: 1, minWidth: 220 }}
                        />
                      </Row>
                    ))}
                  </View>
                ) : null}
              </View>
            ))}
            {canEdit ? (
              <Row gap={10} style={{ alignItems: 'center' }}>
                <Btn label="Save links" small loading={busy === 'save'} onPress={save} />
                {savedLinks < groups.length ? (
                  <T size={12} color={A.danger}>
                    {groups.length - savedLinks} group(s) have no saved link yet; their learners get the batch’s main link.
                  </T>
                ) : null}
              </Row>
            ) : null}
          </>
        )}
      </Step>
    </Card>
  );
}

import React, { useEffect, useMemo, useState } from 'react';
import { View } from 'react-native';
import { httpsCallable } from 'firebase/functions';
import { functions } from '../../../services/firebase';
import { fetchBatchLearnerCounts, saveBatchFields } from '../../../services/cms';
import { batchGroupsOf } from '../../../utils/batchGroups';
import { A, Btn, Card, Input, Notice, Row, T } from '../adminUi';

/**
 * Groups inside one batch: Group 1, 2, 3 of about 15, each with its own Zoom room for every
 * session. CX split once and paste one link per group; each learner's app and reminders use
 * her group's link. A session that needs a different room gets its own link per group.
 * Learners who join later go into the smallest group automatically.
 */
export default function BatchGroupsCard({ batch, sessions, canEdit }) {
  const groups = useMemo(() => batchGroupsOf(batch), [batch]);
  const [size, setSize] = useState('15');
  const [draft, setDraft] = useState({});
  const [counts, setCounts] = useState(null);
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState(null);
  const [openGroup, setOpenGroup] = useState('');

  useEffect(() => {
    setDraft(Object.fromEntries(groups.map((g) => [g.id, { joinLink: g.joinLink || '', links: { ...(g.links || {}) } }])));
  }, [groups]);

  const loadCounts = () =>
    fetchBatchLearnerCounts(batch.id)
      .then((r) => setCounts(r?.groupCounts || null))
      .catch(() => setCounts(null));
  useEffect(() => {
    if (batch?.id && groups.length) loadCounts();
  }, [batch?.id, groups.length]);

  const split = async () => {
    setBusy(true);
    setMsg(null);
    try {
      const { data } = await httpsCallable(functions, 'cmsSplitBatchGroups')({ batchId: batch.id, size: Number(size) || 15 });
      const text = (data?.groups || []).map((g) => `${g.name}: ${g.learners}`).join(' · ');
      setMsg({ tone: 'ok', text: `Split done. ${text}. Now paste each group's Zoom link.` });
      loadCounts();
    } catch (e) {
      setMsg({ tone: 'error', text: e?.message || 'Could not split the batch. Try again.' });
    } finally {
      setBusy(false);
    }
  };

  const save = async () => {
    setBusy(true);
    setMsg(null);
    try {
      const next = groups.map((g) => {
        const d = draft[g.id] || {};
        const links = Object.fromEntries(Object.entries(d.links || {}).map(([k, v]) => [k, String(v || '').trim()]).filter(([, v]) => v));
        return { ...g, joinLink: String(d.joinLink || '').trim(), links };
      });
      await saveBatchFields(batch.id, { groups: next });
      setMsg({ tone: 'ok', text: 'Saved. Each learner now gets her group’s link in the app and in reminders.' });
    } catch (e) {
      setMsg({ tone: 'error', text: e?.message || 'Could not save the links.' });
    } finally {
      setBusy(false);
    }
  };

  const setLink = (gid, value) => setDraft((d) => ({ ...d, [gid]: { ...(d[gid] || {}), joinLink: value } }));
  const setSessionLink = (gid, code, value) =>
    setDraft((d) => ({ ...d, [gid]: { ...(d[gid] || {}), links: { ...((d[gid] || {}).links || {}), [code]: value } } }));
  const missing = groups.filter((g) => !String(draft[g.id]?.joinLink || '').trim()).map((g) => g.name);

  return (
    <Card style={{ marginBottom: 16 }}>
      <T weight="bold" style={{ marginBottom: 4 }}>
        Groups and Zoom rooms
      </T>
      <T size={13} color={A.muted} style={{ marginBottom: 12, maxWidth: 760 }}>
        Split a large batch into groups (Group 1, 2, 3 …) with their own Zoom room. Each learner sees her group’s link on
        the Join button and in every reminder, for every session. Learners who join later go into the smallest group.
      </T>
      {msg ? <Notice tone={msg.tone}>{msg.text}</Notice> : null}

      {canEdit ? (
        <Row gap={10} style={{ alignItems: 'center', flexWrap: 'wrap', marginBottom: groups.length ? 14 : 0 }}>
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
            loading={busy}
            onPress={split}
          />
          {groups.length ? (
            <T size={12} color={A.muted}>Splitting again re-shares everyone evenly; links stay.</T>
          ) : null}
        </Row>
      ) : null}

      {groups.map((g) => (
        <View key={g.id} style={{ borderTopWidth: 1, borderTopColor: A.line, paddingVertical: 10 }}>
          <Row gap={10} style={{ alignItems: 'center', flexWrap: 'wrap' }}>
            <T weight="semibold" style={{ width: 90 }}>
              {g.name}
            </T>
            <T size={12} color={A.muted} style={{ width: 90 }}>
              {counts && counts[g.id] != null ? `${counts[g.id]} learners` : '—'}
            </T>
            <Input
              nativeID={`group-link-${g.id}`}
              value={draft[g.id]?.joinLink || ''}
              onChangeText={(v) => setLink(g.id, v)}
              placeholder="Zoom link for every session"
              editable={canEdit}
              style={{ flex: 1, minWidth: 240 }}
            />
            <Btn
              label={openGroup === g.id ? 'Hide session links' : 'Session links'}
              kind="ghost"
              small
              onPress={() => setOpenGroup(openGroup === g.id ? '' : g.id)}
            />
          </Row>
          {openGroup === g.id ? (
            <View style={{ marginTop: 8, paddingLeft: 12 }}>
              <T size={12} color={A.muted} style={{ marginBottom: 6 }}>
                Only for a session that uses a different room. Leave empty to use the link above.
              </T>
              {(sessions || []).map((s) => (
                <Row key={s.code} gap={10} style={{ alignItems: 'center', marginBottom: 6, flexWrap: 'wrap' }}>
                  <T size={13} style={{ width: 200 }}>
                    {s.title}
                  </T>
                  <Input
                    nativeID={`group-link-${g.id}-${s.code}`}
                    value={draft[g.id]?.links?.[s.code] || ''}
                    onChangeText={(v) => setSessionLink(g.id, s.code, v)}
                    placeholder="Same as the group link"
                    editable={canEdit}
                    style={{ flex: 1, minWidth: 220 }}
                  />
                </Row>
              ))}
            </View>
          ) : null}
        </View>
      ))}

      {groups.length && counts?.none ? (
        <T size={12} color={A.muted} style={{ marginTop: 6 }}>
          {counts.none} learner(s) not in a group yet. They go into the smallest group before their next reminder.
        </T>
      ) : null}

      {groups.length && canEdit ? (
        <Row gap={10} style={{ marginTop: 10, alignItems: 'center', flexWrap: 'wrap' }}>
          <Btn label="Save links" small loading={busy} onPress={save} />
          {missing.length ? (
            <T size={12} color={A.danger}>
              No link yet for {missing.join(', ')}. Their learners would get the batch’s main link.
            </T>
          ) : null}
        </Row>
      ) : null}
    </Card>
  );
}

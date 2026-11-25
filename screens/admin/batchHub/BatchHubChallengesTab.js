import React, { useEffect, useMemo, useState } from 'react';
import { View } from 'react-native';
import { doc, getDoc } from 'firebase/firestore';
import Pressable from '../../../components/il/Press';
import { db } from '../../../services/firebase';
import { submissionDocId } from '../../../constants/programs';
import {
  CHALLENGE_DAYS,
  LEP_CHALLENGES,
  LEP_CHALLENGE_LOG_TASK_ID,
  formatChallengeDay,
  isChallengeDayDone,
  lepChallengeCounts,
  lepChallengeState,
} from '../../../utils/lepChallenges';
import { A, Card, Notice, Row, T } from '../adminUi';

async function readDoc(path, id) {
  try {
    const snap = await getDoc(doc(db, path, id));
    return snap.exists() ? snap.data() : null;
  } catch {
    return null;
  }
}

function learnerName(u, uid) {
  return String(u?.displayName || [u?.firstName, u?.lastName].filter(Boolean).join(' ') || u?.phone || uid).trim();
}

/** What each learner did in the weekly challenges: daily entries, and her end-of-week summary. */
export default function BatchHubChallengesTab({ batch }) {
  const [rows, setRows] = useState(null);
  const [error, setError] = useState(null);
  const [pick, setPick] = useState('c1');
  const [open, setOpen] = useState(null);

  useEffect(() => {
    let alive = true;
    setRows(null);
    setError(null);
    (async () => {
      const group = batch?.lmsGroupId ? await readDoc('groups', batch.lmsGroupId) : null;
      const uids = Array.isArray(group?.memberIds) ? group.memberIds : [];
      if (!uids.length) {
        if (alive) setRows([]);
        return;
      }
      const out = await Promise.all(
        uids.map(async (uid) => {
          const [user, logDoc, ...subs] = await Promise.all([
            readDoc('users', uid),
            readDoc('lep_submissions', submissionDocId(uid, LEP_CHALLENGE_LOG_TASK_ID)),
            ...LEP_CHALLENGES.map((c) => readDoc('lep_submissions', submissionDocId(uid, c.taskId))),
          ]);
          const summaries = {};
          LEP_CHALLENGES.forEach((c, i) => {
            summaries[c.key] = String(subs[i]?.textValue || '').trim();
          });
          return {
            uid,
            name: learnerName(user, uid),
            log: { days: logDoc?.challengeDays || {}, once: logDoc?.challengeOnce || {} },
            summaries,
          };
        })
      );
      out.sort((a, b) => a.name.localeCompare(b.name));
      if (alive) setRows(out);
    })().catch((e) => alive && setError(e?.message || 'Could not load.'));
    return () => {
      alive = false;
    };
  }, [batch?.id, batch?.lmsGroupId]);

  const challenge = LEP_CHALLENGES.find((c) => c.key === pick);
  const day1Iso = batch?.day1Date ? String(batch.day1Date).slice(0, 10) : null;
  const state = day1Iso ? lepChallengeState(challenge, day1Iso) : null;

  const totals = useMemo(() => {
    if (!rows?.length) return null;
    const counted = rows.map((r) => lepChallengeCounts(challenge, state, r.log));
    return {
      all7: counted.filter((c) => c.fullDays >= CHALLENGE_DAYS).length,
      started: counted.filter((c) => c.fullDays > 0 || Object.values(c.per).some((n) => n > 0)).length,
      summaries: rows.filter((r) => r.summaries[challenge.key]).length,
    };
  }, [rows, pick, day1Iso]);

  if (!batch?.lmsGroupId) {
    return <Notice tone="neutral">Link this batch to its learners first (top of the page) to see their challenges.</Notice>;
  }
  if (error) return <Notice tone="error">{error}</Notice>;
  if (!rows) return <Notice tone="neutral">Loading challenges…</Notice>;

  return (
    <View>
      <Row gap={8} style={{ marginBottom: 12, flexWrap: 'wrap' }}>
        {LEP_CHALLENGES.map((c) => (
          <Pressable key={c.key} onPress={() => setPick(c.key)}>
            <View
              style={{
                paddingHorizontal: 12,
                paddingVertical: 7,
                borderRadius: 999,
                borderWidth: 1,
                borderColor: pick === c.key ? A.ink : A.line,
                backgroundColor: pick === c.key ? A.ink : 'transparent',
              }}
            >
              <T size={12} color={pick === c.key ? '#FFFFFF' : A.ink}>
                {c.title}
              </T>
            </View>
          </Pressable>
        ))}
      </Row>

      {state ? (
        <T size={12} color={A.muted} style={{ marginBottom: 8 }}>
          {`Runs ${formatChallengeDay(state.startIso)} – ${formatChallengeDay(state.lastIso)} (after ${state.sessionTitle}).`}
        </T>
      ) : null}
      {totals ? (
        <Notice tone="neutral">
          {`${rows.length} learners · ${totals.started} started · ${totals.all7} did all ${CHALLENGE_DAYS} days · ${totals.summaries} sent the week summary`}
        </Notice>
      ) : (
        <Notice tone="neutral">No learners with the app in this batch yet.</Notice>
      )}

      {rows.map((r) => {
        const counts = lepChallengeCounts(challenge, state, r.log);
        const byDay = r.log.days[challenge.key] || {};
        const dayList = state?.days || Object.keys(byDay).sort();
        const expanded = open === r.uid;
        return (
          <Card key={r.uid} style={{ marginTop: 10, padding: 12 }}>
            <Pressable onPress={() => setOpen(expanded ? null : r.uid)}>
              <Row gap={10} style={{ alignItems: 'center' }}>
                <T size={14} weight="semibold" style={{ flex: 1 }}>
                  {r.name}
                </T>
                <Row gap={4}>
                  {dayList.map((iso) => (
                    <View
                      key={iso}
                      style={{
                        width: 10,
                        height: 10,
                        borderRadius: 5,
                        backgroundColor: isChallengeDayDone(challenge, byDay[iso]) ? A.ink : A.line,
                      }}
                    />
                  ))}
                </Row>
                <T size={12} color={A.muted}>{`${counts.fullDays}/${CHALLENGE_DAYS}`}</T>
                <T size={12} color={r.summaries[challenge.key] ? A.ink : A.muted}>
                  {r.summaries[challenge.key] ? 'Summary sent' : 'No summary'}
                </T>
              </Row>
            </Pressable>
            {expanded ? (
              <View style={{ marginTop: 10 }}>
                {challenge.once ? (
                  <T size={13} style={{ marginBottom: 6 }}>{`${challenge.once.label}: ${counts.once === true ? 'done' : counts.once || '—'}`}</T>
                ) : null}
                {dayList.map((iso, i) => {
                  const e = byDay[iso] || {};
                  const parts = challenge.daily.map((d) => {
                    const v = e[d.id];
                    return `${d.label}: ${v === true ? 'done' : v ? String(v) : '—'}`;
                  });
                  return (
                    <T key={iso} size={12} color={A.ink} style={{ marginTop: 4 }}>
                      {`Day ${i + 1} · ${formatChallengeDay(iso)} — ${parts.join(' · ')}`}
                    </T>
                  );
                })}
                {r.summaries[challenge.key] ? (
                  <View style={{ marginTop: 10, padding: 10, borderRadius: 8, backgroundColor: A.chip }}>
                    <T size={12}>{r.summaries[challenge.key]}</T>
                  </View>
                ) : null}
              </View>
            ) : null}
          </Card>
        );
      })}
    </View>
  );
}

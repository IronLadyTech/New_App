import React, { useMemo, useState } from 'react';
import { View } from 'react-native';
import { A, Btn, T } from '../adminUi';
import { buildBatchMessagePlan } from '../../../utils/batchMessagePlan';
import { batchReminderChecks, reminderState } from '../../../utils/batchReminderChecks';

export { reminderState };

const MARK = { ok: '✅', warn: '⚠️', todo: '⬜', bad: '❌' };
const COLOR = { ok: A.ok, warn: '#9A5B00', todo: A.muted, bad: A.danger };

/**
 * "Ready for reminders" — the four things CX do before reminders go out, ticked from
 * the batch's own data, with a button to each fix and the on / pause switch at the end.
 */
export default function ReminderChecklist({ batch, events, isLep, learnerCount, canEdit, busy, onStart, onPause, onOpenTab }) {
  const [confirm, setConfirm] = useState(null); // 'start' | 'pause'
  const todayIso = new Date().toISOString().slice(0, 10);
  const state = reminderState(batch);
  const { checks, ready } = batchReminderChecks(batch, { isLep, learnerCount, todayIso });

  // What starting would send, so CX confirm a number, not a promise.
  const upcoming = useMemo(() => {
    if (!isLep) return null;
    const plan = buildBatchMessagePlan(batch, events, { learner: 'paid' });
    const items = plan.days.flatMap((d) => d.items).filter((r) => !r.past && !r.held);
    if (!items.length) return { count: 0 };
    return { count: items.length, from: items[0].day, to: items[items.length - 1].day };
  }, [batch, events, isLep]);

  const remindersRow = {
    key: 'reminders',
    state: state === 'on' ? 'ok' : 'todo',
    text: state === 'on' ? 'Automatic reminders are on' : state === 'paused' ? 'Automatic reminders are paused' : 'Automatic reminders are off',
  };

  return (
    <View style={{ marginTop: 12, borderWidth: 1, borderColor: A.line, borderRadius: 12, padding: 12, backgroundColor: '#FFFEF8' }}>
      <T size={13} weight="bold" style={{ marginBottom: 6 }}>
        {state === 'on' ? 'Reminders' : 'Ready for reminders?'}
      </T>
      {[...checks, remindersRow].map((c) => (
        <View key={c.key} style={{ flexDirection: 'row', alignItems: 'center', paddingVertical: 4, flexWrap: 'wrap' }}>
          <T size={13} style={{ width: 24 }}>{MARK[c.state]}</T>
          <T size={13} color={COLOR[c.state] === A.muted ? A.ink : COLOR[c.state]} style={{ flex: 1, minWidth: 220 }}>
            {c.text}
          </T>
          {c.fix && c.state !== 'ok' && canEdit ? (
            <Btn label={c.fixLabel} kind="ghost" small onPress={() => onOpenTab(c.fix)} />
          ) : null}
        </View>
      ))}

      {canEdit ? (
        confirm ? (
          <View style={{ marginTop: 10, backgroundColor: confirm === 'start' ? '#E3F1EA' : '#FFF4D6', borderRadius: 10, padding: 12 }}>
            <T size={13} weight="semibold">
              {confirm === 'start' ? `Start automatic reminders for “${batch.name}”?` : `Pause automatic reminders for “${batch.name}”?`}
            </T>
            <T size={12} color={A.ink} style={{ marginTop: 4, lineHeight: 18 }}>
              {confirm === 'start'
                ? upcoming?.count
                  ? `A full-paid learner gets ${upcoming.count} reminders between ${upcoming.from} and ${upcoming.to}. Every one is on the Messages tab. New learners can also pick this batch when they sign up.`
                  : 'Learners get the reminders on the Messages tab as their dates come. New learners can also pick this batch when they sign up.'
                : 'Learners stop getting automatic reminders for this batch until you start them again. Messages you scheduled yourself on the Messages tab still go. Learners can still see and pick the batch.'}
            </T>
            <View style={{ flexDirection: 'row', marginTop: 10 }}>
              <Btn
                label={confirm === 'start' ? 'Yes, start reminders' : 'Yes, pause reminders'}
                small
                loading={busy}
                onPress={async () => {
                  await (confirm === 'start' ? onStart() : onPause());
                  setConfirm(null);
                }}
              />
              <Btn label="Cancel" kind="ghost" small style={{ marginLeft: 8 }} onPress={() => setConfirm(null)} />
            </View>
          </View>
        ) : state === 'on' ? (
          <Btn label="Pause reminders" kind="ghost" small style={{ marginTop: 8, alignSelf: 'flex-start' }} onPress={() => setConfirm('pause')} />
        ) : (
          <View style={{ marginTop: 8 }}>
            <Btn
              label={state === 'paused' ? 'Start reminders again' : 'Start automatic reminders'}
              small
              disabled={!ready}
              style={{ alignSelf: 'flex-start' }}
              onPress={() => setConfirm('start')}
            />
            {!ready ? (
              <T size={11} color={A.muted} style={{ marginTop: 4 }}>
                Fix the ❌ items above first.
              </T>
            ) : null}
          </View>
        )
      ) : null}
    </View>
  );
}

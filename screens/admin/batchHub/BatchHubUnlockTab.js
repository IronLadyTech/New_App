import React, { useEffect, useState } from 'react';
import { View } from 'react-native';
import { coursePhases } from '../../../constants/programCourseSlice';
import { saveBatchFields } from '../../../services/cms';
import { customOpenDate, phaseFlowFromBatch, phaseGate, phaseOpensOn, standardOpensOn } from '../../../utils/phaseUnlock';
import { lepFlowContextFromBatch } from '../../../utils/lepFlowGates';
import { todayIsoIST } from '../../../utils/lepDailyPractice';
import { A, Btn, Card, Notice, Row, T } from '../adminUi';
import { DateInput, FieldLabel, Pill } from './cmsBits';

function niceDay(iso) {
  const d = iso ? new Date(`${iso}T12:00:00`) : null;
  return d && !Number.isNaN(d.getTime()) ? d.toLocaleDateString('en-IN', { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' }) : '';
}

/**
 * When each part of the journey opens for this batch — and the CX switches to
 * open a part early or hold it back. Payment rules always still apply.
 */
export default function BatchHubUnlockTab({ batch, programId, learner = 'all', canEdit }) {
  const [start, setStart] = useState('');
  const [msg, setMsg] = useState(null);
  const [busy, setBusy] = useState(null);
  const [dating, setDating] = useState(null);
  const [pickedDate, setPickedDate] = useState('');

  useEffect(() => setStart(String(batch?.startDate || '').slice(0, 10)), [batch?.id, batch?.startDate]);

  if (!batch?.id) return <Notice tone="neutral">Pick a batch at the top to see when each part opens.</Notice>;

  const today = todayIsoIST();
  const isLep = programId === 'lep';
  const flow = isLep
    ? { ...lepFlowContextFromBatch({ cmsBatch: batch }), todayIso: today }
    : phaseFlowFromBatch(programId, batch, today);
  const hasDates = isLep ? !!flow.day1Iso : !!flow.startIso;
  const overrides = batch.phaseOverrides || {};
  const partPaid = learner === 'register';

  /**
   * Plain-words confirmation before anything changes for learners, then save.
   * `normalOn` is the usual unlock date, so the message can say what moves.
   */
  const setOverride = async (phase, value, normalOn) => {
    const phaseId = phase.id;
    const who = `everyone in “${batch.name}”`;
    const question =
      value === 'open'
        ? `Unlock “${phase.title}” now?\n\n${who} will see its tasks today${normalOn ? ` instead of ${niceDay(normalOn)}` : ''}.`
        : value === 'locked'
          ? `Keep “${phase.title}” locked?\n\n${who} will NOT see its tasks, even after ${normalOn ? niceDay(normalOn) : 'its normal date'}, until you unlock it again.`
          : value
            ? `Unlock “${phase.title}” on ${niceDay(value)}?\n\n${who} will see its tasks from that day${normalOn ? ` (normally ${niceDay(normalOn)})` : ''}.`
            : `Use the normal date for “${phase.title}”?\n\nIt will unlock ${normalOn ? `on ${niceDay(normalOn)}` : 'as the program plan says'}.`;
    if (typeof window !== 'undefined' && !window.confirm(`${question}\n\nPart-paid learners still need to complete enrollment.`)) return;
    setBusy(phaseId);
    setMsg(null);
    try {
      const next = { ...overrides };
      if (value) next[phaseId] = value;
      else delete next[phaseId];
      await saveBatchFields(batch.id, { phaseOverrides: next });
      setMsg({
        tone: 'ok',
        text:
          value === 'open'
            ? `“${phase.title}” is unlocked now for this batch.`
            : value === 'locked'
              ? `“${phase.title}” stays locked for this batch until you unlock it.`
              : value
                ? `“${phase.title}” will unlock on ${niceDay(value)} for this batch.`
                : `“${phase.title}” is back on its normal date.`,
      });
      setDating(null);
    } catch (e) {
      setMsg({ tone: 'error', text: e?.message || 'Could not save. Try again.' });
    } finally {
      setBusy(null);
    }
  };

  const saveStart = async () => {
    setBusy('start');
    try {
      await saveBatchFields(batch.id, { startDate: start || '' });
      setMsg({ tone: 'ok', text: start ? `Start date saved — phases now open by week from ${niceDay(start)}.` : 'Start date cleared.' });
    } catch (e) {
      setMsg({ tone: 'error', text: e?.message || 'Could not save. Try again.' });
    } finally {
      setBusy(null);
    }
  };

  return (
    <View>
      {msg ? <Notice tone={msg.tone}>{msg.text}</Notice> : null}

      {!isLep ? (
        <Card style={{ marginBottom: 12, padding: 14 }}>
          <FieldLabel>Cohort start date (Week 1)</FieldLabel>
          <Row gap={8} style={{ alignItems: 'center', flexWrap: 'wrap' }}>
            <View style={{ width: 220 }}>
              <DateInput value={start} onChange={setStart} />
            </View>
            {canEdit ? <Btn label="Save start date" small loading={busy === 'start'} onPress={saveStart} /> : null}
          </Row>
          <T size={12} color={A.muted} style={{ marginTop: 6 }}>
            {flow.startIso
              ? `Week 1 starts ${niceDay(flow.startIso)}${batch.startDate ? '' : ' (read from the Zoho batch)'}. Each phase opens on the first day of its week, shown below.`
              : 'No start date yet, so every phase opens as soon as a learner pays in full. Set the date to open phases week by week.'}
          </T>
        </Card>
      ) : !hasDates ? (
        <Notice tone="error">This batch has no Day 1 date, so only Pre-Program and Orientation are open. Set the Orientation date under Batch setup.</Notice>
      ) : null}

      <T size={12} color={A.muted} style={{ marginBottom: 8 }}>
        {partPaid
          ? 'Showing a part-paid learner: only the parts open before full enrollment can unlock for her, whatever the date.'
          : 'Each part of the journey unlocks by itself on its date. You can unlock a part early, keep it locked, or pick another date — for everyone in this batch.'}
      </T>

      {coursePhases(programId).map((phase) => {
        const gate = phaseGate(phase, { enrolled: !partPaid, flow });
        const opensOn = phaseOpensOn(phase.id, flow);
        const standard = standardOpensOn(phase.id, flow);
        const chosen = customOpenDate(phase.id, flow);
        const override = overrides[phase.id];
        let status;
        if (gate.reason === 'payment') status = { label: '🔒 After full enrollment', tone: 'lock' };
        else if (override === 'open') status = { label: 'Unlocked early by you', tone: 'warn' };
        else if (override === 'locked') status = { label: 'Kept locked by you', tone: 'miss' };
        else if (chosen) status = { label: gate.open ? 'Unlocked (date picked by you)' : `Unlocks ${niceDay(chosen)} (date picked by you)`, tone: 'warn' };
        else if (gate.open) status = { label: 'Unlocked', tone: 'ok' };
        else status = { label: `Unlocks ${niceDay(opensOn)}`, tone: 'neutral' };
        return (
          <Card key={phase.id} style={{ marginBottom: 8, padding: 12 }}>
            <Row gap={10} style={{ alignItems: 'center', flexWrap: 'wrap' }}>
              <View style={{ flex: 1, minWidth: 220 }}>
                <T size={14} weight="semibold">{phase.title}</T>
                <T size={12} color={A.muted}>
                  {standard ? `Calendar date: ${niceDay(standard)}` : phase.openRegistered ? 'Open from the start' : 'Opens on full enrollment'}
                  {chosen ? ` · changed to ${niceDay(chosen)}` : ''}
                  {phase.sub ? ` · ${phase.sub}` : ''}
                </T>
              </View>
              <Pill label={status.label} tone={status.tone} />
              {canEdit ? (
                <Row gap={6}>
                  {override !== 'open' && !gate.open ? (
                    <Btn label="Unlock now for this batch" kind="ghost" small loading={busy === phase.id} onPress={() => setOverride(phase, 'open', standard)} />
                  ) : null}
                  {override !== 'locked' && gate.open ? (
                    <Btn label="Keep locked" kind="ghost" small loading={busy === phase.id} onPress={() => setOverride(phase, 'locked', standard)} />
                  ) : null}
                  {gate.reason !== 'payment' ? (
                    <Btn
                      label="Unlock on a different date"
                      kind="ghost"
                      small
                      onPress={() => {
                        setDating(dating === phase.id ? null : phase.id);
                        setPickedDate(chosen || opensOn || '');
                      }}
                    />
                  ) : null}
                  {override ? (
                    <Btn label="Use the normal date" kind="ghost" small loading={busy === phase.id} onPress={() => setOverride(phase, null, standard)} />
                  ) : null}
                </Row>
              ) : null}
            </Row>
            {dating === phase.id ? (
              <Row gap={8} style={{ marginTop: 10, alignItems: 'center', flexWrap: 'wrap', backgroundColor: '#FFFEF8', borderRadius: 10, padding: 10 }}>
                <T size={13}>Unlock {phase.title} on</T>
                <View style={{ width: 190 }}>
                  <DateInput value={pickedDate} onChange={setPickedDate} />
                </View>
                <Btn label="Save date" small loading={busy === phase.id} disabled={!pickedDate} onPress={() => setOverride(phase, pickedDate, standard)} />
                <Btn label="Cancel" kind="ghost" small onPress={() => setDating(null)} />
                <T size={11} color={A.muted} style={{ width: '100%' }}>
                  It unlocks at the start of that day (India time) for everyone in this batch. To change a live session’s time, use Session calendar.
                </T>
              </Row>
            ) : null}
          </Card>
        );
      })}
    </View>
  );
}

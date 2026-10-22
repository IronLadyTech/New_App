import React, { useEffect, useState } from 'react';
import { View } from 'react-native';
import { coursePhases } from '../../../constants/programCourseSlice';
import { saveBatchFields } from '../../../services/cms';
import { phaseFlowFromBatch, phaseGate, phaseOpensOn } from '../../../utils/phaseUnlock';
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

  const setOverride = async (phaseId, value) => {
    setBusy(phaseId);
    setMsg(null);
    try {
      const next = { ...overrides };
      if (value) next[phaseId] = value;
      else delete next[phaseId];
      await saveBatchFields(batch.id, { phaseOverrides: next });
      setMsg({ tone: 'ok', text: value === 'open' ? 'Opened now for this batch.' : value === 'locked' ? 'Held back for this batch.' : 'Back to the calendar date.' });
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
          ? 'Showing a part-paid learner: only the parts open to her before full enrollment can open, whatever the date.'
          : 'A part opens when its date comes. Open it early or hold it back for this whole batch — payment rules still apply.'}
      </T>

      {coursePhases(programId).map((phase) => {
        const gate = phaseGate(phase, { enrolled: !partPaid, flow });
        const opensOn = phaseOpensOn(phase.id, flow);
        const override = overrides[phase.id];
        let status;
        if (gate.reason === 'payment') status = { label: '🔒 After full enrollment', tone: 'lock' };
        else if (override === 'open') status = { label: 'Opened early by CX', tone: 'warn' };
        else if (override === 'locked') status = { label: 'Held back by CX', tone: 'miss' };
        else if (gate.open) status = { label: 'Open', tone: 'ok' };
        else status = { label: `Opens ${niceDay(opensOn)}`, tone: 'neutral' };
        return (
          <Card key={phase.id} style={{ marginBottom: 8, padding: 12 }}>
            <Row gap={10} style={{ alignItems: 'center', flexWrap: 'wrap' }}>
              <View style={{ flex: 1, minWidth: 220 }}>
                <T size={14} weight="semibold">{phase.title}</T>
                <T size={12} color={A.muted}>
                  {opensOn ? `Calendar date: ${niceDay(opensOn)}` : phase.openRegistered ? 'Open from the start' : 'Opens on full enrollment'}
                  {phase.sub ? ` · ${phase.sub}` : ''}
                </T>
              </View>
              <Pill label={status.label} tone={status.tone} />
              {canEdit ? (
                <Row gap={6}>
                  {override !== 'open' && !gate.open ? (
                    <Btn label="Open now" kind="ghost" small loading={busy === phase.id} onPress={() => setOverride(phase.id, 'open')} />
                  ) : null}
                  {override !== 'locked' && gate.open ? (
                    <Btn label="Hold back" kind="ghost" small loading={busy === phase.id} onPress={() => setOverride(phase.id, 'locked')} />
                  ) : null}
                  {override ? (
                    <Btn label="Follow the calendar" kind="ghost" small loading={busy === phase.id} onPress={() => setOverride(phase.id, null)} />
                  ) : null}
                </Row>
              ) : null}
            </Row>
          </Card>
        );
      })}
    </View>
  );
}

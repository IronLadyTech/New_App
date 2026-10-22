import React, { useEffect, useMemo, useState } from 'react';
import { View } from 'react-native';
import { saveBatch } from '../../../services/cms';
import { fetchZohoLepBatchKeys } from '../../../services/zohoLepBatches';
import { LEP_TIMEZONE } from '../../../constants/lepSessionTemplate';
import { suggestLmsGroupId } from '../../../utils/cmsBatchLabel';
import { formatZohoLepBatchLabel, inferLepDay1FromZohoRaw } from '../../../utils/lepDeskBatchDate';
import { buildLepBatchSessions, day1FromOrientationThursday, orientationFromDay1Saturday } from '../../../utils/lepBatchSchedule';
import { A, Btn, Card, Input, Notice, Row, Select, T } from '../adminUi';
import { DateInput, FieldLabel } from './cmsBits';

const STEPS = ['Pick the batch', 'Orientation date', 'Zoom links', 'Done'];

function nice(iso) {
  if (!iso) return '';
  const d = new Date(`${String(iso).slice(0, 10)}T12:00:00`);
  return Number.isNaN(d.getTime()) ? iso : d.toLocaleDateString('en-IN', { weekday: 'short', day: 'numeric', month: 'short' });
}

/**
 * New LEP batch in four plain steps: pick it from Zoho, confirm the Orientation
 * date (every session date follows), add Zoom links, done. Links to its learners
 * automatically — nobody types an id.
 */
export default function BatchSetupWizard({ batches, onCreated, onClose }) {
  const [step, setStep] = useState(0);
  const [keys, setKeys] = useState(null);
  const [loadError, setLoadError] = useState(null);
  const [zohoKey, setZohoKey] = useState('');
  const [manualName, setManualName] = useState('');
  const [orientation, setOrientation] = useState('');
  const [links, setLinks] = useState({});
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState(null);
  const [createdId, setCreatedId] = useState(null);

  useEffect(() => {
    fetchZohoLepBatchKeys()
      .then((list) => setKeys(list || []))
      .catch((e) => {
        setKeys([]);
        setLoadError(e?.message || 'Could not load the Zoho list.');
      });
  }, []);

  const taken = useMemo(() => new Set((batches || []).map((b) => String(b.zohoBatchKey || '').trim()).filter(Boolean)), [batches]);
  const options = (keys || []).filter((k) => k && !String(k).includes('$'));
  const existing = zohoKey ? (batches || []).find((b) => String(b.zohoBatchKey || '').trim() === zohoKey) : null;

  const name = zohoKey ? formatZohoLepBatchLabel(zohoKey) || zohoKey : manualName.trim();
  const day1 = orientation ? day1FromOrientationThursday(orientation) : '';
  const sessions = useMemo(
    () => (orientation ? buildLepBatchSessions({ anchor: 'orientation', date: orientation, joinLinks: links }) : []),
    [orientation, links]
  );
  const graduation = sessions.find((s) => s.code === 'S8');

  const pickBatch = (key) => {
    setZohoKey(key);
    setError(null);
    const inferredDay1 = key ? inferLepDay1FromZohoRaw(key) : '';
    if (inferredDay1) setOrientation(orientationFromDay1Saturday(inferredDay1));
  };

  const save = async () => {
    setBusy(true);
    setError(null);
    try {
      const id = await saveBatch({
        name,
        program: 'LEP',
        orientationDate: orientation,
        day1Date: day1,
        timezone: LEP_TIMEZONE,
        sessions,
        notes: '',
        zohoBatchKey: zohoKey,
        lmsGroupId: suggestLmsGroupId({ program: 'LEP', zohoBatchKey: zohoKey || name }) || '',
        openForEnrollment: true,
        filling: false,
        status: 'draft',
        automationEnabled: false,
      });
      setCreatedId(id);
      setStep(3);
    } catch (e) {
      setError(e?.message || 'Could not save the batch. Try again.');
    } finally {
      setBusy(false);
    }
  };

  return (
    <Card style={{ marginBottom: 16, padding: 16, borderColor: A.red }}>
      <Row gap={8} style={{ flexWrap: 'wrap', marginBottom: 14 }}>
        {STEPS.map((label, i) => (
          <View
            key={label}
            style={{
              flex: 1,
              minWidth: 130,
              borderRadius: 12,
              padding: 10,
              backgroundColor: i < step ? '#E3F4EA' : '#fff',
              borderWidth: 1,
              borderColor: i === step ? A.red : i < step ? 'transparent' : A.line,
            }}
          >
            <T size={10} weight="bold" color={A.muted} style={{ textTransform: 'uppercase', letterSpacing: 0.6 }}>Step {i + 1}</T>
            <T size={13} weight="semibold" color={i < step ? A.ok : A.ink}>{i < step ? '✓ ' : ''}{label}</T>
          </View>
        ))}
      </Row>
      {error ? <Notice tone="error">{error}</Notice> : null}

      {step === 0 ? (
        <View>
          <FieldLabel>Which batch is starting?</FieldLabel>
          {keys === null ? (
            <T color={A.muted}>Loading the batch list from Zoho…</T>
          ) : options.length ? (
            <Select
              value={zohoKey}
              onChange={pickBatch}
              options={[
                { value: '', label: 'Choose a batch…' },
                ...options.map((k) => ({ value: k, label: `${formatZohoLepBatchLabel(k) || k}${taken.has(String(k).trim()) ? ' · already set up' : ''}` })),
              ]}
            />
          ) : (
            <>
              <Notice tone="neutral">{loadError ? `${loadError} ` : ''}Type the batch name instead.</Notice>
              <Input value={manualName} onChangeText={setManualName} placeholder="e.g. LEP · Orientation Thu 29 Oct" />
            </>
          )}
          <T size={12} color={A.muted} style={{ marginTop: 6 }}>Linking the batch to its learners happens by itself.</T>
          {existing ? (
            <Notice tone="neutral">This batch is already set up. Close this and pick it from the Batch list at the top.</Notice>
          ) : null}
          <Row gap={8} style={{ marginTop: 14 }}>
            <Btn label="Next" onPress={() => setStep(1)} disabled={!name || !!existing} />
            <Btn label="Cancel" kind="ghost" onPress={onClose} />
          </Row>
        </View>
      ) : null}

      {step === 1 ? (
        <View>
          <FieldLabel>Orientation date (a Thursday)</FieldLabel>
          <View style={{ maxWidth: 260 }}>
            <DateInput value={orientation} onChange={setOrientation} />
          </View>
          {orientation ? (
            new Date(`${orientation}T12:00:00`).getDay() !== 4 ? (
              <Notice tone="error">That date is a {new Date(`${orientation}T12:00:00`).toLocaleDateString('en-IN', { weekday: 'long' })}. Orientation is on a Thursday.</Notice>
            ) : (
              <Notice tone="ok">
                ✓ Day 1 is {nice(day1)}, Day 2 {nice(sessions.find((s) => s.code === 'S2')?.date)}
                {graduation ? `, Graduation ${nice(graduation.date)}` : ''}. All {sessions.length} session dates are filled in.
              </Notice>
            )
          ) : null}
          <Row gap={8} style={{ marginTop: 14 }}>
            <Btn label="Back" kind="ghost" onPress={() => setStep(0)} />
            <Btn label="Next" onPress={() => setStep(2)} disabled={!orientation || new Date(`${orientation}T12:00:00`).getDay() !== 4} />
          </Row>
        </View>
      ) : null}

      {step === 2 ? (
        <View>
          <T size={12} color={A.muted} style={{ marginBottom: 10 }}>Paste the Zoom link for each session. You can also add them later.</T>
          {sessions.map((s) => (
            <Row key={s.code} gap={10} style={{ marginBottom: 8, alignItems: 'center', flexWrap: 'wrap' }}>
              <View style={{ width: 260 }}>
                <T size={13} weight="semibold">{s.title}</T>
                <T size={12} color={A.muted}>{nice(s.date)} · {s.startTime}</T>
              </View>
              <View style={{ flex: 1, minWidth: 220 }}>
                <Input
                  value={links[s.code] || ''}
                  onChangeText={(v) => setLinks((l) => ({ ...l, [s.code]: v }))}
                  placeholder="Zoom link"
                  autoCapitalize="none"
                />
              </View>
            </Row>
          ))}
          <Row gap={8} style={{ marginTop: 14 }}>
            <Btn label="Back" kind="ghost" onPress={() => setStep(1)} />
            <Btn label="Save batch" onPress={save} loading={busy} />
          </Row>
        </View>
      ) : null}

      {step === 3 ? (
        <View>
          <Notice tone="ok">✓ “{name}” is ready. Its dates are set and it is linked to its learners.</Notice>
          <T style={{ marginBottom: 12 }}>
            Last step: when the dates and Zoom links look right, press <T weight="semibold">Start automatic reminders</T> at the top.
          </T>
          <Row gap={8}>
            <Btn label="Open this batch" onPress={() => onCreated?.(createdId)} />
            <Btn label="Close" kind="ghost" onPress={onClose} />
          </Row>
        </View>
      ) : null}
    </Card>
  );
}

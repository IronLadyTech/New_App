import React, { useEffect, useState } from 'react';
import { ScrollView, View } from 'react-native';
import { CMS_CONFIG_DOCS, DEFAULT_IL_GUIDE_CONFIG, PROGRAMS } from '../../constants/cms';
import { saveConfig, subscribeToConfig } from '../../services/cms';
import { A, Btn, Card, Col, Field, H, Input, Notice, Row, T, Toggle } from './adminUi';
import { CemHelpCard } from './AdminSectionGuide';

const JOB_LABELS = {
  onboard: 'Onboarding welcome (first login)',
  nudge: 'Progress nudge / quotation',
  recommend: 'Recommend next lesson',
  event: 'Announce upcoming event',
};
const SURFACE_LABELS = { onboard: 'First-login card', home: 'Home', learn: 'Learn', community: 'Community' };

function merge(saved) {
  const d = DEFAULT_IL_GUIDE_CONFIG;
  if (!saved) return d;
  return {
    ...d,
    ...saved,
    jobs: { ...d.jobs, ...saved.jobs },
    surfaces: { ...d.surfaces, ...saved.surfaces },
    programNotes: { ...d.programNotes, ...saved.programNotes },
    quotations: saved.quotations?.length ? saved.quotations : d.quotations,
  };
}

export default function ILGuideAdmin({ canEdit }) {
  const [saved, setSaved] = useState(null);
  const [cfg, setCfg] = useState(DEFAULT_IL_GUIDE_CONFIG);
  const [msg, setMsg] = useState(null);
  const [saving, setSaving] = useState(false);
  const ro = !canEdit;

  useEffect(
    () =>
      subscribeToConfig(
        CMS_CONFIG_DOCS.IL_GUIDE,
        (d) => {
          setSaved(d);
          setCfg(merge(d));
        },
        (e) => setMsg({ tone: 'error', text: e.message })
      ),
    []
  );

  const set = (k) => (v) => setCfg((c) => ({ ...c, [k]: v }));
  const setIn = (group, k) => (v) => setCfg((c) => ({ ...c, [group]: { ...c[group], [k]: v } }));
  const setQuote = (i, k) => (v) =>
    setCfg((c) => ({ ...c, quotations: c.quotations.map((q, j) => (j === i ? { ...q, [k]: v } : q)) }));

  const save = async () => {
    const t = Number(cfg.temperature);
    if (Number.isNaN(t) || t < 0 || t > 1.2) {
      setMsg({ tone: 'error', text: 'Creativity must be between 0 and 1.2.' });
      return;
    }
    const quotations = cfg.quotations
      .map((q) => ({ ...q, text: q.text.trim(), author: q.author.trim() }))
      .filter((q) => q.text && q.author);
    setSaving(true);
    try {
      await saveConfig(CMS_CONFIG_DOCS.IL_GUIDE, {
        ...cfg,
        temperature: t,
        maxSentences: Math.min(5, Math.max(1, Number(cfg.maxSentences) || 3)),
        quotations,
      });
      setMsg({ tone: 'ok', text: 'IL Guide settings saved. The app and API pick them up within a minute.' });
    } catch (e) {
      setMsg({ tone: 'error', text: e.message });
    } finally {
      setSaving(false);
    }
  };

  return (
    <ScrollView style={{ flex: 1 }} contentContainerStyle={{ padding: 28, maxWidth: 980 }}>
      <Row style={{ alignItems: 'center', justifyContent: 'space-between', marginBottom: 6 }}>
        <H>IL Guide coach</H>
        {canEdit ? <Btn label="Save changes" onPress={save} loading={saving} /> : null}
      </Row>
      <T color={A.muted} style={{ marginBottom: 12, maxWidth: 720 }}>
        A single short line on Home, Learn and Community — encouragement and next steps, not push alerts.
      </T>
      <CemHelpCard sectionKey="ilguide" />
      {!saved ? <Notice>Showing defaults — nothing saved yet.</Notice> : null}
      {msg ? <Notice tone={msg.tone}>{msg.text}</Notice> : null}

      <Card style={{ marginBottom: 16 }}>
        <Toggle label="IL Guide is on" value={cfg.enabled} onChange={set('enabled')} disabled={ro} />
        <T size={13} color={A.muted}>
          Turning it off hides the whisper card everywhere in the app.
        </T>
      </Card>

      <Row style={{ marginBottom: 16 }}>
        <Col min={300}>
          <Card style={{ height: '100%' }}>
            <T weight="bold" style={{ marginBottom: 10 }}>
              What it does
            </T>
            {Object.keys(JOB_LABELS).map((k) => (
              <Toggle key={k} label={JOB_LABELS[k]} value={cfg.jobs[k]} onChange={setIn('jobs', k)} disabled={ro} />
            ))}
          </Card>
        </Col>
        <Col min={300}>
          <Card style={{ height: '100%' }}>
            <T weight="bold" style={{ marginBottom: 10 }}>
              Where it shows
            </T>
            {Object.keys(SURFACE_LABELS).map((k) => (
              <Toggle key={k} label={SURFACE_LABELS[k]} value={cfg.surfaces[k]} onChange={setIn('surfaces', k)} disabled={ro} />
            ))}
          </Card>
        </Col>
      </Row>

      <Card style={{ marginBottom: 16 }}>
        <T weight="bold" style={{ marginBottom: 10 }}>
          Voice
        </T>
        <Row>
          <Col min={180}>
            <Field label="Model" hint="OpenAI model the API uses.">
              <Input value={cfg.model} onChangeText={set('model')} editable={!ro} />
            </Field>
          </Col>
          <Col min={140}>
            <Field label="Creativity" hint="0 = steady, 1 = varied. Default 0.7.">
              <Input value={cfg.temperature} onChangeText={set('temperature')} editable={!ro} />
            </Field>
          </Col>
          <Col min={140}>
            <Field label="Max sentences" hint="1–5.">
              <Input value={cfg.maxSentences} onChangeText={set('maxSentences')} editable={!ro} />
            </Field>
          </Col>
          <Col min={200}>
            <Field label="Curated with" hint="Staff names it credits, e.g. “curated with Rajesh”.">
              <Input value={cfg.curatorNames} onChangeText={set('curatorNames')} editable={!ro} />
            </Field>
          </Col>
        </Row>
        <Field
          label="Extra instructions"
          hint="Added after the fixed rules. Use for tone or focus, e.g. “This month, push the 5 Rituals check-in.” It cannot override the never-do list."
        >
          <Input value={cfg.extraInstructions} onChangeText={set('extraInstructions')} multiline rows={4} editable={!ro} />
        </Field>
      </Card>

      <Card style={{ marginBottom: 16 }}>
        <T weight="bold" style={{ marginBottom: 4 }}>
          Program notes
        </T>
        <T size={13} color={A.muted} style={{ marginBottom: 12 }}>
          Facts IL Guide may use for each program (what to emphasise this batch, key dates). It will not invent
          anything beyond these.
        </T>
        {PROGRAMS.map((p) => (
          <Field key={p} label={p}>
            <Input value={cfg.programNotes[p]} onChangeText={setIn('programNotes', p)} multiline rows={2} editable={!ro} />
          </Field>
        ))}
      </Card>

      <Card>
        <Row style={{ alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
          <T weight="bold">Approved quotations</T>
          {canEdit ? (
            <Btn
              small
              kind="ghost"
              label="Add quotation"
              onPress={() =>
                set('quotations')([...cfg.quotations, { id: `q${Date.now()}`, text: '', author: '', active: true }])
              }
            />
          ) : null}
        </Row>
        <T size={13} color={A.muted} style={{ marginBottom: 12 }}>
          IL Guide only quotes from this list. Check the wording and author before adding.
        </T>
        {cfg.quotations.map((q, i) => (
          <View key={q.id} style={{ borderTopWidth: i ? 1 : 0, borderTopColor: A.line, paddingTop: i ? 12 : 0, marginBottom: 12 }}>
            <Row style={{ alignItems: 'flex-start' }}>
              <Col min={280} flex={2}>
                <Input value={q.text} onChangeText={setQuote(i, 'text')} placeholder="Quotation" multiline rows={2} editable={!ro} />
              </Col>
              <Col min={160}>
                <Input value={q.author} onChangeText={setQuote(i, 'author')} placeholder="Author" editable={!ro} />
              </Col>
              <Toggle label="Use" value={q.active !== false} onChange={setQuote(i, 'active')} disabled={ro} />
              {canEdit ? (
                <Btn
                  small
                  kind="danger"
                  label="Remove"
                  onPress={() => set('quotations')(cfg.quotations.filter((_, j) => j !== i))}
                />
              ) : null}
            </Row>
          </View>
        ))}
      </Card>
    </ScrollView>
  );
}

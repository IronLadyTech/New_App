import React, { useEffect, useMemo, useState } from 'react';
import { ScrollView, View } from 'react-native';
import Pressable from '../../components/il/Press';
import {
  importCmsBatchesFromLmsGroups,
  importCmsBatchesFromZohoBatchKeys,
  subscribeToBatches,
  subscribeToContent,
  subscribeToEvents,
  saveBatch,
  ensureCmsQaTestPack,
} from '../../services/cms';
import { CMS_QA_BATCH_ID } from '../../constants/cms';
import { fetchLepGroups } from '../../services/lmsGroups';
import { fetchZohoLepBatchKeys } from '../../services/zohoLepBatches';
import { formatBatchPickerLabel } from '../../utils/cmsBatchLabel';
import { describeBatchAnchor } from '../../utils/lepBatchSchedule';
import BatchCalendarAdmin from './BatchCalendarAdmin';
import BatchHubMessagesTab from './batchHub/BatchHubMessagesTab';
import BatchHubContentTab from './batchHub/BatchHubContentTab';
import BatchHubPracticeTab from './batchHub/BatchHubPracticeTab';
import { A, Btn, Card, Field, H, Input, Notice, Row, Select, T } from './adminUi';
import { CemHelpCard } from './AdminSectionGuide';

const TABS = [
  { key: 'messages', label: 'Messages' },
  { key: 'content', label: 'Content' },
  { key: 'practice', label: 'Practice' },
  { key: 'setup', label: 'Setup' },
];

export default function BatchHubAdmin({ canEdit, onOpenTemplates }) {
  const [batches, setBatches] = useState([]);
  const [batchId, setBatchId] = useState('');
  const [tab, setTab] = useState('messages');
  const [events, setEvents] = useState([]);
  const [content, setContent] = useState([]);
  const [msg, setMsg] = useState(null);
  const [busy, setBusy] = useState(false);
  const [qaPhone, setQaPhone] = useState('8309882198');

  useEffect(
    () =>
      subscribeToBatches(setBatches, (e) =>
        setMsg({ tone: 'error', text: e?.message || 'Could not load batches.' })
      ),
    []
  );

  useEffect(() => {
    if (!batches.length) setTab('setup');
  }, [batches.length]);
  useEffect(() => subscribeToEvents(setEvents, () => {}), []);
  useEffect(() => subscribeToContent(setContent, () => {}), []);

  useEffect(() => {
    if (!batchId && batches.length) setBatchId(batches[0].id);
  }, [batches, batchId]);

  const batch = useMemo(() => batches.find((b) => b.id === batchId), [batches, batchId]);

  const importFromZoho = async () => {
    if (!canEdit) return;
    setBusy(true);
    setMsg(null);
    try {
      const keys = await fetchZohoLepBatchKeys();
      if (!keys.length) {
        throw new Error('Zoho returned no LEP_Batch values. Check CRM field names on Cloud Functions.');
      }
      const { added, skipped } = await importCmsBatchesFromZohoBatchKeys(keys, batches);
      if (!added) {
        setMsg({
          tone: 'neutral',
          text: `All ${keys.length} Zoho batch(es) are already in CMS, or dates could not be parsed (${skipped} skipped).`,
        });
      } else {
        setMsg({
          tone: 'ok',
          text: `Imported ${added} from Zoho (${keys.length} unique LEP_Batch). Skipped ${skipped}. Review Setup → Zoom links.`,
        });
      }
    } catch (e) {
      const hint =
        e?.code === 'functions/not-found'
          ? ' Deploy Cloud Function cmsListLepBatchesFromZoho on lmsironlady (see docs/cloud-functions).'
          : '';
      setMsg({ tone: 'error', text: `${e.message || e}${hint}` });
    } finally {
      setBusy(false);
    }
  };

  const importFromLms = async () => {
    if (!canEdit) return;
    setBusy(true);
    setMsg(null);
    try {
      const groups = await fetchLepGroups();
      if (!groups.length) {
        throw new Error('No LEP batches in web LMS (groups). Sync from Zoho on lmsironlady first.');
      }
      const { added, skipped } = await importCmsBatchesFromLmsGroups(groups, batches);
      if (!added) {
        setMsg({
          tone: 'neutral',
          text: `Nothing new to import (${skipped} skipped — already in CMS or missing dates). Use Setup to create one manually.`,
        });
      } else {
        setMsg({
          tone: 'ok',
          text: `Imported ${added} batch(es). Skipped ${skipped}. Check dates and Zoom under Setup, then Go live.`,
        });
      }
    } catch (e) {
      setMsg({ tone: 'error', text: e.message });
    } finally {
      setBusy(false);
    }
  };

  const setupCmsQa = async () => {
    if (!canEdit) return;
    setBusy(true);
    setMsg(null);
    try {
      const { batchId, phone10 } = await ensureCmsQaTestPack(qaPhone);
      setBatchId(batchId);
      setMsg({
        tone: 'ok',
        text: `Live CMS QA batch ready (${batchId}). Phone +91${phone10} is enrolled as LEP registered (no Zoho). Deploy resolvePhoneAccess if you changed phoneAccess.js, then log in on the app.`,
      });
    } catch (e) {
      setMsg({ tone: 'error', text: e.message || String(e) });
    } finally {
      setBusy(false);
    }
  };

  const goLive = async () => {
    if (!batch?.id || !canEdit) return;
    const ok =
      typeof window !== 'undefined'
        ? window.confirm(
            `Go live for "${batch.name}"?\n\n• Learners on signup list can enroll\n• WELCOME / PAY fire on enroll when automation is on\n• Session reminders use this batch’s dates\n\nConfirm dates and Zoom links are correct.`
          )
        : true;
    if (!ok) return;
    setBusy(true);
    try {
      await saveBatch({
        ...batch,
        status: 'live',
        automationEnabled: true,
      });
      setMsg({ tone: 'ok', text: 'Batch is live.' });
    } catch (e) {
      setMsg({ tone: 'error', text: e.message });
    } finally {
      setBusy(false);
    }
  };

  return (
    <ScrollView style={{ flex: 1 }} contentContainerStyle={{ padding: 28 }}>
      <H style={{ marginBottom: 6 }}>LEP batch</H>
      <T color={A.muted} style={{ marginBottom: 12, maxWidth: 760 }}>
        Select a cohort first. Messages, content, and practice are scoped to that batch — like CX on the web LMS.
      </T>
      <CemHelpCard sectionKey="batchHub" />

      {canEdit ? (
        <Card style={{ marginBottom: 14, padding: 16 }}>
          <T size={13} weight="semibold" style={{ marginBottom: 6 }}>CMS QA test (no CRM)</T>
          <T size={12} color={A.muted} style={{ marginBottom: 10 }}>
            Creates live batch {CMS_QA_BATCH_ID} with full LEP v1.5 sessions and links this mobile for phone login
            (10 digits, no +91). Use when the number is not in Zoho.
          </T>
          <Field label="Mobile for QA">
            <Input value={qaPhone} onChangeText={setQaPhone} placeholder="8309882198" keyboardType="phone-pad" />
          </Field>
          <Btn label="Create / refresh QA batch + phone" onPress={setupCmsQa} loading={busy} small style={{ marginTop: 10 }} />
        </Card>
      ) : null}

      {msg ? <Notice tone={msg.tone}>{msg.text}</Notice> : null}

      {!batches.length ? (
        <Notice tone="neutral">
          This list is only Firestore cms_batches — not the Delivery Desk iframe. Click Import from Zoho to pull
          every unique LEP_Batch from CRM (same as the Desk), then fix Zoom links under Setup.
        </Notice>
      ) : null}

      <Row gap={12} style={{ marginBottom: 12, flexWrap: 'wrap', alignItems: 'flex-end' }}>
        <View style={{ minWidth: 260, flex: 1 }}>
          <T size={12} weight="semibold" style={{ marginBottom: 6 }}>Batch</T>
          <Select
            value={batchId || ''}
            onChange={setBatchId}
            options={[
              { value: '', label: batches.length ? 'Select batch…' : 'No batches — use Setup' },
              ...batches.map((b) => ({
                value: b.id,
                label: formatBatchPickerLabel(b),
              })),
            ]}
          />
        </View>
        {canEdit ? (
          <>
            <Btn
              label={batches.length ? 'Import from Zoho' : 'Import from Zoho (Delivery Desk)'}
              onPress={importFromZoho}
              loading={busy}
              small
            />
            <Btn label="Import from web LMS" kind="ghost" onPress={importFromLms} loading={busy} small />
          </>
        ) : null}
        {batch ? (
          <View>
            <StatusBadge status={batch.status} />
            {canEdit && batch.status !== 'live' ? (
              <Btn label="Go live" onPress={goLive} loading={busy} small style={{ marginTop: 8 }} />
            ) : null}
          </View>
        ) : null}
      </Row>

      {batch?.day1Date || batch?.lmsGroupId ? (
        <View style={{ marginBottom: 14 }}>
          {batch?.day1Date ? (
            <T size={12} color={A.muted}>{describeBatchAnchor(batch)}</T>
          ) : null}
          {batch?.lmsGroupId ? (
            <T size={11} color={A.muted} style={{ marginTop: batch?.day1Date ? 4 : 0 }}>
              Web LMS: {batch.lmsGroupId}
            </T>
          ) : null}
        </View>
      ) : null}

      <Row gap={6} style={{ marginBottom: 16, flexWrap: 'wrap' }}>
        {TABS.map((t) => (
          <Pressable key={t.key} onPress={() => setTab(t.key)}>
            <View
              style={{
                paddingHorizontal: 14,
                paddingVertical: 8,
                borderRadius: 8,
                backgroundColor: tab === t.key ? A.navy : A.chip,
              }}
            >
              <T size={13} weight={tab === t.key ? 'semibold' : 'regular'} color={tab === t.key ? '#fff' : A.ink}>
                {t.label}
              </T>
            </View>
          </Pressable>
        ))}
        {onOpenTemplates ? (
          <Pressable onPress={onOpenTemplates} style={{ marginLeft: 'auto' }}>
            <T size={12} color={A.navy} style={{ textDecorationLine: 'underline' }}>Program templates</T>
          </Pressable>
        ) : null}
      </Row>

      {tab === 'messages' ? (
        <BatchHubMessagesTab
          batch={batch}
          events={events}
          canEdit={canEdit}
          onEditTemplate={onOpenTemplates}
        />
      ) : null}
      {tab === 'content' ? (
        <BatchHubContentTab batch={batch} contentItems={content} canEdit={canEdit} onRefresh={() => {}} />
      ) : null}
      {tab === 'practice' ? <BatchHubPracticeTab batch={batch} /> : null}
      {tab === 'setup' ? (
        <Card style={{ padding: 0, overflow: 'hidden' }}>
          <BatchCalendarAdmin canEdit={canEdit} embed hubBatchId={batchId} onHubBatchChange={setBatchId} />
        </Card>
      ) : null}
    </ScrollView>
  );
}

function StatusBadge({ status }) {
  const live = status === 'live';
  return (
    <View
      style={{
        paddingHorizontal: 10,
        paddingVertical: 4,
        borderRadius: 6,
        backgroundColor: live ? '#E3F1EA' : '#F5F0E6',
      }}
    >
      <T size={11} weight="bold" color={live ? A.ok : A.muted}>{live ? 'LIVE' : 'DRAFT'}</T>
    </View>
  );
}

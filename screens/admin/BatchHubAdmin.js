import React, { useEffect, useMemo, useRef, useState } from 'react';
import { ScrollView, View } from 'react-native';
import Pressable from '../../components/il/Press';
import {
  importCmsBatchesFromLmsGroups,
  importCmsBatchesFromZohoBatchKeys,
  subscribeToBatches,
  subscribeToContent,
  backfillContentPublished,
  subscribeToEvents,
  saveBatch,
  ensureCmsQaTestPack,
  fetchBatchLearnerCounts,
  fetchProgramBatches,
  ensureCmsBatchForGroup,
  linkBatchToLmsGroup,
} from '../../services/cms';
import { matchLmsGroup } from '../../utils/matchLmsGroup';
import { CMS_QA_BATCH_ID } from '../../constants/cms';
import { fetchLepGroups } from '../../services/lmsGroups';
import { fetchZohoLepBatchKeys } from '../../services/zohoLepBatches';
import { formatBatchPickerLabel } from '../../utils/cmsBatchLabel';
import { describeBatchAnchor } from '../../utils/lepBatchSchedule';
import { inferLepDay1FromGroup, zohoLepBatchKeyFromDay1 } from '../../utils/lepDeskBatchDate';
import { resolveLearnerCmsBatch } from '../../utils/resolveLearnerCmsBatch';
import BatchCalendarAdmin from './BatchCalendarAdmin';
import BatchHubMessagesTab from './batchHub/BatchHubMessagesTab';
import BatchHubContentTab from './batchHub/BatchHubContentTab';
import BatchHubPracticeTab from './batchHub/BatchHubPracticeTab';
import BatchHubEngageTab from './batchHub/BatchHubEngageTab';
import AppPreview from './AppPreview';
import ReminderChecklist, { reminderState } from './batchHub/ReminderChecklist';
import BatchSetupWizard from './batchHub/BatchSetupWizard';
import ZohoSyncBar from './batchHub/ZohoSyncBar';
import BatchHubUnlockTab from './batchHub/BatchHubUnlockTab';
import BatchHubCalendarTab from './batchHub/BatchHubCalendarTab';
import { AppAnalyticsView } from './AnalyticsAdmin';
import { PROGRAMS } from '../../constants/programs';
import { A, Btn, Card, Field, H, Input, Notice, Row, Select, T } from './adminUi';

const TABS = [
  { key: 'content', label: 'Sessions & recordings' },
  { key: 'calendar', label: 'Session calendar' },
  { key: 'unlock', label: 'Unlock calendar' },
  { key: 'messages', label: 'Messages' },
  { key: 'engage', label: 'Engage' },
  { key: 'practice', label: 'Practice', lepOnly: true },
  { key: 'dashboard', label: 'Dashboard' },
  { key: 'setup', label: 'Batch setup' },
];

/** Who CX is looking at. Counts come from the batch's real learners. */
const WHO = [
  { value: 'all', label: 'All learners', sub: 'with the app, in this batch' },
  { value: 'register', label: 'Part paid', sub: 'registration paid' },
  { value: 'paid', label: 'Full paid', sub: 'fully enrolled' },
  { value: 'late', label: 'Late joiners', sub: 'joined after Orientation' },
];

const PROGRAM_OPTIONS = [
  { value: PROGRAMS.LEP, label: 'LEP · Leadership Essentials' },
  { value: PROGRAMS.BM100, label: '100BM · 100 Board Members' },
  { value: PROGRAMS.MBW, label: 'MBW · Master of Business Warfare' },
];

/** canEdit: batch dates, Zoom, content (CEM too). canManage: templates and deleting batches (PL/Admin). */
export default function BatchHubAdmin({ canEdit, canManage, isAdmin, onOpenTemplates }) {
  const [batches, setBatches] = useState([]);
  const [batchId, setBatchId] = useState('');
  const [tab, setTab] = useState('content');
  const [programId, setProgramId] = useState(PROGRAMS.LEP);
  const [learner, setLearner] = useState('all');
  const [counts, setCounts] = useState(null);
  const [showWizard, setShowWizard] = useState(false);
  const [lmsBatches, setLmsBatches] = useState(null);
  const [opening, setOpening] = useState(false);
  const [linkChoice, setLinkChoice] = useState('');
  const autoLinked = useRef(new Set());
  const [events, setEvents] = useState([]);
  const [content, setContent] = useState([]);
  const [msg, setMsg] = useState(null);
  const [busy, setBusy] = useState(false);
  const [qaPhone, setQaPhone] = useState('8309882198');
  // Where the phone preview opens: the item CX just saved, else the screen this tab edits.
  const [savedFocus, setSavedFocus] = useState(null);
  useEffect(() => setSavedFocus(null), [tab, batchId]);
  const previewFocus =
    savedFocus ||
    (tab === 'content' && programId === PROGRAMS.LEP
      ? { to: 'sessions' }
      : tab === 'engage'
        ? { to: 'engage' }
        : null);

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
    if (canEdit && content.length) backfillContentPublished(content).catch(() => {});
  }, [canEdit, content]);

  // Default to the newest batch of the chosen program.
  useEffect(() => {
    if (batchId) return;
    const first = batches.find((b) => String(b.program || 'LEP').toLowerCase() === programId);
    if (first) setBatchId(first.id);
  }, [batches, batchId, programId]);

  const batch = useMemo(() => batches.find((b) => b.id === batchId), [batches, batchId]);

  // Real batches for this program from the web LMS (synced from Zoho) — every program.
  const [syncTick, setSyncTick] = useState(0);
  useEffect(() => {
    let alive = true;
    setLmsBatches(null);
    fetchProgramBatches(programId)
      .then((rows) => alive && setLmsBatches(rows))
      .catch(() => alive && setLmsBatches([]));
    return () => {
      alive = false;
    };
  }, [programId, syncTick]);

  useEffect(() => {
    if (!lmsBatches?.length || !canEdit) return;
    const mine = batches.filter((b) => String(b.program || 'LEP').toLowerCase() === programId);
    const taken = new Set(mine.map((b) => String(b.lmsGroupId || '')).filter(Boolean));
    mine
      // The CMS QA test batch shares a real Day 1 (17 Oct) — it must never take a real group.
      .filter((b) => !b.lmsGroupId && b.id !== CMS_QA_BATCH_ID && !autoLinked.current.has(b.id))
      .forEach((b) => {
        autoLinked.current.add(b.id);
        const match = matchLmsGroup(b, lmsBatches, taken);
        if (!match) return;
        taken.add(match.id);
        linkBatchToLmsGroup(b.id, match.id).catch(() => autoLinked.current.delete(b.id));
      });
  }, [lmsBatches, batches, programId, canEdit]);

  const linkManually = async (groupId) => {
    if (!batch?.id || !groupId) return;
    try {
      await linkBatchToLmsGroup(batch.id, groupId);
      setLinkChoice('');
      setMsg({ tone: 'ok', text: 'Linked. Its learners, counts and reminders now follow this batch.' });
    } catch (e) {
      setMsg({ tone: 'error', text: e?.message || 'Could not link it. Try again.' });
    }
  };

  // Picking a real batch that is not set up yet sets it up (draft, reminders off).
  const pickBatch = async (value) => {
    if (!String(value).startsWith('lms:')) {
      setBatchId(value);
      return;
    }
    const group = (lmsBatches || []).find((g) => `lms:${g.id}` === value);
    if (!group) return;
    setOpening(true);
    setMsg(null);
    try {
      const id = await ensureCmsBatchForGroup(group, batches);
      setBatchId(id);
      setMsg({ tone: 'ok', text: `“${group.name}” is set up. Check its dates under Batch setup, then add Zoom links.` });
    } catch (e) {
      setMsg({ tone: 'error', text: e?.message || 'Could not open that batch. Try again.' });
    } finally {
      setOpening(false);
    }
  };

  // How many part paid / full paid / late joiners this batch has (numbers only, from the server).
  useEffect(() => {
    let alive = true;
    setCounts(null);
    if (!batch?.id) return undefined;
    fetchBatchLearnerCounts(batch.id)
      .then((res) => alive && setCounts(res))
      .catch(() => alive && setCounts({ error: true }));
    return () => {
      alive = false;
    };
  }, [batch?.id, batch?.lmsGroupId]);

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
    if (!isAdmin) return;
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

  // Confirmed in ReminderChecklist, which also checks the batch is ready.
  const goLive = async () => {
    if (!batch?.id || !canEdit) return;
    setBusy(true);
    try {
      await saveBatch({
        ...batch,
        status: 'live',
        automationEnabled: true,
      });
      setMsg({ tone: 'ok', text: 'Automatic reminders are on for this batch.' });
    } catch (e) {
      setMsg({ tone: 'error', text: e.message });
    } finally {
      setBusy(false);
    }
  };

  // Stays live (learners still see and pick it); the scheduler skips it until started again.
  const pauseReminders = async () => {
    if (!batch?.id || !canEdit) return;
    setBusy(true);
    try {
      await saveBatch({ ...batch, automationEnabled: false });
      setMsg({ tone: 'ok', text: 'Automatic reminders are paused for this batch.' });
    } catch (e) {
      setMsg({ tone: 'error', text: e.message });
    } finally {
      setBusy(false);
    }
  };

  const programBatches = batches.filter((b) => String(b.program || 'LEP').toLowerCase() === programId);
  const linkedGroups = new Set(programBatches.map((b) => String(b.lmsGroupId || '')).filter(Boolean));
  const notSetUp = (lmsBatches || [])
    .filter((g) => !linkedGroups.has(g.id))
    .sort((a, b) => String(b.id).localeCompare(String(a.id)));
  const sizeOf = (b) => (lmsBatches || []).find((g) => g.id === b.lmsGroupId)?.memberCount;
  // An unlinked LEP batch whose Zoho batch (same Day 1) is already on another CMS batch:
  // that other batch is the one its learners see.
  const twin = (() => {
    if (!batch || batch.lmsGroupId || !batch.day1Date) return null;
    const group = (lmsBatches || []).find((g) => linkedGroups.has(g.id) && inferLepDay1FromGroup(g) === batch.day1Date);
    const owner = group && programBatches.find((b) => b.id !== batch.id && b.lmsGroupId === group.id);
    if (!owner || owner.id === CMS_QA_BATCH_ID) return null;
    // A larger, still-unlinked group of the same Day 1 is this batch's own — not a duplicate.
    const waiting = (lmsBatches || []).some(
      (g) => !linkedGroups.has(g.id) && inferLepDay1FromGroup(g) === batch.day1Date && (g.memberCount || 0) > (group.memberCount || 0)
    );
    return waiting ? null : { group, owner };
  })();
  // Another LEP batch with the same Day 1: ask the app's own matching which one a
  // learner of these dates (Zoho LEP Batch for this Day 1) actually sees.
  const seenInstead = (() => {
    if (programId !== PROGRAMS.LEP || !batch?.day1Date) return null;
    const same = programBatches.filter((b) => String(b.day1Date || '').slice(0, 10) === String(batch.day1Date).slice(0, 10));
    if (same.length < 2) return null;
    const key = zohoLepBatchKeyFromDay1(String(batch.day1Date).slice(0, 10));
    const seen = resolveLearnerCmsBatch(programBatches, {
      profile: { programAccess: { lep: { zohoRawBatch: key } }, LEP_Batch: key },
      programId: 'lep',
    });
    return seen && seen.id !== batch.id ? seen : null;
  })();
  // Exactly one unlinked group with this batch's Day 1: pre-select it, so CX only press Link.
  const sameDay1 = batch?.day1Date ? notSetUp.filter((g) => inferLepDay1FromGroup(g) === batch.day1Date) : [];
  const suggestedGroupId = sameDay1.length === 1 ? sameDay1[0].id : '';
  const linkValue = linkChoice || suggestedGroupId;
  const isLep = programId === PROGRAMS.LEP;
  const tabs = TABS.filter((t) => (isLep || !t.lepOnly) && (canManage || !t.leadOnly));
  const label = (text) => (
    <T size={11} weight="bold" color={A.muted} style={{ marginBottom: 6, textTransform: 'uppercase', letterSpacing: 0.6 }}>
      {text}
    </T>
  );

  return (
    <ScrollView style={{ flex: 1 }} contentContainerStyle={{ padding: 24 }}>
      <H style={{ marginBottom: 4 }}>Batches</H>
      <T color={A.muted} style={{ marginBottom: 14, maxWidth: 760 }}>
        Choose the program, batch and kind of learner. Every tab and the live app on the right follow that choice.
      </T>

      <ZohoSyncBar onSynced={() => setSyncTick((t) => t + 1)} />

      {/* One combination at the top drives every tab and the preview. */}
      <Card style={{ marginBottom: 14, padding: 14 }}>
        <Row gap={16} style={{ flexWrap: 'wrap', alignItems: 'flex-end' }}>
          <View style={{ minWidth: 200 }}>
            {label('Program')}
            <Select
              value={programId}
              onChange={(v) => {
                setProgramId(v);
                setBatchId('');
                setTab('content');
              }}
              options={PROGRAM_OPTIONS}
            />
          </View>
          <View style={{ minWidth: 280, flex: 1 }}>
            {label('Batch')}
            <Select
              value={batchId || ''}
              onChange={pickBatch}
              disabled={opening}
              options={[
                {
                  value: '',
                  label:
                    lmsBatches === null
                      ? 'Loading batches…'
                      : programBatches.length || notSetUp.length
                        ? 'Select batch…'
                        : 'No batches for this program yet',
                },
                ...programBatches.map((b) => {
                  const n = sizeOf(b);
                  return { value: b.id, label: `${formatBatchPickerLabel(b)}${n != null ? ` · ${n} with the app` : ''}` };
                }),
                ...notSetUp.map((g) => ({
                  value: `lms:${g.id}`,
                  label: `${g.name} · ${g.memberCount} with the app · not set up yet`,
                })),
              ]}
            />
            {opening ? <T size={11} color={A.muted} style={{ marginTop: 4 }}>Setting up this batch…</T> : null}
          </View>
          {batch ? (
            <View>
              <StatusBadge state={reminderState(batch)} />
            </View>
          ) : null}
        </Row>
        {batch?.day1Date ? (
          <T size={12} color={A.muted} style={{ marginTop: 10 }}>
            {describeBatchAnchor(batch)}
          </T>
        ) : null}
        {batch ? (
          <ReminderChecklist
            // A fresh checklist per batch: a half-done "Start?" must not follow CX to another batch.
            key={batch.id}
            batch={batch}
            events={events}
            isLep={programId === PROGRAMS.LEP}
            learnerCount={sizeOf(batch)}
            canEdit={canEdit}
            busy={busy}
            onStart={goLive}
            onPause={pauseReminders}
            onOpenTab={setTab}
          />
        ) : null}
        <Row gap={8} style={{ flexWrap: 'wrap', marginTop: 12 }}>
          {WHO.map((w) => {
            const on = learner === w.value;
            // Unlinked: there is nothing to count yet — "—", never a misleading 0.
            const n = batch?.lmsGroupId && counts?.counts ? counts.counts[w.value] : null;
            return (
              <Pressable key={w.value} onPress={() => setLearner(w.value)}>
                <View
                  style={{
                    minWidth: 130,
                    borderRadius: 14,
                    paddingHorizontal: 14,
                    paddingVertical: 8,
                    borderWidth: 1,
                    borderColor: on ? A.ink : A.line,
                    backgroundColor: on ? A.ink : '#FBFAF4',
                  }}
                >
                  <T size={20} weight="bold" color={on ? '#fff' : A.ink}>{n == null ? '–' : n}</T>
                  <T size={13} weight="semibold" color={on ? '#fff' : A.ink}>{w.label}</T>
                  <T size={11} color={on ? '#D6D9DE' : A.muted}>{w.sub}</T>
                </View>
              </Pressable>
            );
          })}
        </Row>
        {batch ? (
          <T size={11} color={A.muted} style={{ marginTop: 6, maxWidth: 760, lineHeight: 16 }}>
            {!batch.lmsGroupId
              ? 'Link this batch to its learners (below) to count them.'
              : counts?.error
                ? 'Learner counts are not available right now.'
                : 'These are learners with the app. Zoho can show a few more: a lead who has not signed in to the app yet does not get app reminders.'}
          </T>
        ) : null}
        {seenInstead ? (
          <View style={{ marginTop: 10, backgroundColor: '#FFF4D6', borderRadius: 10, padding: 12 }}>
            <T size={13} color={A.ink} weight="semibold">
              Learners of these dates see “{seenInstead.name}”, not this batch.
            </T>
            <Row gap={8} style={{ marginTop: 8, flexWrap: 'wrap', alignItems: 'center' }}>
              <T size={12} color={A.ink} style={{ flex: 1, minWidth: 260 }}>
                Two batches have the same Day 1. Make your changes (calendar, Zoom links, messages) on “{seenInstead.name}” so
                learners get them. This one is a duplicate.
              </T>
              <Btn label="Open that batch" small onPress={() => setBatchId(seenInstead.id)} />
            </Row>
          </View>
        ) : null}
        {batch && !batch.lmsGroupId ? (
          <View style={{ marginTop: 10, backgroundColor: '#FCE8E8', borderRadius: 10, padding: 12 }}>
            <T size={13} color={A.danger} weight="semibold">
              Not linked to its learners yet — counts and reminders cannot reach them.
            </T>
            {twin ? (
              <Row gap={8} style={{ marginTop: 8, flexWrap: 'wrap', alignItems: 'center' }}>
                <T size={12} color={A.ink} style={{ flex: 1, minWidth: 260 }}>
                  The learners of these dates ({twin.group.name} · {twin.group.memberCount} with the app) are on another batch, “
                  {twin.owner.name}”. Make your changes there — this one is a duplicate.
                </T>
                <Btn label="Open that batch" small onPress={() => setBatchId(twin.owner.id)} />
              </Row>
            ) : null}
            {canEdit && notSetUp.length ? (
              <Row gap={8} style={{ marginTop: 8, flexWrap: 'wrap', alignItems: 'center' }}>
                <T size={12} color={A.ink}>Its learners are in:</T>
                <View style={{ minWidth: 260, flex: 1 }}>
                  <Select
                    value={linkValue}
                    onChange={setLinkChoice}
                    options={[
                      { value: '', label: 'Choose the matching batch…' },
                      ...notSetUp.map((g) => ({ value: g.id, label: `${g.name} · ${g.memberCount} with the app` })),
                    ]}
                  />
                </View>
                <Btn label="Link" small onPress={() => linkManually(linkValue)} disabled={!linkValue} />
              </Row>
            ) : null}
          </View>
        ) : null}
      </Card>

      {msg ? <Notice tone={msg.tone}>{msg.text}</Notice> : null}

      <Row gap={22} style={{ alignItems: 'flex-start', flexWrap: 'wrap' }}>
        <View style={{ flex: 1, minWidth: 420 }}>
          <Row gap={2} style={{ marginBottom: 14, flexWrap: 'wrap', borderBottomWidth: 1, borderBottomColor: A.line }}>
            {tabs.map((t) => (
              <Pressable key={t.key} onPress={() => setTab(t.key)}>
                <View
                  style={{
                    paddingHorizontal: 14,
                    paddingVertical: 10,
                    borderBottomWidth: 2,
                    borderBottomColor: tab === t.key ? A.red : 'transparent',
                    marginBottom: -1,
                  }}
                >
                  <T size={13} weight={tab === t.key ? 'semibold' : 'regular'} color={tab === t.key ? A.ink : A.muted}>
                    {t.label}
                  </T>
                </View>
              </Pressable>
            ))}
          </Row>

          {tab === 'content' ? (
            <BatchHubContentTab
              batch={batch}
              programId={programId}
              learner={learner}
              contentItems={content}
              canEdit={canEdit}
              onRefresh={() => {}}
              onSaved={setSavedFocus}
            />
          ) : null}
          {tab === 'calendar' ? <BatchHubCalendarTab batch={batch} programId={programId} canEdit={canEdit} /> : null}
          {tab === 'unlock' ? (
            <BatchHubUnlockTab batch={batch} programId={programId} learner={learner} canEdit={canEdit} />
          ) : null}
          {tab === 'messages' ? (
            isLep ? (
              <BatchHubMessagesTab batch={batch} events={events} learner={learner} canEdit={canEdit} />
            ) : (
              <Notice tone="neutral">Reminders for this program are not in the CMS yet.</Notice>
            )
          ) : null}
          {tab === 'engage' ? (
            <BatchHubEngageTab batch={batch} programId={programId} learner={learner} contentItems={content} canEdit={canEdit} />
          ) : null}
          {tab === 'practice' ? (
            <BatchHubPracticeTab batch={batch} programId={programId} learner={learner} canEdit={canEdit} canManage={canManage} />
          ) : null}
          {tab === 'dashboard' ? (
            batch?.lmsGroupId ? (
              <AppAnalyticsView program={programId} batchId={batch.id} />
            ) : (
              <Notice tone="neutral">Link this batch to its learners first (top of the page) to see its analytics.</Notice>
            )
          ) : null}
          {tab === 'setup' ? (
            <>
              {canEdit && isLep ? (
                showWizard ? (
                  <BatchSetupWizard
                    batches={batches}
                    onClose={() => setShowWizard(false)}
                    onCreated={(id) => {
                      setShowWizard(false);
                      if (id) setBatchId(id);
                      setTab('content');
                    }}
                  />
                ) : (
                  <Btn label="+ Set up a new batch" onPress={() => setShowWizard(true)} style={{ marginBottom: 14, alignSelf: 'flex-start' }} />
                )
              ) : null}
              {isAdmin && isLep ? (
                <Row gap={8} style={{ marginBottom: 12, flexWrap: 'wrap' }}>
                  <Btn label="Import every batch from Zoho" kind="ghost" onPress={importFromZoho} loading={busy} small />
                  <Btn label="Import from web LMS" kind="ghost" onPress={importFromLms} loading={busy} small />
                </Row>
              ) : null}
              {batch && isLep ? (
                <T size={13} weight="semibold" style={{ marginBottom: 6 }}>Edit “{batch.name}”</T>
              ) : null}
              {isLep ? (
                <Card style={{ padding: 0, overflow: 'hidden' }}>
                  <BatchCalendarAdmin canEdit={canEdit} canDelete={canManage} embed hubBatchId={batchId} onHubBatchChange={setBatchId} />
                </Card>
              ) : (
                <Notice tone="neutral">The batch calendar for this program is not in the CMS yet.</Notice>
              )}
              {/* Developer QA tool — admins only, so CX never creates a test batch by accident. */}
              {isAdmin && isLep ? (
                <Card style={{ marginTop: 14, padding: 16 }}>
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
            </>
          ) : null}
        </View>

        <AppPreview
          programId={programId}
          batchId={batch?.id || ''}
          learner={learner}
          focus={previewFocus}
          version={`${content.length}|${batch?.updatedAt?.seconds || ''}|${content[0]?.updatedAt?.seconds || ''}`}
        />
      </Row>
    </ScrollView>
  );
}

function StatusBadge({ state }) {
  const live = state === 'on';
  return (
    <View
      style={{
        paddingHorizontal: 10,
        paddingVertical: 4,
        borderRadius: 6,
        backgroundColor: live ? '#E3F1EA' : '#F5F0E6',
      }}
    >
      <T size={11} weight="bold" color={live ? A.ok : A.muted}>{live ? 'Reminders on' : state === 'paused' ? 'Reminders paused' : 'Reminders off'}</T>
    </View>
  );
}

import React, { useMemo, useState } from 'react';
import { View } from 'react-native';
import Pressable from '../../../components/il/Press';
import {
  buildBatchMessageTimeline,
  statusLabel,
  statusTone,
} from '../../../utils/batchMessageTimeline';
import { A, Card, Notice, T } from '../adminUi';

function channelSummary(ch = {}) {
  const parts = [];
  if (ch.push) parts.push('Push');
  if (ch.whatsapp) parts.push('WA');
  if (ch.email) parts.push('Email');
  return parts.join(' · ') || '—';
}

export default function BatchHubMessagesTab({ batch, events, canEdit, onEditTemplate }) {
  const [staffOpen, setStaffOpen] = useState(false);
  const [overrideCode, setOverrideCode] = useState(null);

  const timeline = useMemo(() => buildBatchMessageTimeline(batch, events), [batch, events]);

  if (!batch?.id) {
    return (
      <Notice tone="neutral">
        Select or create a batch under Setup, save it with a generated schedule, then return here.
      </Notice>
    );
  }

  if (batch.status !== 'live') {
    return (
      <>
        <Notice tone="neutral">
          Messages show as Upcoming / Active / Expired for this batch’s dates. Turn the batch{' '}
          <T weight="semibold">Live</T> in the header when you are ready for automations (WELCOME on enroll, session
          reminders).
        </Notice>
        {renderSections(timeline.learner, { canEdit, onEditTemplate, overrideCode, setOverrideCode })}
      </>
    );
  }

  return (
    <>
      {renderSections(timeline.learner, { canEdit, onEditTemplate, overrideCode, setOverrideCode })}
      <Pressable onPress={() => setStaffOpen((v) => !v)} style={{ marginTop: 20, marginBottom: 8 }}>
        <T weight="semibold" size={13} color={A.navy}>
          {staffOpen ? '▼' : '▶'} Staff alerts (CEM / PL) — {timeline.staff.reduce((n, s) => n + s.items.length, 0)}
        </T>
      </Pressable>
      {staffOpen ? renderSections(timeline.staff, { canEdit, onEditTemplate, overrideCode, setOverrideCode, muted: true }) : null}
    </>
  );
}

function renderSections(sections, { canEdit, onEditTemplate, overrideCode, setOverrideCode, muted }) {
  if (!sections.length) return <T color={A.muted}>No message rules loaded. Use Program templates → Load LEP defaults.</T>;

  return sections.map((sec) => (
    <View key={sec.id} style={{ marginBottom: 18, opacity: muted ? 0.92 : 1 }}>
      <T weight="bold" size={14} style={{ marginBottom: 8 }}>
        {sec.title}
      </T>
      {sec.items.map((item) => (
        <MessageRow
          key={item.code}
          item={item}
          canEdit={canEdit}
          onEditTemplate={onEditTemplate}
          overrideCode={overrideCode}
          setOverrideCode={setOverrideCode}
        />
      ))}
    </View>
  ));
}

function MessageRow({ item, canEdit, onEditTemplate, overrideCode, setOverrideCode }) {
  const expired = item.status === 'expired';
  const disabled = expired && overrideCode !== item.code;

  return (
    <Card style={{ marginBottom: 8, paddingVertical: 10, paddingHorizontal: 14, opacity: disabled ? 0.55 : 1 }}>
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', gap: 12 }}>
        <View style={{ flex: 1 }}>
          <T weight="semibold" size={13}>
            {item.code} · {item.name || item.title}
          </T>
          <T size={12} color={A.muted} style={{ marginTop: 2 }}>
            {item.whenLabel}
            {item.condition && item.condition !== 'all' ? ` · only if ${item.condition}` : ''}
          </T>
          <T size={11} color={A.muted} style={{ marginTop: 4 }}>
            {channelSummary(item.channels)} · {item.priority || 'optional'}
          </T>
        </View>
        <StatusPill status={item.status} />
      </View>
      {expired && canEdit ? (
        <Pressable
          onPress={() => {
            if (overrideCode === item.code) setOverrideCode(null);
            else if (typeof window !== 'undefined') {
              const ok = window.confirm(
                `This message window has passed for this batch.\n\n${item.code}: ${item.name}\n\nSend or test anyway?`
              );
              if (ok) setOverrideCode(item.code);
            } else setOverrideCode(item.code);
          }}
          style={{ marginTop: 8 }}
        >
          <T size={12} weight="semibold" color={overrideCode === item.code ? A.ok : A.navy}>
            {overrideCode === item.code ? 'Override on — use Test in Templates' : 'Override expired window'}
          </T>
        </Pressable>
      ) : null}
      {canEdit && onEditTemplate ? (
        <Pressable onPress={() => onEditTemplate(item.code)} style={{ marginTop: 6 }}>
          <T size={12} color={A.muted}>Edit template text →</T>
        </Pressable>
      ) : null}
    </Card>
  );
}

function StatusPill({ status }) {
  const tone = statusTone(status);
  const bg = tone === 'ok' ? '#E3F1EA' : '#EEF3F5';
  const fg = tone === 'ok' ? A.ok : A.muted;
  return (
    <View style={{ backgroundColor: bg, paddingHorizontal: 8, paddingVertical: 4, borderRadius: 6, alignSelf: 'flex-start' }}>
      <T size={11} weight="semibold" color={fg}>{statusLabel(status)}</T>
    </View>
  );
}

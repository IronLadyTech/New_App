/**
 * The real app in a phone frame, shown as one made-up learner of the chosen batch.
 * Loads /?cmsPreview=1… (see readCmsPreview in context/AuthContext.js) — same build,
 * same Firestore, so what CX saves shows here after Refresh.
 */
import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Platform, View } from 'react-native';
import Pressable from '../../components/il/Press';
import { A, T } from './adminUi';

export const LEARNER_VIEWS = [
  { value: 'all', label: 'Full paid', hint: 'Showing one full-paid learner for “All learners”' },
  { value: 'register', label: 'Part paid', hint: 'Registration paid — only the open phases' },
  { value: 'paid', label: 'Full paid', hint: 'Enrolled — everything as the calendar opens it' },
  { value: 'late', label: 'Late joiner', hint: 'Full paid, joined after the batch started' },
];

export function previewUrl({ programId, batchId, learner, reloadKey = 0 }) {
  const q = new URLSearchParams({
    cmsPreview: '1',
    program: programId || 'lep',
    state: learner === 'register' ? 'registered' : 'enrolled',
    r: String(reloadKey),
  });
  if (batchId) q.set('batch', batchId);
  if (learner === 'late') q.set('late', '1');
  return `/?${q.toString()}`;
}

export default function AppPreview({ programId, batchId, learner, version = '' }) {
  const [reloadKey, setReloadKey] = useState(0);
  // Something was saved (content or batch changed) — show it without pressing Refresh.
  const lastVersion = useRef(version);
  useEffect(() => {
    if (lastVersion.current === version) return undefined;
    lastVersion.current = version;
    const t = setTimeout(() => setReloadKey((k) => k + 1), 600);
    return () => clearTimeout(t);
  }, [version]);
  const src = useMemo(
    () => previewUrl({ programId, batchId, learner, reloadKey }),
    [programId, batchId, learner, reloadKey]
  );
  const view = LEARNER_VIEWS.find((v) => v.value === learner);

  return (
    <View style={{ width: 372 }}>
      <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 8 }}>
        <T size={11} weight="bold" color={A.muted} style={{ flex: 1, textTransform: 'uppercase', letterSpacing: 0.8 }}>
          Live app · {view?.label}
        </T>
        <Pressable onPress={() => setReloadKey((k) => k + 1)} style={{ marginRight: 12 }}>
          <T size={12} weight="semibold" color={A.navy}>↻ Refresh</T>
        </Pressable>
        {Platform.OS === 'web' ? (
          <Pressable onPress={() => window.open(src, '_blank', 'noopener')}>
            <T size={12} weight="semibold" color={A.navy}>Open ↗</T>
          </Pressable>
        ) : null}
      </View>
      <View
        style={{
          width: 372,
          height: 760,
          borderRadius: 44,
          backgroundColor: '#111',
          padding: 12,
          shadowColor: '#000',
          shadowOpacity: 0.18,
          shadowRadius: 24,
          shadowOffset: { width: 0, height: 12 },
        }}
      >
        <View style={{ flex: 1, borderRadius: 34, overflow: 'hidden', backgroundColor: '#F7F6E4' }}>
          {Platform.OS === 'web'
            ? React.createElement('iframe', {
                key: src,
                src,
                title: 'Learner app preview',
                style: { width: '100%', height: '100%', border: 0, display: 'block' },
              })
            : null}
        </View>
      </View>
      <T size={11} color={A.muted} style={{ marginTop: 8, lineHeight: 16 }}>
        {view?.hint}. A preview learner — nothing here is counted on the dashboard. It refreshes by itself after you save.
      </T>
    </View>
  );
}

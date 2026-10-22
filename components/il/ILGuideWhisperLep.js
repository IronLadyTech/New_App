import React, { useState } from 'react';
import { Text, View } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import Pressable from './Press';
import ILText from './ILText';
import { G, af } from '../../constants/guestTheme';
import { IL_FONTS } from '../../constants/ironLadyBrand';
import { IL_GUIDE_SURFACES } from '../../constants/ilGuide';
import { useILGuideWhisper } from '../../hooks/useILGuideWhisper';
import { GuideFace, WhiteCard } from '../../screens/lep/LepBits';
import { useLepNav } from '../../screens/lep/useLepNav';
import { PROGRAMS } from '../../constants/programs';

/**
 * LEP-styled IL Guide card.
 * When `fallbackQuote` is set, the message shows immediately and stays put
 * (no fetch / no late swap that looks like typing).
 */
export default function ILGuideWhisperLep({
  surface = IL_GUIDE_SURFACES.LEARN,
  guideContext = null,
  fallbackQuote = '',
  subtitle = 'Executive Mentor',
  style,
  children,
  /** When true (default if fallbackQuote is set), never replace the quote with a late API whisper. */
  instant = undefined,
}) {
  const nav = useLepNav();
  const staticQuote = String(fallbackQuote || '').trim();
  // Local copy wins — no cloud fetch, no late swap that looks like re-typing.
  if (staticQuote) {
    return (
      <StaticWhisperCard
        message={staticQuote}
        subtitle={subtitle}
        style={style}
        guideContext={guideContext}
        nav={nav}
      >
        {children}
      </StaticWhisperCard>
    );
  }

  return (
    <DynamicWhisperCard
      surface={surface}
      guideContext={guideContext}
      subtitle={subtitle}
      style={style}
      nav={nav}
    >
      {children}
    </DynamicWhisperCard>
  );
}

function StaticWhisperCard({ message, subtitle, style, children, guideContext = null, nav = null }) {
  const [hidden, setHidden] = useState(false);
  const openTarget = resolveWhisperOpenTarget(guideContext, { message });
  if (hidden) return null;
  return (
    <WhisperShell
      message={message}
      subtitle={subtitle}
      style={style}
      onDismiss={() => setHidden(true)}
      onOpenNext={openTarget && nav ? () => openWhisperTarget(nav, openTarget) : undefined}
      openNextLabel={openTarget?.label}
    >
      {children}
    </WhisperShell>
  );
}

function normMatchText(s) {
  return String(s || '')
    .toLowerCase()
    .replace(/[—–−]/g, '-')
    .replace(/\s+/g, ' ')
    .trim();
}

/** Resolve the upcoming item the whisper is nudging — task, live session, or practice. */
function resolveWhisperOpenTarget(guideContext, { message = '', apiTaskId = null } = {}) {
  const dues = Array.isArray(guideContext?.lepDues) ? guideContext.lepDues : [];
  const openDues = dues.filter((d) => d && !d.done);
  const msg = normMatchText(message);

  const matchedDue =
    openDues.find((d) => {
      const title = normMatchText(d.title);
      return title && (msg.includes(title) || title.includes(msg.slice(0, 24)));
    }) ||
    openDues.find((d) => d.urgent) ||
    openDues[0] ||
    null;

  if (matchedDue?.taskId) {
    return { kind: 'task', id: matchedDue.taskId, label: 'Open next task →' };
  }
  if (matchedDue?.sessionCode) {
    return { kind: 'schedule', label: 'Open schedule →' };
  }

  if (apiTaskId) {
    const done = dues.some((d) => d?.taskId === apiTaskId && d.done);
    if (!done) return { kind: 'task', id: apiTaskId, label: 'Open next task →' };
  }

  const practice = guideContext?.openPractice;
  if (practice?.taskId || practice?.practiceId) {
    return { kind: 'practice', item: practice, label: 'Start practice →' };
  }

  if (guideContext?.journeyNextTask?.id) {
    return { kind: 'task', id: guideContext.journeyNextTask.id, label: 'Open next task →' };
  }

  return null;
}

function openWhisperTarget(nav, target) {
  if (!nav || !target) return;
  if (target.kind === 'task' && target.id) {
    nav.goCourseTask(PROGRAMS.LEP, target.id);
    return;
  }
  if (target.kind === 'schedule') {
    nav.goSchedule?.();
    return;
  }
  if (target.kind === 'practice' && target.item) {
    nav.goPracticeItem?.(target.item);
  }
}

function DynamicWhisperCard({
  surface,
  guideContext,
  subtitle,
  style,
  nav,
  children,
}) {
  const { whisper, hidden, dismiss } = useILGuideWhisper(surface, guideContext);
  const apiMessage = String(whisper?.message || '').trim();
  const apiTaskId = whisper?.taskId || taskIdFromWhisperId(whisper?.id);
  const apiTaskDone = Boolean(
    apiTaskId &&
      Array.isArray(guideContext?.lepDues) &&
      guideContext.lepDues.some((d) => d?.taskId === apiTaskId && d.done)
  );
  const shown = apiTaskDone ? '' : apiMessage;

  const openTarget = resolveWhisperOpenTarget(guideContext, {
    message: shown,
    apiTaskId: apiTaskDone ? null : apiTaskId,
  });

  if (hidden && !shown) return null;
  if (!shown) return null;

  return (
    <WhisperShell
      message={shown}
      subtitle={subtitle}
      style={style}
      onDismiss={dismiss}
      onOpenNext={openTarget ? () => openWhisperTarget(nav, openTarget) : undefined}
      openNextLabel={openTarget?.label}
    >
      {children}
    </WhisperShell>
  );
}

/**
 * Split only real quotation cards: `"quote" — Author. Coda`
 * Plain nudges (progress, next task) stay as one compact body — no false “— Day 1” author.
 */
function parseWhisperParts(raw) {
  const text = String(raw || '').trim();
  if (!text) return { quote: '', author: '', coda: '', plain: '' };

  if (text.startsWith('"') || text.startsWith('“')) {
    let m = text.match(/^["“]([\s\S]+?)["”]\s*[—–-]\s*([^.]+)\.\s*([\s\S]*)$/);
    if (m) {
      return { quote: m[1].trim(), author: m[2].trim(), coda: String(m[3] || '').trim(), plain: '' };
    }
    m = text.match(/^["“]([\s\S]+?)["”]\s*[—–-]\s*([\s\S]+)$/);
    if (m) {
      return { quote: m[1].trim(), author: m[2].trim(), coda: '', plain: '' };
    }
    return { quote: text.replace(/^["“]|["”]$/g, ''), author: '', coda: '', plain: '' };
  }

  return { quote: '', author: '', coda: '', plain: text };
}

function WhisperShell({
  message,
  subtitle,
  style,
  onDismiss,
  onOpenNext,
  openNextLabel = 'Open next task →',
  children,
}) {
  const { quote, author, coda, plain } = parseWhisperParts(message);

  return (
    <WhiteCard
      style={[
        {
          marginTop: 12,
          borderRadius: 18,
          paddingVertical: 12,
          paddingHorizontal: 14,
          borderLeftWidth: 3,
          borderLeftColor: G.cta,
          shadowColor: '#113744',
          shadowOpacity: 0.06,
          shadowRadius: 8,
          shadowOffset: { width: 0, height: 3 },
          elevation: 2,
          backgroundColor: G.white,
        },
        style,
      ]}
    >
      <View style={{ flexDirection: 'row', alignItems: 'flex-start' }}>
        <GuideFace size={36} />
        <View style={{ flex: 1, marginLeft: 10, minWidth: 0 }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
            <ILText role="label" color={G.ink} style={{ fontSize: 12, flex: 1, paddingRight: 8 }} numberOfLines={1}>
              IL Guide’s Whisper{subtitle ? ` · ${subtitle}` : ''}
            </ILText>
            {onDismiss ? (
              <Pressable onPress={onDismiss} hitSlop={8} accessibilityLabel="Dismiss whisper">
                <MaterialIcons name="close" size={16} color={G.meta} />
              </Pressable>
            ) : null}
          </View>

          {plain ? (
            <ILText
              role="bodySm"
              color={G.ink}
              style={{
                marginTop: 6,
                fontFamily: IL_FONTS.display,
                fontSize: 15,
                lineHeight: 22,
              }}
              numberOfLines={3}
            >
              {plain}
            </ILText>
          ) : null}

          {quote ? (
            <Text style={{ marginTop: 8 }} numberOfLines={4}>
              <Text
                style={{
                  fontFamily: IL_FONTS.displayBold,
                  fontSize: 15,
                  lineHeight: 22,
                  color: G.ink,
                }}
              >
                “{quote}”
              </Text>
              {author ? (
                <Text
                  style={{
                    fontFamily: IL_FONTS.displayItalic,
                    fontSize: 15,
                    lineHeight: 22,
                    color: G.meta,
                  }}
                >
                  {' '}— {author}
                </Text>
              ) : null}
            </Text>
          ) : author ? (
            <ILText
              role="bodySm"
              color={G.meta}
              style={{
                marginTop: 4,
                fontFamily: IL_FONTS.displayItalic,
                fontSize: 15,
                lineHeight: 22,
              }}
              numberOfLines={1}
            >
              — {author}
            </ILText>
          ) : null}

          {coda ? (
            <ILText
              role="bodySm"
              color={G.ink}
              style={{
                marginTop: 6,
                fontFamily: IL_FONTS.display,
                fontSize: 15,
                lineHeight: 22,
              }}
              numberOfLines={2}
            >
              {coda}
            </ILText>
          ) : null}

          {onOpenNext ? (
            <Pressable onPress={onOpenNext} style={{ marginTop: 8 }}>
              <ILText role="label" color={G.cta} style={[af, { fontSize: 12 }]}>
                {openNextLabel || 'Open next task →'}
              </ILText>
            </Pressable>
          ) : null}
        </View>
      </View>
      {children}
    </WhiteCard>
  );
}

function taskIdFromWhisperId(id) {
  if (!id) return null;
  if (id.startsWith('learn-rec-')) return id.slice('learn-rec-'.length);
  if (id.startsWith('home-progress-')) return id.slice('home-progress-'.length);
  return null;
}

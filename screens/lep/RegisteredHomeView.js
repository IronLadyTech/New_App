import React, { useEffect, useRef, useState } from 'react';
import { useIsFocused } from '@react-navigation/native';
import { Image, Linking, Pressable, ScrollView, View } from 'react-native';
import Reanimated, {
  cancelAnimation,
  runOnJS,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withTiming,
} from 'react-native-reanimated';
import { MaterialIcons } from '@expo/vector-icons';
import { IL_FONTS } from '../../constants/ironLadyBrand';
import ILText from '../../components/il/ILText';
import { af } from '../../constants/guestTheme';
import ILGuideWhisperLep from '../../components/il/ILGuideWhisperLep';
import { IL_GUIDE_SURFACES } from '../../constants/ilGuide';
import { GuideFace } from './LepBits';
import { PODCASTS } from './lepData';
import { ROLE_OPTIONS } from '../../utils/registeredHomeData';
import { recordSessionJoin } from '../../services/activityTracking';
import { isLoudNudge } from '../../utils/lepNudgePlan';

const T = {
  bg: '#F4F1E8',
  surface: '#FFFFFF',
  teal: '#12343F',
  red: '#C8202A',
  redText: '#B3202A',
  redSoft: '#F8DADB',
  ink: '#1B2B30',
  muted: '#5B6669',
  line: '#EEEAE0',
  chip: '#EEEAE0',
  chipInk: '#55595A',
  todo: '#B9B6A8',
};

/** Morning / afternoon / evening from India time (same clock as LEP sessions). */
function dayGreeting(date = new Date()) {
  const hourPart = new Intl.DateTimeFormat('en-GB', {
    timeZone: 'Asia/Kolkata',
    hour: '2-digit',
    hour12: false,
  })
    .formatToParts(date)
    .find((p) => p.type === 'hour');
  const h = Number(hourPart?.value || date.getHours());
  if (h < 12) return 'Good morning';
  if (h < 17) return 'Good afternoon';
  return 'Good evening';
}

function StatusIcon({ state }) {
  if (state === 'done') {
    return (
      <View
        style={{
          width: 26,
          height: 26,
          borderRadius: 13,
          backgroundColor: T.teal,
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <MaterialIcons name="check" size={16} color="#FFFFFF" />
      </View>
    );
  }
  if (state === 'now') {
    return (
      <View
        style={{
          width: 26,
          height: 26,
          borderRadius: 13,
          borderWidth: 2,
          borderColor: T.red,
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <View style={{ width: 9, height: 9, borderRadius: 5, backgroundColor: T.red }} />
      </View>
    );
  }
  return (
    <View
      style={{
        width: 26,
        height: 26,
        borderRadius: 13,
        borderWidth: 1.6,
        borderColor: T.todo,
      }}
    />
  );
}

function Fact({ label, value }) {
  return (
    <View style={{ flex: 1, backgroundColor: T.bg, borderRadius: 12, paddingHorizontal: 12, paddingVertical: 10 }}>
      <ILText role="label" color={T.muted} style={[af, { fontSize: 11 }]}>
        {label}
      </ILText>
      <ILText role="label" color={T.ink} style={{ marginTop: 2, fontSize: 14 }}>
        {value}
      </ILText>
    </View>
  );
}

/** "Your next steps" — the same card on the registered and the enrolled home. */
export function NextStepsCard({ countText, note, tasks, onTask, title = 'Your next steps', more = 0 }) {
  return (
    <View style={{ backgroundColor: T.surface, borderRadius: 22, paddingHorizontal: 16, paddingVertical: 18 }}>
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'baseline' }}>
        <ILText role="title" color={T.ink} style={{ fontFamily: IL_FONTS.display, fontSize: 21, lineHeight: 26 }}>
          {title}
        </ILText>
        <ILText role="label" color={T.teal} style={{ fontSize: 13 }}>
          {countText}
        </ILText>
      </View>
      <ILText role="bodySm" color={T.muted} style={{ marginTop: 4, fontSize: 12.5, lineHeight: 18 }}>
        {note}
      </ILText>
      {tasks.map((task) => (
        <Pressable
          key={task.id}
          accessibilityRole="button"
          accessibilityLabel={`${task.title}. ${task.meta}`}
          onPress={() => onTask(task)}
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            gap: 12,
            paddingVertical: 12,
            minHeight: 44,
            borderTopWidth: 1,
            borderTopColor: T.line,
            marginTop: 6,
          }}
        >
          <StatusIcon state={task.state} />
          <View style={{ flex: 1 }}>
            <ILText role="label" color={task.state === 'done' ? T.muted : T.ink} style={{ fontSize: 14.5 }}>
              {task.title}
            </ILText>
            <ILText role="bodySm" color={T.muted} style={{ marginTop: 2, fontSize: 12.5 }}>
              {task.meta}
            </ILText>
          </View>
          <View
            style={{
              backgroundColor: task.chip === 'Catch up' ? T.redSoft : task.required ? '#DCE6EA' : T.chip,
              borderRadius: 999,
              paddingHorizontal: 8,
              paddingVertical: 4,
            }}
          >
            <ILText
              role="label"
              color={task.chip === 'Catch up' ? T.redText : task.required ? T.teal : T.chipInk}
              style={{ fontSize: 11 }}
            >
              {task.chip || (task.required ? 'Required' : 'Optional')}
            </ILText>
          </View>
        </Pressable>
      ))}
      {more > 0 ? (
        <ILText role="bodySm" color={T.muted} style={{ marginTop: 10, fontSize: 12.5 }}>
          {`+${more} more in My Program`}
        </ILText>
      ) : null}
    </View>
  );
}

/** Part-paid learner, orientation close: one clear ask above everything else on Home. */
export function EnrolmentNudgeBanner({ nudge, onEnrol }) {
  if (!nudge) return null;
  const hot = nudge.level !== 'firm';
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={`${nudge.title}. ${nudge.body}`}
      onPress={onEnrol}
      style={{
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
        backgroundColor: hot ? T.red : T.redSoft,
        borderRadius: 18,
        paddingHorizontal: 16,
        paddingVertical: 14,
      }}
    >
      <MaterialIcons name="event-available" size={22} color={hot ? '#FFFFFF' : T.redText} />
      <View style={{ flex: 1 }}>
        <ILText role="label" color={hot ? '#FFFFFF' : T.redText} style={{ fontSize: 15 }}>
          {nudge.title}
        </ILText>
        <ILText
          role="bodySm"
          color={hot ? 'rgba(255,255,255,0.88)' : T.ink}
          style={{ marginTop: 2, fontSize: 12.5, lineHeight: 17 }}
        >
          {nudge.body}
        </ILText>
      </View>
      <ILText role="label" color={hot ? '#FFFFFF' : T.redText} style={{ fontSize: 13 }}>
        Enrol →
      </ILText>
    </Pressable>
  );
}

/** Enrolled: where she is in the batch — last step done, this one, the next. */
export function JourneyRail({ rail, onOpen }) {
  if (!rail?.steps?.length) return null;
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={`You are in ${rail.current?.title || 'your programme'}. Open My Program.`}
      onPress={onOpen}
      style={{ marginTop: 18 }}
    >
      <View style={{ flexDirection: 'row', gap: 6 }}>
        {rail.steps.map((s) => (
          <View
            key={`bar-${s.id}`}
            style={{
              flex: 1,
              height: 5,
              borderRadius: 3,
              backgroundColor:
                s.state === 'current' ? '#E8585E' : s.state === 'done' ? 'rgba(255,255,255,0.55)' : 'rgba(255,255,255,0.22)',
            }}
          />
        ))}
      </View>
      <View style={{ flexDirection: 'row', gap: 6, marginTop: 8 }}>
        {rail.steps.map((s) => (
          <ILText
            key={`lbl-${s.id}`}
            role="label"
            color={s.state === 'current' ? '#FFFFFF' : s.state === 'done' ? '#DCE6EA' : '#9FB3B9'}
            style={{ flex: 1, fontSize: 11, fontWeight: s.state === 'current' ? '800' : '600' }}
          >
            {s.state === 'done' ? `✓ ${s.label}` : s.label}
          </ILText>
        ))}
      </View>
    </Pressable>
  );
}

export default function RegisteredHomeView({
  model,
  guideContext,
  onCta,
  onPhaseCta,
  onTask,
  onVideo,
  onStory,
  onRsvp,
  role,
  roleOn,
  onRole,
  onDismissRole,
  bhag,
  onBhag,
  topPad,
  upcomingSession,
  onOpenSchedule,
  nudge,
  onEnrol,
}) {
  return (
    <View style={{ gap: 16 }}>
      <View
        accessibilityRole="summary"
        style={{
          backgroundColor: T.teal,
          marginHorizontal: -20,
          borderBottomLeftRadius: 24,
          borderBottomRightRadius: 24,
          paddingTop: topPad + 28,
          paddingBottom: 20,
        }}
      >
        <PhaseSlider
          firstName={model.firstName}
          phases={model.phases || []}
          lockerStep={model.lockerStep ?? 0}
          onPhaseCta={onPhaseCta || onCta}
        />
      </View>

      {isLoudNudge(nudge) ? <EnrolmentNudgeBanner nudge={nudge} onEnrol={onEnrol} /> : null}

      <ILGuideWhisperLep
        surface={IL_GUIDE_SURFACES.HOME}
        guideContext={guideContext}
        fallbackQuote={model.guide}
        subtitle="Your next step"
        style={{ borderRadius: 18 }}
      />

      <NextStepsCard
        countText={`${model.doneCount} of ${model.taskCount} done`}
        note={model.note}
        // Enrolment's line follows the batch calendar: "3 days to orientation", "Orientation tomorrow"…
        tasks={
          nudge
            ? model.tasks.map((t) => (t.id === 'enroll' && t.state !== 'done' ? { ...t, meta: nudge.short } : t))
            : model.tasks
        }
        onTask={onTask}
      />

      {roleOn ? (
        <View
          style={{
            backgroundColor: T.surface,
            borderRadius: 22,
            padding: 16,
            borderLeftWidth: 3,
            borderLeftColor: T.red,
          }}
        >
          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
            <GuideFace size={44} />
            <View style={{ flex: 1, marginLeft: 12, marginRight: 8 }}>
              <ILText role="label" color={T.ink} style={{ fontSize: 13 }}>
                IL Guide · help us personalise your journey
              </ILText>
              <ILText role="bodySm" color={T.muted} style={{ marginTop: 2, fontSize: 12.5 }}>
                Same field of work as on your profile
              </ILText>
            </View>
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Dismiss"
              onPress={onDismissRole}
              hitSlop={8}
            >
              <MaterialIcons name="close" size={18} color={T.muted} />
            </Pressable>
          </View>
          <ILText role="label" color={T.ink} style={{ marginTop: 14, fontSize: 15 }}>
            Which best describes your field of work?
          </ILText>
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginTop: 12 }}>
            {ROLE_OPTIONS.map((option) => {
              const selected = String(role || '').toLowerCase() === option.toLowerCase();
              return (
                <Pressable
                  key={option}
                  accessibilityRole="button"
                  accessibilityState={{ selected }}
                  accessibilityLabel={option}
                  onPress={() => onRole(option)}
                  style={{
                    minHeight: 40,
                    paddingHorizontal: 14,
                    borderRadius: 999,
                    borderWidth: 1,
                    borderColor: selected ? T.teal : '#D9D4C5',
                    backgroundColor: selected ? T.teal : T.bg,
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <ILText role="label" color={selected ? '#FFFFFF' : T.ink} style={{ fontSize: 13.5 }}>
                    {option}
                  </ILText>
                </Pressable>
              );
            })}
          </View>
          <Pressable accessibilityRole="button" accessibilityLabel="Not now" onPress={onDismissRole}>
            <ILText role="label" color={T.muted} style={{ fontSize: 13, paddingTop: 12 }}>
              Not now
            </ILText>
          </Pressable>
        </View>
      ) : null}

      {model.showBring ? (
        <View style={{ backgroundColor: T.surface, borderRadius: 22, padding: 18 }}>
          <ILText role="title" color={T.ink} style={{ fontFamily: IL_FONTS.display, fontSize: 21, lineHeight: 26 }}>
            Bring to Day 1
          </ILText>
          {['Laptop with camera on', 'A notebook', 'Your B-HAG — we print it on your CoDeSeF sheet on Day 2'].map((line) => (
            <ILText key={line} role="body" color={T.ink} style={{ marginTop: 8, fontSize: 14, lineHeight: 20 }}>
              {`•  ${line}`}
            </ILText>
          ))}
        </View>
      ) : null}

      <View style={{ backgroundColor: T.surface, borderRadius: 22, padding: 16 }}>
        <ILText role="label" color={T.redText} style={[af, { fontSize: 11, letterSpacing: 1.2 }]}>
          START HERE
        </ILText>
        <ILText
          role="title"
          color={T.ink}
          style={{ marginTop: 6, fontFamily: IL_FONTS.display, fontSize: 21, lineHeight: 26 }}
        >
          What is Leadership Essentials?
        </ILText>
        <View style={{ flexDirection: 'row', gap: 8, marginTop: 12 }}>
          <Fact label="DURATION" value="1 month" />
          <Fact label="FORMAT" value="2-day intensive + weekly" />
        </View>
        <View style={{ flexDirection: 'row', gap: 8, marginTop: 8 }}>
          <Fact label="CURRICULUM" value="27 Principles" />
          <Fact label="ON COMPLETION" value="Certification" />
        </View>
        <ILText role="body" color={T.ink} style={{ marginTop: 12, fontSize: 14, lineHeight: 21 }}>
          The 27 Principles are the leadership ideas the whole program is built on — like your B-HAG, shameless pitching and differentiated branding. You learn all of them in the 2-day intensive; this short video is a head start.
        </ILText>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Watch 27 Principles, 12 minutes, optional"
          onPress={onVideo}
          style={{ backgroundColor: T.teal, borderRadius: 16, padding: 16, marginTop: 12 }}
        >
          <ILText role="display" color="#FFFFFF" style={{ fontFamily: IL_FONTS.display, fontSize: 30, lineHeight: 34 }}>
            27 Principles
          </ILText>
          <ILText role="bodySm" color="#C9D6DA" style={{ marginTop: 6, fontSize: 12 }}>
            Mental models for unflinching leadership
          </ILText>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 18 }}>
            <View style={{ backgroundColor: 'rgba(255,255,255,0.14)', borderRadius: 8, paddingHorizontal: 8, paddingVertical: 4 }}>
              <ILText role="label" color="#FFFFFF" style={{ fontSize: 12 }}>
                12 min · optional pre-watch
              </ILText>
            </View>
            <View
              style={{
                width: 40,
                height: 40,
                borderRadius: 20,
                backgroundColor: T.red,
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <MaterialIcons name="play-arrow" size={22} color="#FFFFFF" />
            </View>
          </View>
        </Pressable>
      </View>

      <ILText
        role="title"
        color={T.ink}
        style={{ fontFamily: IL_FONTS.display, fontSize: 21, lineHeight: 26 }}
      >
        Welcome to Iron Lady Speaks
      </ILText>
      <ScrollView horizontal showsHorizontalScrollIndicator={false}>
        <View style={{ flexDirection: 'row', gap: 12 }}>
          {PODCASTS.slice(0, 3).map((ep) => (
            <Pressable
              key={ep.assetKey}
              accessibilityRole="button"
              accessibilityLabel={ep.title}
              onPress={() =>
                onStory?.({
                  assetKey: ep.assetKey,
                  title: ep.title,
                  meta: ep.meta || ep.who,
                })
              }
              style={{ width: 250 }}
            >
              <View style={{ height: 140, borderRadius: 16, overflow: 'hidden', backgroundColor: '#1D4A57' }}>
                <Image source={ep.img} style={{ width: '100%', height: '100%' }} resizeMode="cover" />
                <View
                  style={{
                    position: 'absolute',
                    left: 10,
                    bottom: 10,
                    backgroundColor: 'rgba(0,0,0,0.35)',
                    borderRadius: 6,
                    paddingHorizontal: 7,
                    paddingVertical: 3,
                  }}
                >
                  <ILText role="label" color="#FFFFFF" style={{ fontSize: 12 }}>
                    {ep.meta || 'Listen'}
                  </ILText>
                </View>
              </View>
              <ILText role="label" color={T.ink} style={{ marginTop: 8, fontSize: 14 }}>
                {ep.title}
              </ILText>
              <ILText role="bodySm" color={T.muted} style={{ marginTop: 2, fontSize: 12.5 }}>
                {ep.who}
              </ILText>
            </Pressable>
          ))}
        </View>
      </ScrollView>

      {upcomingSession ? (
        <RegisteredNextSessionCard
          upcoming={upcomingSession}
          onAddCalendar={() => {
            if (upcomingSession.calendarUrl) openDay1Calendar(upcomingSession.calendarUrl);
            else onOpenSchedule?.();
          }}
          onOpenSchedule={onOpenSchedule}
        />
      ) : null}

      <BhagHomeCard bhag={bhag} onBhag={onBhag} />
    </View>
  );
}

/** Her B-HAG — last card on Home, registered and enrolled alike. */
export function BhagHomeCard({ bhag, onBhag, style }) {
  return (
    <View style={[{ backgroundColor: T.surface, borderRadius: 22, padding: 18 }, style]}>
      <ILText role="eyebrow" color={T.redText} style={[af, { fontSize: 10, letterSpacing: 0.6 }]}>
        YOUR B-HAG (BIG HAIRY AUDACIOUS GOAL)
      </ILText>
      <ILText
        role="title"
        color={T.ink}
        style={{ marginTop: 10, fontFamily: IL_FONTS.display, fontSize: 22, lineHeight: 28 }}
      >
        {bhag || 'Name the goal big enough to scare you'}
      </ILText>
      <ILText role="bodySm" color={T.muted} style={{ marginTop: 8, fontSize: 13, lineHeight: 18 }}>
        {bhag
          ? 'Calibrated during your initial leadership assessment'
          : 'Write it in one sentence. Day 2 prints it on your CoDeSeF sheet.'}
      </ILText>
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 14 }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', flex: 1, marginRight: 8 }}>
          <View style={{ width: 7, height: 7, borderRadius: 4, backgroundColor: T.red, marginRight: 8 }} />
          <ILText role="bodySm" color={T.redText} style={{ fontSize: 12 }}>
            Primary LEP Focus Track
          </ILText>
        </View>
        <Pressable accessibilityRole="button" accessibilityLabel="Refine B-HAG" onPress={onBhag} hitSlop={8}>
          <ILText role="label" color={T.redText} style={{ fontSize: 14 }}>
            Refine it →
          </ILText>
        </Pressable>
      </View>
    </View>
  );
}

function RegisteredNextSessionCard({ upcoming, onAddCalendar, onOpenSchedule }) {
  const canJoin = Boolean(upcoming.ready && upcoming.joinLink);
  return (
    <View style={{ backgroundColor: T.surface, borderRadius: 22, padding: 18 }}>
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
        <ILText role="label" color={T.muted} style={[af, { fontSize: 11, letterSpacing: 1.1 }]}>
          {upcoming.kicker}
        </ILText>
        <MaterialIcons name="event" size={20} color={T.teal} />
      </View>
      <ILText
        role="title"
        color={T.ink}
        style={{ marginTop: 8, fontFamily: IL_FONTS.display, fontSize: 22, lineHeight: 28 }}
      >
        {upcoming.title}
      </ILText>
      <ILText role="body" color={T.muted} style={{ marginTop: 8, fontSize: 14, lineHeight: 20 }}>
        {upcoming.when}
      </ILText>
      {upcoming.hours ? (
        <ILText role="bodySm" color={T.muted} style={{ marginTop: 4, fontSize: 13 }}>
          {upcoming.hours}
        </ILText>
      ) : null}
      <Pressable
        accessibilityRole="button"
        accessibilityLabel="Add to calendar"
        onPress={onAddCalendar}
        style={{
          marginTop: 16,
          minHeight: 48,
          borderRadius: 999,
          backgroundColor: T.red,
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <ILText role="label" color="#FFFFFF" style={{ fontSize: 16 }}>
          Add to calendar →
        </ILText>
      </Pressable>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={canJoin ? 'Join Zoom session' : 'View schedule'}
        onPress={() => {
          if (canJoin) {
            recordSessionJoin(upcoming.code);
            Linking.openURL(upcoming.joinLink).catch(() => {});
          }
          else onOpenSchedule?.();
        }}
        style={{
          marginTop: 10,
          minHeight: 48,
          borderRadius: 999,
          backgroundColor: T.teal,
          alignItems: 'center',
          justifyContent: 'center',
          paddingHorizontal: 12,
        }}
      >
        <ILText role="label" color="#FFFFFF" style={{ fontSize: 15 }}>
          {canJoin ? 'Join Zoom session' : 'View full schedule'}
        </ILText>
        {!canJoin ? (
          <ILText role="bodySm" color="rgba(255,255,255,0.65)" style={{ marginTop: 2, fontSize: 11 }}>
            Join link unlocks about an hour before your session
          </ILText>
        ) : null}
      </Pressable>
    </View>
  );
}

function DateTile({ label, value }) {
  return (
    <View style={{ flex: 1, backgroundColor: 'rgba(255,255,255,0.08)', borderRadius: 14, paddingHorizontal: 12, paddingVertical: 10 }}>
      <ILText role="label" color="#C9D6DA" style={[af, { fontSize: 11 }]}>
        {label}
      </ILText>
      <ILText role="label" color="#FFFFFF" style={{ marginTop: 2, fontSize: 14 }}>
        {value}
      </ILText>
    </View>
  );
}

/**
 * Bars / caption / CTA still slide Registered → Pre-work → Day 1.
 * The chip above “Good morning” stays fixed on Registered.
 */
function PhaseSlider({ firstName, phases, lockerStep, onPhaseCta }) {
  const count = Math.max(phases.length, 1);
  const [index, setIndex] = useState(lockerStep);
  const [trackW, setTrackW] = useState(0);
  // UI thread (Reanimated): the fade and the red bar keep moving while JS is busy.
  // JS only swaps the caption, once every 5 s, while the card is faded out.
  const slide = useSharedValue(lockerStep);
  const fade = useSharedValue(1);
  const indexRef = useRef(lockerStep);
  // Rotate only while Home is on screen; a hidden timer just loads the JS thread.
  const focused = useIsFocused();
  const gap = 6;
  const seg = trackW > 0 ? (trackW - gap * (count - 1)) / count : 0;

  useEffect(() => {
    indexRef.current = lockerStep;
    setIndex(lockerStep);
    slide.value = lockerStep;
    fade.value = 1;
  }, [lockerStep, slide, fade]);

  useEffect(() => {
    if (count < 2 || !focused) return undefined;
    const showNext = (next) => {
      indexRef.current = next;
      setIndex(next);
      slide.value = withSpring(next, { damping: 18, stiffness: 120 });
      fade.value = withTiming(1, { duration: 240 });
    };
    const timer = setInterval(() => {
      const next = (indexRef.current + 1) % count;
      fade.value = withTiming(0, { duration: 180 }, (finished) => {
        if (finished) runOnJS(showNext)(next);
      });
    }, 5000);
    return () => {
      clearInterval(timer);
      // Never leave the card half-faded when the timer stops (tab switch, unmount).
      cancelAnimation(fade);
      fade.value = 1;
    };
  }, [count, fade, slide, focused]);

  const fadeStyle = useAnimatedStyle(() => ({ opacity: fade.value }));
  const thumbStyle = useAnimatedStyle(() => ({ transform: [{ translateX: slide.value * (seg + gap) }] }), [seg]);

  const phase = phases[index] || phases[0];
  if (!phase) return null;

  const registeredDone = Boolean(phases[0]?.done || lockerStep > 0);
  const canPress = phase.unlocked && !phase.ctaBlocked;

  return (
    <View style={{ paddingHorizontal: 20, gap: 14 }}>
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
        <View
          style={{
            backgroundColor: 'rgba(255,255,255,0.12)',
            borderRadius: 999,
            paddingHorizontal: 10,
            paddingVertical: 6,
            flexDirection: 'row',
            alignItems: 'center',
          }}
        >
          {registeredDone ? (
            <MaterialIcons name="check-circle" size={14} color="#FFFFFF" style={{ marginRight: 6 }} />
          ) : null}
          <ILText role="label" color="#FFFFFF" style={[af, { fontSize: 11, letterSpacing: 1.2 }]}>
            Registered
          </ILText>
        </View>
        <ILText role="bodySm" color="#C9D6DA" style={{ fontSize: 12 }}>
          Leadership Essentials
        </ILText>
      </View>

      <ILText
        role="display"
        color="#FFFFFF"
        style={{ fontFamily: IL_FONTS.display, fontSize: 27, lineHeight: 32 }}
      >
        {`${dayGreeting()}, ${firstName}.`}
      </ILText>

      <Reanimated.View style={[{ minHeight: 40 }, fadeStyle]}>
        <ILText role="body" color="#DCE6EA" style={{ fontSize: 14, lineHeight: 20 }}>
          {phase.body}
        </ILText>
      </Reanimated.View>

      <View>
        <View
          onLayout={(e) => setTrackW(e.nativeEvent.layout.width)}
          style={{ height: 5, justifyContent: 'center' }}
        >
          <View style={{ flexDirection: 'row', gap, height: 5 }}>
            {phases.map((p) => (
              <View
                key={`rail-${p.key}`}
                style={{
                  flex: 1,
                  height: 5,
                  borderRadius: 3,
                  backgroundColor: p.done ? 'rgba(255,255,255,0.55)' : 'rgba(255,255,255,0.22)',
                }}
              />
            ))}
          </View>
          {seg > 0 ? (
            <Reanimated.View
              pointerEvents="none"
              style={[
                {
                  position: 'absolute',
                  left: 0,
                  top: 0,
                  width: seg,
                  height: 5,
                  borderRadius: 3,
                  backgroundColor: '#E8585E',
                },
                thumbStyle,
              ]}
            />
          ) : null}
        </View>
        <View style={{ flexDirection: 'row', gap, marginTop: 8 }}>
          {phases.map((p, i) => (
            <View key={p.key} style={{ flex: 1 }}>
              <ILText
                role="label"
                color={i === index ? '#FFFFFF' : p.done ? '#DCE6EA' : '#9FB3B9'}
                style={{ fontSize: 11, fontWeight: i === index ? '800' : '600' }}
              >
                {p.label}
              </ILText>
            </View>
          ))}
        </View>
      </View>

      <Reanimated.View style={[{ gap: 14 }, fadeStyle]}>
        {phase.dated && phase.orientation ? (
          <View style={{ flexDirection: 'row', gap: 8 }}>
            <DateTile label="ORIENTATION" value={phase.orientation} />
            <DateTile label="SAT – SUN" value={phase.day1When || ''} />
          </View>
        ) : null}
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={phase.cta}
          disabled={!canPress}
          onPress={() => canPress && onPhaseCta?.(phase)}
          style={{
            minHeight: 50,
            borderRadius: 999,
            backgroundColor: canPress ? T.red : 'rgba(255,255,255,0.16)',
            alignItems: 'center',
            justifyContent: 'center',
            paddingHorizontal: 16,
            opacity: canPress ? 1 : 0.7,
          }}
        >
          <ILText role="label" color="#FFFFFF" style={{ fontSize: 16 }}>
            {canPress ? `${phase.cta} →` : phase.ctaBlocked ? `${phase.cta} · Locked` : phase.cta}
          </ILText>
        </Pressable>
      </Reanimated.View>
    </View>
  );
}

export function openDay1Calendar(url) {
  if (!url) return;
  Linking.openURL(url).catch(() => {});
}

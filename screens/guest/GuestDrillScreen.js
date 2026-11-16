import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  Animated,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  TextInput,
  Vibration,
  View,
} from 'react-native';
import Pressable from '../../components/il/Press';
import { StatusBar } from 'expo-status-bar';
import { MaterialIcons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Svg, { Circle } from 'react-native-svg';
import Reanimated, { Easing, cancelAnimation, useAnimatedProps, useSharedValue, withTiming } from 'react-native-reanimated';
import { IL_FONTS } from '../../constants/ironLadyBrand';
import ILText from '../../components/il/ILText';
import { G, af } from '../../constants/guestTheme';
import { GuestBackBar, Page, PinkDisc, RedOrb, StatNum, WhiteCard } from './GuestBits';
import { DRILLS, DRILL_GUIDES } from './guestData';

const clock = (s) => `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`;

export default function GuestDrillScreen({ navigation, route }) {
  const insets = useSafeAreaInsets();
  const id = route?.params?.id || 'pitch';
  const guide = DRILL_GUIDES[id] || DRILL_GUIDES.pitch;
  const drill = DRILLS.find((d) => d.id === id) || DRILLS[0];
  const total = guide.steps.length;

  const [ticked, setTicked] = useState({});
  const [notes, setNotes] = useState({});
  const [complete, setComplete] = useState(false);

  const isDone = (i) => (guide.steps[i].input ? !!notes[i]?.trim() : !!ticked[i]);
  const doneCount = guide.steps.filter((_, i) => isDone(i)).length;
  const current = guide.steps.findIndex((_, i) => !isDone(i));

  const timerStep = guide.timer ? guide.timer.step ?? total - 1 : -1;
  const onTimerEnd = () => setTicked((t) => ({ ...t, [timerStep]: true }));

  const reset = () => {
    setTicked({});
    setNotes({});
    setComplete(false);
  };

  return (
    <Page>
      <StatusBar style="dark" />
      <View style={{ paddingTop: Math.max(insets.top, 8) }}>
        <GuestBackBar title={drill.title} sub={guide.kicker} onBack={() => navigation.goBack()} />
      </View>
      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <ScrollView
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
          contentContainerStyle={{ paddingHorizontal: 20, paddingTop: 8, paddingBottom: Math.max(insets.bottom, 16) + 24 }}
        >
          <View style={{ backgroundColor: G.dark, borderRadius: 24, padding: 20, overflow: 'hidden' }}>
            <RedOrb size={170} />
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <PinkDisc name={drill.icon} size={34} />
              <ILText role="eyebrow" color={G.pink} style={[af, { marginLeft: 10, fontSize: 10, letterSpacing: 1.2 }]}>
                {guide.kicker}
              </ILText>
            </View>
            <ILText
              role="display"
              color="#FFFFFF"
              style={{ marginTop: 16, fontFamily: IL_FONTS.display, fontSize: 32, lineHeight: 38, letterSpacing: -0.6 }}
            >
              {guide.title[0]}
            </ILText>
            <ILText
              role="display"
              color={G.pink}
              style={{ fontFamily: IL_FONTS.displayItalic, fontSize: 32, lineHeight: 38, letterSpacing: -0.6 }}
            >
              {guide.title[1]}
            </ILText>
            <ILText role="body" color="rgba(255,255,255,0.75)" style={{ marginTop: 10, fontSize: 15, lineHeight: 22 }}>
              {guide.tagline}
            </ILText>
            <View style={{ flexDirection: 'row', marginTop: 18 }}>
              {guide.steps.map((s, i) => (
                <View
                  key={s.n}
                  style={{
                    flex: 1,
                    height: 4,
                    borderRadius: 2,
                    marginLeft: i ? 4 : 0,
                    backgroundColor: isDone(i) ? G.cta : 'rgba(255,255,255,0.18)',
                  }}
                />
              ))}
            </View>
            <ILText role="bodySm" color="rgba(255,255,255,0.6)" style={{ marginTop: 8, fontSize: 11 }}>
              {doneCount} of {total} done
            </ILText>
          </View>

          <View style={{ marginTop: 18 }}>
            {guide.steps.map((s, i) => (
              <React.Fragment key={s.n}>
                <StepRow
                  step={s}
                  last={i === total - 1}
                  done={isDone(i)}
                  now={i === current}
                  note={notes[i] || ''}
                  onNote={(v) => setNotes((n) => ({ ...n, [i]: v }))}
                  onTick={() => setTicked((t) => ({ ...t, [i]: !t[i] }))}
                />
                {/* The timer sits right under the step it times (Power Pose: step 02, not the end). */}
                {guide.timer && i === timerStep ? <DrillTimer {...guide.timer} onEnd={onTimerEnd} tail={i === total - 1} /> : null}
              </React.Fragment>
            ))}
          </View>

          {complete ? (
            <DoneCard
              label={guide.done}
              doneCount={doneCount}
              total={total}
              onAgain={reset}
              onBack={() => navigation.goBack()}
            />
          ) : (
            <Pressable
              onPress={() => setComplete(true)}
              accessibilityRole="button"
              style={{
                marginTop: 18,
                backgroundColor: G.cta,
                borderRadius: 999,
                paddingVertical: 15,
                flexDirection: 'row',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <MaterialIcons name="check" size={18} color="#FFFFFF" />
              <ILText role="label" color="#FFFFFF" style={{ marginLeft: 6 }}>
                {guide.done}
              </ILText>
            </Pressable>
          )}
        </ScrollView>
      </KeyboardAvoidingView>
    </Page>
  );
}

function StepRow({ step, last, done, now, note, onNote, onTick }) {
  const wide = step.n.length > 2;
  return (
    <View style={{ flexDirection: 'row' }}>
      <View style={{ alignItems: 'center', width: 46 }}>
        <View
          style={{
            minWidth: wide ? 44 : 36,
            height: 36,
            paddingHorizontal: wide ? 6 : 0,
            borderRadius: 18,
            backgroundColor: done ? G.cta : now ? G.dark : G.white,
            borderWidth: done || now ? 0 : 1.5,
            borderColor: G.line,
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          {done ? (
            <MaterialIcons name="check" size={18} color="#FFFFFF" />
          ) : (
            <StatNum color={now ? '#FFFFFF' : G.ink} size={wide ? 12 : 13}>
              {step.n}
            </StatNum>
          )}
        </View>
        {last ? null : (
          <View style={{ width: 2, flex: 1, minHeight: 14, backgroundColor: done ? G.cta : G.line }} />
        )}
      </View>
      <WhiteCard
        style={{
          flex: 1,
          marginLeft: 8,
          marginBottom: last ? 0 : 12,
          borderRadius: 20,
          padding: 16,
          borderColor: now ? G.cta : G.line,
          borderWidth: now ? 1.5 : 1,
        }}
      >
        <View style={{ flexDirection: 'row', alignItems: 'flex-start' }}>
          <ILText
            role="title"
            color={G.ink}
            style={{ flex: 1, fontFamily: IL_FONTS.display, fontSize: 17, lineHeight: 22 }}
          >
            {step.t}
          </ILText>
          {now ? (
            <View style={{ backgroundColor: G.pink, borderRadius: 999, paddingHorizontal: 8, paddingVertical: 3, marginLeft: 8 }}>
              <ILText role="eyebrow" color={G.cta} style={[af, { fontSize: 9 }]}>
                Now
              </ILText>
            </View>
          ) : null}
        </View>
        <ILText role="bodySm" color={G.meta} style={{ marginTop: 6, fontSize: 13, lineHeight: 19 }}>
          {step.d}
        </ILText>
        {step.input ? (
          <TextInput
            value={note}
            onChangeText={onNote}
            multiline
            textAlignVertical="top"
            placeholder={step.input}
            placeholderTextColor={G.meta}
            style={{
              marginTop: 12,
              minHeight: 72,
              borderRadius: 16,
              backgroundColor: G.page,
              paddingHorizontal: 14,
              paddingVertical: 12,
              color: G.ink,
              fontFamily: IL_FONTS.displayItalic,
              fontSize: 16,
              lineHeight: 22,
            }}
          />
        ) : (
          <Pressable
            onPress={onTick}
            accessibilityRole="checkbox"
            accessibilityState={{ checked: done }}
            style={{
              alignSelf: 'flex-start',
              marginTop: 12,
              flexDirection: 'row',
              alignItems: 'center',
              borderRadius: 999,
              paddingVertical: 7,
              paddingHorizontal: 12,
              backgroundColor: done ? G.pink : G.mutedFill,
            }}
          >
            <MaterialIcons name={done ? 'check-circle' : 'radio-button-unchecked'} size={16} color={done ? G.cta : G.meta} />
            <ILText role="label" color={done ? G.cta : G.ink} style={{ marginLeft: 6, fontSize: 12 }}>
              {done ? 'Done' : 'I did this'}
            </ILText>
          </Pressable>
        )}
      </WhiteCard>
    </View>
  );
}

const AnimatedTimerCircle = Reanimated.createAnimatedComponent(Circle);

/**
 * The drill timer, as part of the step it times: same width as the step cards, the timeline line
 * running past it. Ring on the left drains smoothly (UI thread); title, status and controls on
 * the right. Last 3 seconds pulse and buzz; when time is up the card turns red with a tick.
 */
function DrillTimer({ label, secs, start, hush, onEnd, tail = false }) {
  const [left, setLeft] = useState(secs);
  const [running, setRunning] = useState(false);
  const pulse = useRef(new Animated.Value(1)).current;
  const pop = useRef(new Animated.Value(1)).current;
  const ended = left === 0;
  const final = running && left > 0 && left <= 3;
  const drained = useSharedValue(0); // 0 → 1 over the whole countdown

  useEffect(() => {
    if (!running) return undefined;
    const t = setInterval(() => setLeft((s) => Math.max(0, s - 1)), 1000);
    return () => clearInterval(t);
  }, [running]);

  // Smooth ring: sweep to the end over the time left; stop where it is on pause.
  useEffect(() => {
    if (running) {
      drained.value = withTiming(1, { duration: left * 1000, easing: Easing.linear });
    } else {
      cancelAnimation(drained);
      drained.value = (secs - left) / secs;
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [running]);

  useEffect(() => {
    if (running && left === 0) {
      setRunning(false);
      Vibration.vibrate([0, 450, 180, 450]);
      onEnd?.();
    }
  }, [left, running, onEnd]);

  useEffect(() => {
    if (!final && !ended) return;
    if (final) Vibration.vibrate(60);
    pop.setValue(1.18);
    Animated.spring(pop, { toValue: 1, friction: 4, useNativeDriver: true }).start();
  }, [left, final, ended, pop]);

  useEffect(() => {
    if (!(hush && running)) {
      pulse.setValue(1);
      return undefined;
    }
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(pulse, { toValue: 0.35, duration: 900, useNativeDriver: true }),
        Animated.timing(pulse, { toValue: 1, duration: 900, useNativeDriver: true }),
      ])
    );
    loop.start();
    return () => loop.stop();
  }, [hush, running, pulse]);

  const size = 104;
  const stroke = 7;
  const r = (size - stroke) / 2;
  const circ = 2 * Math.PI * r;
  const ringProps = useAnimatedProps(() => ({ strokeDashoffset: circ * drained.value }));

  const press = () => {
    if (ended) {
      setLeft(secs);
      drained.value = 0;
      setRunning(true);
      return;
    }
    setRunning((v) => !v);
  };
  const reset = () => {
    setRunning(false);
    setLeft(secs);
    cancelAnimation(drained);
    drained.value = 0;
  };

  const cta = ended ? 'Go again' : running ? 'Pause' : left < secs ? 'Resume' : start;
  const status = ended
    ? hush
      ? 'You held it. That stillness is your authority.'
      : 'Done — this step is ticked.'
    : final
      ? 'Almost there…'
      : running
        ? hush
          ? 'Don’t speak. Hold it.'
          : 'Keep going'
        : left < secs
          ? 'Paused'
          : `${secs < 60 ? `${secs} seconds` : `${Math.round(secs / 60)} minute${secs >= 120 ? 's' : ''}`} · start when you are ready`;

  const ink = ended ? '#FFFFFF' : '#FFFFFF';
  return (
    <View style={{ flexDirection: 'row' }}>
      {/* the timeline keeps running past the timer */}
      <View style={{ width: 46, alignItems: 'center' }}>
        {tail ? null : <View style={{ width: 2, flex: 1, backgroundColor: G.line }} />}
      </View>
      <View
        style={{
          flex: 1,
          marginLeft: 8,
          marginTop: tail ? 12 : 0,
          marginBottom: tail ? 0 : 12,
          borderRadius: 20,
          padding: 14,
          backgroundColor: ended ? G.cta : G.dark,
          flexDirection: 'row',
          alignItems: 'center',
        }}
      >
        <View style={{ width: size, height: size, alignItems: 'center', justifyContent: 'center' }}>
          <Svg width={size} height={size} style={{ position: 'absolute', transform: [{ rotate: '-90deg' }] }}>
            <Circle cx={size / 2} cy={size / 2} r={r} stroke="rgba(255,255,255,0.16)" strokeWidth={stroke} fill="none" />
            <AnimatedTimerCircle
              cx={size / 2}
              cy={size / 2}
              r={r}
              stroke={ended ? '#FFFFFF' : G.cta}
              strokeWidth={stroke}
              fill="none"
              strokeLinecap="round"
              strokeDasharray={`${circ} ${circ}`}
              animatedProps={ringProps}
            />
          </Svg>
          <Animated.View style={{ alignItems: 'center', transform: [{ scale: pop }] }}>
            {ended ? (
              <MaterialIcons name="check" size={40} color="#FFFFFF" />
            ) : (
              <StatNum color={final ? G.pink : ink} size={final ? 34 : 26}>
                {final ? String(left) : clock(left)}
              </StatNum>
            )}
          </Animated.View>
        </View>

        <View style={{ flex: 1, marginLeft: 14 }}>
          <ILText role="title" color="#FFFFFF" style={{ fontFamily: IL_FONTS.display, fontSize: 18, lineHeight: 23 }}>
            {label}
          </ILText>
          <Animated.View style={{ opacity: hush && running && !final ? pulse : 1 }}>
            <ILText
              role="bodySm"
              color={ended ? '#FFFFFF' : 'rgba(248,214,212,0.9)'}
              style={{ marginTop: 3, fontSize: 12.5, lineHeight: 17 }}
            >
              {status}
            </ILText>
          </Animated.View>
          <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 12 }}>
            <Pressable
              onPress={press}
              accessibilityRole="button"
              accessibilityLabel={cta}
              style={{
                backgroundColor: ended ? '#FFFFFF' : G.cta,
                borderRadius: 999,
                paddingVertical: 9,
                paddingHorizontal: 16,
                flexDirection: 'row',
                alignItems: 'center',
              }}
            >
              <MaterialIcons
                name={ended ? 'replay' : running ? 'pause' : 'play-arrow'}
                size={18}
                color={ended ? G.cta : '#FFFFFF'}
              />
              <ILText role="label" color={ended ? G.cta : '#FFFFFF'} style={{ marginLeft: 4, fontSize: 13.5 }}>
                {cta}
              </ILText>
            </Pressable>
            {left < secs && !ended ? (
              <Pressable
                onPress={reset}
                accessibilityRole="button"
                accessibilityLabel="Reset timer"
                hitSlop={8}
                style={{
                  marginLeft: 8,
                  width: 38,
                  height: 38,
                  borderRadius: 19,
                  borderWidth: 1,
                  borderColor: 'rgba(255,255,255,0.35)',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <MaterialIcons name="replay" size={17} color="#FFFFFF" />
              </Pressable>
            ) : null}
          </View>
        </View>
      </View>
    </View>
  );
}

function DoneCard({ label, doneCount, total, onAgain, onBack }) {
  return (
    <View style={{ marginTop: 18, backgroundColor: G.cta, borderRadius: 24, padding: 20, alignItems: 'center' }}>
      <View
        style={{
          width: 56,
          height: 56,
          borderRadius: 28,
          backgroundColor: '#FFFFFF',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <MaterialIcons name="check" size={30} color={G.cta} />
      </View>
      <ILText
        role="title"
        color="#FFFFFF"
        align="center"
        style={{ marginTop: 12, fontFamily: IL_FONTS.display, fontSize: 22, lineHeight: 28 }}
      >
        {label}
      </ILText>
      <ILText role="bodySm" color="rgba(255,255,255,0.85)" style={{ marginTop: 4, fontSize: 12 }}>
        {doneCount} of {total} steps done · come back tomorrow
      </ILText>
      <View style={{ flexDirection: 'row', marginTop: 16, alignSelf: 'stretch' }}>
        <Pressable
          onPress={onAgain}
          style={{
            flex: 1,
            borderRadius: 999,
            paddingVertical: 12,
            alignItems: 'center',
            borderWidth: 1,
            borderColor: '#FFFFFF',
            marginRight: 8,
          }}
        >
          <ILText role="label" color="#FFFFFF">
            Do it again
          </ILText>
        </Pressable>
        <Pressable
          onPress={onBack}
          style={{ flex: 1, borderRadius: 999, paddingVertical: 12, alignItems: 'center', backgroundColor: G.dark }}
        >
          <ILText role="label" color="#FFFFFF">
            Back to drills
          </ILText>
        </Pressable>
      </View>
    </View>
  );
}

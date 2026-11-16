import React, { useEffect, useMemo, useState } from 'react';
import { TextInput, View } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Reanimated, { Easing, FadeIn, useAnimatedStyle, useSharedValue, withTiming } from 'react-native-reanimated';
import { MaterialIcons } from '@expo/vector-icons';
import Pressable from '../../components/il/Press';
import ILText from '../../components/il/ILText';
import { IL_FONTS } from '../../constants/ironLadyBrand';
import { G, af } from '../../constants/guestTheme';
import { GUEST_KINDS } from '../../constants/cms';
import { useGuestCms } from '../../hooks/useGuestCms';
import { StatNum, WhiteCard } from './GuestBits';
import {
  DAILY_QUESTIONS,
  WORTH_ROLES,
  WORTH_TICKS,
  questionForDay,
  roleFromTitle,
  todayIst,
  worthRange,
  worthTrackPos,
} from './guestPractice';

const QOTD_KEY = 'il_qotd_v1';
const GREEN = '#1F7A4D';
const GREEN_BG = '#E6F4EC';
const RED_BG = '#FDECEC';

/**
 * Question of the day. One question a day (from the CMS, else the built-in ones):
 *   right → well done + why; wrong → one more try; wrong again → the answer is shown with why.
 * Either way the day's question is then complete, and the next one comes tomorrow.
 */
export function DailyQuestionCard() {
  const rows = useGuestCms(GUEST_KINDS.DAILY_QUESTION, DAILY_QUESTIONS);
  const day = todayIst();
  const q = useMemo(() => questionForDay(rows, day), [rows, day]);
  // { day, qid, tries: ['A'], status: 'open' | 'right' | 'revealed' }
  const [state, setState] = useState(null);

  useEffect(() => {
    let alive = true;
    AsyncStorage.getItem(QOTD_KEY)
      .then((raw) => {
        const saved = raw ? JSON.parse(raw) : null;
        if (!alive) return;
        setState(saved && saved.day === day && saved.qid === q?.id ? saved : { day, qid: q?.id, tries: [], status: 'open' });
      })
      .catch(() => alive && setState({ day, qid: q?.id, tries: [], status: 'open' }));
    return () => {
      alive = false;
    };
  }, [day, q?.id]);

  if (!q || !state) return null;

  const save = (next) => {
    setState(next);
    AsyncStorage.setItem(QOTD_KEY, JSON.stringify(next)).catch(() => {});
  };

  const pick = (key) => {
    if (state.status !== 'open' || state.tries.includes(key)) return;
    const tries = [...state.tries, key];
    if (key === q.answer) save({ ...state, tries, status: 'right' });
    else if (tries.length >= 2) save({ ...state, tries, status: 'revealed' });
    else save({ ...state, tries });
  };

  const done = state.status !== 'open';
  const missedOnce = state.status === 'open' && state.tries.length === 1;

  return (
    <WhiteCard style={{ marginTop: 12, borderRadius: 22, padding: 16 }}>
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
        <ILText role="eyebrow" color={G.cta} style={[af, { fontSize: 10 }]}>
          Question of the day
        </ILText>
        <ILText role="bodySm" color={G.meta} style={{ fontSize: 11 }}>
          {`Principle · ${q.principle}`}
        </ILText>
      </View>
      <ILText role="label" color={G.ink} style={{ marginTop: 10, fontSize: 16, lineHeight: 22 }}>
        {q.question}
      </ILText>

      {q.options.map(([k, t]) => {
        const tried = state.tries.includes(k);
        const isAnswer = k === q.answer;
        const showRight = isAnswer && done;
        const showWrong = tried && !isAnswer;
        const border = showRight ? GREEN : showWrong ? G.cta : G.line;
        const bg = showRight ? GREEN_BG : showWrong ? RED_BG : G.white;
        return (
          <Pressable
            key={k}
            onPress={() => pick(k)}
            disabled={done || tried}
            accessibilityRole="button"
            accessibilityLabel={`Option ${k}: ${t}`}
            style={{
              marginTop: 10,
              borderRadius: 16,
              borderWidth: showRight || showWrong ? 1.5 : 1,
              borderColor: border,
              padding: 12,
              flexDirection: 'row',
              alignItems: 'center',
              backgroundColor: bg,
              opacity: done && !showRight && !showWrong ? 0.55 : 1,
            }}
          >
            <View
              style={{
                width: 26,
                height: 26,
                borderRadius: 13,
                backgroundColor: showRight ? GREEN : showWrong ? G.cta : G.mutedFill,
                alignItems: 'center',
                justifyContent: 'center',
                marginRight: 10,
              }}
            >
              {showRight || showWrong ? (
                <MaterialIcons name={showRight ? 'check' : 'close'} size={16} color="#FFFFFF" />
              ) : (
                <ILText role="label" color={G.ink} style={[af, { fontSize: 12 }]}>
                  {k}
                </ILText>
              )}
            </View>
            <ILText role="bodySm" color={G.ink} style={{ flex: 1, fontSize: 13.5, lineHeight: 19 }}>
              {t}
            </ILText>
          </Pressable>
        );
      })}

      {missedOnce ? (
        <Reanimated.View
          key="retry"
          entering={FadeIn.duration(200)}
          style={{ marginTop: 14, backgroundColor: RED_BG, borderRadius: 16, padding: 14 }}
        >
          <ILText role="label" color={G.cta} style={{ fontSize: 14 }}>
            Not quite — one more try.
          </ILText>
          <ILText role="bodySm" color={G.ink} style={{ marginTop: 4, fontSize: 12.5, lineHeight: 18 }}>
            Think about what the Iron Lady way would be here, then pick again.
          </ILText>
        </Reanimated.View>
      ) : null}

      {done ? (
        <Reanimated.View
          key="result"
          entering={FadeIn.duration(220)}
          style={{
            marginTop: 14,
            backgroundColor: state.status === 'right' ? GREEN_BG : '#F3F0E4',
            borderRadius: 16,
            padding: 14,
          }}
        >
          <ILText
            role="title"
            color={state.status === 'right' ? GREEN : G.ink}
            style={{ fontFamily: IL_FONTS.display, fontSize: 18, lineHeight: 24 }}
          >
            {state.status === 'right'
              ? state.tries.length === 1
                ? `Well done — that’s ${q.principle.toLowerCase()}.`
                : `Got it on the second try — that’s ${q.principle.toLowerCase()}.`
              : `The answer is ${q.answer}.`}
          </ILText>
          {q.explain ? (
            <ILText role="bodySm" color={G.ink} style={{ marginTop: 6, fontSize: 13, lineHeight: 19, opacity: 0.85 }}>
              {q.explain}
            </ILText>
          ) : null}
          <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 10 }}>
            <MaterialIcons name="event-available" size={16} color={G.meta} />
            <ILText role="bodySm" color={G.meta} style={{ marginLeft: 6, fontSize: 12 }}>
              Today’s question is done. A new one comes tomorrow.
            </ILText>
          </View>
        </Reanimated.View>
      ) : null}
    </WhiteCard>
  );
}

/** The 0 → ₹2 Cr track: her range as a red band that glides as she types, her 5x number as the dot. */
function WorthScale({ range }) {
  const [w, setW] = useState(0);
  const lo = useSharedValue(0);
  const hi = useSharedValue(0);
  const mid = useSharedValue(0);
  useEffect(() => {
    const cfg = { duration: 420, easing: Easing.out(Easing.cubic) };
    lo.value = withTiming(range ? worthTrackPos(range.low) : 0, cfg);
    hi.value = withTiming(range ? worthTrackPos(range.high) : 0, cfg);
    mid.value = withTiming(range ? worthTrackPos(range.mid) : 0, cfg);
  }, [range?.low, range?.high, range?.mid]);
  const band = useAnimatedStyle(() => ({ left: lo.value * w, width: Math.max(6, (hi.value - lo.value) * w) }));
  const dot = useAnimatedStyle(() => ({ transform: [{ translateX: mid.value * w - 9 }], opacity: range ? 1 : 0 }));
  return (
    <View style={{ marginTop: 16 }}>
      <View onLayout={(e) => setW(e.nativeEvent.layout.width)} style={{ height: 22, justifyContent: 'center' }}>
        <View style={{ height: 6, borderRadius: 3, backgroundColor: '#E8E3D6' }} />
        <Reanimated.View
          style={[{ position: 'absolute', height: 6, borderRadius: 3, backgroundColor: range ? G.cta : 'transparent' }, band]}
        />
        <Reanimated.View
          style={[
            {
              position: 'absolute',
              left: 0,
              width: 18,
              height: 18,
              borderRadius: 9,
              backgroundColor: '#FFFFFF',
              borderWidth: 4,
              borderColor: G.cta,
            },
            dot,
          ]}
        />
      </View>
      <View style={{ height: 16, marginTop: 4 }}>
        {WORTH_TICKS.map((t) => (
          <ILText
            key={t.lakh}
            role="bodySm"
            color={G.meta}
            style={{
              position: 'absolute',
              left: Math.max(0, worthTrackPos(t.lakh) * w - (t.lakh === 200 ? 30 : 14)),
              fontSize: 10.5,
            }}
          >
            {t.label}
          </ILText>
        ))}
      </View>
    </View>
  );
}

/** Know your worth: she types her role and years of experience → the Iron Lady salary range. */
export function KnowYourWorthCard() {
  const [title, setTitle] = useState('');
  const [yearsText, setYearsText] = useState('');
  const roleId = roleFromTitle(title);
  const years = Number(yearsText);
  const ready = Boolean(roleId) && Number.isFinite(years) && years >= 1;
  const r = ready ? worthRange(roleId, years) : null;
  const level = roleId ? WORTH_ROLES.find((x) => x.id === roleId)?.label : '';
  const box = {
    borderBottomWidth: 1.5,
    borderBottomColor: G.ink,
    paddingVertical: 6,
    fontSize: 16,
    fontFamily: IL_FONTS.medium,
    color: G.ink,
  };
  return (
    <WhiteCard style={{ marginTop: 24, borderRadius: 22, padding: 16 }}>
      <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
        <ILText role="eyebrow" color={G.cta} style={[af, { fontSize: 10 }]}>
          Know your worth
        </ILText>
        <ILText role="bodySm" color={G.meta} style={{ fontSize: 11 }}>
          The 5x rule
        </ILText>
      </View>

      <View style={{ flexDirection: 'row', marginTop: 14 }}>
        <View style={{ flex: 1, marginRight: 14 }}>
          <ILText role="bodySm" color={G.meta} style={{ fontSize: 11.5 }}>
            Your role
          </ILText>
          <TextInput
            value={title}
            onChangeText={setTitle}
            placeholder="Senior Manager"
            placeholderTextColor="rgba(17,55,68,0.35)"
            autoCapitalize="words"
            maxLength={60}
            style={box}
            accessibilityLabel="Your role"
          />
        </View>
        <View style={{ width: 92 }}>
          <ILText role="bodySm" color={G.meta} style={{ fontSize: 11.5 }}>
            Years
          </ILText>
          <TextInput
            value={yearsText}
            onChangeText={(v) => setYearsText(v.replace(/[^0-9]/g, '').slice(0, 2))}
            placeholder="10"
            placeholderTextColor="rgba(17,55,68,0.35)"
            keyboardType="number-pad"
            maxLength={2}
            style={box}
            accessibilityLabel="Years of experience"
          />
        </View>
      </View>
      {level ? (
        <View
          style={{
            alignSelf: 'flex-start',
            marginTop: 10,
            backgroundColor: G.pink,
            borderRadius: 999,
            paddingHorizontal: 10,
            paddingVertical: 4,
          }}
        >
          <ILText role="label" color={G.cta} style={{ fontSize: 11.5 }}>
            {`Read as ${level}`}
          </ILText>
        </View>
      ) : null}

      <View style={{ flexDirection: 'row', alignItems: 'baseline', flexWrap: 'wrap', marginTop: 16 }}>
        <StatNum size={30} color={r ? G.ink : 'rgba(17,55,68,0.25)'}>
          {r ? `${r.lowLabel} – ${r.highLabel.replace('₹', '')}` : '₹— lakh'}
        </StatNum>
        <ILText role="bodySm" color={G.meta} style={{ marginLeft: 8, fontSize: 13 }}>
          your market number
        </ILText>
      </View>

      <WorthScale range={r} />

      <ILText role="bodySm" color={G.meta} style={{ marginTop: 12, fontSize: 12, lineHeight: 17 }}>
        {r
          ? 'A year, for your level and experience. Earning below this? You are under-paid — the Masterclass shows how to close the gap.'
          : 'Type your role and years — see what Iron Ladies at your level earn.'}
      </ILText>
    </WhiteCard>
  );
}

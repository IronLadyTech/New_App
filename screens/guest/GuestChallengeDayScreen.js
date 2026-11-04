import React, { useEffect, useRef, useState } from 'react';
import { Pressable, ScrollView, Share, TextInput, View } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { MaterialIcons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { IL_FONTS } from '../../constants/ironLadyBrand';
import ILText from '../../components/il/ILText';
import { G, af } from '../../constants/guestTheme';
import { GuestBackBar, Page, WhiteCard } from './GuestBits';
import { LIQUID_TAB_PAD } from '../../components/il/LiquidTabBar';
import {
  dayState,
  opensLabel,
  saveDraft,
  submitDay,
  useGuestChallenge,
} from '../../services/guestChallenge';
import {
  BREAKTHROUGH_ACTIONS,
  CHALLENGE_LENGTH,
  composeBrand,
  dayContent,
  formatWorth,
} from './challengeContent';

const field = {
  marginTop: 12,
  borderRadius: 18,
  backgroundColor: G.page,
  paddingHorizontal: 16,
  paddingVertical: 14,
  color: G.ink,
  fontSize: 16,
  lineHeight: 23,
};

function Field({ label, hint, value, onChange, multiline = true, minHeight = 80, ...rest }) {
  return (
    <View style={{ marginTop: 14 }}>
      <ILText role="label" color={G.ink} style={{ fontSize: 14 }}>
        {label}
      </ILText>
      {hint ? (
        <ILText role="bodySm" color={G.meta} style={{ marginTop: 2, fontSize: 12, lineHeight: 17 }}>
          {hint}
        </ILText>
      ) : null}
      <TextInput
        value={value || ''}
        onChangeText={onChange}
        multiline={multiline}
        textAlignVertical={multiline ? 'top' : 'center'}
        placeholderTextColor={G.meta}
        style={[field, multiline ? { minHeight } : null]}
        {...rest}
      />
    </View>
  );
}

function TaskCard({ eyebrow, title, children }) {
  return (
    <WhiteCard style={{ marginTop: 12, borderRadius: 24, padding: 18 }}>
      <ILText role="eyebrow" color={G.cta} style={[af, { fontSize: 10, letterSpacing: 1.1 }]}>
        {eyebrow}
      </ILText>
      <ILText
        role="title"
        color={G.ink}
        style={{ marginTop: 8, fontFamily: IL_FONTS.display, fontSize: 22, lineHeight: 28 }}
      >
        {title}
      </ILText>
      {children}
    </WhiteCard>
  );
}

function BhagTask({ a, set }) {
  const picked = a.actions || [];
  const toggle = (item) => {
    const next = picked.includes(item)
      ? picked.filter((x) => x !== item)
      : picked.length >= 2
        ? [picked[1], item]
        : [...picked, item];
    set({ actions: next });
  };
  return (
    <>
      <TaskCard eyebrow="Task 1 · Your BHAG" title="Write your Big Hairy Audacious Goal in one sentence.">
        <Field
          label="My BHAG"
          hint="Specific, with a date, and big enough that saying it aloud feels uncomfortable."
          value={a.bhag}
          onChange={(bhag) => set({ bhag })}
          placeholder="e.g. By March 2028 I will run the India P&L, not report into it."
          minHeight={96}
        />
      </TaskCard>
      <TaskCard eyebrow={`Task 2 · Breakthrough actions · ${picked.length} of 2`} title="Pick the two actions that will move your BHAG most.">
        <View style={{ marginTop: 8 }}>
          {BREAKTHROUGH_ACTIONS.map((item) => {
            const on = picked.includes(item);
            return (
              <Pressable
                key={item}
                onPress={() => toggle(item)}
                accessibilityRole="button"
                accessibilityState={{ selected: on }}
                style={{
                  marginTop: 8,
                  borderRadius: 999,
                  paddingVertical: 13,
                  paddingHorizontal: 18,
                  backgroundColor: on ? G.dark : G.white,
                  borderWidth: 1,
                  borderColor: on ? G.dark : G.line,
                }}
              >
                <ILText role="label" color={on ? '#FFFFFF' : G.ink} style={{ fontSize: 14 }}>
                  {item}
                </ILText>
              </Pressable>
            );
          })}
        </View>
      </TaskCard>
    </>
  );
}

function WorthTask({ a, set }) {
  const worth = formatWorth(a.years);
  return (
    <>
      <TaskCard eyebrow="Task 1 · Your number" title="The 5x rule: five times your years of experience.">
        <Field
          label="Years of experience"
          value={a.years ? String(a.years) : ''}
          onChange={(t) => set({ years: t.replace(/\D/g, '').slice(0, 2) })}
          keyboardType="number-pad"
          multiline={false}
          placeholder="e.g. 15"
        />
        {worth ? (
          <View style={{ marginTop: 14, backgroundColor: G.dark, borderRadius: 18, padding: 16 }}>
            <ILText role="eyebrow" color={G.pink} style={[af, { fontSize: 10 }]}>
              Your market worth
            </ILText>
            <ILText
              role="display"
              color="#FFFFFF"
              style={{ marginTop: 6, fontFamily: IL_FONTS.display, fontSize: 34, lineHeight: 40 }}
            >
              {worth}
            </ILText>
            <ILText role="bodySm" color="rgba(255,255,255,0.7)" style={{ marginTop: 4, fontSize: 12, lineHeight: 17 }}>
              A starting point for your roadmap, not a promise. It goes on your Leadership Card.
            </ILText>
          </View>
        ) : null}
      </TaskCard>
      <TaskCard eyebrow="Task 2 · Projection" title="What did you do this quarter that nobody senior knows about?">
        <Field
          label="One line"
          hint="What you did, and what it made possible."
          value={a.hidden}
          onChange={(hidden) => set({ hidden })}
          placeholder="e.g. I rebuilt the vendor contract and saved 18% before renewal."
        />
      </TaskCard>
    </>
  );
}

function BrandTask({ a, set }) {
  const statement = composeBrand(a);
  return (
    <>
      <TaskCard eyebrow="Task 1 · Brand statement" title="Write your brand in three parts.">
        <Field
          label="1. Your differentiated strength"
          hint="Your character plus your strengths. What people come to you for."
          value={a.strength}
          onChange={(strength) => set({ strength })}
          placeholder="e.g. I turn messy, political problems into a plan people sign up to."
        />
        <Field
          label="2. One story of accomplishment"
          value={a.story}
          onChange={(story) => set({ story })}
          placeholder="e.g. I took a stalled launch live in 9 weeks across 4 teams."
        />
        <Field
          label="3. Recognition (optional)"
          hint="Awards, rewards, or who has recognised you."
          value={a.recognition}
          onChange={(recognition) => set({ recognition })}
          placeholder="e.g. Recognised as the region’s leader of the year."
          minHeight={60}
        />
        {statement ? (
          <View style={{ marginTop: 16, backgroundColor: G.pink, borderRadius: 18, padding: 16 }}>
            <ILText role="eyebrow" color={G.cta} style={[af, { fontSize: 10 }]}>
              Your statement
            </ILText>
            <ILText
              role="body"
              color={G.ink}
              style={{ marginTop: 6, fontFamily: IL_FONTS.displayItalic, fontSize: 16, lineHeight: 24 }}
            >
              {statement}
            </ILText>
            <Pressable
              onPress={() => Share.share({ message: statement }).catch(() => {})}
              style={{ marginTop: 12, flexDirection: 'row', alignItems: 'center' }}
            >
              <MaterialIcons name="share" size={16} color={G.cta} />
              <ILText role="label" color={G.cta} style={{ marginLeft: 6, fontSize: 13 }}>
                Share it with your group
              </ILText>
            </Pressable>
          </View>
        ) : null}
      </TaskCard>
      <TaskCard eyebrow="Task 2 · Shameless pitch" title="Say it aloud as a 60-second pitch.">
        <ILText role="body" color={G.meta} style={{ marginTop: 8, fontSize: 14, lineHeight: 21 }}>
          Speak to the other person’s need, differentiate yourself on two ideas, and end with a
          visible offer. Say it once, out loud, without apologising.
        </ILText>
        <Pressable
          onPress={() => set({ pitched: !a.pitched })}
          accessibilityRole="checkbox"
          accessibilityState={{ checked: !!a.pitched }}
          style={{ marginTop: 14, flexDirection: 'row', alignItems: 'center' }}
        >
          <MaterialIcons name={a.pitched ? 'check-box' : 'check-box-outline-blank'} size={22} color={a.pitched ? G.cta : G.meta} />
          <ILText role="label" color={G.ink} style={{ marginLeft: 8, fontSize: 14 }}>
            I said my pitch aloud
          </ILText>
        </Pressable>
      </TaskCard>
    </>
  );
}

function AskTask({ a, set }) {
  return (
    <TaskCard eyebrow="Task · Your ask" title="Name the ask you have been avoiding.">
      <Field
        label="The ask"
        hint="A role, a raise, a project, a sponsor. One line."
        value={a.ask}
        onChange={(ask) => set({ ask })}
        placeholder="e.g. Leading the Q3 launch end to end."
        minHeight={60}
      />
      <Field
        label="Your first three sentences"
        hint="How you would open the conversation. Their need first."
        value={a.opening}
        onChange={(opening) => set({ opening })}
        placeholder="e.g. The launch needs one owner across sales and product. I have run both sides. I’d like to lead it end to end."
        minHeight={110}
      />
    </TaskCard>
  );
}

const TASKS = { bhag: BhagTask, worth: WorthTask, brand: BrandTask, ask: AskTask };

function canSubmit(task, a) {
  const has = (s, min = 3) => String(s || '').trim().length >= min;
  if (task === 'bhag') return has(a.bhag, 8) && (a.actions || []).length > 0;
  if (task === 'worth') return Number(a.years) > 0 && has(a.hidden);
  if (task === 'brand') return has(a.strength) && has(a.story);
  if (task === 'ask') return has(a.ask) && has(a.opening, 8);
  return false;
}

export default function GuestChallengeDayScreen({ navigation, route }) {
  const n = Math.min(CHALLENGE_LENGTH, Math.max(1, Number(route?.params?.day) || 1));
  const day = dayContent(n);
  const insets = useSafeAreaInsets();
  const { progress, ready, now } = useGuestChallenge();
  const state = dayState(progress, n, now);
  const [answers, setAnswers] = useState(null);
  const [busy, setBusy] = useState(false);
  const draftTimer = useRef(null);

  // Her saved answers (or draft) once progress has loaded.
  useEffect(() => {
    if (ready && answers == null) setAnswers(progress.answers?.[n] || {});
  }, [ready, answers, progress, n]);

  useEffect(() => () => clearTimeout(draftTimer.current), []);

  const set = (patch) => {
    setAnswers((cur) => {
      const next = { ...(cur || {}), ...patch };
      clearTimeout(draftTimer.current);
      draftTimer.current = setTimeout(() => saveDraft(n, next), 600);
      return next;
    });
  };

  const Task = TASKS[day.task];
  const a = answers || {};
  const ok = canSubmit(day.task, a);

  const submit = async () => {
    if (!ok || busy) return;
    setBusy(true);
    clearTimeout(draftTimer.current);
    await submitDay(n, a);
    navigation.replace('ChallengeComplete', { day: n });
  };

  return (
    <Page>
      <StatusBar style="dark" />
      <View style={{ paddingTop: Math.max(insets.top, 8) }}>
        <GuestBackBar title={`Day ${n} of ${CHALLENGE_LENGTH}`} sub={day.title} onBack={() => navigation.goBack()} />
      </View>
      <ScrollView
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
        contentContainerStyle={{
          paddingHorizontal: 20,
          paddingBottom: LIQUID_TAB_PAD + Math.max(insets.bottom, 8),
        }}
      >
        {state === 'locked' && ready ? (
          <WhiteCard style={{ borderRadius: 24, padding: 20, alignItems: 'center' }}>
            <MaterialIcons name="lock-outline" size={26} color={G.meta} />
            <ILText role="label" color={G.ink} style={{ marginTop: 10, fontSize: 16 }}>
              {opensLabel(progress, n, now)}
            </ILText>
            <ILText role="bodySm" color={G.meta} align="center" style={{ marginTop: 6, fontSize: 13, lineHeight: 19 }}>
              One day at a time, so each one has room to sink in.
            </ILText>
          </WhiteCard>
        ) : (
          <>
            <ILText role="body" color={G.meta} style={{ fontSize: 15, lineHeight: 22 }}>
              {day.intro}
            </ILText>

            <View style={{ marginTop: 14, backgroundColor: G.dark, borderRadius: 24, padding: 18 }}>
              <ILText role="eyebrow" color={G.pink} style={[af, { fontSize: 10, letterSpacing: 1.1 }]}>
                From the Masterclass · 3 min read
              </ILText>
              {day.teach.map((t, i) => (
                <View
                  key={t.h}
                  style={{
                    marginTop: 14,
                    paddingTop: i ? 14 : 0,
                    borderTopWidth: i ? 1 : 0,
                    borderTopColor: 'rgba(255,255,255,0.12)',
                  }}
                >
                  <ILText
                    role="title"
                    color="#FFFFFF"
                    style={{ fontFamily: IL_FONTS.display, fontSize: 19, lineHeight: 25 }}
                  >
                    {t.h}
                  </ILText>
                  <ILText role="body" color="rgba(255,255,255,0.78)" style={{ marginTop: 6, fontSize: 14, lineHeight: 21 }}>
                    {t.b}
                  </ILText>
                </View>
              ))}
            </View>

            {answers ? <Task a={a} set={set} /> : null}

            <Pressable
              onPress={submit}
              disabled={!ok || busy}
              accessibilityState={{ disabled: !ok || busy }}
              style={{
                marginTop: 16,
                backgroundColor: G.cta,
                opacity: ok && !busy ? 1 : 0.45,
                borderRadius: 999,
                paddingVertical: 15,
                alignItems: 'center',
                flexDirection: 'row',
                justifyContent: 'center',
              }}
            >
              <ILText role="label" color="#FFFFFF">
                {state === 'done' ? 'Save changes' : `Submit Day ${n}`}
              </ILText>
              <MaterialIcons name="arrow-forward" size={16} color="#FFFFFF" style={{ marginLeft: 6 }} />
            </Pressable>

            <View
              style={{
                marginTop: 12,
                borderRadius: 22,
                borderWidth: 1,
                borderColor: G.dash,
                padding: 16,
                flexDirection: 'row',
                alignItems: 'center',
              }}
            >
              <MaterialIcons name={state === 'done' ? 'lock-open' : 'lock-outline'} size={18} color={G.meta} />
              <View style={{ flex: 1, marginLeft: 12 }}>
                <ILText role="eyebrow" color={G.meta} style={[af, { fontSize: 9, letterSpacing: 1 }]}>
                  Bonus · {state === 'done' ? 'Unlocked' : 'Unlocks on submit'}
                </ILText>
                <ILText role="label" color={G.ink} style={{ marginTop: 4, fontSize: 14, lineHeight: 20 }}>
                  {day.bonus.title}
                </ILText>
              </View>
            </View>
          </>
        )}
      </ScrollView>
    </Page>
  );
}

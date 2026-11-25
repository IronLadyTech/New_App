import React, { useEffect, useState } from 'react';
import { TextInput, View } from 'react-native';
import Pressable from '../il/Press';
import ILText from '../il/ILText';
import { G } from '../../constants/guestTheme';
import { IL_FONTS } from '../../constants/ironLadyBrand';
import { WhiteCard } from '../../screens/lep/LepBits';
import { CHALLENGE_DAYS, formatChallengeDay, lepChallengeCounts } from '../../utils/lepChallenges';

const RED = '#E52A2A';

/** Coaches' end-of-week questions, per challenge. */
const QUESTIONS = {
  c1: {
    stats: (c) => [
      ['A-Game table updated', `${c.per.agame} of ${CHALLENGE_DAYS} days`],
      ['Mirror-work learnings', `${c.per.mirror} of ${CHALLENGE_DAYS} days`],
    ],
    mcq: [
      { q: 'When were you most at your A-Game?', options: ['At work', 'At home', 'Leading people', 'In difficult conversations'] },
      { q: 'What did your mirror work show you most?', options: ['More confidence', 'Old beliefs showing up', 'Clarity on what I want', 'It was hard to do daily'] },
    ],
    line: 'Your biggest learning this week',
  },
  c2: {
    stats: (c) => [
      ['LinkedIn profile shared', c.once ? 'Yes' : 'Not yet'],
      ['LinkedIn posts', `${c.per.post} of ${CHALLENGE_DAYS} days`],
    ],
    mcq: [
      { q: 'What did you post about most?', options: ['My differentiated strength', 'Learnings from LEP', 'My achievements', 'Views on my industry'] },
      { q: 'What happened after posting?', options: ['New connections or messages', 'Comments and reactions', 'Quiet so far', 'An opportunity came up'] },
    ],
    line: 'Your learning this week',
  },
  c3: {
    stats: (c) => [
      ['Pitches practised', `${c.per.pitch} of ${CHALLENGE_DAYS} days`],
      ['Real pitch', c.once ? 'Made' : 'Not yet'],
    ],
    mcq: [
      { q: 'Did you make a real pitch?', options: ['Yes, and got a yes', 'Yes, waiting to hear', 'Yes, and got a no', 'Not yet'] },
      { q: 'What held you back most?', options: ['Fear of hearing no', 'Knowing what to ask', 'Finding the time', 'Nothing held me back'] },
    ],
    line: 'Your learnings from the week',
  },
};

/**
 * End-of-week challenge summary: her numbers from the daily entries, two tap questions and one
 * line. It hands the finished answer up as text (the task stays a write-up for the LMS / coaches).
 */
export default function LepChallengeSummaryForm({ state, log, onChangeText, earlierText }) {
  const { challenge } = state;
  const spec = QUESTIONS[challenge.key];
  const counts = lepChallengeCounts(challenge, state, log);
  const stats = spec.stats(counts);
  const [picks, setPicks] = useState({});
  const [line, setLine] = useState('');

  const complete = spec.mcq.every((_, i) => picks[i]) && line.trim().length > 0;
  const statsKey = stats.map((s) => s[1]).join('|');
  useEffect(() => {
    if (!complete) {
      onChangeText('');
      return;
    }
    const text = [
      `${challenge.title} — summary`,
      ...stats.map(([k, v]) => `${k}: ${v}`),
      ...spec.mcq.map((m, i) => `${m.q} ${picks[i]}`),
      `${spec.line}: ${line.trim()}`,
    ].join('\n');
    onChangeText(text);
  }, [complete, picks, line, statsKey]);

  if (!state.summaryOpen) {
    return (
      <WhiteCard style={{ marginTop: 18, borderRadius: 18, padding: 16 }}>
        <ILText role="label" color={G.ink} style={{ fontSize: 16 }}>
          Your summary opens on Day 7
        </ILText>
        <ILText role="bodySm" color={G.body} style={{ marginTop: 6, fontSize: 14, lineHeight: 20 }}>
          {state.phase === 'before'
            ? `This challenge starts after the ${state.sessionTitle} session. Each day's items will be on your Home screen.`
            : `Do today's challenge on your Home screen. On ${formatChallengeDay(state.lastIso)} you can write your week summary here.`}
        </ILText>
        {earlierText ? (
          <ILText role="bodySm" color={G.meta} style={{ marginTop: 10, fontSize: 13, lineHeight: 18 }}>
            {`Your earlier answer: ${earlierText}`}
          </ILText>
        ) : null}
      </WhiteCard>
    );
  }

  return (
    <WhiteCard style={{ marginTop: 18, borderRadius: 18, padding: 16 }}>
      {earlierText ? (
        <View style={{ marginBottom: 14, padding: 12, borderRadius: 12, backgroundColor: G.pink }}>
          <ILText role="label" color={G.meta} style={{ fontSize: 12 }}>
            Your earlier answer
          </ILText>
          <ILText role="bodySm" color={G.ink} style={{ marginTop: 4, fontSize: 14, lineHeight: 20 }}>
            {earlierText}
          </ILText>
        </View>
      ) : null}
      <ILText role="label" color={G.ink} style={{ fontSize: 16 }}>
        Your week
      </ILText>
      {stats.map(([k, v]) => (
        <View key={k} style={{ flexDirection: 'row', justifyContent: 'space-between', marginTop: 8 }}>
          <ILText role="bodySm" color={G.body} style={{ fontSize: 14 }}>
            {k}
          </ILText>
          <ILText role="label" color={G.ink} style={{ fontSize: 14 }}>
            {v}
          </ILText>
        </View>
      ))}

      {spec.mcq.map((m, i) => (
        <View key={m.q} style={{ marginTop: 18 }}>
          <ILText role="label" color={G.ink} style={{ fontSize: 15, lineHeight: 21 }}>
            {`${i + 1}. ${m.q}`}
          </ILText>
          {m.options.map((opt) => {
            const on = picks[i] === opt;
            return (
              <Pressable
                key={opt}
                onPress={() => setPicks((p) => ({ ...p, [i]: opt }))}
                accessibilityRole="radio"
                accessibilityState={{ checked: on }}
                style={{
                  marginTop: 8,
                  borderRadius: 12,
                  borderWidth: on ? 2 : 1,
                  borderColor: on ? G.dark : G.line,
                  backgroundColor: on ? G.pink : '#FFFFFF',
                  paddingHorizontal: 12,
                  paddingVertical: 10,
                  flexDirection: 'row',
                  alignItems: 'center',
                }}
              >
                <View
                  style={{
                    width: 18,
                    height: 18,
                    borderRadius: 9,
                    borderWidth: 2,
                    borderColor: on ? RED : G.line,
                    alignItems: 'center',
                    justifyContent: 'center',
                    marginRight: 10,
                  }}
                >
                  {on ? <View style={{ width: 8, height: 8, borderRadius: 4, backgroundColor: RED }} /> : null}
                </View>
                <ILText role="body" color={G.ink} style={{ fontSize: 14, flex: 1 }}>
                  {opt}
                </ILText>
              </Pressable>
            );
          })}
        </View>
      ))}

      <ILText role="label" color={G.ink} style={{ marginTop: 18, fontSize: 15 }}>
        {`${spec.mcq.length + 1}. ${spec.line}`}
      </ILText>
      <TextInput
        value={line}
        onChangeText={setLine}
        placeholder="One line"
        placeholderTextColor="#B8B4A8"
        multiline
        style={{
          marginTop: 8,
          minHeight: 70,
          borderWidth: 1,
          borderColor: G.line,
          borderRadius: 12,
          paddingHorizontal: 12,
          paddingVertical: 9,
          fontFamily: IL_FONTS.regular,
          fontSize: 14,
          color: G.ink,
        }}
      />
      {!complete ? (
        <ILText role="bodySm" color={G.meta} style={{ marginTop: 8, fontSize: 12 }}>
          Answer each question to submit.
        </ILText>
      ) : null}
    </WhiteCard>
  );
}

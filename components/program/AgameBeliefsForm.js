import React from 'react';
import { View } from 'react-native';
import { IL_FONTS } from '../../constants/ironLadyBrand';
import ILText from '../il/ILText';
import { G, af } from '../../constants/guestTheme';
import { AGAME_QUESTION_LABELS } from '../../constants/formTemplates';
import { WhiteCard } from '../../screens/lep/LepBits';
import { Field, PlainInput, SectionTitle } from './FormBits';

const SITUATION_BLOCKS = [
  {
    key: 'defeat',
    title: 'Situation 1',
    heading: 'Failure or defeat',
    sub: 'Think of a situation where you experienced failure or defeat.',
    headerBg: G.pink,
    border: G.cta,
  },
  {
    key: 'accomplished',
    title: 'Situation 2',
    heading: 'Felt accomplished',
    sub: 'Think of a situation where you felt accomplished.',
    headerBg: '#E3EEF0',
    border: G.tealLight,
  },
];

function SituationBlock({ meta, data, onChange, onInputFocus }) {
  const setSituation = (v) => onChange({ ...data, situation: v });
  const setAnswer = (i, v) => {
    const answers = [...(data.answers || [])];
    while (answers.length < AGAME_QUESTION_LABELS.length) answers.push('');
    answers[i] = v;
    onChange({ ...data, answers });
  };

  return (
    <View
      style={{
        marginTop: 14,
        borderRadius: 16,
        borderWidth: 1.5,
        borderColor: meta.border,
        backgroundColor: G.white,
        overflow: 'hidden',
      }}
    >
      <View style={{ backgroundColor: meta.headerBg, paddingHorizontal: 14, paddingVertical: 12 }}>
        <ILText role="eyebrow" color={G.cta} style={[af, { fontSize: 10 }]}>
          {meta.title}
        </ILText>
        <ILText
          role="label"
          color={G.ink}
          style={{ marginTop: 4, fontFamily: IL_FONTS.semibold, fontSize: 16 }}
        >
          {meta.heading}
        </ILText>
        <ILText role="bodySm" color={G.body} style={{ marginTop: 4, fontSize: 13, lineHeight: 18 }}>
          {meta.sub}
        </ILText>
      </View>

      <View style={{ paddingHorizontal: 14, paddingBottom: 14 }}>
        <ILText role="label" color={G.ink} style={{ marginTop: 14, fontSize: 14 }}>
          The situation was
        </ILText>
        <PlainInput
          value={data.situation || ''}
          onChangeText={setSituation}
          minHeight={80}
          onFocus={onInputFocus}
        />

        {AGAME_QUESTION_LABELS.map((label, i) => (
          <View
            key={label}
            style={{
              marginTop: 18,
              paddingTop: i > 0 ? 0 : 4,
            }}
          >
            <ILText role="label" color={G.ink} style={{ fontSize: 14, lineHeight: 22 }}>
              {label}
            </ILText>
            <PlainInput
              value={(data.answers || [])[i] || ''}
              onChangeText={(v) => setAnswer(i, v)}
              minHeight={80}
              onFocus={onInputFocus}
            />
          </View>
        ))}
      </View>
    </View>
  );
}

function ReflectionBlock({ title, eyebrow, children, tint = G.mutedFill }) {
  return (
    <View
      style={{
        marginTop: 16,
        borderRadius: 16,
        backgroundColor: tint,
        padding: 14,
      }}
    >
      <ILText role="eyebrow" color={G.cta} style={[af, { fontSize: 10 }]}>
        {eyebrow}
      </ILText>
      <ILText
        role="label"
        color={G.ink}
        style={{ marginTop: 4, fontFamily: IL_FONTS.semibold, fontSize: 15 }}
      >
        {title}
      </ILText>
      <View style={{ marginTop: 4 }}>{children}</View>
    </View>
  );
}

export default function AgameBeliefsForm({ form, setForm, onInputFocus }) {
  const setBlock = (key, data) => setForm((prev) => ({ ...prev, [key]: data }));

  return (
    <View style={{ marginTop: 18 }}>
      <WhiteCard style={{ borderRadius: 18, padding: 14 }}>
        <ILText role="eyebrow" color={G.cta} style={[af, { fontSize: 10 }]}>
          YOUR A-GAME BELIEFS SHEET
        </ILText>
        <ILText role="bodySm" color={G.meta} style={{ marginTop: 6, fontSize: 13, lineHeight: 18 }}>
          Work through each block in order — two situations first, then beliefs, emotions, and
          habits.
        </ILText>

      </WhiteCard>

      {SITUATION_BLOCKS.map((meta) => (
        <SituationBlock
          key={meta.key}
          meta={meta}
          data={form[meta.key] || { situation: '', answers: [] }}
          onChange={(data) => setBlock(meta.key, data)}
          onInputFocus={onInputFocus}
        />
      ))}

      <ReflectionBlock title="Top beliefs" eyebrow="REFLECT">
        <Field
          label="Empowering beliefs"
          value={form.empoweringBeliefs || ''}
          onChangeText={(v) => setForm((prev) => ({ ...prev, empoweringBeliefs: v }))}
          onFocus={onInputFocus}
        />
        <Field
          label="Disempowering beliefs"
          value={form.disempoweringBeliefs || ''}
          onChangeText={(v) => setForm((prev) => ({ ...prev, disempoweringBeliefs: v }))}
          onFocus={onInputFocus}
        />
      </ReflectionBlock>

      <ReflectionBlock title="Top emotions" eyebrow="REFLECT" tint={G.pink}>
        <Field
          label="Positive emotions"
          value={form.positiveEmotions || ''}
          onChangeText={(v) => setForm((prev) => ({ ...prev, positiveEmotions: v }))}
          onFocus={onInputFocus}
        />
        <Field
          label="Negative emotions"
          value={form.negativeEmotions || ''}
          onChangeText={(v) => setForm((prev) => ({ ...prev, negativeEmotions: v }))}
          onFocus={onInputFocus}
        />
      </ReflectionBlock>

      <ReflectionBlock title="Work patterns / habits" eyebrow="REFLECT" tint="#E3EEF0">
        <Field
          label="Effective work patterns / habits"
          value={form.effectiveHabits || ''}
          onChangeText={(v) => setForm((prev) => ({ ...prev, effectiveHabits: v }))}
          onFocus={onInputFocus}
        />
        <Field
          label="Non-effective work patterns / habits"
          value={form.nonEffectiveHabits || ''}
          onChangeText={(v) => setForm((prev) => ({ ...prev, nonEffectiveHabits: v }))}
          onFocus={onInputFocus}
        />
      </ReflectionBlock>
    </View>
  );
}

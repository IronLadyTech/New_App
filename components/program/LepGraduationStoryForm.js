import React, { useEffect, useState } from 'react';
import { TextInput, View } from 'react-native';
import ILText from '../il/ILText';
import { G } from '../../constants/guestTheme';
import { IL_FONTS } from '../../constants/ironLadyBrand';
import { WhiteCard } from '../../screens/lep/LepBits';

/**
 * Week 4 challenge — the four things she presents on Graduation Day (the programme's
 * graduation message). Her answers become the outline of her 2-minute presentation.
 */
export const GRADUATION_STORY_TITLE = 'My graduation story';

const QUESTIONS = [
  { key: 'start', label: 'My B-HAG and the objectives I set at the start of the programme', hint: 'What did you set out to achieve?' },
  { key: 'progress', label: 'My B-HAG progress and the breakthroughs I produced', hint: 'What moved? One or two real breakthroughs.' },
  { key: 'principles', label: 'The Iron Lady principles I am using', hint: 'Which ones are helping you get breakthroughs, and how?' },
  { key: 'next', label: 'My next B-HAG for the next 6–12 months, and my strategy (CoDeSeF)', hint: 'The goal, and how you will get there.' },
];

function parse(text) {
  const out = {};
  const lines = String(text || '').split('\n');
  QUESTIONS.forEach((q, i) => {
    const prefix = `${i + 1}. ${q.label}: `;
    const line = lines.find((l) => l.startsWith(prefix));
    if (line) out[q.key] = line.slice(prefix.length);
  });
  return out;
}

export function isGraduationStoryText(text) {
  return String(text || '').startsWith(GRADUATION_STORY_TITLE);
}

export default function LepGraduationStoryForm({ initialText, onChangeText }) {
  const [answers, setAnswers] = useState(() => parse(initialText));
  const complete = QUESTIONS.every((q) => String(answers[q.key] || '').trim());

  useEffect(() => {
    if (!complete) {
      onChangeText('');
      return;
    }
    onChangeText(
      [
        GRADUATION_STORY_TITLE,
        ...QUESTIONS.map((q, i) => `${i + 1}. ${q.label}: ${String(answers[q.key]).trim().replace(/\n+/g, ' ')}`),
      ].join('\n')
    );
  }, [answers, complete]);

  return (
    <WhiteCard style={{ marginTop: 18, borderRadius: 18, padding: 16 }}>
      <ILText role="title" color={G.ink} style={{ fontFamily: IL_FONTS.display, fontSize: 20, lineHeight: 26 }}>
        Your graduation story
      </ILText>
      <ILText role="bodySm" color={G.body} style={{ marginTop: 6, fontSize: 14, lineHeight: 20 }}>
        These four answers are what you present on Graduation Day: 2 minutes with a 5–6 slide deck, or a 90-second
        introduction.
      </ILText>
      {QUESTIONS.map((q, i) => (
        <View key={q.key} style={{ marginTop: 18 }}>
          <ILText role="label" color={G.ink} style={{ fontSize: 15, lineHeight: 21 }}>
            {`${i + 1}. ${q.label}`}
          </ILText>
          <TextInput
            value={answers[q.key] || ''}
            onChangeText={(v) => setAnswers((a) => ({ ...a, [q.key]: v }))}
            placeholder={q.hint}
            placeholderTextColor="#B8B4A8"
            multiline
            style={{
              marginTop: 8,
              minHeight: 80,
              borderWidth: 1,
              borderColor: G.line,
              borderRadius: 12,
              paddingHorizontal: 12,
              paddingVertical: 9,
              fontFamily: IL_FONTS.regular,
              fontSize: 14,
              color: G.ink,
              textAlignVertical: 'top',
            }}
          />
        </View>
      ))}
      {!complete ? (
        <ILText role="bodySm" color={G.meta} style={{ marginTop: 10, fontSize: 12 }}>
          Answer all four to submit.
        </ILText>
      ) : null}
    </WhiteCard>
  );
}

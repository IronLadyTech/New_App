import React, { useEffect, useState } from 'react';
import { ActivityIndicator, View } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import Reanimated, { FadeIn, FadeOut } from 'react-native-reanimated';
import Pressable from '../il/Press';
import ILText from '../il/ILText';
import { G } from '../../constants/guestTheme';
import { IL_FONTS } from '../../constants/ironLadyBrand';
import { WhiteCard, RedCta } from '../../screens/lep/LepBits';
import { loadQuiz } from '../../services/quizzes';

const GREEN = '#1B7A4A';
const GREEN_BG = '#E8F6EE';

/**
 * A quiz inside its task: one question at a time, then her score with the right answer and a
 * line of why for anything she missed. Passing calls onPass(summary); she can retake any time.
 * `doneText` (her saved result) shows instead of the quiz until she chooses to retake.
 */
export default function QuizView({ quizId, doneText, onPass }) {
  const [quiz, setQuiz] = useState(null);
  const [i, setI] = useState(0);
  const [picks, setPicks] = useState([]);
  const [finished, setFinished] = useState(false);
  const [retaking, setRetaking] = useState(false);

  useEffect(() => {
    let alive = true;
    loadQuiz(quizId).then((q) => alive && setQuiz(q));
    return () => {
      alive = false;
    };
  }, [quizId]);

  const restart = () => {
    setI(0);
    setPicks([]);
    setFinished(false);
    setRetaking(true);
  };

  if (!quiz) {
    return (
      <WhiteCard style={{ marginTop: 18, borderRadius: 20, padding: 24, alignItems: 'center' }}>
        <ActivityIndicator color={G.cta} />
      </WhiteCard>
    );
  }

  if (doneText && !retaking) {
    return (
      <WhiteCard style={{ marginTop: 18, borderRadius: 20, padding: 18, backgroundColor: GREEN_BG }}>
        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
          <MaterialIcons name="emoji-events" size={22} color={GREEN} />
          <ILText role="label" color={GREEN} style={{ marginLeft: 8, fontSize: 16 }}>
            Quiz passed
          </ILText>
        </View>
        <ILText role="body" color={G.ink} style={{ marginTop: 8, fontSize: 15, lineHeight: 22 }}>
          {String(doneText).split('\n')[0]}
        </ILText>
        <Pressable onPress={restart} hitSlop={8} style={{ marginTop: 12, alignSelf: 'flex-start' }}>
          <ILText role="label" color={G.dark} style={{ fontSize: 14 }}>
            Take it again
          </ILText>
        </Pressable>
      </WhiteCard>
    );
  }

  const total = quiz.questions.length;

  if (finished) {
    const score = quiz.questions.filter((x, n) => picks[n] === x.answer).length;
    const pct = Math.round((score / total) * 100);
    const passed = pct >= quiz.passPercent;
    return (
      <View style={{ marginTop: 18 }}>
        <WhiteCard style={{ borderRadius: 20, padding: 18, backgroundColor: passed ? GREEN_BG : G.pink }}>
          <ILText role="display" color={passed ? GREEN : G.cta} style={{ fontFamily: IL_FONTS.display, fontSize: 34 }}>
            {`${score}/${total}`}
          </ILText>
          <ILText role="body" color={G.ink} style={{ marginTop: 4, fontSize: 15, lineHeight: 22 }}>
            {passed
              ? 'You passed. Your score is saved.'
              : `You need ${Math.ceil((quiz.passPercent / 100) * total)} of ${total} to pass. Look at the answers below and try again.`}
          </ILText>
        </WhiteCard>
        {quiz.questions.map((x, n) =>
          picks[n] === x.answer ? null : (
            <WhiteCard key={n} style={{ marginTop: 10, borderRadius: 16, padding: 14 }}>
              <ILText role="label" color={G.ink} style={{ fontSize: 14, lineHeight: 20 }}>
                {x.q}
              </ILText>
              <ILText role="bodySm" color={GREEN} style={{ marginTop: 6, fontSize: 14, lineHeight: 20 }}>
                {`Answer: ${x.options[x.answer]}`}
              </ILText>
              {x.explain ? (
                <ILText role="bodySm" color={G.body} style={{ marginTop: 4, fontSize: 13, lineHeight: 19 }}>
                  {x.explain}
                </ILText>
              ) : null}
            </WhiteCard>
          )
        )}
        <View style={{ marginTop: 16 }}>
          {passed ? (
            <RedCta
              label="Save my score"
              icon="check"
              onPress={() => {
                setRetaking(false);
                onPass(`Scored ${score} of ${total} (${pct}%) on ${quiz.title}.`);
              }}
            />
          ) : (
            <RedCta label="Try again" icon="refresh" onPress={restart} />
          )}
        </View>
      </View>
    );
  }

  const x = quiz.questions[i];
  const picked = picks[i];
  const next = () => {
    if (picked == null) return;
    if (i + 1 >= total) setFinished(true);
    else setI(i + 1);
  };

  return (
    <View style={{ marginTop: 18 }}>
      <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 10 }}>
        <ILText role="label" color={G.meta} style={{ fontSize: 13, flex: 1 }}>
          {`Question ${i + 1} of ${total}`}
        </ILText>
        <View style={{ flex: 1, height: 4, borderRadius: 2, backgroundColor: G.line, overflow: 'hidden' }}>
          <View style={{ width: `${((i + 1) / total) * 100}%`, height: 4, backgroundColor: G.cta }} />
        </View>
      </View>
      <Reanimated.View key={i} entering={FadeIn.duration(220)} exiting={FadeOut.duration(120)}>
        <WhiteCard style={{ borderRadius: 20, padding: 18 }}>
          <ILText role="title" color={G.ink} style={{ fontFamily: IL_FONTS.display, fontSize: 20, lineHeight: 27 }}>
            {x.q}
          </ILText>
          {x.options.map((opt, n) => {
            const on = picked === n;
            return (
              <Pressable
                key={`${i}-${n}`}
                onPress={() => setPicks((p) => Object.assign([...p], { [i]: n }))}
                accessibilityRole="radio"
                accessibilityState={{ checked: on }}
                style={{
                  marginTop: 10,
                  borderRadius: 14,
                  borderWidth: on ? 2 : 1,
                  borderColor: on ? G.dark : G.line,
                  backgroundColor: on ? '#E3ECEE' : '#FFFFFF',
                  paddingHorizontal: 14,
                  paddingVertical: 12,
                }}
              >
                <ILText role="body" color={G.ink} style={{ fontSize: 15, lineHeight: 21 }}>
                  {opt}
                </ILText>
              </Pressable>
            );
          })}
        </WhiteCard>
      </Reanimated.View>
      <View style={{ marginTop: 16, opacity: picked == null ? 0.45 : 1 }}>
        <RedCta label={i + 1 >= total ? 'See my score' : 'Next question'} onPress={next} />
      </View>
      {i > 0 ? (
        <Pressable onPress={() => setI(i - 1)} hitSlop={8} style={{ marginTop: 12, alignSelf: 'center' }}>
          <ILText role="label" color={G.meta} style={{ fontSize: 13 }}>
            Back
          </ILText>
        </Pressable>
      ) : null}
    </View>
  );
}

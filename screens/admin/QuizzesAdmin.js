import React, { useEffect, useState } from 'react';
import { View } from 'react-native';
import Pressable from '../../components/il/Press';
import { DEFAULT_QUIZZES, QUIZ_IDS, cleanQuiz } from '../../constants/lepQuizzes';
import { loadSavedQuiz, saveQuiz } from '../../services/quizzes';
import { A, Btn, Card, Field, H, Input, Notice, Row, T } from './adminUi';

const QUIZZES = [
  { id: QUIZ_IDS.RITUALS, label: '5 Daily Rituals' },
  { id: QUIZ_IDS.PRINCIPLES, label: '27 Principles' },
];

const blank = () => ({ q: '', options: ['', '', '', ''], answer: 0, explain: '' });

function copy(quiz) {
  return {
    title: quiz.title,
    passPercent: String(quiz.passPercent),
    questions: quiz.questions.map((x) => ({ ...x, options: [...x.options] })),
  };
}

/** Which questions would be left out when saving, and why. */
function problems(questions) {
  return questions
    .map((x, i) => {
      const opts = x.options.filter((o) => o.trim());
      if (!x.q.trim()) return `Question ${i + 1}: write the question.`;
      if (opts.length < 2) return `Question ${i + 1}: give at least two answers.`;
      if (!String(x.options[x.answer] || '').trim()) return `Question ${i + 1}: the correct answer is empty.`;
      return null;
    })
    .filter(Boolean);
}

/**
 * CMS → Quizzes: edit the LEP quiz questions, answers, explanations and pass mark. Learners get
 * the saved version the next time they open the quiz.
 */
export default function QuizzesAdmin({ canEdit }) {
  const [pick, setPick] = useState(QUIZ_IDS.RITUALS);
  const [draft, setDraft] = useState(null);
  const [isSaved, setIsSaved] = useState(false);
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState(null);

  useEffect(() => {
    let alive = true;
    setDraft(null);
    setMsg(null);
    loadSavedQuiz(pick)
      .then((saved) => {
        if (!alive) return;
        setIsSaved(Boolean(saved));
        setDraft(copy(cleanQuiz(saved, DEFAULT_QUIZZES[pick])));
      })
      .catch(() => alive && setDraft(copy(DEFAULT_QUIZZES[pick])));
    return () => {
      alive = false;
    };
  }, [pick]);

  if (!draft) return <Notice tone="neutral">Loading quiz…</Notice>;

  const setQ = (i, patch) =>
    setDraft((d) => ({ ...d, questions: d.questions.map((x, n) => (n === i ? { ...x, ...patch } : x)) }));
  const setOption = (i, k, v) =>
    setDraft((d) => ({
      ...d,
      questions: d.questions.map((x, n) => (n === i ? { ...x, options: x.options.map((o, m) => (m === k ? v : o)) } : x)),
    }));
  const move = (i, dir) =>
    setDraft((d) => {
      const qs = [...d.questions];
      const j = i + dir;
      if (j < 0 || j >= qs.length) return d;
      [qs[i], qs[j]] = [qs[j], qs[i]];
      return { ...d, questions: qs };
    });

  const issues = problems(draft.questions);

  const save = async () => {
    setBusy(true);
    setMsg(null);
    try {
      // Drop empty answer boxes, keeping the correct answer pointing at the same text.
      const questions = draft.questions.map((x) => {
        const right = x.options[x.answer];
        const options = x.options.map((o) => o.trim()).filter(Boolean);
        return { q: x.q.trim(), options, answer: Math.max(0, options.indexOf(String(right).trim())), explain: x.explain.trim() };
      });
      const pass = Math.min(100, Math.max(1, Number(draft.passPercent) || 70));
      await saveQuiz(pick, { title: draft.title.trim() || DEFAULT_QUIZZES[pick].title, passPercent: pass, questions });
      setIsSaved(true);
      setMsg({ tone: 'ok', text: 'Saved. Learners get these questions the next time they open the quiz.' });
    } catch (e) {
      setMsg({ tone: 'error', text: e?.message || 'Could not save. Try again.' });
    } finally {
      setBusy(false);
    }
  };

  return (
    <View>
      <Row gap={8} style={{ marginBottom: 12, flexWrap: 'wrap' }}>
        {QUIZZES.map((q) => (
          <Pressable key={q.id} onPress={() => setPick(q.id)}>
            <View
              style={{
                paddingHorizontal: 14,
                paddingVertical: 8,
                borderRadius: 999,
                borderWidth: 1,
                borderColor: pick === q.id ? A.ink : A.line,
                backgroundColor: pick === q.id ? A.ink : 'transparent',
              }}
            >
              <T size={13} color={pick === q.id ? '#FFFFFF' : A.ink}>
                {q.label}
              </T>
            </View>
          </Pressable>
        ))}
      </Row>

      <Card>
        <H>{draft.title}</H>
        <T size={13} color={A.muted} style={{ marginBottom: 12 }}>
          {isSaved
            ? 'Learners see the version saved here.'
            : 'Not edited yet: learners see the app’s starting questions below. Saving makes this the live version.'}
        </T>
        <Row gap={12} style={{ flexWrap: 'wrap' }}>
          <Field label="Quiz title" style={{ flex: 2, minWidth: 260 }}>
            <Input value={draft.title} onChangeText={(v) => setDraft((d) => ({ ...d, title: v }))} editable={canEdit} />
          </Field>
          <Field label="Pass mark (%)" hint="She passes with this score or more" style={{ width: 160 }}>
            <Input
              value={draft.passPercent}
              onChangeText={(v) => setDraft((d) => ({ ...d, passPercent: v.replace(/\D/g, '').slice(0, 3) }))}
              keyboardType="number-pad"
              editable={canEdit}
            />
          </Field>
        </Row>
      </Card>

      {draft.questions.map((x, i) => (
        <Card key={i} style={{ marginTop: 12 }}>
          <Row gap={8} style={{ alignItems: 'center', marginBottom: 8 }}>
            <T weight="bold" style={{ flex: 1 }}>{`Question ${i + 1}`}</T>
            {canEdit ? (
              <>
                <Btn label="↑" kind="ghost" small onPress={() => move(i, -1)} disabled={i === 0} />
                <Btn label="↓" kind="ghost" small onPress={() => move(i, 1)} disabled={i === draft.questions.length - 1} />
                <Btn
                  label="Remove"
                  kind="danger"
                  small
                  disabled={draft.questions.length <= 1}
                  onPress={() => setDraft((d) => ({ ...d, questions: d.questions.filter((_, n) => n !== i) }))}
                />
              </>
            ) : null}
          </Row>
          <Field label="Question">
            <Input value={x.q} onChangeText={(v) => setQ(i, { q: v })} editable={canEdit} />
          </Field>
          <T size={13} weight="semibold" style={{ marginTop: 8, marginBottom: 4 }}>
            Answers (tap the circle for the correct one)
          </T>
          {x.options.map((o, k) => (
            <Row key={k} gap={8} style={{ alignItems: 'center', marginTop: 6 }}>
              <Pressable
                onPress={() => canEdit && setQ(i, { answer: k })}
                accessibilityRole="radio"
                accessibilityState={{ checked: x.answer === k }}
              >
                <View
                  style={{
                    width: 20,
                    height: 20,
                    borderRadius: 10,
                    borderWidth: 2,
                    borderColor: x.answer === k ? '#1F7A4D' : A.line,
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  {x.answer === k ? <View style={{ width: 10, height: 10, borderRadius: 5, backgroundColor: '#1F7A4D' }} /> : null}
                </View>
              </Pressable>
              <Input
                value={o}
                onChangeText={(v) => setOption(i, k, v)}
                placeholder={`Answer ${k + 1}`}
                editable={canEdit}
                style={{ flex: 1 }}
              />
            </Row>
          ))}
          {canEdit && x.options.length < 6 ? (
            <Btn
              label="Add an answer"
              kind="ghost"
              small
              style={{ marginTop: 8, alignSelf: 'flex-start' }}
              onPress={() => setQ(i, { options: [...x.options, ''] })}
            />
          ) : null}
          <Field label="Why (shown when she gets it wrong)" style={{ marginTop: 10 }}>
            <Input value={x.explain} onChangeText={(v) => setQ(i, { explain: v })} editable={canEdit} />
          </Field>
        </Card>
      ))}

      {canEdit ? (
        <>
          <Btn
            label="Add a question"
            kind="ghost"
            style={{ marginTop: 12, alignSelf: 'flex-start' }}
            onPress={() => setDraft((d) => ({ ...d, questions: [...d.questions, blank()] }))}
          />
          {issues.length ? (
            <Notice tone="error">{issues.join('  ')}</Notice>
          ) : null}
          {msg ? <Notice tone={msg.tone}>{msg.text}</Notice> : null}
          <Row gap={10} style={{ marginTop: 12 }}>
            <Btn label="Save quiz" onPress={save} loading={busy} disabled={busy || issues.length > 0} />
            <Btn
              label="Start again from the app’s questions"
              kind="ghost"
              onPress={() => {
                setDraft(copy(DEFAULT_QUIZZES[pick]));
                setMsg({ tone: 'neutral', text: 'Starting questions loaded. Save to make them live.' });
              }}
            />
          </Row>
        </>
      ) : (
        <Notice tone="neutral">You can view the quiz. Editing needs a CMS editor role.</Notice>
      )}
    </View>
  );
}

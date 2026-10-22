import React, { useMemo, useState } from 'react';
import { View } from 'react-native';
import Pressable from '../../components/il/Press';
import { MaterialIcons } from '@expo/vector-icons';
import { IL_FONTS } from '../../constants/ironLadyBrand';
import ILText from '../../components/il/ILText';
import { G, af } from '../../constants/guestTheme';
import { PROGRAMS } from '../../constants/programs';
import {
  coursePhases,
  courseTasks,
  currentPhaseId,
  isPhaseOpen,
} from '../../constants/programCourseSlice';
import { useCourseDemo } from '../../context/CourseDemoContext';
import { ProgressDark, WhiteCard } from './LepBits';
import { useLepNav } from './useLepNav';
import { phaseLockLabel } from '../../utils/phaseUnlock';

function taskIcon(kind) {
  const k = String(kind || '').toLowerCase();
  if (k.includes('video')) return 'play-circle-outline';
  if (k.includes('read')) return 'menu-book';
  if (k.includes('assign')) return 'assignment';
  if (k.includes('form') || k.includes('template')) return 'edit-note';
  if (k.includes('link')) return 'link';
  if (k.includes('check')) return 'checklist';
  return 'article';
}

function taskMeta(task) {
  const kind = task.kind || 'Task';
  if (task.dueLabel) return `${kind} · ${task.dueLabel}`;
  if (task.week) return `${kind} · ${task.week}`;
  return kind;
}

function unlockHint(prevTitle) {
  if (!prevTitle) return 'Unlocks with enrollment';
  const short = String(prevTitle).split('—')[0].split('–')[0].trim();
  return `Unlocks when ${short} is complete`;
}

/**
 * Course journey UI matching the LEP curriculum reference:
 * progress card + done / expanded-in-progress / locked phase cards.
 */
export default function CourseCurriculum({
  programId = PROGRAMS.LEP,
  enrolled = true,
  lepFlow = null,
  showSectionHead = true,
  lockedFooter = null,
}) {
  const nav = useLepNav();
  const demo = useCourseDemo();
  const phases = coursePhases(programId);
  const phaseId = currentPhaseId(programId, enrolled, lepFlow);
  const currentIndex = Math.max(0, phases.findIndex((p) => p.id === phaseId));

  /** null = auto-expand current phase; '__none__' = all collapsed */
  const [expandedId, setExpandedId] = useState(null);
  const activeId =
    expandedId === '__none__' ? null : expandedId || phaseId || phases[0]?.id;

  const progress = useMemo(() => {
    const all = [];
    phases.forEach((p) => {
      courseTasks(programId, p.id).forEach((t) => all.push(t));
    });
    const done = all.filter((t) => demo.isDone(programId, t.id)).length;
    const next = all.find((t) => !demo.isDone(programId, t.id));
    const percent = all.length ? Math.round((done / all.length) * 100) : 0;
    return {
      percent,
      phaseN: currentIndex + 1,
      total: phases.length || 11,
      nextTitle: next?.title || phases[currentIndex]?.title || '',
      foot: next
        ? `${percent}% complete · Next up: ${next.title}`
        : `${percent}% complete`,
    };
  }, [phases, programId, demo, currentIndex]);

  return (
    <View>
      <ProgressDark
        kicker="Your progress"
        title={`Phase ${progress.phaseN} of ${progress.total}`}
        percent={progress.percent}
        foot={progress.foot}
        right={null}
      />

      {showSectionHead ? (
        <>
          <ILText
            role="title"
            color={G.ink}
            style={{ marginTop: 22, fontFamily: IL_FONTS.display, fontSize: 22 }}
          >
            Course
          </ILText>
          <ILText role="bodySm" color={G.meta} style={{ marginTop: 2 }}>
            Phase by phase, from Moodle
          </ILText>
        </>
      ) : null}

      {(phases.length ? phases : []).map((phase, i) => {
        // Payment, batch calendar and CX overrides decide (utils/phaseUnlock.js).
        const shut = enrolled
          ? !isPhaseOpen(phase, true, lepFlow)
          : phase.openRegistered === false ||
              (phase.openRegistered == null && i >= 3) ||
              !isPhaseOpen(phase, false, lepFlow);
        const done = enrolled && i < currentIndex;
        const now = phase.id === phaseId;
        const expanded = phase.id === activeId;
        const tasks = courseTasks(programId, phase.id);
        const doneCount = tasks.filter((t) => demo.isDone(programId, t.id)).length;
        const nextTask = tasks.find((t) => !demo.isDone(programId, t.id));
        const prevTitle = phases[i - 1]?.title;

        if (expanded) {
          return (
            <ExpandedPhaseCard
              key={phase.id}
              index={i}
              phase={phase}
              tasks={tasks}
              doneCount={doneCount}
              nextTaskId={nextTask?.id}
              programId={programId}
              isDone={(pid, tid) => demo.isDone(pid, tid)}
              onTask={(taskId) => nav.goCourseTask(programId, taskId)}
              onCollapse={() => setExpandedId('__none__')}
              complete={done && doneCount >= tasks.length && tasks.length > 0}
            />
          );
        }

        if (shut) {
          // Say when it opens; only a payment lock leads to enrollment.
          const lock = lepFlow ? phaseLockLabel(phase, { enrolled, flow: lepFlow }) : null;
          return (
            <LockedPhaseCard
              key={phase.id}
              index={i}
              phase={phase}
              hint={lock && !lock.enroll ? lock.text : unlockHint(prevTitle)}
              onPress={!enrolled && (!lock || lock.enroll) ? nav.goEnroll : undefined}
            />
          );
        }

        return (
          <DonePhaseCard
            key={phase.id}
            index={i}
            phase={phase}
            done={done}
            now={now}
            onPress={() => setExpandedId(phase.id)}
          />
        );
      })}

      {lockedFooter}
    </View>
  );
}

function DonePhaseCard({ index, phase, done, now, onPress }) {
  return (
    <Pressable onPress={onPress}>
      <WhiteCard
        style={{
          marginTop: 10,
          borderRadius: 18,
          padding: 16,
          flexDirection: 'row',
          alignItems: 'center',
        }}
      >
        <View
          style={{
            width: 28,
            height: 28,
            borderRadius: 14,
            backgroundColor: done || now ? G.dark : G.mutedFill,
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          {done ? (
            <MaterialIcons name="check" size={16} color="#FFFFFF" />
          ) : (
            <MaterialIcons
              name={now ? 'radio-button-checked' : 'radio-button-unchecked'}
              size={16}
              color={now ? '#FFFFFF' : '#C8C4B6'}
            />
          )}
        </View>
        <View style={{ flex: 1, marginLeft: 12, marginRight: 8 }}>
          <ILText role="label" color={G.ink} style={{ fontSize: 15, lineHeight: 20 }}>
            {String(index + 1).padStart(2, '0')} {String(phase.title || '').replace(/—/g, '–')}
          </ILText>
          <ILText role="bodySm" color={G.meta} style={{ marginTop: 4, fontSize: 12, lineHeight: 16 }}>
            {phase.sub}
          </ILText>
        </View>
        <MaterialIcons name="chevron-right" size={18} color={G.meta} />
      </WhiteCard>
    </Pressable>
  );
}

function LockedPhaseCard({ index, phase, hint, onPress }) {
  return (
    <Pressable onPress={onPress} disabled={!onPress}>
      <View
        style={{
          marginTop: 10,
          borderRadius: 18,
          padding: 16,
          flexDirection: 'row',
          alignItems: 'center',
          borderWidth: 1.5,
          borderStyle: 'dashed',
          borderColor: '#D5D1C3',
          backgroundColor: 'rgba(255,255,255,0.45)',
          opacity: 0.72,
        }}
      >
        <MaterialIcons name="lock-outline" size={20} color="#B8B4A6" />
        <View style={{ flex: 1, marginLeft: 12 }}>
          <ILText role="label" color="#8A8678" style={{ fontSize: 15, lineHeight: 20 }}>
            {String(index + 1).padStart(2, '0')} {phase.title.replace(/—/g, '–')}
          </ILText>
          <ILText role="bodySm" color="#A39F91" style={{ marginTop: 4, fontSize: 12, lineHeight: 16 }}>
            {hint || phase.sub}
          </ILText>
        </View>
      </View>
    </Pressable>
  );
}

function ExpandedPhaseCard({
  index,
  phase,
  tasks,
  doneCount,
  nextTaskId,
  programId,
  isDone,
  onTask,
  onCollapse,
  complete = false,
}) {
  const status = complete
    ? `COMPLETE · ${doneCount} OF ${tasks.length || 0}`
    : `IN PROGRESS · ${doneCount} OF ${tasks.length || 0}`;
  return (
    <View
      style={{
        marginTop: 10,
        borderRadius: 22,
        borderWidth: 1.5,
        borderColor: G.dark,
        backgroundColor: G.white,
        padding: 18,
        overflow: 'hidden',
      }}
    >
      <Pressable onPress={onCollapse}>
        <ILText role="eyebrow" color={G.cta} style={[af, { fontSize: 10, letterSpacing: 1.2 }]}>
          {status}
        </ILText>
        <ILText
          role="title"
          color={G.ink}
          style={{
            marginTop: 8,
            fontFamily: IL_FONTS.display,
            fontSize: 22,
            lineHeight: 28,
          }}
        >
          {String(index + 1).padStart(2, '0')} {phase.title.replace(/—/g, '–')}
        </ILText>
      </Pressable>

      <View style={{ marginTop: 14 }}>
        {tasks.map((task, ti) => {
          const done = isDone(programId, task.id);
          const current = !done && task.id === nextTaskId;
          const last = ti === tasks.length - 1;
          return (
            <Pressable
              key={task.id}
              onPress={() => onTask(task.id)}
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                paddingVertical: 12,
                borderBottomWidth: last ? 0 : 1,
                borderBottomColor: G.line,
              }}
            >
              {done ? (
                <MaterialIcons name="check-circle" size={22} color={G.dark} />
              ) : (
                <MaterialIcons name={taskIcon(task.kind)} size={22} color={G.meta} />
              )}
              <View style={{ flex: 1, marginLeft: 12, marginRight: 8 }}>
                <ILText
                  role="label"
                  color={G.ink}
                  style={{ fontSize: 14, lineHeight: 19 }}
                  numberOfLines={2}
                >
                  {task.title}
                </ILText>
                <ILText role="bodySm" color={G.meta} style={{ marginTop: 2, fontSize: 12 }}>
                  {taskMeta(task)}
                </ILText>
              </View>
              {current ? (
                <View
                  style={{
                    backgroundColor: G.cta,
                    borderRadius: 999,
                    paddingHorizontal: 12,
                    paddingVertical: 7,
                  }}
                >
                  <ILText role="label" color="#FFFFFF" style={{ fontSize: 12 }}>
                    Continue
                  </ILText>
                </View>
              ) : done ? null : (
                <MaterialIcons name="chevron-right" size={18} color={G.meta} />
              )}
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}

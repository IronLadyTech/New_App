import React, { useMemo } from 'react';
import { View } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import ILText from '../il/ILText';
import { IL_FONTS } from '../../constants/ironLadyBrand';
import { G, af } from '../../constants/guestTheme';
import { ProgressDark, WhiteCard } from '../../screens/lep/LepBits';
import { PROGRAMS } from '../../constants/programs';
import { useAuth } from '../../context/AuthContext';
import { useCourseDemo } from '../../context/CourseDemoContext';
import { usePrograms } from '../../context/ProgramsContext';
import { useLearnerCmsBatch } from '../../hooks/useLearnerCmsBatch';
import { useLepPracticeStreak } from '../../hooks/useLepPracticeStreak';
import { useLepRitualsUnlocked } from '../../hooks/useLepRitualsUnlocked';
import { useLepFiveRitualsTracker } from '../../hooks/useLepFiveRitualsTracker';
import { isLepEnrolled } from '../../utils/lepState';
import { programsOnProfile } from '../../utils/programAccess';
import { makeTaskDoneChecker } from '../../utils/taskDone';
import { isPhaseOpen } from '../../constants/programCourseSlice';
import { lepFlowContextFromBatch } from '../../utils/lepFlowGates';
import { todayIsoIST } from '../../utils/lepDailyPractice';
import { resolveLepDay1Iso } from '../../utils/lepEnrolledCohortPhase';
import {
  computeCourseProgress,
  LEP_PHASE_BADGE_META,
  LEP_PROGRESS_BADGE_PHASE_IDS,
  resolvePhaseBadgeState,
} from '../../utils/lepCourseProgress';
import Pressable from '../il/Press';
import LepRitualsTodayStrip from './LepRitualsTodayStrip';

function ProgramProgressRow({ icon, label, phaseN, totalPhases, percent }) {
  return (
    <View style={{ marginBottom: 16 }}>
      <View style={{ flexDirection: 'row', alignItems: 'center' }}>
        <MaterialIcons name={icon} size={22} color="#ED1D24" />
        <ILText role="label" color={G.ink} style={{ marginLeft: 10, flex: 1 }}>
          {label}
        </ILText>
        <ILText role="label" color={G.meta} style={{ fontSize: 12 }}>
          Phase {phaseN} of {totalPhases} · {percent}%
        </ILText>
      </View>
      <View
        style={{
          height: 6,
          borderRadius: 3,
          backgroundColor: G.mutedFill,
          marginTop: 10,
          overflow: 'hidden',
        }}
      >
        <View style={{ width: `${percent}%`, height: 6, backgroundColor: G.dark, borderRadius: 3 }} />
      </View>
    </View>
  );
}

function PhaseBadgeDiamond({ num, short, state, onPress }) {
  const size = 64;
  const done = state === 'done';
  const current = state === 'current';
  const locked = state === 'locked';
  const bg = done ? G.dark : current ? '#FFFFFF' : G.mutedFill;
  const borderColor = current ? '#ED1D24' : done ? G.dark : G.line;
  const borderWidth = current ? 2 : 1;

  const Wrapper = onPress && state !== 'locked' ? Pressable : View;
  return (
    <Wrapper
      onPress={onPress}
      style={{ width: '25%', alignItems: 'center', marginBottom: 18 }}
      accessibilityRole={onPress ? 'button' : undefined}
    >
      <View
        style={{
          width: size,
          height: size,
          borderRadius: 16,
          backgroundColor: bg,
          borderWidth,
          borderColor,
          transform: [{ rotate: '45deg' }],
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <View style={{ transform: [{ rotate: '-45deg' }], alignItems: 'center', justifyContent: 'center' }}>
          {done ? (
            <MaterialIcons name="check" size={26} color="#FFF" />
          ) : locked ? (
            <MaterialIcons name="lock" size={22} color={G.meta} />
          ) : (
            <MaterialIcons name="adjust" size={26} color="#ED1D24" />
          )}
        </View>
      </View>
      <ILText role="label" color={G.ink} style={{ marginTop: 10, fontSize: 11, textAlign: 'center' }}>
        {num} {short}
      </ILText>
    </Wrapper>
  );
}

export default function LepYourProgressContent({ onOpenRitualsWeek, onOpenWeeklyBrief, onOpenPhase }) {
  const { profile } = useAuth();
  const streak = useLepPracticeStreak();
  const demo = useCourseDemo();
  const { getTaskSubmission } = usePrograms();
  const { batch: cmsBatch } = useLearnerCmsBatch('lep');
  const enrolled = isLepEnrolled(profile);
  const lepFlow = useMemo(
    () => ({
      ...lepFlowContextFromBatch({ cmsBatch }),
      todayIso: todayIsoIST(),
    }),
    [cmsBatch]
  );
  const taskIsDone = useMemo(
    () => makeTaskDoneChecker({ isDone: demo.isDone, getTaskSubmission }),
    [demo.isDone, demo.done, getTaskSubmission]
  );

  const lepProgress = useMemo(
    () => computeCourseProgress(PROGRAMS.LEP, enrolled, lepFlow, taskIsDone),
    [enrolled, lepFlow, taskIsDone]
  );

  const has100bm = programsOnProfile(profile).some((p) => p.id === '100bm');
  const bmProgress = useMemo(
    () => (has100bm ? computeCourseProgress(PROGRAMS.BM100, true, null, taskIsDone) : null),
    [has100bm, taskIsDone]
  );

  const badges = useMemo(() => {
    const currentId = lepProgress.phaseId;
    const phaseById = Object.fromEntries(lepProgress.phases.map((p) => [p.id, p]));
    return LEP_PROGRESS_BADGE_PHASE_IDS.map((phaseId) => {
      const meta = LEP_PHASE_BADGE_META[phaseId] || { num: '—', short: phaseId };
      const state = resolvePhaseBadgeState(phaseId, {
        phases: lepProgress.phases,
        currentPhaseId: currentId,
        enrolled,
        lepFlow,
        taskIsDone,
        isPhaseOpen,
      });
      return { phaseId, ...meta, state };
    });
  }, [enrolled, lepFlow, lepProgress.phaseId, lepProgress.phases, taskIsDone]);

  const earnedCount = badges.filter((b) => b.state === 'done').length;

  const { unlocked: ritualsUnlocked } = useLepRitualsUnlocked({ cmsBatch });
  const day1Iso = resolveLepDay1Iso(profile, cmsBatch);
  const { today, model, toggleRitual, unmarkRitual } = useLepFiveRitualsTracker(day1Iso);

  const consistencyFoot =
    streak.weekActiveDays >= streak.weekTotal
      ? 'Best week since you joined. A missed day never resets this — it’s a weekly measure.'
      : 'A missed day never resets this — it’s a weekly measure.';

  return (
    <View style={{ paddingBottom: 28 }}>
      <ProgressDark
        kicker="Weekly consistency"
        title={`${streak.weekActiveDays}/${streak.weekTotal}`}
        percent={0}
        hideBar
        foot={consistencyFoot}
        right={null}
      />

      <WhiteCard style={{ marginTop: 14, borderRadius: 22, padding: 16 }}>
        <ProgramProgressRow
          icon="local-fire-department"
          label="LEP"
          phaseN={lepProgress.phaseN}
          totalPhases={lepProgress.totalPhases}
          percent={lepProgress.percent}
        />
        {bmProgress ? (
          <ProgramProgressRow
            icon="work-outline"
            label="100BM"
            phaseN={bmProgress.phaseN}
            totalPhases={bmProgress.totalPhases}
            percent={bmProgress.percent}
          />
        ) : null}
      </WhiteCard>

      <WhiteCard style={{ marginTop: 14, borderRadius: 22, padding: 16, paddingBottom: 8 }}>
        <ILText role="title" color={G.ink} style={{ fontFamily: IL_FONTS.display, fontSize: 20 }}>
          LEP phase badges
        </ILText>
        <ILText role="bodySm" color={G.meta} style={{ marginTop: 4, marginBottom: 4 }}>
          {earnedCount} of {lepProgress.totalPhases} earned
        </ILText>
        <ILText role="bodySm" color={G.meta} style={{ marginBottom: 8, fontSize: 11, lineHeight: 16 }}>
          A check appears when you finish every task in that phase. Tap an open badge to open the phase.
        </ILText>
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', marginTop: 4 }}>
          {badges.map((b) => (
            <PhaseBadgeDiamond
              key={b.phaseId}
              num={b.num}
              short={b.short}
              state={b.state}
              onPress={onOpenPhase ? () => onOpenPhase(b.phaseId) : undefined}
            />
          ))}
        </View>
      </WhiteCard>

      {ritualsUnlocked ? (
        <LepRitualsTodayStrip
          todayMarks={model.todayMarks}
          weekMarks={model.weekMarks}
          grid={model.grid}
          today={today}
          toggleRitual={toggleRitual}
          unmarkRitual={unmarkRitual}
          onOpenFull={onOpenRitualsWeek}
        />
      ) : (
        <WhiteCard style={{ marginTop: 14, borderRadius: 22, padding: 16 }}>
          <ILText role="label" color={G.ink}>5 Daily Rituals</ILText>
          <ILText role="bodySm" color={G.meta} style={{ marginTop: 6, lineHeight: 18 }}>
            Unlocks from Monday after Day 1 and Day 2. Completed rituals will show here automatically.
          </ILText>
        </WhiteCard>
      )}

      <Pressable onPress={onOpenWeeklyBrief} disabled={!onOpenWeeklyBrief}>
        <WhiteCard
          style={{
            marginTop: 14,
            borderRadius: 22,
            padding: 16,
            flexDirection: 'row',
            alignItems: 'center',
          }}
        >
          <View
            style={{
              width: 44,
              height: 44,
              borderRadius: 22,
              backgroundColor: '#FCE8E8',
              alignItems: 'center',
              justifyContent: 'center',
              marginRight: 12,
            }}
          >
            <MaterialIcons name="show-chart" size={24} color="#ED1D24" />
          </View>
          <View style={{ flex: 1 }}>
            <ILText role="label" color={G.ink}>Weekly brief · Sunday</ILText>
            <ILText role="bodySm" color={G.meta} style={{ marginTop: 4, fontSize: 12, lineHeight: 17 }}>
              Private summary of what you finished and what’s next.
            </ILText>
          </View>
          <MaterialIcons name="chevron-right" size={24} color={G.meta} />
        </WhiteCard>
      </Pressable>
    </View>
  );
}

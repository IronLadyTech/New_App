import React, { useMemo } from 'react';
import { ScrollView, View } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { MaterialIcons } from '@expo/vector-icons';
import Pressable from '../../components/il/Press';
import ILText from '../../components/il/ILText';
import { IL_FONTS } from '../../constants/ironLadyBrand';
import { G } from '../../constants/guestTheme';
import { GuestBackBar, WhiteCard } from '../guest/GuestBits';
import { Page } from './LepBits';
import { LIQUID_TAB_PAD } from '../../components/il/LiquidTabBar';
import { useAuth } from '../../context/AuthContext';
import { useCourseDemo } from '../../context/CourseDemoContext';
import { usePrograms } from '../../context/ProgramsContext';
import { useLearnerCmsBatch } from '../../hooks/useLearnerCmsBatch';
import { useLepPracticeStreak } from '../../hooks/useLepPracticeStreak';
import { useLepRitualsUnlocked } from '../../hooks/useLepRitualsUnlocked';
import { useLepFiveRitualsTracker } from '../../hooks/useLepFiveRitualsTracker';
import { isLepEnrolled } from '../../utils/lepState';
import { makeTaskDoneChecker } from '../../utils/taskDone';
import { lepFlowContextFromBatch } from '../../utils/lepFlowGates';
import { todayIsoIST } from '../../utils/lepDailyPractice';
import { resolveLepDay1Iso } from '../../utils/lepEnrolledCohortPhase';
import { computeCourseProgress } from '../../utils/lepCourseProgress';
import { PROGRAMS } from '../../constants/programs';
import { buildLepWeeklyBrief } from '../../utils/lepWeeklyBrief';
import { useLepNav } from './useLepNav';

export default function LepWeeklyBriefScreen() {
  const navigation = useNavigation();
  const nav = useLepNav();
  const insets = useSafeAreaInsets();
  const { profile } = useAuth();
  const streak = useLepPracticeStreak();
  const demo = useCourseDemo();
  const { getTaskSubmission } = usePrograms();
  const { batch: cmsBatch } = useLearnerCmsBatch('lep');
  const enrolled = isLepEnrolled(profile);
  const lepFlow = useMemo(
    () => ({ ...lepFlowContextFromBatch({ cmsBatch }), todayIso: todayIsoIST() }),
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
  const { unlocked: ritualsUnlocked } = useLepRitualsUnlocked({ cmsBatch });
  const day1Iso = resolveLepDay1Iso(profile, cmsBatch);
  const { model } = useLepFiveRitualsTracker(day1Iso);

  const brief = useMemo(
    () =>
      buildLepWeeklyBrief({
        todayIso: todayIsoIST(),
        streak,
        ritualsUnlocked,
        weekMarks: model.weekMarks,
        lepProgress,
        taskIsDone,
      }),
    [streak, ritualsUnlocked, model.weekMarks, lepProgress, taskIsDone]
  );

  return (
    <Page>
      <StatusBar style="dark" />
      <View style={{ paddingTop: Math.max(insets.top, 8) }}>
        <GuestBackBar title="Weekly brief" sub="Sunday · private" onBack={() => navigation.goBack()} />
      </View>
      <ScrollView
        contentContainerStyle={{
          paddingHorizontal: 20,
          paddingBottom: LIQUID_TAB_PAD + Math.max(insets.bottom, 8) + 24,
        }}
      >
        <ILText role="title" color={G.ink} style={{ marginTop: 8, fontFamily: IL_FONTS.display, fontSize: 26 }}>
          {brief.headline}
        </ILText>
        <ILText role="bodySm" color={G.meta} style={{ marginTop: 6 }}>
          {brief.rangeLabel} · {brief.sub}
        </ILText>

        {brief.lines.map((line) => (
          <Pressable
            key={line.title}
            onPress={
              line.taskId
                ? () => nav.goCourseTask(PROGRAMS.LEP, line.taskId)
                : undefined
            }
            disabled={!line.taskId}
          >
            <WhiteCard style={{ marginTop: 14, borderRadius: 22, padding: 16, flexDirection: 'row' }}>
              <MaterialIcons name={line.icon} size={24} color="#ED1D24" style={{ marginRight: 12 }} />
              <View style={{ flex: 1 }}>
                <ILText role="label" color={G.ink}>{line.title}</ILText>
                <ILText role="bodySm" color={G.meta} style={{ marginTop: 4, lineHeight: 18 }}>
                  {line.body}
                </ILText>
              </View>
              {line.taskId ? <MaterialIcons name="chevron-right" size={22} color={G.meta} /> : null}
            </WhiteCard>
          </Pressable>
        ))}
      </ScrollView>
    </Page>
  );
}

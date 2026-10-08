import React from 'react';
import { ScrollView, View } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { IL_FONTS } from '../../constants/ironLadyBrand';
import ILText from '../../components/il/ILText';
import { G } from '../../constants/guestTheme';
import { LIQUID_TAB_PAD } from '../../components/il/LiquidTabBar';
import { useAuth } from '../../context/AuthContext';
import { isLepEnrolled } from '../../utils/lepState';
import { GuestBackBar } from '../guest/GuestBits';
import { CheckRow, Page, WhiteCard } from '../lep/LepBits';
import { useLepNav } from '../lep/useLepNav';
import {
  COURSE_LABEL,
  coursePhase,
  courseTasks,
  isPhaseOpen,
} from '../../constants/programCourseSlice';
import { PROGRAMS } from '../../constants/programs';
import { useCourseDemo } from '../../context/CourseDemoContext';

export default function CoursePhaseScreen({ route, navigation }) {
  const insets = useSafeAreaInsets();
  const nav = useLepNav();
  const { profile } = useAuth();
  const enrolled = isLepEnrolled(profile);
  const programId = route.params?.programId || PROGRAMS.LEP;
  const phaseId = route.params?.phaseId;
  const phase = coursePhase(programId, phaseId);
  const tasks = courseTasks(programId, phaseId);
  const open = isPhaseOpen(phase, enrolled);
  const demo = useCourseDemo();

  return (
    <Page>
      <StatusBar style="dark" />
      <View style={{ paddingTop: Math.max(insets.top, 8) }}>
        <GuestBackBar
          title={phase?.title || 'Phase'}
          sub={`${COURSE_LABEL[programId] || 'Program'} · ${tasks.length} tasks`}
          onBack={() => navigation.goBack()}
        />
      </View>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{
          paddingHorizontal: 20,
          paddingBottom: LIQUID_TAB_PAD + Math.max(insets.bottom, 8),
        }}
      >
        <ILText role="bodySm" color={G.meta} style={{ marginTop: 8, fontSize: 13 }}>
          {phase?.sub || 'Tasks from the Iron Lady course list.'}
        </ILText>
        <WhiteCard style={{ marginTop: 16, borderRadius: 22, paddingHorizontal: 16 }}>
          {tasks.length ? (
            tasks.map((item, i) => (
              <CheckRow
                key={item.id}
                item={{
                  title: item.title,
                  meta: item.week ? `${item.kind} · ${item.week}` : item.kind,
                  done: demo.isDone(programId, item.id),
                }}
                last={i === tasks.length - 1}
                onPress={
                  open
                    ? () => nav.goCourseTask(programId, item.id)
                    : nav.goEnroll
                }
              />
            ))
          ) : (
            <View style={{ paddingVertical: 22 }}>
              <ILText role="body" color={G.meta}>
                {open
                  ? 'No sample tasks in this phase yet.'
                  : 'This phase unlocks after enrollment.'}
              </ILText>
            </View>
          )}
        </WhiteCard>
        {!open ? (
          <ILText
            role="bodySm"
            color={G.meta}
            style={{ marginTop: 14, fontFamily: IL_FONTS.regular, fontSize: 13 }}
          >
            Locked until enrollment. Tap a task to complete payment.
          </ILText>
        ) : null}
      </ScrollView>
    </Page>
  );
}

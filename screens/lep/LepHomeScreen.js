import React, { useEffect, useMemo, useRef, useState } from 'react';
import { useNavigation, useRoute } from '@react-navigation/native';
import {
  Animated,
  Linking,
  Modal,
  Platform,
  StatusBar as RNStatusBar,
  View,
} from 'react-native';
import Pressable from '../../components/il/Press';
import { StatusBar } from 'expo-status-bar';
import { MaterialIcons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { IL_FONTS } from '../../constants/ironLadyBrand';
import ILText from '../../components/il/ILText';
import { G, af } from '../../constants/guestTheme';
import { LIQUID_TAB_PAD } from '../../components/il/LiquidTabBar';
import { useAuth } from '../../context/AuthContext';
import { isLepEnrolled, lepFirstName } from '../../utils/lepState';
import { buildLepEnrolledHero } from '../../utils/lepBatchHero';
import {
  resolveLepDay1Iso,
  resolveLepEnrolledCohortPhase,
} from '../../utils/lepEnrolledCohortPhase';
import LepAlumniGate from './LepAlumniGate';
import {
  buildPreviewRegisteredHome,
  buildRegisteredHome,
  day1CalendarUrl,
  isLepProfileInfoDone,
  orientationCalendarUrl,
} from '../../utils/registeredHomeData';
import { isTaskDoneStatus, PROGRAMS } from '../../constants/programs';
import {
  learnerBatchId,
  learnerBhagText,
  learnerDomainText,
  learnerProgramDates,
  zohoLeadBatchLabel,
} from '../../utils/programAccess';
import { inferLepDay1FromZohoRaw } from '../../utils/lepDeskBatchDate';
import { updateUserProfile } from '../../services/firestore';
import { updateMyWelcomeProfile } from '../../services/functions';
import { lockLepBatchChoice } from '../../utils/lockLepBatch';
import { usePrograms } from '../../context/ProgramsContext';
import RegisteredHomeView, { BhagHomeCard, openDay1Calendar } from './RegisteredHomeView';
import ChooseBatchDateScreen from '../auth/ChooseBatchDateScreen';
import { buildLepDueWeek } from '../../utils/lepBatchDueWeek';
import { nextCmsBatchSession } from '../../utils/cmsBatchSessions';
import { useLearnerCmsBatch } from '../../hooks/useLearnerCmsBatch';
import { useLepBatchGroup } from '../../hooks/useLepBatchGroup';
import {
  LepHeader,
  Page,
  RedCta,
  SoftChip,
  WeekRing,
  WhiteCard,
} from './LepBits';
import { useLepNav } from './useLepNav';
import { PREWORK, RITUALS_WATCH } from './lepData';
import { useEnrolledDailyPractice } from '../../hooks/useLepDailyPractice';
import { useLepPracticeStreak } from '../../hooks/useLepPracticeStreak';
import { useLepRitualsUnlocked } from '../../hooks/useLepRitualsUnlocked';
import { filterLepPracticeItems, filterLepPrework, LEP_RITUALS_PRACTICE_ID } from '../../utils/lepRitualsUnlock';
import ILGuideWhisperLep from '../../components/il/ILGuideWhisperLep';
import { IL_GUIDE_SURFACES } from '../../constants/ilGuide';
import { todayIsoIST } from '../../utils/lepDailyPractice';
import { useGlassHeaderPad } from '../../components/il/GlassHeader';
import { useCourseDemo } from '../../context/CourseDemoContext';
import { practiceKey } from '../../constants/practice';
import { DueWeek } from '../program/ProgramKit';
import {
  buildUpcomingSessionCard,
  enrolledWhisperFallback,
} from '../../utils/lepEnrolledHomeHint';
import { isGuideTaskOpen, nextJourneyTask } from '../../utils/ilGuideJourney';
import { phaseFlowFromBatch } from '../../utils/phaseUnlock';
import { makeTaskDoneChecker } from '../../utils/taskDone';
import PracticeDeck from '../../components/lep/PracticeDeck';
import LepHomeTakeAMoment from '../../components/lep/LepHomeTakeAMoment';
import GetReadyChecklistCard from '../../components/lep/GetReadyChecklistCard';
import PreworkBeforeDay1 from '../../components/lep/PreworkBeforeDay1';
import LepRitualsTrackerPanel from '../../components/lep/LepRitualsTrackerPanel';
import { useLepFiveRitualsTracker } from '../../hooks/useLepFiveRitualsTracker';
import { mergeGetReadyItems, toggleGetReadyItem } from '../../utils/lepGetReadyChecklist';
import { daysFromDay1, todayIsoIST as practiceTodayIso } from '../../utils/lepDailyPractice';
import { recordSessionJoin } from '../../services/activityTracking';
import { scheduleLepRitualsNotifications } from '../../services/lepRitualsNotifications';

function EnrolledRoute({ cmsBatch }) {
  const { profile } = useAuth();
  const day1Iso = useMemo(() => resolveLepDay1Iso(profile, cmsBatch), [profile, cmsBatch]);
  const cohortPhase = useMemo(
    () => resolveLepEnrolledCohortPhase(profile, day1Iso),
    [profile, day1Iso]
  );
  if (cohortPhase === 'alumni') return <LepAlumniGate />;
  return <EnrolledHome cmsBatch={cmsBatch} />;
}

export default function LepHomeScreen() {
  const { profile } = useAuth();
  const { batch } = useLearnerCmsBatch('lep');
  const forced = profile?.labRegStatus || null;
  // Enrolled: alumni cohort → dedicated Alumni home; else pre-launch / in-cohort enrolled home.
  if (!forced && isLepEnrolled(profile)) return <EnrolledRoute cmsBatch={batch} />;
  return <RegisteredHome cmsBatch={batch} preview={forced} />;
}

function RegisteredShell({ children, scrollY, headerGone, onScrollY }) {
  const insets = useSafeAreaInsets();
  const { profile } = useAuth();
  const nav = useLepNav();
  useEffect(() => {
    if (Platform.OS !== 'android') return undefined;
    RNStatusBar.setTranslucent(true);
    RNStatusBar.setBackgroundColor('transparent');
    RNStatusBar.setBarStyle('light-content');
    return undefined;
  }, []);
  return (
    <Page>
      <StatusBar style="light" translucent backgroundColor="transparent" />
      <LepHeader
        floating
        scrim={false}
        photoUrl={profile?.photoURL}
        onNotifications={nav.goNotifications}
        onProfile={nav.goProfile}
        onCalendar={nav.goSchedule}
        scrollY={scrollY}
        inert={headerGone}
      />
      <Animated.ScrollView
        showsVerticalScrollIndicator={false}
        scrollEventThrottle={16}
        keyboardShouldPersistTaps="handled"
        nestedScrollEnabled
        onScroll={Animated.event([{ nativeEvent: { contentOffset: { y: scrollY } } }], {
          useNativeDriver: false,
          listener: (e) => onScrollY?.(e.nativeEvent.contentOffset.y),
        })}
        contentContainerStyle={{
          paddingHorizontal: 20,
          paddingTop: 0,
          paddingBottom: LIQUID_TAB_PAD + Math.max(insets.bottom, 8),
        }}
      >
        {children}
      </Animated.ScrollView>
    </Page>
  );
}

function RegisteredHome({ cmsBatch, preview }) {
  const { profile, user, patchProfile } = useAuth();
  const nav = useLepNav();
  const demo = useCourseDemo();
  const { getTaskSubmission } = usePrograms();
  const [roleDismissed, setRoleDismissed] = useState(false);
  const [batchOpen, setBatchOpen] = useState(false);
  const headerPad = useGlassHeaderPad();
  const scrollY = useRef(new Animated.Value(0)).current;
  const [headerGone, setHeaderGone] = useState(false);
  const name = lepFirstName(profile);
  const domain = learnerDomainText(profile);
  const bhag =
    learnerBhagText(profile) ||
    demo.getSubmission('lep', practiceKey('lep-bhag'))?.data?.note ||
    '';
  const model = useMemo(() => {
    if (preview && preview !== 'live') return buildPreviewRegisteredHome(preview, name);
    return buildRegisteredHome({
      profile,
      cmsBatch,
      viaDone: isTaskDoneStatus(getTaskSubmission(PROGRAMS.LEP, 'lep-via-survey')?.status),
      nsdcDone: isTaskDoneStatus(getTaskSubmission(PROGRAMS.LEP, 'lep-prep-nsdc')?.status),
      bhagDone: Boolean(String(bhag).trim()),
      profileDone: isLepProfileInfoDone(profile),
    });
  }, [preview, name, profile, cmsBatch, bhag, getTaskSubmission]);
  const lepAccess = profile?.programAccess?.lep || {};
  const batchLabel = zohoLeadBatchLabel(profile, 'lep');
  const day1Iso = useMemo(() => {
    if (preview && preview !== 'live') return model.day1Iso || '';
    return (
      (cmsBatch?.day1Date && String(cmsBatch.day1Date).slice(0, 10)) ||
      model.day1Iso ||
      learnerProgramDates(profile, 'lep').start ||
      String(lepAccess.day1Date || '').slice(0, 10) ||
      inferLepDay1FromZohoRaw(lepAccess.zohoRawBatch || lepAccess.zohoBatchKey || batchLabel || '') ||
      ''
    );
  }, [preview, cmsBatch?.day1Date, model.day1Iso, profile, lepAccess, batchLabel]);
  const upcomingSession = useMemo(
    () =>
      buildUpcomingSessionCard(cmsBatch, {
        day1Iso,
        registeredIntensiveOnly: true,
      }),
    [cmsBatch, day1Iso]
  );
  const guideContext = useMemo(
    () => ({
      programId: PROGRAMS.LEP,
      regStatus: model.status,
      cmsBatchId: cmsBatch?.id || profile?.cmsBatchId || null,
      day1Date: day1Iso || null,
      lepBatch:
        day1Iso || cmsBatch
          ? {
              nextSessionTitle: upcomingSession.title,
              nextSessionWhen: [upcomingSession.when, upcomingSession.hours].filter(Boolean).join(' · '),
            }
          : null,
    }),
    [
      model.status,
      day1Iso,
      cmsBatch,
      profile?.cmsBatchId,
      upcomingSession.title,
      upcomingSession.when,
      upcomingSession.hours,
    ]
  );

  // Domain already comes from welcome / Zoho profile — only ask when it is missing.
  const roleOn = !roleDismissed && !domain;

  const saveRole = (picked) => {
    const next = { domain: picked, leadershipRole: picked };
    patchProfile(next);
    if (user?.uid && user.uid !== 'preview') {
      updateUserProfile(user.uid, next).catch(() => {});
      updateMyWelcomeProfile({ domain: picked }).catch(() => {});
    }
  };

  const lockBatch = (picked) => {
    setBatchOpen(false);
    lockLepBatchChoice({ user, profile, patchProfile, picked }).catch(() => {});
  };

  const openTask = (task) => {
    if (task.id === 'enroll') nav.goEnroll();
    else if (task.id === 'via') nav.goCourseTask(PROGRAMS.LEP, 'lep-via-survey');
    else if (task.id === 'bhag') nav.goPractice('lep', 'lep-bhag');
    else if (task.id === 'nsdc') nav.goCourseTask(PROGRAMS.LEP, 'lep-prep-nsdc');
    else if (task.id === 'profile') nav.goProfile();
  };

  const onPhaseCta = (phase) => {
    if (phase?.ctaBlocked) return;
    const taskId = phase?.ctaTaskId;
    if (
      taskId === 'calendar' ||
      taskId === 'day1' ||
      taskId === 'orientation' ||
      (phase?.key === 'day1' && String(phase?.cta || '').toLowerCase().includes('calendar'))
    ) {
      const milestone = model.milestone || phase?.label || 'Day 1';
      const url =
        milestone === 'Orientation'
          ? orientationCalendarUrl(model.orientationIso, model.orientationClock)
          : day1CalendarUrl(model.day1Iso, model.day1Clock);
      if (url) openDay1Calendar(url);
      else nav.goSchedule();
      return;
    }
    if (taskId === 'batch' || String(phase?.cta || '').includes('batch date')) {
      setBatchOpen(true);
      return;
    }
    if (taskId === 'enroll') {
      openTask({ id: 'enroll' });
      return;
    }
    if (phase?.key === 'prework') {
      const pre =
        model.tasks.find(
          (task) => ['via', 'bhag', 'nsdc', 'profile'].includes(task.id) && task.state !== 'done'
        ) || model.tasks.find((task) => task.id === taskId);
      if (pre) openTask(pre);
      return;
    }
    const current =
      model.tasks.find((task) => task.id === taskId) ||
      model.tasks.find((task) => task.state === 'now') ||
      model.tasks[0];
    if (current) openTask(current);
  };

  const onCta = () => {
    const phase = (model.phases || [])[model.lockerStep] || model.phases?.[0];
    if (phase) onPhaseCta(phase);
  };

  return (
    <View style={{ flex: 1 }}>
      <RegisteredShell
        scrollY={scrollY}
        headerGone={headerGone}
        onScrollY={(y) => {
          // Stop the faded floating header from eating taps once it is off-screen.
          const gone = y > 56;
          setHeaderGone((prev) => (prev === gone ? prev : gone));
        }}
      >
        <RegisteredHomeView
          model={model}
          guideContext={guideContext}
          onCta={onCta}
          onPhaseCta={onPhaseCta}
          onTask={openTask}
          onVideo={() =>
            nav.goWatch({
              assetKey: 'lep-principles-video',
              title: '27 Principles',
              sub: 'Mental models for unflinching leadership',
            })
          }
          onStory={(story) => nav.goWatch({ assetKey: story.assetKey, title: story.title, sub: story.meta })}
          onRsvp={nav.goEngage}
          role={domain}
          roleOn={roleOn}
          onRole={saveRole}
          onDismissRole={() => setRoleDismissed(true)}
          bhag={String(bhag).trim()}
          onBhag={() => nav.goPractice('lep', 'lep-bhag')}
          topPad={headerPad}
          upcomingSession={day1Iso || model.dated ? upcomingSession : null}
          onOpenSchedule={nav.goSchedule}
        />
      </RegisteredShell>
      {batchOpen ? (
        <Modal
          visible
          animationType="slide"
          presentationStyle="fullScreen"
          onRequestClose={() => setBatchOpen(false)}
        >
          <ChooseBatchDateScreen
            allowChange
            onBack={() => setBatchOpen(false)}
            onLock={lockBatch}
          />
        </Modal>
      ) : null}
    </View>
  );
}

function EnrolledHome({ cmsBatch }) {
  const { profile } = useAuth();
  const name = lepFirstName(profile);
  const nav = useLepNav();
  const demo = useCourseDemo();
  const { getTaskSubmission } = usePrograms();
  const group = useLepBatchGroup(profile);
  const headerPad = useGlassHeaderPad();
  const scrollY = useRef(new Animated.Value(0)).current;
  const [headerGone, setHeaderGone] = useState(false);
  // Live Zoho batch only — empty Zoho must not unlock rituals via a stale group range.
  const liveZohoBatch = zohoLeadBatchLabel(profile, 'lep');
  const { unlocked: ritualsUnlocked } = useLepRitualsUnlocked({
    cmsBatch,
    group,
    zohoRawBatch: liveZohoBatch || null,
  });
  // Always hide 5 Rituals here — this block is pre–Day 1 only (LEP_Flow).
  const prework = useMemo(() => {
    const base = filterLepPrework(PREWORK, false);
    return base.map((item) => ({
      ...item,
      done: Boolean(
        item.practiceId &&
          (demo.isDone('lep', practiceKey(item.practiceId)) ||
            demo.isDone('lep', item.practiceId))
      ),
    }));
  }, [demo.done]);
  const ritualsWatch = useMemo(
    () => ({
      ...RITUALS_WATCH,
      done: Boolean(
        demo.isDone('lep', practiceKey(LEP_RITUALS_PRACTICE_ID)) ||
          demo.isDone('lep', LEP_RITUALS_PRACTICE_ID)
      ),
    }),
    [demo.done]
  );
  const practiceRaw = useEnrolledDailyPractice(group, cmsBatch);
  const practice = useMemo(() => {
    let list = filterLepPracticeItems(practiceRaw, ritualsUnlocked);
    if (ritualsUnlocked && !ritualsWatch.done) {
      list = list.filter((p) => p.practiceId !== LEP_RITUALS_PRACTICE_ID);
    }
    return list;
  }, [practiceRaw, ritualsUnlocked, ritualsWatch.done]);
  // "Practise now" on a streak reminder: open her first unfinished practice once the list is in.
  // All done → she stays on Home, with today's practice in view.
  const route = useRoute();
  const navigation = useNavigation();
  const openPractice = route.params?.openPractice;
  useEffect(() => {
    if (!openPractice || !practice?.length) return;
    navigation.setParams({ openPractice: undefined });
    const next = practice.find((p) => !p.done);
    if (next) nav.goPracticeItem(next);
  }, [openPractice, practice]);
  const day1Iso = useMemo(
    () =>
      (cmsBatch?.day1Date && String(cmsBatch.day1Date).slice(0, 10)) ||
      learnerProgramDates(profile, 'lep').start ||
      String(profile?.programAccess?.lep?.day1Date || '').slice(0, 10) ||
      '',
    [cmsBatch?.day1Date, profile]
  );
  const { today: ritualsToday, model: ritualsModel, toggleRitual, unmarkRitual } =
    useLepFiveRitualsTracker(day1Iso);
  // Batches with automatic reminders get the morning nudge from the scheduler instead.
  const serverDailyRituals = cmsBatch?.status === 'live' && cmsBatch?.automationEnabled === true;
  useEffect(() => {
    if (!ritualsUnlocked) return;
    scheduleLepRitualsNotifications({ serverDaily: serverDailyRituals }).catch(() => {});
  }, [ritualsUnlocked, serverDailyRituals]);

  const day1Offset = useMemo(
    () => (day1Iso ? daysFromDay1(practiceTodayIso(), day1Iso) : null),
    [day1Iso]
  );
  const cohortPhase = useMemo(
    () => resolveLepEnrolledCohortPhase(profile, day1Iso),
    [profile, day1Iso]
  );
  // Pre–Day 1 blocks only before the cohort starts.
  const showPrelaunchBlocks = cohortPhase === 'prelaunch';
  // Keep “Watch these 2” visible until both videos are done (even on Day 1 launch day).
  const showWatchThese = showPrelaunchBlocks && prework.some((item) => !item.done);
  const showRitualsWatch = ritualsUnlocked && !ritualsWatch.done;
  const showRitualsTracker = ritualsUnlocked && ritualsWatch.done;
  const streak = useLepPracticeStreak();
  const enrolledBhag = String(
    learnerBhagText(profile) || demo.getSubmission('lep', practiceKey('lep-bhag'))?.data?.note || ''
  ).trim();
  const hero = buildLepEnrolledHero(profile, group);
  const heroChip =
    cohortPhase === 'active' && day1Offset != null && day1Offset >= 0
      ? day1Offset === 0
        ? 'Day 1 · live today'
        : day1Offset === 1
          ? 'Day 2 · live today'
          : `Day ${day1Offset + 1} of your cohort`
      : hero.launchChip;
  const dueWeek = useMemo(() => buildLepDueWeek(cmsBatch || (day1Iso ? { day1Date: day1Iso } : null)), [
    cmsBatch,
    day1Iso,
  ]);
  const upcoming = useMemo(
    () => buildUpcomingSessionCard(cmsBatch, { day1Iso }),
    [cmsBatch, day1Iso]
  );
  const nextSession = useMemo(
    () => nextCmsBatchSession(cmsBatch || (day1Iso ? { day1Date: day1Iso } : null), new Date(), { day1Iso }),
    [cmsBatch, day1Iso]
  );
  const taskIsDone = useMemo(
    () => makeTaskDoneChecker({ isDone: demo.isDone, getTaskSubmission }),
    [demo.isDone, demo.done, getTaskSubmission]
  );
  // The guide only nudges what she can open today — a locked phase's task (e.g. Program
  // Access Essentials before Orientation opens) must not be "still open this week".
  const guideFlow = useMemo(
    () => phaseFlowFromBatch(PROGRAMS.LEP, cmsBatch, practiceTodayIso()),
    [cmsBatch]
  );
  const journeyNext = useMemo(
    () => nextJourneyTask(PROGRAMS.LEP, profile, taskIsDone, guideFlow),
    [profile, taskIsDone, guideFlow]
  );
  const guideContext = useMemo(() => {
    const practiceDoneToday = practice.filter((p) => p.done).length;
    return {
      lepPractice: {
        currentStreak: streak.currentStreak,
        ritualsDoneToday: streak.ritualsDoneToday,
        ritualsUnlocked,
        weekActiveDays: streak.weekActiveDays,
        practiceDoneToday,
        practiceTotalToday: practice.length,
      },
      lepBatch:
        cmsBatch || day1Iso
          ? {
              name: cmsBatch?.name || null,
              day1Date: cmsBatch?.day1Date || day1Iso,
              orientationDate: cmsBatch?.orientationDate || null,
              nextSessionTitle: nextSession?.title || upcoming.title || null,
              nextSessionWhen: nextSession?.meta || nextSession?.doneMeta || upcoming.when || null,
            }
          : null,
      lepDues: (dueWeek.items || [])
        .filter((item) => !item.taskId || isGuideTaskOpen(PROGRAMS.LEP, profile, guideFlow, item.taskId))
        .map((item) => {
          const lmsDone = item.taskId
            ? isTaskDoneStatus(getTaskSubmission(PROGRAMS.LEP, item.taskId)?.status)
            : false;
          const done = item.taskId
            ? demo.isDone(PROGRAMS.LEP, item.taskId) || lmsDone
            : !!item.done;
          return {
            title: item.title,
            due: item.due,
            urgent: !!item.urgent,
            taskId: item.taskId || null,
            sessionCode: item.sessionCode || null,
            done,
          };
        }),
      openPractice: (() => {
        const weekItem = practice.find(
          (p) =>
            !p.done &&
            (String(p.id || '').startsWith('week-') ||
              /next for this week|Video · Week/i.test(String(p.meta || '')))
        );
        const nextOpen = weekItem || practice.find((p) => !p.done) || null;
        return nextOpen
          ? {
              title: nextOpen.title,
              taskId: nextOpen.taskId || null,
              practiceId: nextOpen.practiceId || null,
              programId: PROGRAMS.LEP,
              done: false,
            }
          : null;
      })(),
      journeyNextTask: journeyNext
        ? { id: journeyNext.id, title: journeyNext.title, type: journeyNext.type }
        : null,
    };
  }, [
    streak,
    practice,
    cmsBatch,
    day1Iso,
    nextSession,
    ritualsUnlocked,
    dueWeek.items,
    upcoming,
    journeyNext,
    demo,
    getTaskSubmission,
    profile,
    guideFlow,
  ]);
  const dueItemsWithDone = useMemo(
    () =>
      (dueWeek.items || []).map((item) => {
        const lmsDone = item.taskId
          ? isTaskDoneStatus(getTaskSubmission(PROGRAMS.LEP, item.taskId)?.status)
          : false;
        const done = item.taskId
          ? demo.isDone(PROGRAMS.LEP, item.taskId) || lmsDone
          : !!item.done;
        return { ...item, done };
      }),
    [dueWeek.items, demo, getTaskSubmission]
  );
  const whisperFallback = useMemo(
    () =>
      enrolledWhisperFallback({
        name,
        nextSession,
        nextTaskTitle: journeyNext?.title || '',
        nextTaskId: journeyNext?.id || null,
        dueItems: dueItemsWithDone,
        practice,
        ritualsUnlocked,
        practiceDoneToday: practice.filter((p) => p.done).length,
        practiceTotalToday: practice.length,
        currentStreak: streak.currentStreak,
      }),
    [name, nextSession, journeyNext, dueItemsWithDone, practice, ritualsUnlocked, streak.currentStreak]
  );
  const savedReady = demo.getSubmission('lep', 'lep-get-ready')?.data?.checked;
  const readyItems = useMemo(() => mergeGetReadyItems(savedReady), [savedReady]);
  const toggleReady = (item) => {
    const { checked, allDone } = toggleGetReadyItem(readyItems, item);
    demo.saveSubmission('lep', 'lep-get-ready', { checked }, { skipMarkDone: true });
    if (allDone) {
      demo.markDone('lep', practiceKey('lep-get-ready'));
      demo.recordLepActiveDay(practiceTodayIso());
    }
  };

  return (
    <RegisteredShell
      scrollY={scrollY}
      headerGone={headerGone}
      onScrollY={(y) => {
        const gone = y > 56;
        setHeaderGone((prev) => (prev === gone ? prev : gone));
      }}
    >
      <View
        style={{
          backgroundColor: G.dark,
          marginHorizontal: -20,
          borderBottomLeftRadius: 24,
          borderBottomRightRadius: 24,
          paddingTop: headerPad + 28,
          paddingBottom: 22,
          paddingHorizontal: 20,
        }}
      >
        <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
          {hero.programChip ? (
            <SoftChip onDark icon="verified">
              {hero.programChip}
            </SoftChip>
          ) : (
            <View />
          )}
          {heroChip ? <SoftChip onDark>{heroChip}</SoftChip> : null}
        </View>
        <ILText
          role="display"
          color="#FFFFFF"
          style={{ marginTop: 18, fontFamily: IL_FONTS.display, fontSize: 34, lineHeight: 40, letterSpacing: -0.7 }}
        >
          You’re all set, {name}.
        </ILText>
        {hero.subline ? (
          <ILText role="body" color="rgba(255,255,255,0.72)" style={{ marginTop: 8, fontSize: 16, lineHeight: 22 }}>
            {hero.subline}
          </ILText>
        ) : null}
      </View>

      <ILGuideWhisperLep
        surface={IL_GUIDE_SURFACES.HOME}
        guideContext={guideContext}
        fallbackQuote={whisperFallback}
        subtitle="Your guide"
      />

      <PracticeDeck
        items={practice}
        streakLabel={streak.streakLabel}
        onOpen={nav.goToday}
        onStreakPress={nav.goProgress}
        onItem={nav.goPracticeItem}
        note={
          day1Iso
            ? (() => {
                const off = daysFromDay1(practiceTodayIso(), day1Iso);
                if (off == null) return 'Set your batch to unlock the calendar';
                if (off < 0) return 'Pre-Day 1 · from your batch';
                if (off === 0) return 'Day 1 · live today';
                if (off === 1) return 'Day 2 · live today';
                return `Day ${off + 1} of your batch journey`;
              })()
            : 'Batch date needed for calendar dues'
        }
      />

      <LepHomeTakeAMoment
        todayIso={practiceTodayIso()}
        day1Iso={day1Iso}
        cmsBatch={cmsBatch}
        nav={nav}
        navigation={navigation}
      />

      <DueWeek
        sub={dueWeek.sub}
        onSchedule={nav.goSchedule}
        items={dueItemsWithDone.map((item) => ({
          ...item,
          onPress: item.taskId
            ? () => nav.goCourseTask(PROGRAMS.LEP, item.taskId)
            : item.sessionCode
              ? nav.goSchedule
              : undefined,
        }))}
      />

      <Pressable onPress={nav.goProgress}>
        <WhiteCard style={{ marginTop: 14, borderRadius: 22, padding: 16, flexDirection: 'row', alignItems: 'center' }}>
          <WeekRing done={streak.weekActiveDays} total={streak.weekTotal} />
          <View style={{ flex: 1, marginLeft: 12 }}>
            <ILText role="label" color={G.ink}>
              {streak.weekLabel}
            </ILText>
            <ILText role="bodySm" color={G.meta} style={{ marginTop: 2, fontSize: 12, lineHeight: 17 }}>
              {ritualsUnlocked
                ? 'Active day = you finished at least one practice (5 Rituals count). Mon–Fri this week.'
                : 'Active day = any practice you complete. 5 Rituals unlock after Day 1 and Day 2.'}
            </ILText>
            <View style={{ flexDirection: 'row', marginTop: 8 }}>
              {['M', 'T', 'W', 'T', 'F'].map((d, i) => (
                <View
                  key={`${d}${i}`}
                  style={{
                    width: 26,
                    height: 26,
                    borderRadius: 13,
                    marginRight: 6,
                    backgroundColor: streak.weekFilled[i] ? G.dark : G.mutedFill,
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <ILText
                    role="label"
                    color={streak.weekFilled[i] ? '#FFFFFF' : G.meta}
                    style={[af, { fontSize: 10 }]}
                  >
                    {d}
                  </ILText>
                </View>
              ))}
            </View>
          </View>
        </WhiteCard>
      </Pressable>

      {showWatchThese ? (
        <PreworkBeforeDay1
          items={prework}
          onOpenItem={(item) => item.practiceId && nav.goPractice('lep', item.practiceId)}
        />
      ) : null}

      {showRitualsWatch ? (
        <PreworkBeforeDay1
          heading="Watch this before your 5 Rituals"
          description="Same format as your Day 1 pre-work — watch once, then tick your five rituals each morning."
          items={[ritualsWatch]}
          onOpenItem={(item) => item.practiceId && nav.goPractice('lep', item.practiceId)}
        />
      ) : null}

      {showRitualsTracker ? (
        <View style={{ marginTop: 8 }}>
          <View style={{ marginTop: 18, flexDirection: 'row', alignItems: 'flex-end', justifyContent: 'space-between' }}>
            <ILText role="title" color={G.ink} style={{ flex: 1, fontFamily: IL_FONTS.display, fontSize: 22 }}>
              Your 5 Daily Rituals
            </ILText>
            <Pressable onPress={nav.goRitualsDashboard} accessibilityRole="button">
              <ILText role="label" color={G.cta} style={{ fontSize: 12 }}>
                Full tracker
              </ILText>
            </Pressable>
          </View>
          <ILText role="bodySm" color={G.meta} style={{ marginTop: 4, fontSize: 12, lineHeight: 18 }}>
            Tick each ritual you did today — marks count toward your weekly score.
          </ILText>
          <LepRitualsTrackerPanel
            today={ritualsToday}
            model={ritualsModel}
            toggleRitual={toggleRitual}
            unmarkRitual={unmarkRitual}
            showVideoLink={false}
          />
        </View>
      ) : null}

      {showPrelaunchBlocks ? (
        <GetReadyChecklistCard items={readyItems} onToggleItem={toggleReady} />
      ) : null}

      <WhiteCard style={{ marginTop: 16, borderRadius: 22, padding: 18 }}>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
          <ILText role="eyebrow" color={G.meta} style={[af, { fontSize: 10 }]}>
            {upcoming.kicker}
          </ILText>
          <MaterialIcons name="groups" size={18} color={G.ink} />
        </View>
        <ILText
          role="title"
          color={G.ink}
          style={{ marginTop: 8, fontFamily: IL_FONTS.display, fontSize: 22, lineHeight: 28 }}
        >
          {upcoming.title}
        </ILText>
        <ILText role="body" color={G.body} style={{ marginTop: 10, fontSize: 14 }}>
          {upcoming.when}
        </ILText>
        {upcoming.hours ? (
          <ILText role="bodySm" color={G.meta} style={{ marginTop: 4, fontSize: 13 }}>
            {upcoming.hours}
          </ILText>
        ) : null}
        <View style={{ marginTop: 16 }}>
          <RedCta
            label="Add to calendar"
            icon="event"
            onPress={() => {
              if (upcoming.calendarUrl) Linking.openURL(upcoming.calendarUrl).catch(() => nav.goSchedule());
              else nav.goSchedule();
            }}
          />
        </View>
        <Pressable
          onPress={() => {
            if (upcoming.joinLink) {
              recordSessionJoin(upcoming.code);
              Linking.openURL(upcoming.joinLink).catch(() => {});
            } else nav.goSchedule();
          }}
          style={{
            marginTop: 10,
            backgroundColor: G.dark,
            borderRadius: 999,
            paddingVertical: 14,
            alignItems: 'center',
          }}
        >
          <ILText role="label" color="#FFFFFF">
            {upcoming.ready ? 'Join Zoom session' : 'Zoom Boardroom link'}
          </ILText>
          <ILText role="bodySm" color="rgba(255,255,255,0.6)" style={{ marginTop: 2, fontSize: 11 }}>
            {upcoming.ready ? 'Opens your batch join link' : 'Unlocks when the host posts the link'}
          </ILText>
        </Pressable>
      </WhiteCard>

      <BhagHomeCard
        bhag={enrolledBhag}
        onBhag={() => nav.goPractice('lep', 'lep-bhag')}
        style={{ marginTop: 16 }}
      />
    </RegisteredShell>
  );
}

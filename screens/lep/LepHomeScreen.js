import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  Animated,
  Image,
  Linking,
  Modal,
  Platform,
  StatusBar as RNStatusBar,
  View,
} from 'react-native';
import Pressable from '../../components/il/Press';
import { doc, getDoc } from 'firebase/firestore';
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
import RegisteredHomeView, { openDay1Calendar } from './RegisteredHomeView';
import ChooseBatchDateScreen from '../auth/ChooseBatchDateScreen';
import { buildLepDueWeek } from '../../utils/lepBatchDueWeek';
import { nextCmsBatchSession } from '../../utils/cmsBatchSessions';
import { useLearnerCmsBatch } from '../../hooks/useLearnerCmsBatch';
import { db } from '../../services/firebase';
import {
  CheckRow,
  LepHeader,
  LinkRow,
  Page,
  RedCta,
  SoftChip,
  WeekRing,
  WhiteCard,
} from './LepBits';
import { useLepNav } from './useLepNav';
import { GET_READY, HERO, PREWORK } from './lepData';
import { useEnrolledDailyPractice } from '../../hooks/useLepDailyPractice';
import { useLepPracticeStreak } from '../../hooks/useLepPracticeStreak';
import { useLepRitualsUnlocked } from '../../hooks/useLepRitualsUnlocked';
import { filterLepPracticeItems, filterLepPrework } from '../../utils/lepRitualsUnlock';
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
import { nextJourneyTask } from '../../utils/ilGuideJourney';
import { makeTaskDoneChecker } from '../../utils/taskDone';
import PracticeDeck from '../../components/lep/PracticeDeck';
import { daysFromDay1, todayIsoIST as practiceTodayIso } from '../../utils/lepDailyPractice';
import { recordSessionJoin } from '../../services/activityTracking';
import { scheduleLepRitualsNotifications } from '../../services/lepRitualsNotifications';

function EnrolledRoute() {
  const { profile } = useAuth();
  const { batch: cmsBatch } = useLearnerCmsBatch('lep');
  const day1Iso = useMemo(() => resolveLepDay1Iso(profile, cmsBatch), [profile, cmsBatch]);
  const cohortPhase = useMemo(
    () => resolveLepEnrolledCohortPhase(profile, day1Iso),
    [profile, day1Iso]
  );
  if (cohortPhase === 'alumni') return <LepAlumniGate />;
  return <EnrolledHome />;
}

export default function LepHomeScreen() {
  const { profile } = useAuth();
  const { batch } = useLearnerCmsBatch('lep');
  const forced = profile?.labRegStatus || null;
  // Enrolled: alumni cohort → dedicated Alumni home; else pre-launch / in-cohort enrolled home.
  if (!forced && isLepEnrolled(profile)) return <EnrolledRoute />;
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

function useLepBatchGroup(profile) {
  const batchId = learnerBatchId(profile, 'lep');
  const id = batchId && batchId !== 'default' && /^[A-Za-z0-9_-]+$/.test(batchId) ? batchId : null;
  const [group, setGroup] = useState(null);

  useEffect(() => {
    if (!id) {
      setGroup(null);
      return undefined;
    }
    let cancelled = false;
    getDoc(doc(db, 'groups', id))
      .then((snap) => {
        if (!cancelled) setGroup(snap.exists() ? { id: snap.id, ...snap.data() } : null);
      })
      .catch(() => {
        if (!cancelled) setGroup(null);
      });
    return () => {
      cancelled = true;
    };
  }, [id]);

  return group;
}

function EnrolledHome() {
  const { profile } = useAuth();
  const name = lepFirstName(profile);
  const nav = useLepNav();
  const demo = useCourseDemo();
  const { getTaskSubmission } = usePrograms();
  const group = useLepBatchGroup(profile);
  const { batch: cmsBatch } = useLearnerCmsBatch('lep');
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
  const practiceRaw = useEnrolledDailyPractice(group, cmsBatch);
  const practice = useMemo(
    () => filterLepPracticeItems(practiceRaw, ritualsUnlocked),
    [practiceRaw, ritualsUnlocked]
  );
  // Template = day/time; CMS/Zoho = which Day 1 + Zoom when ops set a link.
  const day1Iso =
    (cmsBatch?.day1Date && String(cmsBatch.day1Date).slice(0, 10)) ||
    learnerProgramDates(profile, 'lep').start ||
    String(profile?.programAccess?.lep?.day1Date || '').slice(0, 10) ||
    '';
  useEffect(() => {
    if (!ritualsUnlocked) return;
    scheduleLepRitualsNotifications().catch(() => {});
  }, [ritualsUnlocked]);

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
  const streak = useLepPracticeStreak();
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
  const journeyNext = useMemo(
    () => nextJourneyTask(PROGRAMS.LEP, profile, taskIsDone),
    [profile, taskIsDone]
  );
  const guideContext = useMemo(() => {
    const practiceDoneToday = practice.filter((p) => p.done).length;
    const nextOpenPractice = practice.find((p) => !p.done) || null;
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
      lepDues: (dueWeek.items || []).map((item) => {
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
      openPractice: nextOpenPractice
        ? {
            title: nextOpenPractice.title,
            taskId: nextOpenPractice.taskId || null,
            practiceId: nextOpenPractice.practiceId || null,
            programId: PROGRAMS.LEP,
            done: false,
          }
        : null,
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
  const readyItems = GET_READY.map((item) => ({
    ...item,
    done: savedReady ? !!savedReady[item.title] : item.done,
  }));
  const toggleReady = (title) => {
    const checked = Object.fromEntries(
      readyItems.map((item) => [item.title, item.title === title ? !item.done : item.done])
    );
    demo.saveSubmission('lep', 'lep-get-ready', { checked });
    if (checked[title]) {
      demo.markDone('lep', practiceKey('lep-get-ready'));
      demo.recordLepActiveDay(todayIsoIST());
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
        <>
          <Section
            title={`Watch these ${prework.length} before Day 1`}
            sub="Essential foundations curated by Rajesh & IL Guide"
            action={`${prework.filter((i) => i.done).length} of ${prework.length} done`}
          />
          {prework.map((item) =>
            item.done ? (
              <WhiteCard
                key={item.n}
                onPress={() => item.practiceId && nav.goPractice('lep', item.practiceId)}
                style={{ marginTop: 10, borderRadius: 20, overflow: 'hidden', flexDirection: 'row' }}
              >
                <View style={{ width: 96, height: 86, backgroundColor: G.dark }}>
                  <Image
                    source={item.thumb || HERO}
                    style={{ width: '100%', height: '100%', opacity: 0.55 }}
                    resizeMode="cover"
                  />
                  <View
                    style={{
                      position: 'absolute',
                      left: 34,
                      top: 29,
                      width: 28,
                      height: 28,
                      borderRadius: 14,
                      backgroundColor: G.white,
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    <MaterialIcons name="check" size={16} color={G.ink} />
                  </View>
                  <ILText
                    role="label"
                    color="#FFFFFF"
                    style={{ position: 'absolute', left: 8, bottom: 8, fontSize: 10 }}
                  >
                    {item.min}
                  </ILText>
                </View>
                <View style={{ flex: 1, padding: 12 }}>
                  <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                    <ILText role="eyebrow" color={G.cta} style={[af, { fontSize: 11 }]}>
                      {item.n}
                    </ILText>
                    <ILText role="label" color={G.cta} style={[af, { fontSize: 11 }]}>
                      Watched
                    </ILText>
                  </View>
                  <ILText role="label" color={G.ink} style={{ marginTop: 4 }}>
                    {item.title}
                  </ILText>
                  <ILText
                    role="bodySm"
                    color={G.meta}
                    style={{ marginTop: 2, fontSize: 12 }}
                    numberOfLines={2}
                  >
                    {item.sub}
                  </ILText>
                </View>
              </WhiteCard>
            ) : (
              <NextVideoCard
                key={item.n}
                item={item}
                onPress={() => item.practiceId && nav.goPractice('lep', item.practiceId)}
              />
            )
          )}
        </>
      ) : null}

      {showPrelaunchBlocks ? (
        <>
          <Section title="Get ready" sub="Day 1 checklist" />
          <WhiteCard style={{ marginTop: 12, borderRadius: 22, paddingHorizontal: 16 }}>
            {readyItems.map((item, i) => (
              <CheckRow
                key={item.title}
                item={item}
                last={i === readyItems.length - 1}
                onPress={() => toggleReady(item.title)}
              />
            ))}
          </WhiteCard>
        </>
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

    </RegisteredShell>
  );
}

function NextVideoCard({ item, onPress }) {
  return (
    <WhiteCard onPress={onPress} style={{ marginTop: 10, borderRadius: 22, padding: 12 }}>
      <View style={{ height: 180, borderRadius: 16, overflow: 'hidden', backgroundColor: G.dark }}>
        <Image source={item.thumb || HERO} style={{ width: '100%', height: '100%' }} resizeMode="cover" />
        <View
          style={{
            position: 'absolute',
            left: 10,
            top: 10,
            flexDirection: 'row',
            alignItems: 'center',
            backgroundColor: G.cta,
            borderRadius: 999,
            paddingHorizontal: 10,
            paddingVertical: 6,
          }}
        >
          <View style={{ width: 6, height: 6, borderRadius: 3, backgroundColor: '#FFFFFF', marginRight: 6 }} />
          <ILText role="eyebrow" color="#FFFFFF" style={[af, { fontSize: 10 }]}>
            Next to watch
          </ILText>
        </View>
        <View
          style={{
            position: 'absolute',
            left: '50%',
            top: '50%',
            width: 48,
            height: 48,
            marginLeft: -24,
            marginTop: -24,
            borderRadius: 24,
            backgroundColor: G.cta,
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <MaterialIcons name="play-arrow" size={26} color="#FFFFFF" />
        </View>
        <ILText role="label" color="#FFFFFF" style={{ position: 'absolute', right: 12, bottom: 10, fontSize: 13 }}>
          {item.min}
        </ILText>
      </View>
      <View style={{ flexDirection: 'row', alignItems: 'baseline', marginTop: 12 }}>
        <ILText role="title" color={G.cta} style={{ fontFamily: IL_FONTS.display, fontSize: 18, lineHeight: 22 }}>
          {item.n}
        </ILText>
        <ILText role="eyebrow" color={G.meta} style={[af, { fontSize: 11, marginLeft: 8 }]}>
          Crucial pre-requisite
        </ILText>
      </View>
      <ILText
        role="title"
        color={G.ink}
        style={{ marginTop: 4, fontFamily: IL_FONTS.display, fontSize: 20, lineHeight: 26 }}
      >
        {item.title}
      </ILText>
      <ILText role="bodySm" color={G.body} style={{ marginTop: 4, fontSize: 13, lineHeight: 19 }}>
        {item.sub}
      </ILText>
    </WhiteCard>
  );
}


function Section({ title, sub, action, onAction }) {
  return (
    <View style={{ marginTop: 26, flexDirection: 'row', alignItems: 'flex-end' }}>
      <View style={{ flex: 1 }}>
        <ILText role="title" color={G.ink} style={{ fontFamily: IL_FONTS.display, fontSize: 22, lineHeight: 28 }}>
          {title}
        </ILText>
        {sub ? (
          <ILText role="bodySm" color={G.meta} style={{ marginTop: 4, fontSize: 13 }}>
            {sub}
          </ILText>
        ) : null}
      </View>
      {action ? <LinkRow label={action} onPress={onAction} /> : null}
    </View>
  );
}

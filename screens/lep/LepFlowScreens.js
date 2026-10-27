import React, { useMemo, useState } from 'react';
import { Image, Linking, Pressable, ScrollView, TextInput, View } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { MaterialIcons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { IL_FONTS } from '../../constants/ironLadyBrand';
import ILText from '../../components/il/ILText';
import { G, af } from '../../constants/guestTheme';
import { useNavigation } from '@react-navigation/native';
import { GuestBackBar } from '../guest/GuestBits';
import { LepHeader, Page, ProgressDark, RedCta, Seal, SoftChip, WhisperCard, WhiteCard } from './LepBits';
import LepYourProgressContent from '../../components/lep/LepYourProgressContent';
import { useLepNav } from './useLepNav';
import { PROGRAMS } from '../../constants/programs';
import { isLepEnrolled, lepFirstName } from '../../utils/lepState';
import { useAuth } from '../../context/AuthContext';
import { useProgramRoutes } from '../../context/ProgramNavContext';
import { LIQUID_TAB_PAD } from '../../components/il/LiquidTabBar';
import { lepFlowContextFromBatch } from '../../utils/lepFlowGates';
import { todayIsoIST } from '../../utils/lepDailyPractice';
import { learnerBatchLabel, learnerProgramDates } from '../../utils/programAccess';
import { inferLepDay1FromZohoRaw } from '../../utils/lepDeskBatchDate';
import {
  lepAlumniBatchShort,
  lepTimeGreeting,
  LEP_ALUMNI_SCHEDULE_SUB_SUFFIX,
} from '../../utils/lepAlumniUi';
import { resolveLepDay1Iso, resolveLepEnrolledCohortPhase } from '../../utils/lepEnrolledCohortPhase';
import AlumniMonthlyChallengeCard from '../../components/lep/AlumniMonthlyChallengeCard';
import { useCmsSessionRecordings } from '../../hooks/useCmsLearnerItems';
import { useLearnerCmsBatch } from '../../hooks/useLearnerCmsBatch';
import CourseCurriculum from './CourseCurriculum';
import {
  FACE,
  QUIZ_Q,
  ROAD,
  TODAY_ITEMS,
} from './lepData';
import {
  buildScheduleFullAgenda,
  buildScheduleWeekStrip,
  markDaysWithSessions,
  scheduleAddDaysIso,
  scheduleTodayIso,
  weekMondayIso,
} from '../../utils/lepBatchScheduleView';
import { resolveCmsBatchSessions } from '../../utils/cmsBatchSessions';
import { lepSessionCalendarUrl } from '../../utils/registeredHomeData';
import { recordSessionJoin } from '../../services/activityTracking';
import { openLink } from '../../utils/openLink';

const ALUMNI_COMPLETE_GREEN = '#1F7A4D';

function Shell({ title, sub, right, children, scrollBottomExtra = 0 }) {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation();
  return (
    <Page>
      <StatusBar style="dark" />
      <View style={{ paddingTop: Math.max(insets.top, 8) }}>
        <GuestBackBar title={title} sub={sub} onBack={() => navigation.goBack()} right={right} />
      </View>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{
          paddingHorizontal: 20,
          paddingBottom: LIQUID_TAB_PAD + Math.max(insets.bottom, 8) + scrollBottomExtra,
        }}
      >
        {children}
      </ScrollView>
    </Page>
  );
}

function scheduleItemAllowed(item, enrolled, registeredCodes) {
  if (enrolled) return true;
  if (item.tag === 'DEADLINE') return true;
  if (item.code && registeredCodes.has(item.code)) return true;
  return /orientation|day\s*1|day\s*2/i.test(String(item.title || ''));
}

function ScheduleRow({ item, nav, alumniArchive = false, recordings = {}, navigation }) {
  const openJoin = () => {
    if (item.joinLink) {
      recordSessionJoin(item.code);
      Linking.openURL(item.joinLink).catch(() => {});
    }
    else if (item.taskId) nav.goCourseTask(PROGRAMS.LEP, item.taskId);
    else nav.goCheckin();
  };
  const openCalendar = () => {
    if (!item.dateIso) {
      nav.goSchedule?.();
      return;
    }
    const url = lepSessionCalendarUrl({
      iso: item.dateIso,
      clockLabelText: item.startTime || item.time,
      title: item.title || 'LEP session',
      durationHours: item.durationHours || 1,
    });
    if (url) Linking.openURL(url).catch(() => {});
  };
  const isDeadline = item.tag === 'DEADLINE' || Boolean(item.taskId);
  // Red left rail only when live or starting soon (matches Schedule mockup).
  const isLive = Boolean(item.live) || /\bIN\s+\d/i.test(String(item.tag || ''));
  const showActions = !isDeadline && !alumniArchive;
  const alumniSession = alumniArchive && !isDeadline;
  const rec = alumniSession && item.code ? recordings[item.code] : null;

  const openRecording = () => {
    if (!rec?.url) return;
    openLink(rec.url, { navigation, title: item.title || rec.title || 'Session recording' });
  };

  return (
    <View style={{ flexDirection: 'row', marginTop: 12, alignItems: 'flex-start' }}>
      <ILText
        role="label"
        color={G.ink}
        style={{ width: 64, fontSize: 12, marginTop: 16, fontWeight: '600' }}
      >
        {item.time}
      </ILText>
      <View
        style={{
          flex: 1,
          backgroundColor: G.white,
          borderRadius: 18,
          padding: 16,
          borderLeftWidth: isLive && !alumniSession ? 4 : 0,
          borderLeftColor: G.cta,
          shadowColor: '#113744',
          shadowOpacity: 0.06,
          shadowRadius: 10,
          shadowOffset: { width: 0, height: 4 },
          elevation: 2,
          flexDirection: alumniSession ? 'row' : 'column',
          alignItems: alumniSession ? 'center' : 'stretch',
        }}
      >
        <View style={{ flex: 1 }}>
          <ILText role="eyebrow" color={G.cta} style={[af, { fontSize: 10, letterSpacing: 0.8 }]}>
            {alumniSession ? 'YOUR BATCH' : item.tag}
          </ILText>
          <ILText role="label" color={G.ink} style={{ marginTop: 8, fontSize: 16, fontWeight: '700' }}>
            {item.title}
          </ILText>
          {item.meta ? (
            <ILText role="bodySm" color={G.meta} style={{ marginTop: 4, fontSize: 13 }}>
              {item.meta}
            </ILText>
          ) : null}
        </View>
        {alumniSession ? (
          <View style={{ alignItems: 'flex-end', marginLeft: 10, alignSelf: 'center' }}>
            {rec ? (
              <Pressable
                onPress={openRecording}
                style={{
                  backgroundColor: G.ink,
                  borderRadius: 999,
                  paddingHorizontal: 12,
                  paddingVertical: 9,
                }}
              >
                <ILText role="label" color="#FFFFFF" style={[af, { fontSize: 11 }]}>
                  Watch recording
                </ILText>
              </Pressable>
            ) : null}
            <ILText
              role="label"
              color={ALUMNI_COMPLETE_GREEN}
              style={{ marginTop: rec ? 6 : 0, fontSize: 11, fontWeight: '600' }}
            >
              Completed
            </ILText>
          </View>
        ) : null}
        {showActions ? (
          <View style={{ flexDirection: 'row', marginTop: 14, flexWrap: 'wrap' }}>
            <Pressable
              onPress={openJoin}
              style={{
                backgroundColor: G.cta,
                borderRadius: 999,
                paddingHorizontal: 16,
                paddingVertical: 10,
                marginRight: 8,
                marginBottom: 4,
                flexDirection: 'row',
                alignItems: 'center',
              }}
            >
              <MaterialIcons name="videocam" size={16} color="#FFFFFF" style={{ marginRight: 6 }} />
              <ILText role="label" color="#FFFFFF" style={{ fontSize: 13 }}>
                Join
              </ILText>
            </Pressable>
            <Pressable
              onPress={openCalendar}
              style={{
                borderRadius: 999,
                paddingHorizontal: 16,
                paddingVertical: 10,
                marginBottom: 4,
                borderWidth: 1,
                borderColor: G.dash,
                backgroundColor: G.white,
              }}
            >
              <ILText role="label" color={G.ink} style={{ fontSize: 13 }}>
                Add to calendar
              </ILText>
            </Pressable>
          </View>
        ) : item.taskId ? (
          <Pressable onPress={openJoin} style={{ marginTop: 12, alignSelf: 'flex-start' }}>
            <ILText role="label" color={G.cta}>
              Open task →
            </ILText>
          </Pressable>
        ) : null}
      </View>
    </View>
  );
}

export function LepScheduleScreen() {
  const nav = useLepNav();
  const navigation = useNavigation();
  const { profile } = useAuth();
  const { batch: cmsBatch } = useLearnerCmsBatch('lep');
  const recordings = useCmsSessionRecordings('lep', cmsBatch);
  const todayIso = scheduleTodayIso();
  const [selectedIso, setSelectedIso] = useState(todayIso);
  const [weekStartIso, setWeekStartIso] = useState(() => weekMondayIso(todayIso));

  const batchLabel = learnerBatchLabel(profile, 'lep');
  const lepAccess = profile?.programAccess?.lep || {};
  const day1Iso =
    (cmsBatch?.day1Date && String(cmsBatch.day1Date).slice(0, 10)) ||
    learnerProgramDates(profile, 'lep').start ||
    String(lepAccess.day1Date || '').slice(0, 10) ||
    inferLepDay1FromZohoRaw(
      lepAccess.zohoRawBatch || lepAccess.zohoBatchKey || batchLabel || ''
    ) ||
    '';

  const batchAnchor = useMemo(() => {
    if (!cmsBatch && !day1Iso) return null;
    return {
      ...(cmsBatch || {}),
      day1Date: cmsBatch?.day1Date || day1Iso,
      sessions: cmsBatch?.sessions || [],
      name: cmsBatch?.name || batchLabel || 'LEP',
    };
  }, [cmsBatch, day1Iso, batchLabel]);

  const hasBatch = Boolean(batchAnchor?.day1Date || batchAnchor?.orientationDate);
  const enrolled = isLepEnrolled(profile);
  const alumniArchive =
    enrolled && resolveLepEnrolledCohortPhase(profile, day1Iso) === 'alumni';
  const registeredCodes = useMemo(() => new Set(['S0', 'S1', 'S2']), []);

  const weekDays = useMemo(() => {
    const strip = buildScheduleWeekStrip(new Date(), weekStartIso, 0).map((d) => ({
      ...d,
      on: d.iso === selectedIso,
    }));
    if (!hasBatch) return strip.map((d) => ({ ...d, hasSession: false }));
    const marked = markDaysWithSessions(strip, batchAnchor, day1Iso);
    if (enrolled) return marked;
    const allowed = new Set(
      resolveCmsBatchSessions(batchAnchor, { day1Iso })
        .filter((s) => registeredCodes.has(s.code))
        .map((s) => s.date)
    );
    return marked.map((d) => ({ ...d, hasSession: allowed.has(d.iso) }));
  }, [batchAnchor, day1Iso, selectedIso, weekStartIso, hasBatch, enrolled, registeredCodes]);

  // Full program list from selected day forward (not limited to one week).
  const visibleSections = useMemo(() => {
    if (!hasBatch) return [];
    return buildScheduleFullAgenda(batchAnchor, new Date(), day1Iso, selectedIso)
      .map((section) => ({
        ...section,
        items: section.items.filter((item) => scheduleItemAllowed(item, enrolled, registeredCodes)),
      }))
      .filter((section) => section.items.length > 0);
  }, [batchAnchor, day1Iso, selectedIso, hasBatch, enrolled, registeredCodes]);

  const shiftWeek = (delta) => {
    const nextStart = scheduleAddDaysIso(weekStartIso, delta * 7);
    setWeekStartIso(nextStart);
    const idx = weekDays.findIndex((d) => d.iso === selectedIso);
    setSelectedIso(scheduleAddDaysIso(nextStart, idx < 0 ? 0 : idx));
  };

  const sub = alumniArchive
    ? cmsBatch?.name
      ? `${cmsBatch.name}${LEP_ALUMNI_SCHEDULE_SUB_SUFFIX}`
      : batchLabel
        ? `${batchLabel}${LEP_ALUMNI_SCHEDULE_SUB_SUFFIX}`
        : `LEP batch${LEP_ALUMNI_SCHEDULE_SUB_SUFFIX}`
    : cmsBatch?.name
      ? `${cmsBatch.name} · full schedule`
      : batchLabel
        ? `${batchLabel} · full schedule`
        : 'All programs · full schedule';

  return (
    <Shell title={alumniArchive ? 'Batch calendar' : 'Schedule'} sub={sub}>
      <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 8 }}>
        <Pressable
          onPress={() => shiftWeek(-1)}
          accessibilityLabel="Previous week"
          style={{ padding: 8, marginRight: 2 }}
        >
          <MaterialIcons name="chevron-left" size={22} color={G.ink} />
        </Pressable>
        <View style={{ flex: 1, flexDirection: 'row', justifyContent: 'space-between' }}>
          {weekDays.map((d) => {
            const on = d.iso === selectedIso;
            return (
              <Pressable
                key={d.iso}
                onPress={() => d.iso && setSelectedIso(d.iso)}
                style={{
                  width: 40,
                  alignItems: 'center',
                  paddingVertical: 10,
                  borderRadius: 16,
                  backgroundColor: on ? G.dark : 'transparent',
                }}
              >
                <ILText role="eyebrow" color={on ? 'rgba(255,255,255,0.55)' : G.meta} style={[af, { fontSize: 9 }]}>
                  {d.w}
                </ILText>
                <ILText
                  role="title"
                  color={on ? '#FFFFFF' : G.ink}
                  style={{ fontFamily: IL_FONTS.display, fontSize: 17, marginTop: 4 }}
                >
                  {d.d}
                </ILText>
                {d.hasSession ? (
                  <View
                    style={{
                      width: 4,
                      height: 4,
                      borderRadius: 2,
                      backgroundColor: on ? '#FFFFFF' : G.cta,
                      marginTop: 4,
                    }}
                  />
                ) : null}
              </Pressable>
            );
          })}
        </View>
        <Pressable
          onPress={() => shiftWeek(1)}
          accessibilityLabel="Next week"
          style={{ padding: 8, marginLeft: 2 }}
        >
          <MaterialIcons name="chevron-right" size={22} color={G.ink} />
        </Pressable>
      </View>

      {visibleSections.length === 0 ? (
        <ILText role="bodySm" color={G.meta} style={{ marginTop: 22, fontSize: 14, lineHeight: 20 }}>
          {hasBatch
            ? alumniArchive
              ? 'Browse earlier weeks with the arrows to see when your cohort met. Session recordings are under My Program → Sessions.'
              : 'Nothing left on your batch calendar from this day. Use the arrows to jump weeks, or open My Program → Sessions.'
            : 'Your batch calendar appears once Day 1 is set (CMS or Zoho).'}
        </ILText>
      ) : (
        visibleSections.map((section) => (
          <View key={section.iso} style={{ marginTop: 22 }}>
            <ILText role="eyebrow" color={G.cta} style={[af, { fontSize: 11, letterSpacing: 1 }]}>
              {section.heading}
            </ILText>
            {section.items.map((item) => (
              <ScheduleRow
                key={`${section.iso}-${item.id || item.title}`}
                item={item}
                nav={nav}
                alumniArchive={alumniArchive}
                recordings={recordings}
                navigation={navigation}
              />
            ))}
          </View>
        ))
      )}
    </Shell>
  );
}

export function LepGuideChatScreen() {
  const nav = useLepNav();
  const insets = useSafeAreaInsets();
  const navigation = useNavigation();
  return (
    <View style={{ flex: 1, backgroundColor: 'rgba(17,55,68,0.45)' }}>
      <Pressable style={{ flex: 1 }} onPress={() => navigation.goBack()} />
      <View
        style={{
          backgroundColor: G.page,
          borderTopLeftRadius: 28,
          borderTopRightRadius: 28,
          padding: 20,
          paddingBottom: Math.max(insets.bottom, 16) + 12,
        }}
      >
        <ILText role="title" color={G.ink} style={{ fontFamily: IL_FONTS.display, fontSize: 22 }}>
          IL Guide · quick chat
        </ILText>
        <View style={{ marginTop: 14 }}>
          <WhisperCard quote="You have 10 minutes. Open the ERRC Grid — four boxes, one honest answer each. I will not submit it for you." />
        </View>
        <View style={{ marginTop: 16 }}>
          <RedCta label="Open ERRC Grid" onPress={nav.goAssignment} />
        </View>
        <Pressable onPress={() => navigation.goBack()} style={{ marginTop: 12, alignItems: 'center', paddingVertical: 10 }}>
          <ILText role="label" color={G.meta}>
            Remind me at 8 AM
          </ILText>
        </Pressable>
      </View>
    </View>
  );
}

export function LepMilestoneScreen() {
  const nav = useLepNav();
  const insets = useSafeAreaInsets();
  return (
    <View style={{ flex: 1, backgroundColor: G.dark }}>
      <StatusBar style="light" />
      <View
        style={{
          flex: 1,
          paddingTop: Math.max(insets.top, 24),
          paddingBottom: Math.max(insets.bottom, 20) + 20,
          paddingHorizontal: 28,
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <SoftChip onDark>Phase 03 complete</SoftChip>
        <View style={{ marginTop: 20 }}>
          <Seal />
        </View>
        <ILText
          role="display"
          color="#FFFFFF"
          style={{ marginTop: 24, fontFamily: IL_FONTS.display, fontSize: 40, lineHeight: 46, textAlign: 'center' }}
        >
          Day 1 — done.
        </ILText>
        <ILText role="body" color="rgba(248,214,212,0.88)" style={{ marginTop: 14, fontSize: 16, lineHeight: 24, textAlign: 'center' }}>
          Personal Transformation, all six tasks. You’re 3 phases into 11 — Day 2 unlocks tonight at 6:30.
        </ILText>
        <WhiteCard style={{ marginTop: 22, borderRadius: 18, padding: 14, flexDirection: 'row', alignItems: 'center' }}>
          <Image source={FACE} style={{ width: 36, height: 36, borderRadius: 18 }} />
          <ILText role="bodySm" color={G.body} style={{ flex: 1, marginLeft: 10, fontSize: 13, lineHeight: 18 }}>
            “Crucibles of Leadership was the hardest one. You did it on a Monday night.” — IL Guide
          </ILText>
        </WhiteCard>
        <View style={{ marginTop: 24, alignSelf: 'stretch' }}>
          <RedCta label="Continue to Day 2 →" onPress={nav.goPhase} />
        </View>
      </View>
    </View>
  );
}

export function LepPhaseDetailScreen() {
  const { profile } = useAuth();
  const enrolled = isLepEnrolled(profile);
  const { batch: cmsBatch } = useLearnerCmsBatch('lep');
  const lepFlow = { ...lepFlowContextFromBatch({ cmsBatch }), todayIso: todayIsoIST() };
  const batchLabel = cmsBatch?.name ? String(cmsBatch.name) : 'Your batch';
  return (
    <Shell title="Leadership Essentials" sub={`LEP · ${batchLabel} · Course`}>
      <CourseCurriculum programId={PROGRAMS.LEP} enrolled={enrolled} lepFlow={lepFlow} />
    </Shell>
  );
}

export function LepAssignmentScreen() {
  const [e, setE] = useState('');
  const [r, setR] = useState('');
  const [ra, setRa] = useState('');
  const [c, setC] = useState('');
  const navigation = useNavigation();
  return (
    <Shell title="Day 2 Assignment" sub="LEP · Assignment" right={<SoftChip onDark>In progress</SoftChip>}>
      <ILText role="eyebrow" color={G.cta} style={[af, { fontSize: 10 }]}>
        Self-paced · ~15 minutes
      </ILText>
      <ILText role="display" color={G.ink} style={{ marginTop: 8, fontFamily: IL_FONTS.display, fontSize: 32 }}>
        ERRC Grid
      </ILText>
      <ILText role="body" color={G.body} style={{ marginTop: 10, fontSize: 15, lineHeight: 22 }}>
        Eliminate, Reduce, Raise, Create — map your leadership habit before Session 3. You’ll compare grids with your cohort live, so bring a real answer to each box, not a perfect one.
      </ILText>
      <View style={{ marginTop: 14, backgroundColor: G.dark, borderRadius: 18, padding: 14 }}>
        <ILText role="body" color="#FFFFFF" style={{ fontSize: 14, lineHeight: 20 }}>
          Due before this week’s live Q&A — your cohort will compare grids on the call.
        </ILText>
      </View>
      <ILText role="title" color={G.ink} style={{ marginTop: 22, fontFamily: IL_FONTS.display, fontSize: 20 }}>
        Your grid
      </ILText>
      <View style={{ flexDirection: 'row', marginTop: 10 }}>
        <GridBox label="Eliminate" hint="Habits that no longer serve how you lead" value={e} onChange={setE} />
        <View style={{ width: 10 }} />
        <GridBox label="Reduce" hint="Habits to scale back, not drop entirely" value={r} onChange={setR} />
      </View>
      <View style={{ flexDirection: 'row', marginTop: 10 }}>
        <GridBox label="Raise" hint="What you will do more of, on purpose" value={ra} onChange={setRa} />
        <View style={{ width: 10 }} />
        <GridBox label="Create" hint="The new habit the room will notice" value={c} onChange={setC} />
      </View>
      <View style={{ marginTop: 20 }}>
        <RedCta label="Submit" onPress={() => navigation.goBack()} />
      </View>
    </Shell>
  );
}

function GridBox({ label, hint, value, onChange }) {
  return (
    <WhiteCard style={{ flex: 1, borderRadius: 16, padding: 12 }}>
      <ILText role="eyebrow" color={G.cta} style={[af, { fontSize: 10 }]}>
        {label}
      </ILText>
      <ILText role="bodySm" color={G.meta} style={{ marginTop: 4, fontSize: 11, lineHeight: 15 }}>
        {hint}
      </ILText>
      <TextInput
        value={value}
        onChangeText={onChange}
        placeholder="Tap to add"
        placeholderTextColor="#B8B4A8"
        multiline
        style={{
          marginTop: 10,
          minHeight: 64,
          borderWidth: 1,
          borderStyle: 'dashed',
          borderColor: G.dash,
          borderRadius: 12,
          padding: 8,
          fontFamily: IL_FONTS.regular,
          fontSize: 13,
          color: G.ink,
        }}
      />
    </WhiteCard>
  );
}

export function LepQuizScreen() {
  const [pick, setPick] = useState(1);
  return (
    <Shell title="27 Principles Quiz" sub="LEP · 10 · Final Evaluation">
      <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
        <ILText role="eyebrow" color={G.cta} style={[af, { fontSize: 10 }]}>
          Question {QUIZ_Q.n} of {QUIZ_Q.total}
        </ILText>
        <ILText role="bodySm" color={G.meta} style={{ fontSize: 12 }}>
          No timer
        </ILText>
      </View>
      <View style={{ height: 4, borderRadius: 2, backgroundColor: G.line, marginTop: 12, overflow: 'hidden' }}>
        <View style={{ width: '40%', height: 4, backgroundColor: G.cta }} />
      </View>
      <ILText
        role="title"
        color={G.ink}
        style={{ marginTop: 22, fontFamily: IL_FONTS.display, fontSize: 24, lineHeight: 30 }}
      >
        {QUIZ_Q.q}
      </ILText>
      {QUIZ_Q.options.map((opt, i) => {
        const on = pick === i;
        return (
          <Pressable
            key={opt}
            onPress={() => setPick(i)}
            style={{
              marginTop: 10,
              borderRadius: 18,
              padding: 16,
              flexDirection: 'row',
              alignItems: 'center',
              backgroundColor: on ? G.white : G.white,
              borderWidth: on ? 2 : 1,
              borderColor: on ? G.dark : G.line,
            }}
          >
            <View
              style={{
                width: 28,
                height: 28,
                borderRadius: 14,
                backgroundColor: on ? G.dark : G.mutedFill,
                alignItems: 'center',
                justifyContent: 'center',
                marginRight: 12,
              }}
            >
              <ILText role="label" color={on ? '#FFFFFF' : G.ink}>
                {String.fromCharCode(65 + i)}
              </ILText>
            </View>
            <ILText role="label" color={G.ink} style={{ flex: 1 }}>
              {opt}
            </ILText>
            {on ? <MaterialIcons name="check-circle" size={20} color={G.ink} /> : null}
          </Pressable>
        );
      })}
      <View style={{ marginTop: 24 }}>
        <RedCta label="Check answer" onPress={() => {}} />
      </View>
    </Shell>
  );
}

export function LepTodayChecklistScreen() {
  const { profile } = useAuth();
  const name = lepFirstName(profile);
  const nav = useLepNav();
  return (
    <Shell title={`Today, ${name}`} sub="Day 16 of your first month · Week 2">
      <ProgressDark kicker="3 of 6 done" title="~22 min left" percent={50} right=" " />
      <View style={{ marginTop: 14 }}>
        <WhisperCard
          quote={`Three left, ${name}. The Week 2 Engagement Form is four minutes — tonight’s session goes further if it is done.`}
          onPress={nav.goAssignment}
        />
      </View>
      <WhiteCard style={{ marginTop: 14, borderRadius: 22, paddingHorizontal: 16 }}>
        {TODAY_ITEMS.map((item, i) => (
          <View
            key={item.title}
            style={{
              flexDirection: 'row',
              paddingVertical: 14,
              borderBottomWidth: i === TODAY_ITEMS.length - 1 ? 0 : 1,
              borderBottomColor: G.line,
            }}
          >
            <MaterialIcons
              name={item.done ? 'check-circle' : 'radio-button-unchecked'}
              size={22}
              color={item.done ? G.ink : '#C8C4B6'}
            />
            <View style={{ marginLeft: 12 }}>
              <ILText role="label" color={G.ink}>
                {item.title}
              </ILText>
              <ILText role="bodySm" color={G.meta} style={{ marginTop: 2, fontSize: 12 }}>
                {item.meta}
              </ILText>
            </View>
          </View>
        ))}
      </WhiteCard>
      <View style={{ marginTop: 18 }}>
        <RedCta label="Join tonight’s session" onPress={nav.goCheckin} />
      </View>
    </Shell>
  );
}

export function LepSessionCheckinScreen() {
  const [att, setAtt] = useState('attended');
  const [note, setNote] = useState('');
  const navigation = useNavigation();
  return (
    <Shell title="Session check-in" sub="30 seconds · no manual tracking">
      <ILText role="body" color={G.body} style={{ fontSize: 15, lineHeight: 22 }}>
        How did this session go?
      </ILText>
      {['attended', 'missed', 'issue'].map((k) => (
        <Pressable
          key={k}
          onPress={() => setAtt(k)}
          style={{
            marginTop: 10,
            borderRadius: 16,
            padding: 16,
            borderWidth: att === k ? 2 : 1,
            borderColor: att === k ? G.dark : G.line,
            backgroundColor: G.white,
          }}
        >
          <ILText role="label" color={G.ink}>
            {k === 'attended' ? 'Attended' : k === 'missed' ? 'Missed' : 'Issue'}
          </ILText>
        </Pressable>
      ))}
      <ILText role="label" color={G.ink} style={{ marginTop: 22 }}>
        One thing I’ll do differently
      </ILText>
      <TextInput
        value={note}
        onChangeText={setNote}
        placeholder="Write one line"
        placeholderTextColor="#B8B4A8"
        multiline
        style={{
          marginTop: 10,
          minHeight: 90,
          backgroundColor: G.white,
          borderRadius: 16,
          borderWidth: 1,
          borderColor: G.line,
          padding: 14,
          fontFamily: IL_FONTS.regular,
          fontSize: 15,
          color: G.ink,
        }}
      />
      <View style={{ marginTop: 20 }}>
        <RedCta label="Save check-in" onPress={() => navigation.goBack()} />
      </View>
    </Shell>
  );
}

export function LepFirstMonthScreen() {
  return (
    <Shell title="Road to graduation" sub="LEP · Batch 42">
      <View style={{ backgroundColor: G.dark, borderRadius: 24, padding: 20 }}>
        <ILText role="eyebrow" color={G.pink} style={[af, { fontSize: 10 }]}>
          Graduation in 16 days · Week 4
        </ILText>
        <ILText role="display" color="#FFFFFF" style={{ marginTop: 10, fontFamily: IL_FONTS.display, fontSize: 28 }}>
          You’re on track.
        </ILText>
        <ILText role="body" color="rgba(255,255,255,0.7)" style={{ marginTop: 8 }}>
          Attendance 5 of 6
        </ILText>
      </View>
      <View style={{ marginTop: 20 }}>
        {ROAD.map((r, i) => (
          <View key={r.title} style={{ flexDirection: 'row' }}>
            <View style={{ width: 28, alignItems: 'center' }}>
              <View
                style={{
                  width: 16,
                  height: 16,
                  borderRadius: 8,
                  backgroundColor: r.done ? G.dark : r.now ? G.cta : G.line,
                  borderWidth: r.now ? 4 : 0,
                  borderColor: G.pink,
                }}
              />
              {i < ROAD.length - 1 ? <View style={{ width: 2, flex: 1, backgroundColor: G.line }} /> : null}
            </View>
            <View style={{ flex: 1, paddingBottom: 18, marginLeft: 8 }}>
              <ILText role="label" color={G.ink}>
                {r.title}
              </ILText>
              <ILText role="bodySm" color={G.meta} style={{ marginTop: 4, fontSize: 12 }}>
                {r.sub}
              </ILText>
            </View>
          </View>
        ))}
      </View>
    </Shell>
  );
}

export function LepEventTicketScreen() {
  return (
    <Shell title="Event ticket" sub="Bengaluru chapter meetup">
      <WhiteCard style={{ borderRadius: 24, padding: 20, alignItems: 'center' }}>
        <SoftChip>QR ticket · works offline</SoftChip>
        <View
          style={{
            width: 180,
            height: 180,
            marginTop: 20,
            backgroundColor: G.mutedFill,
            borderRadius: 16,
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <MaterialIcons name="qr-code-2" size={120} color={G.ink} />
        </View>
        <ILText role="title" color={G.ink} style={{ marginTop: 18, fontFamily: IL_FONTS.display, fontSize: 22 }}>
          Ananya Rao
        </ILText>
        <ILText role="bodySm" color={G.meta} style={{ marginTop: 6 }}>
          Sat 27 Sep · 10:00 AM · Bengaluru
        </ILText>
      </WhiteCard>
      <View style={{ marginTop: 18 }}>
        <RedCta label="Add to calendar" icon="event" />
      </View>
    </Shell>
  );
}

export function LepProgressScreen() {
  const nav = useLepNav();
  return (
    <Shell title="Your progress" sub="Across all programs" scrollBottomExtra={24}>
      <LepYourProgressContent
        onOpenRitualsWeek={nav.goRitualsDashboard}
        onOpenWeeklyBrief={nav.goWeeklyBrief}
        onOpenPhase={(phaseId) => nav.goCoursePhase('lep', phaseId)}
      />
    </Shell>
  );
}

function Row({ k, v }) {
  return (
    <View style={{ flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 8 }}>
      <ILText role="label" color={G.ink}>
        {k}
      </ILText>
      <ILText role="label" color={G.cta}>
        {v}
      </ILText>
    </View>
  );
}

export function LepCertificateScreen() {
  const { profile } = useAuth();
  const name = lepFullNameSafe(profile);
  return (
    <Shell title="Certificate" sub="LEP · 11 Certificate">
      <WhiteCard style={{ borderRadius: 24, padding: 24, alignItems: 'center' }}>
        <View style={{ width: 36, height: 36, borderRadius: 8, backgroundColor: G.cta }} />
        <ILText role="eyebrow" color={G.cta} style={[af, { marginTop: 16, fontSize: 10 }]}>
          Certificate of completion
        </ILText>
        <ILText role="display" color={G.ink} style={{ marginTop: 10, fontFamily: IL_FONTS.display, fontSize: 28, textAlign: 'center' }}>
          {name}
        </ILText>
        <ILText role="bodySm" color={G.meta} style={{ marginTop: 8 }}>
          has completed the
        </ILText>
        <ILText role="title" color={G.ink} style={{ marginTop: 6, fontFamily: IL_FONTS.display, fontSize: 22, textAlign: 'center' }}>
          Leadership Essentials program
        </ILText>
        <ILText role="bodySm" color={G.meta} style={{ marginTop: 14, fontSize: 12 }}>
          Batch 42 · Issued on completion · ID IL-LEP-042-01733
        </ILText>
      </WhiteCard>
      <ILText role="bodySm" color={G.meta} style={{ marginTop: 16, fontSize: 13 }}>
        Preview — unlocks after Attendance and the Final Evaluation.
      </ILText>
      <View style={{ marginTop: 18 }}>
        <RedCta label="Add to LinkedIn profile +" />
      </View>
    </Shell>
  );
}

function lepFullNameSafe(profile) {
  return profile?.displayName || 'Ananya Rao';
}

export function LepNudgeSettingsScreen() {
  return (
    <Shell title="Nudges & reminders" sub="You control the volume">
      {['Push', 'WhatsApp', 'Email'].map((c) => (
        <WhiteCard key={c} style={{ marginTop: 10, borderRadius: 16, padding: 16, flexDirection: 'row', justifyContent: 'space-between' }}>
          <ILText role="label" color={G.ink}>
            {c}
          </ILText>
          <ILText role="label" color={G.cta}>
            On
          </ILText>
        </WhiteCard>
      ))}
      <ILText role="bodySm" color={G.meta} style={{ marginTop: 16, fontSize: 13, lineHeight: 18 }}>
        Quiet hours 9 PM – 7 AM · max 2 nudges a day · IL Guide’s tone: Gentle
      </ILText>
      <View style={{ marginTop: 20 }}>
        <RedCta label="Save" />
      </View>
    </Shell>
  );
}

export function LepGraduationScreen({ onCelebrated }) {
  const { profile } = useAuth();
  const name = lepFirstName(profile);
  const nav = useLepNav();
  const insets = useSafeAreaInsets();
  const batchShort = lepAlumniBatchShort(profile);

  const joinAlumni = () => {
    if (typeof onCelebrated === 'function') onCelebrated();
    else nav.goAlumni();
  };

  const viewCert = () => {
    nav.goCourseTask(PROGRAMS.LEP, 'lep-certification');
  };

  const addLinkedIn = () => {
    Linking.openURL('https://www.linkedin.com/').catch(() => {});
  };

  return (
    <View style={{ flex: 1, backgroundColor: G.dark }}>
      <StatusBar style="light" translucent backgroundColor="transparent" />
      <LepHeader
        floating
        scrim={false}
        photoUrl={profile?.photoURL}
        onNotifications={nav.goNotifications}
        onProfile={nav.goProfile}
      />
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{
          flexGrow: 1,
          paddingTop: Math.max(insets.top, 8) + 72,
          paddingHorizontal: 24,
          paddingBottom: LIQUID_TAB_PAD + Math.max(insets.bottom, 20),
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <SoftChip onDark>Leadership Essentials program</SoftChip>
        <View style={{ marginTop: 24 }}>
          <Seal icon="school" />
        </View>
        <ILText
          role="display"
          color="#FFFFFF"
          style={{
            marginTop: 22,
            fontFamily: IL_FONTS.display,
            fontSize: 34,
            lineHeight: 40,
            textAlign: 'center',
          }}
        >
          You’ve graduated, {name}.
        </ILText>
        <ILText
          role="body"
          color="rgba(248,214,212,0.88)"
          style={{ marginTop: 14, fontSize: 16, lineHeight: 24, textAlign: 'center' }}
        >
          All 11 phases, 6 of 6 sessions, both quizzes. Your LEP Certification is ready.
        </ILText>

        <WhiteCard
          style={{
            marginTop: 28,
            alignSelf: 'stretch',
            borderRadius: 20,
            padding: 16,
            flexDirection: 'row',
            alignItems: 'center',
            backgroundColor: 'rgba(255,255,255,0.08)',
            borderColor: 'rgba(255,255,255,0.12)',
          }}
        >
          <View
            style={{
              width: 44,
              height: 44,
              borderRadius: 14,
              backgroundColor: 'rgba(237,29,36,0.2)',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <MaterialIcons name="emoji-events" size={24} color={G.pink} />
          </View>
          <View style={{ flex: 1, marginLeft: 12 }}>
            <ILText role="label" color="#FFFFFF">LEP Certification</ILText>
            <ILText role="bodySm" color="rgba(255,255,255,0.65)" style={{ marginTop: 2, fontSize: 13 }}>
              {batchShort}
            </ILText>
          </View>
          <Pressable onPress={viewCert} accessibilityRole="button">
            <ILText role="label" color={G.pink}>View</ILText>
          </Pressable>
        </WhiteCard>

        <View style={{ marginTop: 24, alignSelf: 'stretch' }}>
          <RedCta label="Join the Iron Lady Alumni →" onPress={joinAlumni} />
        </View>
        <Pressable
          onPress={addLinkedIn}
          style={{
            marginTop: 12,
            alignSelf: 'stretch',
            borderRadius: 999,
            paddingVertical: 14,
            alignItems: 'center',
            borderWidth: 1,
            borderColor: 'rgba(255,255,255,0.35)',
          }}
        >
          <ILText role="label" color="#FFFFFF">Add to LinkedIn +</ILText>
        </Pressable>
      </ScrollView>
    </View>
  );
}

function AlumniMediaRow({ icon, title, sub, onPress }) {
  return (
    <WhiteCard
      onPress={onPress}
      style={{
        marginTop: 10,
        borderRadius: 18,
        padding: 14,
        flexDirection: 'row',
        alignItems: 'center',
      }}
    >
      <View
        style={{
          width: 44,
          height: 44,
          borderRadius: 14,
          backgroundColor: G.pink,
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <MaterialIcons name={icon} size={22} color={G.cta} />
      </View>
      <View style={{ flex: 1, marginLeft: 12 }}>
        <ILText role="label" color={G.ink}>{title}</ILText>
        <ILText role="bodySm" color={G.meta} style={{ marginTop: 2, fontSize: 12 }}>{sub}</ILText>
      </View>
      <View
        style={{
          width: 36,
          height: 36,
          borderRadius: 18,
          backgroundColor: G.cta,
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <MaterialIcons name="play-arrow" size={22} color="#FFFFFF" />
      </View>
    </WhiteCard>
  );
}

export function LepAlumniHomeScreen() {
  const { profile } = useAuth();
  const name = lepFirstName(profile);
  const nav = useLepNav();
  const routes = useProgramRoutes();
  const insets = useSafeAreaInsets();
  const batchShort = lepAlumniBatchShort(profile);
  const greeting = lepTimeGreeting();
  const { batch: cmsBatch } = useLearnerCmsBatch('lep');
  const recordings = useCmsSessionRecordings('lep', cmsBatch);
  const gradRec = recordings.S8;
  const gradSub = gradRec?.url ? 'Graduation day film · your batch' : 'Coming soon · we’ll notify you on Engage';

  return (
    <Page>
      <StatusBar style="light" translucent backgroundColor="transparent" />
      <LepHeader
        floating
        scrim={false}
        photoUrl={profile?.photoURL}
        onNotifications={nav.goNotifications}
        onProfile={nav.goProfile}
      />
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{
          paddingHorizontal: 20,
          paddingTop: Math.max(insets.top, 8) + 72,
          paddingBottom: LIQUID_TAB_PAD + Math.max(insets.bottom, 16),
        }}
      >
        <View style={{ backgroundColor: G.dark, borderRadius: 28, padding: 20 }}>
          <SoftChip onDark>LEP Graduate · {batchShort}</SoftChip>
          <ILText
            role="display"
            color="#FFFFFF"
            style={{ marginTop: 16, fontFamily: IL_FONTS.display, fontSize: 32, lineHeight: 38 }}
          >
            {greeting}, {name}.
          </ILText>
          <View style={{ marginTop: 16, backgroundColor: 'rgba(255,255,255,0.08)', borderRadius: 20, padding: 16 }}>
            <AlumniMonthlyChallengeCard
              onDark
              onOpenTask={(taskId) => nav.goCourseTask('lep', taskId, { alumniPractice: true })}
            />
          </View>
        </View>

        <ILText
          role="title"
          color={G.ink}
          style={{ marginTop: 24, fontFamily: IL_FONTS.display, fontSize: 22 }}
        >
          Celebrations
        </ILText>
        <AlumniMediaRow
          icon="movie"
          title={`${batchShort} graduation film`}
          sub={gradSub}
          onPress={nav.goAlumniGraduationFilm}
        />
        <AlumniMediaRow
          icon="mic"
          title="Iron Lady Speaks"
          sub="Podcast · on Engage"
          onPress={nav.goEngage}
        />

        <Pressable onPress={nav.goAlumniCommunity}>
          <WhiteCard style={{ marginTop: 10, borderRadius: 18, padding: 16, flexDirection: 'row', alignItems: 'center' }}>
            <View
              style={{
                width: 44,
                height: 44,
                borderRadius: 14,
                backgroundColor: G.pink,
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <MaterialIcons name="groups" size={22} color={G.cta} />
            </View>
            <View style={{ flex: 1, marginLeft: 12 }}>
              <ILText role="label" color={G.ink}>Alumni circle</ILText>
              <ILText role="bodySm" color={G.meta} style={{ marginTop: 2, fontSize: 12 }}>
                Community space · opening soon
              </ILText>
            </View>
            <ILText role="label" color={G.cta}>Explore</ILText>
          </WhiteCard>
        </Pressable>

        <View style={{ marginTop: 20, backgroundColor: G.dark, borderRadius: 22, padding: 18 }}>
          <ILText role="eyebrow" color={G.pink} style={[af, { fontSize: 10 }]}>
            Your next step
          </ILText>
          <ILText
            role="title"
            color="#FFFFFF"
            style={{ marginTop: 8, fontFamily: IL_FONTS.display, fontSize: 22, lineHeight: 28 }}
          >
            100 Board Members
          </ILText>
          <ILText role="body" color="rgba(255,255,255,0.72)" style={{ marginTop: 8, fontSize: 14, lineHeight: 20 }}>
            Six months online, built on what you did in LEP.
          </ILText>
          <Pressable
            onPress={routes.openBm100HomeOrDetail}
            style={{
              marginTop: 16,
              borderRadius: 999,
              paddingVertical: 14,
              alignItems: 'center',
              borderWidth: 1,
              borderColor: 'rgba(255,255,255,0.35)',
            }}
          >
            <ILText role="label" color="#FFFFFF">See the 100BM journey →</ILText>
          </Pressable>
        </View>

        <Pressable onPress={nav.goGraduation} style={{ marginTop: 16, alignItems: 'center', paddingVertical: 8 }}>
          <ILText role="bodySm" color={G.meta} style={{ fontSize: 13 }}>
            View graduation & certificate again
          </ILText>
        </Pressable>
      </ScrollView>
    </Page>
  );
}

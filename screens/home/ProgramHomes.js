import React from 'react';
import { View } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import Pressable from '../../components/il/Press';
import { IL_BRAND } from '../../constants/ironLadyBrand';
import ILText from '../../components/il/ILText';
import { useAuth } from '../../context/AuthContext';
import { useProgramRoutes } from '../../context/ProgramNavContext';
import { PROGRAMS } from '../../constants/programs';
import { useLepNav } from '../lep/useLepNav';
import { useCourseDemo } from '../../context/CourseDemoContext';
import { isItemDone } from '../../constants/practice';
import {
  BarButton,
  CheckRow,
  DarkPanel,
  DueWeek,
  GlanceGrid,
  LinkRow,
  PeopleRow,
  PrepTask,
  ProgramPage,
  SectionLabel,
  SoftCard,
  StreakRow,
  VideoCard,
  Whisper,
  firstName,
} from '../program/ProgramKit';

function HeroTitle({ children }) {
  return (
    <ILText role="displaySm" color="#FFFFFF" style={{ marginTop: 8 }}>
      {children}
    </ILText>
  );
}

function HeroChip({ label }) {
  return (
    <View
      style={{
        flexDirection: 'row',
        alignItems: 'center',
        alignSelf: 'flex-start',
        backgroundColor: 'rgba(255,255,255,0.10)',
        borderRadius: 999,
        paddingHorizontal: 12,
        paddingVertical: 6,
      }}
    >
      <View style={{ width: 7, height: 7, borderRadius: 4, backgroundColor: IL_BRAND.red, marginRight: 8 }} />
      <ILText role="label" color="#FFFFFF" style={{ fontSize: 12, lineHeight: 16 }}>
        {label}
      </ILText>
    </View>
  );
}

function StatusPill({ label, icon }) {
  if (icon) {
    return (
      <View
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          alignSelf: 'flex-start',
          marginTop: 16,
          backgroundColor: 'rgba(255,255,255,0.10)',
          borderRadius: 999,
          paddingHorizontal: 12,
          paddingVertical: 7,
        }}
      >
        <MaterialIcons name={icon} size={14} color={IL_BRAND.redSoft} />
        <ILText role="bodySm" color="#FFFFFF" style={{ marginLeft: 6 }}>
          {label}
        </ILText>
      </View>
    );
  }
  return (
    <View
      style={{
        alignSelf: 'flex-start',
        marginTop: 12,
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.28)',
        borderRadius: 999,
        paddingHorizontal: 10,
        paddingVertical: 5,
      }}
    >
      <ILText role="bodySm" color="#FFFFFF">
        {label}
      </ILText>
    </View>
  );
}

function PracticeList({ items, streak, note }) {
  const nav = useLepNav();
  const { isDone } = useCourseDemo();
  return (
    <SoftCard>
      {streak ? <StreakRow streak={streak} note={note} /> : null}
      {items.map((item, i) => (
        <CheckRow
          key={item.title}
          {...item}
          done={isItemDone(item, isDone)}
          last={i === items.length - 1}
          onPress={() => nav.goPracticeItem(item)}
        />
      ))}
    </SoftCard>
  );
}

const BM_PREP = [
  {
    taskId: 'bm100-onb-brand-video',
    icon: 'videocam',
    title: 'Brand creation video',
    detail: 'Your Core Story, 2–3 minutes on camera',
    action: 'Record',
  },
  {
    taskId: 'bm100-wk1-1',
    icon: 'show-chart',
    title: 'Milestone Table practice',
    detail: 'Draft the milestones you will present at Onboarding',
    action: 'Start',
  },
  {
    taskId: 'bm100-onb-resume',
    icon: 'description',
    title: 'Resume preparation',
    detail: 'Bring a current draft — you will rework it in Phase 1',
    action: 'Upload',
  },
];

function BmRegistered() {
  const { profile } = useAuth();
  const routes = useProgramRoutes();
  const name = firstName(profile);
  const openJourney = () => routes.openMyProgram('100bm', 'Journey');
  const openLearn = () => routes.openLearn('100bm');
  const nav = useLepNav();
  const { isDone } = useCourseDemo();
  const prep = BM_PREP.map((p) => ({ ...p, done: isDone(PROGRAMS.BM100, p.taskId) }));
  const prepDone = prep.filter((p) => p.done).length;
  return (
    <ProgramPage>
      <DarkPanel>
        <HeroChip label="100 Board Members" />
        <HeroTitle>Good morning, {name}.</HeroTitle>
        <ILText role="body" color={IL_BRAND.redSoft} style={{ marginTop: 6 }}>
          Every board seat starts with one bold move — you already made it.
        </ILText>
        <StatusPill icon="verified" label="Registered · part payment received" />
      </DarkPanel>

      <SoftCard onPress={routes.openPayment}>
        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
          <View
            style={{
              width: 44,
              height: 44,
              borderRadius: 22,
              backgroundColor: '#FDECEC',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <MaterialIcons name="payments" size={20} color={IL_BRAND.red} />
          </View>
          <View style={{ flex: 1, marginLeft: 12, paddingRight: 8 }}>
            <ILText role="label">Balance due 21 Sep</ILText>
            <ILText role="bodySm" color={IL_BRAND.muted} numberOfLines={1}>
              Batch details open once the seat is paid.
            </ILText>
          </View>
          <ILText role="label" color={IL_BRAND.red} accessibilityLabel="Pay balance">
            Pay balance →
          </ILText>
        </View>
      </SoftCard>

      <SoftCard style={{ backgroundColor: '#FAF7EF' }}>
        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
          <PeopleRow extra={18} onLight />
          <View style={{ flex: 1, marginLeft: 12 }}>
            <ILText role="label">18 women starting together</ILText>
            <ILText role="bodySm" color={IL_BRAND.muted}>
              Most are also finishing pre-program work.
            </ILText>
          </View>
        </View>
      </SoftCard>

      <GlanceGrid
        kicker="100 Board Members · at a glance"
        cells={[
          ['Duration', '6 months'],
          ['Format', 'Weekly online + huddles'],
          ['Curriculum', 'Board readiness & pitching'],
          ['On completion', 'Graduation'],
        ]}
      />

      <Whisper
        body="Before you record your Core Story, watch Indra Nooyi in Winning Ways for Women. Notice how she opens."
        action="Watch now →"
        onAction={openLearn}
      />

      <SectionLabel
        title="Today’s practice"
        sub="1 of 3 done · about 20 min"
        action="Open checklist"
        onAction={openJourney}
      />
      <PracticeList
        streak="2-day streak"
        note="Daily revision at 8:00 AM"
        items={[
          {
            title: 'Say your board ambition out loud once',
            detail: 'Daily revision · 1 min',
            done: true,
            programId: '100bm',
            practiceId: 'bm-ambition',
          },
          {
            title: 'Milestone Table practice — draft two milestones',
            detail: 'Pre-program · 10 min',
            done: false,
            programId: '100bm',
            taskId: 'bm100-wk1-1',
          },
          {
            title: 'Watch today’s message from IL Guide',
            detail: 'Video · 3 min',
            done: false,
            programId: '100bm',
            practiceId: 'bm-guide-message',
          },
        ]}
      />

      <SectionLabel
        title="C-suite conversations"
        sub="Leaders who sit at the top table"
        action="See all"
        onAction={openLearn}
      />
      <VideoCard onPress={openLearn} kicker="This week’s must-watch · 100BM" />

      <SectionLabel
        title="Before your first session"
        sub="Three things Iron Lady needs from you — not your batch leader, you"
        badge={`${prepDone} of ${prep.length}`}
      />
      {prep.map((p) => (
        <PrepTask key={p.taskId} {...p} onPress={() => nav.goCourseTask(PROGRAMS.BM100, p.taskId)} />
      ))}

      <LinkRow
        icon="flag"
        title="Your 100BM journey"
        sub="4 phases + Graduation · see them in My Program"
        onPress={openJourney}
      />
    </ProgramPage>
  );
}

function BmEnrolled() {
  const { profile } = useAuth();
  const routes = useProgramRoutes();
  const nav = useLepNav();
  const name = firstName(profile);
  const openJourney = () => routes.openMyProgram('100bm', 'Journey');
  const openLearn = () => routes.openLearn('100bm');
  return (
    <ProgramPage>
      <DarkPanel>
        <ILText role="eyebrow" color={IL_BRAND.redSoft} style={{ fontSize: 10 }}>
          Enrolled · Phase 2 · Pitch & strategy live now
        </ILText>
        <HeroTitle>Halfway through, {name}.</HeroTitle>
        <ILText role="bodySm" color={IL_BRAND.mutedOnDark} style={{ marginTop: 8 }}>
          Foundation is done. Pitching and influencing is next — it is the phase people talk about after Graduation.
        </ILText>
        <ILText role="eyebrow" color={IL_BRAND.redSoft} style={{ fontSize: 10, marginTop: 14 }}>
          This week
        </ILText>
        <StatusPill label="Weekly Q&A · Thu 7:00 PM IST" />
        <Pressable
          onPress={() => routes.openMyProgram('100bm', 'Sessions')}
          accessibilityRole="button"
          accessibilityLabel="Join Thursday’s Q&A"
          style={({ pressed }) => ({
            marginTop: 16,
            backgroundColor: '#ED1D24',
            borderRadius: 999,
            paddingVertical: 14,
            alignItems: 'center',
            opacity: pressed ? 0.92 : 1,
          })}
        >
          <ILText role="label" color="#FFFFFF">
            Join Thursday’s Q&A →
          </ILText>
        </Pressable>
      </DarkPanel>

      <SoftCard>
        <ILText role="label">Pre-program complete</ILText>
        <ILText role="bodySm" color={IL_BRAND.muted}>
          Brand video, Milestone Table and resume all reviewed at Onboarding.
        </ILText>
      </SoftCard>

      <Whisper
        body="Your next watch is Winning Ways for Women with Indra Nooyi. See the top table before Phase 2 tests your pitch."
        action="Watch now →"
        onAction={openLearn}
      />

      <SectionLabel
        title="Today’s practice"
        sub="1 of 4 done · about 30 min"
        action="Open checklist"
        onAction={openJourney}
      />
      <PracticeList
        streak="5-day streak"
        note="Daily revision at 8:00 AM"
        items={[
          {
            title: 'Say your SuperPower Statement out loud — under 20 seconds',
            detail: 'Daily revision · 2 min',
            done: true,
            programId: '100bm',
            practiceId: 'bm-superpower',
          },
          {
            title: 'Rehearse your ask out loud, twice',
            detail: 'Get ready for Phase 2 · 5 min',
            done: false,
            programId: '100bm',
            practiceId: 'bm-ask',
          },
          {
            title: 'Imperfect Brand Video',
            detail: 'Practice drill · 15 min',
            done: false,
            programId: '100bm',
            taskId: 'bm100-wk2',
          },
          {
            title: 'Weekly Q&A · Thu 7:00 PM IST',
            detail: 'Live session · add a question before you join',
            done: false,
            programId: '100bm',
            practiceId: 'bm-qa',
          },
        ]}
      />

      <DueWeek
        sub="Phase 2 · Pitch & strategy"
        onSchedule={nav.goSchedule}
        items={[
          {
            title: 'Post-Session on Pitch',
            tag: '100BM',
            kind: 'Video · record your pitch',
            due: 'Due Thu',
            urgent: true,
            icon: 'videocam',
            onPress: () => nav.goCourseTask(PROGRAMS.BM100, 'bm100-wk11'),
          },
          {
            title: 'Pre-Session on Mid Level Politics',
            tag: '100BM',
            kind: 'Form · strategy problem statement',
            due: 'Due Sat',
            icon: 'edit-note',
            onPress: () => nav.goCourseTask(PROGRAMS.BM100, 'bm100-wk12'),
          },
          {
            title: 'Session 4 — Pitching and Influencing',
            tag: '100BM',
            kind: 'Video · submit from the session',
            due: 'By 12 Oct',
            icon: 'mic',
            onPress: () => nav.goCourseTask(PROGRAMS.BM100, 'bm100-wk10'),
          },
        ]}
      />

      <SectionLabel
        title="C-suite conversations"
        sub="Leaders who sit at the top table"
        action="See all"
        onAction={openLearn}
      />
      <VideoCard onPress={openLearn} kicker="This week’s must-watch · 100BM" />

      <LinkRow
        icon="flag"
        title="Phase 2 of 4 · Pitch & Strategy"
        sub="Your phases and practice sessions are in My Program"
        onPress={openJourney}
      />

      <SectionLabel
        title="Get ready for Phase 2"
        sub="Pitching and influencing rewards a rehearsed pitch, not a written one"
      />
      <SoftCard style={{ paddingVertical: 4 }}>
        <CheckRow title="Rewatch your Milestone Table" done onPress={openLearn} />
        <CheckRow title="Rehearse your ask out loud, twice" onPress={openLearn} />
        <CheckRow title="Bring one real ask you are avoiding making" onPress={openJourney} />
      </SoftCard>

      <DarkPanel>
        <ILText role="eyebrow" color={IL_BRAND.redSoft} style={{ fontSize: 10 }}>
          Your board ambition
        </ILText>
        <ILText role="title" color="#FFFFFF" style={{ marginTop: 8 }}>
          Independent director by 2028
        </ILText>
        <ILText role="bodySm" color={IL_BRAND.mutedOnDark} style={{ marginTop: 6 }}>
          Stated at registration · revisited at Graduation
        </ILText>
      </DarkPanel>
    </ProgramPage>
  );
}

function MbwRegistered() {
  const { profile } = useAuth();
  const routes = useProgramRoutes();
  const name = firstName(profile);
  const openJourney = () => routes.openMyProgram('mbw', 'Journey');
  const openLearn = () => routes.openLearn('mbw');
  return (
    <ProgramPage>
      <DarkPanel>
        <ILText role="eyebrow" color={IL_BRAND.redSoft} style={{ fontSize: 10 }}>
          Master of Business Warfare · prep week 5 of 12
        </ILText>
        <HeroTitle>Good morning, {name}.</HeroTitle>
        <ILText role="bodySm" color={IL_BRAND.mutedOnDark} style={{ marginTop: 8 }}>
          Your year of business warfare starts with 12 weeks of preparation. Eight to go before the Q1 core session.
        </ILText>
        <StatusPill label="Registered · Orientation with Rajesh done" />
      </DarkPanel>

      <DarkPanel>
        <ILText role="eyebrow" color={IL_BRAND.redSoft} style={{ fontSize: 10 }}>
          Your MBW circle
        </ILText>
        <ILText role="title" color="#FFFFFF" style={{ marginTop: 8 }}>
          Senior women leaders
        </ILText>
        <ILText role="bodySm" color={IL_BRAND.mutedOnDark}>
          Preparing with you in the WA group
        </ILText>
        <PeopleRow extra={20} />
      </DarkPanel>

      <GlanceGrid
        kicker="Master of Business Warfare · at a glance"
        cells={[
          ['Duration', '1 year · 52 weeks'],
          ['Format', 'Weekly task'],
          ['Sessions', '16 Impact Champions + 4 with Suvarna'],
          ['On completion', 'Graduation'],
        ]}
      />

      <Whisper
        body={`Eight weeks to your first core session, ${name}. This week is LinkedIn connects — share your connection increase in the group by Sunday.`}
        action="Open this week →"
        onAction={openJourney}
      />

      <SectionLabel
        title="Today’s practice"
        sub="1 of 3 done · about 15 min"
        action="Open checklist"
        onAction={openJourney}
      />
      <PracticeList
        streak="4-day streak"
        note="Daily revision at 8:00 AM"
        items={[
          { title: 'Mirror Work', detail: 'LEP ritual · 5 min', done: true, programId: 'mbw', practiceId: 'mbw-mirror-work' },
          {
            title: 'Send 5 connection requests to C-Suite leaders',
            detail: 'This week · LinkedIn % connects · 5 min',
            done: false,
            programId: 'mbw',
            taskId: 'mbw-linkedin-connects',
          },
          {
            title: 'Revise ERRC: one thing to eliminate today',
            detail: 'Daily revision · 2 min',
            done: false,
            programId: 'mbw',
            practiceId: 'mbw-errc',
          },
        ]}
      />

      <SectionLabel title="This week · Wk1–8" sub="One task, shared in your WA group" />
      <SoftCard>
        <ILText role="label">LinkedIn % connects</ILText>
        <ILText role="bodySm" color={IL_BRAND.muted} style={{ marginTop: 4 }}>
          Grow your connections this week, then share the increase in your WhatsApp group.
        </ILText>
        <BarButton
          label="Mark as shared in the group"
          onPress={() => routes.openMyProgram('mbw', 'Cohort')}
        />
      </SoftCard>

      <SectionLabel
        title="C-suite conversations"
        sub="Leaders who sit at the top table"
        action="See all"
        onAction={openLearn}
      />
      <VideoCard onPress={openLearn} kicker="This week’s must-watch · MBW" />

      <LinkRow
        icon="flag"
        title="Your MBW year"
        sub="Prep week 5 of 12 · preparation, Q1–Q4 and Graduation in My Program"
        onPress={openJourney}
      />

      <LinkRow
        icon="record-voice-over"
        title="Your C-Suite Talk"
        sub="Topic submitted · prep session 10 days before the talk"
        onPress={openJourney}
      />
    </ProgramPage>
  );
}

function MbwEnrolled() {
  const { profile } = useAuth();
  const routes = useProgramRoutes();
  const nav = useLepNav();
  const name = firstName(profile);
  const openYear = () => routes.openMyProgram('mbw', 'Journey');
  const openLearn = () => routes.openLearn('mbw');
  return (
    <ProgramPage>
      <DarkPanel>
        <ILText role="eyebrow" color={IL_BRAND.redSoft} style={{ fontSize: 10 }}>
          Enrolled · MBW · Q1 · Week 4 of 52
        </ILText>
        <HeroTitle>A month in, {name}.</HeroTitle>
        <ILText role="bodySm" color={IL_BRAND.mutedOnDark} style={{ marginTop: 8 }}>
          Resume and LinkedIn are done. This quarter builds your C-Suite profile — your stories come next.
        </ILText>
        <View style={{ flexDirection: 'row', marginTop: 16 }}>
          {['Q1', 'Q2', 'Q3', 'Q4'].map((q, i) => (
            <View key={q} style={{ flex: 1, marginRight: i < 3 ? 6 : 0 }}>
              <View
                style={{
                  height: 4,
                  borderRadius: 2,
                  backgroundColor: i === 0 ? IL_BRAND.red : 'rgba(255,255,255,0.2)',
                }}
              />
              <ILText role="bodySm" color="#FFFFFF" style={{ marginTop: 6, fontSize: 11 }}>
                {q}
              </ILText>
            </View>
          ))}
        </View>
        <ILText role="bodySm" color={IL_BRAND.mutedOnDark} style={{ marginTop: 12 }}>
          Next: Session 2 · C-Suite Story
        </ILText>
        <ILText role="bodySm" color={IL_BRAND.mutedOnDark}>
          After Wk4 · Video
        </ILText>
      </DarkPanel>

      <SoftCard>
        <ILText role="label">Preparation complete</ILText>
        <ILText role="bodySm" color={IL_BRAND.muted}>
          12 weeks, both sessions and your C-Suite Talk topic
        </ILText>
      </SoftCard>

      <Whisper
        body={`Week 4, ${name}. Three stories of accomplishment go to your WA group this week — Session 2 turns one of them into your C-Suite Story Video.`}
        action="Start my stories →"
        onAction={() => routes.openMyProgram('mbw', 'Cohort')}
      />

      <SectionLabel
        title="Today’s practice"
        sub="1 of 3 done · about 15 min"
        action="Open checklist"
        onAction={openYear}
      />
      <PracticeList
        streak="6-day streak"
        note="Daily revision at 8:00 AM"
        items={[
          { title: 'Mirror Work', detail: 'LEP ritual · 5 min', done: true, programId: 'mbw', practiceId: 'mbw-mirror-work' },
          {
            title: 'Write story 2 in three lines: situation, action, result',
            detail: 'This week · C-Suite Story · 10 min',
            done: false,
            programId: 'mbw',
            taskId: 'q1-csuite-story',
          },
          {
            title: 'Say one accomplishment in business language',
            detail: 'Daily revision · 2 min',
            done: false,
            programId: 'mbw',
            practiceId: 'mbw-business-language',
          },
        ]}
      />

      <DueWeek
        sub="Q1 · Week 4 · C-Suite profile"
        onSchedule={nav.goSchedule}
        items={[
          {
            title: 'C-Suite Story',
            tag: 'MBW',
            kind: 'Form · 3 accomplishment stories',
            due: 'Due Thu',
            urgent: true,
            icon: 'edit-note',
            onPress: () => nav.goCourseTask(PROGRAMS.MBW, 'q1-csuite-story'),
          },
          {
            title: 'LinkedIn Posts (×2)',
            tag: 'MBW',
            kind: 'Post · share both links',
            due: 'Due Fri',
            icon: 'post-add',
            onPress: () => nav.goCourseTask(PROGRAMS.MBW, 'q1-linkedin-posts'),
          },
          {
            title: 'C-Suite Story Video',
            tag: 'MBW',
            kind: 'Video · after Session 2',
            due: 'Due Sun',
            icon: 'videocam',
            onPress: () => nav.goCourseTask(PROGRAMS.MBW, 'q1-story-video'),
          },
        ]}
      />

      <SectionLabel title="This week · Wk4" sub="C-Suite Story" />
      <SoftCard>
        <ILText role="label">Share 3 key stories of accomplishment</ILText>
        <ILText role="bodySm" color={IL_BRAND.muted} style={{ marginTop: 4 }}>
          Posted in your WA group for review before Session 2.
        </ILText>
        <View style={{ flexDirection: 'row', marginTop: 12 }}>
          {['Story 1', 'Story 2', 'Story 3'].map((story, i) => (
            <View
              key={story}
              style={{
                flex: 1,
                marginRight: i < 2 ? 8 : 0,
                borderRadius: 12,
                paddingVertical: 10,
                alignItems: 'center',
                backgroundColor: i === 0 ? '#E7F0EA' : '#F3EFE8',
              }}
            >
              <ILText
                role="label"
                color={i === 0 ? IL_BRAND.paidGreen : IL_BRAND.ink}
                style={{ fontSize: 12 }}
              >
                {i === 0 ? '✓  ' : ''}
                {story}
              </ILText>
            </View>
          ))}
        </View>
        <BarButton label="Continue story 2 →" onPress={() => nav.goCourseTask(PROGRAMS.MBW, 'q1-csuite-story')} />
      </SoftCard>

      <SectionLabel
        title="C-suite conversations"
        sub="Leaders who sit at the top table"
        action="See all"
        onAction={openLearn}
      />
      <VideoCard onPress={openLearn} kicker="This week’s must-watch · MBW" />

      <LinkRow
        icon="flag"
        title="Q1 · Week 4 of 52"
        sub="Your quarters and C-Suite profile are in My Program"
        onPress={openYear}
      />
      <LinkRow
        icon="groups"
        title="Your MBW WA group"
        sub="24 senior women · 3 stories shared today · review one before Session 2"
        onPress={routes.openEngage}
      />

      <DarkPanel>
        <ILText role="eyebrow" color={IL_BRAND.redSoft} style={{ fontSize: 10 }}>
          Your C-Suite ambition
        </ILText>
        <ILText role="title" color="#FFFFFF" style={{ marginTop: 8 }}>
          CXO by 2028
        </ILText>
        <ILText role="bodySm" color={IL_BRAND.mutedOnDark} style={{ marginTop: 6 }}>
          From your B-HAG · revisited at Graduation
        </ILText>
      </DarkPanel>
    </ProgramPage>
  );
}

function ComboHome() {
  const { profile } = useAuth();
  const routes = useProgramRoutes();
  const nav = useLepNav();
  const name = firstName(profile);
  return (
    <ProgramPage>
      <DarkPanel>
        <HeroTitle>Good morning, {name}.</HeroTitle>
        <ILText role="bodySm" color={IL_BRAND.mutedOnDark} style={{ marginTop: 8 }}>
          Everything for both your programs, in one list below.
        </ILText>
        <View style={{ flexDirection: 'row', marginTop: 16 }}>
          <Pressable
            onPress={() => routes.openMyProgram('lep', 'Journey')}
            accessibilityRole="button"
            style={{
              flex: 1,
              marginRight: 8,
              borderRadius: 16,
              padding: 12,
              backgroundColor: 'rgba(255,255,255,0.08)',
            }}
          >
            <ILText role="eyebrow" color={IL_BRAND.redSoft} style={{ fontSize: 10 }}>
              Enrolled
            </ILText>
            <ILText role="label" color="#FFFFFF" style={{ marginTop: 6 }}>
              LEP
            </ILText>
            <ILText role="bodySm" color={IL_BRAND.mutedOnDark}>
              Day 1 in 4 days
            </ILText>
          </Pressable>
          <Pressable
            onPress={() => routes.openMyProgram('100bm', 'Journey')}
            accessibilityRole="button"
            style={{ flex: 1, borderRadius: 16, padding: 12, backgroundColor: 'rgba(255,255,255,0.08)' }}
          >
            <ILText role="eyebrow" color="#FFFFFF" style={{ fontSize: 10 }}>
              Registered
            </ILText>
            <ILText role="label" color="#FFFFFF" style={{ marginTop: 6 }}>
              100BM
            </ILText>
            <ILText role="bodySm" color={IL_BRAND.mutedOnDark}>
              Opens 3 Oct
            </ILText>
          </Pressable>
        </View>
      </DarkPanel>

      <Whisper
        body={`Four days to Day 1, ${name}. LEP comes first this week — finish the Shameless Speech tonight. Your 100BM pre-work can wait for the weekend.`}
        action="Watch now →"
        onAction={() => routes.openLearn('lep')}
      />

      <SectionLabel
        title="Today’s practice"
        sub="Both programs · 2 of 4 done · about 35 min"
        action="Open checklist"
        onAction={() => routes.openMyProgram('lep', 'Journey')}
      />
      <PracticeList
        streak="3-day streak"
        note="One daily revision, 8:00 AM"
        items={[
          { title: '5 Daily Rituals — morning check', detail: 'LEP ritual · 2 min', done: true, tag: 'LEP', programId: 'lep', practiceId: 'lep-rituals' },
          { title: 'Revise Principle 3 from the 27 Principles', detail: 'Daily revision · 2 min', done: true, tag: 'LEP', programId: 'lep', practiceId: 'lep-principle' },
          { title: 'Watch The Shameless Speech', detail: 'Pre-work · 22 min', done: false, tag: 'LEP', programId: 'lep', practiceId: 'lep-shameless' },
          {
            title: 'Draft two milestones for your Milestone Table',
            detail: 'Pre-program · 10 min',
            done: false,
            tag: '100BM',
            programId: '100bm',
            taskId: 'bm100-wk1-1',
          },
        ]}
      />

      <DueWeek
        sub="Across your programs"
        onSchedule={() => routes.openMyProgram('lep', 'Sessions')}
        items={[
          {
            title: 'Day 1 Assignment',
            tag: 'LEP',
            kind: 'Assignment',
            due: 'Due Thu',
            urgent: true,
            icon: 'assignment',
            onPress: () => nav.goCourseTask(PROGRAMS.LEP, 'lep-day1-assignment'),
          },
          {
            title: 'Fill the CoDeSeF Sheet',
            tag: 'LEP',
            kind: 'Form',
            due: 'Due Fri',
            icon: 'edit-note',
            onPress: () => nav.goCourseTask(PROGRAMS.LEP, 'lep-prep-codesef-sheet'),
          },
          {
            title: 'Brand creation video',
            tag: '100BM',
            kind: 'Pre-program · your Core Story',
            due: 'By 2 Oct',
            icon: 'videocam',
            onPress: () => nav.goCourseTask(PROGRAMS.BM100, 'bm100-wk1-4'),
          },
        ]}
      />

      <DarkPanel>
        <ILText role="eyebrow" color={IL_BRAND.redSoft} style={{ fontSize: 10 }}>
          100 Board Members · registered
        </ILText>
        <ILText role="label" color="#FFFFFF" style={{ marginTop: 8 }}>
          Balance due 21 Sep
        </ILText>
        <ILText role="title" color="#FFFFFF" style={{ marginTop: 4 }}>
          Your 100BM seat is held
        </ILText>
        <ILText role="bodySm" color={IL_BRAND.mutedOnDark} style={{ marginTop: 6 }}>
          Part payment received · onboarding opens 3 Oct, while LEP’s weekly sessions are still running.
        </ILText>
        <BarButton label="Complete enrolment →" onPress={routes.openPayment} />
        <Pressable
          onPress={() => routes.openMyProgram('100bm', 'Journey')}
          accessibilityRole="button"
          style={{ marginTop: 12, alignItems: 'center' }}
        >
          <ILText role="label" color="#FFFFFF">
            See 100BM
          </ILText>
        </Pressable>
      </DarkPanel>

      <LinkRow
        icon="layers"
        title="Your two programs"
        sub="LEP and 100BM, side by side, in My Program"
        onPress={() => routes.openMyProgram('all', 'Journey')}
      />
    </ProgramPage>
  );
}

export default function ProgramHomes({ program, stage }) {
  if (program === 'all') return <ComboHome />;
  if (program === 'mbw') return stage === 'registered' ? <MbwRegistered /> : <MbwEnrolled />;
  return stage === 'registered' ? <BmRegistered /> : <BmEnrolled />;
}

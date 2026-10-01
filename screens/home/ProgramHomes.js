import React from 'react';
import { Pressable, View } from 'react-native';
import { IL_BRAND } from '../../constants/ironLadyBrand';
import ILText from '../../components/il/ILText';
import { useAuth } from '../../context/AuthContext';
import { useProgramRoutes } from '../../context/ProgramNavContext';
import {
  BarButton,
  CheckRow,
  DarkPanel,
  LinkRow,
  PeopleRow,
  ProgramPage,
  SectionLabel,
  SoftCard,
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

function StatusPill({ label }) {
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

function Glance({ rows }) {
  return (
    <SoftCard>
      <ILText role="eyebrow" color={IL_BRAND.dim} style={{ fontSize: 10 }}>
        At a glance
      </ILText>
      {rows.map(([label, value]) => (
        <View
          key={label}
          style={{ flexDirection: 'row', justifyContent: 'space-between', marginTop: 10 }}
        >
          <ILText role="bodySm" color={IL_BRAND.muted}>
            {label}
          </ILText>
          <ILText role="label" style={{ flex: 1, textAlign: 'right', marginLeft: 12 }}>
            {value}
          </ILText>
        </View>
      ))}
    </SoftCard>
  );
}

function PracticeList({ items, onOpen }) {
  return (
    <SoftCard>
      {items.map((item) => (
        <CheckRow key={item.title} {...item} onPress={() => onOpen(item.programId)} />
      ))}
    </SoftCard>
  );
}

function BmRegistered() {
  const { profile } = useAuth();
  const routes = useProgramRoutes();
  const name = firstName(profile);
  const openJourney = () => routes.openMyProgram('100bm', 'Journey');
  const openLearn = () => routes.openLearn('100bm');
  return (
    <ProgramPage>
      <DarkPanel>
        <ILText role="eyebrow" color={IL_BRAND.redSoft} style={{ fontSize: 10 }}>
          100 Board Members
        </ILText>
        <HeroTitle>Good morning, {name}.</HeroTitle>
        <ILText role="bodySm" color={IL_BRAND.mutedOnDark} style={{ marginTop: 8 }}>
          Every board seat starts with one bold move — you already made it.
        </ILText>
        <StatusPill label="Registered · part payment received" />
      </DarkPanel>

      <SoftCard>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
          <View style={{ flex: 1, paddingRight: 12 }}>
            <ILText role="label">Balance due 21 Sep</ILText>
            <ILText role="bodySm" color={IL_BRAND.muted}>
              Batch details open once the seat is paid.
            </ILText>
          </View>
          <Pressable onPress={routes.openPayment} accessibilityRole="button">
            <ILText role="label" color={IL_BRAND.red}>
              Pay balance →
            </ILText>
          </Pressable>
        </View>
      </SoftCard>

      <SoftCard>
        <ILText role="label">18 women starting together</ILText>
        <ILText role="bodySm" color={IL_BRAND.muted}>
          Most are also finishing pre-program work.
        </ILText>
      </SoftCard>

      <Glance
        rows={[
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
        onOpen={routes.openLearn}
        items={[
          {
            title: 'Stay your board ambition out loud',
            detail: 'Daily revision · 1 min',
            done: true,
            programId: '100bm',
          },
          {
            title: 'Milestone Table practice',
            detail: 'Draft two milestones · 10 min',
            done: false,
            programId: '100bm',
          },
          {
            title: 'Watch today’s message from IL Guide',
            detail: 'Video · 3 min',
            done: false,
            programId: '100bm',
          },
        ]}
      />

      <SectionLabel
        title="C-suite conversations"
        sub="This week’s must-watch · 100BM"
        action="See all"
        onAction={openLearn}
      />
      <VideoCard onPress={openLearn} />

      <SectionLabel title="Before your first session" sub="0 of 3" />
      <SoftCard style={{ paddingVertical: 4 }}>
        <CheckRow
          title="Brand creation video"
          detail="Your Core Story, 2–3 minutes on camera"
          onPress={openJourney}
        />
        <CheckRow
          title="Milestone Table practice"
          detail="Draft the milestones you will present"
          onPress={openJourney}
        />
        <CheckRow
          title="Resume preparation"
          detail="Bring a current draft — you will rework it in Phase 1"
          onPress={openJourney}
        />
      </SoftCard>

      <LinkRow
        icon="flag"
        title="Your 100BM journey"
        sub="Phases and practice sessions are in My Program"
        onPress={openJourney}
      />
    </ProgramPage>
  );
}

function BmEnrolled() {
  const { profile } = useAuth();
  const routes = useProgramRoutes();
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
          Foundation is done. Pitching and influencing is next.
        </ILText>
        <StatusPill label="Weekly Q&A · Thu 7:00 PM IST" />
      </DarkPanel>

      <SoftCard>
        <ILText role="label">Pre-program complete</ILText>
        <ILText role="bodySm" color={IL_BRAND.muted}>
          Brand video, Milestone Table and resume all reviewed at Onboarding.
        </ILText>
      </SoftCard>

      <Whisper
        body="Winning Ways for Women with Indra Nooyi. See the moments before Phase 2 tests your pitch."
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
        onOpen={routes.openLearn}
        items={[
          {
            title: 'Say your SuperPower Statement out loud',
            detail: 'Daily revision · 2 min',
            done: true,
            programId: '100bm',
          },
          {
            title: 'Rehearse your ask out loud, twice',
            detail: 'Practice · 10 min',
            done: false,
            programId: '100bm',
          },
          {
            title: 'Imperfect Brand Video',
            detail: 'Practice drill · 15 min',
            done: false,
            programId: '100bm',
          },
          {
            title: 'Weekly Q&A · Thu 7:00 PM IST',
            detail: 'Live session · add a question before you join',
            done: false,
            programId: '100bm',
          },
        ]}
      />

      <SectionLabel
        title="C-suite conversations"
        sub="Leaders who sit at the top table"
        action="See all"
        onAction={openLearn}
      />
      <VideoCard onPress={openLearn} />

      <LinkRow
        icon="flag"
        title="Phase 2 of 4 · Pitch & strategy"
        sub="Your phases and practice sessions are in My Program"
        onPress={openJourney}
      />

      <SectionLabel title="Get ready for Phase 2" sub="A rehearsed pitch, not a written one" />
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

      <Glance
        rows={[
          ['Duration', '1 year · 52 weeks'],
          ['Format', 'Weekly task in the WA group'],
          ['Sessions', '16 Impact Champions + 4 with Suvarna'],
          ['On completion', 'Graduation'],
        ]}
      />

      <Whisper
        body="Eight weeks to your first core session. This week is LinkedIn connects — share your connection increase in the group by Sunday."
        action="Open this week →"
        onAction={openJourney}
      />

      <SectionLabel
        title="Today’s practice"
        sub="1 of 3 done · about 25 min"
        action="Open checklist"
        onAction={openJourney}
      />
      <PracticeList
        onOpen={routes.openLearn}
        items={[
          { title: 'Mirror Work', detail: 'LEP ritual · 10 min', done: true, programId: 'mbw' },
          {
            title: 'Send 5 connection requests to C-Suite leaders',
            detail: 'This week · LinkedIn % connects · 10 min',
            done: false,
            programId: 'mbw',
          },
          {
            title: 'Revise ERRC — one thing to eliminate',
            detail: 'Daily revision · 2 min',
            done: false,
            programId: 'mbw',
          },
        ]}
      />

      <SectionLabel
        title="This week · Wk1–8"
        sub="LinkedIn % connects"
        action="See all"
        onAction={openJourney}
      />
      <SoftCard>
        <ILText role="label">Share the connection increase</ILText>
        <ILText role="bodySm" color={IL_BRAND.muted} style={{ marginTop: 4 }}>
          Grow your connections this week, then share the increase in the group by Sunday.
        </ILText>
        <BarButton
          label="Mark as shared in the group"
          onPress={() => routes.openMyProgram('mbw', 'Cohort')}
        />
      </SoftCard>

      <SectionLabel title="C-suite conversations" action="See all" onAction={openLearn} />
      <VideoCard onPress={openLearn} />

      <LinkRow
        icon="flag"
        title="Your MBW year"
        sub="Prep weeks 01–12, then Q1–Q4 and Graduation, in My Program"
        onPress={openJourney}
      />

      <SoftCard>
        <ILText role="eyebrow" color={IL_BRAND.dim} style={{ fontSize: 10 }}>
          Your C-Suite Talk
        </ILText>
        <ILText role="label" style={{ marginTop: 6 }}>
          Topic submitted · prep session 10 days before the talk
        </ILText>
      </SoftCard>
    </ProgramPage>
  );
}

function MbwEnrolled() {
  const { profile } = useAuth();
  const routes = useProgramRoutes();
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
          You are in and already one done. This quarter builds your C-Suite profile — your stories come next.
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
          Next · Session 2 · C-Suite Story Video
        </ILText>
      </DarkPanel>

      <SoftCard>
        <ILText role="label">Preparation complete</ILText>
        <ILText role="bodySm" color={IL_BRAND.muted}>
          12 weeks, both reviewed and your C-Suite Talk topic is in.
        </ILText>
      </SoftCard>

      <Whisper
        body="Week 4. Three stories of accomplishment go to your WA group this week — Session 2 turns one of them into your C-Suite Story profile."
        action="Start my stories →"
        onAction={() => routes.openMyProgram('mbw', 'Cohort')}
      />

      <SectionLabel
        title="Today’s practice"
        sub="1 of 3 done · about 20 min"
        action="Open checklist"
        onAction={openYear}
      />
      <PracticeList
        onOpen={routes.openLearn}
        items={[
          { title: 'Mirror Work', detail: 'LEP ritual · 10 min', done: true, programId: 'mbw' },
          {
            title: 'Write story 2 in three lines',
            detail: 'Situation, action, result · 10 min',
            done: false,
            programId: 'mbw',
          },
          {
            title: 'Say one accomplishment in business language',
            detail: 'Daily revision · 2 min',
            done: false,
            programId: 'mbw',
          },
        ]}
      />

      <SectionLabel title="This week · Wk4" sub="Share 3 stories of accomplishment" />
      <SoftCard>
        <ILText role="bodySm" color={IL_BRAND.muted}>
          Post each story in the WA group for review before Session 2.
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
                {story}
              </ILText>
            </View>
          ))}
        </View>
        <BarButton label="Continue story 2" onPress={() => routes.openMyProgram('mbw', 'Cohort')} />
      </SoftCard>

      <SectionLabel title="C-suite conversations" action="See all" onAction={openLearn} />
      <VideoCard onPress={openLearn} />

      <LinkRow
        icon="flag"
        title="Q1 · Week 4 of 52"
        sub="Your quarters and C-Suite profile are in My Program"
        onPress={openYear}
      />
      <LinkRow
        icon="groups"
        title="Your MBW WA group"
        sub="24 senior women · share story 2 before Session 2"
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
          From your C-Suite Talk · revisited at Graduation
        </ILText>
      </DarkPanel>
    </ProgramPage>
  );
}

function ComboHome() {
  const { profile } = useAuth();
  const routes = useProgramRoutes();
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
        onOpen={routes.openLearn}
        items={[
          { title: '5 Daily Rituals — morning check', detail: 'LEP ritual · 2 min', done: true, tag: 'LEP', programId: 'lep' },
          { title: 'Revise Principle 3 from the 27 Principles', detail: 'Daily revision · 2 min', done: true, tag: 'LEP', programId: 'lep' },
          { title: 'Watch The Shameless Speech', detail: 'Pre-work · 22 min', done: false, tag: 'LEP', programId: 'lep' },
          {
            title: 'Draft two milestones for your Milestone Table',
            detail: 'Pre-program · 10 min',
            done: false,
            tag: '100BM',
            programId: '100bm',
          },
        ]}
      />

      <SectionLabel
        title="Due this week"
        sub="Across your programs"
        action="See schedule"
        onAction={() => routes.openMyProgram('lep', 'Sessions')}
      />
      <SoftCard style={{ paddingVertical: 4 }}>
        <CheckRow title="Day 1 Assignment" detail="Due Thu" tag="LEP" onPress={() => routes.openLearn('lep')} />
        <CheckRow title="Fill the CoDeSeF Sheet" detail="Due Fri" tag="LEP" onPress={() => routes.openLearn('lep')} />
        <CheckRow
          title="Brand creation video"
          detail="Pre-program · your Core Story · by 2 Oct"
          tag="100BM"
          onPress={() => routes.openMyProgram('100bm', 'Journey')}
        />
      </SoftCard>

      <DarkPanel>
        <ILText role="eyebrow" color={IL_BRAND.redSoft} style={{ fontSize: 10 }}>
          100 Board Members · registered · balance due 21 Sep
        </ILText>
        <ILText role="title" color="#FFFFFF" style={{ marginTop: 8 }}>
          Your 100BM seat is held
        </ILText>
        <ILText role="bodySm" color={IL_BRAND.mutedOnDark} style={{ marginTop: 6 }}>
          Part payment received. Onboarding opens 3 Oct, while LEP’s weekly sessions are still running.
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

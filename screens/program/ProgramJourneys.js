import React, { useState } from 'react';
import { Pressable, View } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { IL_BRAND } from '../../constants/ironLadyBrand';
import ILText from '../../components/il/ILText';
import { programStage, useProgramRoutes } from '../../context/ProgramNavContext';
import { useAuth } from '../../context/AuthContext';
import { getEnrolledProgramIds } from '../../utils/programAccess';
import { useLepNav } from '../lep/useLepNav';
import { PROGRAMS } from '../../constants/programs';
import { coursePhases, currentPhaseId, isPhaseOpen } from '../../constants/programCourseSlice';
import ThisPhaseBlock from './ThisPhaseBlock';
import {
  BarButton,
  DarkPanel,
  DateBadge,
  FilterPills,
  LinkRow,
  PeopleRow,
  PhaseRow,
  Pill,
  ProgramPage,
  SectionLabel,
  SectionTabs,
  SessionRow,
  SoftCard,
} from './ProgramKit';

const MBW_YEAR = [
  [
    'done',
    'Done',
    'Preparation',
    'Orientation (Rajesh), 12 weeks of prep, Preparation Session (Suvarna), C-Suite Talk prep',
    'Wk1–12 to Wk1–1',
  ],
  [
    'now',
    'Week 4',
    'Q1 · C-Suite profile',
    'C-Suite Resume, LinkedIn, C-Suite Story and video, bell curve, business language, Milestone Table, Video CV, apply for a C-Suite role, Super Power Table',
    'Wk1–12 · Sessions 1–4 · Strengthening your strengths with Suvarna',
  ],
  [
    'later',
    'Next',
    'Q2 · Pitch and strategy',
    'Enemy and differentiation, pitch video, rejection practice, strategy draft, drama, ERRC delegation, LinkedIn challenge, C-Suite Talk practice',
    'Wk13–24 · Sessions 5–8 · Deception/Drama with Suvarna',
  ],
  [
    'later',
    'Later',
    'Q3 · Business perspective',
    'Mock interview video, terrain, business language, LinkedIn video, energy centers, influencing role play, signalling, offence and defence',
    'Wk25–36 · Sessions 9–12 · Influencing tactics with Suvarna',
  ],
  [
    'later',
    'Later',
    'Q4 · C-Suite game plan',
    'Repositioning, ERRC, bell curve game plan, projection, Delta 2 review, strategy, challenges, drama, apply for a C-Suite position',
    'Wk37–48 · Sessions 13–16 · C-Suite Game Plan with Suvarna',
  ],
  [
    'later',
    'Later',
    'Closure · Graduation',
    'Closure Session, four weeks of graduation preparation, then Graduation',
    'Wk49–52',
  ],
];

function PhaseList({ rows, onPress, pressFor }) {
  return (
    <View style={{ marginTop: 12 }}>
      {rows.map((row, index) => {
        const [state, kicker, title, detail, note] = row;
        const now = state === 'now';
        return (
          <View
            key={`${kicker}-${title}`}
            style={{
              marginTop: index ? 10 : 0,
              borderRadius: 22,
              overflow: 'hidden',
              backgroundColor: IL_BRAND.white,
              borderWidth: now ? 1.5 : 0,
              borderColor: now ? IL_BRAND.red : 'transparent',
            }}
          >
            <PhaseRow
              state={state}
              kicker={kicker}
              title={title}
              detail={detail}
              note={note}
              last
              onPress={pressFor ? pressFor(row) : onPress}
            />
          </View>
        );
      })}
    </View>
  );
}

function ProgressPanel({ kicker, right, title, percent, foot }) {
  return (
    <DarkPanel>
      <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
        <ILText role="eyebrow" color={IL_BRAND.redSoft} style={{ fontSize: 10 }}>
          {kicker}
        </ILText>
        <ILText role="eyebrow" color="#FFFFFF" style={{ fontSize: 10 }}>
          {right}
        </ILText>
      </View>
      <ILText role="displaySm" color="#FFFFFF" style={{ marginTop: 8 }}>
        {title}
      </ILText>
      <View
        style={{
          height: 4,
          borderRadius: 2,
          backgroundColor: 'rgba(255,255,255,0.16)',
          marginTop: 14,
          overflow: 'hidden',
        }}
      >
        <View style={{ width: `${percent}%`, height: 4, backgroundColor: IL_BRAND.red, borderRadius: 2 }} />
      </View>
      <ILText role="bodySm" color={IL_BRAND.mutedOnDark} style={{ marginTop: 12 }}>
        {foot}
      </ILText>
    </DarkPanel>
  );
}

function EnrollCard({ title, body, onPress }) {
  return (
    <DarkPanel>
      <ILText role="eyebrow" color={IL_BRAND.redSoft} style={{ fontSize: 10 }}>
        Enrollment pending
      </ILText>
      <ILText role="displaySm" color="#FFFFFF" style={{ marginTop: 8 }}>
        {title}
      </ILText>
      <ILText role="bodySm" color={IL_BRAND.mutedOnDark} style={{ marginTop: 8 }}>
        {body}
      </ILText>
      <Pressable
        onPress={onPress}
        accessibilityRole="button"
        style={{
          marginTop: 16,
          backgroundColor: IL_BRAND.red,
          borderRadius: 999,
          paddingVertical: 14,
          alignItems: 'center',
        }}
      >
        <ILText role="label" color="#FFFFFF">
          Complete enrollment →
        </ILText>
      </Pressable>
    </DarkPanel>
  );
}

function CoursePhaseList({ programId, enrolled, onLocked }) {
  const nav = useLepNav();
  const phaseId = currentPhaseId(programId, enrolled);
  const phases = coursePhases(programId);
  const nowIndex = phases.findIndex((p) => p.id === phaseId);
  return (
    <View style={{ marginTop: 12 }}>
      {phases.map((p, i) => {
        const shut = !isPhaseOpen(p, enrolled);
        const now = p.id === phaseId;
        const done = enrolled && i < nowIndex;
        return (
          <Pressable
            key={p.id}
            onPress={shut ? onLocked : () => nav.goCoursePhase(programId, p.id)}
            accessibilityRole="button"
            accessibilityState={{ disabled: shut }}
            style={{
              marginTop: i ? 10 : 0,
              borderRadius: 22,
              backgroundColor: IL_BRAND.white,
              borderWidth: now ? 1.5 : 0,
              borderColor: now ? IL_BRAND.red : 'transparent',
              paddingHorizontal: 14,
              paddingVertical: 14,
              flexDirection: 'row',
              alignItems: 'center',
              opacity: shut ? 0.6 : 1,
            }}
          >
            <MaterialIcons
              name={shut ? 'lock' : done ? 'check-circle' : now ? 'play-circle-filled' : 'radio-button-unchecked'}
              size={22}
              color={shut ? IL_BRAND.dim : done ? IL_BRAND.paidGreen : now ? IL_BRAND.red : IL_BRAND.dim}
            />
            <View style={{ marginLeft: 12, flex: 1 }}>
              <ILText role="eyebrow" color={now ? IL_BRAND.red : IL_BRAND.dim} style={{ fontSize: 10 }}>
                {shut ? 'Locked · opens on enrollment' : done ? 'Done' : now ? 'Now' : 'Next'}
              </ILText>
              <ILText role="label" style={{ marginTop: 2 }}>
                {p.title}
              </ILText>
              <ILText role="bodySm" color={IL_BRAND.muted}>
                {p.sub}
              </ILText>
            </View>
            <MaterialIcons
              name={shut ? 'lock-outline' : 'chevron-right'}
              size={18}
              color={IL_BRAND.dim}
            />
          </Pressable>
        );
      })}
    </View>
  );
}

function BmJourney({ stage, routes }) {
  const registered = stage === 'registered';
  const phaseId = currentPhaseId(PROGRAMS.BM100, !registered);
  return (
    <>
      {registered ? (
        <ProgressPanel
          kicker="Registered · pre-program"
          right="1 of 6 open"
          title="Onboarding"
          percent={5}
          foot="Part payment received · Onboarding is open now · Phases 1–4 unlock on enrollment"
        />
      ) : (
        <ProgressPanel
          kicker="Your progress"
          right="40%"
          title="Phase 2 of 4"
          percent={40}
          foot="Pitch & strategy · Weekly Q&A Thu 7:00 PM IST"
        />
      )}

      <ThisPhaseBlock programId={PROGRAMS.BM100} phaseId={phaseId} style={{ marginTop: 22 }} />

      <SectionLabel
        eyebrow="6 months"
        title="Your phases"
        sub={
          registered
            ? 'Onboarding is open now · the rest unlock on enrollment'
            : 'Weekly online cohort work, each phase with pre, live and post activities'
        }
      />
      <CoursePhaseList programId={PROGRAMS.BM100} enrolled={!registered} onLocked={routes.openPayment} />

      {registered ? (
        <>
          <SoftCard>
            <ILText role="bodySm" color={IL_BRAND.ink}>
              <ILText role="label">Why this order matters. </ILText>
              Foundation works from your Core Story and resume live in the room. Send both in before your cohort starts and the phase works for you, not on you.
            </ILText>
          </SoftCard>
          <EnrollCard
            title="Unlock Phases 1–4"
            body="Your seat is held with a part payment. Foundation, Pitch & Strategy, Board Ready, Challenges and Graduation open the day your balance is paid."
            onPress={routes.openPayment}
          />
        </>
      ) : (
        <BmPractice routes={routes} />
      )}
    </>
  );
}

function BmPractice({ routes }) {
  return (
    <>
      <SectionLabel title="Practice sessions" sub="3 of 9 complete" />
      <View style={{ flexDirection: 'row', flexWrap: 'wrap', marginTop: 10 }}>
        {[
          ['LinkedIn Optimization', true],
          ['ERRC Grid', true],
          ['SuperPower Statement', true],
          ['Mock Interview', false],
          ['Imperfect Brand Video', false],
          ['Walk to Board', false],
          ['+2 more', false],
        ].map(([label, done]) => (
          <Pill key={label} label={label} done={done} onPress={() => routes.openLearn('100bm')} />
        ))}
      </View>
    </>
  );
}

function BmSessions({ routes }) {
  const [saved, setSaved] = useState({});
  const toggle = (id) => setSaved((prev) => ({ ...prev, [id]: !prev[id] }));
  return (
    <>
      <SectionLabel
        title="Coming up"
        sub="Weekly online · Phase 2 · Pitch & strategy"
        action={saved.all ? 'Added' : 'Add all to calendar'}
        onAction={() => toggle('all')}
      />
      <SoftCard style={{ paddingVertical: 6 }}>
        <SessionRow
          badge={<DateBadge month="OCT" day="09" />}
          title="Weekly Q&A"
          detail="Thu 7:00 PM IST · live online · add a question first"
          action="Join"
          onAction={() => routes.openLearn('100bm')}
        />
        <SessionRow
          badge={<DateBadge month="OCT" day="11" />}
          title="Confidential intensive · Pitch & strategy"
          detail="Phase 2 core session · live online"
          action={saved.intensive ? 'Saved' : 'Remind me'}
          onAction={() => toggle('intensive')}
        />
        <SessionRow
          badge={<DateBadge month="OCT" day="14" />}
          title="Practice huddle · Imperfect Brand Video"
          detail="Small group · bring your draft"
          action={saved.huddle ? 'Added' : 'Add'}
          onAction={() => toggle('huddle')}
        />
      </SoftCard>
      <SectionLabel title="Done" sub="Recordings and your check-ins" />
      <SoftCard style={{ paddingVertical: 6 }}>
        <SessionRow
          badge={<DateBadge month="OCT" day="02" />}
          title="Weekly Q&A"
          detail="Attended · check-in saved"
          action="Recording"
          onAction={() => routes.openLearn('100bm')}
        />
        <SessionRow
          badge={<DateBadge month="SEP" day="27" />}
          title="Phase 1 · Foundation wrap-up"
          detail="Attended"
          action="Recording"
          onAction={() => routes.openLearn('100bm')}
        />
      </SoftCard>
    </>
  );
}

function BmCohort({ routes }) {
  const nav = useLepNav();
  return (
    <>
      <DarkPanel>
        <ILText role="eyebrow" color={IL_BRAND.redSoft} style={{ fontSize: 10 }}>
          Your cohort
        </ILText>
        <ILText role="displaySm" color="#FFFFFF" style={{ marginTop: 8 }}>
          100BM cohort · Oct 2026
        </ILText>
        <ILText role="bodySm" color={IL_BRAND.mutedOnDark} style={{ marginTop: 6 }}>
          18 women working toward board seats · fully online
        </ILText>
        <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
          <PeopleRow extra={14} />
          <Pressable onPress={routes.openEngage} accessibilityRole="button">
            <ILText role="label" color="#FFFFFF">
              WA group
            </ILText>
          </Pressable>
        </View>
      </DarkPanel>
      <SectionLabel title="Your practice huddle" sub="Small group · drills together" />
      <SoftCard>
        <ILText role="eyebrow" color={IL_BRAND.dim} style={{ fontSize: 10 }}>
          Every other week
        </ILText>
        <ILText role="title" style={{ marginTop: 6 }}>
          Practice huddle
        </ILText>
        <ILText role="bodySm" color={IL_BRAND.muted}>
          Rehearse your ask and your SuperPower Statement with the same four women.
        </ILText>
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', marginTop: 12 }}>
          {['SuperPower Statement', 'Mock Interview', 'Walk to Board'].map((label) => (
            <Pill key={label} label={label} />
          ))}
        </View>
        <BarButton label="Add next huddle" onPress={() => routes.setSection('Sessions')} />
      </SoftCard>
      <SectionLabel
        title="This week in your cohort"
        sub="From your WA group"
        action="Open group"
        onAction={routes.openEngage}
      />
      <SoftCard>
        <ILText role="label">5 women posted their Imperfect Brand Video</ILText>
        <ILText role="bodySm" color={IL_BRAND.muted}>
          Phase 2 drill · give one reply
        </ILText>
        <ILText role="label" style={{ marginTop: 12 }}>
          3 questions queued for Thursday’s Q&A
        </ILText>
        <ILText role="bodySm" color={IL_BRAND.muted}>
          Add yours
        </ILText>
        <ILText role="label" style={{ marginTop: 12 }}>
          Board ambitions shared: 14 of 18
        </ILText>
        <ILText role="bodySm" color={IL_BRAND.muted}>
          Yours: Independent director by 2028
        </ILText>
      </SoftCard>
      <ManagerCard onPress={() => nav.goManager(PROGRAMS.BM100)} />
    </>
  );
}

function MbwJourney({ stage, routes }) {
  const nav = useLepNav();
  const enrolled = stage === 'enrolled';
  if (stage === 'registered') {
    return (
      <>
        <ProgressPanel
          kicker="Preparation · week 5 of 12"
          right="8 weeks to Q1"
          title="Your preparation"
          percent={42}
          foot="One task a week, shared in your WA group · Quarters 1–4 unlock on enrollment"
        />

        <ThisPhaseBlock
          programId={PROGRAMS.MBW}
          phaseId={currentPhaseId(PROGRAMS.MBW, false)}
          style={{ marginTop: 22 }}
        />

        <SectionLabel
          eyebrow="52 weeks"
          title="Your year"
          sub="Pre-Preparation is open now · the four quarters unlock on enrollment"
        />
        <CoursePhaseList programId={PROGRAMS.MBW} enrolled={false} onLocked={routes.openPayment} />

        <EnrollCard
          title="Unlock Quarters 1–4"
          body="Your seat is held with a part payment. The four quarters, 16 Impact Champions sessions, 4 with Suvarna and Graduation open the day your balance is paid."
          onPress={routes.openPayment}
        />
      </>
    );
  }
  return (
    <>
      <ThisPhaseBlock
        programId={PROGRAMS.MBW}
        phaseId={currentPhaseId(PROGRAMS.MBW, true)}
        style={{ marginTop: 22 }}
      />
      <SectionLabel
        eyebrow="52 weeks"
        title="Your year"
        sub="A weekly deliverable in your WA group, 16 Impact Champions sessions and 4 with Suvarna."
      />
      <PhaseList
        rows={MBW_YEAR}
        pressFor={([, , title]) => {
          if (title === 'Preparation') return () => nav.goCoursePhase(PROGRAMS.MBW, 'pre-preparation');
          if (title.includes('Q1')) {
            return enrolled ? () => nav.goCoursePhase(PROGRAMS.MBW, 'quarter-1') : routes.openPayment;
          }
          if (title.includes('Q2')) {
            return enrolled ? () => nav.goCoursePhase(PROGRAMS.MBW, 'quarter-2') : routes.openPayment;
          }
          if (title.includes('Q3')) {
            return enrolled ? () => nav.goCoursePhase(PROGRAMS.MBW, 'quarter-3') : routes.openPayment;
          }
          if (title.includes('Q4')) {
            return enrolled ? () => nav.goCoursePhase(PROGRAMS.MBW, 'quarter-4') : routes.openPayment;
          }
          if (title.includes('Graduation') || title.includes('Closure')) {
            return enrolled ? () => nav.goCoursePhase(PROGRAMS.MBW, 'graduation') : routes.openPayment;
          }
          return enrolled ? undefined : routes.openPayment;
        }}
      />
      <SectionLabel title="Your C-Suite profile" sub="3 of 7 built" />
      <View style={{ flexDirection: 'row', flexWrap: 'wrap', marginTop: 10 }}>
        {[
          ['C-Suite Resume', true],
          ['LinkedIn profile', true],
          ['LinkedIn posts', true],
          ['C-Suite Story', false],
          ['Story video', false],
          ['Super Power Table', false],
          ['Video CV', false],
        ].map(([label, done]) => (
          <Pill key={label} label={label} done={done} onPress={() => routes.openLearn('mbw')} />
        ))}
      </View>
      <ILText role="bodySm" color={IL_BRAND.muted} style={{ marginTop: 8 }}>
        Progress reports at Weeks 12, 24 and 36.
      </ILText>
    </>
  );
}

function MbwSessions({ routes }) {
  const [saved, setSaved] = useState({});
  const mark = (id) => setSaved((prev) => ({ ...prev, [id]: true }));
  return (
    <>
      <SectionLabel
        title="Coming up in Q1"
        sub="16 Impact Champions sessions + 4 with Suvarna this year"
      />
      <SoftCard style={{ paddingVertical: 6 }}>
        <SessionRow
          badge="S2"
          title="Impact Champions: C-Suite Story Video"
          detail="After Week 4 · date in your schedule"
          action={saved.s2 ? 'Saved' : 'Remind me'}
          onAction={() => mark('s2')}
        />
        <SessionRow
          badge="Q1"
          title="Session with Suvarna — Strengthening your strengths"
          detail="After Week 6"
          action={saved.suv ? 'Added' : 'Add'}
          onAction={() => mark('suv')}
        />
        <SessionRow
          badge="S3"
          title="Impact Champions: Video CV and applying for a C-Suite role"
          detail="After Week 8"
          action={saved.s3 ? 'Added' : 'Add'}
          onAction={() => mark('s3')}
        />
        <SessionRow
          badge="S4"
          title="Impact Champions: Revisit super power"
          detail="After Week 10"
          action={saved.s4 ? 'Added' : 'Add'}
          onAction={() => mark('s4')}
        />
      </SoftCard>
      <SectionLabel title="Done" sub="Recordings and your check-ins" />
      <SoftCard style={{ paddingVertical: 6 }}>
        <SessionRow
          badge="S1"
          mutedBadge
          title="Impact Champions: LinkedIn Profile and Post"
          detail="Attended · check-in saved"
          action="Recording"
          onAction={() => routes.openLearn('mbw')}
        />
        <SessionRow
          badge="Prep"
          mutedBadge
          title="Preparation Session — Suvarna"
          detail="Attended"
          action="Recording"
          onAction={() => routes.openLearn('mbw')}
        />
        <SessionRow
          badge="Prep"
          mutedBadge
          title="Orientation Session — Rajesh"
          detail="Attended"
          action="Recording"
          onAction={() => routes.openLearn('mbw')}
        />
      </SoftCard>
    </>
  );
}

function MbwCohort({ routes }) {
  const nav = useLepNav();
  return (
    <>
      <DarkPanel>
        <ILText role="eyebrow" color={IL_BRAND.redSoft} style={{ fontSize: 10 }}>
          Your cohort
        </ILText>
        <ILText role="displaySm" color="#FFFFFF" style={{ marginTop: 8 }}>
          Your MBW circle
        </ILText>
        <ILText role="bodySm" color={IL_BRAND.mutedOnDark}>
          24 senior women leaders · one year together
        </ILText>
        <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
          <PeopleRow extra={20} />
          <Pressable onPress={routes.openEngage} accessibilityRole="button">
            <ILText role="label" color="#FFFFFF">
              WA group
            </ILText>
          </Pressable>
        </View>
      </DarkPanel>
      <SectionLabel title="This week’s deliverable" sub="Wk4 · C-Suite Story · shared in the group" />
      <SoftCard>
        <ILText role="label">You: 1 of 3</ILText>
        <ILText role="bodySm" color={IL_BRAND.muted}>
          9 of 24 have shared their 3 stories
        </ILText>
        <View style={{ height: 4, borderRadius: 2, backgroundColor: '#F3EFE8', marginTop: 12 }}>
          <View style={{ width: '33%', height: 4, borderRadius: 2, backgroundColor: IL_BRAND.red }} />
        </View>
        <BarButton label="Share story 2" onPress={() => nav.goCourseTask(PROGRAMS.MBW, 'q1-csuite-story')} />
      </SoftCard>
      <SectionLabel title="Your buddy" sub="For the practice weeks" />
      <SoftCard>
        <ILText role="label">Buddy practice</ILText>
        <ILText role="bodySm" color={IL_BRAND.muted}>
          Pitch rejection (Wk16), C-Suite Talk (Wk23), influencing role play (Wk31)
        </ILText>
      </SoftCard>
      <SectionLabel
        title="In your circle"
        sub="From your WA group"
        action="Open group"
        onAction={routes.openEngage}
      />
      <SoftCard>
        <ILText role="label">4 LinkedIn posts shared this week</ILText>
        <ILText role="bodySm" color={IL_BRAND.muted}>
          Wk3 task · 2 powerful posts
        </ILText>
        <ILText role="label" style={{ marginTop: 12 }}>
          Your C-Suite Talk topic was reviewed
        </ILText>
        <ILText role="bodySm" color={IL_BRAND.muted}>
          Prep session 10 days before the talk
        </ILText>
        <ILText role="label" style={{ marginTop: 12 }}>
          Session 1 attendance: 22 of 24
        </ILText>
        <ILText role="bodySm" color={IL_BRAND.muted}>
          Recording in Sessions
        </ILText>
      </SoftCard>
      <ManagerCard onPress={() => nav.goManager(PROGRAMS.MBW)} />
    </>
  );
}

function ManagerCard({ onPress }) {
  return (
    <SoftCard>
      <View style={{ flexDirection: 'row', alignItems: 'center' }}>
        <View
          style={{
            width: 40,
            height: 40,
            borderRadius: 20,
            backgroundColor: IL_BRAND.forest,
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <MaterialIcons name="support-agent" size={20} color="#FFFFFF" />
        </View>
        <View style={{ flex: 1, marginLeft: 12 }}>
          <ILText role="label">Your Program Manager</ILText>
          <ILText role="bodySm" color={IL_BRAND.muted}>
            Attendance, schedule changes and anything about your seat
          </ILText>
        </View>
        <Pressable onPress={onPress} accessibilityRole="button" hitSlop={8}>
          <ILText role="label" color={IL_BRAND.red}>
            Message
          </ILText>
        </Pressable>
      </View>
    </SoftCard>
  );
}

const PROGRAM_CARD = {
  lep: {
    title: 'Leadership Essentials program (LEP)',
    enrolled: { kicker: 'Enrolled · live now', sub: 'Batch 42 · Phase 4 of 11 · Day 2 on Sun 21 Sep', pct: 36 },
    registered: { kicker: 'Registered · starts 20 Sep', sub: 'Pre-program · CoDeSeF Sheet due Thu', pct: 8 },
    completed: { kicker: 'Completed · certified', sub: 'All 27 principles · certificate in Profile', pct: 100 },
  },
  '100bm': {
    title: '100 Board Members (100BM)',
    enrolled: { kicker: 'Enrolled · Phase 2 of 4', sub: 'Pitch & Strategy · Post-Session on Pitch due Thu', pct: 40 },
    registered: { kicker: 'Registered · opens 3 Oct', sub: 'Pre-program · Brand creation video by 2 Oct', pct: 12 },
  },
  mbw: {
    title: 'Master of Business Warfare (MBW)',
    enrolled: { kicker: 'Enrolled · Q1 · Week 4 of 52', sub: 'C-Suite Profile · C-Suite Story due Thu', pct: 18 },
    registered: { kicker: 'Registered · Preparation week 5 of 12', sub: 'Quarters 1–4 unlock on enrollment', pct: 42 },
  },
};

const STATE_RANK = { enrolled: 0, registered: 1, completed: 2 };

/** The member's programs first. Programs they are not in stay on the list, locked. */
function usePrograms() {
  const { profile } = useAuth();
  const lab = PROGRAM_CARD[profile?.labProgram] ? profile.labProgram : null;
  const ids = getEnrolledProgramIds(profile);
  if (lab) ids.add(lab);
  return ['lep', '100bm', 'mbw']
    .filter((id) => PROGRAM_CARD[id])
    .map((id) => {
      const locked = !ids.has(id);
      const state = locked
        ? 'locked'
        : id === 'lep' && lab && lab !== 'lep'
          ? 'completed'
          : programStage(profile, id);
      return { id, state, locked };
    })
    .sort((a, b) => {
      if (a.locked !== b.locked) return a.locked ? 1 : -1;
      return (STATE_RANK[a.state] ?? 9) - (STATE_RANK[b.state] ?? 9);
    });
}

function ProgramCard({ id, state, lead, locked, onPress }) {
  const card = PROGRAM_CARD[id];
  const copy = locked
    ? { kicker: 'Locked', sub: 'Not linked to this number', pct: 0 }
    : card[state] || card.enrolled;
  const Shell = !locked && lead ? DarkPanel : SoftCard;
  return (
    <Pressable
      onPress={locked ? undefined : onPress}
      disabled={locked}
      accessibilityRole="button"
      accessibilityState={{ disabled: locked }}
      style={{ opacity: locked ? 0.55 : 1 }}
    >
      <Shell>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
          <ILText role="eyebrow" color={lead ? IL_BRAND.redSoft : IL_BRAND.red} style={{ fontSize: 10 }}>
            {copy.kicker}
          </ILText>
          <MaterialIcons
            name={locked ? 'lock' : 'chevron-right'}
            size={22}
            color={!locked && lead ? '#FFFFFF' : IL_BRAND.dim}
          />
        </View>
        <ILText role="title" color={lead ? '#FFFFFF' : undefined} style={{ marginTop: 8 }}>
          {card.title}
        </ILText>
        <ILText role="bodySm" color={lead ? IL_BRAND.mutedOnDark : IL_BRAND.muted} style={{ marginTop: 6 }}>
          {copy.sub}
        </ILText>
        <View
          style={{
            height: 4,
            borderRadius: 2,
            backgroundColor: lead ? 'rgba(255,255,255,0.16)' : '#F3EFE8',
            marginTop: 12,
          }}
        >
          <View
            style={{
              width: `${copy.pct}%`,
              height: 4,
              borderRadius: 2,
              backgroundColor: state === 'registered' ? IL_BRAND.gold : state === 'completed' ? IL_BRAND.paidGreen : IL_BRAND.red,
            }}
          />
        </View>
      </Shell>
    </Pressable>
  );
}

function MultiPrograms({ routes }) {
  const programs = usePrograms();
  const combo =
    programs.some((p) => p.id === 'lep' && p.state === 'enrolled') &&
    programs.some((p) => p.id === '100bm' && p.state === 'registered');
  return (
    <>
      <ILText role="bodySm" color={IL_BRAND.muted} style={{ marginTop: 12 }}>
        The one that needs you first is on top. Tap a program for its journey, sessions and cohort.
      </ILText>
      {programs.map((p) => (
        <ProgramCard
          key={p.id}
          {...p}
          lead={!p.locked && p.id === programs.find((item) => !item.locked)?.id}
          onPress={() => routes.setProgram(p.id)}
        />
      ))}
      {combo ? <ComboTimeline /> : null}
      <LinkRow
        icon="workspace-premium"
        title="Carried over"
        sub="Masterclass (MC) · completed · certificate in Profile"
        onPress={routes.openCertificates}
      />
    </>
  );
}

function ComboTimeline() {
  return (
      <SoftCard>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
          <ILText role="eyebrow" color={IL_BRAND.red} style={{ fontSize: 10 }}>
            How your two programs fit
          </ILText>
          <ILText role="bodySm" color={IL_BRAND.muted}>
            Sep – Oct
          </ILText>
        </View>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginTop: 14 }}>
          {['15 Sep', '29 Sep', '13 Oct', '27 Oct'].map((date) => (
            <ILText key={date} role="bodySm" color={IL_BRAND.dim} style={{ fontSize: 11 }}>
              {date}
            </ILText>
          ))}
        </View>
        {[
          ['LEP', 2, 5, IL_BRAND.forest],
          ['100BM', 4, 6, IL_BRAND.red],
        ].map(([label, before, span, color]) => (
          <View key={label} style={{ flexDirection: 'row', alignItems: 'center', marginTop: 12 }}>
            <ILText role="label" style={{ width: 52 }}>
              {label}
            </ILText>
            <View style={{ flex: 1, height: 8, borderRadius: 4, backgroundColor: '#F3EFE8', flexDirection: 'row' }}>
              <View style={{ flex: before }} />
              <View style={{ flex: span, borderRadius: 4, backgroundColor: color }} />
              <View style={{ flex: Math.max(10 - before - span, 1) }} />
            </View>
          </View>
        ))}
        <View style={{ flexDirection: 'row', marginTop: 14, gap: 8 }}>
          {[
            ['LEP', 'Day 1 & 2', '20–21 Sep'],
            ['100BM', 'Onboarding', '3 Oct'],
            ['LEP', 'Certificate', '~18 Oct'],
          ].map(([tag, title, when]) => (
            <View key={title} style={{ flex: 1, backgroundColor: '#F6F2EA', borderRadius: 12, padding: 8 }}>
              <ILText role="eyebrow" color={tag === '100BM' ? IL_BRAND.red : IL_BRAND.forest} style={{ fontSize: 9 }}>
                {tag}
              </ILText>
              <ILText role="label" style={{ fontSize: 12, marginTop: 4 }}>
                {title}
              </ILText>
              <ILText role="bodySm" color={IL_BRAND.muted} style={{ fontSize: 11 }}>
                {when}
              </ILText>
            </View>
          ))}
        </View>
        <View style={{ marginTop: 12, backgroundColor: '#FDECEC', borderRadius: 12, padding: 12 }}>
          <ILText role="bodySm" color={IL_BRAND.ink}>
            3–18 Oct: both running. One Today list, one daily revision and at most 2 reminders a day. After the LEP certificate, 100BM leads.
          </ILText>
        </View>
      </SoftCard>
  );
}

export default function ProgramJourneys({ program, stage, lepBody }) {
  const routes = useProgramRoutes();
  const title =
    program === 'all'
      ? 'Your programs'
      : program === 'mbw'
        ? 'Master of Business Warfare'
        : program === 'lep'
          ? 'Leadership Essentials program'
          : '100 Board Members';

  return (
    <ProgramPage>
      <ILText role="eyebrow" color={IL_BRAND.red} style={{ marginTop: 6 }}>
        My Program
      </ILText>
      <ILText role="displaySm" style={{ marginTop: 8 }}>
        {title}
      </ILText>
      <FilterPills />
      {program === 'all' ? (
        <MultiPrograms routes={routes} />
      ) : (
        <>
          <SectionTabs />
          {program === 'lep' ? (
            lepBody
          ) : program === '100bm' ? (
            routes.section === 'Sessions' ? (
              <BmSessions routes={routes} />
            ) : routes.section === 'Cohort' ? (
              <BmCohort routes={routes} />
            ) : (
              <BmJourney stage={stage} routes={routes} />
            )
          ) : routes.section === 'Sessions' ? (
            <MbwSessions routes={routes} />
          ) : routes.section === 'Cohort' ? (
            <MbwCohort routes={routes} />
          ) : (
            <MbwJourney stage={stage} routes={routes} />
          )}
        </>
      )}
    </ProgramPage>
  );
}

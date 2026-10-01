import React, { useState } from 'react';
import { Pressable, View } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { IL_BRAND } from '../../constants/ironLadyBrand';
import ILText from '../../components/il/ILText';
import { useProgramRoutes } from '../../context/ProgramNavContext';
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

const BM_PHASES = [
  ['done', 'Onboarding', 'Core story · milestone table', 'Brand video, Milestone Table and resume reviewed'],
  ['done', 'Phase 1', 'Foundation', 'Board-member image, brand video, resume'],
  ['now', 'Phase 2 · now', 'Pitch & strategy', 'Pitching and influencing, and mid-level politics'],
  ['later', 'Phase 3', 'Board ready', 'Strategic outlook, strategy review, mock interview'],
  ['later', 'Phase 4', 'Challenges', 'Walk to Board, LinkedIn video, Speak like a CEO'],
  ['later', 'Graduation', 'Your speech video', ''],
];

const BM_PRE = [
  ['now', 'Pre-program · now', 'Brand creation video', 'Your Core Story, 2–3 minutes on camera'],
  ['later', 'Pre-program', 'Milestone Table practice', 'Draft the milestones you will present at Onboarding'],
  ['later', 'Pre-program', 'Resume preparation', 'Bring a current draft — you will rework it in Phase 1'],
];

const BM_AHEAD = [
  ['later', 'Phase 1', 'Foundation', 'Board-member image, brand video, resume'],
  ['later', 'Phase 2', 'Pitch & Strategy', 'Pitching, influencing and mid-level politics'],
  ['later', 'Phase 3', 'Board Ready', 'Strategic outlook, strategy review, mock interview'],
  ['later', 'Phase 4', 'Challenges', 'Walk to Board, LinkedIn video, Speak like a CEO'],
  ['later', 'Graduation', 'Your speech video', ''],
];

const MBW_PREP = [
  ['done', 'Session by Rajesh', 'Orientation Session', ''],
  ['done', 'Wk1–12', '27 Principles video', 'Submit 3 key learnings'],
  ['done', 'Wk1–11', 'C-Suite Talk — topic finalization', 'Submit your topic for review'],
  ['done', 'Wk1–10', 'ERRC — watch video', '3 things you’ll change to maximise your time'],
  ['done', 'Wk1–9', 'LinkedIn update', 'Share your final updated profile'],
  ['now', 'Wk1–8 · this week', 'LinkedIn % connects', 'Share the connection increase'],
  ['later', 'Wk1–7', 'Objectives', 'Share key objectives in the group'],
  ['later', 'Wk1–6', 'Resume updation', 'Share your final resume'],
  ['later', 'Wk1–5', 'Mirror practice', 'Share a short video of your mirror practice'],
  ['later', 'Session by Suvarna', 'Preparation Session', ''],
  ['later', 'Wk1–4', 'Your commitment for the session', 'A short video on your commitment to growth'],
  ['later', 'Wk1–3', 'LEP Rituals', 'Daily updates: Mirror Work, A-Game, Powerful Request'],
  ['later', 'Wk1–2', 'LinkedIn post', '2 LinkedIn posts in the week'],
  ['later', 'Wk1–1', 'Revisit and get ready', 'C-Suite Talk prep session — 10 days ahead'],
];

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

function PhaseList({ rows, onPress }) {
  return (
    <SoftCard style={{ padding: 0, overflow: 'hidden' }}>
      {rows.map(([state, kicker, title, detail, note], index) => (
        <PhaseRow
          key={`${kicker}-${title}`}
          state={state}
          kicker={kicker}
          title={title}
          detail={detail}
          note={note}
          last={index === rows.length - 1}
          onPress={onPress}
        />
      ))}
    </SoftCard>
  );
}

function BmJourney({ stage, routes }) {
  if (stage === 'registered') {
    return (
      <>
        <DarkPanel>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
            <ILText role="eyebrow" color={IL_BRAND.redSoft} style={{ fontSize: 10 }}>
              Registered · pre-program
            </ILText>
            <ILText role="eyebrow" color="#FFFFFF" style={{ fontSize: 10 }}>
              0 of 3 done
            </ILText>
          </View>
          <ILText role="displaySm" color="#FFFFFF" style={{ marginTop: 8 }}>
            Before your first session
          </ILText>
          <ILText role="bodySm" color={IL_BRAND.mutedOnDark} style={{ marginTop: 8 }}>
            Three things Iron Lady needs from you — not your batch leader. Onboarding opens once enrolment is complete.
          </ILText>
        </DarkPanel>
        <PhaseList rows={BM_PRE} onPress={() => routes.openLearn('100bm')} />
        <SectionLabel title="What’s ahead" sub="4 phases + Graduation" />
        <PhaseList rows={BM_AHEAD} onPress={() => routes.openLearn('100bm')} />
        <SoftCard>
          <ILText role="bodySm" color={IL_BRAND.ink}>
            Why this order matters. Foundation works from your Core Story and resume live in the room. Send both in before your cohort starts and the phase works for you, not on you.
          </ILText>
        </SoftCard>
      </>
    );
  }
  return (
    <>
      <DarkPanel>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
          <ILText role="eyebrow" color={IL_BRAND.redSoft} style={{ fontSize: 10 }}>
            Your progress
          </ILText>
          <ILText role="eyebrow" color="#FFFFFF" style={{ fontSize: 10 }}>
            1 of 4 phases
          </ILText>
        </View>
        <ILText role="displaySm" color="#FFFFFF" style={{ marginTop: 8 }}>
          Phase 2 of 4
        </ILText>
        <View style={{ height: 4, borderRadius: 2, backgroundColor: 'rgba(255,255,255,0.16)', marginTop: 14 }}>
          <View style={{ width: '40%', height: 4, borderRadius: 2, backgroundColor: IL_BRAND.red }} />
        </View>
        <ILText role="bodySm" color={IL_BRAND.mutedOnDark} style={{ marginTop: 10 }}>
          Pitch & strategy · Weekly Q&A Thu 7:00 PM IST
        </ILText>
      </DarkPanel>
      <SectionLabel
        title="Your phases"
        sub="Weekly online cohort work, each phase with pre, live and post activities"
      />
      <PhaseList rows={BM_PHASES} onPress={() => routes.setSection('Sessions')} />
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
      <ManagerCard onPress={routes.openEngage} />
    </>
  );
}

function MbwJourney({ stage, routes }) {
  if (stage === 'registered') {
    return (
      <>
        <DarkPanel>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
            <ILText role="eyebrow" color={IL_BRAND.redSoft} style={{ fontSize: 10 }}>
              Preparation · week 5 of 12
            </ILText>
            <ILText role="eyebrow" color="#FFFFFF" style={{ fontSize: 10 }}>
              8 weeks to Q1
            </ILText>
          </View>
          <ILText role="displaySm" color="#FFFFFF" style={{ marginTop: 8 }}>
            Your preparation
          </ILText>
          <View style={{ height: 4, borderRadius: 2, backgroundColor: 'rgba(255,255,255,0.16)', marginTop: 14 }}>
            <View style={{ width: '42%', height: 4, borderRadius: 2, backgroundColor: IL_BRAND.red }} />
          </View>
          <ILText role="bodySm" color={IL_BRAND.mutedOnDark} style={{ marginTop: 10 }}>
            One task a week, shared in your WA group.
          </ILText>
        </DarkPanel>
        <PhaseList rows={MBW_PREP} onPress={() => routes.openLearn('mbw')} />
      </>
    );
  }
  return (
    <>
      <SectionLabel
        eyebrow="52 weeks"
        title="Your year"
        sub="A weekly deliverable in your WA group, 16 Impact Champions sessions and 4 with Suvarna."
      />
      <PhaseList rows={MBW_YEAR} onPress={() => routes.setSection('Sessions')} />
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
        <BarButton label="Share story 2 in the group" onPress={routes.openEngage} />
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
      <ManagerCard onPress={routes.openEngage} />
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

function MultiPrograms({ routes }) {
  return (
    <>
      <ILText role="bodySm" color={IL_BRAND.muted} style={{ marginTop: 12 }}>
        The one that needs you first is on top. Tap a program for its journey, sessions and cohort.
      </ILText>
      <Pressable onPress={() => routes.setProgram('lep')} accessibilityRole="button">
        <DarkPanel>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
            <ILText role="eyebrow" color={IL_BRAND.redSoft} style={{ fontSize: 10 }}>
              Enrolled · live now
            </ILText>
            <MaterialIcons name="chevron-right" size={22} color="#FFFFFF" />
          </View>
          <ILText role="title" color="#FFFFFF" style={{ marginTop: 8 }}>
            Leadership Essentials program (LEP)
          </ILText>
          <ILText role="bodySm" color={IL_BRAND.mutedOnDark} style={{ marginTop: 6 }}>
            Batch 42 · Phase 4 of 11 · Day 2 on Sun 21 Sep
          </ILText>
          <View style={{ height: 4, borderRadius: 2, backgroundColor: 'rgba(255,255,255,0.16)', marginTop: 12 }}>
            <View style={{ width: '36%', height: 4, borderRadius: 2, backgroundColor: IL_BRAND.red }} />
          </View>
        </DarkPanel>
      </Pressable>
      <Pressable onPress={() => routes.setProgram('100bm')} accessibilityRole="button">
        <SoftCard>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
            <ILText role="eyebrow" color={IL_BRAND.red} style={{ fontSize: 10 }}>
              Registered · opens 3 Oct
            </ILText>
            <MaterialIcons name="chevron-right" size={22} color={IL_BRAND.dim} />
          </View>
          <ILText role="title" style={{ marginTop: 8 }}>
            100 Board Members (100BM)
          </ILText>
          <ILText role="bodySm" color={IL_BRAND.muted} style={{ marginTop: 6 }}>
            Pre-program · Brand creation video by 2 Oct
          </ILText>
          <View style={{ height: 4, borderRadius: 2, backgroundColor: '#F3EFE8', marginTop: 12 }}>
            <View style={{ width: '12%', height: 4, borderRadius: 2, backgroundColor: IL_BRAND.gold }} />
          </View>
        </SoftCard>
      </Pressable>
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
      <LinkRow
        icon="workspace-premium"
        title="Carried over"
        sub="Masterclass (MC) · completed · certificate in Profile"
        onPress={routes.openCertificates}
      />
    </>
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

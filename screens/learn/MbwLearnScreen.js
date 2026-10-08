import React, { useState } from 'react';
import { ScrollView, View } from 'react-native';
import Pressable from '../../components/il/Press';
import { StatusBar } from 'expo-status-bar';
import { MaterialIcons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { IL_FONTS } from '../../constants/ironLadyBrand';
import ILText from '../../components/il/ILText';
import { G, af } from '../../constants/guestTheme';
import { LIQUID_TAB_PAD } from '../../components/il/LiquidTabBar';
import { useGlassHeaderPad } from '../../components/il/GlassHeader';
import { useAuth } from '../../context/AuthContext';
import { useProgramNav } from '../../context/ProgramNavContext';
import { LepHeader, Page, PillRow, SectionHead, WhiteCard } from '../lep/LepBits';
import { useLepNav } from '../lep/useLepNav';
import { PROGRAMS } from '../../constants/programs';

const CHIPS = ['For you', 'Principles', 'Case studies', 'Practice drills', 'C-suite & podcasts'];

const PRINCIPLES = [
  { n: '01', title: 'The 27 Principles', meta: 'Wk1–12 · submit 3 key learnings', open: true, taskId: 'mbw-principles' },
  { n: '02', title: 'ERRC — maximise your time', meta: '3 things you will change', open: true, taskId: 'mbw-errc' },
  { n: '03', title: 'LEP Rituals', meta: 'Mirror Work, A-Game, Powerful Request', open: false, taskId: 'mbw-lep' },
  { n: '04', title: 'Super Power Table', meta: 'Revisit after Week 10', open: false },
  { n: '05', title: 'Business language on the floor', meta: 'Q1 · C-Suite profile', open: false },
];

const CASES = [
  { title: 'Winning Ways for Women', meta: 'Indra Nooyi · former CEO, PepsiCo', open: true },
  { title: 'C-Suite Story — three versions', meta: 'Same hour, three rooms', open: false },
  { title: 'From factory floor to the suite', meta: 'Impact Champion · 18 min', open: false },
  { title: 'The 11×11 Mission', meta: 'Healthcare · 16 min', open: false },
];

const DRILLS = [
  { title: 'LinkedIn % connects', meta: 'Share the increase in the group', open: true, taskId: 'mbw-linkedin-profile' },
  { title: 'Mirror practice', meta: 'Short video of your mirror work', open: true, phaseId: 'pre-preparation' },
  { title: 'Resume updation', meta: 'Share your final C-Suite resume', open: false },
  { title: 'C-Suite Story', meta: '1 of 3 stories shared', open: false },
  { title: 'Video CV', meta: 'Apply for a C-Suite role', open: false },
  { title: 'Milestone Table', meta: 'Progress at Weeks 12, 24, 36', open: false },
];

const CSUITE = [
  { title: 'Winning Ways for Women', meta: 'Podcast · Indra Nooyi', open: true, assetKey: 'mbw:indra' },
  { title: 'Impact Champions: LinkedIn Profile and Post', meta: 'S1 recording', open: true, taskId: 'q1-session1' },
  { title: 'Impact Champions: C-Suite Story Video', meta: 'S2 · after Week 4', open: false, taskId: 'q1-session2' },
  { title: 'Session with Suvarna — Strengthening your strengths', meta: 'After Week 6', open: false, taskId: 'q1-suvarna-session' },
  { title: 'Your C-Suite Talk', meta: 'Prep session 10 days before', open: false, taskId: 'mbw-csuite' },
];

const FRESH = [
  ['ERRC — watch the video', '3 things you’ll change to maximise your time', '16 mins'],
  ['LinkedIn % connects', 'Share the connection increase in the group', '11 mins'],
  ['Your C-Suite Talk', 'Topic submitted · prep session 10 days before', '14 mins'],
];

export default function MbwLearnScreen() {
  const { profile } = useAuth();
  const { stage } = useProgramNav();
  const insets = useSafeAreaInsets();
  const headerPad = useGlassHeaderPad();
  const nav = useLepNav();
  const enrolled = stage === 'enrolled';
  const [chip, setChip] = useState('For you');
  const openCourse = (item) => {
    if (item?.assetKey) {
      nav.goWatch({ assetKey: item.assetKey, title: item.title, sub: item.meta });
      return;
    }
    if (item?.taskId) nav.goCourseTask(PROGRAMS.MBW, item.taskId);
    else nav.goCoursePhase(PROGRAMS.MBW, item?.phaseId || 'pre-preparation');
  };

  return (
    <Page>
      <StatusBar style="dark" />
      <LepHeader
        floating
        photoUrl={profile?.photoURL}
        onNotifications={nav.goNotifications}
        onProfile={nav.goProfile}
      />
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{
          paddingTop: headerPad + 4,
          paddingHorizontal: 20,
          paddingBottom: LIQUID_TAB_PAD + Math.max(insets.bottom, 8),
        }}
      >
        <Head chip={chip} enrolled={enrolled} />
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginTop: 16 }}>
          <PillRow items={CHIPS} value={chip} onChange={setChip} />
        </ScrollView>

        {chip === 'Principles' ? (
          <ListPane
            kicker="Foundation through Q1"
            title="Principles"
            items={PRINCIPLES.map((p) => ({
              title: `${p.n}  ${p.title}`,
              meta: p.meta,
              open: enrolled || p.open,
              taskId: p.taskId,
              phaseId: p.phaseId,
            }))}
            enrolled={enrolled}
            onEnroll={nav.goEnroll}
            onOpen={openCourse}
            gateTitle="Open the full MBW year"
            gateBody="The rest of the principles run with your weekly WA deliverable."
          />
        ) : chip === 'Case studies' ? (
          <ListPane
            kicker="Told by women who ran them"
            title="Case studies"
            items={CASES.map((c) => ({ ...c, open: enrolled || c.open }))}
            enrolled={enrolled}
            onEnroll={nav.goEnroll}
            onOpen={openCourse}
            gateTitle="Open all case studies"
            gateBody="C-Suite stories and Impact Champion rooms unlock with enrollment."
          />
        ) : chip === 'Practice drills' ? (
          <ListPane
            kicker="One task a week in your WA group"
            title="Practice drills"
            items={DRILLS.map((d) => ({ ...d, open: enrolled || d.open }))}
            enrolled={enrolled}
            onEnroll={nav.goEnroll}
            onOpen={openCourse}
            gateTitle="Open every weekly drill"
            gateBody="LinkedIn, story, resume and Video CV land in step with the year."
          />
        ) : chip === 'C-suite & podcasts' ? (
          <ListPane
            kicker="Impact Champions + Suvarna"
            title="C-suite & podcasts"
            items={CSUITE.map((c) => ({ ...c, open: enrolled || c.open }))}
            enrolled={enrolled}
            onEnroll={nav.goEnroll}
            onOpen={openCourse}
            gateTitle="Open the live year"
            gateBody="16 Impact Champions sessions and 4 with Suvarna this year."
          />
        ) : (
          <ForYou enrolled={enrolled} onEnroll={nav.goEnroll} onOpen={openCourse} />
        )}
      </ScrollView>
    </Page>
  );
}

const HEAD = {
  registered: {
    'For you': {
      title: 'MBW Learn',
      badge: 'MBW REGISTERED',
      sub: 'Week 4 preview is open · principles, drills and C-suite rooms unlock on enrollment',
    },
    Principles: {
      title: 'Principles',
      badge: '2 OPEN',
      sub: '27 Principles and ERRC are open. The rest of the year unlocks when you enroll.',
    },
    'Case studies': {
      title: 'Case studies',
      badge: '1 OPEN',
      sub: 'One C-suite case is open. Impact Champion rooms open with enrollment.',
    },
    'Practice drills': {
      title: 'Practice drills',
      badge: '2 OPEN',
      sub: 'This week’s LinkedIn and mirror work are open. The rest of the drills wait on enrollment.',
    },
    'C-suite & podcasts': {
      title: 'C-suite & podcasts',
      badge: '2 OPEN',
      sub: 'Indra Nooyi and the S1 recording are open. Live sessions open when you enroll.',
    },
  },
  enrolled: {
    'For you': {
      title: 'MBW Learn',
      badge: 'Q1 · WEEK 4',
      sub: 'C-Suite Story this week · 1 of 3 shared',
    },
    Principles: {
      title: 'Principles',
      badge: 'YEAR TRACK',
      sub: 'Foundation through Q1, then Influence and Command with your cohort.',
    },
    'Case studies': {
      title: 'Case studies',
      badge: 'COHORT',
      sub: 'C-Suite stories and Impact Champion rooms for your year.',
    },
    'Practice drills': {
      title: 'Practice drills',
      badge: 'WEEKLY',
      sub: 'One deliverable a week in your WA group.',
    },
    'C-suite & podcasts': {
      title: 'C-suite & podcasts',
      badge: 'LIVE YEAR',
      sub: '16 Impact Champions sessions and 4 with Suvarna.',
    },
  },
};

function Head({ chip, enrolled }) {
  const copy = (enrolled ? HEAD.enrolled : HEAD.registered)[chip] || HEAD.registered['For you'];
  return (
    <>
      <View style={{ flexDirection: 'row', alignItems: 'flex-end', justifyContent: 'space-between' }}>
        <ILText
          role="display"
          color={G.ink}
          style={{ flexShrink: 1, fontFamily: IL_FONTS.display, fontSize: 32, lineHeight: 38 }}
        >
          {copy.title}
        </ILText>
        <View
          style={{
            marginLeft: 8,
            backgroundColor: G.mutedFill,
            borderRadius: 999,
            paddingHorizontal: 10,
            paddingVertical: 5,
          }}
        >
          <ILText role="eyebrow" color={G.ink} style={[af, { fontSize: 9, letterSpacing: 0.8 }]}>
            {copy.badge}
          </ILText>
        </View>
      </View>
      <ILText role="bodySm" color={G.meta} style={{ marginTop: 8, fontSize: 13, lineHeight: 18 }}>
        {copy.sub}
      </ILText>
    </>
  );
}

function ForYou({ enrolled, onEnroll, onOpen }) {
  return (
    <>
      <WhiteCard style={{ marginTop: 18, borderRadius: 22, padding: 16, backgroundColor: G.dark }}>
        <ILText role="eyebrow" color="#FFFFFF" style={[af, { fontSize: 10 }]}>
          This week’s must-watch · MBW
        </ILText>
        <View
          style={{
            marginTop: 16,
            width: 54,
            height: 54,
            borderRadius: 27,
            backgroundColor: G.cta,
            alignItems: 'center',
            justifyContent: 'center',
            alignSelf: 'center',
          }}
        >
          <MaterialIcons name="play-arrow" size={32} color="#FFFFFF" />
        </View>
        <ILText role="eyebrow" color={G.pink} style={{ fontSize: 10, marginTop: 16 }}>
          Curated with Rajesh
        </ILText>
        <ILText role="title" color="#FFFFFF" style={{ marginTop: 6 }}>
          Winning Ways for Women
        </ILText>
        <ILText role="bodySm" color="rgba(255,255,255,0.72)" style={{ marginTop: 6 }}>
          Indra Nooyi · former CEO, PepsiCo. Notice how she opens — then write story 2.
        </ILText>
      </WhiteCard>

      <View style={{ marginTop: 26 }}>
        <SectionHead title="Continue watching" accent="Week 4 in progress" />
      </View>
      {[
        { title: '27 Principles video', meta: 'Submit 3 key learnings', left: '9m left', taskId: 'mbw-principles' },
        { title: 'C-Suite Story', meta: '1 of 3 stories shared', left: '10 min', phaseId: 'pre-preparation' },
      ].map((item) => (
        <Pressable key={item.title} onPress={() => onOpen?.(item)}>
        <WhiteCard
          style={{ marginTop: 10, borderRadius: 20, padding: 14, flexDirection: 'row', alignItems: 'center' }}
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
            <MaterialIcons name="play-arrow" size={22} color={G.cta} />
          </View>
          <View style={{ flex: 1, marginLeft: 12 }}>
            <ILText role="label" color={G.ink}>
              {item.title}
            </ILText>
            <ILText role="bodySm" color={G.meta} style={{ marginTop: 3, fontSize: 12 }}>
              {item.meta}
            </ILText>
          </View>
          <ILText role="label" color={G.cta} style={{ fontSize: 12 }}>
            {item.left}
          </ILText>
        </WhiteCard>
        </Pressable>
      ))}

      <View style={{ marginTop: 26 }}>
        <SectionHead title="Fresh this month" />
      </View>
      {FRESH.map(([title, by, mins], index) => {
        const shut = !enrolled && index > 0;
        return (
          <Pressable
            key={title}
            onPress={shut ? onEnroll : () => onOpen?.({ phaseId: 'pre-preparation' })}
          >
          <WhiteCard
            style={{
              marginTop: 10,
              borderRadius: 20,
              padding: 14,
              flexDirection: 'row',
              alignItems: 'center',
              opacity: shut ? 0.62 : 1,
            }}
          >
            <View
              style={{
                width: 44,
                height: 44,
                borderRadius: 14,
                backgroundColor: shut ? G.mutedFill : G.dark,
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <MaterialIcons name={shut ? 'lock-outline' : 'play-arrow'} size={20} color={shut ? G.meta : '#FFFFFF'} />
            </View>
            <View style={{ flex: 1, marginLeft: 12 }}>
              <ILText role="label" color={G.ink}>
                {title}
              </ILText>
              <ILText role="bodySm" color={G.meta} style={{ marginTop: 3, fontSize: 12 }}>
                {by} · {mins}
              </ILText>
            </View>
            <MaterialIcons name={shut ? 'lock-outline' : 'bookmark-border'} size={18} color={G.meta} />
          </WhiteCard>
          </Pressable>
        );
      })}

      {enrolled ? null : (
        <GateCard
          title="Unlock the MBW year"
          body="The preview above is open. Principles, drills and live C-suite rooms open once the seat is paid."
          onPress={onEnroll}
        />
      )}
    </>
  );
}

function ListPane({ kicker, title, items, enrolled, onEnroll, onOpen, gateTitle, gateBody }) {
  const open = items.filter((i) => i.open);
  const shut = items.filter((i) => !i.open);
  return (
    <>
      <ILText role="bodySm" color={G.meta} style={{ marginTop: 18, fontSize: 13 }}>
        {kicker}
      </ILText>
      {open.length ? (
        <View style={{ marginTop: 16 }}>
          <SectionHead title={enrolled ? title : 'Open to you'} accent={`${open.length}`} />
        </View>
      ) : null}
      {open.map((item) => (
        <Row key={item.title} item={item} onPress={() => onOpen?.(item)} />
      ))}
      {shut.length ? (
        <>
          <View style={{ marginTop: 26 }}>
            <SectionHead title="Opens on enrollment" accent={`${shut.length}`} />
          </View>
          {shut.map((item) => (
            <Row key={item.title} item={item} locked onPress={onEnroll} />
          ))}
        </>
      ) : null}
      {enrolled ? null : <GateCard title={gateTitle} body={gateBody} onPress={onEnroll} />}
    </>
  );
}

function Row({ item, locked, onPress }) {
  return (
    <Pressable onPress={onPress}>
    <WhiteCard
      style={{
        marginTop: 10,
        borderRadius: 20,
        padding: 14,
        flexDirection: 'row',
        alignItems: 'center',
        opacity: locked ? 0.62 : 1,
      }}
    >
      <View
        style={{
          width: 44,
          height: 44,
          borderRadius: 14,
          backgroundColor: locked ? G.mutedFill : G.pink,
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <MaterialIcons name={locked ? 'lock-outline' : 'play-circle-outline'} size={20} color={locked ? G.meta : G.cta} />
      </View>
      <View style={{ flex: 1, marginLeft: 12 }}>
        <ILText role="label" color={G.ink}>
          {item.title}
        </ILText>
        <ILText role="bodySm" color={G.meta} style={{ marginTop: 3, fontSize: 12 }}>
          {item.meta}
        </ILText>
      </View>
      <MaterialIcons name={locked ? 'lock-outline' : 'chevron-right'} size={18} color={G.meta} />
    </WhiteCard>
    </Pressable>
  );
}

function GateCard({ title, body, onPress }) {
  return (
    <View style={{ marginTop: 22, backgroundColor: G.dark, borderRadius: 24, padding: 20 }}>
      <ILText role="eyebrow" color={G.cta} style={[af, { fontSize: 10 }]}>
        ENROLLMENT PENDING
      </ILText>
      <ILText
        role="display"
        color="#FFFFFF"
        style={{ marginTop: 10, fontFamily: IL_FONTS.display, fontSize: 24, lineHeight: 30 }}
      >
        {title}
      </ILText>
      <ILText role="body" color="rgba(255,255,255,0.72)" style={{ marginTop: 8, fontSize: 14, lineHeight: 20 }}>
        {body}
      </ILText>
      <Pressable
        onPress={onPress}
        style={({ pressed }) => ({
          marginTop: 18,
          alignSelf: 'flex-start',
          backgroundColor: G.cta,
          borderRadius: 999,
          paddingVertical: 12,
          paddingHorizontal: 20,
          flexDirection: 'row',
          alignItems: 'center',
          opacity: pressed ? 0.9 : 1,
        })}
      >
        <ILText role="label" color="#FFFFFF">
          Complete enrollment
        </ILText>
        <MaterialIcons name="arrow-forward" size={16} color="#FFFFFF" style={{ marginLeft: 8 }} />
      </Pressable>
    </View>
  );
}

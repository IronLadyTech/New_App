import React, { useState } from 'react';
import { Image, Pressable, ScrollView, View } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { MaterialIcons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { IL_FONTS } from '../../constants/ironLadyBrand';
import ILText from '../../components/il/ILText';
import { G, af } from '../../constants/guestTheme';
import { LIQUID_TAB_PAD } from '../../components/il/LiquidTabBar';
import { useAuth } from '../../context/AuthContext';
import { isLepEnrolled } from '../../utils/lepState';
import {
  CheckRow,
  FilterBar,
  LepHeader,
  LinkRow,
  Page,
  ProgressDark,
  RedCta,
  UnderlineTabs,
  WhiteCard,
} from './LepBits';
import { useLepNav } from './useLepNav';
import { CIRCLE, COHORT_WEEK, FACE, PHASES, PHASE_TASKS, SESSIONS_DONE, SESSIONS_UP } from './lepData';

export default function LepMyProgramScreen() {
  const { profile } = useAuth();
  const insets = useSafeAreaInsets();
  const nav = useLepNav();
  const enrolled = isLepEnrolled(profile);
  const [prog, setProg] = useState('LEP');
  const [tab, setTab] = useState('Journey');

  return (
    <Page>
      <StatusBar style="dark" />
      <LepHeader
        photoUrl={profile?.photoURL}
        onNotifications={nav.goNotifications}
        onProfile={nav.goProfile}
      />
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{
          paddingHorizontal: 20,
          paddingBottom: LIQUID_TAB_PAD + Math.max(insets.bottom, 8),
        }}
      >
        <ILText role="eyebrow" color={G.cta} style={[af, { fontSize: 10, letterSpacing: 1.4 }]}>
          My Program
        </ILText>
        <ILText
          role="display"
          color={G.ink}
          style={{ marginTop: 8, fontFamily: IL_FONTS.display, fontSize: 32, lineHeight: 38 }}
        >
          {enrolled ? 'Leadership Essentials program' : 'Your next step'}
        </ILText>

        {!enrolled ? (
          <EmptyBody onSee={nav.goEnroll} />
        ) : (
          <>
            <View style={{ marginTop: 18 }}>
              <FilterBar items={['All', 'LEP', '100BM']} value={prog} onChange={setProg} />
            </View>
            <View style={{ marginTop: 18 }}>
              <UnderlineTabs items={['Journey', 'Sessions', 'Cohort']} value={tab} onChange={setTab} />
            </View>
            {tab === 'Journey' ? <JourneyBody /> : tab === 'Sessions' ? <SessionsBody /> : <CohortBody />}
          </>
        )}
      </ScrollView>
    </Page>
  );
}

function EmptyBody({ onSee }) {
  return (
    <>
      <WhiteCard
        style={{
          marginTop: 20,
          borderRadius: 22,
          padding: 16,
          flexDirection: 'row',
          alignItems: 'center',
        }}
      >
        <View
          style={{
            width: 44,
            height: 44,
            borderRadius: 22,
            backgroundColor: G.dark,
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <MaterialIcons name="workspace-premium" size={22} color="#FFFFFF" />
        </View>
        <View style={{ flex: 1, marginLeft: 12 }}>
          <ILText role="label" color={G.ink}>
            Masterclass (MC) · completed
          </ILText>
          <ILText role="bodySm" color={G.meta} style={{ marginTop: 2, fontSize: 12 }}>
            4 of the 27 principles · recording and certificate saved
          </ILText>
        </View>
        <MaterialIcons name="chevron-right" size={20} color={G.meta} />
      </WhiteCard>

      <View style={{ marginTop: 28, backgroundColor: G.dark, borderRadius: 28, padding: 20 }}>
        <ILText role="eyebrow" color={G.pink} style={[af, { fontSize: 10 }]}>
          Where most Masterclass women go next
        </ILText>
        <ILText
          role="display"
          color="#FFFFFF"
          style={{ marginTop: 12, fontFamily: IL_FONTS.display, fontSize: 28, lineHeight: 34 }}
        >
          Leadership Essentials program (LEP)
        </ILText>
        <ILText role="body" color="rgba(255,255,255,0.72)" style={{ marginTop: 10, fontSize: 15, lineHeight: 22 }}>
          All 27 principles in one month — a 2-day workshop, then four weeks of practice with your batch. Your program, sessions and batch will live right here.
        </ILText>
        <View style={{ marginTop: 18 }}>
          <RedCta label="See LEP →" onPress={onSee} />
        </View>
      </View>

      <WhiteCard style={{ marginTop: 16, borderRadius: 22, padding: 18 }}>
        <ILText role="eyebrow" color={G.cta} style={[af, { fontSize: 10 }]}>
          WHAT YOU’LL SEE HERE ONCE YOU JOIN
        </ILText>
        {[
          { icon: 'timeline', title: 'Your journey, phase by phase' },
          { icon: 'event', title: 'Your live sessions and recordings' },
          { icon: 'groups', title: 'Your batch and WA group' },
        ].map((row) => (
          <View key={row.title} style={{ flexDirection: 'row', alignItems: 'center', marginTop: 14 }}>
            <MaterialIcons name={row.icon} size={18} color={G.cta} />
            <ILText role="label" color={G.ink} style={{ marginLeft: 10 }}>
              {row.title}
            </ILText>
          </View>
        ))}
      </WhiteCard>
    </>
  );
}

function JourneyBody() {
  const nav = useLepNav();
  return (
    <>
      <View style={{ marginTop: 18 }}>
        <ProgressDark
          kicker="Batch 42 · your progress"
          title="Phase 4 of 11"
          percent={36}
          foot="Day 2 — Strategies and Tactics · 2 of 6 tasks done"
        />
      </View>
      <ILText role="title" color={G.ink} style={{ marginTop: 22, fontFamily: IL_FONTS.display, fontSize: 22 }}>
        This phase
      </ILText>
      <ILText role="bodySm" color={G.meta}>
        Day 2 · Strategies and Tactics
      </ILText>
      <WhiteCard style={{ marginTop: 12, borderRadius: 22, paddingHorizontal: 16 }}>
        {PHASE_TASKS.map((item, i) => (
          <CheckRow
            key={item.id}
            item={{ title: item.title, meta: item.kind, done: item.done }}
            last={i === PHASE_TASKS.length - 1}
            onPress={item.task === 'assignment' ? nav.goAssignment : nav.goPhase}
          />
        ))}
      </WhiteCard>

      <ILText role="title" color={G.ink} style={{ marginTop: 26, fontFamily: IL_FONTS.display, fontSize: 22 }}>
        All 11 phases
      </ILText>
      <ILText role="bodySm" color={G.meta}>
        From Moodle · phase by phase
      </ILText>
      <WhiteCard style={{ marginTop: 12, borderRadius: 22, overflow: 'hidden' }}>
        {PHASES.map((p, i) => (
          <Pressable
            key={p.n}
            onPress={nav.goPhase}
            style={{
              flexDirection: 'row',
              paddingHorizontal: 16,
              paddingVertical: 14,
              borderTopWidth: i ? 1 : 0,
              borderTopColor: G.line,
            }}
          >
            <MaterialIcons
              name={p.done ? 'check-circle' : p.now ? 'radio-button-checked' : 'radio-button-unchecked'}
              size={22}
              color={p.done || p.now ? G.ink : '#C8C4B6'}
            />
            <View style={{ marginLeft: 12, flex: 1 }}>
              <ILText role="eyebrow" color={G.meta} style={[af, { fontSize: 10 }]}>
                Phase {p.n}
              </ILText>
              <ILText role="label" color={G.ink} style={{ marginTop: 2 }}>
                {p.title}
              </ILText>
              <ILText role="bodySm" color={G.meta} style={{ marginTop: 2, fontSize: 12 }}>
                {p.sub}
              </ILText>
            </View>
          </Pressable>
        ))}
      </WhiteCard>
    </>
  );
}

function SessionsBody() {
  const nav = useLepNav();
  return (
    <>
      <View style={{ marginTop: 22, flexDirection: 'row', alignItems: 'flex-end' }}>
        <View style={{ flex: 1 }}>
          <ILText role="title" color={G.ink} style={{ fontFamily: IL_FONTS.display, fontSize: 22 }}>
            Coming up
          </ILText>
          <ILText role="bodySm" color={G.meta} style={{ marginTop: 4 }}>
            Live sessions for Batch 42
          </ILText>
        </View>
        <LinkRow label="Add all to calendar" onPress={nav.goSchedule} />
      </View>
      {SESSIONS_UP.map((s) => (
        <WhiteCard key={s.id} style={{ marginTop: 12, borderRadius: 22, padding: 16, flexDirection: 'row', alignItems: 'center' }}>
          <View
            style={{
              width: 52,
              borderRadius: 14,
              backgroundColor: G.cta,
              alignItems: 'center',
              paddingVertical: 8,
            }}
          >
            <ILText role="eyebrow" color="#FFFFFF" style={[af, { fontSize: 9 }]}>
              {s.mon}
            </ILText>
            <ILText role="title" color="#FFFFFF" style={{ fontFamily: IL_FONTS.display, fontSize: 20, lineHeight: 24 }}>
              {s.day}
            </ILText>
          </View>
          <View style={{ flex: 1, marginLeft: 12 }}>
            <ILText role="label" color={G.ink}>
              {s.title}
            </ILText>
            <ILText role="bodySm" color={G.meta} style={{ marginTop: 4, fontSize: 12 }}>
              {s.meta}
            </ILText>
          </View>
          <Pressable
            onPress={nav.goCheckin}
            style={{ backgroundColor: G.cta, borderRadius: 999, paddingHorizontal: 14, paddingVertical: 10 }}
          >
            <ILText role="label" color="#FFFFFF" style={[af, { fontSize: 12 }]}>
              {s.cta}
            </ILText>
          </Pressable>
        </WhiteCard>
      ))}
      <ILText role="title" color={G.ink} style={{ marginTop: 26, fontFamily: IL_FONTS.display, fontSize: 22 }}>
        Done
      </ILText>
      <ILText role="bodySm" color={G.meta}>
        Recordings and check-ins · attendance counts toward the certificate
      </ILText>
      <WhiteCard style={{ marginTop: 12, borderRadius: 22, overflow: 'hidden' }}>
        {SESSIONS_DONE.map((s, i) => (
          <View
            key={s.title}
            style={{
              paddingHorizontal: 16,
              paddingVertical: 14,
              borderTopWidth: i ? 1 : 0,
              borderTopColor: G.line,
            }}
          >
            <ILText role="label" color={G.ink}>
              {s.title}
            </ILText>
            <ILText role="bodySm" color={G.meta} style={{ marginTop: 4, fontSize: 12 }}>
              {s.meta}
            </ILText>
          </View>
        ))}
      </WhiteCard>
    </>
  );
}

function CohortBody() {
  return (
    <>
      <View style={{ marginTop: 18, backgroundColor: G.dark, borderRadius: 28, padding: 20 }}>
        <ILText role="eyebrow" color={G.pink} style={[af, { fontSize: 10 }]}>
          Your cohort
        </ILText>
        <ILText
          role="display"
          color="#FFFFFF"
          style={{ marginTop: 10, fontFamily: IL_FONTS.display, fontSize: 28, lineHeight: 34 }}
        >
          Batch 42 · Bengaluru
        </ILText>
        <ILText role="body" color="rgba(255,255,255,0.72)" style={{ marginTop: 8, fontSize: 14, lineHeight: 20 }}>
          48 women · Day 1 on Sat 20 Sep · weekly sessions to mid-October
        </ILText>
        <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: 18 }}>
          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
            {[0, 1, 2, 3].map((i) => (
              <Image
                key={i}
                source={FACE}
                style={{
                  width: 32,
                  height: 32,
                  borderRadius: 16,
                  marginLeft: i ? -8 : 0,
                  borderWidth: 2,
                  borderColor: G.dark,
                }}
              />
            ))}
            <ILText role="label" color="#FFFFFF" style={[af, { marginLeft: 8, fontSize: 12 }]}>
              +44
            </ILText>
          </View>
          <View
            style={{
              backgroundColor: 'rgba(255,255,255,0.12)',
              borderRadius: 999,
              paddingHorizontal: 14,
              paddingVertical: 10,
              flexDirection: 'row',
              alignItems: 'center',
            }}
          >
            <ILText role="label" color="#FFFFFF" style={[af, { fontSize: 12, marginRight: 6 }]}>
              WA group
            </ILText>
            <MaterialIcons name="open-in-new" size={14} color="#FFFFFF" />
          </View>
        </View>
      </View>

      <ILText role="title" color={G.ink} style={{ marginTop: 22, fontFamily: IL_FONTS.display, fontSize: 22 }}>
        Your Community Circle
      </ILText>
      <ILText role="bodySm" color={G.meta} style={{ marginTop: 4 }}>
        A closed-door triad, every Thursday
      </ILText>
      <WhiteCard style={{ marginTop: 12, borderRadius: 22, padding: 18 }}>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
          <ILText role="eyebrow" color={G.cta} style={[af, { fontSize: 10 }]}>
            THURSDAY · 8–9 PM
          </ILText>
          <MaterialIcons name="lock" size={14} color={G.meta} />
        </View>
        <ILText role="title" color={G.ink} style={{ marginTop: 8, fontFamily: IL_FONTS.display, fontSize: 22 }}>
          Community Circle
        </ILText>
        <ILText role="bodySm" color={G.meta} style={{ marginTop: 6, fontSize: 13, lineHeight: 18 }}>
          Small-group sessions with women working through the same problems.
        </ILText>
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', marginTop: 12 }}>
          {CIRCLE.map((c) => (
            <View
              key={c}
              style={{
                marginRight: 8,
                marginBottom: 8,
                backgroundColor: G.mutedFill,
                borderRadius: 999,
                paddingHorizontal: 12,
                paddingVertical: 6,
              }}
            >
              <ILText role="label" color={G.ink} style={[af, { fontSize: 11 }]}>
                {c}
              </ILText>
            </View>
          ))}
        </View>
        <View
          style={{
            marginTop: 8,
            backgroundColor: G.dark,
            borderRadius: 999,
            paddingVertical: 14,
            alignItems: 'center',
            flexDirection: 'row',
            justifyContent: 'center',
          }}
        >
          <ILText role="label" color="#FFFFFF">
            Add Thursday to calendar
          </ILText>
          <MaterialIcons name="event" size={16} color="#FFFFFF" style={{ marginLeft: 8 }} />
        </View>
      </WhiteCard>

      <View style={{ marginTop: 22, flexDirection: 'row', alignItems: 'flex-end' }}>
        <View style={{ flex: 1 }}>
          <ILText role="title" color={G.ink} style={{ fontFamily: IL_FONTS.display, fontSize: 22 }}>
            This week in Batch 42
          </ILText>
          <ILText role="bodySm" color={G.meta} style={{ marginTop: 4 }}>
            From your WA group
          </ILText>
        </View>
        <LinkRow label="Open group" />
      </View>
      <WhiteCard style={{ marginTop: 12, borderRadius: 22, overflow: 'hidden' }}>
        {COHORT_WEEK.map((row, i) => (
          <View
            key={row.title}
            style={{
              paddingHorizontal: 16,
              paddingVertical: 14,
              flexDirection: 'row',
              alignItems: 'center',
              borderTopWidth: i ? 1 : 0,
              borderTopColor: G.line,
            }}
          >
            <MaterialIcons name={row.icon} size={18} color={G.cta} />
            <View style={{ marginLeft: 12, flex: 1 }}>
              <ILText role="label" color={G.ink}>
                {row.title}
              </ILText>
              <ILText role="bodySm" color={G.meta} style={{ marginTop: 3, fontSize: 12 }}>
                {row.meta}
              </ILText>
            </View>
          </View>
        ))}
      </WhiteCard>
    </>
  );
}

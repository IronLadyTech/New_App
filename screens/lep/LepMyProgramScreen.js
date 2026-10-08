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
  LepHeader,
  ProgramFilter,
  LinkRow,
  Page,
  ProgressDark,
  RedCta,
  UnderlineTabs,
  WhiteCard,
} from './LepBits';
import { useLepNav } from './useLepNav';
import {
  CIRCLE,
  COHORT_WEEK,
  FACE,
  PHASES,
  SESSIONS_DONE,
  SESSIONS_UP,
} from './lepData';
import { useGlassHeaderPad } from '../../components/il/GlassHeader';
import { PROGRAMS } from '../../constants/programs';
import { coursePhases, currentPhaseId } from '../../constants/programCourseSlice';
import ThisPhaseBlock from '../program/ThisPhaseBlock';

// Registered = partial payment = partial unlock. Everything after these stays locked.
const REG_OPEN_PHASES = 3;

export default function LepMyProgramScreen() {
  const { profile } = useAuth();
  const insets = useSafeAreaInsets();
  const headerPad = useGlassHeaderPad();
  const nav = useLepNav();
  const enrolled = isLepEnrolled(profile);
  const [tab, setTab] = useState('Journey');

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
        <ILText role="eyebrow" color={G.cta} style={[af, { fontSize: 10, letterSpacing: 1.4 }]}>
          My Program
        </ILText>
        <ILText
          role="display"
          color={G.ink}
          style={{ marginTop: 8, fontFamily: IL_FONTS.display, fontSize: 32, lineHeight: 38 }}
        >
          Leadership Essentials program
        </ILText>

        <View style={{ marginTop: 18 }}>
          <ProgramFilter />
        </View>
        <View style={{ marginTop: 18 }}>
          <UnderlineTabs items={['Journey', 'Sessions', 'Cohort']} value={tab} onChange={setTab} />
        </View>
        {tab === 'Journey' ? (
          <JourneyBody locked={!enrolled} />
        ) : tab === 'Sessions' ? (
          <SessionsBody preview={!enrolled} onEnroll={nav.goEnroll} />
        ) : (
          <CohortBody preview={!enrolled} onEnroll={nav.goEnroll} />
        )}
      </ScrollView>
    </Page>
  );
}

function LockRow({ title, meta, last }) {
  return (
    <View
      style={{
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 14,
        borderBottomWidth: last ? 0 : 1,
        borderBottomColor: G.line,
        opacity: 0.6,
      }}
    >
      <View
        style={{
          width: 24,
          height: 24,
          borderRadius: 12,
          backgroundColor: G.mutedFill,
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <MaterialIcons name="lock" size={13} color={G.meta} />
      </View>
      <View style={{ flex: 1, marginLeft: 12 }}>
        <ILText role="label" color={G.ink}>
          {title}
        </ILText>
        <ILText role="bodySm" color={G.meta} style={{ marginTop: 2, fontSize: 12 }}>
          {meta}
        </ILText>
      </View>
      <MaterialIcons name="lock-outline" size={16} color={G.meta} />
    </View>
  );
}

function UnlockRest({ onEnroll }) {
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
        Unlock Phases {String(REG_OPEN_PHASES + 1).padStart(2, '0')}–11
      </ILText>
      <ILText role="body" color="rgba(255,255,255,0.72)" style={{ marginTop: 8, fontSize: 14, lineHeight: 20 }}>
        Your seat is held with a part payment. Day 1, Day 2, the four practice weeks and your certificate open the
        day your balance is paid.
      </ILText>
      <View style={{ marginTop: 18 }}>
        <RedCta label="Complete enrollment →" onPress={onEnroll} />
      </View>
    </View>
  );
}

function JourneyBody({ locked = false }) {
  const nav = useLepNav();
  const phaseId = currentPhaseId(PROGRAMS.LEP, !locked);
  const phases = coursePhases(PROGRAMS.LEP);
  return (
    <>
      <View style={{ marginTop: 18 }}>
        {locked ? (
          <ProgressDark
            kicker="Batch 42 · starts Sat 20 Sep"
            title="Phase 1 of 11"
            percent={5}
            foot={`Registered · ${REG_OPEN_PHASES} phases open now · the rest unlock on enrollment`}
          />
        ) : (
          <ProgressDark
            kicker="Batch 42 · your progress"
            title="Phase 4 of 11"
            percent={36}
            foot="Day 2 — Strategies and Tactics · 2 of 6 tasks done"
          />
        )}
      </View>
      <ThisPhaseBlock programId={PROGRAMS.LEP} phaseId={phaseId} style={{ marginTop: 22 }} />

      <ILText role="title" color={G.ink} style={{ marginTop: 26, fontFamily: IL_FONTS.display, fontSize: 22 }}>
        Your phases
      </ILText>
      <ILText role="bodySm" color={G.meta}>
        {locked ? 'First phases open now · the rest unlock on enrollment' : 'Phase by phase from the LEP course'}
      </ILText>
      <WhiteCard style={{ marginTop: 12, borderRadius: 22, overflow: 'hidden' }}>
        {(phases.length ? phases : PHASES).map((p, i) => {
          const shut = locked && (p.openRegistered === false || (p.openRegistered == null && i >= REG_OPEN_PHASES));
          const now = p.id === phaseId;
          const currentIndex = phases.findIndex((x) => x.id === phaseId);
          const done = !locked && i < currentIndex;
          return (
            <Pressable
              key={p.id || p.n}
              onPress={shut ? nav.goEnroll : () => nav.goCoursePhase(PROGRAMS.LEP, p.id || 'pre-program')}
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                paddingHorizontal: 16,
                paddingVertical: 14,
                borderTopWidth: i ? 1 : 0,
                borderTopColor: G.line,
                opacity: shut ? 0.6 : 1,
              }}
            >
              <MaterialIcons
                name={shut ? 'lock' : done ? 'check-circle' : now ? 'radio-button-checked' : 'radio-button-unchecked'}
                size={22}
                color={shut ? G.meta : done || now ? G.ink : '#C8C4B6'}
              />
              <View style={{ marginLeft: 12, flex: 1 }}>
                <ILText role="eyebrow" color={G.meta} style={[af, { fontSize: 10 }]}>
                  Phase {String(i + 1).padStart(2, '0')}
                </ILText>
                <ILText role="label" color={G.ink} style={{ marginTop: 2 }}>
                  {p.title}
                </ILText>
                <ILText role="bodySm" color={G.meta} style={{ marginTop: 2, fontSize: 12 }}>
                  {p.sub}
                </ILText>
              </View>
              {shut ? <MaterialIcons name="lock-outline" size={16} color={G.meta} /> : null}
            </Pressable>
          );
        })}
      </WhiteCard>

      {locked ? <UnlockRest onEnroll={nav.goEnroll} /> : null}
    </>
  );
}

function SessionsBody({ preview = false, onEnroll }) {
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
        {preview ? null : <LinkRow label="Add all to calendar" onPress={nav.goSchedule} />}
      </View>
      {SESSIONS_UP.map((s, i) => {
        const shut = preview && i >= 2;
        return (
          <WhiteCard
            key={s.id}
            style={{
              marginTop: 12,
              borderRadius: 22,
              padding: 16,
              flexDirection: 'row',
              alignItems: 'center',
              opacity: shut ? 0.62 : 1,
            }}
          >
            <View
              style={{
                width: 52,
                borderRadius: 14,
                backgroundColor: shut ? G.mutedFill : G.cta,
                alignItems: 'center',
                paddingVertical: 8,
              }}
            >
              <ILText role="eyebrow" color={shut ? G.meta : '#FFFFFF'} style={[af, { fontSize: 9 }]}>
                {s.mon}
              </ILText>
              <ILText
                role="title"
                color={shut ? G.ink : '#FFFFFF'}
                style={{ fontFamily: IL_FONTS.display, fontSize: 20, lineHeight: 24 }}
              >
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
            {shut ? (
              <MaterialIcons name="lock-outline" size={18} color={G.meta} />
            ) : (
              <Pressable
                onPress={preview ? onEnroll : nav.goCheckin}
                style={{ backgroundColor: G.cta, borderRadius: 999, paddingHorizontal: 14, paddingVertical: 10 }}
              >
                <ILText role="label" color="#FFFFFF" style={[af, { fontSize: 12 }]}>
                  {s.cta}
                </ILText>
              </Pressable>
            )}
          </WhiteCard>
        );
      })}
      <ILText role="title" color={G.ink} style={{ marginTop: 26, fontFamily: IL_FONTS.display, fontSize: 22 }}>
        Done
      </ILText>
      <ILText role="bodySm" color={G.meta}>
        Recordings and check-ins · attendance counts toward the certificate
      </ILText>
      <WhiteCard style={{ marginTop: 12, borderRadius: 22, overflow: 'hidden', opacity: preview ? 0.62 : 1 }}>
        {SESSIONS_DONE.map((s, i) => (
          <View
            key={s.title}
            style={{
              paddingHorizontal: 16,
              paddingVertical: 14,
              borderTopWidth: i ? 1 : 0,
              borderTopColor: G.line,
              flexDirection: 'row',
              alignItems: 'center',
            }}
          >
            <View style={{ flex: 1 }}>
              <ILText role="label" color={G.ink}>
                {s.title}
              </ILText>
              <ILText role="bodySm" color={G.meta} style={{ marginTop: 4, fontSize: 12 }}>
                {s.meta}
              </ILText>
            </View>
            {preview ? <MaterialIcons name="lock-outline" size={16} color={G.meta} /> : null}
          </View>
        ))}
      </WhiteCard>
      {preview ? <UnlockRest onEnroll={onEnroll} /> : null}
    </>
  );
}

function CohortBody({ preview = false, onEnroll }) {
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
            <MaterialIcons name={preview ? 'lock-outline' : 'open-in-new'} size={14} color="#FFFFFF" />
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

      <View style={{ marginTop: 22, flexDirection: 'row', alignItems: 'flex-end', opacity: preview ? 0.62 : 1 }}>
        <View style={{ flex: 1 }}>
          <ILText role="title" color={G.ink} style={{ fontFamily: IL_FONTS.display, fontSize: 22 }}>
            This week in Batch 42
          </ILText>
          <ILText role="bodySm" color={G.meta} style={{ marginTop: 4 }}>
            From your WA group
          </ILText>
        </View>
        {preview ? <MaterialIcons name="lock-outline" size={16} color={G.meta} /> : <LinkRow label="Open group" />}
      </View>
      <WhiteCard style={{ marginTop: 12, borderRadius: 22, overflow: 'hidden', opacity: preview ? 0.62 : 1 }}>
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
            <MaterialIcons name={row.icon} size={18} color={preview ? G.meta : G.cta} />
            <View style={{ marginLeft: 12, flex: 1 }}>
              <ILText role="label" color={G.ink}>
                {row.title}
              </ILText>
              <ILText role="bodySm" color={G.meta} style={{ marginTop: 3, fontSize: 12 }}>
                {row.meta}
              </ILText>
            </View>
            {preview ? <MaterialIcons name="lock-outline" size={16} color={G.meta} /> : null}
          </View>
        ))}
      </WhiteCard>
      {preview ? <UnlockRest onEnroll={onEnroll} /> : null}
    </>
  );
}

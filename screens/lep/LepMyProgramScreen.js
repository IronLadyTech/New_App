import React, { useMemo, useState } from 'react';
import { Image, Pressable, ScrollView, View } from 'react-native';
import * as Linking from 'expo-linking';
import { StatusBar } from 'expo-status-bar';
import { MaterialIcons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { IL_FONTS } from '../../constants/ironLadyBrand';
import ILText from '../../components/il/ILText';
import { G, af } from '../../constants/guestTheme';
import { LIQUID_TAB_PAD } from '../../components/il/LiquidTabBar';
import { useAuth } from '../../context/AuthContext';
import { useCourses } from '../../context/CoursesContext';
import { learnerBatchId, learnerBatchLabel, learnerProgramDates } from '../../utils/programAccess';
import { splitBatchSessions } from '../../utils/eventVisibility';
import { splitCmsBatchSessions } from '../../utils/cmsBatchSessions';
import { inferLepDay1FromZohoRaw } from '../../utils/lepDeskBatchDate';
import { useLearnerCmsBatch } from '../../hooks/useLearnerCmsBatch';
import { isLepEnrolled } from '../../utils/lepState';
import {
  LepHeader,
  ProgramFilter,
  LinkRow,
  Page,
  RedCta,
  UnderlineTabs,
  WhiteCard,
} from './LepBits';
import { useLepNav } from './useLepNav';
import {
  CIRCLE,
  COHORT_WEEK,
  FACE,
} from './lepData';
import { useGlassHeaderPad } from '../../components/il/GlassHeader';
import { PROGRAMS } from '../../constants/programs';
import { lepFlowContextFromBatch } from '../../utils/lepFlowGates';
import { todayIsoIST } from '../../utils/lepDailyPractice';
import CourseCurriculum from './CourseCurriculum';

/** Registered learners: Orientation + Day 1 + Day 2 only (unlocked). */
const REGISTERED_SESSION_CODES = new Set(['S0', 'S1', 'S2']);

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
          <SessionsBody enrolled={enrolled} onEnroll={nav.goEnroll} />
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
  const { batch: cmsBatch } = useLearnerCmsBatch('lep');
  const lepFlow = { ...lepFlowContextFromBatch({ cmsBatch }), todayIso: todayIsoIST() };
  return (
    <View style={{ marginTop: 18 }}>
      <CourseCurriculum
        programId={PROGRAMS.LEP}
        enrolled={!locked}
        lepFlow={lepFlow}
        lockedFooter={locked ? <UnlockRest onEnroll={nav.goEnroll} /> : null}
      />
    </View>
  );
}

function filterRegisteredSessions(list) {
  return (list || []).filter((s) => {
    if (s?.code && REGISTERED_SESSION_CODES.has(s.code)) return true;
    // Fallback when calendar events lack codes (title match).
    const t = String(s?.title || '').toLowerCase();
    return /orientation|day\s*1|day\s*2/i.test(t) && !/week\s*[2-9]|closure|progress|brand|pitch/i.test(t);
  });
}

function SessionsBody({ enrolled = false, onEnroll }) {
  const nav = useLepNav();
  const { profile } = useAuth();
  const { events } = useCourses();
  const { batch: cmsBatch } = useLearnerCmsBatch('lep');
  const batchId = learnerBatchId(profile, 'lep');
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

  const { upcoming, done } = useMemo(() => {
    let split = { upcoming: [], done: [] };
    if (day1Iso || cmsBatch?.day1Date || cmsBatch?.orientationDate || cmsBatch?.sessions?.length) {
      const anchor = {
        ...(cmsBatch || {}),
        day1Date: cmsBatch?.day1Date || day1Iso,
        sessions: cmsBatch?.sessions || [],
      };
      split = splitCmsBatchSessions(anchor, { day1Iso: day1Iso || String(anchor.day1Date || '').slice(0, 10) });
    } else if (events?.length) {
      split = splitBatchSessions(events, { batchId, batchName: batchLabel });
    }

    if (!enrolled) {
      split = {
        upcoming: filterRegisteredSessions(split.upcoming),
        done: filterRegisteredSessions(split.done),
      };
    }
    return split;
  }, [cmsBatch, day1Iso, events, batchId, batchLabel, enrolled]);

  const sessionBatchLabel = cmsBatch?.name || batchLabel;
  const hasBatch = Boolean(cmsBatch?.id || day1Iso || (batchId && batchId !== 'default') || batchLabel);

  return (
    <>
      <View style={{ marginTop: 22, flexDirection: 'row', alignItems: 'flex-end' }}>
        <View style={{ flex: 1 }}>
          <ILText role="title" color={G.ink} style={{ fontFamily: IL_FONTS.display, fontSize: 22 }}>
            Coming up
          </ILText>
          <ILText role="bodySm" color={G.meta} style={{ marginTop: 4 }}>
            {enrolled
              ? sessionBatchLabel
                ? `All live sessions · ${sessionBatchLabel}`
                : 'All live sessions for your batch'
              : sessionBatchLabel
                ? `Orientation, Day 1 & Day 2 · ${sessionBatchLabel}`
                : 'Orientation, Day 1 & Day 2'}
          </ILText>
        </View>
        {upcoming.length === 0 ? null : (
          <LinkRow label="Add all to calendar" onPress={nav.goSchedule} />
        )}
      </View>
      {upcoming.length === 0 ? (
        <ILText role="bodySm" color={G.meta} style={{ marginTop: 12, fontSize: 14, lineHeight: 20 }}>
          {!hasBatch
            ? 'Your batch sessions will show here once your batch date is set.'
            : done.length
              ? 'No upcoming sessions — your intensive sessions are listed under Done.'
              : 'No upcoming sessions on your batch yet.'}
        </ILText>
      ) : (
        upcoming.map((s) => {
          const open = () => {
            if (s.linkUrl) Linking.openURL(s.linkUrl).catch(() => {});
          };
          return (
            <WhiteCard
              key={s.id}
              style={{
                marginTop: 12,
                borderRadius: 22,
                padding: 16,
                flexDirection: 'row',
                alignItems: 'center',
              }}
            >
              {s.mon && s.day ? (
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
                  <ILText
                    role="title"
                    color="#FFFFFF"
                    style={{ fontFamily: IL_FONTS.display, fontSize: 20, lineHeight: 24 }}
                  >
                    {s.day}
                  </ILText>
                </View>
              ) : null}
              <View style={{ flex: 1, marginLeft: s.mon && s.day ? 12 : 0 }}>
                <ILText role="label" color={G.ink}>
                  {s.title}
                </ILText>
                {s.meta ? (
                  <ILText role="bodySm" color={G.meta} style={{ marginTop: 4, fontSize: 12 }} numberOfLines={3}>
                    {s.meta}
                  </ILText>
                ) : null}
              </View>
              {s.linkUrl ? (
                <Pressable
                  onPress={open}
                  style={{ backgroundColor: G.cta, borderRadius: 999, paddingHorizontal: 14, paddingVertical: 10 }}
                >
                  <ILText role="label" color="#FFFFFF" style={[af, { fontSize: 12 }]}>
                    Join
                  </ILText>
                </Pressable>
              ) : null}
            </WhiteCard>
          );
        })
      )}
      {done.length ? (
        <>
          <ILText role="title" color={G.ink} style={{ marginTop: 26, fontFamily: IL_FONTS.display, fontSize: 22 }}>
            Done
          </ILText>
          <WhiteCard style={{ marginTop: 12, borderRadius: 22, overflow: 'hidden' }}>
            {done.map((s, i) => (
              <View
                key={s.id}
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
                  {s.doneMeta ? (
                    <ILText role="bodySm" color={G.meta} style={{ marginTop: 4, fontSize: 12 }} numberOfLines={3}>
                      {s.doneMeta}
                    </ILText>
                  ) : null}
                </View>
              </View>
            ))}
          </WhiteCard>
        </>
      ) : null}
      {!enrolled ? (
        <View style={{ marginTop: 18 }}>
          <ILText role="bodySm" color={G.meta} style={{ fontSize: 13, lineHeight: 19 }}>
            Later weekly sessions unlock when you complete enrollment.
          </ILText>
          {onEnroll ? (
            <View style={{ marginTop: 12 }}>
              <RedCta label="Complete enrollment" onPress={onEnroll} />
            </View>
          ) : null}
        </View>
      ) : null}
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

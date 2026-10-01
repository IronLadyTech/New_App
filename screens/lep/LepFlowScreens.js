import React, { useState } from 'react';
import { Image, Pressable, ScrollView, TextInput, View } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { MaterialIcons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { IL_FONTS } from '../../constants/ironLadyBrand';
import ILText from '../../components/il/ILText';
import { G, af } from '../../constants/guestTheme';
import { useNavigation } from '@react-navigation/native';
import { GuestBackBar } from '../guest/GuestBits';
import { Page, ProgressDark, RedCta, Seal, SoftChip, WhisperCard, WhiteCard } from './LepBits';
import { useLepNav } from './useLepNav';
import { lepFirstName } from '../../utils/lepState';
import { useAuth } from '../../context/AuthContext';
import { LIQUID_TAB_PAD } from '../../components/il/LiquidTabBar';
import {
  FACE,
  NOTICES,
  PHASES,
  QUIZ_Q,
  ROAD,
  SCHEDULE_DAYS,
  SCHEDULE_ITEMS,
  TODAY_ITEMS,
} from './lepData';

function Shell({ title, sub, right, children }) {
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
          paddingBottom: LIQUID_TAB_PAD + Math.max(insets.bottom, 8),
        }}
      >
        {children}
      </ScrollView>
    </Page>
  );
}

export function LepScheduleScreen() {
  const nav = useLepNav();
  return (
    <Shell title="Schedule" sub="All programs · this week">
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginTop: 8 }}>
        {SCHEDULE_DAYS.map((d) => (
          <View
            key={d.d}
            style={{
              width: 46,
              alignItems: 'center',
              paddingVertical: 10,
              borderRadius: 16,
              backgroundColor: d.on ? G.dark : 'transparent',
            }}
          >
            <ILText role="eyebrow" color={d.on ? 'rgba(255,255,255,0.55)' : G.meta} style={[af, { fontSize: 9 }]}>
              {d.w}
            </ILText>
            <ILText role="title" color={d.on ? '#FFFFFF' : G.ink} style={{ fontFamily: IL_FONTS.display, fontSize: 18, marginTop: 4 }}>
              {d.d}
            </ILText>
          </View>
        ))}
      </View>
      <ILText role="eyebrow" color={G.cta} style={[af, { marginTop: 22, fontSize: 10 }]}>
        Today · Wed 23
      </ILText>
      {SCHEDULE_ITEMS.map((item) => (
        <View key={item.title} style={{ flexDirection: 'row', marginTop: 14 }}>
          <ILText role="label" color={G.meta} style={{ width: 72, fontSize: 11, marginTop: 12 }}>
            {item.time}
          </ILText>
          <WhiteCard style={{ flex: 1, borderRadius: 18, padding: 14, borderLeftWidth: item.live ? 3 : 0, borderLeftColor: G.cta }}>
            {item.day ? (
              <ILText role="eyebrow" color={G.cta} style={[af, { fontSize: 10, marginBottom: 6 }]}>
                {item.day}
              </ILText>
            ) : null}
            <ILText role="eyebrow" color={G.cta} style={[af, { fontSize: 10 }]}>
              {item.tag}
            </ILText>
            <ILText role="label" color={G.ink} style={{ marginTop: 6 }}>
              {item.title}
            </ILText>
            <ILText role="bodySm" color={G.meta} style={{ marginTop: 4, fontSize: 12 }}>
              {item.meta}
            </ILText>
            {item.live ? (
              <View style={{ flexDirection: 'row', marginTop: 12 }}>
                <Pressable
                  onPress={nav.goCheckin}
                  style={{ backgroundColor: G.cta, borderRadius: 999, paddingHorizontal: 16, paddingVertical: 10, marginRight: 8 }}
                >
                  <ILText role="label" color="#FFFFFF">
                    Join
                  </ILText>
                </Pressable>
                <Pressable style={{ borderWidth: 1, borderColor: G.line, borderRadius: 999, paddingHorizontal: 16, paddingVertical: 10 }}>
                  <ILText role="label" color={G.ink}>
                    Add to calendar
                  </ILText>
                </Pressable>
              </View>
            ) : null}
          </WhiteCard>
        </View>
      ))}
    </Shell>
  );
}

export function LepNotificationsScreen() {
  const nav = useLepNav();
  const attention = NOTICES.filter((n) => n.kind === 'attention');
  const guide = NOTICES.filter((n) => n.kind === 'guide');
  return (
    <Shell
      title="Notifications"
      sub="2 need attention"
      right={
        <ILText role="label" color={G.cta} style={[af, { fontSize: 12 }]}>
          Mark all read
        </ILText>
      }
    >
      <ILText role="eyebrow" color={G.cta} style={[af, { fontSize: 10, marginTop: 8 }]}>
        Needs attention
      </ILText>
      <WhiteCard style={{ marginTop: 10, borderRadius: 22, overflow: 'hidden' }}>
        {attention.map((n, i) => (
          <NoticeRow key={n.title} item={n} last={i === attention.length - 1} onPress={() => n.go === 'Assignment' && nav.goAssignment()} />
        ))}
      </WhiteCard>
      <ILText role="eyebrow" color={G.meta} style={[af, { fontSize: 10, marginTop: 22 }]}>
        From IL Guide
      </ILText>
      <WhiteCard style={{ marginTop: 10, borderRadius: 22, overflow: 'hidden' }}>
        {guide.map((n, i) => (
          <NoticeRow key={n.title} item={n} last={i === guide.length - 1} />
        ))}
      </WhiteCard>
    </Shell>
  );
}

function NoticeRow({ item, last, onPress }) {
  return (
    <Pressable
      onPress={onPress}
      style={{
        flexDirection: 'row',
        paddingHorizontal: 16,
        paddingVertical: 14,
        borderBottomWidth: last ? 0 : 1,
        borderBottomColor: G.line,
      }}
    >
      <View
        style={{
          width: 36,
          height: 36,
          borderRadius: 18,
          backgroundColor: G.pink,
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <MaterialIcons name={item.icon} size={18} color={G.cta} />
      </View>
      <View style={{ flex: 1, marginLeft: 12 }}>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
          <ILText role="label" color={G.ink} style={{ flex: 1 }}>
            {item.title}
          </ILText>
          <ILText role="bodySm" color={G.meta} style={{ fontSize: 11 }}>
            {item.ago}
          </ILText>
        </View>
        <ILText role="bodySm" color={G.meta} style={{ marginTop: 4, fontSize: 12 }}>
          {item.meta}
        </ILText>
        {item.action ? (
          <ILText role="label" color={G.cta} style={[af, { marginTop: 8, fontSize: 12 }]}>
            {item.action}
          </ILText>
        ) : null}
      </View>
    </Pressable>
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
  const nav = useLepNav();
  return (
    <Shell title="Leadership Essentials" sub="LEP · Batch 42 · Course">
      <ProgressDark
        kicker="Your progress"
        title="Phase 4 of 11"
        percent={36}
        foot="36% complete · Next up: Day 2 Assignment"
      />
      <ILText role="title" color={G.ink} style={{ marginTop: 22, fontFamily: IL_FONTS.display, fontSize: 22 }}>
        Course
      </ILText>
      <ILText role="bodySm" color={G.meta}>
        Phase by phase, from Moodle
      </ILText>
      {PHASES.map((p) => (
        <Pressable key={p.n} onPress={p.n === '04' ? nav.goAssignment : undefined}>
          <WhiteCard style={{ marginTop: 10, borderRadius: 18, padding: 16, flexDirection: 'row', alignItems: 'center' }}>
            <MaterialIcons
              name={p.done ? 'check-circle' : p.now ? 'radio-button-checked' : 'radio-button-unchecked'}
              size={22}
              color={p.done || p.now ? G.ink : '#C8C4B6'}
            />
            <View style={{ flex: 1, marginLeft: 12 }}>
              <ILText role="label" color={G.ink}>
                {p.n} {p.title}
              </ILText>
              <ILText role="bodySm" color={G.meta} style={{ marginTop: 4, fontSize: 12 }}>
                {p.sub}
              </ILText>
            </View>
            <MaterialIcons name="chevron-right" size={18} color={G.meta} />
          </WhiteCard>
        </Pressable>
      ))}
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
    <Shell title="Day 2 Assignment" sub="LEP · Assignment" right={<SoftChip>In progress</SoftChip>}>
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
  return (
    <Shell title="Your progress" sub="Weekly consistency, badges">
      <ProgressDark kicker="This week" title="4 of 5 days" percent={80} foot="Never resets" />
      <WhiteCard style={{ marginTop: 14, borderRadius: 22, padding: 16 }}>
        <Row k="LEP" v="36%" />
        <Row k="Phase badges" v="3 of 11" />
      </WhiteCard>
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

export function LepGraduationScreen() {
  const { profile } = useAuth();
  const name = lepFirstName(profile);
  const nav = useLepNav();
  const insets = useSafeAreaInsets();
  return (
    <View style={{ flex: 1, backgroundColor: G.dark }}>
      <StatusBar style="light" />
      <View
        style={{
          flex: 1,
          paddingTop: Math.max(insets.top, 24),
          paddingHorizontal: 28,
          paddingBottom: Math.max(insets.bottom, 20) + 16,
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <SoftChip onDark>Leadership Essentials program</SoftChip>
        <View style={{ marginTop: 20 }}>
          <Seal icon="school" />
        </View>
        <ILText
          role="display"
          color="#FFFFFF"
          style={{ marginTop: 22, fontFamily: IL_FONTS.display, fontSize: 36, lineHeight: 42, textAlign: 'center' }}
        >
          You’ve graduated, {name}.
        </ILText>
        <ILText role="body" color="rgba(248,214,212,0.88)" style={{ marginTop: 14, fontSize: 16, lineHeight: 24, textAlign: 'center' }}>
          All 11 phases, 6 of 6 sessions, both quizzes. Your LEP Certification is ready.
        </ILText>
        <View style={{ marginTop: 28, alignSelf: 'stretch' }}>
          <RedCta label="Join the Iron Lady Alumni →" onPress={nav.goAlumni} />
        </View>
      </View>
    </View>
  );
}

export function LepAlumniHomeScreen() {
  const { profile } = useAuth();
  const name = lepFirstName(profile);
  const insets = useSafeAreaInsets();
  return (
    <Page>
      <StatusBar style="dark" />
      <View style={{ paddingTop: Math.max(insets.top, 8) }} />
      <ScrollView contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: 40 }}>
        <View style={{ backgroundColor: G.dark, borderRadius: 28, padding: 20 }}>
          <SoftChip onDark>LEP Graduate · Batch 42</SoftChip>
          <ILText
            role="display"
            color="#FFFFFF"
            style={{ marginTop: 16, fontFamily: IL_FONTS.display, fontSize: 32, lineHeight: 38 }}
          >
            Good evening, {name}.
          </ILText>
          <View style={{ marginTop: 16, backgroundColor: 'rgba(255,255,255,0.08)', borderRadius: 20, padding: 16 }}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
              <ILText role="eyebrow" color={G.pink} style={[af, { fontSize: 10 }]}>
                October challenge · Alumni
              </ILText>
              <ILText role="bodySm" color="rgba(255,255,255,0.6)">
                Day 3 of 7
              </ILText>
            </View>
            <ILText role="title" color="#FFFFFF" style={{ marginTop: 8, fontFamily: IL_FONTS.display, fontSize: 20 }}>
              Monthly alumni challenge
            </ILText>
            <View style={{ flexDirection: 'row', marginTop: 12 }}>
              {[1, 2, 3, 4, 5, 6, 7].map((i) => (
                <View
                  key={i}
                  style={{
                    flex: 1,
                    height: 4,
                    marginRight: 4,
                    borderRadius: 2,
                    backgroundColor: i <= 3 ? G.cta : 'rgba(255,255,255,0.16)',
                  }}
                />
              ))}
            </View>
            <View style={{ marginTop: 16 }}>
              <RedCta label="Continue today →" />
            </View>
          </View>
        </View>
        <ILText role="title" color={G.ink} style={{ marginTop: 24, fontFamily: IL_FONTS.display, fontSize: 22 }}>
          Celebrations
        </ILText>
        <WhiteCard style={{ marginTop: 12, borderRadius: 18, padding: 16 }}>
          <ILText role="label" color={G.ink}>
            Batch 42 graduation film
          </ILText>
          <ILText role="bodySm" color={G.meta} style={{ marginTop: 4 }}>
            Watch · share · keep
          </ILText>
        </WhiteCard>
      </ScrollView>
    </Page>
  );
}

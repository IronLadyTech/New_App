import React, { useMemo } from 'react';
import { Linking, Pressable, ScrollView, View } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { MaterialIcons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import ILText from '../../components/il/ILText';
import { GlassBackBar } from '../../components/il/GlassHeader';
import { G, af } from '../../constants/guestTheme';
import { IL_FONTS } from '../../constants/ironLadyBrand';
import { PAYMENT_STATUS } from '../../constants/programs';
import { courseTasks } from '../../constants/programCourseSlice';
import { useAuth } from '../../context/AuthContext';
import { usePrograms } from '../../context/ProgramsContext';
import { useCourseDemo } from '../../context/CourseDemoContext';
import { Page, WhiteCard } from '../guest/GuestBits';
import {
  getEnrolledPrograms,
  learnerBatchLabel,
  learnerProgramDates,
  programPaymentStatus,
} from '../../utils/programAccess';
import { makeTaskDoneChecker } from '../../utils/taskDone';

/**
 * Certificates & program record — only what is recorded somewhere:
 * programme status, batch and dates, payments, tasks done from her submissions,
 * and each certificate's real state. No points, no invented attendance or time totals.
 */

const GREEN = '#1B7A4A';

/** The phase whose completion is the certificate. */
const FINAL_PHASE = { lep: 'certificate', '100bm': 'graduation', mbw: 'graduation' };
const LOCKED_COPY = {
  lep: 'Unlocks after your Final Evaluation',
  '100bm': 'Unlocks at Graduation',
  mbw: 'Unlocks at Graduation',
};

function niceDate(iso) {
  const d = iso ? new Date(`${String(iso).slice(0, 10)}T12:00:00`) : null;
  return d && !Number.isNaN(d.getTime())
    ? d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })
    : '';
}

function masterclassCertificateUrl(profile) {
  const access = profile?.programAccess || {};
  return (
    access.mc?.certificateUrl ||
    access.masterclass?.certificateUrl ||
    profile?.masterclassCertificateUrl ||
    null
  );
}

function certificateState(programId, paid, taskIsDone) {
  const tasks = courseTasks(programId, FINAL_PHASE[programId]);
  if (paid && tasks.length && tasks.every((t) => taskIsDone(programId, t.id))) {
    return { ready: true, text: 'Complete — your certificate is in My Program' };
  }
  return {
    ready: false,
    text: paid ? LOCKED_COPY[programId] || 'Unlocks when you complete the programme' : 'Unlocks after full enrollment',
  };
}

function Row({ icon, label, value, tone, onPress }) {
  const body = (
    <View style={{ flexDirection: 'row', alignItems: 'center', paddingVertical: 10 }}>
      <MaterialIcons name={icon} size={18} color={tone || G.meta} />
      <ILText role="bodySm" color={G.meta} style={{ marginLeft: 10, width: 92, fontSize: 13 }}>
        {label}
      </ILText>
      <ILText role="label" color={tone || G.ink} style={{ flex: 1, fontSize: 13.5, lineHeight: 19 }}>
        {value}
      </ILText>
      {onPress ? <MaterialIcons name="chevron-right" size={20} color={G.meta} /> : null}
    </View>
  );
  return onPress ? (
    <Pressable onPress={onPress} accessibilityRole="button" accessibilityLabel={`${label}: ${value}`}>
      {body}
    </Pressable>
  ) : (
    body
  );
}

function SectionTitle({ children }) {
  return (
    <ILText role="title" color={G.ink} style={{ marginTop: 22, fontFamily: IL_FONTS.display, fontSize: 22 }}>
      {children}
    </ILText>
  );
}

export default function CertificatesScreen({ navigation }) {
  const insets = useSafeAreaInsets();
  const { profile } = useAuth();
  const { progressByProgram, getTaskSubmission } = usePrograms();
  const demo = useCourseDemo();
  const taskIsDone = useMemo(
    () => makeTaskDoneChecker({ isDone: demo.isDone, getTaskSubmission }),
    [demo.isDone, demo.done, getTaskSubmission]
  );

  const programs = useMemo(() => getEnrolledPrograms(profile), [profile]);
  const mcUrl = masterclassCertificateUrl(profile);

  const records = programs.map((p) => {
    const pay = programPaymentStatus(profile, p.id);
    const paid = pay === PAYMENT_STATUS.PAID;
    const { start, end } = learnerProgramDates(profile, p.id);
    const progress = progressByProgram?.[p.id] || { done: 0, total: 0 };
    return {
      ...p,
      pay,
      paid,
      batch: learnerBatchLabel(profile, p.id),
      dates: start ? [niceDate(start), niceDate(end)].filter(Boolean).join(' → ') : '',
      progress,
      certificate: certificateState(p.id, paid, taskIsDone),
    };
  });

  return (
    <Page>
      <StatusBar style="dark" />
      <View style={{ paddingTop: Math.max(insets.top, 8) }}>
        <GlassBackBar title="Certificates & record" onBack={() => navigation.goBack()} />
      </View>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: Math.max(insets.bottom, 16) + 28 }}
      >
        {records.length ? <SectionTitle>Program record</SectionTitle> : null}
        {records.map((r) => (
          <WhiteCard key={r.id} style={{ marginTop: 12, borderRadius: 22, padding: 16 }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
              <ILText role="eyebrow" color={G.meta} style={[af, { fontSize: 10, flex: 1 }]}>
                {r.title}
              </ILText>
              <View
                style={{
                  paddingHorizontal: 10,
                  paddingVertical: 4,
                  borderRadius: 999,
                  backgroundColor: r.paid ? 'rgba(27,122,74,0.12)' : 'rgba(237,29,36,0.10)',
                }}
              >
                <ILText role="eyebrow" color={r.paid ? GREEN : G.cta} style={[af, { fontSize: 9 }]}>
                  {r.paid ? 'Enrolled' : r.pay === PAYMENT_STATUS.REGISTER ? 'Registered' : 'Pending'}
                </ILText>
              </View>
            </View>

            <View style={{ marginTop: 6 }}>
              <Row icon="groups" label="Batch" value={r.batch || 'Not chosen yet'} />
              {r.dates ? <Row icon="event" label="Dates" value={r.dates} /> : null}
              <Row
                icon="receipt-long"
                label="Payment"
                value={
                  r.paid
                    ? 'Registration ✓ · Programme balance ✓'
                    : r.pay === PAYMENT_STATUS.REGISTER
                      ? 'Registration ✓ · Balance due'
                      : 'Registration pending'
                }
                tone={r.paid ? GREEN : undefined}
                onPress={() =>
                  r.paid
                    ? navigation.navigate('Orders')
                    : navigation.navigate('PaymentEnrollment', { programId: r.id })
                }
              />
              <Row
                icon="task-alt"
                label="Tasks"
                value={r.progress.total ? `${r.progress.done} of ${r.progress.total} done` : 'None open yet'}
              />
            </View>
          </WhiteCard>
        ))}

        <SectionTitle>Certificates</SectionTitle>
        <WhiteCard style={{ marginTop: 12, borderRadius: 22, paddingHorizontal: 16, paddingVertical: 6 }}>
          {records.map((r) => (
            <Row
              key={r.id}
              icon={r.certificate.ready ? 'workspace-premium' : 'lock-outline'}
              label={r.shortLabel || r.code}
              value={r.certificate.text}
              tone={r.certificate.ready ? GREEN : undefined}
              onPress={r.certificate.ready ? () => navigation.navigate('MyProgram') : undefined}
            />
          ))}
          {mcUrl ? (
            <Row
              icon="workspace-premium"
              label="Masterclass"
              value="Issued · view or download"
              tone={GREEN}
              onPress={() => Linking.openURL(mcUrl).catch(() => {})}
            />
          ) : null}
          {!records.length && !mcUrl ? (
            <ILText role="bodySm" color={G.meta} style={{ paddingVertical: 14 }}>
              Your certificates appear here when you complete a programme.
            </ILText>
          ) : null}
        </WhiteCard>
      </ScrollView>
    </Page>
  );
}

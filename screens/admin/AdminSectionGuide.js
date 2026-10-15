import React, { useState } from 'react';
import { View } from 'react-native';
import Pressable from '../../components/il/Press';
import { A, Card, T } from './adminUi';

/** Plain-language help — one card per CMS section. */
export const SECTION_HELP = {
  batches: {
    title: 'Batch calendar',
    subtitle:
      'One record per LEP cohort: orientation Thursday, weekend Day 1–2 (9 AM–7 PM IST), then all v1.5 sessions with dates and join links.',
    steps: [
      'Name the batch (e.g. month + cohort).',
      'Pick Orientation Thursday — Day 1 Saturday is calculated automatically (same weekend).',
      'Click Generate LEP v1.5 schedule, then paste Zoom links per session.',
      'Save — staff can view; PL/Admin can edit.',
      'Messages to learners still use session codes (S0, S1, …); when auto-send is live, times come from the learner’s assigned batch.',
    ],
    not: 'Does not upload slides or send push by itself. Use Batch materials and Messages to learners for those.',
  },
  content: {
    title: 'Batch materials',
    subtitle: 'Files and links learners open inside a task (e.g. schedule PDF on Program Schedule).',
    steps: [
      'Upload a file or add a link — give it a clear title.',
      'Choose Program (usually LEP) and type (slides, recording, worksheet, link).',
      'In Linked tasks, enter the task code from the journey (e.g. T12 or lep-orientation-schedule).',
      'Save — learners see it under that task as “Batch materials”.',
    ],
    not: 'Uploading here does not send a phone alert. Use “Messages to learners” for push and the in-app bell.',
  },
  notifications: {
    title: 'Messages to learners',
    subtitle:
      'Phone notification tray + in-app bell (🔔). Tied to session codes; actual dates come from Batch calendar per cohort.',
    steps: [
      'First time: Load LEP defaults — imports standard journey messages.',
      'Click a message in the list to edit title, body, and channels (Push / WhatsApp / Email).',
      'Add batch files from Batch materials using “Attached content” in the editor.',
      'Send test: paste a learner’s Firebase UID (from Firestore users) to try push + bell.',
      'Sending rules: quiet hours and daily cap — used when automatic sending is live.',
    ],
    not: 'Not the IL Guide coach card on Home/Learn. Not a replacement for CEM WhatsApp until that channel is wired.',
  },
  ilguide: {
    title: 'IL Guide coach',
    subtitle: 'One short in-app tip on Home, Learn and Community — not push, not the bell list.',
    steps: [
      'Keep “IL Guide is on” enabled unless you want it hidden everywhere.',
      'Choose what it may do: welcome, nudge, suggest next lesson, event hint.',
      'Choose screens: first login, Home, Learn, Community.',
      'Add approved quotations and program notes — it only uses what you enter here.',
      'Save changes — the app picks them up within about a minute.',
    ],
    not: 'Does not send push or appear in Notifications. For alerts, use Messages to learners.',
  },
};

export function CemHelpCard({ sectionKey }) {
  const help = SECTION_HELP[sectionKey];
  const [open, setOpen] = useState(true);
  if (!help) return null;

  return (
    <Card style={{ marginBottom: 18, backgroundColor: '#FBF8F2', borderColor: '#E8DFD0' }}>
      <Pressable
        onPress={() => setOpen((v) => !v)}
        accessibilityRole="button"
        style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}
      >
        <View style={{ flex: 1, paddingRight: 12 }}>
          <T weight="bold" size={15} style={{ marginBottom: 4 }}>
            How CEM uses this
          </T>
          <T size={13} color={A.muted}>{help.subtitle}</T>
        </View>
        <T size={12} weight="semibold" color={A.navy}>
          {open ? 'Hide' : 'Show'}
        </T>
      </Pressable>
      {open ? (
        <View style={{ marginTop: 14 }}>
          {help.steps.map((line, i) => (
            <T key={i} size={13} color={A.ink} style={{ marginBottom: 6, paddingLeft: 4 }}>
              {i + 1}. {line}
            </T>
          ))}
          <View
            style={{
              marginTop: 10,
              paddingTop: 10,
              borderTopWidth: 1,
              borderTopColor: A.line,
            }}
          >
            <T size={12} weight="semibold" color={A.navy} style={{ marginBottom: 4 }}>
              This is not
            </T>
            <T size={12} color={A.muted}>{help.not}</T>
          </View>
        </View>
      ) : null}
    </Card>
  );
}

export function AdminWorkflowStrip() {
  return (
    <View style={{ paddingHorizontal: 20, marginBottom: 18 }}>
      <T size={11} weight="semibold" color="#C8C2B6" style={{ marginBottom: 8, letterSpacing: 0.3 }}>
        TYPICAL ORDER
      </T>
      <T size={12} color="#E8E4DC" style={{ lineHeight: 18 }}>
        1 Batch calendar → 2 Batch materials → 3 Messages → 4 IL Guide
      </T>
    </View>
  );
}

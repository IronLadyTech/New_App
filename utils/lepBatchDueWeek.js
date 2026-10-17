import { addCalendarDays, orientationFromDay1Saturday } from './lepBatchSchedule';
import { LEP_SESSION_TEMPLATE } from '../constants/lepSessionTemplate';
import { daysFromDay1, todayIsoIST } from './lepDailyPractice';

const DOW_SHORT = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const MON_SHORT = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

const DUE_TEMPLATES = [
  {
    title: 'Fill the CoDeSeF Sheet',
    tag: 'LEP',
    kind: 'Form · pre-program',
    icon: 'edit-note',
    taskId: 'lep-prep-codesef-sheet',
    anchor: 'orientation',
  },
  {
    title: 'Complete NSDC Registration',
    tag: 'LEP',
    kind: 'Link · pre-program',
    icon: 'how-to-reg',
    taskId: 'lep-prep-nsdc',
    anchor: 'nsdc',
  },
  {
    title: 'Program Access Essentials',
    tag: 'LEP',
    kind: 'Checklist · orientation',
    icon: 'checklist',
    taskId: 'lep-orientation-access',
    anchor: 'day1',
  },
];

function istTodayKey(now = new Date()) {
  return todayIsoIST();
}

function parseLocal(iso) {
  const [y, m, d] = String(iso).split('-').map(Number);
  return new Date(y, m - 1, d);
}

function daysBetween(fromIso, toIso) {
  const a = parseLocal(fromIso);
  const b = parseLocal(toIso);
  return Math.round((b - a) / 86400000);
}

function formatDay1Sub(day1Date) {
  if (!day1Date) return 'This week';
  const d = parseLocal(day1Date);
  return `Before Day 1 · ${DOW_SHORT[d.getDay()]} ${d.getDate()} ${MON_SHORT[d.getMonth()]}`;
}

function dueLabelForAnchor(anchorIso, { beforeDay1 = false } = {}, now = new Date()) {
  if (!anchorIso) return 'This week';
  const today = istTodayKey(now);
  const diff = daysBetween(today, anchorIso);

  if (beforeDay1) {
    if (diff < 0) return 'Overdue';
    if (diff === 0) return 'Due today';
    if (diff === 1) return 'Due tomorrow';
    const d = parseLocal(anchorIso);
    return `Before ${DOW_SHORT[d.getDay()]}`;
  }

  if (diff < 0) return 'Overdue';
  if (diff === 0) return 'Due today';
  if (diff === 1) return 'Due tomorrow';
  const d = parseLocal(anchorIso);
  return `Due ${DOW_SHORT[d.getDay()]}`;
}

function anchorDates(batch) {
  if (!batch?.day1Date) return null;
  const day1 = batch.day1Date;
  const orientation = batch.orientationDate || orientationFromDay1Saturday(day1);
  const nsdc = addCalendarDays(orientation, 1);
  return { orientation, nsdc, day1 };
}

function sessionDueItems(batch, now = new Date()) {
  const day1 = batch?.day1Date ? String(batch.day1Date).slice(0, 10) : '';
  if (!day1) return [];
  const today = istTodayKey(now);
  const offset = daysFromDay1(today, day1);
  if (offset == null) return [];

  // Upcoming core sessions in the next 7 days (LEP_Flow offsets).
  return LEP_SESSION_TEMPLATE.filter((s) => s.kind === 'core')
    .map((s) => {
      const dateIso = addCalendarDays(day1, s.dayOffset);
      const diff = daysBetween(today, dateIso);
      return { session: s, dateIso, diff };
    })
    .filter((row) => row.diff >= 0 && row.diff <= 7)
    .slice(0, 3)
    .map(({ session, dateIso, diff }) => ({
      title: session.title,
      tag: 'LEP',
      kind: `${session.weekLabel} · ${session.startTime} IST`,
      icon: 'event',
      taskId: null,
      sessionCode: session.code,
      due:
        diff === 0 ? 'Live today' : diff === 1 ? 'Tomorrow' : `Due ${DOW_SHORT[parseLocal(dateIso).getDay()]}`,
      urgent: diff <= 1,
    }));
}

/** Due-this-week rows from batch Day 1 + LEP_Flow sessions. */
export function buildLepDueWeek(batch, now = new Date()) {
  const anchors = anchorDates(batch);
  const offset = batch?.day1Date
    ? daysFromDay1(istTodayKey(now), String(batch.day1Date).slice(0, 10))
    : null;

  // After Day 1 weekend — show live session dues from the flow PDF.
  if (anchors && offset != null && offset >= 0) {
    const sessions = sessionDueItems(batch, now);
    const d = parseLocal(anchors.day1);
    return {
      sub: `Your batch · Day 1 ${DOW_SHORT[d.getDay()]} ${d.getDate()} ${MON_SHORT[d.getMonth()]}`,
      items:
        sessions.length > 0
          ? sessions
          : [
              {
                title: 'Continue Week practice',
                tag: 'LEP',
                kind: 'Journey · this week',
                icon: 'flag',
                taskId: null,
                due: 'This week',
                urgent: false,
              },
            ],
    };
  }

  const sub = batch?.day1Date ? formatDay1Sub(batch.day1Date) : 'This week';

  if (!anchors) {
    return {
      sub,
      items: DUE_TEMPLATES.map((t) => ({
        ...t,
        due: t.anchor === 'orientation' ? 'Due Thu' : t.anchor === 'nsdc' ? 'Due Fri' : 'Before Sat',
        urgent: t.anchor === 'orientation',
      })),
    };
  }

  const map = {
    orientation: anchors.orientation,
    nsdc: anchors.nsdc,
    day1: anchors.day1,
  };

  const items = DUE_TEMPLATES.map((t) => {
    const anchorIso = map[t.anchor];
    const beforeDay1 = t.anchor === 'day1';
    const due = dueLabelForAnchor(anchorIso, { beforeDay1 }, now);
    const diff = daysBetween(istTodayKey(now), anchorIso);
    return {
      title: t.title,
      tag: t.tag,
      kind: t.kind,
      icon: t.icon,
      taskId: t.taskId,
      due,
      urgent: diff >= 0 && diff <= 1,
    };
  });

  return { sub, items };
}

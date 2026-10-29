import { PROGRAM_JOURNEY, isTaskDoneStatus } from '../constants/programs';
import {
  getEnrolledPrograms,
  learnerBatchId,
  learnerBhagText,
  learnerDomainText,
  programPaymentStatus,
} from './programAccess';
import { submissionsByTaskId } from '../services/programs';
import { primaryProgramForGuide } from './ilGuideJourney';

/**
 * Participant context object passed to IL Guide API (mirrors spec).
 * Never guess missing fields — omit them.
 */
export function buildILGuideContext({
  user,
  profile,
  enrolledPrograms = [],
  progressByProgram = {},
  tasksByProgram = {},
  subsByProgram = {},
  announcements = [],
  upcomingEventList = [],
  surface,
  firstLogin = false,
  journeyProgress = null,
  journeyNextTask = null,
  primaryProgramId = null,
  lepPractice = null,
  lepBatch = null,
  lepDues = null,
  upcomingUnlocks = null,
}) {
  const name =
    profile?.displayName ||
    user?.displayName ||
    profile?.email?.split('@')[0] ||
    null;

  const guideProgramId = primaryProgramId || primaryProgramForGuide(profile);
  const ordered = [...enrolledPrograms].sort((a, b) => {
    if (a.id === guideProgramId) return -1;
    if (b.id === guideProgramId) return 1;
    return (a.order ?? 0) - (b.order ?? 0);
  });

  const programs = ordered.map((p) => ({
    id: p.id,
    code: p.shortLabel,
    title: p.title,
    paymentStatus: programPaymentStatus(profile, p.id),
    progress: progressByProgram[p.id] || { percent: 0, done: 0, total: 0 },
  }));

  const primary = programs.find((p) => p.id === guideProgramId) || programs[0] || null;
  const primaryTasks = primary
    ? tasksByProgram[primary.id] || []
    : [];
  const primarySubs = primary
    ? submissionsByTaskId(subsByProgram[primary.id] || [])
    : {};

  const dues = Array.isArray(lepDues) ? lepDues : [];
  const openDue = dues.find((d) => d && !d.done && (d.taskId || d.title));
  const lmsNextTask = primaryTasks.find(
    (t) => !isTaskDoneStatus(primarySubs[t.id]?.status)
  );
  // Prefer an open due, then journey next (if not already done in dues), then LMS.
  let nextTask = null;
  if (openDue?.taskId || openDue?.title) {
    nextTask = {
      id: openDue.taskId || openDue.id || 'due',
      title: openDue.title,
      type: openDue.type || null,
    };
  } else if (
    journeyNextTask?.id &&
    !dues.some((d) => d?.taskId === journeyNextTask.id && d.done)
  ) {
    nextTask = journeyNextTask;
  } else if (lmsNextTask) {
    nextTask = lmsNextTask;
  }

  const nextCalendarEvent = upcomingEventList?.[0];
  const upcomingEvent = nextCalendarEvent
    ? {
        id: nextCalendarEvent.id,
        title: nextCalendarEvent.title,
        body:
          nextCalendarEvent.description ||
          [nextCalendarEvent.date, nextCalendarEvent.time]
            .filter(Boolean)
            .join(' · '),
      }
    : announcements?.[0]
      ? {
          id: announcements[0].id,
          title: announcements[0].title,
          body: announcements[0].body || announcements[0].message || '',
        }
      : null;

  // What she already told us is used, never asked again; only missing items may be suggested.
  // Income is never sent to IL Guide.
  const location = profile?.city || profile?.location || null;
  const domain = learnerDomainText(profile) || null;
  const goalText = learnerBhagText(profile) || null;
  const profileMissing = [!location && 'city', !domain && 'domain', !goalText && 'bhag'].filter(Boolean);

  const ctx = {
    participantId: user?.uid,
    surface,
    firstLogin,
    name,
    programs,
    primaryProgram: primary,
    location,
    domain,
    goal: goalText ? { text: goalText } : null,
    profileMissing: profileMissing.length ? profileMissing : null,
    batchId: learnerBatchId(profile),
    phase: profile?.currentPhase || profile?.phase || null,
    nextTask: nextTask
      ? { id: nextTask.id, title: nextTask.title, type: nextTask.type }
      : null,
    progressPercent: Math.max(
      primary?.progress?.percent ?? 0,
      journeyProgress?.percent ?? 0
    ),
    journeyProgress,
    upcomingEvent,
    lepPractice,
    lepBatch,
    lepDues,
    // Phases still closed: when each opens (or why it can't yet). Empty list = nothing waiting.
    upcomingUnlocks: Array.isArray(upcomingUnlocks) && upcomingUnlocks.length ? upcomingUnlocks : null,
  };

  // Strip null/empty optional fields
  Object.keys(ctx).forEach((k) => {
    if (ctx[k] === null || ctx[k] === undefined || ctx[k] === '') {
      delete ctx[k];
    }
  });

  return ctx;
}

export function programLabel(program) {
  if (!program) return 'your program';
  return program.shortLabel || program.code || program.title || 'your program';
}

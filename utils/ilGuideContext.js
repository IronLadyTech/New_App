import { PROGRAM_JOURNEY, isTaskDoneStatus } from '../constants/programs';
import { getEnrolledPrograms, learnerBatchId, programPaymentStatus } from './programAccess';
import { submissionsByTaskId } from '../services/programs';

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
  surface,
  firstLogin = false,
}) {
  const name =
    profile?.displayName ||
    user?.displayName ||
    profile?.email?.split('@')[0] ||
    null;

  const programs = enrolledPrograms.map((p) => ({
    id: p.id,
    code: p.shortLabel,
    title: p.title,
    paymentStatus: programPaymentStatus(profile, p.id),
    progress: progressByProgram[p.id] || { percent: 0, done: 0, total: 0 },
  }));

  const primary = programs[0] || null;
  const primaryTasks = primary
    ? tasksByProgram[primary.id] || []
    : [];
  const primarySubs = primary
    ? submissionsByTaskId(subsByProgram[primary.id] || [])
    : {};

  const nextTask = primaryTasks.find(
    (t) => !isTaskDoneStatus(primarySubs[t.id]?.status)
  );

  const upcomingEvent = announcements?.[0]
    ? {
        id: announcements[0].id,
        title: announcements[0].title,
        body: announcements[0].body || announcements[0].message || '',
      }
    : null;

  const ctx = {
    participantId: user?.uid,
    surface,
    firstLogin,
    name,
    programs,
    primaryProgram: primary,
    location: profile?.city || profile?.location || null,
    domain: profile?.domain || profile?.roleTitle || profile?.jobTitle || null,
    batchId: learnerBatchId(profile),
    phase: profile?.currentPhase || profile?.phase || null,
    nextTask: nextTask
      ? { id: nextTask.id, title: nextTask.title, type: nextTask.type }
      : null,
    progressPercent: primary?.progress?.percent ?? 0,
    upcomingEvent,
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

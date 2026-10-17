/**
 * Deploy to D:\LMS\new_lms\functions — register in index.js:
 *   exports.ilGuideWhisper = require('./ilGuideWhisper').ilGuideWhisper;
 *
 * Callable: ilGuideWhisper({ context })
 * Uses cms_config/ilGuide + rule-based generation (same voice as app fallback).
 * Optional: set OPENAI_API_KEY for LLM layer (see il-guide-api/app/generator.py).
 */
const { onCall, HttpsError } = require('firebase-functions/v2/https');
const { initializeApp, getApps } = require('firebase-admin/app');
const { getFirestore } = require('firebase-admin/firestore');

if (!getApps().length) initializeApp();
const db = getFirestore();

const DEFAULT_QUOTES = [
  {
    id: 'q1',
    text: 'The task of the leader is to get their people from where they are to where they have not been.',
    author: 'Henry Kissinger',
  },
  {
    id: 'q2',
    text: 'Leadership is the capacity to translate vision into reality.',
    author: 'Warren Bennis',
  },
];

function programLabel(ctx) {
  const p = ctx.primaryProgram;
  if (!p) return 'your program';
  return p.code || p.shortLabel || p.title || 'your program';
}

function pickQuote(quotes, excludeId) {
  const pool = quotes.filter((q) => q.id !== excludeId);
  const use = pool.length ? pool : quotes;
  return use[Math.floor(Math.random() * use.length)];
}

function generate(ctx, job, quotes = DEFAULT_QUOTES) {
  const name = ctx.name ? String(ctx.name).split(' ')[0] : null;
  const prog = programLabel(ctx);
  const pct = ctx.progressPercent || 0;
  const next = ctx.nextTask;
  const surface = ctx.surface || 'home';

  if (job === 'onboard' || ctx.firstLogin) {
    const loc = ctx.location ? ` in ${ctx.location}` : '';
    const dom = ctx.domain ? `, coming from ${ctx.domain}` : '';
    const message = name
      ? `Welcome, ${name}. You're registered for ${prog}${loc}${dom}. First step: open My Program and complete your next task.`
      : `Welcome. You're registered for ${prog}. Open My Program when you're ready.`;
    return { id: 'onboard-1', message, job: 'onboard' };
  }

  if (job === 'recommend' || surface === 'learn') {
    if (next) {
      return {
        id: `learn-rec-${next.id}`,
        message: `Curated with your facilitators: start with "${next.title}" — it's the right next move in ${prog}.`,
        job: 'recommend',
        taskId: next.id,
      };
    }
    return {
      id: 'learn-all-done',
      message: `You've cleared the current ${prog} list. Revisit any task that needs improvement, or check Home for announcements.`,
      job: 'recommend',
    };
  }

  if (job === 'event' && ctx.upcomingEvent?.title) {
    return {
      id: `event-${ctx.upcomingEvent.id}`,
      message: `Upcoming: ${ctx.upcomingEvent.title}. Worth blocking time — it connects directly to ${prog}.`,
      job: 'event',
    };
  }

  if (surface === 'community') {
    const quote = pickQuote(quotes);
    return {
      id: `community-${quote.id}`,
      message: `"${quote.text}" — ${quote.author}. Share what you're applying from ${prog} in the feed.`,
      job: 'nudge',
    };
  }

  const dues = Array.isArray(ctx.lepDues) ? ctx.lepDues : [];
  const openDue = dues.find((d) => d && !d.done);
  const nextOpen =
    next && !dues.some((d) => d && d.taskId === next.id && d.done) ? next : null;
  const lp = ctx.lepPractice;

  if (lp && lp.practiceDoneToday < lp.practiceTotalToday) {
    const left = lp.practiceTotalToday - lp.practiceDoneToday;
    return {
      id: 'home-lep-practice-open',
      message: name
        ? `${name}, you have ${left} practice item(s) left today.`
        : `You have ${left} practice item(s) left today.`,
      job: 'nudge',
    };
  }

  if (openDue?.title) {
    return {
      id: `home-lep-due-${openDue.taskId || 'open'}`,
      message: name
        ? `${name}, ${openDue.title} is still open this week. Clear it while you have momentum.`
        : `${openDue.title} is still open this week. Clear it while you have momentum.`,
      job: 'nudge',
      taskId: openDue.taskId || undefined,
    };
  }

  if (nextOpen && pct < 100) {
    return {
      id: `home-progress-${nextOpen.id}`,
      message: name
        ? `${name}, you're at ${pct}% in ${prog}. Next up: ${nextOpen.title}.`
        : `You're at ${pct}% in ${prog}. Next up: ${nextOpen.title}.`,
      job: 'nudge',
      taskId: nextOpen.id,
    };
  }

  if (ctx.lepBatch?.nextSessionTitle) {
    const when = ctx.lepBatch.nextSessionWhen ? ` (${ctx.lepBatch.nextSessionWhen})` : '';
    return {
      id: 'home-lep-next-session',
      message: name
        ? `${name}, next on your batch: ${ctx.lepBatch.nextSessionTitle}${when}.`
        : `Next on your batch: ${ctx.lepBatch.nextSessionTitle}${when}.`,
      job: 'nudge',
    };
  }

  if (lp && lp.practiceDoneToday >= (lp.practiceTotalToday || 0)) {
    return {
      id: 'home-lep-caught-up',
      message: name
        ? `${name}, today’s practice is done. You’re clear — come back tomorrow sharp.`
        : `Today’s practice is done. You’re clear — come back tomorrow sharp.`,
      job: 'nudge',
    };
  }

  const quote = pickQuote(quotes);
  return {
    id: quote.id,
    message: `"${quote.text}" — ${quote.author}. Keep the momentum going in ${prog}.`,
    job: 'nudge',
  };
}

exports.ilGuideWhisper = onCall({ region: 'us-central1' }, async (request) => {
  if (!request.auth) {
    throw new HttpsError('unauthenticated', 'Sign in to use IL Guide.');
  }

  const context = request.data?.context;
  if (!context || typeof context !== 'object') {
    throw new HttpsError('invalid-argument', 'Missing context.');
  }

  let cfg = null;
  try {
    const snap = await db.collection('cms_config').doc('ilGuide').get();
    cfg = snap.exists ? snap.data() : null;
  } catch {
    cfg = null;
  }

  if (cfg?.enabled === false) {
    return { id: 'off', message: '', job: 'nudge' };
  }

  const surface = context.surface || 'home';
  if (cfg?.surfaces && cfg.surfaces[surface] === false) {
    return { id: 'off', message: '', job: 'nudge' };
  }

  let job = 'nudge';
  if (context.firstLogin) job = 'onboard';
  else if (surface === 'learn') job = 'recommend';
  else if (surface === 'home' && context.upcomingEvent) job = 'event';

  if (cfg?.jobs && cfg.jobs[job] === false) {
    if (cfg.jobs.nudge === false) return { id: 'off', message: '', job: 'nudge' };
    job = 'nudge';
  }

  const activeQuotes = (cfg?.quotations || []).filter((q) => q.active !== false && q.text && q.author);
  const result = generate(context, job, activeQuotes.length ? activeQuotes : DEFAULT_QUOTES);
  if (context.nextTask?.id && !result.taskId) {
    result.taskId = context.nextTask.id;
  }
  return { ...result, source: 'cloud' };
});

import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  IL_GUIDE_API_KEY,
  IL_GUIDE_API_URL,
  IL_GUIDE_JOBS,
  IL_GUIDE_QUOTATIONS,
  IL_GUIDE_SURFACES,
  IL_GUIDE_USE_FIREBASE,
} from '../constants/ilGuide';
import { programLabel } from '../utils/ilGuideContext';
import { fetchILGuideWhisperFromCloud } from './functions';
import { getConfig } from './cms';
import { CMS_CONFIG_DOCS } from '../constants/cms';

const LAST_KEY = (uid, surface) => `ilguide:last:${uid}:${surface}`;

// Admin CMS settings (cms_config/ilGuide), cached for a minute.
const CONFIG_TTL_MS = 60 * 1000;
let configCache = { at: 0, value: null };

async function getILGuideConfig() {
  if (Date.now() - configCache.at < CONFIG_TTL_MS) return configCache.value;
  try {
    const value = await getConfig(CMS_CONFIG_DOCS.IL_GUIDE);
    configCache = { at: Date.now(), value };
  } catch {
    configCache = { at: Date.now(), value: configCache.value };
  }
  return configCache.value;
}

function activeQuotations(config) {
  const fromCms = (config?.quotations || []).filter((q) => q.active !== false && q.text && q.author);
  return fromCms.length ? fromCms : IL_GUIDE_QUOTATIONS;
}

const JOB_FOR_ENDPOINT = {
  '/onboard': 'onboard',
  '/nudge': 'nudge',
  '/recommend': 'recommend',
  '/event': 'event',
};

async function rememberMessage(uid, surface, messageId) {
  if (!uid || !messageId) return;
  await AsyncStorage.setItem(LAST_KEY(uid, surface), messageId);
}

async function getLastMessageId(uid, surface) {
  if (!uid) return null;
  return AsyncStorage.getItem(LAST_KEY(uid, surface));
}

async function callApi(endpoint, context) {
  if (!IL_GUIDE_API_URL) return null;
  const url = `${IL_GUIDE_API_URL.replace(/\/$/, '')}${endpoint}`;
  const headers = { 'Content-Type': 'application/json' };
  if (IL_GUIDE_API_KEY) {
    headers['X-API-Key'] = IL_GUIDE_API_KEY;
  }
  const res = await fetch(url, {
    method: 'POST',
    headers,
    body: JSON.stringify({ context }),
  });
  if (!res.ok) return null;
  const data = await res.json();
  if (!data?.message) return null;
  return {
    id: data.id || `${endpoint}-${Date.now()}`,
    message: data.message,
    job: data.job || IL_GUIDE_JOBS.NUDGE,
  };
}

/** Local fallback when FastAPI is not deployed — rule-based, spec-aligned voice. */
function localWhisper(context, lastId, quotations = IL_GUIDE_QUOTATIONS) {
  const name = context.name ? context.name.split(' ')[0] : null;
  const prog = context.primaryProgram;
  const progName = programLabel(prog);
  const next = context.nextTask;
  const pct = context.progressPercent ?? 0;

  const candidates = [];

  if (context.firstLogin && context.surface === IL_GUIDE_SURFACES.ONBOARD) {
    const loc = context.location ? ` in ${context.location}` : '';
    const dom = context.domain ? `, coming from ${context.domain}` : '';
    candidates.push({
      id: 'onboard-1',
      job: IL_GUIDE_JOBS.ONBOARD,
      message: name
        ? `Welcome, ${name}. You're registered for ${progName}${loc}${dom}. First step: open Learn and complete your first task.`
        : `Welcome. You're registered for ${progName}. Open Learn and complete your first task when you're ready.`,
    });
  }

  if (context.surface === IL_GUIDE_SURFACES.HOME) {
    const lp = context.lepPractice;
    const dues = Array.isArray(context.lepDues) ? context.lepDues : [];
    const openDue = dues.find((d) => d && !d.done);
    const nextOpen =
      next && !dues.some((d) => d?.taskId === next.id && d.done) ? next : null;

    if (lp && (prog?.id === 'lep' || progName?.includes('LEP'))) {
      const urgentDue = dues.find(
        (d) => d && !d.done && (d.urgent || /overdue|today|tomorrow|live today/i.test(String(d.due || '')))
      );
      if (urgentDue?.title) {
        candidates.unshift({
          id: `home-lep-due-urgent-${urgentDue.taskId || urgentDue.title}`,
          job: IL_GUIDE_JOBS.NUDGE,
          message: name
            ? `${name}, ${urgentDue.title} is ${String(urgentDue.due || 'due soon').toLowerCase()}. Finish it before the live room.`
            : `${urgentDue.title} is ${String(urgentDue.due || 'due soon').toLowerCase()}. Finish it before the live room.`,
        });
      } else if (openDue?.title) {
        candidates.unshift({
          id: `home-lep-due-${openDue.taskId || openDue.title}`,
          job: IL_GUIDE_JOBS.NUDGE,
          message: name
            ? `${name}, ${openDue.title} is still open this week. Clear it while you have momentum.`
            : `${openDue.title} is still open this week. Clear it while you have momentum.`,
        });
      }

      const openPr = context.openPractice;
      const isPrinciple =
        openPr?.practiceId === 'lep-principle' ||
        /^Revise Principle/i.test(String(openPr?.title || ''));
      if (lp.practiceDoneToday < lp.practiceTotalToday && openPr?.title && !isPrinciple) {
        candidates.unshift({
          id: 'home-lep-practice-open',
          job: IL_GUIDE_JOBS.NUDGE,
          message: name
            ? `${name}, today's next step: ${openPr.title}.`
            : `Today's next step: ${openPr.title}.`,
        });
      } else if (lp.practiceDoneToday < lp.practiceTotalToday) {
        candidates.unshift({
          id: 'home-lep-practice-open',
          job: IL_GUIDE_JOBS.NUDGE,
          message: name
            ? `${name}, you have ${lp.practiceTotalToday - lp.practiceDoneToday} practice item(s) left today.`
            : `You have ${lp.practiceTotalToday - lp.practiceDoneToday} practice item(s) left today.`,
        });
      } else if (lp.ritualsUnlocked && !lp.ritualsDoneToday) {
        candidates.unshift({
          id: 'home-lep-rituals',
          job: IL_GUIDE_JOBS.NUDGE,
          message: name
            ? `${name}, start with the 5 Daily Rituals — two minutes now keeps your streak alive.`
            : 'Start with the 5 Daily Rituals today. That is what counts for your streak.',
        });
      }

      const lb = context.lepBatch;
      if (
        lb?.nextSessionTitle &&
        lp.practiceDoneToday >= (lp.practiceTotalToday || 0) &&
        !openDue
      ) {
        const when = lb.nextSessionWhen ? ` (${lb.nextSessionWhen})` : '';
        candidates.unshift({
          id: 'home-lep-next-session',
          job: IL_GUIDE_JOBS.NUDGE,
          message: name
            ? `${name}, next on your batch: ${lb.nextSessionTitle}${when}.`
            : `Next on your batch: ${lb.nextSessionTitle}${when}.`,
        });
      } else if (
        lp.practiceDoneToday >= (lp.practiceTotalToday || 0) &&
        !openDue &&
        (lp.currentStreak || 0) >= 1
      ) {
        candidates.unshift({
          id: `home-lep-caught-up-${lp.currentStreak || 0}`,
          job: IL_GUIDE_JOBS.NUDGE,
          message: name
            ? `${name}, today’s practice is done${lp.currentStreak ? ` · ${lp.currentStreak}-day streak` : ''}. You’re clear — come back tomorrow sharp.`
            : `Today’s practice is done. You’re clear — come back tomorrow sharp.`,
        });
      }
    }

    // Too early: everything open is done and the next tasks are still locked. Say when they
    // open, and give her something worth doing meanwhile instead of "you're caught up".
    const nextUnlock = (context.upcomingUnlocks || []).find((u) => u?.opensLabel);
    if (!openDue && !nextOpen && nextUnlock) {
      candidates.unshift({
        id: `home-early-${nextUnlock.opensOn}`,
        job: IL_GUIDE_JOBS.RECOMMEND,
        message: name
          ? `${name}, you're ahead. ${nextUnlock.phase} opens ${nextUnlock.opensLabel}. Until then, watch the 27 Principles, a C-Suite League story or an Iron Lady Army podcast.`
          : `You're ahead. ${nextUnlock.phase} opens ${nextUnlock.opensLabel}. Until then, watch the 27 Principles, a C-Suite League story or an Iron Lady Army podcast.`,
      });
    }

    if (nextOpen && pct < 100) {
      candidates.push({
        id: `home-progress-${nextOpen.id}`,
        job: IL_GUIDE_JOBS.NUDGE,
        message: name
          ? `${name}, you're at ${pct}% in ${progName}. Next up: ${nextOpen.title}.`
          : `You're at ${pct}% in ${progName}. Next up: ${nextOpen.title}.`,
      });
    } else if (!nextUnlock && (pct >= 100 || (!nextOpen && !openDue))) {
      // Caught up with time to spare: something worth watching, not an empty "all done".
      const spare = [
        {
          id: 'home-spare-csuite',
          text: 'watch a C-Suite League story — women who made it to the top table',
        },
        { id: 'home-spare-podcast', text: 'play an Iron Lady Army podcast on your next commute' },
      ];
      spare.forEach((s2) =>
        candidates.push({
          id: s2.id,
          job: IL_GUIDE_JOBS.RECOMMEND,
          message: name
            ? `${name}, you're caught up in ${progName}. With the time you have, ${s2.text}.`
            : `You're caught up in ${progName}. With the time you have, ${s2.text}.`,
        })
      );
    }

    const quote = pickQuote(quotations, lastId);
    if (quote) {
      candidates.push({
        id: quote.id,
        job: IL_GUIDE_JOBS.NUDGE,
        message: `"${quote.text}" — ${quote.author}. Keep the momentum going in ${progName}.`,
      });
    }

    if (context.upcomingEvent?.title) {
      candidates.push({
        id: `event-${context.upcomingEvent.id}`,
        job: IL_GUIDE_JOBS.EVENT,
        message: `Upcoming: ${context.upcomingEvent.title}. Worth blocking time — it connects directly to ${progName}.`,
      });
    }
  }

  if (context.surface === IL_GUIDE_SURFACES.LEARN) {
    if (next) {
      candidates.push({
        id: `learn-rec-${next.id}`,
        job: IL_GUIDE_JOBS.RECOMMEND,
        message: `Curated with your facilitators: start with "${next.title}" — it's the right next move in ${progName}.`,
      });
    } else {
      candidates.push({
        id: 'learn-all-done',
        job: IL_GUIDE_JOBS.RECOMMEND,
        message: `You've cleared the current ${progName} list. Revisit any task that needs improvement, or check Home for announcements.`,
      });
    }
  }

  if (context.surface === IL_GUIDE_SURFACES.COMMUNITY) {
    const quote = pickQuote(quotations, lastId, 1);
    if (quote) {
      candidates.push({
        id: `community-${quote.id}`,
        job: IL_GUIDE_JOBS.NUDGE,
        message: `"${quote.text}" — ${quote.author}. Share what you're applying from ${progName} in the feed.`,
      });
    }
    candidates.push({
      id: 'community-engage',
      job: IL_GUIDE_JOBS.NUDGE,
      message: `Your cohort is here. Post a win or a question — IL Guide keeps you moving, but the community carries you.`,
    });
  }

  const fresh = candidates.filter((c) => c.id !== lastId);
  const pool = fresh.length ? fresh : candidates;
  return pool[0] || {
    id: 'fallback',
    job: IL_GUIDE_JOBS.NUDGE,
    message: 'Open Learn and take the next step in your program.',
  };
}

function pickQuote(quotations, lastId, offset = 0) {
  if (!quotations.length) return null;
  const available = quotations.filter((q) => q.id !== lastId);
  if (!available.length) return quotations[offset % quotations.length];
  const idx = (Date.now() + offset) % available.length;
  return available[idx];
}

export async function fetchILGuideWhisper(context) {
  const { surface, participantId: uid } = context;
  const config = await getILGuideConfig();
  if (config?.enabled === false) return null;
  if (config?.surfaces && config.surfaces[surface] === false) return null;
  const quotations = activeQuotations(config);
  const lastId = await getLastMessageId(uid, surface);

  let endpoint = '/nudge';
  if (context.firstLogin) endpoint = '/onboard';
  else if (surface === IL_GUIDE_SURFACES.LEARN) endpoint = '/recommend';
  else if (surface === IL_GUIDE_SURFACES.HOME && context.upcomingEvent) {
    endpoint = '/event';
  }
  if (config?.jobs && config.jobs[JOB_FOR_ENDPOINT[endpoint]] === false) {
    // That job is off — fall back to a plain nudge unless nudges are off too.
    if (config.jobs.nudge === false) return null;
    endpoint = '/nudge';
  }

  let result = null;

  if (IL_GUIDE_USE_FIREBASE) {
    try {
      result = await fetchILGuideWhisperFromCloud(context);
    } catch {
      result = null;
    }
  }

  if (!result && IL_GUIDE_API_URL) {
    try {
      result = await callApi(endpoint, context);
    } catch {
      result = null;
    }
  }

  if (!result) {
    result = localWhisper(context, lastId, quotations);
  }

  if (result.id === lastId && result.id !== 'fallback') {
    result = localWhisper({ ...context, firstLogin: false }, lastId, quotations);
  }

  const dues = Array.isArray(context.lepDues) ? context.lepDues : [];
  const resultTaskDone =
    result?.taskId && dues.some((d) => d?.taskId === result.taskId && d.done);
  if (resultTaskDone) {
    result = localWhisper({ ...context, firstLogin: false }, lastId, quotations);
  }

  const openNextId =
    context.nextTask?.id && !dues.some((d) => d?.taskId === context.nextTask.id && d.done)
      ? context.nextTask.id
      : dues.find((d) => d && !d.done)?.taskId || null;
  if (openNextId) {
    result = { ...result, taskId: openNextId };
  } else if (result?.taskId && dues.some((d) => d?.taskId === result.taskId && d.done)) {
    const { taskId: _drop, ...rest } = result;
    result = rest;
  }

  await rememberMessage(uid, surface, result.id);
  return result;
}

export async function markILGuideOnboarded(uid) {
  await AsyncStorage.setItem(`ilguide:onboarded:${uid}`, '1');
}

export async function isILGuideOnboardedLocal(uid) {
  if (!uid) return true;
  return (await AsyncStorage.getItem(`ilguide:onboarded:${uid}`)) === '1';
}

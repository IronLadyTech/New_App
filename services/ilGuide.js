import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  IL_GUIDE_API_KEY,
  IL_GUIDE_API_URL,
  IL_GUIDE_JOBS,
  IL_GUIDE_QUOTATIONS,
  IL_GUIDE_SURFACES,
} from '../constants/ilGuide';
import { programLabel } from '../utils/ilGuideContext';

const LAST_KEY = (uid, surface) => `ilguide:last:${uid}:${surface}`;

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
function localWhisper(context, lastId) {
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
    if (next && pct < 100) {
      candidates.push({
        id: `home-progress-${next.id}`,
        job: IL_GUIDE_JOBS.NUDGE,
        message: name
          ? `${name}, you're at ${pct}% in ${progName}. Next up: ${next.title}.`
          : `You're at ${pct}% in ${progName}. Next up: ${next.title}.`,
      });
    } else if (pct >= 100) {
      candidates.push({
        id: 'home-done',
        job: IL_GUIDE_JOBS.NUDGE,
        message: `${progName} tasks are complete. Check Engage for what's happening in your cohort.`,
      });
    }

    const quote = pickQuote(lastId);
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
    const quote = pickQuote(lastId, 1);
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

function pickQuote(lastId, offset = 0) {
  const available = IL_GUIDE_QUOTATIONS.filter((q) => q.id !== lastId);
  if (!available.length) return IL_GUIDE_QUOTATIONS[offset % IL_GUIDE_QUOTATIONS.length];
  const idx = (Date.now() + offset) % available.length;
  return available[idx];
}

export async function fetchILGuideWhisper(context) {
  const { surface, participantId: uid } = context;
  const lastId = await getLastMessageId(uid, surface);

  let endpoint = '/nudge';
  if (context.firstLogin) endpoint = '/onboard';
  else if (surface === IL_GUIDE_SURFACES.LEARN) endpoint = '/recommend';
  else if (surface === IL_GUIDE_SURFACES.HOME && context.upcomingEvent) {
    endpoint = '/event';
  }

  let result = null;
  try {
    result = await callApi(endpoint, context);
  } catch {
    result = null;
  }

  if (!result) {
    result = localWhisper(context, lastId);
  }

  if (result.id === lastId && result.id !== 'fallback') {
    result = localWhisper({ ...context, firstLogin: false }, lastId);
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

import { addCalendarDays } from './lepBatchSchedule';
import { principleNumberForDay } from './lepDailyPractice';
import { LEP_PRINCIPLE_TITLES } from '../constants/lepPrincipleWatch';
import { PODCASTS } from '../screens/lep/lepData';

const CMS_FRESH_DAYS = 7;
const ARMY_SOON_DAYS = 14;

const PRINCIPLE_MOMENT_BODY =
  'Leadership is practised step by step. Sit with this idea for a minute — pick one small action today if it speaks to you.';

function parseLocalIso(iso) {
  const [y, m, d] = String(iso || '').split('-').map(Number);
  if (!y || !m || !d) return null;
  return new Date(y, m - 1, d);
}

function calendarDaysBetween(fromIso, toIso) {
  const a = parseLocalIso(fromIso);
  const b = parseLocalIso(toIso);
  if (!a || !b) return null;
  return Math.round((b - a) / 86400000);
}

function stampMs(v) {
  if (!v) return 0;
  if (typeof v.toMillis === 'function') return v.toMillis();
  if (typeof v.seconds === 'number') return v.seconds * 1000;
  return Date.parse(v) || 0;
}

function daysSincePublish(post, todayIso) {
  const ms = stampMs(post.createdAt) || Date.parse(post.when || '') || 0;
  if (!ms) return null;
  const pubIso = new Intl.DateTimeFormat('en-CA', {
    timeZone: 'Asia/Kolkata',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).format(new Date(ms));
  return calendarDaysBetween(pubIso, todayIso);
}

function pickFreshCmsPost(posts, todayIso) {
  if (!posts?.length) return null;
  const sorted = [...posts].sort(
    (a, b) => (stampMs(b.createdAt) || Date.parse(b.when || '')) - (stampMs(a.createdAt) || Date.parse(a.when || ''))
  );
  for (const p of sorted) {
    const age = daysSincePublish(p, todayIso);
    if (age != null && age >= 0 && age <= CMS_FRESH_DAYS) return p;
  }
  return null;
}

function pickSoonArmyEvent({ nextOffline, featured, todayIso }) {
  const candidates = [nextOffline, featured].filter(Boolean);
  for (const ev of candidates) {
    if (!ev.dateIso) continue;
    const inDays = calendarDaysBetween(todayIso, ev.dateIso);
    if (inDays != null && inDays >= 0 && inDays <= ARMY_SOON_DAYS) return ev;
  }
  return null;
}

function pickEngageListen(todayIso) {
  if (!PODCASTS.length) return null;
  const t = parseLocalIso(todayIso);
  const dayIndex = t ? Math.floor(t.getTime() / 86400000) : 0;
  const ep = PODCASTS[dayIndex % PODCASTS.length];
  return ep
    ? {
        title: ep.title,
        who: ep.who,
        meta: ep.meta,
        img: ep.img,
        assetKey: ep.assetKey,
      }
    : null;
}

function pickPrincipleMoment(todayIso, day1Iso) {
  const anchor = day1Iso ? addCalendarDays(day1Iso, 2) : todayIso;
  const n = principleNumberForDay(todayIso, anchor);
  const titleBit = LEP_PRINCIPLE_TITLES[n];
  const title = titleBit ? titleBit : `Principle ${n} of the 27`;
  return {
    principleN: n,
    title,
    body: PRINCIPLE_MOMENT_BODY,
    kicker: `Principle ${String(n).padStart(2, '0')}`,
  };
}

/**
 * One optional “moment” between Today’s practice and Due this week — not a checklist item.
 * Priority: fresh CMS post → Army event soon → rotating podcast → principle spotlight.
 */
export function resolveLepHomeMoment({ todayIso, day1Iso, cmsPosts = [], nextOffline, featured }) {
  const cms = pickFreshCmsPost(cmsPosts, todayIso);
  if (cms) {
    return {
      kind: 'cms',
      eyebrow: 'From your Iron Lady team',
      title: cms.title,
      body: cms.body || '',
      videoUrl: cms.videoUrl || '',
      link: cms.link || '',
      imageUrl: cms.imageUrl || '',
      cta: cms.videoUrl ? 'Watch in the app' : cms.link ? 'Open link' : 'See on Engage',
    };
  }

  const army = pickSoonArmyEvent({ nextOffline, featured, todayIso });
  if (army) {
    return {
      kind: 'army',
      eyebrow: 'Iron Lady Army',
      title: army.title,
      body: army.whenLabel || army.meta || '',
      event: army,
      cta: 'Add to calendar',
    };
  }

  const listen = pickEngageListen(todayIso);
  if (listen) {
    return {
      kind: 'listen',
      eyebrow: 'Iron Lady Speaks',
      title: listen.title,
      body: `${listen.who} · ${listen.meta}`,
      img: listen.img,
      assetKey: listen.assetKey,
      cta: 'Play episode',
    };
  }

  const principle = pickPrincipleMoment(todayIso, day1Iso);
  return {
    kind: 'principle',
    eyebrow: 'Today’s leadership idea',
    kicker: principle.kicker,
    title: principle.title,
    body: principle.body,
    principleN: principle.principleN,
    cta: 'Open Engage',
  };
}

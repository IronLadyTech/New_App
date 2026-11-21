import { addCalendarDays } from './lepBatchSchedule';
import { principleNumberForDay } from './lepDailyPractice';
import { LEP_PRINCIPLE_TITLES } from '../constants/lepPrincipleWatch';
import { CASES_ENR, PODCASTS } from '../screens/lep/lepData';
import { videoLength } from '../constants/videoDurations';

const CMS_FRESH_DAYS = 7;
// An Army event takes the card only in its last 3 days; at 14 it sat on Home for two weeks.
const ARMY_SOON_DAYS = 3;

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
        tagline: ep.tagline || '',
        coverFocus: ep.coverFocus || 'right',
        episode: (String(ep.meta || '').match(/Ep\s*\d+/i) || [''])[0],
        // The real length of the recording (the typed "Ep 2 · 22 min" was wrong).
        length: videoLength(ep.assetKey, ''),
        img: ep.img,
        assetKey: ep.assetKey,
      }
    : null;
}

/** A C-suite story, a different one each time it comes round (every third day). */
function pickCsuiteStory(todayIso) {
  if (!CASES_ENR.length) return null;
  const t = parseLocalIso(todayIso);
  const dayIndex = t ? Math.floor(t.getTime() / 86400000) : 0;
  const c = CASES_ENR[Math.floor(dayIndex / 3) % CASES_ENR.length];
  return c || null;
}

/** Today's principle number (1–27), the same one Home's card shows. */
export function todayPrincipleNumber(todayIso, day1Iso) {
  const anchor = day1Iso ? addCalendarDays(day1Iso, 2) : todayIso;
  return principleNumberForDay(todayIso, anchor);
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
 * Priority: fresh CMS post → Army event in the next 3 days → otherwise a new card each day,
 * alternating a podcast episode and a leadership principle.
 */
export function resolveLepHomeMoment({ todayIso, day1Iso, cmsPosts = [], nextOffline, featured, force = null }) {
  // force: the tester preview shows one kind on demand ('cms' | 'army' | 'listen' | 'principle'),
  // using the newest post / next event even when it is outside the usual window.
  const cms =
    force === 'cms'
      ? [...(cmsPosts || [])].sort((a, b) => (stampMs(b.createdAt) || 0) - (stampMs(a.createdAt) || 0))[0] || null
      : force
        ? null
        : pickFreshCmsPost(cmsPosts, todayIso);
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
      // "Posted 2 days ago · Video" on the team-post card.
      postedLabel: (() => {
        const age = daysSincePublish(cms, todayIso);
        const when = age == null ? '' : age <= 0 ? 'Posted today' : age === 1 ? 'Posted yesterday' : `Posted ${age} days ago`;
        const what = cms.videoUrl ? 'Video' : cms.link ? 'Link' : 'Post';
        return [when, what].filter(Boolean).join(' · ');
      })(),
      barLabel: cms.videoUrl ? 'Watch now' : cms.link ? 'Open link' : 'Read',
    };
  }

  const army =
    force === 'army'
      ? featured || nextOffline || null
      : force
        ? null
        : pickSoonArmyEvent({ nextOffline, featured, todayIso });
  if (army) {
    // Date tile and a title split at " · " (sheet titles read "Mega Global Event · 200+ …").
    const d = parseLocalIso(army.dateIso);
    const inDays = calendarDaysBetween(todayIso, army.dateIso);
    const [headTitle, ...restTitle] = String(army.title || '').split(' · ');
    const DOW = ['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'];
    const MON = ['JAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUN', 'JUL', 'AUG', 'SEP', 'OCT', 'NOV', 'DEC'];
    const dateTile = d
      ? { dow: DOW[d.getDay()], day: String(d.getDate()), monthYear: `${MON[d.getMonth()]} ${d.getFullYear()}`, time: army.timeLabel || '' }
      : null;
    const whenWord = inDays === 0 ? 'today' : inDays === 1 ? 'tomorrow' : inDays != null ? `in ${inDays} days` : '';
    const mode = army.mode === 'offline' ? (army.city ? `In person · ${army.city}` : 'In person') : 'Live · Online';
    return {
      headTitle: headTitle || army.title,
      subTitle: restTitle.join(' · '),
      dateTile,
      metaLine: [mode, whenWord].filter(Boolean).join(' · '),
      kind: 'army',
      eyebrow: 'Iron Lady Army',
      title: army.title,
      body: army.whenLabel || army.meta || '',
      event: army,
      cta: 'Add to calendar',
    };
  }

  // Otherwise the card changes every day, in turn: a podcast, a leadership principle, a C-suite
  // story (C-suite was never offered before).
  const t = parseLocalIso(todayIso);
  const turn = force === 'listen' ? 0 : force === 'principle' ? 1 : force === 'csuite' ? 2 : t ? Math.floor(t.getTime() / 86400000) % 3 : 0;
  if (turn === 2) {
    const c = pickCsuiteStory(todayIso);
    if (c) {
      return {
        kind: 'csuite',
        eyebrow: 'Executive stories',
        badgeText: 'EXECUTIVE STORIES',
        badgeIcon: 'work-outline',
        barText: 'Watch Now',
        title: c.title,
        tagline: [c.fn, c.tag].filter(Boolean).join(' · '),
        who: c.who,
        episode: 'C-Suite League',
        length: videoLength(c.assetKey, ''),
        coverFocus: 'left',
        img: c.img,
        assetKey: c.assetKey,
        cta: 'Watch story',
      };
    }
  }
  const listen = turn === 0 ? pickEngageListen(todayIso) : null;
  if (listen) {
    return {
      kind: 'listen',
      eyebrow: 'Iron Lady Speaks',
      title: listen.title,
      tagline: listen.tagline,
      coverFocus: listen.coverFocus,
      who: listen.who,
      episode: listen.episode,
      length: listen.length,
      body: [listen.who, listen.episode, listen.length].filter(Boolean).join(' · '),
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
    // The quote card: the principle as a line, then one question to sit with.
    quote: LEP_PRINCIPLE_TITLES[principle.principleN] || '',
    reflection: 'Sit with this for a minute. Where could you use it today?',
    cta: 'Reflect in one line',
  };
}

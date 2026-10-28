/**
 * Learner-facing shelves for Learn & Engage — not internal names like “C-Suite League”.
 */

import { learnerCityText, learnerDomainText } from './programAccess';

/** @typedef {'case'|'principle'|'podcast'|'executive'|'innovation'|'live'} LearnShelfKind */

/**
 * @param {{ kind?: LearnShelfKind, tag?: string, field?: string, principleN?: string|number }} opts
 */
export function learnShelfLabel(opts = {}) {
  const tag = String(opts.tag || '').trim().toUpperCase();
  const field = String(opts.field || '').trim();
  switch (opts.kind) {
    case 'principle':
      return opts.principleN ? `PRINCIPLE · ${String(opts.principleN).padStart(2, '0')}` : 'PRINCIPLE';
    case 'podcast':
      return 'IRON LADY SPEAKS';
    case 'live':
      return 'LIVE MASTERCLASS';
    case 'innovation':
      return tag ? `INNOVATION · ${tag}` : 'INNOVATION';
    case 'executive': {
      const bit = field || tag || 'LEADERSHIP';
      return `EXECUTIVE STORY · ${bit.toUpperCase()}`;
    }
    case 'case':
    default:
      return tag ? `CASE STUDY · ${tag}` : 'CASE STUDY';
  }
}

/** Map CASES_ENR row → shelf kicker for cards. */
export function learnShelfForCase(row) {
  const tag = row?.tag || row?.fn || '';
  const innovationTags = new Set(['AI', 'TECH', 'CYBER', 'PRODUCT']);
  if (innovationTags.has(String(tag).toUpperCase())) {
    return learnShelfLabel({ kind: 'innovation', tag });
  }
  return learnShelfLabel({ kind: 'case', tag });
}

export function learnFieldFromWho(who) {
  const parts = String(who || '').split('·');
  return parts.length > 1 ? parts[parts.length - 1].trim() : String(who || '').trim();
}

/** Shelf line on Engage video cards (was generic “C-suite”). */
export function engageVideoShelfLabel(item) {
  const field = learnFieldFromWho(item?.who);
  return learnShelfLabel({ kind: 'executive', field });
}

function normField(s) {
  return String(s || '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, ' ')
    .trim();
}

function fieldMatches(profileField, caseFn) {
  const a = normField(profileField);
  const b = normField(caseFn);
  if (!a || !b) return false;
  return a.includes(b) || b.includes(a) || a.split(' ')[0] === b.split(' ')[0];
}

/** Best featured case for “Picked for you” hero — prefers profile field, then featured flag. */
export function learnPickFeaturedCase(profile, cases = []) {
  const list = cases.filter((c) => c?.assetKey);
  if (!list.length) return null;
  const domain = learnerDomainText(profile);
  if (domain) {
    const match = list.find((c) => fieldMatches(domain, c.fn));
    if (match) return match;
  }
  return list.find((c) => c.featured) || list[0];
}

export function learnFeaturedHeadline(profile) {
  const domain = learnerDomainText(profile) || 'your field';
  const city = learnerCityText(profile);
  if (city) return `Picked for women in ${domain} in ${city}`;
  return `Picked for women in ${domain}`;
}

/** Two continue cards with different shelf types when possible. */
export function learnPickContinueRows(profile, cases = [], defaults = []) {
  const featured = learnPickFeaturedCase(profile, cases);
  const rest = cases.filter((c) => c !== featured);
  const second = rest.find((c) => c.tag !== featured?.tag) || rest[0];
  const rows = [];
  if (featured) {
    rows.push({
      tag: learnShelfForCase(featured),
      title: featured.title,
      who: featured.who,
      left: featured.time?.replace(/\s*mins?/i, 'm left') || '8m left',
      pct: 65,
      cta: 'Resume',
      img: featured.img,
      assetKey: featured.assetKey,
    });
  }
  if (second) {
    rows.push({
      tag: learnShelfForCase(second),
      title: second.title,
      who: second.who,
      left: '',
      pct: 35,
      cta: 'Resume',
      img: second.img,
      assetKey: second.assetKey,
    });
  }
  return rows.length ? rows : defaults;
}

export const ENGAGE_VIDEO_SECTION = {
  title: 'Executive stories & innovation',
  sub: 'Case-style talks — technology, AI, leadership, and more',
};

export const LEARN_FRESH_SHELF = 'NEW · LEADERSHIP INSIGHT';

/** Learn → Case studies CTA opens this LEP task (saved in lep_submissions). */
export const LEARN_CASE_INSPIRATION_TASK_ID = 'lep-weekly-1';

/** Bottom CTA on Learn → Case studies (reflection, not weekend triad homework). */
export const LEARN_CASE_INSPIRATION_CARD = {
  kicker: 'YOUR BREAKTHROUGH',
  title: 'Tell us what inspires you',
  body:
    'What are you working toward — and which story here resonates? A few lines save to your Week 1 engagement check-in so your cohort can support you.',
  cta: 'Save my check-in →',
};

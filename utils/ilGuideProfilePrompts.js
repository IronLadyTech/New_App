import { learnerCityText, learnerDomainText } from './programAccess';
import { pickIlGuideMoment } from '../constants/ilGuideMoments';

const ENGAGE_INDUSTRY_OPTIONS = ['Technology', 'Finance', 'Marketing', 'Not now'];
const LEARN_CITY_PROMPT = 'Tell me your city and I’ll show you events near you.';
const ENGAGE_INDUSTRY_PROMPT = 'Want to meet women from your industry?';

/**
 * @returns {{ quote: string, interactive: 'city'|'industry'|'mcq'|null, mcq?: object }}
 */
export function resolveEngageWhisper(profile, uid) {
  if (!learnerDomainText(profile)) {
    return {
      quote: ENGAGE_INDUSTRY_PROMPT,
      interactive: 'industry',
    };
  }
  const moment = pickIlGuideMoment({ uid, surface: 'community' });
  if (moment.kind === 'mcq') {
    return {
      quote: moment.mcq.prompt,
      interactive: 'mcq',
      mcq: moment.mcq,
    };
  }
  return { quote: moment.quote, interactive: null };
}

/**
 * @param {string} defaultQuote — registered tab fallback when city unknown
 */
export function resolveLearnWhisper(profile, uid, defaultQuote) {
  if (!learnerCityText(profile)) {
    return {
      quote: defaultQuote || LEARN_CITY_PROMPT,
      interactive: 'city',
    };
  }
  const moment = pickIlGuideMoment({ uid, surface: 'learn' });
  if (moment.kind === 'mcq') {
    return {
      quote: moment.mcq.prompt,
      interactive: 'mcq',
      mcq: moment.mcq,
    };
  }
  return { quote: moment.quote, interactive: null };
}

export function engageIndustryOptions() {
  return ENGAGE_INDUSTRY_OPTIONS;
}

export { LEARN_CITY_PROMPT, ENGAGE_INDUSTRY_PROMPT };

/** @deprecated use resolveEngageWhisper */
export function engageIlGuideQuote(profile) {
  return resolveEngageWhisper(profile, null).quote;
}

/** @deprecated use resolveEngageWhisper */
export function shouldAskEngageIndustry(profile) {
  return !learnerDomainText(profile);
}

/** @deprecated use resolveLearnWhisper */
export function learnIlGuideQuote(profile, defaultQuote) {
  return resolveLearnWhisper(profile, null, defaultQuote).quote;
}

/** @deprecated use resolveLearnWhisper */
export function shouldAskLearnCity(profile) {
  return !learnerCityText(profile);
}

/** In-app mentor — always branded "IL Guide". */
export const IL_GUIDE_NAME = 'IL Guide';

export const IL_GUIDE_SURFACES = {
  ONBOARD: 'onboard',
  HOME: 'home',
  LEARN: 'learn',
  COMMUNITY: 'community',
};

export const IL_GUIDE_JOBS = {
  ONBOARD: 'onboard',
  NUDGE: 'nudge',
  RECOMMEND: 'recommend',
  EVENT: 'event',
};

/**
 * FastAPI IL Guide service base URL.
 * Set EXPO_PUBLIC_IL_GUIDE_API_URL when the backend is deployed.
 */
export const IL_GUIDE_API_URL =
  process.env.EXPO_PUBLIC_IL_GUIDE_API_URL || '';

/** Optional — sent as X-API-Key when the IL Guide API requires auth. */
export const IL_GUIDE_API_KEY =
  process.env.EXPO_PUBLIC_IL_GUIDE_API_KEY || '';

/** Vetted quotations only — never LLM-generated in the app fallback. */
export const IL_GUIDE_QUOTATIONS = [
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
  {
    id: 'q3',
    text: 'The best way to predict the future is to create it.',
    author: 'Peter Drucker',
  },
];

import {
  LESSON_VIDEOS,
  PRINCIPLES_FULL_M3U8,
  PRINCIPLES_PREVIEW_YT,
} from './lessonAssets';
import { PREWORK_THUMBS } from './preworkThumbs';

/**
 * The 27 IL Principles ("27 stars to steer by"), numbered row by row as on the programme's
 * Practice 1 sheet. Replaces 8 placeholder titles that were not the real principles.
 */
export const LEP_PRINCIPLE_TITLES = {
  1: 'B-HAG',
  2: 'Graceful Leadership',
  3: '0.5% Excellence Roadmap',
  4: 'Breakthrough Actions',
  5: 'Powerful Request',
  6: 'Strength Based Excellence',
  7: 'A-Game',
  8: 'Co-De-Sef',
  9: 'Differentiated Brand',
  10: 'Rigor in Action and Communication',
  11: 'Powerful Responding Techniques',
  12: 'Guiding Stars',
  13: 'Trust & Inspect',
  14: 'Handle Politics in Unpredictable Way',
  15: 'Purpose Beyond Self',
  16: 'Crucibles of Leadership',
  17: 'Faizen for Breakthrough Actions',
  18: 'Accelerated Skill Building',
  19: 'Power of Language',
  20: 'Alignment for Maximizing',
  21: 'Shameless Pitching',
  22: 'Ownership as Team',
  23: 'Purpose Peg',
  24: 'ERRC and 3T',
  25: 'Purpose Based Communication',
  26: 'Manage Your Energy',
  27: 'Milestones Beyond B-HAG',
};

/** [{ n: '01', title }] for lists. */
export const LEP_PRINCIPLES = Object.keys(LEP_PRINCIPLE_TITLES).map((k) => ({
  n: String(k).padStart(2, '0'),
  title: LEP_PRINCIPLE_TITLES[k],
}));

/**
 * Primary watch for daily revision / Learn row (principle 1–27).
 * Segments without a dedicated file fall back to the full 27 Principles recording.
 */
export function lepPrincipleWatch(principleN) {
  const n = Number(principleN);
  if (!Number.isFinite(n) || n < 1 || n > 27) return null;

  const titleBit = LEP_PRINCIPLE_TITLES[n] || '27 Principles';
  const title = `Principle ${String(n).padStart(2, '0')} · ${titleBit}`;

  if (n === 1) {
    return {
      principleN: n,
      title,
      uri: PRINCIPLES_PREVIEW_YT,
      assetKey: 'lep-principles-video-preview',
      thumb: PREWORK_THUMBS['lep-principles-video'],
      practiceId: 'lep-principle',
    };
  }
  // Shameless Pitching is principle 21: it opens its own film.
  if (n === 21) {
    return {
      principleN: n,
      title,
      uri: LESSON_VIDEOS['lep-shameless'],
      assetKey: 'lep-shameless',
      thumb: PREWORK_THUMBS['lep-shameless'],
      practiceId: 'lep-shameless',
    };
  }

  return {
    principleN: n,
    title,
    uri: PRINCIPLES_FULL_M3U8,
    assetKey: 'lep-principles-video',
    thumb: PREWORK_THUMBS['lep-principles-video'],
    practiceId: 'lep-principle',
  };
}

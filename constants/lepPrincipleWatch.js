import {
  LESSON_VIDEOS,
  PRINCIPLES_FULL_M3U8,
  PRINCIPLES_PREVIEW_YT,
} from './lessonAssets';
import { PREWORK_THUMBS } from './preworkThumbs';

/** Display titles for enrolled Learn (subset; others use generic label). */
export const LEP_PRINCIPLE_TITLES = {
  1: 'Ask for what you want',
  2: 'Own the room before you speak',
  3: 'The Shameless Pitch',
  4: 'Build your board of advocates',
  10: 'Negotiate from the seat you want',
  11: 'Turn visibility into sponsorship',
  12: 'The unflinching no',
  13: 'Read the room’s real agenda',
};

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
  if (n === 3) {
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

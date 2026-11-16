/**
 * Real length of every lesson video, in seconds — measured from the source itself (YouTube's
 * own length, the HLS playlist's segments, or the MP4 header) on 16 Nov 2026. Every video card
 * shows its duration from here, so labels can no longer drift from the actual video.
 * Adding a video to constants/lessonAssets.js? Add its length here too.
 */
export const VIDEO_SECONDS = {
  'lep-principles-video': 10736,
  'lep-principles-video-preview': 10736,
  'lep-shameless': 805,
  'lep-rituals': 2802,
  'prework-01': 10736,
  'prework-02': 2802,
  'prework-03': 805,
  'army:factory-floor': 3751,
  'army:invisible': 2713,
  'podcast:simon': 2839,
  'podcast:priyanka': 3751,
  'podcast:charu': 2713,
  'podcast:mohini': 2202,
  'podcast:lakshmi': 4396,
  'podcast:pushpa': 4469,
  'csuite:priyanka': 518,
  'csuite:kamini': 283,
  'csuite:rekha': 204,
  'csuite:radhika': 412,
  'csuite:suma': 616,
  'csuite:varsha': 267,
  'csuite:smriti': 160,
  'csuite:meghna': 367,
  'csuite:divya': 411,
  'csuite:poornima': 294,
  'community:iron-ladies': 3643,
  'community:indra-nooyi': 9053,
  'lep:mentors': 44,
  'lep:brand-roadmap': 226,
  'mbw:indra': 10736,
  'mbw:impact-s1': 2512,
  'mbw:impact-s2': 656,
};

/** "13 min", "47 min", "2 h 59 min" — or `fallback` when the video is not in the table. */
export function videoLength(assetKey, fallback = '') {
  const s = VIDEO_SECONDS[assetKey];
  if (!s) return fallback;
  if (s < 60) return `${s} sec`;
  const mins = Math.round(s / 60);
  if (mins < 60) return `${mins} min`;
  const h = Math.floor(mins / 60);
  const m = mins % 60;
  return m ? `${h} h ${m} min` : `${h} h`;
}

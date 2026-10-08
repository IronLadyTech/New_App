import { LESSON_VIDEOS, TASK_VIDEOS } from './lessonAssets';

const P = {
  priyanka: require('../assets/il/portraits/priyanka-sunder.png'),
  kamini: require('../assets/il/portraits/kamini-chawla.png'),
  suma: require('../assets/il/portraits/suma-bhat.png'),
  rekha: require('../assets/il/portraits/rekha-sharma.png'),
  radhika: require('../assets/il/portraits/radhika-sharma.png'),
  meghna: require('../assets/il/portraits/meghna-makkar.png'),
  varsha: require('../assets/il/portraits/varsha-fulzele.png'),
  smriti: require('../assets/il/portraits/smriti-mishra.png'),
  divya: require('../assets/il/portraits/divya-mona.png'),
  poornima: require('../assets/il/portraits/poornima-george.png'),
  speaks01: require('../assets/il/portraits/speaks-01-pushpa.jpg'),
  speaks02: require('../assets/il/portraits/speaks-02-lakshmi.jpg'),
  speaks04c: require('../assets/il/portraits/speaks-04-charu.jpg'),
  speaks04m: require('../assets/il/portraits/speaks-04-mohini.jpg'),
  speaks05: require('../assets/il/portraits/speaks-05-priyanka.jpg'),
  speaks06: require('../assets/il/portraits/speaks-06-simon.jpg'),
};

/** Pre-work video thumbnails for LEP home cards and video players. */
export const PREWORK_THUMBS = {
  'lep-principles-video': require('../assets/il/prework/thumb-27-principles.jpg'),
  'lep-rituals': require('../assets/il/prework/thumb-5-rituals.jpg'),
  'lep-shameless': require('../assets/il/prework/thumb-shameless-speech.jpg'),
  'prework-01': require('../assets/il/prework/thumb-27-principles.jpg'),
  'lep-principles-video-preview': require('../assets/il/prework/thumb-27-principles.jpg'),
  'prework-02': require('../assets/il/prework/thumb-5-rituals.jpg'),
  'prework-03': require('../assets/il/prework/thumb-shameless-speech.jpg'),
};

/** Posters for all wired lesson videos (pre-work, podcasts, C-suite, army, MBW). */
export const VIDEO_POSTERS = {
  ...PREWORK_THUMBS,
  'podcast:simon': P.speaks06,
  'podcast:priyanka': P.speaks05,
  'podcast:charu': P.speaks04c,
  'podcast:mohini': P.speaks04m,
  'podcast:lakshmi': P.speaks02,
  'podcast:pushpa': P.speaks01,
  'csuite:priyanka': P.priyanka,
  'csuite:kamini': P.kamini,
  'csuite:rekha': P.rekha,
  'csuite:radhika': P.radhika,
  'csuite:suma': P.suma,
  'csuite:varsha': P.varsha,
  'csuite:smriti': P.smriti,
  'csuite:meghna': P.meghna,
  'csuite:divya': P.divya,
  'csuite:poornima': P.poornima,
  'army:factory-floor': P.speaks05,
  'army:invisible': P.speaks04c,
  'mbw:indra': PREWORK_THUMBS['lep-principles-video'],
  'mbw:impact-s1': P.speaks06,
  'mbw:impact-s2': P.speaks05,
  'community:iron-ladies': require('../assets/il/suvarna-hero.jpg'),
  'community:indra-nooyi': require('../assets/il/suvarna-hero.jpg'),
  'lep:mentors': P.smriti,
  'lep:brand-roadmap': PREWORK_THUMBS['lep-principles-video'],
};

const BY_TASK = {
  'lep-day3-27-principles': PREWORK_THUMBS['lep-principles-video'],
  'mbw-principles': PREWORK_THUMBS['lep-principles-video'],
  'lep-day3-5-rituals': PREWORK_THUMBS['lep-rituals'],
  'mbw-lep': PREWORK_THUMBS['lep-rituals'],
  'lep-shameless': PREWORK_THUMBS['lep-shameless'],
  'lep-day1-errc': PREWORK_THUMBS['lep-principles-video'],
  'lep-day3-brand-roadmap': PREWORK_THUMBS['lep-principles-video'],
  'lep-day3-mentors': P.smriti,
  'mbw-errc': PREWORK_THUMBS['lep-principles-video'],
  'mbw-csuite': P.priyanka,
  'mbw-orientation': P.speaks06,
  'mbw-resume': P.poornima,
  'mbw-powerful-request': P.smriti,
  'mbw-live-session': P.speaks06,
  'mbw-drama-huddle': P.speaks05,
  'q1-session1': P.speaks06,
  'q1-session2': P.speaks05,
  'q1-suvarna-session': P.speaks04m,
  'q1-session3': P.speaks04c,
  'q1-session4': P.speaks02,
  'q2-session5': P.speaks01,
  'q2-session6': P.speaks06,
  'q2-super-powers-video': P.radhika,
  'q2-errc-delegation': PREWORK_THUMBS['lep-principles-video'],
  'q2-linkedin-daily': P.divya,
  'q2-csuite-talk-practice': P.priyanka,
  'q3-interview-mock': P.priyanka,
  'q3-energy-centers': P.speaks04m,
  'q3-csuite-talk-prep': P.priyanka,
  'q4-errc-revision': PREWORK_THUMBS['lep-principles-video'],
  'q4-final-errc': PREWORK_THUMBS['lep-principles-video'],
  'q4-challenges': P.speaks06,
  'q2-suvarna-session': P.speaks05,
  'q2-session7': P.divya,
  'q2-session8': P.priyanka,
  'q3-session9': P.speaks06,
  'q3-session10': P.speaks04m,
  'q3-suvarna-session': P.speaks04m,
  'q3-session11': P.speaks06,
  'q3-session12': P.priyanka,
  'q4-session13': P.speaks02,
  'q4-session14': P.speaks01,
  'q4-suvarna-session': P.priyanka,
  'q4-session15': P.speaks05,
  'q4-session16': PREWORK_THUMBS['lep-principles-video'],
  'grad-ceremony': P.speaks06,
};

function buildByUri() {
  const map = {};
  for (const [key, uri] of Object.entries(LESSON_VIDEOS)) {
    const poster = VIDEO_POSTERS[key];
    if (poster) map[uri] = poster;
  }
  for (const [taskId, uri] of Object.entries(TASK_VIDEOS)) {
    const poster = BY_TASK[taskId] || VIDEO_POSTERS[taskId];
    if (poster) map[uri] = poster;
  }
  return map;
}

const BY_URI = buildByUri();

/** Resolve a bundled poster image for a practice, task, asset key, or stream URL. */
export function getVideoPoster({ practiceId, taskId, assetKey, uri, poster, img } = {}) {
  if (poster || img) return poster || img;
  if (practiceId && VIDEO_POSTERS[practiceId]) return VIDEO_POSTERS[practiceId];
  if (taskId && BY_TASK[taskId]) return BY_TASK[taskId];
  if (taskId && VIDEO_POSTERS[taskId]) return VIDEO_POSTERS[taskId];
  if (assetKey && VIDEO_POSTERS[assetKey]) return VIDEO_POSTERS[assetKey];
  if (uri && BY_URI[uri]) return BY_URI[uri];
  return null;
}

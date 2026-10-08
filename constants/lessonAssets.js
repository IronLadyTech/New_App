/**
 * Hosted lesson videos (CloudFront / S3 / YouTube).
 * Source spreadsheet: https://docs.google.com/spreadsheets/d/1b5YlEIIH2jMoYOuY6bEb509AvQQfpR5e0EM7bBwdGOQ
 */
const CF = 'https://d3jv3ztk062m9h.cloudfront.net/videos';
const S3 = 'https://iron-lady-lmsvideos.s3.ap-south-1.amazonaws.com/videos';
const LEP_CF = 'https://d1ixtxt2uzttul.cloudfront.net/videos';
const IL_S3 = 'https://iron-lady.s3.ap-south-1.amazonaws.com/videos';
const YT = (id) => `https://www.youtube.com/watch?v=${id}`;

export const RITUALS_M3U8 =
  `${CF}/LEP%205%20Rituals/output/Practicing%20the%205%20Daily%20Rituals%20of%20Iron%20Lady.m3u8`;

export const ERRC_M3U8 = `${CF}/ERRC%20edited/output/ERRC%20edited.m3u8`;

export const PRINCIPLES_FULL_M3U8 =
  `${S3}/MBW+-+27+Principles/output/MBW_27_Principles.m3u8`;

export const PRINCIPLES_PREVIEW_YT = YT('uo9xA5xiRWY');

export const SHAMELESS_KEY_YT = YT('hPllA43iaFk');
export const SHAMELESS_SAMPLE_YT = YT('LxF5CzETIDA');

/** Iron Lady Speaks — source: Videos spreadsheet (Podcasts tab). */
export const IL_SPEAKS_SIMON = YT('tT-LGiF8J3k');
export const IL_SPEAKS_PRIYANKA = YT('ZwFbODBs6A4');
export const IL_SPEAKS_CHARU = YT('iojBq7le-bc');
export const IL_SPEAKS_MOHINI = YT('Hffiu7CaaiA');
export const IL_SPEAKS_LAKSHMI = YT('WhSyWTns0VQ');
export const IL_SPEAKS_PUSHPA = YT('85wKIwhd7Qg');

/** C-Suite League — sheet tab "C-Suite League Videos". */
export const CSUITE_PRIYANKA = YT('P5gN730jVTY');
export const CSUITE_KAMINI = YT('-PcDld6z9Zw');
export const CSUITE_REKHA = YT('DBUHGaPNPFs');
export const CSUITE_RADHIKA = YT('aKqenYS4jUQ');
export const CSUITE_SUMA = YT('TDZ-AMmoNzQ');
export const CSUITE_VARSHA = YT('fQoXnTezYRM');
export const CSUITE_SMRITI = YT('3j58Q10rJPI');
export const CSUITE_MEGHNA = YT('5J0mSlgjMI4');
export const CSUITE_DIVYA = YT('3ARlxNnWcyE');
export const CSUITE_POORNIMA = YT('d9RyXIz3cjs');

/** Community videos — sheet tab "Community Videos". */
export const COMMUNITY_IRON_LADIES = YT('bb1vjVk6j1M');
export const COMMUNITY_INDRA_NOOYI = YT('-NIjSEfaMb4');

/** LEP program videos — sheet tab "LEP". */
export const LEP_MENTORS_MP4 = `${LEP_CF}/lep_video.mp4`;
export const LEP_BRAND_MP4 =
  `${IL_S3}/Building+and+using+the+Differentiated+Brand+_+0.5%25+League+Roadmap.mp4`;

/** Keys used by practice entries, pre-work cards, podcasts, C-suite tiles. */
export const LESSON_VIDEOS = {
  'lep-principles-video': PRINCIPLES_FULL_M3U8,
  'lep-principles-video-preview': PRINCIPLES_PREVIEW_YT,
  'lep-shameless': SHAMELESS_KEY_YT,
  'lep-rituals': RITUALS_M3U8,
  'prework-01': PRINCIPLES_PREVIEW_YT,
  'prework-02': RITUALS_M3U8,
  'prework-03': SHAMELESS_KEY_YT,
  'army:factory-floor': IL_SPEAKS_PRIYANKA,
  'army:invisible': IL_SPEAKS_CHARU,
  'podcast:simon': IL_SPEAKS_SIMON,
  'podcast:priyanka': IL_SPEAKS_PRIYANKA,
  'podcast:charu': IL_SPEAKS_CHARU,
  'podcast:mohini': IL_SPEAKS_MOHINI,
  'podcast:lakshmi': IL_SPEAKS_LAKSHMI,
  'podcast:pushpa': IL_SPEAKS_PUSHPA,
  'csuite:priyanka': CSUITE_PRIYANKA,
  'csuite:kamini': CSUITE_KAMINI,
  'csuite:rekha': CSUITE_REKHA,
  'csuite:radhika': CSUITE_RADHIKA,
  'csuite:suma': CSUITE_SUMA,
  'csuite:varsha': CSUITE_VARSHA,
  'csuite:smriti': CSUITE_SMRITI,
  'csuite:meghna': CSUITE_MEGHNA,
  'csuite:divya': CSUITE_DIVYA,
  'csuite:poornima': CSUITE_POORNIMA,
  'community:iron-ladies': COMMUNITY_IRON_LADIES,
  'community:indra-nooyi': COMMUNITY_INDRA_NOOYI,
  'lep:mentors': LEP_MENTORS_MP4,
  'lep:brand-roadmap': LEP_BRAND_MP4,
  'mbw:indra': PRINCIPLES_PREVIEW_YT,
  'mbw:impact-s1': YT('qtSBQTXtS4A'),
  'mbw:impact-s2': YT('k16c3d02yj0'),
};

/** Course task id → primary watch URL (demo; production may use getLessonAsset). */
export const TASK_VIDEOS = {
  'mbw-orientation': `${CF}/Sridhar%201st%20Session%20of%20%27Execusion%20Excellence%20%20Know%20Yourself%27%20Recording/output/Sridhar%201st%20Session%20of%20%27Execusion%20Excellence%20%20Know%20Yourself%27%20Recording.m3u8`,
  'mbw-principles': PRINCIPLES_FULL_M3U8,
  'mbw-csuite': YT('-40JR-TkMBU'),
  'mbw-errc': ERRC_M3U8,
  'mbw-resume': `${S3}/Resume+Video/output/Using+Resume+template+and+Resume+samples+_+Iron+Lady+Jobseekers.m3u8`,
  'mbw-live-session': YT('t_9Ni7M_VaM'),
  'mbw-drama-huddle': YT('1QDGDBUiLZ0'),
  'mbw-lep': RITUALS_M3U8,
  'mbw-powerful-request': `${S3}/LEP+%3A+Finding+and+working+with+mentors-+Powerful+Requests/output/LEP+_+Finding+and+working+with+mentors.m3u8`,
  'lep-day1-errc': ERRC_M3U8,
  'lep-day3-27-principles': PRINCIPLES_FULL_M3U8,
  'lep-day3-5-rituals': RITUALS_M3U8,
  'lep-day3-mentors': LEP_MENTORS_MP4,
  'lep-day3-brand-roadmap': LEP_BRAND_MP4,
  'q1-session1': YT('qtSBQTXtS4A'),
  'q1-session2': YT('k16c3d02yj0'),
  'q1-suvarna-session': YT('GsCztuFb7rM'),
  'q1-session3': YT('B9KlncBNxy8'),
  'q1-session4': YT('zziuOCDP9_g'),
  'q2-session5': YT('g_QP7lHv7Eo'),
  'q2-session6': YT('PqF1FyR0dyU'),
  'q2-super-powers-video': `${CF}/Recall%20your%20superpower%20%3A%20Visualization/output/Recall%20your%20superpower%20_%20Visualization.m3u8`,
  'q2-errc-delegation': ERRC_M3U8,
  'q2-linkedin-daily': `${CF}/MBW%20CS%20-%20Linkedin%20Challenge%20-%20Rajesh/output/MBW%20CS%20-%20Linkedin%20Challenge%20-%20Rajesh.m3u8`,
  'q2-csuite-talk-practice': YT('-40JR-TkMBU'),
  'q3-interview-mock': `${CF}/MBW%20CS%20-%20C-Suite%20Interview%20Preparation%20-%20Mamta/output/MBW%20CS%20-%20C-Suite%20Interview%20Preparation%20-%20Mamta.m3u8`,
  'q3-energy-centers': YT('GsCztuFb7rM'),
  'q3-csuite-talk-prep': YT('-40JR-TkMBU'),
  'q4-errc-revision': ERRC_M3U8,
  'q4-final-errc': ERRC_M3U8,
  'q4-challenges': YT('ZMUzX5vybQw'),
  // Aliases for WATCH_ONLY task ids used in programCourseSlice
  'q2-suvarna-session': YT('1QDGDBUiLZ0'),
  'q2-session7': `${CF}/MBW%20CS%20-%20Linkedin%20Challenge%20-%20Rajesh/output/MBW%20CS%20-%20Linkedin%20Challenge%20-%20Rajesh.m3u8`,
  'q2-session8': YT('-40JR-TkMBU'),
  'q3-session9': YT('qtSBQTXtS4A'),
  'q3-session10': YT('GsCztuFb7rM'),
  'q3-suvarna-session': YT('GsCztuFb7rM'),
  'q3-session11': YT('PqF1FyR0dyU'),
  'q3-session12': `${CF}/MBW%20CS%20-%20C-Suite%20Interview%20Preparation%20-%20Mamta/output/MBW%20CS%20-%20C-Suite%20Interview%20Preparation%20-%20Mamta.m3u8`,
  'q4-session13': YT('zziuOCDP9_g'),
  'q4-session14': YT('g_QP7lHv7Eo'),
  'q4-suvarna-session': YT('-40JR-TkMBU'),
  'q4-session15': YT('1QDGDBUiLZ0'),
  'q4-session16': ERRC_M3U8,
  'grad-ceremony': YT('ZMUzX5vybQw'),
};

export const CSUITE_ASSET_KEYS = [
  'csuite:priyanka',
  'csuite:kamini',
  'csuite:rekha',
  'csuite:radhika',
  'csuite:suma',
  'csuite:varsha',
  'csuite:smriti',
  'csuite:meghna',
  'csuite:divya',
  'csuite:poornima',
];

export const PODCAST_ASSET_KEYS = [
  'podcast:simon',
  'podcast:priyanka',
  'podcast:charu',
  'podcast:mohini',
  'podcast:lakshmi',
  'podcast:pushpa',
];

export const COMMUNITY_ASSET_KEYS = [
  'community:iron-ladies',
  'community:indra-nooyi',
];

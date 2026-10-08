import { lepDoc, lmsUrl } from './lmsHost';

/** LEP reading files from new_lms. Calendar /app links stay out — they are not hosted files. */
export const LEP_RESOURCES = {
  'lep-orientation-framework': {
    readingDocument: {
      label: 'Leadership Essentials Program Information',
      url: lepDoc('lep-program-framework.pdf'),
    },
  },
  'lep-orientation-access': {
    readingDocument: {
      label: 'Program Access Essentials',
      url: lepDoc('program-access-essentials.pdf'),
    },
  },
  'lep-via-survey': {
    resourceLinks: [{ label: 'VIA Character Survey', url: 'https://www.viacharacter.org' }],
  },
  'lep-prep-codesef-sheet': {
    readingDocument: {
      label: 'What CoDeSeF is',
      url: lepDoc('codesef-guidelines-template.pdf'),
      pages: [1],
    },
  },
  'lep-day1-promises': {
    readingDocument: {
      label: 'Promises and Agreements',
      url: lepDoc('promises-and-agreements.pdf'),
    },
  },
  'lep-day1-agame-table': {
    readingDocument: { label: 'A-Game Table Template', url: lepDoc('a-game-table.pdf') },
  },
  'lep-day1-errc': {},
  'lep-day1-crucible': {
    readingDocument: { label: 'Crucibles of Leadership', url: lepDoc('crucibles-of-leadership.pdf') },
  },
  'lep-day1-assignment': {
    readingDocument: {
      label: 'Affirmations — Sense of Internal Confidence',
      url: lepDoc('standard-affirmations.pdf'),
    },
  },
  'lep-day2-codesef': {
    readingDocument: {
      label: 'What CoDeSeF is',
      url: lepDoc('codesef-guidelines-template.pdf'),
      pages: [1],
    },
  },
  'lep-day2-responding': {
    readingDocument: {
      label: 'Respond vs React questionnaire',
      url: lepDoc('powerful-responding-tactics.pdf'),
    },
  },
  'lep-day2-relationships': {
    readingDocument: {
      label: 'Maximise Key Relationships',
      url: lepDoc('maximise-key-relationships.pdf'),
    },
  },
  'lep-day2-purpose-peg': {
    readingDocument: { label: 'Purpose Peg Table', url: lepDoc('purpose-peg-table.pdf') },
    resourceLinks: [{ label: 'Purpose Peg Samples', url: lepDoc('purpose-peg-samples.pdf') }],
  },
  'lep-day4-roadmap-sample': {
    readingDocument: {
      label: 'Differentiated Strength — worked sample',
      url: lepDoc('league-roadmap-sample.pdf'),
    },
  },
  'lep-day4-roadmap': {
    readingDocument: {
      label: '0.5% League Roadmap — worked sample',
      url: lepDoc('league-roadmap-sample.pdf'),
    },
  },
  'lep-resume-template-study': {
    resourceLinks: [
      { label: 'Sample Resume Template', url: lepDoc('resume-template.pdf') },
      { label: 'Iron Lady Resume Template', url: lmsUrl('/templates/Iron Lady Resume Template.doc') },
    ],
  },
  'lep-resume-prepare': {
    resourceLinks: [{ label: 'Sample Resume Template', url: lepDoc('resume-template.pdf') }],
  },
  'lep-day5-instructions': {
    readingDocument: {
      label: 'Shameless Pitch Preparation Instructions',
      url: lepDoc('shameless-pitch-instructions.pdf'),
    },
  },
  'lep-day6-guiding-stars': {
    readingDocument: { label: 'Guiding Stars Poster', url: lepDoc('guiding-stars.pdf') },
  },
};

function attachUrl(item) {
  if (!item?.url) return null;
  const url = lmsUrl(item.url);
  if (!url) return null;
  return { ...item, url };
}

export function withLepResources(tasks) {
  return tasks.map((task) => {
    const extra = LEP_RESOURCES[task.id];
    if (!extra) return task;
    const readingDocument = attachUrl(extra.readingDocument);
    const resourceLinks = (extra.resourceLinks || []).map(attachUrl).filter(Boolean);
    return {
      ...task,
      ...(readingDocument ? { readingDocument } : {}),
      ...(resourceLinks.length ? { resourceLinks } : {}),
    };
  });
}

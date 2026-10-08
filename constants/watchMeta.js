import { CSUITE_ASSET_KEYS, PODCAST_ASSET_KEYS } from './lessonAssets';

const PODCAST_META = {
  'podcast:simon': {
    tag: 'Iron Lady Speaks',
    series: 'Episode 6',
    takeaways: [
      'Leadership is built one notch above your current role — not by waiting to be asked.',
      'Global CEOs design systems, not just solve problems.',
      'Your next level starts with how you show up before the title changes.',
    ],
    prompt: 'What is the one notch up you are avoiding naming out loud?',
  },
  'podcast:priyanka': {
    tag: 'Iron Lady Speaks',
    series: 'Episode 5',
    takeaways: [
      'Factory-floor credibility earns boardroom authority.',
      'Voice counts when you connect work to measurable business impact.',
      'Diverse roles across finance, sales, and P&L build unstoppable leaders.',
    ],
    prompt: 'Where are you still waiting for permission instead of making your voice count?',
  },
  'podcast:charu': {
    tag: 'Iron Lady Speaks',
    series: 'Episode 4',
    takeaways: [
      'Technical depth alone cannot fix a visibility problem.',
      'From invisible to unstoppable starts with naming what held you back.',
      'Security and privacy leadership demands strategic storytelling.',
    ],
    prompt: 'What story about your work are you not telling loudly enough?',
  },
  'podcast:mohini': {
    tag: 'Iron Lady Speaks',
    series: 'Episode 4',
    takeaways: [
      '“My work will speak for me” is the myth that stalls promotions.',
      'Quality leadership is strategic, not only operational.',
      'Twenty-one years of proof still needs a voice in the room.',
    ],
    prompt: 'Where are you relying on work quality instead of visible sponsorship?',
  },
  'podcast:lakshmi': {
    tag: 'Iron Lady Speaks',
    series: 'Episode 2',
    takeaways: [
      'Legal heads can become global board members with deliberate positioning.',
      'Two caps — operator and strategist — can coexist in one career.',
      'Board readiness is built through relationships, not résumés alone.',
    ],
    prompt: 'Who on your board of advocates is missing a name?',
  },
  'podcast:pushpa': {
    tag: 'Iron Lady Speaks',
    series: 'Episode 1',
    takeaways: [
      'The 11×11 mission turns personal purpose into ecosystem impact.',
      'Healthcare leadership needs systems thinking at scale.',
      'Mission clarity attracts mentors, capital, and coalitions.',
    ],
    prompt: 'What mission would you pursue if failure were not a constraint?',
  },
};

const CSUITE_META = {
  'csuite:priyanka': {
    tag: 'C-suite conversation',
    series: 'Cybersecurity',
    takeaways: [
      'Cyber resilience is a board-level mandate, not an IT ticket.',
      'Chaos becomes strategy when security is tied to business continuity.',
      'C-suite credibility starts with translating risk into revenue language.',
    ],
    prompt: 'How would you frame your function as a growth enabler to the board?',
  },
  'csuite:kamini': {
    tag: 'C-suite conversation',
    series: 'Leadership',
    takeaways: [
      'The Pygmalion effect shapes what teams believe they can deliver.',
      'Expectations you hold silently become ceilings for others.',
      'Management is as much psychology as it is process.',
    ],
    prompt: 'Which team member are you underestimating — and what would change if you did not?',
  },
  'csuite:rekha': {
    tag: 'C-suite conversation',
    series: 'Media',
    takeaways: [
      'Print is not dying — it is evolving from volume to value.',
      'Sunset industries need leaders who reinvent the business model.',
      'Media strategy today is audience intimacy at scale.',
    ],
    prompt: 'What part of your industry is “sunset” — and where is the value shift?',
  },
  'csuite:radhika': {
    tag: 'C-suite conversation',
    series: 'Technology',
    takeaways: [
      'Technology is a growth multiplier when tied to P&L outcomes.',
      'Cost-centre framing limits every budget conversation.',
      'Strategic tech leaders speak in business cases, not feature lists.',
    ],
    prompt: 'If your function were a growth lever, what would you fund first?',
  },
  'csuite:suma': {
    tag: 'C-suite conversation',
    series: 'Product',
    takeaways: [
      'The 20-mile march is consistency over heroics.',
      'Product leaders win by choosing the fight worth having.',
      'Discipline beats drama in long-horizon leadership.',
    ],
    prompt: 'What is your 20-mile march for the next 90 days?',
  },
  'csuite:varsha': {
    tag: 'C-suite conversation',
    series: 'Delivery',
    takeaways: [
      'Clarity is not soft skill — it is business strategy.',
      'Ambiguity is expensive; precision saves quarters.',
      'Delivery leaders who name trade-offs earn board trust.',
    ],
    prompt: 'Where is lack of clarity costing your team speed or credibility?',
  },
  'csuite:smriti': {
    tag: 'C-suite conversation',
    series: 'Product',
    takeaways: [
      'Stop jumping to solutions — diagnose before you prescribe.',
      'Product leadership means holding the problem longer than feels comfortable.',
      'The best product calls delay gratification for better outcomes.',
    ],
    prompt: 'What problem are you solving too quickly?',
  },
  'csuite:meghna': {
    tag: 'C-suite conversation',
    series: 'People & HR',
    takeaways: [
      'People insight must translate to business impact.',
      'HR at the top table speaks in metrics the CFO respects.',
      'Culture is a performance system, not a poster.',
    ],
    prompt: 'What people insight could change a business decision this quarter?',
  },
  'csuite:divya': {
    tag: 'C-suite conversation',
    series: 'Programs',
    takeaways: [
      'The human API connects teams without creating friction.',
      'Program management is orchestration, not administration.',
      'Leaders who bridge silos become indispensable.',
    ],
    prompt: 'Which two teams in your org need a human API — and could you be it?',
  },
  'csuite:poornima': {
    tag: 'C-suite conversation',
    series: 'AI & governance',
    takeaways: [
      'AI accelerates innovation; governance protects what matters.',
      'Speed without guardrails creates risk the board will own.',
      'Responsible AI is a competitive advantage, not a brake.',
    ],
    prompt: 'What would you never automate — and why?',
  },
};

const PRACTICE_META = {
  'lep-bhag': {
    tag: 'Your BHAG',
    series: 'Principle 01',
    takeaways: [
      'Your BHAG is the goal big enough to scare you — name it before you negotiate for it.',
      'Asking for what you want is the first Foundation Principle.',
      'Say it out loud; if it does not scare you a little, go bigger.',
    ],
    prompt: 'Write your BHAG in one sentence — then tap Complete BHAG practice to save it.',
    practiceId: 'lep-bhag',
    practiceLabel: 'Complete BHAG practice',
  },
  'lep-principles-video-preview': {
    tag: "Today's message",
    series: 'Principle 01 · BHAG',
    takeaways: [
      'Your BHAG is the goal big enough to scare you — name it before you negotiate for it.',
      'Asking for what you want is not greed; it is the first act of leadership.',
      'The Foundation Principles start here — everything in LEP builds on this one.',
    ],
    prompt: 'Write your BHAG in one sentence — the goal you have been afraid to say out loud.',
    practiceId: 'lep-bhag',
    practiceLabel: 'Write my BHAG',
  },
  'lep-principles-video': {
    tag: 'LEP pre-work',
    series: '27 Principles',
    takeaways: [
      'The 27 Principles are the shared language of your cohort.',
      'Foundation principles open before Day 1 — use them daily.',
      'Revision beats binge-watching once before the intensive.',
    ],
    prompt: 'Which principle would change your next meeting if you applied it tomorrow?',
    practiceId: 'lep-principles-video',
    practiceLabel: 'Open full practice',
  },
  'lep-rituals': {
    tag: 'LEP pre-work',
    series: '5 Daily Rituals',
    takeaways: [
      'Rituals anchor your leadership before the day hijacks you.',
      'Five minutes of deliberate practice compounds over a month.',
      'Energy management is executive presence in disguise.',
    ],
    prompt: 'Which ritual will you do tomorrow before 9 AM?',
    practiceId: 'lep-rituals',
    practiceLabel: 'Start ritual practice',
  },
  'lep-shameless': {
    tag: 'LEP pre-work',
    series: 'Shameless Speech',
    takeaways: [
      'Modesty is often trained; authority can be relearned.',
      'The shameless speech names who you are without apology.',
      'Boardrooms reward clarity of identity, not humility theatre.',
    ],
    prompt: 'Finish this sentence: “I am the woman who…”',
    practiceId: 'lep-shameless',
    practiceLabel: 'Practice shameless speech',
  },
};

function neighbors(keys, assetKey, count = 2) {
  const i = keys.indexOf(assetKey);
  if (i < 0) return [];
  const out = [];
  for (let n = 1; n <= count; n += 1) {
    const next = keys[(i + n) % keys.length];
    if (next !== assetKey) out.push(next);
  }
  return out;
}

/** Rich copy for the Watch screen — keyed by assetKey / practiceId. */
export function getWatchMeta({ assetKey, practiceId, title, sub } = {}) {
  const key = assetKey || practiceId;
  const armyAlias = {
    'army:factory-floor': 'podcast:priyanka',
    'army:invisible': 'podcast:charu',
  };
  const lookupKey = armyAlias[key] || key;
  const base = PODCAST_META[lookupKey] || CSUITE_META[lookupKey] || PRACTICE_META[lookupKey] || {};

  let relatedKeys = [];
  if (PODCAST_META[lookupKey]) relatedKeys = neighbors(PODCAST_ASSET_KEYS, lookupKey, 2);
  else if (CSUITE_META[lookupKey]) relatedKeys = neighbors(CSUITE_ASSET_KEYS, lookupKey, 2);

  return {
    title,
    sub,
    tag: base.tag || 'Watch',
    series: base.series || null,
    takeaways: base.takeaways || [],
    prompt: base.prompt || 'What is the one action you will take in the next 24 hours?',
    practiceId: base.practiceId || null,
    practiceLabel: base.practiceLabel || null,
    relatedKeys,
  };
}

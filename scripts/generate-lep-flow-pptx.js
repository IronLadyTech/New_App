/**
 * One-off generator: Iron Lady LEP participant flow (Journey v1.5).
 * Run: node scripts/generate-lep-flow-pptx.js
 */
const path = require('path');
const pptxgen = require('pptxgenjs');

const OUT = path.join(__dirname, '..', 'docs', 'LEP_Flow_Presentation.pptx');

const NAVY = '113744';
const TEAL = '12343F';
const RED = 'C8202A';
const CREAM = 'F4F1E8';
const INK = '1B2B30';
const MUTED = '5B6669';
const WHITE = 'FFFFFF';

function addFooter(slide, page) {
  slide.addText(`Iron Lady · Leadership Essentials · v1.5`, {
    x: 0.5,
    y: 5.35,
    w: 9,
    h: 0.25,
    fontSize: 9,
    color: MUTED,
    isTextBox: true,
  });
  slide.addText(String(page), {
    x: 9.2,
    y: 5.35,
    w: 0.5,
    h: 0.25,
    fontSize: 9,
    color: MUTED,
    align: 'right',
    isTextBox: true,
  });
}

function titleSlide(pres, title, subtitle) {
  const slide = pres.addSlide();
  slide.background = { color: TEAL };
  slide.addText(title, {
    x: 0.6,
    y: 1.6,
    w: 8.8,
    h: 1.2,
    fontSize: 36,
    bold: true,
    color: WHITE,
    isTextBox: true,
  });
  if (subtitle) {
    slide.addText(subtitle, {
      x: 0.6,
      y: 2.9,
      w: 8.8,
      h: 1,
      fontSize: 18,
      color: CREAM,
      isTextBox: true,
    });
  }
  return slide;
}

function sectionSlide(pres, label) {
  const slide = pres.addSlide();
  slide.background = { color: RED };
  slide.addText(label, {
    x: 0.6,
    y: 2.2,
    w: 8.8,
    h: 1,
    fontSize: 32,
    bold: true,
    color: WHITE,
    isTextBox: true,
  });
  return slide;
}

function contentSlide(pres, title, bullets, page) {
  const slide = pres.addSlide();
  slide.background = { color: CREAM };
  slide.addShape(pres.ShapeType.rect, {
    x: 0,
    y: 0,
    w: 10,
    h: 0.12,
    fill: { color: RED },
    line: { color: RED },
  });
  slide.addText(title, {
    x: 0.55,
    y: 0.35,
    w: 8.9,
    h: 0.7,
    fontSize: 26,
    bold: true,
    color: TEAL,
    isTextBox: true,
  });
  slide.addText(bullets.join('\n'), {
    x: 0.55,
    y: 1.15,
    w: 8.9,
    h: 4,
    fontSize: 15,
    color: INK,
    valign: 'top',
    bullet: { type: 'bullet' },
    lineSpacing: 22,
    isTextBox: true,
  });
  addFooter(slide, page);
  return slide;
}

function tableSlide(pres, title, rows, page) {
  const slide = pres.addSlide();
  slide.background = { color: CREAM };
  slide.addText(title, {
    x: 0.55,
    y: 0.35,
    w: 8.9,
    h: 0.6,
    fontSize: 24,
    bold: true,
    color: TEAL,
    isTextBox: true,
  });
  slide.addTable(rows, {
    x: 0.45,
    y: 1.05,
    w: 9.1,
    colW: [1.4, 2.8, 2.4, 2.4],
    fontSize: 11,
    color: INK,
    border: { type: 'solid', color: 'D9D4C5', pt: 0.5 },
    fill: { color: WHITE },
    autoPage: false,
  });
  addFooter(slide, page);
  return slide;
}

async function main() {
  const pres = new pptxgen();
  pres.layout = 'LAYOUT_16x9';
  pres.author = 'Iron Lady';
  pres.title = 'LEP Participant Flow';
  pres.subject = 'Leadership Essentials Program — app journey v1.5';

  titleSlide(
    pres,
    'Leadership Essentials (LEP)',
    'Participant journey · App flow · Journey v1.5 (Oct 2026)\nSource: LEP_Flow.pdf · Iron Lady mobile app'
  );

  sectionSlide(pres, 'Program at a glance');

  contentSlide(
    pres,
    'What learners experience',
    [
      '1-month cohort: Thursday Orientation, then Saturday–Sunday intensive (Day 1 & Day 2).',
      'Four follow-on weeks with live sessions, optional Prepare to Win, and course tasks.',
      'Certification at Graduation (Week 4).',
      'App surfaces: Home, My Program, Learn, Engage, Profile — plus IL Guide nudges.',
    ],
    2
  );

  tableSlide(
    pres,
    'Weekly rhythm (every batch)',
    [
      [
        { text: 'When', options: { bold: true, fill: { color: TEAL }, color: WHITE } },
        { text: 'Session', options: { bold: true, fill: { color: TEAL }, color: WHITE } },
        { text: 'Code', options: { bold: true, fill: { color: TEAL }, color: WHITE } },
        { text: 'Time (IST)', options: { bold: true, fill: { color: TEAL }, color: WHITE } },
      ],
      ['Thursday (before weekend)', 'Orientation', 'S0', '7:00–8:00 PM'],
      ['Saturday', 'Full day — Day 1', 'S1', '9:00 AM–7:00 PM'],
      ['Sunday', 'Full day — Day 2', 'S2', '9:00 AM–7:00 PM'],
    ],
    3
  );

  sectionSlide(pres, 'Before Day 1 — Registration');

  contentSlide(
    pres,
    'Sign-in & onboarding',
    [
      'Phone OTP → Welcome (city, field of work, optional B-HAG).',
      'Zoho Lead sync; batch from Zoho or Choose batch date in app.',
      'Payment: Register (seat held) vs Enrolled (full fee paid).',
      'Landing gate until welcome (+ batch when required) is complete.',
    ],
    5
  );

  contentSlide(
    pres,
    'Registered home — three lockers',
    [
      'Registered: secure seat / complete enrollment.',
      'Pre-work: VIA Survey, B-HAG, NSDC, profile info — due dates from batch.',
      'Day 1 / Orientation / Day 2: calendar, next live session for their cohort.',
      'Enrolled (paid) learners use the pre–Day 1 enrolled home until Day 1 calendar day.',
    ],
    6
  );

  contentSlide(
    pres,
    'Pre-work (required before intensive)',
    [
      'Complete enrollment (Razorpay) when seat is held only.',
      'VIA Survey (~15 min) — due before Orientation.',
      'Write B-HAG — discussed at Orientation.',
      'NSDC registration + profile city/domain on file.',
    ],
    7
  );

  sectionSlide(pres, 'Live weekend & unlock rules');

  contentSlide(
    pres,
    'Intensive weekend',
    [
      'Orientation (S0): cohort welcome, B-HAG calibration, join link ~1 hr before.',
      'Day 1 (S1) & Day 2 (S2): 27 Principles intensive, live boardroom.',
      'Registered (not fully enrolled) learners: Orientation, Day 1, Day 2 in schedule only.',
      'CMS sets orientation Thursday; app derives Day 1 Saturday (+2 days).',
    ],
    9
  );

  contentSlide(
    pres,
    '5 Daily Rituals — when they appear',
    [
      'Hidden through Saturday Day 1 and Sunday Day 2.',
      'Introduced end of Day 2; tracker opens Monday (day1 + 2 calendar days, IST).',
      'Home practice deck, streak nudges, and journey tasks follow phase gates.',
      'Matches LEP_Flow.pdf — lepRitualsUnlock.js in app.',
    ],
    10
  );

  sectionSlide(pres, 'Weeks 1–4 journey');

  tableSlide(
    pres,
    'Live sessions after the weekend (sample)',
    [
      [
        { text: 'Week', options: { bold: true, fill: { color: NAVY }, color: WHITE } },
        { text: 'Core sessions', options: { bold: true, fill: { color: NAVY }, color: WHITE } },
        { text: 'Codes', options: { bold: true, fill: { color: NAVY }, color: WHITE } },
        { text: 'Notes', options: { bold: true, fill: { color: NAVY }, color: WHITE } },
      ],
      ['Week 1', 'Closure, Differentiated Brand', 'S3, S4', 'Optional FT, PTW'],
      ['Week 2', 'Progress Check, Shameless Pitch', 'S6, S5', 'PTW2 optional'],
      ['Week 3', 'Leadership Habits', 'S7', 'PTW3 optional'],
      ['Week 4', 'Graduation / Certificate', 'S8', 'Evaluation phase'],
    ],
    12
  );

  contentSlide(
    pres,
    'My Program — phase gates',
    [
      'Phases unlock on calendar days from batch Day 1 Saturday (LEP_PHASE_DAY_OFFSET).',
      'Registered learners: pre-program + orientation open; Day 2+ locked until enrolled.',
      '“Current phase” ignores Community as sequential step (opens Monday, listed after Week 4).',
      'Implementation: lepFlowGates.js, CourseCurriculum, session template.',
    ],
    13
  );

  sectionSlide(pres, 'Operations & app map');

  contentSlide(
    pres,
    'CMS & messaging',
    [
      'Staff: Admin → Batch calendar (cms_batches): orientationDate, day1Date, sessions, Zoom links.',
      'Learner batch resolved via Zoho key, LMS group, or Day 1 date.',
      'Notifications reference session codes (S0–S8, PTW) — dates from batch.',
      'Docs: LEP_FLOW_SUMMARY.md, CMS_BATCH_HUB.md.',
    ],
    15
  );

  contentSlide(
    pres,
    'App tabs (member)',
    [
      'Home — registered or enrolled hero, IL Guide, practice, next session.',
      'My Program — curriculum, coming-up sessions, phase progress.',
      'Learn — principles, resources, Army events by city.',
      'Engage — cohort & community; Profile — strength, B-HAG, enrollment.',
    ],
    16
  );

  const end = pres.addSlide();
  end.background = { color: TEAL };
  end.addText('References', {
    x: 0.6,
    y: 1.2,
    w: 8.8,
    h: 0.5,
    fontSize: 28,
    bold: true,
    color: WHITE,
    isTextBox: true,
  });
  end.addText(
    [
      'docs/LEP_FLOW.pdf · docs/LEP_FLOW_SUMMARY.md',
      'utils/lepFlowGates.js · utils/lepRitualsUnlock.js',
      'constants/lepSessionTemplate.js',
      'Iron Lady app (Expo) — lmsironlady',
    ].join('\n'),
    {
      x: 0.6,
      y: 2,
      w: 8.8,
      h: 2.5,
      fontSize: 14,
      color: CREAM,
      bullet: { type: 'bullet' },
      isTextBox: true,
    }
  );

  await pres.writeFile({ fileName: OUT });
  console.log('Wrote', OUT);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});

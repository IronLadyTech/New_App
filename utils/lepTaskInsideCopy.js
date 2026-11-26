import { TASK_TYPES } from '../constants/programs';
import { lepTaskPurpose } from '../constants/lepTaskPurpose';

export { lepTaskPurpose };

/** Heading above embedded task video (checklist / read-watch tasks). */
export function lepTaskWatchLabel(taskId) {
  const id = String(taskId || '');
  if (id === 'lep-day3-max-value') return 'Watch · Getting maximum value from LEP';
  if (id === 'lep-day3-brand-roadmap') return 'Watch · Differentiated Brand & 0.5% League Roadmap';
  if (id === 'lep-resume-template-study') return 'Watch · Resume template session (Rajesh)';
  if (id === 'lep-resume-bootcamp') return 'Watch · Jobseekers Bootcamp';
  if (id === 'lep-day3-27-principles') return 'Watch · 27 Principles session';
  if (id === 'lep-day3-5-rituals') return 'Watch · 5 Daily Rituals';
  if (id === 'lep-day3-mentors') return 'Watch · Finding mentors';
  if (id === 'lep-prep-nsdc') return 'Watch · How to register on NSDC';
  return 'Watch first';
}

/** Plain-language label for participants (Excel / task guide categories). */
export function lepTaskCategoryLabel(task) {
  const id = task?.id || '';
  if (id === 'lep-prep-nsdc') return 'NSDC registration (mandatory)';
  if (id === 'lep-via-survey') return 'VIA survey + upload';
  if (id === 'lep-day5-pitch') return 'Video pitch (must-do)';
  if (task?.type === TASK_TYPES.WATCH_ONLY) return 'Watch video';
  if (task?.type === TASK_TYPES.VIDEO_RECORD) return 'Record / upload video';
  if (task?.type === TASK_TYPES.FILE_UPLOAD) return 'Upload file';
  if (task?.type === TASK_TYPES.LINK) return 'External link';
  if (task?.type === TASK_TYPES.EDITABLE_TEMPLATE) return 'Form in app';
  if (task?.type === TASK_TYPES.CHECKLIST) return 'Read, watch & tick off';
  if (task?.type === TASK_TYPES.TEXT) return 'Short write-up';
  if (id.startsWith('lep-quiz')) return 'Quiz';
  if (id === 'lep-attendance' || id === 'lep-certification') return 'Certificate step';
  return task?.kind || 'Task';
}

/**
 * Steps shown inside the task screen so participants know what this task type means.
 */
export function lepTaskInsideSteps(task) {
  const id = task?.id || '';
  const type = task?.type;

  if (id === 'lep-weekly-1') {
    return [
      'After case studies or community stories, note what resonates — breakthrough and inspiration.',
      'Fill all three fields — labels stay visible while you type.',
      'Tap Submit answer — it saves to your Week 1 engagement check-in.',
    ];
  }
  if (id === 'lep-challenge-1') {
    return [
      'From the day after Day 2, for 7 days: on Home, in your 5 Rituals, update your A-Game table and tick it.',
      'Each day, also write one learning from your mirror work there.',
      'On Day 7: answer two quick questions and one line below, then tap Submit.',
    ];
  }
  if (id === 'lep-challenge-2') {
    return [
      'From the day after the Differentiated Brand session, for 7 days: add your LinkedIn profile link on Home (once).',
      'Each day: post, share or comment on LinkedIn, then tap Mark done (the link is optional).',
      'On Day 7: answer two quick questions and one line below, then tap Submit.',
    ];
  }
  if (id === 'lep-challenge-3') {
    return [
      'From the day after the Shameless Pitch session, for 7 days: on Home, write that day’s pitch (or the gist of your pitch video).',
      'Make at least one real pitch this week, and note who you pitched and what happened.',
      'On Day 7: answer two quick questions and one line below, then tap Submit.',
    ];
  }
  if (id === 'lep-challenge-4') {
    return [
      'Answer the four questions on this screen: your B-HAG at the start, your breakthroughs, the principles you use, your next B-HAG and CoDeSeF.',
      'Tap Submit. Your answers are the outline of your graduation presentation.',
      'Turn them into a 5–6 slide deck or a 90-second introduction, and upload it in Graduation Preparations before Friday.',
    ];
  }
  if (id === 'lep-brand-statement') {
    return [
      'Attend the Differentiated Brand session.',
      'Write your statement: who you serve, what you are known for, what makes you different.',
      'Keep it to one or two lines and tap Submit.',
    ];
  }
  if (id === 'lep-day8-preparation') {
    return [
      'Read "Get ready for your Graduation Day" on this screen.',
      'Prepare your 2-minute deck (5–6 slides) or 90-second introduction, and complete your Graduation Report.',
      'Upload both here before Friday: your deck (PDF or PowerPoint) and your Graduation Report (Word).',
    ];
  }
  if (id === 'lep-orientation-framework') {
    return [
      'Open Leadership Essentials Program Information under Batch materials and read it in the app.',
      'Tick the checklist when you understand the programme framework.',
      'Tap Submit checklist.',
    ];
  }
  if (id === 'lep-orientation-access') {
    return [
      'Open Program Access Essentials (PDF) under Batch materials.',
      'Complete each login and session join step it describes.',
      'Tick the checklist and tap Submit checklist.',
    ];
  }
  if (id === 'lep-resume-linkedin') {
    return [
      'Watch the LinkedIn session by Ms Divya on this screen.',
      'Update your LinkedIn profile on linkedin.com.',
      'Paste your profile link below and tap Submit link.',
    ];
  }
  if (id === 'lep-resume-template-study') {
    return [
      'Watch the resume template session video on this screen.',
      'Open Sample Resume Template (PDF) and study the format.',
      'Write your resume in the Iron Lady format, then tap Choose file and upload it (PDF or Word).',
    ];
  }
  if (id === 'lep-day1-promises') {
    return [
      'Read the full Promises and Agreements text on this screen (scroll to the end).',
      'Tap “I have read the full agreement” to unlock the form.',
      'Fill in your details, upload your signature, confirm you agree, then tap Submit agreement.',
    ];
  }
  if (id === 'lep-day2-assignment') {
    return [
      'Read all eight assignments listed on this screen.',
      'Complete each item in your notebook or document.',
      'Tap Choose file and upload your completed work.',
    ];
  }
  if (id === 'lep-prep-nsdc') {
    return [
      'Open www.skillindiadigital.gov.in (link below) and tap Register, then Learner/Participant.',
      'Enter your 10-digit mobile number and the 6-digit OTP, then set a 4-digit password.',
      'Complete KYC by OTP: enter your 12-digit Aadhaar number, tap Generate OTP and enter the OTP sent to your Aadhaar-linked mobile.',
      'Mandatory: after logging in, tap Show interest. The Universal form opens: fill it in and submit.',
      'Tick both boxes on this screen to confirm. Stuck? Watch the video on this screen.',
    ];
  }
  if (id === 'lep-via-survey') {
    return [
      'Open VIA Character Survey in Batch materials (viacharacter.org) and complete the free survey.',
      'Download or save your results report as a PDF.',
      'Upload your VIA report using Submit file on this screen.',
    ];
  }
  if (type === TASK_TYPES.LINK) {
    return [
      'Open the form or page linked in Batch materials (if shown).',
      'Complete it in your browser, then copy the URL you need to share.',
      'Paste the link in the box below and tap Submit link.',
    ];
  }
  if (type === TASK_TYPES.FILE_UPLOAD) {
    return [
      'Open any PDF or instructions under Batch materials first.',
      'Prepare your file (PDF, photo, or document) on your phone.',
      'Tap Submit file and choose your completed work.',
    ];
  }
  if (type === TASK_TYPES.VIDEO_RECORD) {
    return [
      'Read the preparation PDF under Batch materials if you have not already.',
      'Record about 60–120 seconds: Need, Differentiation, Offer.',
      'Tap Submit video and upload your recording (this is a certificate must-do).',
    ];
  }
  if (type === TASK_TYPES.WATCH_ONLY) {
    return ['Watch the video on this screen.', 'When you have finished, tap Mark watched.'];
  }
  if (type === TASK_TYPES.EDITABLE_TEMPLATE) {
    return [
      'Read the guide PDF under Batch materials if one is listed.',
      'Fill in every section of the worksheet on this screen.',
      'Tap the submit button at the bottom when you are done (first version is fine).',
    ];
  }
  if (type === TASK_TYPES.CHECKLIST) {
    const steps = [];
    if (id === 'lep-day3-27-principles' || id === 'lep-day3-5-rituals' || id === 'lep-day3-brand-roadmap') {
      steps.push('Watch the video on this screen (or under Batch materials).');
    } else if (task?.readingDocument || task?.resourceLinks?.length) {
      steps.push('Open the document or link under Batch materials.');
    }
    steps.push('Tick each checklist item when you have done it.');
    steps.push('Tap Submit checklist.');
    return steps;
  }
  if (type === TASK_TYPES.TEXT) {
    return [
      'Type your answer in the box on this screen (a few lines is enough).',
      'Tap Submit answer.',
    ];
  }
  if (id.startsWith('lep-quiz')) {
    return [
      'Answer each question on this screen: tap one option, then Next question.',
      'See your score and the right answer for anything you missed.',
      'Pass, then tap Save my score. You can retake it any time.',
    ];
  }
  if (id === 'lep-attendance') {
    return ['Your CEM records live attendance.', 'Confirm here that your attendance record looks correct.'];
  }
  if (id === 'lep-certification') {
    return ['When you have met programme requirements, your certificate is issued by the team.', 'Tick here when you have received or downloaded it.'];
  }
  return ['Follow the instructions above.', 'Use Batch materials if you need PDFs or external links.', 'Submit when you are done.'];
}

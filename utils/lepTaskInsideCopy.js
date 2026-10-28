import { TASK_TYPES } from '../constants/programs';
import { lepTaskPurpose } from '../constants/lepTaskPurpose';

export { lepTaskPurpose };

/** Heading above embedded task video (checklist / read-watch tasks). */
export function lepTaskWatchLabel(taskId) {
  const id = String(taskId || '');
  if (id === 'lep-day3-brand-roadmap') return 'Watch · Differentiated Brand & 0.5% League Roadmap';
  if (id === 'lep-day3-27-principles') return 'Watch · 27 Principles session';
  if (id === 'lep-day3-5-rituals') return 'Watch · 5 Daily Rituals';
  if (id === 'lep-day3-mentors') return 'Watch · Finding mentors';
  return 'Watch first';
}

/** Plain-language label for participants (Excel / task guide categories). */
export function lepTaskCategoryLabel(task) {
  const id = task?.id || '';
  if (id === 'lep-prep-nsdc') return 'NSDC registration';
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

  if (id === 'lep-prep-nsdc') {
    return [
      'Register on the NSDC portal (government site) using the link in Batch materials if provided.',
      'Copy the confirmation or registration link the portal gives you.',
      'Paste that link in the box on this screen and tap Submit link.',
    ];
  }
  if (id === 'lep-via-survey') {
    return [
      'Open VIA Character Survey in Batch materials (viacharacter.org) and complete the free survey.',
      'Download or save your results report as a PDF.',
      'Upload your VIA report and your 3 photographs using Submit file on this screen.',
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
    return ['Complete the quiz linked from this task or your cohort channel.', 'Tick the checklist when finished, then submit.'];
  }
  if (id === 'lep-attendance') {
    return ['Your CEM records live attendance.', 'Confirm here that your attendance record looks correct.'];
  }
  if (id === 'lep-certification') {
    return ['When you have met programme requirements, your certificate is issued by the team.', 'Tick here when you have received or downloaded it.'];
  }
  return ['Follow the instructions above.', 'Use Batch materials if you need PDFs or external links.', 'Submit when you are done.'];
}

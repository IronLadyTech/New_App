/** Form templates — custom components + LEP registry from new_lms */

import {
  getSubmitLabel,
  initialLepForm,
  isLepFormComplete,
} from './lepFormTemplates';

export { getSubmitLabel } from './lepFormTemplates';

export const TEMPLATE_IDS = {
  CODESEF: 'codesef',
  AGAME_BELIEFS: 'agame-beliefs',
  ERRC: 'errc',
  CRUCIBLE: 'crucible',
  AGAME_TABLE: 'agame-table',
  RESPONDING: 'responding',
  KEY_RELATIONSHIPS: 'key-relationships',
  PURPOSE_PEG: 'purpose-peg',
  LEAGUE_ROADMAP: 'league-roadmap',
};

export const CODESEF_ROW_COUNT = 6;

export const AGAME_SITUATION_ROWS = [
  'The situation was',
  '1. What was your inner dialogue in this situation?',
  '2. What was your behaviour derived out of such inner dialogue?',
  '3. What was your belief surrounding this situation?',
  '4. What was your body language in this situation?',
  '5. How frequent is this behaviour seen?',
  '6. Decision reached by the end of the situation',
];

export const AGAME_QUESTION_LABELS = AGAME_SITUATION_ROWS.slice(1);

function emptySituationBlock() {
  return { situation: '', answers: AGAME_QUESTION_LABELS.map(() => '') };
}

export function initialCodesefForm() {
  return {
    goal: '',
    capability: '',
    designTasks: Array.from({ length: CODESEF_ROW_COUNT }, () => ({ task: '', topTwenty: '' })),
    readiness: '',
    faizen1: '',
    faizen2: '',
  };
}

export function initialAgameBeliefsForm() {
  return {
    defeat: emptySituationBlock(),
    accomplished: emptySituationBlock(),
    empoweringBeliefs: '',
    disempoweringBeliefs: '',
    positiveEmotions: '',
    negativeEmotions: '',
    effectiveHabits: '',
    nonEffectiveHabits: '',
  };
}

function filled(v) {
  return !!(v || '').trim();
}

export function isCodesefComplete(form) {
  if (!form) return false;
  if (!filled(form.goal)) return false;
  if (!filled(form.capability)) return false;
  if (!filled(form.readiness)) return false;
  if (!filled(form.faizen1)) return false;
  if (!filled(form.faizen2)) return false;
  const rows = form.designTasks || [];
  return rows.some(
    (row) => filled(row.task) && (row.topTwenty === 'Yes' || row.topTwenty === 'No')
  );
}

function isSituationBlockComplete(block) {
  if (!block) return false;
  if (!filled(block.situation)) return false;
  const answers = block.answers || [];
  return answers.length >= AGAME_QUESTION_LABELS.length && answers.every(filled);
}

export function isAgameBeliefsComplete(form) {
  if (!form) return false;
  if (!isSituationBlockComplete(form.defeat)) return false;
  if (!isSituationBlockComplete(form.accomplished)) return false;
  return (
    filled(form.empoweringBeliefs) &&
    filled(form.disempoweringBeliefs) &&
    filled(form.positiveEmotions) &&
    filled(form.negativeEmotions) &&
    filled(form.effectiveHabits) &&
    filled(form.nonEffectiveHabits)
  );
}

export function initialFormForTemplate(templateId) {
  if (templateId === TEMPLATE_IDS.CODESEF) return initialCodesefForm();
  if (templateId === TEMPLATE_IDS.AGAME_BELIEFS) return initialAgameBeliefsForm();
  return initialLepForm(templateId);
}

export function isTemplateComplete(templateId, form) {
  if (templateId === TEMPLATE_IDS.CODESEF) return isCodesefComplete(form);
  if (templateId === TEMPLATE_IDS.AGAME_BELIEFS) return isAgameBeliefsComplete(form);
  return isLepFormComplete(templateId, form);
}

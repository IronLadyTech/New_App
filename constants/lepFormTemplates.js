/** LEP worksheet templates mirrored from new_lms formTemplates/registry.js */

/** Legacy grid keys — kept for old saved drafts. */
export const ERRC_COLUMNS = ['Eliminate', 'Reduce', 'Raise', 'Create'];

export const ERRC_DEFAULT_TASKS = [
  'Getting ready',
  'Feeding child',
  'Homework',
  'Getting child ready',
  'Sending daily report',
  'Daily team meeting',
  'Linked Branding',
];

/** errc-template.pdf — Week 1 handbook table. */
export const ERRC_HANDBOOK_ROW_COUNT = 16;

export const ERRC_HANDBOOK_COLUMNS = [
  { key: 'task', label: 'Tasks' },
  { key: 'avgTime', label: 'Average time taken (mins)' },
  { key: 'initialErrc', label: 'Initial Identification E/R/R/C' },
  { key: 'endStatus', label: 'End of the week status' },
];

export const LEP_FORM_DEFINITIONS = {
  crucible: {
    submitLabel: 'Submit crucible statement',
    fields: [
      {
        key: 'experience',
        label:
          'One experience or incident in my life, from birth to now, that is most unpleasant',
        hint: 'Preferably something that happened very early in your life.',
        type: 'textarea',
        required: true,
        section: 'Work through these one at a time',
      },
      {
        key: 'emotion',
        label: 'What was the emotion of that experience at the time?',
        type: 'textarea',
        required: true,
        section: 'Work through these one at a time',
      },
      {
        key: 'selfTalk',
        label: 'What did I tell myself?',
        type: 'textarea',
        required: true,
        section: 'Work through these one at a time',
      },
      {
        key: 'aboutOthers',
        label: 'What did I feel about others?',
        type: 'textarea',
        required: true,
        section: 'Work through these one at a time',
      },
      {
        key: 'conclusion',
        label: 'What is the conclusion I reached based on that experience?',
        type: 'textarea',
        required: true,
        section: 'Work through these one at a time',
      },
      {
        key: 'crucibleStatement',
        label: 'My crucible statement is',
        type: 'textarea',
        required: true,
        section: 'Now draw it together',
      },
      {
        key: 'dominantEmotion',
        label: 'My dominant crucible emotion is',
        type: 'text',
        required: true,
        section: 'Now draw it together',
      },
      {
        key: 'behaviourPattern',
        label: 'My dominant crucible behaviour pattern is',
        type: 'text',
        required: true,
        section: 'Now draw it together',
      },
    ],
  },

  'agame-table': {
    submitLabel: 'Submit A-Game table',
    fields: [
      {
        key: 'today',
        type: 'table',
        label: 'A-Game Table',
        section: 'Today',
        rowLabels: ['At my best today', 'Not at my best today'],
        columns: [
          { key: 'instances', label: 'Which were the instances?' },
          { key: 'actions', label: 'What did I do? / What could I have done?' },
        ],
        required: true,
      },
    ],
  },

  responding: {
    submitLabel: 'Submit your answers',
    fields: [
      {
        key: 'situations',
        type: 'table',
        label: 'Respond vs React',
        section: 'Situations',
        rowLabels: [
          'I am not in a good mood and someone asks me a stupid question',
          'Someone points fingers at me in a meeting',
          'Someone blames me for none of my mistakes',
          'My boss gives all negative feedback and asks my opinion during 1-1',
          'My boss asks me status on something which was not owned by me',
          "My boss's boss asks status on something which was owned by my boss",
          'I am held accountable for a failure of my team and asked for explanation',
        ],
        columns: [
          {
            key: 'response',
            label: 'How I handle it',
            type: 'choice',
            options: ['I Respond', 'I React'],
          },
        ],
        totals: true,
        required: true,
      },
    ],
  },

  'key-relationships': {
    submitLabel: 'Submit relationship map',
    fields: [
      {
        key: 'relationships',
        type: 'table',
        label: 'Things that matter in key relationships',
        hint: 'One row for each key relationship. Leave spare rows empty.',
        section: 'Key relationships',
        rowNoun: 'Relationship',
        rowCount: 5,
        minRows: 1,
        columns: [
          { key: 'relationship', label: 'Key relationship' },
          { key: 'mattersToYou', label: 'Things that matter to you in this relationship' },
          {
            key: 'mattersToThem',
            label: 'Things that matter to the other person in this relationship',
          },
        ],
        required: true,
      },
    ],
  },

  'purpose-peg': {
    submitLabel: 'Submit Purpose Peg table',
    fields: [
      {
        key: 'pegs',
        type: 'table',
        label: 'Purpose Peg table',
        hint: 'Fill the rows that apply. Leave spare rows empty.',
        section: 'Your Purpose Pegs',
        rowLabels: ['1', '2', '3', '4', '5'],
        minRows: 1,
        columns: [
          { key: 'area', label: 'Area of importance' },
          { key: 'purposeBhag', label: 'Purpose B-HAG' },
          { key: 'rituals', label: 'Rituals / PEGS' },
        ],
        required: true,
      },
    ],
  },

  'league-roadmap': {
    submitLabel: 'Submit your roadmap',
    fields: [
      {
        key: 'strength',
        label: 'Differentiated strength is',
        type: 'textarea',
        required: true,
        section: 'Your differentiated strength',
      },
      {
        key: 'books',
        label: '1. Books to read',
        hint: 'One per line.',
        type: 'textarea',
        required: true,
        section: 'Plan for moving towards excellence',
      },
      {
        key: 'videos',
        label: '2. Videos to watch',
        hint: 'One per line.',
        type: 'textarea',
        required: true,
        section: 'Plan for moving towards excellence',
      },
      {
        key: 'articles',
        label: '3. Articles to read',
        hint: 'One per line.',
        type: 'textarea',
        required: true,
        section: 'Plan for moving towards excellence',
      },
      {
        key: 'mentors',
        label: '4. Mentors to speak to',
        hint: 'One per line.',
        type: 'textarea',
        required: true,
        section: 'Plan for moving towards excellence',
      },
      {
        key: 'people',
        label: '5. People to follow',
        hint: 'One per line.',
        type: 'textarea',
        required: true,
        section: 'Plan for moving towards excellence',
      },
      {
        key: 'habits',
        label: '6. Simple habits and rituals to develop or follow',
        hint: 'One per line.',
        type: 'textarea',
        required: true,
        section: 'Plan for moving towards excellence',
      },
      {
        key: 'knowledgeBase',
        label: '7. Knowledge base',
        hint:
          'Magazines, networking sessions, awards, job portals, blogs, and the top accomplishers in your area.',
        type: 'textarea',
        required: true,
        section: 'Plan for moving towards excellence',
      },
      {
        key: 'milestones',
        type: 'table',
        label: '8. Milestones to reach',
        hint: 'Fill the rows you need. Leave spare rows empty.',
        section: 'Milestones',
        rowNoun: 'Milestone',
        rowCount: 4,
        minRows: 1,
        columns: [
          { key: 'timeframe', label: 'Timeframe' },
          { key: 'milestone', label: 'Milestone' },
          { key: 'measurement', label: 'Measurement' },
        ],
        required: true,
      },
    ],
  },

  errc: {
    type: 'grid',
    submitLabel: 'Submit ERRC table',
  },
};

export function getFormDefinition(templateId) {
  return LEP_FORM_DEFINITIONS[templateId] || null;
}

export function getSubmitLabel(templateId) {
  return getFormDefinition(templateId)?.submitLabel || 'Submit form';
}

export function createErrcHandbookRows() {
  return Array.from({ length: ERRC_HANDBOOK_ROW_COUNT }, () => ({
    task: '',
    avgTime: '',
    initialErrc: '',
    endStatus: '',
  }));
}

export function createErrcRows(tasks = ERRC_DEFAULT_TASKS) {
  return tasks.map((activity) => ({
    activity,
    Eliminate: '',
    Reduce: '',
    Raise: '',
    Create: '',
  }));
}

const cellFilled = (value) => String(value ?? '').trim().length > 0;

export function isErrcHandbookRow(row) {
  return ERRC_HANDBOOK_COLUMNS.some((col) => cellFilled(row?.[col.key]));
}

export function isErrcHandbookComplete(form) {
  const rows = form?.rows || [];
  if (!rows.length) return false;
  const keys = ERRC_HANDBOOK_COLUMNS.map((c) => c.key);
  const filledPerRow = rows.map((row) => keys.filter((k) => cellFilled(row?.[k])).length);
  if (filledPerRow.some((n) => n > 0 && n < keys.length)) return false;
  return filledPerRow.some((n) => n === keys.length);
}

export function isErrcActivitiesComplete(form) {
  const rows = form?.activities || [];
  if (!rows.length) return false;
  const filledPerRow = rows.map((row) => ERRC_COLUMNS.filter((k) => cellFilled(row?.[k])).length);
  if (filledPerRow.some((n) => n > 0 && n < ERRC_COLUMNS.length)) return false;
  return filledPerRow.some((n) => n === ERRC_COLUMNS.length);
}

export function isErrcFormComplete(form) {
  return isErrcHandbookComplete(form) || isErrcActivitiesComplete(form);
}

function createTableRows(field) {
  const blank = () => Object.fromEntries(field.columns.map((col) => [col.key, '']));
  if (field.rowLabels?.length) return field.rowLabels.map((label) => ({ label, ...blank() }));
  return Array.from({ length: field.rowCount || 1 }, blank);
}

const cellAnswered = (col, value) =>
  col.type === 'choice' ? (col.options || []).includes(value) : cellFilled(value);

function isTableFieldComplete(field, rows) {
  if (!Array.isArray(rows) || !rows.length || !field?.columns?.length) return false;
  const total = field.columns.length;
  const filledPerRow = rows.map(
    (row) => field.columns.filter((col) => cellAnswered(col, row?.[col.key])).length
  );
  if (filledPerRow.some((n) => n > 0 && n < total)) return false;
  const completeRows = filledPerRow.filter((n) => n === total).length;
  const needed = Math.min(field.minRows ?? rows.length, rows.length);
  return completeRows > 0 && completeRows >= needed;
}

export function initialLepForm(templateId) {
  const def = getFormDefinition(templateId);
  if (!def) return null;
  if (templateId === 'errc') {
    return { week: 1, rows: createErrcHandbookRows(), activities: createErrcRows() };
  }
  if (def.type === 'grid') return { rows: createErrcRows() };
  if (!def.fields) return {};
  return Object.fromEntries(
    def.fields
      .filter((field) => !field.legacy)
      .map((field) => [field.key, field.type === 'table' ? createTableRows(field) : ''])
  );
}

export function isLepFormComplete(templateId, form) {
  const def = getFormDefinition(templateId);
  if (!def || !form) return false;
  if (templateId === 'errc') return isErrcFormComplete(form);
  if (def.type === 'grid') {
    const rows = form.rows || [];
    if (!rows.length) return false;
    return rows.every((row) => ERRC_COLUMNS.every((col) => cellFilled(row[col])));
  }
  return (def.fields || [])
    .filter((field) => field.required !== false && !field.legacy)
    .every((field) =>
      field.type === 'table'
        ? isTableFieldComplete(field, form[field.key])
        : cellFilled(form[field.key])
    );
}

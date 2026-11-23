/** In-app assignment briefs (FILE_UPLOAD tasks) when LMS PDF is missing or for quick reference. */

export const LEP_DAY2_ASSIGNMENT = {
  title: 'Assignments: Day 2',
  items: [
    'Acknowledge parents by letter again. Also, acknowledge the most important person in your life, aside from your parents. If you are married — spouse and kids necessarily.',
    'In the mirror, state emphatically: “I am whole, complete and perfect.”',
    'Share acknowledgement with two people from the list you made on Day 1.',
    'Make 3 powerful requests and get at least one NO.',
    'Write down your purpose 5 times.',
    'Finetune the ritual you defined towards maximizing.',
    'Check the alignment with key relationships in your life.',
    'Finetune the CoDeSeF plan. Be ready to present this as a strategy within 2 minutes tomorrow to your key stakeholders. Explore ways of keeping the Context ACTIVE and ALIVE in front of you for the next 3 months.',
  ],
};

export function lepAssignmentBrief(taskId) {
  const id = String(taskId || '');
  if (id === 'lep-day2-assignment') return LEP_DAY2_ASSIGNMENT;
  return null;
}
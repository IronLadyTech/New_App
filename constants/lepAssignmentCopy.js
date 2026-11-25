/** In-app assignment briefs (FILE_UPLOAD tasks) when LMS PDF is missing or for quick reference. */

export const LEP_DAY2_ASSIGNMENT = {
  title: 'Day 2 assignments',
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

/** Programme team's graduation message (25 Nov 2026). */
export const LEP_GRADUATION_PREP = {
  title: 'Get ready for your Graduation Day',
  intro:
    'Congratulations on completing the Iron Lady Leadership Essentials Program by taking part in every aspect of it. Your **Graduation Day is on Saturday evening**. Take these two actions to prepare:',
  items: [
    {
      text: '**Prepare a 2-minute presentation** (a deck of 5–6 slides) **or a 90-second introduction** on your 4-week Iron Lady journey. Cover:',
      points: [
        '**Your B-HAG and objectives** you set at the start of the programme',
        '**B-HAG progress and the breakthroughs** you produced',
        '**How you are using Iron Lady principles**: the ones helping you achieve breakthroughs',
        '**Your next B-HAG for the next 6–12 months**, and your **strategy (CoDeSeF)** to accomplish it',
      ],
    },
    '**Complete your Graduation Report** (Word document).',
  ],
  note: 'Submit both in your **Assignment folder before Friday**.',
};

export function lepAssignmentBrief(taskId) {
  const id = String(taskId || '');
  if (id === 'lep-day2-assignment') return LEP_DAY2_ASSIGNMENT;
  if (id === 'lep-day8-preparation') return LEP_GRADUATION_PREP;
  // Day 2 list is in-app only — no hosted PDF (day-2-assignment.pdf was missing on LMS).
  return null;
}
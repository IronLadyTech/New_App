/** Profile → Help & Support (learner-facing). */
export const IRON_LADY_SUPPORT_EMAIL = 'admin@iamironlady.com';

/** LEP learners write to the LEP team (programme team, 26 Nov 2026). */
export const LEP_SUPPORT_EMAIL = 'askanakanksha@iamironlady.com';

/** The address a learner sees: the LEP team for LEP learners, the general one for everyone else. */
export function supportEmailFor(profile) {
  const programs = [profile?.program, ...(Array.isArray(profile?.programs) ? profile.programs : [])];
  const lep = programs.some((p) => String(p || '').toLowerCase() === 'lep') || Boolean(profile?.programAccess?.lep);
  return lep ? LEP_SUPPORT_EMAIL : IRON_LADY_SUPPORT_EMAIL;
}

export const PROFILE_FAQ = [
  {
    q: 'How do I pick or change my LEP batch date?',
    a: 'Open Profile → Your batches → Choose batch date (or Change batch date). Your choice is saved in the app first; Home and My Program update within a few minutes.',
  },
  {
    q: 'I paid but still see “Registered” instead of “Enrolled”.',
    a: 'Enrollment can take a short while after payment. Pull to refresh on Home, or email us with your registered mobile number and payment receipt.',
  },
  {
    q: 'Where are my tasks and submissions?',
    a: 'My Program lists your phases and tasks. After you submit, your Iron Lady team reviews your work — status shows on each task screen.',
  },
  {
    q: 'Why am I not getting reminders?',
    a: 'Check phone notification permissions for Iron Lady. Session and task reminders also depend on your batch calendar in the app.',
  },
  {
    q: 'Who do I contact for program questions?',
    a: 'Your CX and the Iron Lady team — email us from this screen. Include the mobile number you use to sign in.',
  },
];

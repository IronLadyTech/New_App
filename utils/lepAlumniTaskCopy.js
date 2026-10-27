/** Copy when LEP cohort has ended — tasks are refresh / practice, not certificate gates. */

export const ALUMNI_PRACTICE_BANNER =
  'Your LEP batch has graduated. This is alumni practice from your monthly challenge — optional, and it does not change your certificate.';

export function alumniTaskSubtitle(task) {
  const kind = task?.kind ? String(task.kind) : 'Practice';
  return `LEP Graduate · Alumni practice · ${kind}`;
}

export function alumniSubmitCta(baseCta) {
  const cta = String(baseCta || 'Submit');
  if (/^mark watched/i.test(cta)) return 'Mark watched again';
  if (/quiz/i.test(cta)) return 'Save quiz refresh';
  if (/checklist/i.test(cta)) return 'Save checklist refresh';
  if (/submit form|submit/i.test(cta)) return 'Save refresh';
  if (/submit file|submit video|submit link/i.test(cta)) return cta.replace(/^Submit/i, 'Update');
  return 'Save practice';
}

export function alumniFlipGainFallback() {
  return 'A fresh pass on a tool you already used in LEP — for your leadership now, not for certification.';
}

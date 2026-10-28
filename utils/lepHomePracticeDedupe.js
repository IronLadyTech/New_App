/** Daily principle revision row (not the week-focus slot). */
export function isDailyPrincipleRow(item) {
  if (!item || item.weekFocus) return false;
  if (item.practiceId === 'lep-principle') return true;
  return /Revise Principle \d+/i.test(String(item.title || ''));
}

export function isRitualsPracticeRow(item) {
  if (!item) return false;
  if (item.practiceId === 'lep-rituals') return true;
  return /5 Daily Rituals/i.test(String(item.title || ''));
}

/** Full-session or pre-work watch of all 27 — not the daily “Principle N” line. */
export function isFull27PrinciplesWatchRow(item) {
  if (!item) return false;
  if (item.taskId === 'lep-day3-27-principles') return true;
  if (item.practiceId === 'lep-principles-video') return true;
  if (/watch the 27 principles/i.test(String(item.title || ''))) return true;
  if (/^27 Principles$/i.test(String(item.title || '').trim())) return true;
  return false;
}

/**
 * Home deck only — one rituals line, one 27 thread (daily revise OR one watch), week task
 * should be brand / shameless / resume — not a second full 27 video beside daily revision.
 */
export function dedupeLepHomePractice(items) {
  const list = items || [];
  const hasDailyPrinciple = list.some(isDailyPrincipleRow);
  const hasRituals = list.some(isRitualsPracticeRow);

  let kept27Watch = false;

  return list.filter((item) => {
    if (hasRituals && item.taskId === 'lep-day3-5-rituals') {
      return false;
    }

    if (hasDailyPrinciple && item.taskId === 'lep-day3-27-principles') {
      return false;
    }

    if (isFull27PrinciplesWatchRow(item)) {
      if (hasDailyPrinciple) return false;
      if (kept27Watch) return false;
      kept27Watch = true;
    }

    return true;
  });
}

/**
 * CMS guest preview: /?cmsPreview=1&state=guest[&tier=mc] shows the guest app in the CMS
 * phone frame, even though the staff member viewing it is signed in. Read once at load.
 */
function readGuestPreview() {
  if (typeof window === 'undefined' || !window.location?.search) return null;
  try {
    const q = new URLSearchParams(window.location.search);
    if (q.get('cmsPreview') !== '1' || q.get('state') !== 'guest') return null;
    return {
      tier: q.get('tier') === 'mc' ? 'mc' : 'explore',
      // &go=engage opens the Engage tab (events); otherwise Home.
      go: q.get('go') === 'engage' ? { to: 'engage' } : null,
    };
  } catch {
    return null;
  }
}

export const GUEST_PREVIEW = readGuestPreview();

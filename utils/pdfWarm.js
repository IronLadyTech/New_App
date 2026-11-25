const warmed = new Set();

/** Start HTTP fetch early so PDF bytes are in cache when the reader WebView loads. */
export function warmPdfUrl(url) {
  const u = String(url || '').trim();
  if (!u || warmed.has(u)) return;
  warmed.add(u);
  fetch(u, { method: 'GET', headers: { Range: 'bytes=0-262143' } }).catch(() => {});
}
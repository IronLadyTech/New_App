export function isInAppDocument(url) {
  if (!url) return false;
  const lower = url.toLowerCase();
  return /\.pdf$/i.test(lower) || lower.includes('lmsironlady.web.app/templates/');
}

export function isPdfDocument(url) {
  return !!url && /\.pdf$/i.test(url);
}

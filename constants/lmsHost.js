/** Hosted LMS files. Open these URLs — do not copy binaries into the app. */
export const LMS_HOST = 'https://lmsironlady.web.app';

export function lmsUrl(path) {
  if (!path) return '';
  if (/^https?:\/\//i.test(path)) return path;
  if (path.startsWith('/app/')) return '';
  const segs = String(path)
    .split('/')
    .filter(Boolean)
    .map(encodeURIComponent);
  return `${LMS_HOST}/${segs.join('/')}`;
}

export function lepDoc(file) {
  return lmsUrl(`/templates/lep/${file}`);
}

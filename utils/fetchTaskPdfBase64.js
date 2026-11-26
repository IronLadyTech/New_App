// The legacy API lives under /legacy since Expo SDK 54: imported from the package root these
// calls throw at run time, so every in-app PDF failed ("Could not load this document").
import * as FileSystem from 'expo-file-system/legacy';
import { arrayBufferToBase64 } from './arrayBufferToBase64';

function cachePathFor(url) {
  const slug = encodeURIComponent(String(url)).replace(/%/g, '_').slice(0, 96);
  return `${FileSystem.cacheDirectory}task-pdf-${slug}.pdf`;
}

/** Returns false when the host serves HTML (missing file) instead of a PDF. */
export async function remoteUrlIsPdf(url) {
  try {
    const res = await fetch(url, { method: 'HEAD' });
    if (!res.ok) return false;
    const ct = String(res.headers.get('content-type') || '').toLowerCase();
    return ct.includes('pdf');
  } catch {
    return false;
  }
}

export async function fetchTaskPdfBase64(url) {
  const dest = cachePathFor(url);
  // A background download already running: wait for it instead of starting a second one.
  if (prefetching.has(url)) await prefetching.get(url);
  const info = await FileSystem.getInfoAsync(dest);
  if (!info.exists) {
    const result = await FileSystem.downloadAsync(url, dest);
    if (result.status !== 200) throw new Error(`HTTP ${result.status}`);
    const head = await FileSystem.readAsStringAsync(dest, {
      encoding: FileSystem.EncodingType.Base64,
    });
    if (!String(head || '').startsWith('JVBERi')) {
      await FileSystem.deleteAsync(dest, { idempotent: true });
      throw new Error('not_pdf');
    }
  }
  return FileSystem.readAsStringAsync(dest, { encoding: FileSystem.EncodingType.Base64 });
}

/** Web and fallback path without FileSystem. */
export async function fetchTaskPdfBase64ViaFetch(url) {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  const ct = String(res.headers.get('content-type') || '').toLowerCase();
  if (!ct.includes('pdf')) throw new Error('not_pdf');
  return arrayBufferToBase64(await res.arrayBuffer());
}
const prefetching = new Map();

/**
 * Download a task PDF into the phone's cache in the background (the task screen calls this as
 * soon as it shows the document), so opening it later skips the download.
 */
export function prefetchTaskPdf(url) {
  if (!url || !/^https?:\/\//i.test(String(url)) || !FileSystem.cacheDirectory) return Promise.resolve();
  if (prefetching.has(url)) return prefetching.get(url);
  const job = (async () => {
    const dest = cachePathFor(url);
    const info = await FileSystem.getInfoAsync(dest);
    if (info.exists) return;
    const tmp = `${dest}.part`;
    const result = await FileSystem.downloadAsync(url, tmp);
    if (result.status !== 200) {
      await FileSystem.deleteAsync(tmp, { idempotent: true });
      return;
    }
    const head = await FileSystem.readAsStringAsync(tmp, {
      encoding: FileSystem.EncodingType.Base64,
      length: 8,
      position: 0,
    });
    if (!String(head || '').startsWith('JVBERi')) {
      await FileSystem.deleteAsync(tmp, { idempotent: true });
      return;
    }
    await FileSystem.moveAsync({ from: tmp, to: dest });
  })()
    .catch(() => {})
    .finally(() => prefetching.delete(url));
  prefetching.set(url, job);
  return job;
}

import * as FileSystem from 'expo-file-system';
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
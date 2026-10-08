/** Base64-encode a PDF fetched in React Native (no browser CORS). */
export function arrayBufferToBase64(buffer) {
  const bytes = new Uint8Array(buffer);
  let binary = '';
  const chunk = 0x8000;
  for (let i = 0; i < bytes.length; i += chunk) {
    binary += String.fromCharCode.apply(null, bytes.subarray(i, i + chunk));
  }
  if (typeof globalThis.btoa === 'function') return globalThis.btoa(binary);
  throw new Error('btoa unavailable');
}

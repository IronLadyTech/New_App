/** Origin YouTube requires for embedded playback (Error 153 fix). */
export const YOUTUBE_EMBED_ORIGIN = 'https://com.lmsapp.mobile';

/** Extract a YouTube video id from common watch / share / embed URLs. */
export function youtubeIdFromUri(uri) {
  if (!uri) return null;
  const m = String(uri).match(
    /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([A-Za-z0-9_-]{11})/,
  );
  return m ? m[1] : null;
}

export function isHlsUri(uri) {
  if (!uri) return false;
  const u = String(uri).toLowerCase();
  return u.includes('.m3u8');
}

/** expo-video source: HLS streams need an explicit contentType on some devices. */
export function toPlayerSource(uri) {
  if (!uri) return null;
  if (isHlsUri(uri)) return { uri, contentType: 'hls' };
  return uri;
}

export function youtubeEmbedUri(id) {
  const origin = encodeURIComponent(YOUTUBE_EMBED_ORIGIN);
  return `https://www.youtube-nocookie.com/embed/${id}?rel=0&modestbranding=1&playsinline=1&origin=${origin}`;
}

/** HTML wrapper so WebView has a valid baseUrl (fixes YouTube Error 153). */
export function youtubeEmbedHtml(id) {
  const embed = youtubeEmbedUri(id);
  return `<!DOCTYPE html>
<html>
  <head>
    <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0" />
    <style>
      html, body { margin: 0; padding: 0; background: #000; height: 100%; overflow: hidden; }
      iframe { border: 0; width: 100%; height: 100%; }
    </style>
  </head>
  <body>
    <iframe
      src="${embed}"
      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
      allowfullscreen
    ></iframe>
  </body>
</html>`;
}

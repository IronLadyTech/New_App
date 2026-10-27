/** Origin YouTube requires for embedded playback (Error 153 fix). */
export const YOUTUBE_EMBED_ORIGIN = 'https://com.ironlady.app';

/** Extract a YouTube video id from common watch / share / embed URLs. */
export function youtubeIdFromUri(uri) {
  if (!uri) return null;
  const m = String(uri).match(
    /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([A-Za-z0-9_-]{11})/,
  );
  return m ? m[1] : null;
}

/** Direct video files and streams that expo-video plays in the app. */
export function isDirectVideoUri(uri) {
  if (!uri) return false;
  return /\.(mp4|m3u8|mov|webm|m4v)(\?|#|$)/i.test(String(uri));
}

/** Any link the app must play itself rather than hand to YouTube or a browser. */
export function isInAppVideoUri(uri) {
  return Boolean(youtubeIdFromUri(uri) || isDirectVideoUri(uri));
}

/**
 * Pages inside the YouTube player that would take the learner to YouTube itself
 * (logo, title, channel, "watch on YouTube", sign-in). The embed must never load them.
 */
const LEAVES_PLAYER = /(youtube\.com\/(watch|channel|c\/|@|shorts|results|user|playlist|redirect)|youtu\.be\/|m\.youtube\.com|accounts\.google|play\.google|^intent:|^vnd\.youtube|^youtube:)/i;

/** WebView guard for the embed: stay on the player, never navigate out to YouTube. */
export function allowYoutubeEmbedRequest(request) {
  const url = String(request?.url || '');
  if (LEAVES_PLAYER.test(url)) return false;
  // The page itself (loaded from html + baseUrl) and the player iframe are the only top-level loads.
  if (request?.isTopFrame === false) return true;
  return url === 'about:blank' || url.startsWith(YOUTUBE_EMBED_ORIGIN) || url.startsWith('data:');
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
  // rel=0 keeps suggestions to the same channel; iv_load_policy=3 hides annotation links.
  // enablejsapi=1 lets the wrapper page hear playback progress (youtubeEmbedHtml).
  return `https://www.youtube-nocookie.com/embed/${id}?rel=0&modestbranding=1&playsinline=1&iv_load_policy=3&enablejsapi=1&origin=${origin}`;
}

/** HTML wrapper so WebView has a valid baseUrl (fixes YouTube Error 153). */
export function youtubeEmbedHtml(id, { width, height } = {}) {
  const embed = youtubeEmbedUri(id);
  const w = width ? `${Math.round(width)}px` : '100%';
  const h = height ? `${Math.round(height)}px` : '100%';
  return `<!DOCTYPE html>
<html>
  <head>
    <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0" />
    <style>
      html, body { margin: 0; padding: 0; background: #000; width: 100%; height: 100%; overflow: hidden; }
      iframe {
        position: fixed;
        top: 0;
        left: 0;
        border: 0;
        width: ${w};
        height: ${h};
      }
    </style>
  </head>
  <body>
    <iframe
      src="${embed}"
      width="${width ? Math.round(width) : '100%'}"
      height="${height ? Math.round(height) : '100%'}"
      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
      allowfullscreen
    ></iframe>
    <script>
      // Ask the player for its state ("listening"), then relay time/duration to the app.
      (function () {
        var f = document.querySelector('iframe');
        var duration = 0;
        var heard = false;
        function send(m) {
          if (window.ReactNativeWebView) window.ReactNativeWebView.postMessage(JSON.stringify(m));
        }
        window.addEventListener('message', function (e) {
          if (String(e.origin).indexOf('youtube') === -1) return;
          var d;
          try { d = typeof e.data === 'string' ? JSON.parse(e.data) : e.data; } catch (_) { return; }
          heard = true;
          var info = d && d.info;
          if (!info) return;
          if (info.duration) duration = info.duration;
          if (typeof info.currentTime === 'number' && duration) send({ yt: 'progress', t: info.currentTime, d: duration });
          if (info.playerState === 0) send({ yt: 'ended' });
        });
        // The player only answers once it is ready, so keep asking until it does (≤ 20 s).
        var tries = 0;
        var ask = setInterval(function () {
          if (heard || ++tries > 40) return clearInterval(ask);
          f.contentWindow.postMessage(JSON.stringify({ event: 'listening', id: 1, channel: 'widget' }), '*');
        }, 500);
      })();
    </script>
  </body>
</html>`;
}

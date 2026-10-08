/**
 * In-app PDF reader — same idea as new_lms LessonDocument.
 * pdf.js draws onto canvas inside the WebView; no Google viewer, no leaving the app.
 *
 * @param {string} base64 raw PDF bytes
 * @param {number[] | null | undefined} pages 1-based page numbers, or all pages
 * @param {string} [label] for canvas aria-labels
 */
export function buildPdfViewerHtml(base64, pages, label = 'Document') {
  const pagesJson = JSON.stringify(pages?.length ? pages : null);
  const safeLabel = String(label).replace(/\\/g, '\\\\').replace(/'/g, "\\'");
  // base64 is alphanumeric + / + = — safe inside a single-quoted JS string
  const safeB64 = String(base64).replace(/\\/g, '\\\\').replace(/'/g, "\\'");

  return `<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8" />
<meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=5, user-scalable=yes" />
<style>
  * { box-sizing: border-box; }
  body { margin: 0; padding: 12px 12px 28px; background: #F7F6E4; }
  #status { padding: 40px 16px; text-align: center; color: #4A463D; font: 15px/1.4 -apple-system, BlinkMacSystemFont, sans-serif; }
  #err { display: none; padding: 24px 16px; color: #113744; text-align: center; font: 15px/1.4 -apple-system, BlinkMacSystemFont, sans-serif; }
  canvas { display: block; width: 100%; height: auto; margin: 0 auto 14px; background: #fff; border-radius: 10px; box-shadow: 0 2px 10px rgba(17,55,68,0.08); }
</style>
<script src="https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.min.js"></script>
</head>
<body>
<div id="status">Loading document…</div>
<div id="err"></div>
<div id="pages"></div>
<script>
  pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js';
  var label = '${safeLabel}';
  var filterPages = ${pagesJson};
  var raw = atob('${safeB64}');
  var bytes = new Uint8Array(raw.length);
  for (var i = 0; i < raw.length; i++) bytes[i] = raw.charCodeAt(i);

  pdfjsLib.getDocument({ data: bytes }).promise.then(function(pdf) {
    document.getElementById('status').style.display = 'none';
    var nums = filterPages && filterPages.length
      ? filterPages.filter(function(n) { return n >= 1 && n <= pdf.numPages; })
      : Array.from({ length: pdf.numPages }, function(_, i) { return i + 1; });
    var root = document.getElementById('pages');
    nums.forEach(function(num) {
      pdf.getPage(num).then(function(page) {
        var canvas = document.createElement('canvas');
        canvas.setAttribute('role', 'img');
        canvas.setAttribute('aria-label', label + ' — page ' + num + ' of ' + pdf.numPages);
        root.appendChild(canvas);
        var pad = 24;
        var w = Math.max((document.body.clientWidth || window.innerWidth) - pad, 280);
        var base = page.getViewport({ scale: 1 });
        var dpr = Math.min(window.devicePixelRatio || 1, 2);
        var vp = page.getViewport({ scale: (w / base.width) * dpr });
        canvas.width = Math.floor(vp.width);
        canvas.height = Math.floor(vp.height);
        canvas.style.width = Math.floor(vp.width / dpr) + 'px';
        canvas.style.height = Math.floor(vp.height / dpr) + 'px';
        page.render({ canvasContext: canvas.getContext('2d'), viewport: vp });
      });
    });
  }).catch(function() {
    document.getElementById('status').style.display = 'none';
    var err = document.getElementById('err');
    err.style.display = 'block';
    err.textContent = 'This document could not be displayed. Check your connection and try again.';
  });
</script>
</body>
</html>`;
}

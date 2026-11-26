import { lepFullName } from './lepState';

/**
 * Feedback forms (Google Forms / Zoho Survey) opened inside the app, with her details filled in.
 * Google: prefill by entry id. Zoho: custom variables (name, mobile, email, batch) — ignored by
 * the survey until those variables are added in Zoho Survey settings.
 */

// Google Form question ids, per form (read from the live forms, 26 Nov 2026).
const GOOGLE_PREFILL = {
  // Day 1–2 feedback: name, city, batch (dropdown "28th Nov 26").
  '1FAIpQLSdznJWqprFRmTjYOovjixhjC-9rilL4mB0eaK0StjpmYLTlzQ': { name: '1851737840', city: '893030630', batch: '1871340838' },
  // Session feedback forms share the same "Your full name" question.
  '1FAIpQLSf0TeNTjopitMAvg9nELcMTKwBTklwVfSmhW4T_l0KD9vhWwQ': { name: '1051168791' },
  '1FAIpQLSetSj2DU-AbJq-Dkn-f1BPGYuZxjJ_dU9PFE0pj3aEyutrj6Q': { name: '1051168791' },
  '1FAIpQLScMtmYaU7ZgEqZFnIc9wfnTyJSXxCESfkMbBtxO3EigyuZ03g': { name: '1051168791' },
};

const MON = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

function ordinal(n) {
  const v = n % 100;
  if (v >= 11 && v <= 13) return `${n}th`;
  return `${n}${{ 1: 'st', 2: 'nd', 3: 'rd' }[n % 10] || 'th'}`;
}

/** Her Day 1 the way the Day 1–2 form lists batches: "28th Nov 26". */
export function formBatchLabel(day1Iso) {
  const m = /^(\d{4})-(\d{2})-(\d{2})/.exec(String(day1Iso || ''));
  if (!m) return '';
  return `${ordinal(Number(m[3]))} ${MON[Number(m[2]) - 1]} ${m[1].slice(2)}`;
}

export function feedbackFormKind(url) {
  const u = String(url || '');
  if (/docs\.google\.com\/forms|forms\.gle/.test(u)) return 'google';
  if (/zoho(public)?\.(in|com)\/zs|survey\.zoho/.test(u)) return 'zoho';
  return 'other';
}

function details(profile) {
  const name = lepFullName(profile);
  return {
    name: name === 'Iron Lady member' ? '' : name,
    city: String(profile?.city || '').trim(),
    mobile: String(profile?.phoneNumber || profile?.phone || '').replace(/[^\d+]/g, ''),
    email: String(profile?.email || '').trim(),
    batch: formBatchLabel(profile?.programAccess?.lep?.day1Date),
  };
}

/** The form's address with her details filled in. */
export function feedbackFormUrl(url, profile) {
  const kind = feedbackFormKind(url);
  const d = details(profile);
  const params = [];
  const add = (k, v) => v && params.push(`${k}=${encodeURIComponent(v)}`);
  if (kind === 'google') {
    const id = (/\/forms\/d\/e\/([^/]+)/.exec(url) || [])[1];
    const ids = GOOGLE_PREFILL[id] || {};
    Object.entries(ids).forEach(([field, entry]) => add(`entry.${entry}`, d[field]));
    if (params.length) params.unshift('usp=pp_url');
  } else if (kind === 'zoho') {
    ['name', 'mobile', 'email', 'batch'].forEach((k) => add(k, d[k]));
  }
  if (!params.length) return url;
  return `${url}${url.includes('?') ? '&' : '?'}${params.join('&')}`;
}

/**
 * Runs inside the form page and tells the app once she has submitted: Google shows its
 * "response recorded" page (address ends in formResponse, no questions left); Zoho shows its
 * thank-you page (no fields left, a thank-you line).
 */
export const FEEDBACK_DONE_JS = `
(function () {
  if (window.__ilFeedbackWatch) return; window.__ilFeedbackWatch = true;
  var sent = false;
  function check() {
    if (sent) return;
    var href = location.href;
    var text = (document.body && document.body.innerText) || '';
    var fields = document.querySelectorAll('[role="listitem"], input:not([type="hidden"]), textarea, select').length;
    var google = /formResponse/.test(href) && !document.querySelector('[role="listitem"]');
    var zoho = /zoho/.test(href) && fields === 0 && /thank|response has been|submitted/i.test(text);
    var redirect = /ironlady\\.app\\/feedback-done/.test(href);
    if (google || zoho || redirect) {
      sent = true;
      window.ReactNativeWebView.postMessage('il-feedback-done');
    }
  }
  setInterval(check, 1000);
  check();
})();
true;
`;

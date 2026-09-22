/**
 * Returns true when services/firebase.js has real (non-placeholder) values.
 */
export function isFirebaseConfigured(config) {
  if (!config?.apiKey || !config?.projectId || !config?.appId) return false;
  const value = `${config.apiKey}|${config.projectId}|${config.appId}`;
  return (
    !value.includes('YOUR_API_KEY') &&
    !value.includes('YOUR_PROJECT_ID') &&
    !value.includes('YOUR_APP_ID') &&
    config.apiKey.startsWith('AIza')
  );
}

/** Map Firebase Auth error codes to short user-facing messages. */
export function friendlyAuthError(error) {
  const code = error?.code || '';
  const map = {
    'auth/invalid-api-key':
      'Firebase API key was rejected. In Google Cloud Console → APIs → Credentials, open this key and allow Android/iOS apps (or remove HTTP-referrer-only restrictions).',
    'auth/api-key-not-valid.-please-pass-a-valid-api-key.':
      'Firebase API key was rejected. Check key restrictions in Google Cloud Console.',
    'auth/api-key-not-valid':
      'Firebase API key is invalid. Check services/firebase.js.',
    'auth/invalid-credential': 'Wrong email or password.',
    'auth/invalid-email': 'Enter a valid email address.',
    'auth/user-not-found': 'No account with that email. Create an account first.',
    'auth/wrong-password': 'Wrong password.',
    'auth/invalid-login-credentials': 'Wrong email or password.',
    'auth/email-already-in-use': 'That email already has an account. Sign in instead.',
    'auth/weak-password': 'Password must be at least 6 characters.',
    'auth/network-request-failed':
      'Network error. Check your internet connection.',
    'auth/too-many-requests': 'Too many attempts. Wait a moment and try again.',
    'auth/operation-not-allowed':
      'Email/Password sign-in is disabled in the Firebase console.',
    'auth/configuration-not-found':
      'Firebase Auth is not set up. Enable Email/Password in the Firebase console.',
    'auth/app-not-authorized':
      'This app is not authorized for this Firebase API key. Add the app in Firebase Console or relax API key restrictions.',
  };
  if (map[code]) return map[code];

  const msg = String(error?.message || '');
  if (/api.?key/i.test(msg) || /api-key/i.test(code)) {
    return `Firebase rejected the API key (${code || 'unknown'}). Check Google Cloud key restrictions for mobile use.`;
  }
  return msg || 'Something went wrong.';
}

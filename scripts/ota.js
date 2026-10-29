/**
 * Publish a JavaScript-only update to installed APKs (EAS Update).
 *
 *   npm run ota -- "Fix nav bar"            → channel "preview" (tester APKs)
 *   npm run ota -- "Fix nav bar" production → channel "production"
 *
 * Phones download it in the background on next open and run it on the open after.
 * Only JS/asset changes can go this way. A new native package, permission or Expo SDK
 * needs a new APK — and a bump of "runtimeVersion" in app.json (plus expo_runtime_version
 * in android/app/src/main/res/values/strings.xml, same value), so old APKs never get JS
 * they cannot run. Bare workflow: the runtime version is a literal string, not a policy.
 */
const { spawnSync } = require('child_process');

const [message, channel = 'preview'] = process.argv.slice(2);
if (!message) {
  console.error('Usage: npm run ota -- "what changed" [preview|production]');
  process.exit(1);
}

// Same build-time env as the APK, or the update would switch login back to demo codes.
const env = { ...process.env, EXPO_PUBLIC_PHONE_OTP: 'firebase' };

// Windows needs the shell to find npx, and the shell splits on spaces: quote the message.
const isWin = process.platform === 'win32';
const msg = isWin ? `"${message.replace(/"/g, "'")}"` : message;
const result = spawnSync(
  'npx',
  ['eas-cli@latest', 'update', '--channel', channel, '--environment', channel, '--message', msg, '--platform', 'android', '--non-interactive'],
  { stdio: 'inherit', env, shell: isWin }
);
process.exit(result.status ?? 1);

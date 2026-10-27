/**
 * Run before EAS build: proves expo-notifications baked icon + color into android/.
 * Does NOT replace installing an APK — but catches "white circle" misconfig early.
 *
 * Usage: node scripts/verify-notification-android.js
 * Prereq: npx expo prebuild --platform android --no-install (once, or script runs it)
 */
const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const root = path.join(__dirname, '..');
const androidRes = path.join(root, 'android', 'app', 'src', 'main', 'res');
const manifestPath = path.join(root, 'android', 'app', 'src', 'main', 'AndroidManifest.xml');

function fail(msg) {
  console.error('FAIL:', msg);
  process.exit(1);
}

function ok(msg) {
  console.log('OK:', msg);
}

const appJson = JSON.parse(fs.readFileSync(path.join(root, 'app.json'), 'utf8'));
const plugin = (appJson.expo.plugins || []).find(
  (p) => Array.isArray(p) && p[0] === 'expo-notifications'
);
if (!plugin) fail('expo-notifications plugin missing in app.json');
const opts = plugin[1] || {};
const iconSrc = path.join(root, opts.icon?.replace(/^\.\//, '') || '');
if (!fs.existsSync(iconSrc)) fail(`Notification icon source missing: ${opts.icon}`);
ok(`app.json icon → ${opts.icon}, color ${opts.color || '(default)'}`);

if (!fs.existsSync(manifestPath)) {
  console.log('Running expo prebuild --platform android --no-install …');
  execSync('npx expo prebuild --platform android --no-install', {
    cwd: root,
    stdio: 'inherit',
    env: { ...process.env, CI: '1' },
  });
}

const manifest = fs.readFileSync(manifestPath, 'utf8');
if (!manifest.includes('default_notification_icon')) {
  fail('AndroidManifest missing FCM default_notification_icon meta-data');
}
if (!manifest.includes('@drawable/notification_icon')) {
  fail('AndroidManifest does not point to @drawable/notification_icon');
}
if (!manifest.includes('expo.modules.notifications.large_notification_icon')) {
  fail('AndroidManifest missing expo large_notification_icon (set largeIcon in app.json)');
}
if (!manifest.includes('@drawable/notification_large_icon')) {
  fail('AndroidManifest does not point to @drawable/notification_large_icon');
}
ok('AndroidManifest wires notification_icon, large icon, and FCM meta-data');

const densities = ['mdpi', 'hdpi', 'xhdpi', 'xxhdpi', 'xxxhdpi'];
let found = 0;
for (const d of densities) {
  const file = path.join(androidRes, `drawable-${d}`, 'notification_icon.png');
  if (!fs.existsSync(file)) {
    console.warn('WARN: missing', file);
    continue;
  }
  const stat = fs.statSync(file);
  if (stat.size < 80) fail(`${file} too small (${stat.size} bytes) — likely empty icon`);
  found++;
  ok(`drawable-${d}/notification_icon.png (${stat.size} bytes)`);
}
if (found < 3) fail('Too few notification_icon densities generated');

let largeFound = 0;
for (const d of densities) {
  const file = path.join(androidRes, `drawable-${d}`, 'notification_large_icon.png');
  if (!fs.existsSync(file)) {
    console.warn('WARN: missing', file);
    continue;
  }
  const stat = fs.statSync(file);
  if (stat.size < 200) fail(`${file} too small (${stat.size} bytes)`);
  largeFound++;
  ok(`drawable-${d}/notification_large_icon.png (${stat.size} bytes)`);
}
if (largeFound < 3) fail('Too few notification_large_icon densities generated');

const colorXml = path.join(androidRes, 'values', 'colors.xml');
if (fs.existsSync(colorXml)) {
  const colors = fs.readFileSync(colorXml, 'utf8');
  if (!colors.includes('notification_icon_color')) {
    fail('colors.xml missing notification_icon_color');
  }
  ok('notification_icon_color in colors.xml');
}

console.log('\nPre-build check passed.');
console.log('Tray: brand silhouette (foreground). Shade header/right: full logo via notification_large_icon.');
console.log('Next: eas build -p android --profile preview (after this passes).');

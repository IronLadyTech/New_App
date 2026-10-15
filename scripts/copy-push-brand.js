/**
 * Full-color logo for FCM notification image (Android expanded tray).
 * Run after `expo export --platform web` so hosting serves a stable URL.
 */
const fs = require('fs');
const path = require('path');

const root = path.join(__dirname, '..');
const src = path.join(root, 'assets', 'icon.png');
const dest = path.join(root, 'dist', 'notification-logo.png');

if (!fs.existsSync(src)) {
  console.error('Missing assets/icon.png');
  process.exit(1);
}
if (!fs.existsSync(path.join(root, 'dist'))) {
  console.error('Run expo export --platform web first (no dist/ folder).');
  process.exit(1);
}
fs.copyFileSync(src, dest);
console.log('Copied notification-logo.png to dist/');

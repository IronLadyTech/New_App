/**
 * After expo-notifications:
 * 1) Full-color small tray icon (notification_icon)
 * 2) Large right-side icon like Duolingo (notification_large_icon)
 *    via expo.modules.notifications.large_notification_icon meta-data
 */
const {
  withDangerousMod,
  withAndroidManifest,
  AndroidConfig,
} = require('@expo/config-plugins');
const { generateImageAsync } = require('@expo/image-utils');
const fs = require('fs');
const path = require('path');

const ANDROID_RES = 'android/app/src/main/res';
const SCALES = [
  { folder: 'drawable-mdpi', scale: 1 },
  { folder: 'drawable-hdpi', scale: 1.5 },
  { folder: 'drawable-xhdpi', scale: 2 },
  { folder: 'drawable-xxhdpi', scale: 3 },
  { folder: 'drawable-xxxhdpi', scale: 4 },
];

const META_LARGE =
  'expo.modules.notifications.large_notification_icon';
const LARGE_RESOURCE = '@drawable/notification_large_icon';

async function writeIcons(projectRoot) {
  const src = path.join(projectRoot, 'assets', 'icon.png');
  if (!fs.existsSync(src)) return false;

  for (const { folder, scale } of SCALES) {
    const dir = path.join(projectRoot, ANDROID_RES, folder);
    fs.mkdirSync(dir, { recursive: true });

    const smallPx = Math.round(24 * scale);
    const { source: small } = await generateImageAsync(
      { projectRoot, cacheType: 'ironlady-notification-brand' },
      { src, width: smallPx, height: smallPx, resizeMode: 'cover' }
    );
    fs.writeFileSync(path.join(dir, 'notification_icon.png'), small);

    // Android large icon ~64dp (shown on the right in the shade, Duolingo-style).
    const largePx = Math.round(64 * scale);
    const { source: large } = await generateImageAsync(
      { projectRoot, cacheType: 'ironlady-notification-large' },
      { src, width: largePx, height: largePx, resizeMode: 'cover' }
    );
    fs.writeFileSync(path.join(dir, 'notification_large_icon.png'), large);
  }
  return true;
}

function withLargeIconManifest(config) {
  return withAndroidManifest(config, (cfg) => {
    const mainApplication = AndroidConfig.Manifest.getMainApplicationOrThrow(cfg.modResults);
    AndroidConfig.Manifest.addMetaDataItemToMainApplication(
      mainApplication,
      META_LARGE,
      LARGE_RESOURCE,
      'resource'
    );
    return cfg;
  });
}

function withIronLadyNotificationBrand(config) {
  config = withLargeIconManifest(config);
  config = withDangerousMod(config, [
    'android',
    async (cfg) => {
      await writeIcons(cfg.modRequest.projectRoot);
      return cfg;
    },
  ]);
  return config;
}

module.exports = withIronLadyNotificationBrand;

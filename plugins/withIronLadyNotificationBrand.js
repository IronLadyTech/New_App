/**
 * After expo-notifications, embed full-color Iron Lady mark for tray display.
 * Some OEMs still tint; others show the bitmap — better than an empty white circle.
 */
const { withDangerousMod } = require('@expo/config-plugins');
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

function withIronLadyNotificationBrand(config) {
  return withDangerousMod(config, [
    'android',
    async (cfg) => {
      const root = cfg.modRequest.projectRoot;
      const src = path.join(root, 'assets', 'icon.png');
      if (!fs.existsSync(src)) return cfg;

      for (const { folder, scale } of SCALES) {
        const dir = path.join(root, ANDROID_RES, folder);
        fs.mkdirSync(dir, { recursive: true });
        const px = Math.round(24 * scale);
        const { source } = await generateImageAsync(
          { projectRoot: root, cacheType: 'ironlady-notification-brand' },
          { src, width: px, height: px, resizeMode: 'cover' }
        );
        fs.writeFileSync(path.join(dir, 'notification_icon.png'), source);
      }
      return cfg;
    },
  ]);
}

module.exports = withIronLadyNotificationBrand;

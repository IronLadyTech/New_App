const { getDefaultConfig } = require('expo/metro-config');
const { withNativeWind } = require('nativewind/metro');

const config = withNativeWind(getDefaultConfig(__dirname), { input: './global.css' });

// Use @firebase/auth "react-native" export (getReactNativePersistence) in APK/IPA, not the web bundle.
config.resolver.unstable_enablePackageExports = true;
config.resolver.unstable_conditionNames = ['react-native', 'require', 'import', 'browser', 'default'];

const existingBlock = config.resolver.blockList;
const existingList = (
  Array.isArray(existingBlock) ? existingBlock.flat() : [existingBlock]
).filter((item) => item instanceof RegExp);
const blockFlags = existingList[0]?.flags ?? '';

config.resolver.blockList = [
  ...existingList,
  new RegExp('[\\\\/]_tmp_shots[\\\\/].*', blockFlags),
  new RegExp('[\\\\/]\\.firebase[\\\\/].*', blockFlags),
];

module.exports = config;

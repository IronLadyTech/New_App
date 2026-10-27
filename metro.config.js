const { getDefaultConfig } = require('expo/metro-config');
const { withNativeWind } = require('nativewind/metro');

const config = withNativeWind(getDefaultConfig(__dirname), { input: './global.css' });

// Expo's defaults already pick @firebase/auth's "react-native" build on Android/iOS and
// "browser" on web. Do not set unstable_conditionNames globally: an "import" condition makes
// CommonJS libraries get @babel/runtime's ESM helpers ("_interopRequireDefault is not a function").
config.resolver.unstable_enablePackageExports = true;

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

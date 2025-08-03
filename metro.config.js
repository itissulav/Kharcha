
const { getDefaultConfig } = require('@expo/metro-config');
const { withNativeWind } = require('nativewind/metro');

// 1. Get the default Expo Metro configuration
const config = getDefaultConfig(__dirname);

// 2. Add the Firebase-specific resolver settings
config.resolver.sourceExts.push('cjs');
config.resolver.unstable_enablePackageExports = false;

// 3. Wrap the final configuration with the nativewind transformer
module.exports = withNativeWind(config, { input: './app/globals.css' });
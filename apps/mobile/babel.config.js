module.exports = function (api) {
  api.cache(true);
  return {
    presets: [
      ['babel-preset-expo', { jsxImportSource: 'nativewind' }],
      'nativewind/babel',
    ],
    // El plugin de reanimated DEBE ir último (lo exige react-native-reanimated,
    // peer de NativeWind/css-interop).
    plugins: ['react-native-reanimated/plugin'],
  };
};

/**
 * Jest para apps/mobile (Expo + RN + NativeWind).
 * Preset jest-expo; se transpilan los paquetes RN/Expo/NativeWind (ESM).
 * Matchers extra de @testing-library/react-native vía setupFilesAfterEnv.
 */
module.exports = {
  preset: 'jest-expo',
  setupFilesAfterEnv: ['@testing-library/react-native/extend-expect'],
  transformIgnorePatterns: [
    'node_modules/(?!((jest-)?react-native|@react-native(-community)?|expo(nent)?|@expo(nent)?/.*|@expo-google-fonts/.*|react-navigation|@react-navigation/.*|@unimodules/.*|unimodules|sentry-expo|native-base|react-native-svg|nativewind|react-native-css-interop|react-native-reanimated|react-native-worklets))',
  ],
  testMatch: ['**/*.test.{ts,tsx}'],
};

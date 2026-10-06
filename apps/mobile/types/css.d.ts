/**
 * Declara los `.css` (global.css de NativeWind, importado por side-effect en App.tsx).
 * TypeScript 6 valida los side-effect imports (`noUncheckedSideEffectImports`) y la
 * declaración que trae css-interop no es alcanzable (ver nativewind-env.d.ts).
 */
declare module "*.css";

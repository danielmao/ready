/// <reference types="nativewind/types" />

// Augmentación local de `className` para las props de React Native que usamos.
//
// Por qué local: react-native-css-interop (que trae la augmentación de NativeWind) quedó
// ANIDADO en nativewind/node_modules y sólo es alcanzable vía `reference path`; cargado así su
// `declare module "react-native"` no mergea con los tipos de RN (quirk de TS con archivos de
// augmentación cargados por reference). Una augmentación local incluida por el glob de tsconfig
// sí mergea. Además css-interop no agrega `className` a PressableProps ni TextInputProps, que sí
// usamos. Mantener en sync con los componentes RN que estilamos con NativeWind.
import 'react-native';

declare module 'react-native' {
  interface ViewProps {
    className?: string;
  }
  interface TextProps {
    className?: string;
  }
  interface PressableProps {
    className?: string;
  }
  interface ImagePropsBase {
    className?: string;
  }
  interface TextInputProps {
    className?: string;
  }
  interface ScrollViewProps {
    className?: string;
    contentContainerClassName?: string;
  }
}

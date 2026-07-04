/**
 * Paleta programática de Ready — misma fuente de verdad que docs/05-FRONTEND-INTEGRATION.md §4.1
 * y tailwind.config.js. Usar SOLO para props nativas que no aceptan className de NativeWind
 * (React Navigation screenOptions, ActivityIndicator color, placeholderTextColor…).
 * En JSX con className, usar los tokens por nombre (bg-primary, text-text-secondary…).
 */
import { Platform } from 'react-native';

/**
 * Familias tipográficas. El diseño usa una serif de marca (Cormorant Garamond) para
 * títulos y una sans (Archivo) para UI. Sin cargar Google Fonts todavía, se aproxima
 * con familias del sistema por plataforma (ver spec: rediseno-armario-mobile, Q1).
 */
export const fonts = {
  serif: Platform.select({ ios: 'Georgia', android: 'serif', default: 'serif' }),
  sans: Platform.select({ ios: 'System', android: 'sans-serif', default: 'System' }),
} as const;

export const colors = {
  primary: { DEFAULT: '#003B4A', dark: '#082C38', soft: '#DCE8EA' },
  secondary: { DEFAULT: '#6F2B3E', dark: '#4A1C2A', soft: '#EAD6DC' },
  accent: { DEFAULT: '#D9C9CC', dark: '#BCA9AE' },
  background: '#F8F5F0',
  surface: { DEFAULT: '#FFFFFF', alt: '#F0EAE4' },
  border: '#D8D0C8',
  text: {
    primary: '#172126',
    secondary: '#647177',
    muted: '#90989C',
    inverse: '#FFFFFF',
  },
  success: '#6F8A63',
  warning: '#C3944A',
  error: '#B24A55',
  info: '#004556',
} as const;

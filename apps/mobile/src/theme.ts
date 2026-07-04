/**
 * Paleta programática de Ready — misma fuente de verdad que docs/05-FRONTEND-INTEGRATION.md §4.1
 * y tailwind.config.js. Usar SOLO para props nativas que no aceptan className de NativeWind
 * (React Navigation screenOptions, ActivityIndicator color, placeholderTextColor…).
 * En JSX con className, usar los tokens por nombre (bg-primary, text-text-secondary…).
 */
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

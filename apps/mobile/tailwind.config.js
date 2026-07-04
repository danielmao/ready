/** @type {import('tailwindcss').Config} */
// Design tokens canónicos: docs/05-FRONTEND-INTEGRATION.md §4.1.
// Regla: usar los tokens por nombre (bg-primary, text-text-secondary, border-border…),
// nunca hex sueltos. Para props nativas (sin className) importar src/theme.ts.
module.exports = {
  content: ['./App.{js,jsx,ts,tsx}', './src/**/*.{js,jsx,ts,tsx}'],
  presets: [require('nativewind/preset')],
  theme: {
    extend: {
      colors: {
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
      },
    },
  },
  plugins: [],
};

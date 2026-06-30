/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./App.tsx', './src/**/*.{ts,tsx}'],
  presets: [require('nativewind/preset')],
  theme: {
    extend: {
      colors: {
        // Paleta de Ready (ver prompts/mobile/03-tema-y-paleta-de-la-app.md).
        ink: '#0F172A',
        primary: '#6366F1',
        muted: '#64748B',
        surface: '#F8FAFC',
      },
    },
  },
  plugins: [],
};

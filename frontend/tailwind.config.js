/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      boxShadow: {
        soft: '0 2px 8px rgba(0,0,0,0.06)',
        'soft-lg': '0 4px 16px rgba(0,0,0,0.08)',
        glow: '0 0 20px -5px rgba(59, 130, 246, 0.3)',
        'glow-sm': '0 0 12px -3px rgba(59, 130, 246, 0.25)',
      },
      backgroundImage: {
        'gradient-app': 'var(--gradient-app)',
        'gradient-card': 'var(--gradient-card)',
      },
    },
  },
  plugins: [],
};

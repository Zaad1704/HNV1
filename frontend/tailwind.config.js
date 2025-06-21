/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
       fontFamily: {
        sans: ['Inter', 'sans-serif'],
      },
       colors: {
        // New Shopify-Inspired Palette
        'brand-dark': '#3D52A0',
        'brand-primary': '#7091E6',
        'brand-secondary': '#8697C4',
        'brand-subtle': '#ADBBDA',
        'brand-bg': '#F7F8FA',      // Use a very light, clean background

        // Light Theme Semantics
        'light-bg': '#F7F8FA',
        'light-card': '#FFFFFF',
        'dark-text': '#111827',     // Near-black for high contrast
        'light-text': '#6b7280',   // Gray for secondary text
        'border-color': '#e5e7eb',

        // Dark Theme Semantics (Optional, for dashboard)
        'dark-bg': '#0f172a',
        'dark-card': '#1e293b',
        'dark-text-dark': '#f8fafc',
        'light-text-dark': '#cbd5e1',
        'border-color-dark': '#334155',
      }
    },
  },
  plugins: [],
}

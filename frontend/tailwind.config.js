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
        'brand-dark': '#3D52A0',    // Dark Slate Blue
        'brand-primary': '#7091E6', // Primary Periwinkle
        'brand-secondary': '#8697C4',// Dusty Blue
        'brand-subtle': '#ADBBDA',   // Light Steel Blue
        'brand-bg': '#F7F8FA',      // Very Light Gray/Blue (similar to EDE8F5 but cleaner)

        // Light Theme Semantics
        'light-bg': '#F7F8FA',
        'light-card': '#FFFFFF',
        'dark-text': '#111827',
        'light-text': '#6b7280',
        'border-color': '#e5e7eb',

        // Dark Theme Semantics
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

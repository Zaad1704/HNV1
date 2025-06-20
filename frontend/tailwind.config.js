/** @type {import('tailwindcss').Config} */
export default {
  // Add the darkMode property
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
        'brand-orange': '#FF7A00',
        // Light theme colors
        'light-bg': '#F7F8FA',
        'light-card': '#FFFFFF',
        'dark-text': '#1F2937',
        'light-text': '#6B7280',
        'border-color': '#E5E7EB',
        // Dark theme colors (add these)
        'dark-bg': '#0f172a',      // Slater-900
        'dark-card': '#1e293b',   // Slate-800
        'light-text-dark': '#cbd5e1', // Slate-300
        'dark-text-dark': '#f8fafc',  // Slate-50
        'border-color-dark': '#334155', // Slate-700
      }
    },
  },
  plugins: [],
}

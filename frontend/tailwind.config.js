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
        'primary': '#3B82F6',       // Vibrant Blue
        'secondary': '#64748B',     // Clean Gray
        'accent': '#FACC15',        // Bright Yellow
        'success': '#22C55E',       // Positive Green
        'warning': '#F59E0B',       // Notice Orange
        'danger': '#EF4444',        // Alert Red
        'light': '#F9FAFB',         // Very Light Gray Background
        'dark': '#1E293B',          // Dark Gray Text/Background

        // Semantic colors for light mode
        'light-bg': '#F9FAFB',
        'light-text': '#374151',     // Darker Gray Text
        'light-accent': '#FACC15',

        // Semantic colors for dark mode
        'dark-bg': '#1E293B',
        'dark-text': '#E5E7EB',      // Lighter Gray Text
        'dark-accent': '#FACC15',
      },
    },
  },
  plugins: [],
}

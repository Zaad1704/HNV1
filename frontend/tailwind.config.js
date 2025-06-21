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
        // New Vibrant Palette
        'primary': '#4f46e5', // Vibrant Indigo
        'secondary': '#64748b',   // Slate Gray
        'accent': '#f59e0b',      // Bright Amber/Orange
        'success': '#10b981',     // Emerald Green
        'danger': '#ef4444',      // Red
        
        // Light Theme
        'light-bg': '#f8fafc',    // Very Light Slate
        'light-card': '#ffffff',  // White
        'dark-text': '#1e293b',    // Dark Slate Text
        'light-text': '#64748b',   // Medium Slate Text
        'border-color': '#e2e8f0',// Light Slate Border

        // Dark Theme
        'dark-bg': '#0f172a',      // Darkest Slate
        'dark-card': '#1e293b',   // Dark Slate
        'light-text-dark': '#cbd5e1', // Light Slate Text
        'dark-text-dark': '#f8fafc',  // White/Lightest Slate Text
        'border-color-dark': '#334155', // Medium Slate Border
      }
    },
  },
  plugins: [],
}

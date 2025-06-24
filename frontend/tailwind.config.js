// frontend/tailwind.config.js
/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class', // <--- Correctly set to 'class'
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
        // Updated Color Palette for extremely light, uniform brightness
        'brand-dark': '#E1EBF5',     // Very light blue for "darker" backgrounds like headers/footers
        'brand-primary': '#EFF4F9',  // Even lighter, near-white blue for primary actions/buttons
        'brand-secondary': '#F4F8FC', // Almost pure white, for subtle accents
        'brand-accent-light': '#F7FAFD', // A near-white with a very subtle blue hint for differentiation
        'brand-accent-dark': '#4CAF50',  // Vibrant green for high-contrast calls to action

        // Light Theme Semantics (consistent brightness, pure white highlight)
        'light-bg': '#FFFFFF',       // Pure white for main backgrounds (the brightest)
        'light-card': '#FAFBFC',     // Very subtle off-white for cards, almost pure white
        'dark-text': '#334155',      // Strong dark blue-gray for main text (CRITICAL for contrast)
        'light-text': '#64748B',     // Medium gray for secondary text, visible on very light backgrounds
        'border-color': '#E2E8F0',   // Very light, subtle gray-blue border

        // Dark Theme Semantics (adjusted for consistency)
        'dark-bg': '#1a202c',
        'dark-card': '#2d3748',
        'dark-text-dark': '#f7fafc',
        'light-text-dark': '#e2e8f0',
        'border-color-dark': '#4a5568',
      }
    },
  },
  plugins: [],
}

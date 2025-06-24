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
        // Updated Color Palette for more mixed and whitish feel
        'brand-dark': '#2E4070',     // A richer, slightly darker blue
        'brand-primary': '#4A70D0',  // A more vibrant, true blue
        'brand-secondary': '#7A91DB', // Lighter shade of primary, good for accents
        'brand-accent-light': '#E0F7FA', // A very light, subtle aqua/teal for mixing
        'brand-accent-dark': '#20C997',  // A vibrant green/teal for standout elements
        
        // Light Theme Semantics (more whitish)
        'light-bg': '#FFFFFF',       // Pure white for main backgrounds
        'light-card': '#F9FAFB',     // Very subtle off-white for card backgrounds
        'dark-text': '#111827',      // Near-black for high contrast
        'light-text': '#525F7F',     // Darker gray for secondary text for better contrast
        'border-color': '#D1D5DB',   // Lighter border color for better contrast

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

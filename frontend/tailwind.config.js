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
        // Updated Color Palette for a lighter, balanced blue scheme
        'brand-dark': '#3666A3',     // A richer, but not overly dark blue
        'brand-primary': '#5B9AD9',  // A vibrant, clear lighter blue
        'brand-secondary': '#8AC2E6', // Even lighter, softer blue for subtle accents
        'brand-accent-light': '#F0F8FF', // Very light, almost white-blue for subtle backgrounds, enhances 'whiteness'
        'brand-accent-dark': '#4CAF50',  // A distinct green for strong calls to action/emphasis, creating balance
        
        // Light Theme Semantics (more whitish)
        'light-bg': '#FFFFFF',       // Pure white for main backgrounds (more whitish)
        'light-card': '#F5F8FA',     // Very subtle off-white with a slight blue tint for card distinction
        'dark-text': '#1A202C',      // Darker gray/blue for high contrast on lighter backgrounds
        'light-text': '#60728C',     // Medium gray for secondary text, ensuring good readability
        'border-color': '#CED9E6',   // A subtle light blue-gray for borders

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

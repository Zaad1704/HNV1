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
        // New Color Palette based on provided image
        'brand-dark': '#212A31',     // Main dark background color
        'brand-primary': '#124E66',  // Primary accent/interactive color (Teal)
        'brand-secondary': '#2E3944', // Secondary dark background/element color
        'brand-subtle': '#748D92',   // Muted blue-gray for subtle elements/borders
        'brand-accent-light': '#D3D9D4', // Lightest color from palette for subtle highlights
        'brand-accent-dark': '#208AAB',  // A brighter variant of brand-primary for strong accents

        // Semantic colors for Light (now Dark) Theme
        'light-bg': '#212A31',       // Global page background (dark)
        'light-card': '#2E3944',     // Card background (secondary dark)
        'dark-text': '#F0F0F0',      // Main text color (light gray/near white) on dark backgrounds
        'light-text': '#D3D9D4',     // Secondary text color (muted light gray/green) on dark backgrounds
        'border-color': '#4A5C6F',   // A middle-ground gray-blue for borders

        // Dark Theme Semantics (if applicable, though new scheme is generally dark)
        'dark-bg': '#212A31', // Duplicated for clarity, as the scheme is mostly dark
        'dark-card': '#2E3944', // Duplicated for clarity
        'dark-text-dark': '#F0F0F0', // Light text for dark mode (new scheme's default)
        'light-text-dark': '#D3D9D4', // Muted light text for dark mode
        'border-color-dark': '#4A5C6F', // Border for dark mode
      }
    },
  },
  plugins: [],
}

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
        // --- High-Contrast & Professional Palette ---
        'brand-primary': '#005f73',     // A strong, deep teal for primary actions
        'brand-secondary': '#0a9396',   // A vibrant teal for secondary elements
        'brand-dark': '#001219',       // Nearly black for high-contrast text
        'brand-subtle': '#94d2bd',      // A soft, muted teal for accents
        'brand-accent-light': '#e9d8a6',// A warm, light accent (sand)
        'brand-accent-dark': '#ee9b00', // A bold, warm accent (amber)
        'brand-orange': '#ca6702',      // A deeper orange for specific highlights

        // --- SEMANTIC COLORS FOR LIGHT THEME (DEFAULT) ---
        'light-bg': '#f8f9fa',        // Clean, off-white background
        'light-card': '#ffffff',      // Pure white for cards to stand out
        'dark-text': '#001219',       // Main text color (high contrast)
        'light-text': '#5a6b74',      // Softer, secondary text color
        'border-color': '#dee2e6',    // Standard light border color

        // --- SEMANTIC COLORS FOR DARK THEME ---
        'dark-bg': '#001219',         // Deepest color for the background
        'dark-card': '#002a35',       // A slightly lighter card background
        'dark-text-dark': '#e9ecef',  // Main text for dark mode (off-white)
        'light-text-dark': '#94d2bd', // Muted teal for secondary text in dark mode
        'border-color-dark': '#004150', // Subtle border color for dark elements
      }
    },
  },
  plugins: [],
}

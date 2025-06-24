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
        // Revised Color Palette for improved visibility, drawing from screenshot's contrast style
        // Darker brand colors to ensure white text/logos are visible on them
        'brand-dark': '#273D6B',     // Deep blue for structural elements (e.g., Navbar, Footer backgrounds)
        'brand-primary': '#3D52A0',  // Solid blue for main interactive elements (e.g., buttons, active states)
        'brand-secondary': '#6E88E4', // Lighter, more vibrant blue for secondary elements
        'brand-accent-light': '#F0F4F8', // Very subtle light blue-gray for backgrounds and highlights
        'brand-accent-dark': '#4CAF50',  // Vibrant green for high-emphasis actions

        // Light Theme Semantics (bright overall, strong text contrast)
        'light-bg': '#FFFFFF',       // Pure white for main content backgrounds (brightest)
        'light-card': '#F9FCFF',     // Very subtle off-white/light blue tint for cards
        'dark-text': '#1A202C',      // Strong dark gray/blue for text on light backgrounds (CRITICAL for contrast)
        'light-text': '#FFFFFF',     // Explicitly White text for visibility on brand-dark/primary backgrounds
        'border-color': '#D1D5DB',   // Clear, neutral border color

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

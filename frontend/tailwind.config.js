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
        // Set Poppins as the default sans-serif font
        sans: ['Poppins', 'sans-serif'],
      },
      colors: {
        // --- Redesigned Color Palette from Yartee/Gold Standard ---
        'brand-primary': '#4A69E2',     // Vibrant Blue
        'brand-secondary': '#FFA87A',   // Soft Orange
        'brand-teal': '#4AE2B6',        // Vibrant Teal for secondary gradient
        'brand-blue-2': '#4A90E2',      // Second blue for secondary gradient

        // --- Semantic Colors for Light Theme (Default) ---
        'light-bg': '#E5E7EB',         // Main light background from design
        'light-card': '#FFFFFF',       // Pure white for cards and surfaces
        'dark-text': '#1a202c',        // Main text color
        'light-text': '#6B7280',       // Lighter gray for subtitles and secondary text
        'border-color': '#D1D5DB',     // Subtle border color

        // --- Semantic Colors for Dark Theme ---
        'dark-bg': '#111827',          // Dark blue-gray background
        'dark-card': '#1F2937',        // Slightly lighter card background
        'dark-text-dark': '#F9FAFB',   // Off-white for text in dark mode
        'light-text-dark': '#9CA3AF',  // Lighter gray for subtitles in dark mode
        'border-color-dark': '#374151', // Subtle border for dark elements
      },
      // --- Custom Gradients from Yartee/Gold Standard ---
      backgroundImage: {
        'primary-card-gradient': 'linear-gradient(135deg, #4A69E2 0%, #FFA87A 100%)',
        'secondary-card-gradient': 'linear-gradient(135deg, #4AE2B6 0%, #4A90E2 100%)',
      },
    },
  },
  plugins: [],
}

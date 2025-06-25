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
        // --- Redesigned Color Palette ---
        'brand-primary': '#4A69E2',     // Vibrant Blue
        'brand-secondary': '#4AE2B6',   // Vibrant Teal
        'brand-accent': '#FFA87A',      // Soft Orange
        
        // --- Semantic Colors for Light Theme (Default) ---
        'light-bg': '#F7F8FA',         // Off-white background
        'light-card': '#FFFFFF',       // Pure white for cards
        'dark-text': '#1a202c',        // Default dark text
        'light-text': '#6B7280',       // Lighter gray for subtitles
        'border-color': '#E9EBF0',     // Subtle border color

        // --- Semantic Colors for Dark Theme ---
        'dark-bg': '#111827',          // Dark blue-gray background
        'dark-card': '#1F2937',        // Slightly lighter card background
        'dark-text-dark': '#F9FAFB',   // Off-white for text in dark mode
        'light-text-dark': '#9CA3AF',  // Lighter gray for subtitles in dark mode
        'border-color-dark': '#374151', // Subtle border for dark elements
      },
      // --- Custom Gradients for Backgrounds and Cards ---
      backgroundImage: {
        'primary-card-gradient': 'linear-gradient(135deg, #4A69E2 0%, #FFA87A 100%)',
        'secondary-card-gradient': 'linear-gradient(135deg, #4AE2B6 0%, #4A90E2 100%)',
      },
    },
  },
  plugins: [],
}

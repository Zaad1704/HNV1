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
        // --- Core Brand Colors (Slightly warmer, more inviting) ---
        'brand-primary': '#1A759F',     // A richer, slightly darker blue-teal for primary actions
        'brand-secondary': '#168AAD',   // A more vibrant, appealing blue-green
        'brand-dark': '#011627',        // A very dark blue, almost black, for deep contrast
        'brand-subtle': '#A8DADC',      // A very light, calming blue-green for subtle backgrounds/accents
        
        // --- Accent Colors (Energetic & Eye-catching) ---
        'brand-accent-light': '#FDFFB6', // A soft, warm yellow for highlights
        'brand-accent-dark': '#FFC300',  // A bright, energetic gold/yellow for strong accents
        'brand-orange': '#FF6B35',       // A vibrant, clear orange for calls to action or warnings

        // --- Semantic Colors for Light Theme (Default) ---
        'light-bg': '#F8F9FA',         // Clean, off-white background (same)
        'light-card': '#FFFFFF',       // Pure white for cards (same)
        'dark-text': '#212529',        // Dark charcoal for main text (slightly softer than original brand-dark)
        'light-text': '#6C757D',       // Medium gray for secondary text (softer)
        'border-color': '#E0E0E0',     // Lighter, subtle border

        // --- Semantic Colors for Dark Theme (Comfortable for long use) ---
        'dark-bg': '#011627',          // Deepest background color (matches new brand-dark)
        'dark-card': '#052F46',        // A slightly lighter dark blue for cards, reducing harshness
        'dark-text-dark': '#F8F9FA',   // Off-white for text in dark mode (matches light-bg)
        'light-text-dark': '#A8DADC',  // Light blue-green for secondary text in dark mode (matches new brand-subtle)
        'border-color-dark': '#094E6A', // Subtle blue border for dark elements
      }
    },
  },
  plugins: [],
}

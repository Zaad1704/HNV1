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
        // "Corporate and Traditional" Palette
        'brand-primary': '#254E58',     // Primary accent color (Dark Slate Blue-Green) for buttons/links
        'brand-secondary': '#88BDBC',   // Secondary accent color (Pewter Blue)
        'brand-dark': '#112D32',       // Deepest Teal for text 
        'brand-subtle': '#6E6658',      // Muted brown for secondary text
        'brand-accent': '#4F4A41',     // Accent brown

        // --- SEMANTIC COLORS FOR LIGHT THEME (DEFAULT) ---
        'light-bg': '#88BDBC',        // Page background is now Pewter Blue
        'light-card': '#ffffff',      // Cards are white for contrast
        'dark-text': '#112D32',       // Main text color is Deep Teal
        'light-text': '#6E6658',      // Muted/secondary text is Muted Brown
        'border-color': '#dee2e6',    // Standard light border color for cards

        // --- SEMANTIC COLORS FOR DARK THEME ---
        'dark-bg': '#112D32',
        'dark-card': '#254E58',
        'dark-text-dark': '#f8f9fa',
        'light-text-dark': '#88BDBC',
        'border-color-dark': '#4F4A41',
      }
    },
  },
  plugins: [],
}

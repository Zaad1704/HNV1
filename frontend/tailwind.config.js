/** @type {import('tailwindcss').Config} */
export default {
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
        'brand-orange': '#FF7A00',
        'light-bg': '#F7F8FA',
        'light-card': '#FFFFFF',
        'dark-text': '#1F2937',
        'light-text': '#6B7280',
        'border-color': '#E5E7EB',
      }
    },
  },
  plugins: [],
}

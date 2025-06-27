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
        sans: ['Poppins', 'sans-serif'],
      },
      colors: {
        'app-bg': 'var(--app-bg)',
        'app-surface': 'var(--app-surface)',
        'app-border': 'var(--app-border)',
        'text-primary': 'var(--text-primary)',
        'text-secondary': 'var(--text-secondary)',
        'text-muted': 'var(--text-muted)',
        'brand-primary': 'var(--brand-blue)',
        'brand-secondary': 'var(--brand-orange)',
        'brand-blue': '#4A69E2',
        'brand-orange': '#FFA87A',
        'brand-teal': '#4AE2B6',
        'brand-blue-2': '#4A90E2',
        // Light theme colors
        'light-bg': '#f8fafc',
        'light-card': '#ffffff',
        'light-text': '#64748b',
        'dark-text': '#1e293b',
        'border-color': '#e2e8f0',
        // Dark theme colors
        'dark-bg': '#0f172a',
        'dark-card': '#1e293b',
        'light-text-dark': '#94a3b8',
        'dark-text-dark': '#f1f5f9',
        'border-color-dark': '#334155',
      },
      backgroundImage: {
        'gradient-primary': 'var(--gradient-primary)',
        'gradient-secondary': 'var(--gradient-secondary)',
        'gradient-accent': 'var(--gradient-accent)',
      },
      borderRadius: {
        'app': '16px',
        'app-lg': '24px',
      },
      boxShadow: {
        'app': '0 4px 15px rgba(74, 105, 226, 0.1)',
        'app-lg': '0 20px 40px rgba(74, 105, 226, 0.15)',
        'app-xl': '0 25px 50px rgba(74, 105, 226, 0.2)',
      },
    },
  },
  plugins: [],
}
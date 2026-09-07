/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'bg-primary': '#0a0e1a',
        'bg-secondary': '#111827',
        'bg-tertiary': '#1f2937',
        'text-primary': '#f9fafb',
        'text-secondary': '#9ca3af',
        'text-muted': '#6b7280',
        'text-inverse': '#111827',
        'accent-primary': '#8b5cf6',
        'accent-primary-hover': '#7c3aed',
        'accent-secondary': '#06b6d4',
        success: '#10b981',
        warning: '#f59e0b',
        error: '#ef4444',
        info: '#3b82f6',
        'border-color': 'rgba(255, 255, 255, 0.08)',
      }
    },
  },
  plugins: [],
}

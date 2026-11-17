/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        theme: {
          main: 'var(--color-main-bg)',
          secondary: 'var(--color-secondary-bg)',
          card: 'var(--color-card-bg)',
          border: 'var(--color-card-border)',
          accent: 'var(--color-primary-accent)',
          'accent-hover': 'var(--color-primary-hover)',
          'accent-secondary': 'var(--color-secondary-accent)',
          text: 'var(--color-text-main)',
          'text-secondary': 'var(--color-text-secondary)',
          'text-muted': 'var(--color-text-muted)',
          badge: 'var(--color-badge-bg)',
          'badge-text': 'var(--color-badge-text)',
          sidebar: 'var(--color-sidebar-bg)',
          header: 'var(--color-header-bg)',
        },
        brand: {
          50: '#eff6ff',
          100: '#dbeafe',
          200: '#bfdbfe',
          300: '#93c5fd',
          400: '#60a5fa',
          500: '#3b82f6',
          600: '#2563eb',
          700: '#1d4ed8',
          800: '#1e40af',
          900: '#1e3a8a',
          950: '#172554',
        },
        surface: {
          light: '#ffffff',
          'light-subtle': '#f8fafc',
          'light-border': '#e2e8f0',
          dark: '#283443',
          'dark-subtle': '#202936',
          'dark-border': '#394656',
        }
      },
      fontFamily: {
        sans: ['Inter', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'Helvetica', 'Arial', 'sans-serif'],
        mono: ['JetBrains Mono', 'Fira Code', 'Menlo', 'Monaco', 'Courier New', 'monospace'],
      },
      boxShadow: {
        'subtle': '0 1px 3px 0 rgba(0, 0, 0, 0.05), 0 1px 2px -1px rgba(0, 0, 0, 0.05)',
        'card': '0 1px 3px 0 rgba(0, 0, 0, 0.04), 0 10px 15px -3px rgba(0, 0, 0, 0.02)',
        'card-dark': '0 1px 3px 0 rgba(0, 0, 0, 0.4), 0 10px 15px -3px rgba(0, 0, 0, 0.3)',
      }
    },
  },
  plugins: [],
}

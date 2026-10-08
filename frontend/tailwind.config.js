/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          dark: '#101a3b',
          navy: '#172654',
          blue: '#315bdc',
          navHover: '#29396f',
          lightBlue: '#dce4ff',
          bg: '#f5f7fb',
          card: '#ffffff',
          cardBorder: '#e6eaf2',
          textMain: '#172033',
          textMuted: '#68738a',
          green: '#15966b',
          orange: '#c97817'
        }
      }
    },
  },
  plugins: [],
}

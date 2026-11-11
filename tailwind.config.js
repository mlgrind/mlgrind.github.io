/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      fontFamily: {
        display: ['"Instrument Serif"', 'Georgia', 'serif'],
        body: ['"DM Sans"', '-apple-system', 'sans-serif'],
        mono: ['"JetBrains Mono"', '"Fira Code"', 'Consolas', 'monospace'],
      },
      colors: {
        primary: {
          50: '#f3f1ff',
          100: '#e9e5ff',
          200: '#d4ccfe',
          300: '#b5a8fe',
          400: '#9580f0',
          500: '#6c5ce7',
          600: '#5a49d6',
          700: '#4837b5',
          800: '#3c2e94',
          900: '#322779',
          950: '#1e1650',
        },
        accent: {
          50: '#e6faf5',
          100: '#b3f0e3',
          200: '#80e6d1',
          300: '#4ddcbf',
          400: '#26d4b1',
          500: '#00c9a7',
          600: '#00a88c',
          700: '#008771',
          800: '#006656',
          900: '#00453b',
        },
        dark: {
          50: '#f8fafc',
          100: '#e8ecf4',
          200: '#8b95a8',
          300: '#7c8699',
          400: '#2e3440',
          500: '#22272f',
          600: '#1a1e27',
          700: '#191d26',
          800: '#13161d',
          900: '#0c0f14',
          950: '#080a0e',
        }
      },
      keyframes: {
        fadeUp: {
          from: { opacity: '0', transform: 'translateY(16px)' },
          to: { opacity: '1', transform: 'translateY(0)' },
        },
        pulseDot: {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0.4' },
        },
      },
      animation: {
        'fade-up': 'fadeUp 0.5s ease backwards',
        'pulse-dot': 'pulseDot 2s ease infinite',
      },
    },
  },
  plugins: [],
}

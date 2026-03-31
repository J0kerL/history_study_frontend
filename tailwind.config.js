/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        paper: {
          50: '#FAF8F5',
          100: '#F5F1EB',
          200: '#EDE7DD',
          300: '#E0D8CC',
        },
        ink: {
          DEFAULT: '#2C2416',
          light: '#6B5D4D',
          lighter: '#9A8A78',
        },
        vermillion: {
          DEFAULT: '#C65D4E',
          light: '#E8A598',
          dark: '#A1483A',
        },
      },
      fontFamily: {
        serif: ['"Noto Serif SC"', 'Georgia', 'serif'],
        sans: ['"Noto Sans SC"', 'system-ui', 'sans-serif'],
      },
      spacing: {
        'safe-bottom': 'env(safe-area-inset-bottom)',
      },
      borderRadius: {
        'xl': '1rem',
        '2xl': '1.5rem',
        '3xl': '2rem',
      },
      boxShadow: {
        'card': '0 1px 3px rgba(44, 36, 22, 0.06), 0 1px 2px rgba(44, 36, 22, 0.04)',
        'card-hover': '0 4px 12px rgba(44, 36, 22, 0.08), 0 2px 4px rgba(44, 36, 22, 0.04)',
      },
    },
  },
  plugins: [],
}

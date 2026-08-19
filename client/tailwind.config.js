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
        brand: {
          50: '#F0F9FF',
          100: '#E0F2FE',
          200: '#BAE6FD',
          300: '#7DD3FC',
          400: '#38BDF8',
          500: '#0EA5E9',
          600: '#0284C7',
          700: '#0369A1',
          800: '#075985',
          900: '#0C4A6E',
          950: '#082F49',
        },
        navy: {
          800: '#1E293B',
          900: '#0F172A',
          950: '#0B1120',
        },
        risk: {
          low: '#10B981',
          'low-bg': '#ECFDF5',
          'low-border': '#A7F3D0',
          medium: '#F59E0B',
          'medium-bg': '#FFFBEB',
          'medium-border': '#FDE68A',
          high: '#EF4444',
          'high-bg': '#FEF2F2',
          'high-border': '#FECACA',
        }
      },
      fontFamily: {
        display: ['"Baskervville"', 'Georgia', 'serif'],
        serif: ['"Baskervville"', 'Georgia', 'serif'],
        sans: ['"Comic Sans MS"', '"Comic Sans"', 'cursive', 'sans-serif'],
      },
      boxShadow: {
        xs: '0 1px 2px 0 rgba(15, 23, 42, 0.05)',
        sm: '0 1px 3px 0 rgba(15, 23, 42, 0.08), 0 1px 2px -1px rgba(15, 23, 42, 0.05)',
        md: '0 4px 6px -1px rgba(15, 23, 42, 0.08), 0 2px 4px -2px rgba(15, 23, 42, 0.05)',
        lg: '0 10px 15px -3px rgba(15, 23, 42, 0.08), 0 4px 6px -4px rgba(15, 23, 42, 0.05)',
      },
      borderRadius: {
        xl: '0.75rem',
        '2xl': '1rem',
        '3xl': '1.25rem',
      },
      spacing: {
        18: '4.5rem',
        88: '22rem',
        112: '28rem',
      }
    },
  },
  plugins: [],
}

/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        brand: {
          yellow: '#E9FF22',
          dark:   '#1D1C1D',
          light:  '#F1F5F8',
          blue:   '#3843EB',
        },
      },
      fontFamily: {
        sans: ['FC Vision', 'Arial', 'sans-serif'],
      },
      fontSize: {
        'display': ['56px', { lineHeight: '1.1' }],
        'h2':      ['32px', { lineHeight: '1.25' }],
        'h3':      ['20px', { lineHeight: '1.4' }],
        'body':    ['16px', { lineHeight: '1.6' }],
        'caption': ['13px', { lineHeight: '1.5' }],
      },
      borderRadius: {
        DEFAULT: '8px',
        'pill':  '4px',
      },
    },
  },
  plugins: [],
}


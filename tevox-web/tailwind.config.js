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
        mono: ['Space Mono', 'ui-monospace', 'Menlo', 'monospace'],
      },
      fontSize: {
        'display': ['clamp(44px,7vw,76px)', { lineHeight: '0.97' }],
        'h2':      ['clamp(26px,4vw,36px)', { lineHeight: '1.2' }],
        'h3':      ['20px', { lineHeight: '1.4' }],
        'body':    ['16px', { lineHeight: '1.6' }],
        'caption': ['13px', { lineHeight: '1.5' }],
        'micro':   ['11px', { lineHeight: '1.4' }],
      },
      borderRadius: {
        DEFAULT: '2px',
        'pill':  '2px',
        'lg':    '4px',
      },
      animation: {
        'fade-up':   'fadeUp 0.6s cubic-bezier(0.16,1,0.3,1) both',
        'fade-up-2': 'fadeUp 0.6s 0.1s cubic-bezier(0.16,1,0.3,1) both',
        'fade-up-3': 'fadeUp 0.6s 0.2s cubic-bezier(0.16,1,0.3,1) both',
        'fade-up-4': 'fadeUp 0.6s 0.3s cubic-bezier(0.16,1,0.3,1) both',
      },
      keyframes: {
        fadeUp: {
          '0%':   { opacity: '0', transform: 'translateY(22px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
      },
    },
  },
  plugins: [],
}

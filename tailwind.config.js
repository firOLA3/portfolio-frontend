import flowbite from 'flowbite/plugin'

/** @type {import('tailwindcss').Config} */
export default {
  content: [
    './index.html',
    './src/**/*.{js,ts,jsx,tsx}',
    'node_modules/flowbite-react/lib/esm/**/*.js',
  ],
  theme: {
    extend: {
      backdropBlur: { win: '20px', taskbar: '30px' },
      colors: { 'win-accent': '#0078D4', 'win-dark': '#202020' },
      fontFamily: { segoe: ['Segoe UI Variable', 'system-ui', 'sans-serif'] },
      boxShadow: {
        window:
          '0 8px 32px rgba(0,0,0,0.3), 0 0 0 1px rgba(255,255,255,0.1)',
      },
      borderRadius: { win: '8px', 'win-lg': '12px' },
    },
  },
  plugins: [flowbite],
}

import type { Config } from 'tailwindcss'

export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        aee: {
          canvas: '#e4edfb',
          panel: '#ffffff',
          card: '#eaf2ff',
          ink: '#505c96',
          dark: '#354d70',
          muted: '#8c97bb',
          lavender: '#c563e8',
          purple: '#974dfb',
          aqua: '#60c5fb',
        },
      },
      fontFamily: {
        sans: ['Inter', 'Segoe UI', 'Arial', 'sans-serif'],
      },
      boxShadow: {
        panel: '0 18px 51px rgba(68, 91, 131, 0.09)',
        soft: '0 7px 23px rgba(85, 112, 157, 0.08)',
      },
    },
  },
  plugins: [],
} satisfies Config

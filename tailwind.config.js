/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        kev: {
          bg: '#0a0e1a',
          surface: 'rgba(15, 23, 42, 0.6)',
          border: 'rgba(56, 189, 248, 0.15)',
          electric: '#38bdf8',
          electricDim: 'rgba(56, 189, 248, 0.8)',
          cyan: '#22d3ee',
          white: '#f8fafc',
          muted: 'rgba(248, 250, 252, 0.7)',
          mutedSoft: 'rgba(248, 250, 252, 0.5)',
        },
      },
      fontFamily: {
        display: ['"Space Grotesk"', 'system-ui', 'sans-serif'],
        body: ['Inter', 'system-ui', 'sans-serif'],
      },
      borderRadius: {
        '2xl': '1rem',
        '3xl': '1.5rem',
        '4xl': '2rem',
      },
      boxShadow: {
        'glow': '0 0 40px -10px rgba(56, 189, 248, 0.25)',
        'glow-sm': '0 0 24px -6px rgba(56, 189, 248, 0.2)',
        'card': '0 4px 24px -4px rgba(0, 0, 0, 0.4), 0 0 0 1px rgba(56, 189, 248, 0.06)',
        'card-hover': '0 8px 32px -8px rgba(0, 0, 0, 0.5), 0 0 0 1px rgba(56, 189, 248, 0.12), 0 0 40px -10px rgba(56, 189, 248, 0.15)',
      },
      animation: {
        'fade-in': 'fadeIn 0.6s ease-out forwards',
        'fade-in-up': 'fadeInUp 0.6s ease-out forwards',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        fadeInUp: {
          '0%': { opacity: '0', transform: 'translateY(16px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
      },
    },
  },
  plugins: [],
}

 /** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        'ipl-gold': '#FFD700',
        'ipl-orange': '#FF6B00',
        'dark-bg': '#07070F',
        'dark-card': '#0D0D1A',
        'dark-border': '#1A1A30',
      },
      fontFamily: {
        bebas: ['Bebas Neue', 'cursive'],
        rajdhani: ['Rajdhani', 'sans-serif'],
      },
      keyframes: {
        pulseGlow: {
          '0%,100%': { boxShadow: '0 0 20px rgba(255,107,0,0.4)' },
          '50%':     { boxShadow: '0 0 70px rgba(255,107,0,0.9), 0 0 120px rgba(255,107,0,0.4)' },
        },
        stampIn: {
          '0%':   { transform: 'scale(4) rotate(-20deg)', opacity: 0 },
          '60%':  { transform: 'scale(0.85) rotate(6deg)', opacity: 1 },
          '100%': { transform: 'scale(1) rotate(-4deg)', opacity: 1 },
        },
        priceUp: {
          '0%':   { transform: 'translateY(30px) scale(1.4)', opacity: 0, color: '#FFD700' },
          '100%': { transform: 'translateY(0) scale(1)', opacity: 1, color: 'inherit' },
        },
        float: {
          '0%,100%': { transform: 'translateY(0)' },
          '50%':     { transform: 'translateY(-12px)' },
        },
        slideUp: {
          '0%':   { transform: 'translateY(20px)', opacity: 0 },
          '100%': { transform: 'translateY(0)', opacity: 1 },
        },
        bidFlash: {
          '0%':   { backgroundColor: 'rgba(255,215,0,0.25)' },
          '100%': { backgroundColor: 'transparent' },
        },
      },
      animation: {
        'pulse-glow':  'pulseGlow 2s ease-in-out infinite',
        'stamp-in':    'stampIn 0.5s cubic-bezier(0.36,0.07,0.19,0.97) forwards',
        'price-up':    'priceUp 0.4s ease-out forwards',
        'float':       'float 3s ease-in-out infinite',
        'slide-up':    'slideUp 0.4s ease-out forwards',
        'bid-flash':   'bidFlash 0.7s ease-out forwards',
      },
    },
  },
  plugins: [],
}

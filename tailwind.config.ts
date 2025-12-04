import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        // Elegant Luxury Theme - Pearl White & Gold
        pearl: {
          DEFAULT: '#FDFCFA',
          light: '#FFFFFF',
        },
        ivory: '#F8F6F3',
        cream: '#F5F3EF',
        champagne: '#F4EFE8',
        gold: {
          DEFAULT: '#D4AF37',
          soft: '#E8C872',
          dark: '#B8941F',
        },
        rose: {
          gold: '#B76E79',
          light: '#D4A5A5',
        },
        gray: {
          warm: '#8B8680',
          cool: '#6B6B6B',
          light: '#D1CEC8',
        },
        charcoal: '#3A3A3A',
        
        // Gemstone Accent Colors (brighter, more vibrant)
        gemstone: {
          ruby: '#C41E3A',
          sapphire: '#0F52BA',
          emerald: '#50C878',
          topaz: '#FFCC00',
          amethyst: '#9966CC',
          diamond: '#E8F4F8',
        },
      },
      fontFamily: {
        sans: ['var(--font-inter)', 'Inter', 'system-ui', 'sans-serif'],
        serif: ['var(--font-cormorant)', 'Cormorant Garamond', 'Georgia', 'serif'],
      },
      spacing: {
        '18': '4.5rem',
        '88': '22rem',
        '112': '28rem',
        '128': '32rem',
      },
      animation: {
        'fade-in': 'fadeIn 0.3s ease-out',
        'fade-in-slow': 'fadeIn 0.5s ease-out',
        'slide-up': 'slideUp 0.3s ease-out',
        'slide-in-right': 'slideInRight 0.3s ease-out',
        'gem-rotate': 'gemRotate 20s linear infinite',
        'float': 'float 8s ease-in-out infinite',
        'sparkle': 'sparkle 3s ease-in-out infinite',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0', transform: 'translateY(10px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        slideUp: {
          '0%': { opacity: '0', transform: 'translateY(20px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        slideInRight: {
          '0%': { opacity: '0', transform: 'translateX(400px)' },
          '100%': { opacity: '1', transform: 'translateX(0)' },
        },
        gemRotate: {
          '0%': { transform: 'rotate(45deg)' },
          '100%': { transform: 'rotate(405deg)' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0px) scale(1)' },
          '50%': { transform: 'translateY(-20px) scale(1.02)' },
        },
        sparkle: {
          '0%, 100%': { opacity: '0', transform: 'scale(0)' },
          '50%': { opacity: '1', transform: 'scale(1)' },
        },
      },
      backdropBlur: {
        xs: '2px',
      },
    },
  },
  plugins: [],
}

export default config

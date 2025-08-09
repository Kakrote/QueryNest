import { Roboto } from 'next/font/google';

/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "var(--background)",
        foreground: "var(--foreground)",
      },
      fontFamily:{
        roboto:['var(--font-roboto)', 'sans-serif'],
      },
      keyframes: {
        'slide-in': {
          '0%': { transform: 'translateX(-12%)', opacity: '0' },
          '100%': { transform: 'translateX(0)', opacity: '1' }
        },
        'fade-in': {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' }
        },
        'scale-in': {
          '0%': { transform: 'scale(.95)', opacity: '0' },
          '100%': { transform: 'scale(1)', opacity: '1' }
        },
        'dropdown-in': {
          '0%': { transform: 'translateY(-6px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' }
        }
      },
      animation: {
        'slide-in': 'slide-in .25s cubic-bezier(.4,0,.2,1)',
        'fade-in': 'fade-in .3s ease-in-out',
        'scale-in': 'scale-in .25s cubic-bezier(.4,0,.2,1)',
        'dropdown-in': 'dropdown-in .18s ease-out'
      },
      transitionProperty: {
        'spacing': 'margin,padding'
      }
    },
  },
  plugins: [require('@tailwindcss/typography')],
};

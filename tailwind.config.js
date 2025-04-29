/** @type {import('tailwindcss').Config} */
export default {
  content: [
    './index.html', 
    './src/**/*.{js,ts,jsx,tsx}',
    './node_modules/react-hot-toast/**/*.{js,ts,jsx,tsx}' // Include react-hot-toast
  ],
  darkMode: 'class', // Enable dark mode with class
  theme: {
    extend: {
      colors: {
        primary: {
          50: 'var(--primary-50)',
          100: 'var(--primary-100)',
          200: 'var(--primary-200)',
          300: 'var(--primary-300)',
          400: 'var(--primary-400)',
          500: 'var(--primary-500)',
          600: 'var(--primary-600)',
          700: 'var(--primary-700)',
          800: 'var(--primary-800)',
          900: 'var(--primary-900)',
          950: 'var(--primary-950, #281a4d)',
        },
        secondary: {
          50: 'var(--secondary-50, #f4f7fb)',
          100: 'var(--secondary-100, #e9eff6)',
          200: 'var(--secondary-200, #d3deec)',
          300: 'var(--secondary-300, #b0c3da)',
          400: 'var(--secondary-400, #88a3c5)',
          500: 'var(--secondary-500, #6885b1)',
          600: 'var(--secondary-600, #516b96)',
          700: 'var(--secondary-700, #42567a)',
          800: 'var(--secondary-800, #394a67)',
          900: 'var(--secondary-900)',
          950: 'var(--secondary-950, #111827)',
        },
        danger: {
          400: '#ff6b6b',
          500: '#ef4444',
        },
        success: {
          400: '#4caf50',
          500: '#10b981',
        },
        warning: {
          400: '#f59e0b',
        },
        background: '#F8F9FC',
      },
      fontFamily: {
        inter: ['Inter', 'sans-serif'],
        roboto: ['Roboto', 'sans-serif'],
        opensans: ['"Open Sans"', 'sans-serif'],
      },
      borderRadius: {
        lg: 'var(--radius)',
        md: 'calc(var(--radius) - 2px)',
        sm: 'calc(var(--radius) - 4px)',
      },
      keyframes: {
        "accordion-down": {
          from: { height: "0" },
          to: { height: "var(--radix-accordion-content-height)" },
        },
        "accordion-up": {
          from: { height: "var(--radix-accordion-content-height)" },
          to: { height: "0" },
        },
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
      },
    },
  },
  plugins: [],
};
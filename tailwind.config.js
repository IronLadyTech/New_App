/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './App.{js,jsx,ts,tsx}',
    './screens/**/*.{js,jsx,ts,tsx}',
    './components/**/*.{js,jsx,ts,tsx}',
    './navigation/**/*.{js,jsx,ts,tsx}',
  ],
  presets: [require('nativewind/preset')],
  theme: {
    extend: {
      colors: {
        brand: {
          50: '#eef8ff',
          100: '#d9efff',
          200: '#bce4ff',
          300: '#8ed4ff',
          400: '#59baff',
          500: '#3399ff',
          600: '#1a78f5',
          700: '#1361e1',
          800: '#164eb6',
          900: '#18448f',
          950: '#132a57',
        },
        ink: {
          50: '#f6f7f9',
          100: '#eceef2',
          200: '#d5dae2',
          300: '#b0b9c8',
          400: '#8593aa',
          500: '#667690',
          600: '#515e76',
          700: '#434d60',
          800: '#3a4251',
          900: '#343946',
          950: '#22262f',
        },
        success: '#16a34a',
        warning: '#d97706',
        danger: '#dc2626',
      },
    },
  },
  plugins: [],
};

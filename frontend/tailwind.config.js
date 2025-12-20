/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#6d28d9',
          light: '#8b5cf6',
          dark: '#5b21b6',
        },
        secondary: {
          DEFAULT: '#a78bfa',
          light: '#c4b5fd',
          dark: '#7c3aed',
        },
        'dark-bg': '#0f0f13',
        'sidebar-bg': '#18181b',
        'chat-bg': '#1e1e24',
        'chat-bubble-user': '#7c3aed',
        'chat-bubble-friend': 'rgba(39, 39, 42, 0.6)',
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
}

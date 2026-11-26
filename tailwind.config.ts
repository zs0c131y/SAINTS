import type { Config } from 'tailwindcss';

/** Same design tokens as the original static site, so every utility class renders identically. */
const config: Config = {
  content: ['./src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#eef3fb', 100: '#dce6f5', 200: '#b9cceb', 300: '#8aa8d8', 400: '#5a80c0',
          500: '#3a5fa3', 600: '#25447f', 700: '#1a3466', 800: '#122650', 900: '#0c1c3d', 950: '#081330',
        },
        accent: { 400: '#d9b44a', 500: '#c49a2c', 600: '#a67f1d' },
        dark: '#0f0e17',
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'Segoe UI', 'Roboto', 'Helvetica Neue', 'Arial', 'sans-serif'],
        display: ['Newsreader', 'Iowan Old Style', 'Palatino Linotype', 'Palatino', 'Georgia', 'serif'],
      },
    },
  },
};

export default config;

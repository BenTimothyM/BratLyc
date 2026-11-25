import type { Config } from 'tailwindcss';

export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        ui: ['Poppins', 'system-ui', 'sans-serif'],
        brat: ['"Archivo Narrow"', '"Arial Narrow"', 'sans-serif'],
      },
    },
  },
  plugins: [],
} satisfies Config;

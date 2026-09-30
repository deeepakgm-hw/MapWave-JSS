import type { Config } from 'tailwindcss';

export default {
  content: [
    './index.html',
    './src/**/*.{js,ts,jsx,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        campus: {
          primary: '#1E3A8A',
          secondary: '#3B82F6',
          accent: '#10B981',
        },
      },
    },
  },
  plugins: [],
} satisfies Config;
